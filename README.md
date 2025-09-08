# 我的个人博客

一个简洁的静态博客网站，专注于内容分享。支持搜索、标签筛选和响应式设计。

## 特性

- 🎨 **简洁设计** - 参考 pingfan.me 的简洁风格，居中布局，两侧留白
- 📝 **Markdown 支持** - 使用 Markdown 格式编写文章，自动转换为HTML
- 📱 **响应式设计** - 支持移动端和桌面端，自适应布局
- 🔍 **搜索功能** - 支持文章标题和内容搜索
- 🏷️ **标签系统** - 完整的标签支持，文章内显示标签，支持标签筛选
- 🖼️ **图片优化** - 自动图片大小控制，支持居中显示和响应式适配
- 📊 **数学公式** - MathJax 支持，可渲染 LaTeX 数学公式
- 📈 **图表支持** - Mermaid 支持，可绘制流程图、时序图等
- ⚡ **静态网站** - 纯 HTML/CSS/JavaScript，加载快速
- 🚀 **自动构建** - 通过构建脚本自动生成HTML页面和数据文件
- 🔤 **优化字体** - 首页文章缩略块字体放大1.5倍，提升阅读体验
- 📄 **简洁样式** - 移除不必要的斜体样式，保持页面简洁

## 网站结构

```
blog/
├── index.html              # 首页（带搜索和标签筛选）
├── work-notes.html         # 工作杂记页面
├── repo.html               # 技术文章页面
├── japanese-learning.html  # 日语学习记录页面
├── about.html              # 关于我页面
├── post.html               # 文章详情页面模板（采用post结构）
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

**现在您只需要创建Markdown文件即可自动生成博客文章！**

### 🚀 新的简化流程：Markdown自动构建

#### 步骤1：创建Markdown文件

1. **确定文章分类**：
   - `WorkNotes` - 工作杂记
   - `repo` - 技术文章
   - `JpnLearning` - 日语学习记录

2. **创建Markdown文件**：
   在对应的 `posts/分类目录/` 下创建新的 `.md` 文件，例如：
   ```
   posts/WorkNotes/my-new-article.md
   ```

3. **Markdown文件格式**：
   ```markdown
   ---
   title: "文章标题"
   date: "2025-01-27"
   excerpt: "文章摘要，简要描述文章内容"
   tags: ["标签1", "标签2", "标签3"]
   cover: "images/WorkNotes/my-article/cover.jpg"
   ---

   # 文章标题

   这里是文章的正文内容，使用Markdown语法编写。

   ## 二级标题

   - 列表项1
   - 列表项2

   **粗体文本** 和 *斜体文本*

   ```javascript
   // 代码块
   function hello() {
       console.log("Hello, World!");
   }
   ```

   [链接文本](https://example.com)
   ```

### 标签系统使用说明

博客支持完整的标签系统，可以为文章添加多个标签：

1. **在Markdown文件中添加标签**：
   ```yaml
   ---
   title: "文章标题"
   date: "2025-01-27"
   tags: ["技术", "前端", "JavaScript"]
   ---
   ```

2. **标签显示**：
   - 标签会自动显示在文章页面的post-meta区域，位于日期下方
   - 每个标签都有独特的样式和悬停效果
   - 标签以 `#标签名` 的格式显示
   - 文章结构采用post格式，与refer.txt保持一致

### 图片使用和控制

博客提供了灵活的图片控制方案：

#### 1. 基本图片插入
```markdown
![图片描述](images/分类/文章目录/图片名.jpg)
```

#### 2. 图片大小控制

**方法一：使用HTML标签（推荐）**
```html
<div style="text-align: center; margin: 20px 0;">
<img src="images/WorkNotes/my-article/image.jpg" 
     alt="图片描述" 
     style="max-width: 100%; height: auto; width: 600px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</div>
```

**方法二：依赖CSS自动控制**
- 所有图片默认设置 `max-width: 100%`，不会超出文章区域
- 自动添加圆角和阴影效果
- 响应式适配，移动端自动缩放

#### 3. 图片超出文章区域的处理

当图片原始尺寸超过文章区域宽度（800px）时：

1. **自动缩放**：CSS会自动将图片缩放到容器宽度
2. **保持比例**：`height: auto` 确保图片比例不变形
3. **居中显示**：使用 `text-align: center` 实现图片居中
4. **移动端适配**：在小屏幕上进一步缩放以适应屏幕

#### 4. 推荐的图片尺寸

- **文章封面**：建议 1200x630px（适合社交媒体分享）
- **文章内图片**：建议宽度不超过 800px
- **小图标/示意图**：建议 400-600px 宽度

#### 5. 图片标题和注释功能

博客现在支持为图片添加标题和注释，有两种语法格式：

**方法一：使用星号标记（推荐）**
```markdown
![图片描述](images/分类/文章目录/图片名.jpg) *这是图片标题*
```

**效果**：
- 图片标题会显示在图片正下方
- 居中对齐
- 字体略小于正文，颜色为灰色
- 斜体样式

**示例**：
```markdown
![博客架构图](images/WorkNotes/blog-structure/architecture.jpg) *博客系统架构示意图*
```

#### 6. 表格标题功能

博客现在支持为表格添加标题，语法格式：

```markdown
**表格标题**
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

**效果**：
- 表格标题会显示在表格正上方
- 居中对齐
- 字体大小与正文相同，颜色为灰色
- 中等字重

**示例**：
```markdown
**技术栈对比表**
| 技术 | 优点 | 缺点 |
|------|------|------|
| React | 生态丰富 | 学习曲线陡峭 |
| Vue | 易学易用 | 生态相对较小 |
```

**注意事项**：
- 表格标题必须紧邻表格上方，中间不能有空行
- 表格标题使用双星号（**）包围
- 支持标准的Markdown表格语法

#### 步骤2：自动构建和部署

1. **提交到GitHub**：
   ```bash
   git add .
   git commit -m "添加新文章：文章标题"
   git push origin main
   ```

2. **自动构建**：
   - GitHub Actions会自动检测到新的.md文件
   - 运行构建脚本将Markdown转换为HTML
   - 自动更新文章数据和导航
   - 部署到GitHub Pages

3. **本地预览**（可选）：
   ```bash
   npm run build
   ```

#### ✨ 自动化特性

- **自动HTML生成**：Markdown文件会自动转换为完整的HTML页面
- **自动数据更新**：文章信息会自动添加到posts-data.js
- **自动导航同步**：所有页面的导航和链接自动更新
- **自动SEO优化**：根据front matter自动生成meta标签
- **自动标签管理**：标签系统自动更新

### 🔧 构建脚本说明

项目包含以下构建相关文件：

- **`build-posts.js`**：主要构建脚本，负责：
  - 扫描posts目录中的所有.md文件
  - 解析Markdown front matter和内容
  - 将Markdown转换为HTML
  - 生成完整的文章页面
  - 自动更新posts-data.js文件

- **`package.json`**：Node.js项目配置文件，包含：
  - 构建脚本命令
  - 项目元数据
  - 依赖管理

- **`.github/workflows/deploy.yml`**：GitHub Actions工作流，自动：
  - 在每次push时触发构建
  - 运行构建脚本处理Markdown文件
  - 部署到GitHub Pages

#### 本地构建命令

```bash
# 构建所有文章
npm run build

# 或直接运行构建脚本
node build-posts.js
```

### 📋 传统流程（仍然支持）

如果您更喜欢手动控制，仍然可以使用传统方式：

#### 手动更新数据文件 (data/posts-data.js)

在 `data/posts-data.js` 文件中，根据文章分类手动添加到对应的数组：

**工作杂记文章**：
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

**技术文章**：在 `repoData` 数组中添加类似结构
**日语学习文章**：在 `japaneseData` 数组中添加类似结构

#### 自动同步说明

无论使用哪种方式，系统都会自动：
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

## 更新日志

### 2025-01-26

**修复和优化：**
- ✅ **修复分类页面显示问题** - 解决了 japanese-learning.html、repo.html、work-notes.html 三个分类页面完全不显示内容的问题
  - 删除了不存在的 `auto-loader.js` 脚本引用
  - 修复了变量名冲突问题（将局部变量重命名避免与全局变量冲突）
  - 所有分类页面现在都能正常显示文章内容和缩略图
- 🎨 **优化首页缩略图样式** - 将文章缩略图从 54x36px 调整为 90x90px，使缩略图与文章内容块高度更加协调
- 📝 **更新文档** - 完善 README 文件，添加详细的修改记录

**技术改进：**
- 修复了 JavaScript 变量作用域冲突
- 优化了页面布局和视觉效果
- 确保所有页面功能正常工作

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