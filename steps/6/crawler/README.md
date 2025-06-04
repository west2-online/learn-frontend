## 福州大学通知文件系统爬虫

## 项目描述

本爬虫用于爬取福州大学信息学院官网的通知公告，支持将爬取结果按类别存储到独立文件夹，并提供数据持久化（JSON/SQLite）和查询功能。爬取内容包括通知标题、链接、发布日期、部门信息，可选爬取正文内容和访问次数。

## 环境准备

## 依赖环境

Node.js：推荐 v18.16.0 或更高版本
安装依赖
bash
npm install axios cheerio sequelize p-queue sqlit

## 运行步骤

1. 配置参数（可选）
   修改代码中的基础配置（位于 crawler.js 顶部）：
   javascript
   const BASE_URL = "https://info22.fzu.edu.cn"; // 目标网站根 URL
   const START_DATE = new Date("2025-01-01"); // 爬取起始日期（仅保留该日期之后的通知）
   const MAX_PAGES = 30(30 是符合所要求网址 2025 和 2024 年份的交界点后的一段，当前时间为 2025 年 6 月 6 日时间点，可自行增大 pages); // 最大爬取页数，防止无限循环
2. 启动爬虫
   bash
   node crawler.js
3. 查看结果
   日志文件：根目录下 crawl-result/crawler.log
   页面 HTML：存储于 crawl-result/page-html/ 目录（含列表页和详情页）
   JSON 数据：存储于 crawl-result/data-json/notices.json
   SQLite 数据库：存储于 crawl-result/database/notices.db

## 目录结构说明

plaintext
crawl-result/
├─ page-html/ # 爬取的所有页面 HTML（列表页和详情页）
│ ├─ page_1.html # 第 1 页列表页
│ ├─ page_2.html # 第 2 页列表页
│ └─ detail_xxx.html# 通知详情页（带时间戳文件名）
├─ data-json/ # 结构化数据 JSON
│ └─ notices.json # 最终爬取结果
├─ database/ # SQLite 数据库文件
│ └─ notices.db # 存储通知数据
└─ crawler.log # 爬取日志

## 数据字段说明

爬取的数据包含以下字段：

| 字段名     | 类型   | 描述         |
| ---------- | ------ | ------------ |
| title      | string | 通知标题     |
| link       | string | 通知完整 URL |
| date       | Date   | 发布日期     |
| department | string | 发布部门     |
| content    | string | 通知正文内容 |
