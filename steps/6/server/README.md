## 简易 HTTP 服务器

## 项目描述

这是一个基于 Node.js 和 Koa 框架构建的简易 HTTP 服务器，提供文件上传、下载、管理和用户认证功能。服务器使用 SQLite 数据库存储文件元数据和用户信息，并支持会话管理。

## 功能特性

文件上传与下载
文件列表查看
文件删除
用户登录/登出
会话管理
RESTful API 接口

## 环境准备

## 依赖环境

Node.js：推荐 v18.16.0 或更高版本
安装依赖
bash
npm install koa @koa/router koa-static koa-body koa-session2 sqlite3

## 运行步骤

1. 启动服务器
   Bash
   node server.js
2. 访问应用
   打开浏览器访问 http://localhost:3000

## 目录结构说明

project/
├─ uploads/ # 上传文件存储目录

├─ public/ # 静态文件目录

├─ files.db # SQLite 数据库文件

├─ server.js # 服务器主文件

└─ README.md # 项目说明文件

## API 文档

文件相关 API
GET /api/files - 获取文件列表

POST /api/upload - 上传文件（需要登录）

DELETE /api/delete/:filename - 删除文件（需要登录）


## 用户认证 API

POST /api/login - 用户登录

POST /api/logout - 用户登出

GET /api/login/status - 检查登录状态

## 默认用户

用户名: admin
密码: admin

## 配置选项

服务器配置位于 server.js 文件顶部，可修改以下参数：

UPLOADS_DIR: 上传文件存储目录（默认为 ./uploads）

PUBLIC_DIR: 静态文件目录（默认为 ./public）

sessionConfig: 会话配置选项

服务器端口（默认为 3000）

## 注意事项

首次运行时会自动创建数据库和表结构
默认会创建一个管理员用户（admin/admin）
上传文件大小限制为 200MB
会话有效期为 24 小时
