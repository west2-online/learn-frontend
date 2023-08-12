# Slidev-更适合程序员使用的PPT制作工具

本文转载自 https://juejin.cn/post/7265854374249775145 ，有删改



## 前言

技术分享通常会需要制作 PPT 来进行演示。然而作为一个习惯于编码还不习惯于汇报的普通程序员，PPT 这种东西，制作起来实在是有难度。无论是用 PowerPoint，WPS 还是 Keynote, 使用时总是无从下手，甚至有些许恐惧。于是，在 Github 上搜索了一番，最终找到了 Slidev 这个库，使用下来，效率极高，功能强大，令人惊喜。

下面我将介绍下这个也许是更适合程序员使用的 PPT 制作工具。

## 为什么更适合程序员使用

1. 使用扩展的 Markdown 语法编写内容。编写PPT就像做开发时，编写 Markdown 文档一样。
    - 默认使用 `./slides.md` 文件。你可以完全在这一个文件中编写完全部的演示内容。
    - 支持完整的 Markdown 语法。这表明，它完全支持代码块展示，程序员的PPT，难免要演示一些代码片段。
2. 使用 HTML, CSS 来定制每页 PPT 的展示样式。
    - 和进行前端开发体验一致。
3. 图表。Slidev 内置 Mermaid, 标记为 mermaid 的代码块会自动转换成图表。
    - 程序员做技术分享，难免需要插入一些类图，流程图，管道图等图表。
4. 动画。内置了很多动画指令和动画组件。
    - 可以快速的实现一些简单的过渡动画。
    - 内置了 `@vueuse/motion` 库。可以通过它来实现一些更复杂的动画。
    - 编写动画的过程和日常前端开发体验一致。
5. 支持导出为 PDF/PNG。
6. 支持静态部署。你可以把最终制作完成的 PPT 打包成一个单页应用，并将其部署到服务器上。
    - 可以让更多人通过 URL 看到你的 PPT, Cool。
7. 使用JS和Vue等前端技术栈构建，所以你可以发挥想象，让它与任何前端技术相融合。
8. 内置主题并且支持编写自定义主题。
    - 一个自定义主题就是一个 npm 包。可以把它发布到 npm 上进行存储分发。让更多的人使用到你编写的主题，结实更多的程序员朋友。

以上便是我认为的一些更适合程序员使用的原因。当然，除此以外，Slidev 还支持一些其它强大的功能，但由于在我使用过程中对我帮助不大，所以我没有作为理由提及，各位有兴趣，可以自行去 Slidev 的官网查看。

## Slidev 使用

下面我将简单地带大家上手使用一下 Slidev。

- Slidev 官网地址: https://cn.sli.dev/

### 安装

Slidev 使用 Vue 和 JS 等前端技术开发。所以需要安装 NodeJS ≥ 14，然后使用 npm 安装，在终端中输入：

```bash
bash
复制代码npm init slidev@latest
```

执行之后，命令行会给出一些提示，根据提示创建完整的 Slidev 项目。如何一切顺利，Slidev 会自动帮你打开浏览器，并且导航至 [http://127.0.0.1:3030/1](https://link.juejin.cn?target=http%3A%2F%2F127.0.0.1%3A3030%2F1) ，展示 Slidev 根据 slides.md 文件渲染出来的内容。如果由于某些原因，关闭了 Slidev 本地开发服务，则可以手动在生成的 Slidev 项目下执行`npm run dev` 重新打开 Slidev 本地开发服务

### 编写

Slidev 创建的项目，其实就是一个前端项目，所以推荐使用前端开发使用的编辑器来进行编写。这里我推荐使用 VSCode。

1. 用 VSCode 打开 Slidev 生成的项目。
2. 打开 slides.md 文件，开始编写 PPT 的内容。

#### 扉页配置

可以在 Slidev 的第一张 PPT 扉页出（文件顶部）进行配置。

```yaml
yaml复制代码---
theme: seriph
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: false
drawings:
  persist: false
transition: slide-left
title: 现代化前端开发 
---
```

这里我配置了主题，背景，语法高亮器，标题等内容。更多配置可参考 [slidev 扉页配置章节](https://link.juejin.cn?target=https%3A%2F%2Fcn.sli.dev%2Fcustom%2F%23frontmatter-configures)。

#### 正文编写

1. 可以使用完整的 Markdown 语法(# 表示 h1 标题，- 表示无序列表等)；通过一些内置的关键字(layout 来指定页面布局方式，image 指定右边背景图)，来设置每一页的样式

    ```markdown
    markdown复制代码  ---
      layout: image-right
      image: /unsplash_electron.avif
      ---
    
      # 包管理器
      - npm
      - yarn
      - pnpm
    
      ---
    ```

2. 通过 HTML ,  CSS 来自定义页面的结构和样式。

    ```markdown
    markdown复制代码# 三者功能对比
    <div class="mt-4">
    
    ![pnpm-vs-yarn-vs-npm](/pnpm_vs_yarn_vs_npm.png)
    
    </div>
    
    <style>
      img {
        height: 100%;
      }
    </style>
    ```

3. 通过 Markdown 代码块语法，来显示代码; `v-clicks`指令来实现点击显示动画

    ~~~markdown
    markdown复制代码  # npm - 常用命令
      <v-clicks>
    
      - 
        ```bash
        npm install # 根据package.json安装依赖
    
        npm install <--save-dev> <pkg-name> # 安装特定依赖
    
        npm uninstall <--save-dev> <pkg-name> # 卸载特定依赖
    
        npm run <cmd> # 执行package.json中配置的scripts
    
        npm config set registry <registry_addr> # 设置镜像仓库地址
        ```
      - 快速切换npm仓库地址
        ```bash
        npm i -g nrm
    
        nrm add safeheron https://safeheron.xxxx.com
    
        nrm use safeheron
        ```
    
      </v-clicks>  
    ~~~

更多内容，就不一一介绍了，再最后会给出我的 Slidev 项目地址，大家可以自行查看。

### 静态部署

1. 当编写完成后，为了让更多人在线看到我们的 PPT，我们可以选择将 PPT 构建为可部署的单页应用。
     这里我把我的 PPT，部署到 Cloudflare pages。Cloudflare pages 部署配置如图： ![cloudflare_page_config](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6c3805589844b12892c20838a708f69~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

2. 为了让观众可以下载我们的 PPT，以便离线观看。我们也可以在部署的单页应用中提供一个可下载的 PDF。

    1. 通过如下扉页配置来启用这个功能

        ```yaml
        yaml复制代码---
        download: true
        exportFilename: '现代化前端开发'
        ---
        ```

    2. 由于预生成 PDF 依赖于 Playwright, 所以我们需要安装 playwright-chromium。在终端输入:

        ```bash
        bash
        复制代码npm i -D playwright-chromium
        ```

    3. 重新部署

3. 现在就可以让观众通过 URL 在线观看我们的 PPT 并且下载 PDF 了

## 结语

Slidev 使用 Vue 和 JS 等前端技术栈构建，可以方便得与前端技术相结合；使用扩展的 Markdown 语法编写内容，让程序员获得日常开发的感觉和体验；部署成单页应用，可以通过 URL 让更多人看到；比起使用 PowerPoint 等工具编写 PPT, 也更加得 Geek。
