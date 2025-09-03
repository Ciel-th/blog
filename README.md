# 我的博客

一个简约风格的静态博客，专注于分享留学、AI、工作和海外生活的内容。

## 功能特色

- 📝 **博客文章**：分享技术思考和生活体验
- 📰 **潮流周刊**：每周更新有趣的内容和工具推荐
- 🌐 **多语言支持**：中文内容为主
- 📱 **响应式设计**：适配各种设备屏幕
- 🎨 **简约风格**：专注于内容本身

## 技术栈

- HTML5
- CSS3
- JavaScript
- GitHub Pages（部署）
- Markdown（内容写作）

## 项目结构

```
blog/
├── index.html          # 首页
├── blog.html           # 博客文章列表
├── weekly.html         # 周刊页面
├── about.html          # 关于页面
├── README.md           # 项目说明
└── posts/              # Markdown文章目录（待创建）
```

## 本地预览

由于是纯静态网站，可以直接用浏览器打开任意HTML文件预览，或者使用Python简易服务器：

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问 `http://localhost:8000`

## 写作流程

1. 在 `posts/` 目录下创建Markdown文件
2. 按照模板编写文章内容
3. 更新对应的HTML页面中的文章列表
4. 提交到GitHub仓库
5. 通过GitHub Pages自动部署

## 部署到GitHub Pages

1. 创建GitHub仓库
2. 将代码推送到仓库
3. 在仓库设置中启用GitHub Pages
4. 选择部署分支（通常是main或gh-pages）

## 社交链接

在 `about.html` 中更新你的社交媒体链接：
- GitHub
- Twitter  
- LinkedIn
- Email

## 内容分类

- 🎓 留学：申请经验、学习生活
- 🤖 AI：人工智能技术应用
- 💼 工作：职场经验、职业发展
- 🌍 海外生活：文化差异、生活体验
- 📚 语言学习：学习方法、工具推荐

## 更新计划

- [ ] 添加Markdown文章解析功能
- [ ] 实现文章分类筛选
- [ ] 添加搜索功能
- [ ] 支持暗色主题
- [ ] 添加评论系统
- [ ] 集成Google Analytics

## 许可证

MIT License - 欢迎fork和修改！