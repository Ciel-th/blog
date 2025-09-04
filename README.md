# 我的个人博客

一个简洁的静态博客网站，专注于内容分享。

## 特性

- 🎨 **简洁设计** - 参考 pingfan.me 的简洁风格
- 📝 **Markdown 支持** - 使用 Markdown 格式编写文章
- 📱 **响应式设计** - 支持移动端和桌面端
- ⚡ **静态网站** - 纯 HTML/CSS/JavaScript，加载快速
- 🚀 **GitHub Pages** - 免费托管，自动部署

## 网站结构

```
blog/
├── index.html              # 首页
├── work-notes.html         # 工作杂记页面
├── repo.html               # repo页面
├── japanese-learning.html  # 日语学习记录页面
├── about.html              # 关于我页面
├── post.html               # 文章详情页面模板
├── styles.css              # 样式文件
├── script.js               # JavaScript 功能
├── posts/                  # Markdown 文章目录
│   ├── first-post.md
│   └── learning-japanese.md
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

## 添加新文章

### 1. 创建 Markdown 文件

在 `posts/` 目录下创建新的 `.md` 文件：

```markdown
# 文章标题

文章内容...

---

*发布日期*
```

### 2. 更新文章列表

在 `script.js` 中的 `posts` 数组添加新文章信息：

```javascript
const posts = [
    {
        id: 'new-post',
        title: '新文章标题',
        date: '2024-01-20',
        category: 'work-notes', // 或其他分类
        excerpt: '文章摘要...',
        filename: 'new-post.md'
    },
    // 其他文章...
];
```

### 3. 文章分类

支持以下分类：
- `work-notes` - 工作杂记
- `repo` - 代码仓库
- `japanese-learning` - 日语学习记录
- `about` - 关于我

## 自定义配置

### 修改网站信息

1. **网站标题**：修改各 HTML 文件中的 `<title>` 标签
2. **导航品牌**：修改 `.nav-brand` 的内容
3. **页脚信息**：修改 `.footer` 中的版权信息

### 修改样式

主要样式定义在 `styles.css` 中：

- **颜色主题**：修改 CSS 变量或直接修改颜色值
- **字体**：修改 `font-family` 属性
- **布局**：调整 `.container` 的 `max-width` 等

### 添加新页面

1. 创建新的 HTML 文件
2. 在导航栏中添加链接
3. 在 `script.js` 的 `initPage()` 函数中添加对应的初始化逻辑

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和布局
- **JavaScript (ES6+)** - 交互功能
- **Marked.js** - Markdown 解析
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

## 联系方式

- 邮箱：[你的邮箱]
- GitHub：[你的GitHub]
- 博客：[你的博客地址]

---

**享受写作的乐趣！** ✨