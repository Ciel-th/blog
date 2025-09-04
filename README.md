# 我的个人博客

一个简洁的静态博客网站，专注于内容分享。支持搜索、标签筛选和响应式设计。

## 特性

- 🎨 **简洁设计** - 参考 pingfan.me 的简洁风格
- 📝 **Markdown 支持** - 使用 Markdown 格式编写文章
- 📱 **响应式设计** - 支持移动端和桌面端
- 🔍 **搜索功能** - 支持文章标题和内容搜索
- 🏷️ **标签筛选** - 按标签分类浏览文章
- ⚡ **静态网站** - 纯 HTML/CSS/JavaScript，加载快速
- 🚀 **GitHub Pages** - 免费托管，自动部署

## 网站结构

```
blog/
├── index.html              # 首页（带搜索和标签筛选）
├── work-notes.html         # 工作杂记页面
├── repo.html               # 技术文章页面
├── japanese-learning.html  # 日语学习记录页面
├── about.html              # 关于我页面
├── post.html               # 文章详情页面模板
├── styles/
│   └── main.css            # 主样式文件
├── script.js               # JavaScript 功能
├── posts/                  # 文章目录
│   ├── WorkNotes/          # 工作杂记文章
│   ├── repo/               # 技术文章
│   └── JpnLearning/        # 日语学习文章
├── images/                 # 图片资源
│   ├── WorkNotes/          # 工作杂记缩略图
│   ├── repo/               # 技术文章缩略图
│   └── JpnLearning/        # 日语学习缩略图
└── README.md               # 项目说明
```

## 快速开始

### 1. 克隆或下载项目

```bash
git clone <your-repo-url>
cd blog
```

### 2. 本地预览

由于使用了 fetch API 加载 Markdown 文件，需要通过 HTTP 服务器访问：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`

### 3. 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问 `https://your-username.github.io/your-repo-name`

## 如何新建一篇博客

### 重要说明：自动化数据管理

现在博客使用了自动化的数据管理系统！您只需要在 `data/posts-data.js` 文件中添加新文章的数据，系统会自动：
- 在首页显示最新的10篇文章（按时间排序）
- 在对应的分类页面显示该分类的所有文章
- 更新搜索和标签筛选功能

**您不再需要手动维护多个页面的文章数据！**

### 步骤1：新增文章文件

1. **确定文章分类**：
   - `WorkNotes` - 工作杂记
   - `repo` - 技术文章
   - `JpnLearning` - 日语学习记录

2. **创建HTML文件**：
   在对应的 `posts/分类目录/` 下创建新的 `.html` 文件，例如：
   ```
   posts/WorkNotes/my-new-article.html
   ```

3. **文章HTML结构**：
   ```html
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>文章标题 - 我的博客</title>
       <link rel="stylesheet" href="../../styles/main.css">
   </head>
   <body>
       <!-- 导航栏 -->
       <nav class="nav">
           <div class="nav-container">
               <a href="../../index.html" class="nav-brand">我的博客</a>
               <ul class="nav-menu">
                   <li><a href="../../index.html">首页</a></li>
                   <li><a href="../../work-notes.html">工作杂记</a></li>
                   <li><a href="../../repo.html">技术文章</a></li>
                   <li><a href="../../japanese-learning.html">日语学习</a></li>
                   <li><a href="../../about.html">关于我</a></li>
               </ul>
           </div>
       </nav>

       <!-- 文章内容 -->
       <main class="container">
           <article class="post">
               <header class="post-header">
                   <h1 class="post-title">文章标题</h1>
                   <div class="post-meta">
                       <time>2025-01-26</time>
                       <span class="post-tags">
                           <span class="tag">标签1</span>
                           <span class="tag">标签2</span>
                       </span>
                   </div>
               </header>
               
               <div class="post-content">
                   <!-- 文章正文内容 -->
                   <p>文章内容...</p>
               </div>
           </article>
       </main>
   </body>
   </html>
   ```

### 步骤2：更新相关文件以实现导航互通

#### 2.1 更新共享数据文件 (data/posts-data.js)

**这是唯一需要更新的地方！** 在 `data/posts-data.js` 文件中，根据文章分类添加到对应的数组：

**工作杂记文章**：
在 `workNotesData` 数组中添加：
```javascript
const workNotesData = [
    {
        title: "新文章标题",
        date: "2025-01-26",
        excerpt: "文章摘要描述，简要介绍文章内容...",
        url: "posts/WorkNotes/my-new-article.html",
        tags: ["标签1", "标签2", "标签3"],
        cover: "images/WorkNotes/my-article/cover.jpg"
    },
    // 现有文章...
];
```

**技术文章**：
在 `repoData` 数组中添加类似结构

**日语学习文章**：
在 `japaneseData` 数组中添加类似结构

#### 2.2 自动同步说明

添加到 `data/posts-data.js` 后，系统会自动：
- 首页显示最新的10篇文章（跨所有分类，按时间排序）
- 对应分类页面显示该分类的所有文章
- 搜索和标签筛选功能自动包含新文章
- 无需手动修改任何其他文件

### 步骤3：设置文章缩略图

#### 3.1 准备缩略图

1. **图片规格**：建议尺寸 300x200 像素，格式为 JPG 或 PNG
2. **存放位置**：
   ```
   images/分类目录/文章目录/cover.jpg
   ```
   例如：`images/WorkNotes/my-article/cover.jpg`

#### 3.2 在文章数据中设置缩略图路径

```javascript
{
    title: "文章标题",
    // 其他字段...
    cover: "images/WorkNotes/my-article/cover.jpg" // 相对于网站根目录的路径
}
```

#### 3.3 无缩略图的处理

如果暂时没有缩略图，可以设置为空字符串：
```javascript
cover: "" // 系统会显示默认的占位符
```

### 步骤4：设置文章标签并与首页同步

#### 4.1 标签命名规范

- 使用中文标签，简洁明了
- 常用标签示例：
  - 工作相关：`远程工作`、`效率提升`、`团队管理`、`工作`
  - 技术相关：`Git`、`JavaScript`、`React`、`技术`、`前端`
  - 学习相关：`日语学习`、`语法`、`学习`、`敬语`

#### 4.2 在文章数据中设置标签

```javascript
{
    title: "文章标题",
    // 其他字段...
    tags: ["主要标签", "次要标签", "分类标签"] // 建议2-4个标签
}
```

#### 4.3 标签自动同步机制

首页的标签筛选功能会自动从所有文章的 `tags` 字段中提取唯一标签，无需手动维护标签列表。当添加新文章时：

1. 新标签会自动出现在首页的标签筛选区域
2. 点击标签可以筛选包含该标签的所有文章
3. 支持多标签组合筛选

## 完整示例：添加一篇工作杂记

### 1. 创建文章文件

创建 `posts/WorkNotes/time-management-tips.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时间管理技巧分享 - 我的博客</title>
    <link rel="stylesheet" href="../../styles/main.css">
</head>
<body>
    <nav class="nav">
        <div class="nav-container">
            <a href="../../index.html" class="nav-brand">我的博客</a>
            <ul class="nav-menu">
                <li><a href="../../index.html">首页</a></li>
                <li><a href="../../work-notes.html" class="active">工作杂记</a></li>
                <li><a href="../../repo.html">技术文章</a></li>
                <li><a href="../../japanese-learning.html">日语学习</a></li>
                <li><a href="../../about.html">关于我</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        <article class="post">
            <header class="post-header">
                <h1 class="post-title">时间管理技巧分享</h1>
                <div class="post-meta">
                    <time>2025-01-26</time>
                    <span class="post-tags">
                        <span class="tag">时间管理</span>
                        <span class="tag">效率提升</span>
                        <span class="tag">工作</span>
                    </span>
                </div>
            </header>
            
            <div class="post-content">
                <p>在快节奏的工作环境中，有效的时间管理是提升工作效率的关键...</p>
                <!-- 更多内容 -->
            </div>
        </article>
    </main>
</body>
</html>
```

### 2. 准备缩略图

将缩略图保存为 `images/WorkNotes/time-management/cover.jpg`

### 3. 更新 data/posts-data.js

在 `workNotesData` 数组开头添加：

```javascript
const workNotesData = [
    {
        title: "时间管理技巧分享",
        date: "2025-01-26",
        excerpt: "分享在工作中实践的时间管理技巧，包括番茄工作法、任务优先级排序等实用方法。",
        url: "posts/WorkNotes/time-management-tips.html",
        tags: ["时间管理", "效率提升", "工作"],
        cover: "images/WorkNotes/time-management/cover.jpg"
    },
    // 现有文章...
];
```

**就这样！** 系统会自动处理其余的一切。

完成以上步骤后，新文章就会：
- 出现在首页的文章列表中
- 出现在工作杂记页面中
- 支持通过标签筛选
- 支持搜索功能
- 具有完整的导航互通

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和布局（支持响应式设计）
- **JavaScript (ES6+)** - 交互功能、搜索、筛选
- **GitHub Pages** - 静态网站托管

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受写作的乐趣！** ✨