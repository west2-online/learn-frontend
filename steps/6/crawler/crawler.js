import axios from "axios";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import PQueue from "p-queue";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { Sequelize, DataTypes, Op } from "sequelize";

// 配置参数
const BASE_URL = "https://info22.fzu.edu.cn";
const TARGET_URL = `${BASE_URL}/lm_list.jsp?wbtreeid=1460`;
const ROOT_OUTPUT_DIR = join(
    dirname(fileURLToPath(
        import.meta.url)),
    "crawl-result"
); // 根输出目录

// 子目录配置
const PAGE_HTML_DIR = join(ROOT_OUTPUT_DIR, "page-html"); // 页面HTML存储目录
const DATA_JSON_DIR = join(ROOT_OUTPUT_DIR, "data-json"); // JSON数据存储目录
const DATABASE_DIR = join(ROOT_OUTPUT_DIR, "database"); // 数据库存储目录

const OUTPUT_FILE = join(DATA_JSON_DIR, "notices.json"); // 最终JSON文件
const LOG_FILE = join(ROOT_OUTPUT_DIR, "crawler.log"); // 日志文件
const DB_FILE = join(DATABASE_DIR, "notices.db"); // SQLite数据库文件

const MAX_CONCURRENCY = 3; // 控制并发请求数量
const RETRY_TIMES = 3; // 请求失败重试次数
const START_DATE = new Date("2025-01-01"); // 爬取今年1月1日以来的通知
const MAX_PAGES = 1; // 最大爬取页数，防止无限循环

// 确保多级目录存在
const createDir = (dirPath) => {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
};
createDir(ROOT_OUTPUT_DIR);
createDir(PAGE_HTML_DIR);
createDir(DATA_JSON_DIR);
createDir(DATABASE_DIR);

// 配置数据库连接
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: DB_FILE, // 使用独立数据库目录
    logging: false,
});

// 定义通知模型（移除 visitCount 字段）
const Notice = sequelize.define("Notice", {
    title: DataTypes.STRING,
    link: DataTypes.STRING,
    date: DataTypes.DATE,
    department: DataTypes.STRING,
    content: DataTypes.TEXT,
});

// 日志函数
async function log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    console.log(message);
    await writeFile(LOG_FILE, logEntry, { flag: "a" });
}

// 带重试的页面请求（移除Redis缓存部分）
async function fetchPage(url, retry = 0) {
    try {
        log(`请求: ${url}`);
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                Referer: BASE_URL,
            },
            timeout: 15000, // 15秒超时
        });

        const html = response.data;
        return html;
    } catch (error) {
        log(`请求失败 (${retry + 1}/${RETRY_TIMES}): ${url} - ${error.message}`);

        if (retry < RETRY_TIMES) {
            // 随机延迟后重试
            const delay = Math.random() * 2000 + 1000; // 1-3秒
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchPage(url, retry + 1);
        }

        throw error;
    }
}

// 解析日期函数
function parseDate(dateString) {
    // 尝试匹配 YYYY-MM-DD 格式
    let match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(`${match[1]}-${match[2]}-${match[3]}`);
    }

    // 尝试匹配 YYYY年MM月DD日 格式
    match = dateString.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (match) {
        return new Date(`${match[1]}-${match[2]}-${match[3]}`);
    }

    // 尝试其他可能的格式
    match = dateString.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (match) {
        return new Date(`${match[1]}-${match[2]}-${match[3]}`);
    }

    // 无法解析时返回 null
    return null;
}

// 构建正确的URL
function buildUrl(relativeUrl) {
    // 如果已经是完整URL则直接返回
    if (relativeUrl.startsWith("http")) {
        return relativeUrl;
    }

    // 移除开头的斜杠
    const cleanPath = relativeUrl.replace(/^\/+/, "");

    // 构建完整URL
    return `${BASE_URL}/${cleanPath}`;
}

// 生成安全的文件名
function generateSafeFilename(url) {
    // 移除协议部分
    let path = url.replace(/^https?:\/\//, "");

    // 替换所有非法文件名字符为下划线
    const invalidChars = /[<>:"/\\|?*]/g;
    path = path.replace(invalidChars, "_");

    // 限制文件名长度，避免过长
    const maxLength = 100;
    if (path.length > maxLength) {
        // 保留最后一部分和扩展名
        const parts = path.split("/");
        const lastPart = parts.pop();
        const truncated = path.substring(0, maxLength - lastPart.length - 1);
        path = truncated + "_" + lastPart;
    }

    // 确保有扩展名
    if (!path.endsWith(".html")) {
        path += ".html";
    }

    return path;
}

// 解析通知列表页并获取总页数
async function parseNoticeList(html, pageNum) {
    // 保存HTML到独立页面目录
    const pageHtmlPath = join(PAGE_HTML_DIR, `page_${pageNum}.html`);
    await writeFile(pageHtmlPath, html);

    const $ = cheerio.load(html);
    const notices = [];

    // 修改选择器以匹配实际页面结构
    $(".right .list ul li").each((index, element) => {
        try {
            const $item = $(element);
            // 提取部门信息
            const department = $item
                .find(".lm_a")
                .text()
                .trim()
                .replace(/\[|\]/g, "");

            // 提取标题和链接
            const $titleLink = $item.find("a:not(.lm_a)");
            const title = $titleLink.text().trim();

            // 获取并构建正确的链接
            const relativeLink = $titleLink.attr("href");
            const link = buildUrl(relativeLink);

            // 提取日期
            const dateText = $item.find(".fr").text().trim();

            // 解析日期
            const noticeDate = parseDate(dateText);
            if (!noticeDate) {
                log(`日期解析失败: ${dateText}`);
                return; // 跳过这条通知
            }

            // 只保留今年1月1日以后的通知
            if (noticeDate < START_DATE) {
                return; // 跳过旧通知
            }

            // 打印解析结果（调试用）
            log(`第${pageNum}页解析通知: ${title} - ${noticeDate.toISOString()}`);

            // 添加到结果列表（移除 dateString 和 visitCount）
            notices.push({
                title,
                link,
                date: noticeDate,
                department,
            });
        } catch (error) {
            log(`解析通知项失败: ${error.message}`);
        }
    });

    // 尝试获取总页数
    let totalPages = 0;
    try {
        // 假设页面上有类似"共X页"的文本
        const pageInfo = $(".page").text();
        const match = pageInfo.match(/共(\d+)页/);
        if (match) {
            totalPages = parseInt(match[1]);
            log(`获取到总页数: ${totalPages}`);
        }
    } catch (error) {
        log(`获取总页数失败: ${error.message}`);
    }

    return { notices, totalPages };
}

// 获取通知详情（移除访问次数相关代码）
async function fetchNoticeContent(notice) {
    try {
        // 验证URL
        if (!notice.link || !notice.link.startsWith("http")) {
            throw new Error(`无效详情URL: ${notice.link}`);
        }

        const html = await fetchPage(notice.link);
        const $ = cheerio.load(html);

        // 保存详情页到页面目录（带时间戳避免文件名冲突）
        const filename = generateSafeFilename(`${notice.link}-${Date.now()}`);
        const detailHtmlPath = join(PAGE_HTML_DIR, filename);
        await writeFile(detailHtmlPath, html);

        // 提取正文内容
        const content = $(".v_news_content").text().trim();

        log(`成功获取详情: ${notice.title}`);
        return {...notice, content }; // 移除 visitCount
    } catch (error) {
        log(`获取通知详情失败: ${notice.link} - ${error.message}`);
        return {...notice, content: "获取失败" }; // 移除 visitCount
    }
}

// 保存到 JSON 文件
async function saveToJson(data) {
    try {
        await writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf-8");
        log(`数据已保存到 ${OUTPUT_FILE}`);
    } catch (error) {
        log(`保存 JSON 文件失败: ${error.message}`);
    }
}

// 保存到数据库（模型已移除 visitCount）
async function saveToDatabase(data) {
    try {
        await sequelize.sync(); // 同步模型到数据库

        // 分批插入，避免数据量过大
        const batchSize = 50;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await Notice.bulkCreate(batch);
            log(`已保存 ${i + batch.length}/${data.length} 条记录`);
        }

        log(`成功将 ${data.length} 条记录保存到数据库`);
    } catch (error) {
        log(`保存到数据库失败: ${error.message}`);
    }
}

// 数据库查询接口（返回结果不含 visitCount）
async function getNoticesByDate(startDate, endDate) {
    try {
        return await Notice.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
            },
            order: [
                ["date", "DESC"]
            ],
        });
    } catch (error) {
        log(`查询数据库失败: ${error.message}`);
        throw error;
    }
}

async function getNoticesByDepartment(department) {
    try {
        return await Notice.findAll({
            where: { department },
            order: [
                ["date", "DESC"]
            ],
        });
    } catch (error) {
        log(`查询数据库失败: ${error.message}`);
        throw error;
    }
}

// 主函数
async function main() {
    log("开始爬取福州大学通知系统...");

    try {
        // 连接数据库
        await sequelize.authenticate();
        log(`已连接到 SQLite 数据库: ${DB_FILE}`);

        // 获取第一页
        const firstPageHtml = await fetchPage(TARGET_URL);
        const { notices: firstPageNotices, totalPages } = await parseNoticeList(
            firstPageHtml,
            1
        );
        let allNotices = [...firstPageNotices];

        // 计算需要爬取的总页数
        const pagesToCrawl = Math.min(totalPages || MAX_PAGES, MAX_PAGES);
        log(`计划爬取 ${pagesToCrawl} 页`);

        // 爬取剩余页面
        for (let pageNum = 2; pageNum <= pagesToCrawl; pageNum++) {
            const pageUrl = `${BASE_URL}/lm_list.jsp?totalpage=${totalPages}&PAGENUM=${pageNum}&wbtreeid=1460`;
            const pageHtml = await fetchPage(pageUrl);
            const { notices } = await parseNoticeList(pageHtml, pageNum);

            // 如果当前页没有符合条件的通知，或者出现旧通知，则停止爬取
            if (notices.length === 0 || notices.some((n) => n.date < START_DATE)) {
                log(`第${pageNum}页没有符合条件的通知，停止爬取`);
                break;
            }

            allNotices = [...allNotices, ...notices];
        }

        log(`共找到 ${allNotices.length} 条符合条件的通知`);

        if (allNotices.length === 0) {
            log("没有找到符合条件的通知，可能需要调整选择器或日期过滤条件");
            return;
        }

        // 使用队列控制并发请求，添加请求间隔避免被封
        const queue = new PQueue({
            concurrency: MAX_CONCURRENCY,
            interval: 1000, // 每1秒
            intervalCap: 1, // 处理1个请求
        });

        log("开始爬取通知详情...");
        const noticesWithContent = await Promise.all(
            allNotices.map((notice) => queue.add(() => fetchNoticeContent(notice)))
        );

        // 保存数据
        await saveToJson(noticesWithContent);
        await saveToDatabase(noticesWithContent);

        log("爬取完成! 结果存储于:");
        log(`- 页面HTML: ${PAGE_HTML_DIR}`);
        log(`- 数据JSON: ${DATA_JSON_DIR}`);
        log(`- 数据库: ${DATABASE_DIR}`);
    } catch (error) {
        log(`爬取过程中发生致命错误: ${error.message}`);
        console.error(error);
    } finally {
        // 关闭数据库连接
        await sequelize.close();
        log("已关闭数据库连接");
    }
}

// 运行主函数
main();

// 导出查询接口（如果作为模块使用）
export { getNoticesByDate, getNoticesByDepartment };