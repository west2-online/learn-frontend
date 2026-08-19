// ================================================================
//  数据 — 你可以根据自己的想法增删改文章
//  ================================================================
const articlesData = [
  {
    id: 1,
    title: "CSS 布局完全指南",
    excerpt:
      "深入理解 Flexbox 和 Grid 两种现代布局方式，配合实战案例，让你彻底掌握 CSS 布局。",
    date: "2026-01-10",
    category: "技术",
  },
  {
    id: 2,
    title: "如何高效阅读技术文档",
    excerpt:
      "技术文档是程序员最重要的学习资源之一，分享几个我常用的阅读技巧和工具。",
    date: "2025-12-20",
    category: "学习",
  },
  {
    id: 3,
    title: "设计模式在前端的应用",
    excerpt:
      "介绍几种在前端开发中常用的设计模式，包括观察者模式、单例模式、工厂模式等。",
    date: "2025-12-12",
    category: "技术",
  },
  // 添加更多文章...
];

// ================================================================
//  核心逻辑
//  ═══════════════════════════════════════════════════════════════════
//  你可以选择修改筛选、渲染逻辑，或完全重写
//  ================================================================

// --- 提取分类 ---
// TODO 1: 从 articlesData 中提取所有分类
const categories = [];

// --- 状态 ---
let articles = [...articlesData];
let currentCategory = "all";
let searchQuery = "";

// --- 本地收藏 ---
const FAVORITES_KEY = "blog_favorites";

// (选做) TODO 2: 实现获取收藏列表
function getFavorites() {
  // 从 localStorage 读取
}

// (选做) TODO 3: 实现保存收藏列表
function saveFavorites(favorites) {
  // 写入 localStorage
}

// (选做) TODO 4: 实现切换收藏状态
function toggleFavorite(articleId) {
  // 添加或移除收藏
}

// (选做) TODO 5: 实现检查是否已收藏
function isFavorited(articleId) {
  // 返回 true/false
}

// --- DOM 引用 ---
const grid = document.getElementById("articlesGrid");
const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("categoryFilters");
const tagCloud = document.getElementById("tagCloud");
const recentList = document.getElementById("recentList");
const favoriteList = document.getElementById("favoriteList");
const totalArticlesEl = document.getElementById("totalArticles");
const totalCategoriesEl = document.getElementById("totalCategories");

// ================================================================
//  TODO 6: 实现 getFilteredArticles 函数
//  根据 currentCategory 和 searchQuery 筛选文章
// ================================================================
function getFilteredArticles() {
  // 补全代码
}

// ================================================================
//  TODO 7: 实现 renderArticles 函数
//  渲染文章列表，每篇文章显示：
//  - 分类、日期
//  - 标题、摘要
//  - 收藏按钮 (☆/⭐)
// ================================================================
function renderArticles() {
  // 补全代码
}

// ================================================================
// (选做)  TODO 8: 实现 renderTags 函数
//  统计每个分类的文章数量，生成标签
// ================================================================
function renderTags() {
  // 补全代码
}

// ================================================================
//  TODO 9: 实现 renderRecent 函数
//  按日期排序，取前 5 篇
// ================================================================
function renderRecent() {
  // 补全代码
}

// ================================================================
// (选做)  TODO 10: 实现 renderFavorites 函数
//  渲染收藏列表
// ================================================================
function renderFavorites() {
  // 补全代码
}

// ================================================================
//  TODO 11: 实现 renderStats 函数
//  计算文章总数、分类数
// ================================================================
function renderStats() {
  // 补全代码
}

// ================================================================
//  TODO 12: 实现 updateFilterButtons 函数
//  高亮当前选中的分类按钮
// ================================================================
function updateFilterButtons() {
  // 补全代码
}

// ================================================================
//  TODO 13: 实现 renderAll 函数
//  调用所有渲染函数
// ================================================================
function renderAll() {
  // 补全代码
}

// ================================================================
// (选做) TODO 14: 实现 handleFavorite 函数
//  点击收藏按钮时切换收藏状态
// ================================================================
function handleFavorite(e) {
  // 补全代码
}

// ================================================================
//  (选做) TODO 15: 实现 handleSearch 函数
//  输入搜索时更新 searchQuery 并重新渲染
// ================================================================
function handleSearch(e) {
  // 补全代码
}

// ================================================================
//  TODO 16: 实现 handleFilter 函数
//  点击分类按钮时切换分类
// ================================================================
function handleFilter(e) {
  // 补全代码
}

// ================================================================
//  TODO 17: 实现 initTheme 函数
//  从 localStorage 读取主题偏好，切换暗色模式
// ================================================================
function initTheme() {
  // 补全代码
}

// ================================================================
//  TODO 18: 实现 initMobileMenu 函数
//  移动端菜单展开/收起
// ================================================================
function initMobileMenu() {
  // 补全代码
}

// ================================================================
//  TODO 19: 实现 init 函数
//  初始化所有功能
// ================================================================
function init() {
  // 1. 生成分类按钮
  // 2. 绑定分类点击事件
  // 3. 调用 renderAll()
  // 4. 绑定搜索事件
  // 5. 调用 initTheme()
  // 6. 调用 initMobileMenu()
  // 7. 控制台输出启动信息
}

document.addEventListener("DOMContentLoaded", init);
