const Koa = require("koa");
const Router = require("@koa/router");
const serve = require("koa-static");
const bodyParser = require("koa-body");
const session = require("koa-session2");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

// 初始化数据库
const db = new sqlite3.Database("files.db", (err) => {
    if (err) {
        console.error("数据库连接失败:", err.message);
    } else {
        console.log("数据库连接成功");
        // 创建文件表
        db.run(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                originalname TEXT NOT NULL,
                size INTEGER NOT NULL,
                mimetype TEXT NOT NULL,
                path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // 创建用户表
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // 插入默认用户 (用户名: admin, 密码: admin)
        db.get("SELECT id FROM users WHERE username = ?", ["admin"], (err, row) => {
            if (!row) {
                const passwordHash = crypto
                    .createHash("sha256")
                    .update("admin")
                    .digest("hex");
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
                    "admin",
                    passwordHash,
                ]);
            }
        });
    }
});

// 配置
const app = new Koa();
const router = new Router();
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PUBLIC_DIR = path.join(__dirname, "public");

// 确保上传目录存在
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch((err) => {
    console.error("创建上传目录失败:", err);
});

// 会话配置
const sessionConfig = {
    key: "koa:sess", // cookie 键名
    maxAge: 86400000, // 会话有效期 24 小时（毫秒）
    autoCommit: true,
    overwrite: true,
    httpOnly: true, // 防止 XSS 攻击
    signed: true, // 对 cookie 进行签名
    rolling: false, // 是否每次请求都重新设置 cookie 有效期
    renew: false, // 当剩余有效期小于 maxAge 的 1/4 时是否自动延长
};

// 为 Koa 应用配置密钥数组
app.keys = ["这是一个非常安全的密钥"]; //不推荐使用中文

// 使用会话中间件
app.use(session(sessionConfig));

// 修正 bodyParser 的使用方式
app.use(
    bodyParser.default({
        // 使用 .default() 调用
        multipart: true,
        formidable: {
            uploadDir: UPLOADS_DIR, // 临时上传目录
            keepExtensions: true, // 保留文件扩展名
            maxFileSize: 200 * 1024 * 1024, // 最大文件大小 200MB
        },
    })
);

// 静态文件服务
app.use(serve(PUBLIC_DIR));

// 鉴权中间件
const authMiddleware = async(ctx, next) => {
    if (!ctx.session.user) {
        ctx.status = 401;
        ctx.body = { error: "请先登录" };
        return;
    }
    await next();
};

// API路由定义
router.get("/api/files", async(ctx) => {
    try {
        const files = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM files ORDER BY created_at DESC", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        ctx.body = files.map((file) => ({
            id: file.id,
            name: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            url: `/uploads/${file.filename}`,
            mtime: file.created_at,
        }));
    } catch (error) {
        console.error("获取文件列表失败:", error);
        ctx.status = 500;
        ctx.body = { error: "获取文件列表失败" };
    }
});

// 上传文件
router.post("/api/upload", authMiddleware, async(ctx) => {
    try {
        const files = ctx.request.files;

        if (!files || !files.file) {
            ctx.status = 400;
            ctx.body = { error: "未上传文件" };
            return;
        }

        const file = files.file;
        const fileExt = path.extname(file.originalFilename);
        const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}`;
        const uniqueFilename = `${path.basename(
      file.originalFilename,
      fileExt
    )}-${uniqueSuffix}${fileExt}`;
        const newPath = path.join(UPLOADS_DIR, uniqueFilename);

        await fs.rename(file.filepath, newPath);

        await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO files (filename, originalname, size, mimetype, path) VALUES (?, ?, ?, ?, ?)", [
                    uniqueFilename,
                    file.originalFilename,
                    file.size,
                    file.mimetype,
                    newPath,
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        ctx.body = {
            success: true,
            filename: uniqueFilename,
            originalname: file.originalFilename,
            size: file.size,
            mimetype: file.mimetype,
            url: `/uploads/${uniqueFilename}`,
        };
    } catch (error) {
        console.error("上传文件失败:", error);
        ctx.status = 500;
        ctx.body = { error: "上传文件失败" };
    }
});

// 删除文件
router.delete("/api/delete/:filename", authMiddleware, async(ctx) => {
    try {
        const filename = ctx.params.filename;
        const file = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM files WHERE filename = ?", [filename],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!file) {
            ctx.status = 404;
            ctx.body = { error: "文件不存在" };
            return;
        }

        await fs.unlink(file.path);
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM files WHERE filename = ?", [filename], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        ctx.body = { success: true };
    } catch (error) {
        console.error("删除文件失败:", error);
        ctx.status = 500;
        ctx.body = { error: "删除文件失败" };
    }
});

// 登录接口
router.post("/api/login", async(ctx) => {
    try {
        const { username, password } = ctx.request.body;

        if (!username || !password) {
            ctx.status = 400;
            ctx.body = { error: "用户名和密码不能为空" };
            return;
        }

        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ?", [username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            ctx.status = 401;
            ctx.body = { error: "用户名或密码错误" };
            return;
        }

        const passwordHash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
        if (passwordHash !== user.password) {
            ctx.status = 401;
            ctx.body = { error: "用户名或密码错误" };
            return;
        }

        ctx.session.user = { id: user.id, username: user.username };
        ctx.body = { success: true, user: { username: user.username } };
    } catch (error) {
        console.error("登录失败:", error);
        ctx.status = 500;
        ctx.body = { error: "登录失败" };
    }
});

// 登出接口
router.post("/api/logout", async(ctx) => {
    ctx.session = null;
    ctx.body = { success: true };
});

// 检查登录状态
router.get("/api/login/status", async(ctx) => {
    ctx.body = { user: ctx.session.user || null };
});

// 应用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`上传目录：${UPLOADS_DIR}`);
});