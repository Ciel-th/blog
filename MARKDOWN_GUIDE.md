# Markdown博客创建指南

## 🚀 快速开始

### 1. 创建新文章

在对应分类目录下创建 `.md` 文件：

```
posts/
├── WorkNotes/     # 工作杂记
├── repo/          # 技术文章  
└── JpnLearning/   # 日语学习
```

### 2. 文章格式模板

```markdown
---
title: "你的文章标题"
date: "2025-01-27"
excerpt: "文章摘要，会显示在首页列表中"
tags: ["标签1", "标签2", "标签3"]
cover: "images/分类/文章目录/cover.jpg"  # 可选
---

# 文章标题

这里开始写你的文章内容...

## 二级标题

### 三级标题

**粗体** 和 *斜体*

- 无序列表
- 项目2

1. 有序列表
2. 项目2

```javascript
// 代码块
function example() {
    console.log("Hello World!");
}
```

[链接文本](https://example.com)

> 引用文本

---

水平分割线
```

### 3. Front Matter 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期 (YYYY-MM-DD) |
| `excerpt` | ✅ | 文章摘要，显示在列表页 |
| `tags` | ✅ | 标签数组，用于分类和搜索 |
| `cover` | ❌ | 封面图片路径（相对于网站根目录） |

### 4. 发布流程

1. **创建文章**：在对应目录创建 `.md` 文件
2. **提交代码**：
   ```bash
   git add .
   git commit -m "添加新文章：文章标题"
   git push origin main
   ```
3. **自动构建**：GitHub Actions 自动处理
4. **查看结果**：几分钟后在网站上查看

## 📁 目录结构

```
blog/
├── posts/
│   ├── WorkNotes/
│   │   ├── example-post.md      # Markdown源文件
│   │   └── example-post.html    # 自动生成的HTML
│   ├── repo/
│   └── JpnLearning/
├── images/                      # 图片资源
├── data/
│   └── posts-data.js           # 自动生成的文章数据
├── build-posts.js              # 构建脚本
├── package.json                # 项目配置
└── .github/workflows/
    └── deploy.yml              # 自动部署配置
```

## 🎯 最佳实践

### 文件命名
- 使用英文和连字符：`my-awesome-post.md`
- 避免空格和特殊字符
- 保持简洁有意义

### 图片管理
- 为每篇文章创建专门的图片目录
- 路径示例：`images/WorkNotes/my-post/cover.jpg`
- 推荐尺寸：封面图 300x200px

### 标签使用
- 保持标签简洁（2-4个字）
- 使用一致的标签体系
- 避免过于具体的标签

### 内容编写
- 使用清晰的标题层次
- 适当使用代码块和引用
- 保持段落简洁易读

## 🔧 本地开发

如果需要本地预览：

```bash
# 安装 Node.js 后运行
npm run build

# 然后在浏览器中打开 index.html
```

## ❓ 常见问题

**Q: 文章没有显示在首页？**
A: 检查 front matter 格式是否正确，特别是日期格式

**Q: 图片不显示？**
A: 确认图片路径正确，相对于网站根目录

**Q: 构建失败？**
A: 检查 GitHub Actions 日志，通常是 Markdown 格式问题

**Q: 想要修改样式？**
A: 编辑 `styles/main.css` 文件

---

*Happy blogging! 🎉*