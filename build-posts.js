#!/usr/bin/env node

// Markdown文章构建脚本
// 自动解析posts目录中的md文件并生成对应的HTML文件和数据

const fs = require('fs');
const path = require('path');

// 简单的markdown解析器
class MarkdownParser {
    constructor() {
        this.frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    }

    // 解析front matter
    parseFrontMatter(content) {
        const match = content.match(this.frontMatterRegex);
        if (!match) {
            return { metadata: {}, content: content };
        }

        const frontMatter = match[1];
        const markdownContent = match[2];
        const metadata = {};

        // 解析YAML格式的front matter
        frontMatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // 移除引号
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                // 处理数组（tags）
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(item => item.trim().replace(/["']/g, ''));
                }
                
                metadata[key] = value;
            }
        });

        return { metadata, content: markdownContent };
    }

    // 简单的markdown到HTML转换
    markdownToHtml(markdown) {
        let html = markdown;
        
        // 标题
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 粗体和斜体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 代码块
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
        
        // 段落
        html = html.split('\n\n').map(paragraph => {
            if (paragraph.trim() && 
                !paragraph.startsWith('<h') && 
                !paragraph.startsWith('<pre') && 
                !paragraph.startsWith('<ul') && 
                !paragraph.startsWith('<ol')) {
                return `<p>${paragraph.trim()}</p>`;
            }
            return paragraph;
        }).join('\n\n');
        
        // 换行
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }
}

// HTML模板生成器
class HtmlGenerator {
    constructor() {
        this.template = this.getTemplate();
    }

    getTemplate() {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - 電波圏外</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="{{excerpt}}">
    <meta name="author" content="C_Ciel">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{excerpt}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://your-domain.com/{{url}}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{title}}">
    <meta name="twitter:description" content="{{excerpt}}">
    
    <!-- Performance Optimizations -->
    <link rel="dns-prefetch" href="//polyfill.io">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="preconnect" href="https://polyfill.io" crossorigin>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preload" href="{{fontPath}}" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="{{cssPath}}" as="style">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="{{cssPath}}">
    <link rel="stylesheet" href="{{fontCssPath}}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Vercel Analytics -->
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
</head>
<body>
    <div class="blog-layout">
        <!-- 导航栏 -->
        <nav class="blog-nav">
            <div class="nav-container">
                <a href="{{homeLink}}" class="nav-logo">電波圏外</a>
                <div class="nav-links">
                    <a href="{{homeLink}}">首页</a>
                    <a href="{{workNotesLink}}">工作杂记</a>
                    <a href="{{repoLink}}">技术文章</a>
                    <a href="{{japaneseLink}}">日语学习</a>
                    <a href="{{aboutLink}}">关于</a>
                </div>
            </div>
        </nav>

        <!-- 主要内容 -->
        <main class="blog-content">
            <article class="post-article">
                <header class="post-header">
                    <h1 class="post-title">{{title}}</h1>
                    <div class="post-meta">
                        <time class="post-date">{{date}}</time>
                        <div class="post-tags">
                            {{tags}}
                        </div>
                    </div>
                </header>
                
                <div class="post-content">
                    {{content}}
                </div>
            </article>
        </main>

        <!-- 页脚 -->
        <footer class="blog-footer">
            <p>&copy; 2025 C_Ciel. All rights reserved. | Powered by Jekyll & GitHub Pages</p>
        </footer>
    </div>

    <!-- 返回顶部按钮 -->
    <button id="back-to-top" class="back-to-top" onclick="scrollToTop()">
        ↑
    </button>

    <script>
        // 返回顶部功能
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // 显示/隐藏返回顶部按钮
        window.addEventListener('scroll', function() {
            const backToTop = document.getElementById('back-to-top');
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        });
    </script>
</body>
</html>`;
    }

    generateHtml(metadata, content, relativePath) {
        const depth = (relativePath.match(/\//g) || []).length;
        const prefix = '../'.repeat(depth);
        
        let html = this.template;
        
        // 替换模板变量
        html = html.replace(/{{title}}/g, metadata.title || 'Untitled');
        html = html.replace(/{{excerpt}}/g, metadata.excerpt || metadata.description || '');
        html = html.replace(/{{date}}/g, metadata.date || new Date().toISOString().split('T')[0]);
        html = html.replace(/{{content}}/g, content);
        html = html.replace(/{{url}}/g, relativePath);
        
        // 生成标签HTML
        const tags = metadata.tags || [];
        const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        html = html.replace(/{{tags}}/g, tagsHtml);
        
        // 设置路径
        html = html.replace(/{{fontPath}}/g, `${prefix}fonts/LXGWWenKai-Regular.ttf`);
        html = html.replace(/{{cssPath}}/g, `${prefix}styles/main.css`);
        html = html.replace(/{{fontCssPath}}/g, `${prefix}fonts/wenkai.css`);
        html = html.replace(/{{homeLink}}/g, `${prefix}index.html`);
        html = html.replace(/{{workNotesLink}}/g, `${prefix}work-notes.html`);
        html = html.replace(/{{repoLink}}/g, `${prefix}repo.html`);
        html = html.replace(/{{japaneseLink}}/g, `${prefix}japanese-learning.html`);
        html = html.replace(/{{aboutLink}}/g, `${prefix}about.html`);
        
        return html;
    }
}

// 主构建类
class PostBuilder {
    constructor() {
        this.parser = new MarkdownParser();
        this.htmlGenerator = new HtmlGenerator();
        this.postsData = {
            workNotesData: [],
            repoData: [],
            japaneseData: []
        };
    }

    // 扫描posts目录
    scanPostsDirectory() {
        const postsDir = path.join(__dirname, 'posts');
        const categories = fs.readdirSync(postsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        categories.forEach(category => {
            const categoryDir = path.join(postsDir, category);
            const files = fs.readdirSync(categoryDir)
                .filter(file => file.endsWith('.md'));

            files.forEach(file => {
                this.processMarkdownFile(category, file);
            });
        });
    }

    // 处理单个markdown文件
    processMarkdownFile(category, filename) {
        const filePath = path.join(__dirname, 'posts', category, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const { metadata, content: markdownContent } = this.parser.parseFrontMatter(content);
        const htmlContent = this.parser.markdownToHtml(markdownContent);
        
        // 生成HTML文件名
        const htmlFilename = filename.replace('.md', '.html');
        const htmlPath = path.join(__dirname, 'posts', category, htmlFilename);
        const relativePath = `posts/${category}/${htmlFilename}`;
        
        // 生成HTML文件
        const html = this.htmlGenerator.generateHtml(metadata, htmlContent, relativePath);
        fs.writeFileSync(htmlPath, html, 'utf-8');
        
        // 添加到文章数据
        const postData = {
            title: metadata.title || filename.replace('.md', ''),
            date: metadata.date || new Date().toISOString().split('T')[0],
            excerpt: metadata.excerpt || metadata.description || '',
            url: relativePath,
            tags: metadata.tags || [],
            cover: metadata.cover || ''
        };
        
        // 根据分类添加到对应数组
        if (category === 'WorkNotes') {
            this.postsData.workNotesData.push(postData);
        } else if (category === 'repo') {
            this.postsData.repoData.push(postData);
        } else if (category === 'JpnLearning') {
            this.postsData.japaneseData.push(postData);
        }
        
        console.log(`✓ 已处理: ${relativePath}`);
    }

    // 生成posts-data.js文件
    generatePostsData() {
        // 按日期排序
        Object.keys(this.postsData).forEach(key => {
            this.postsData[key].sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        const jsContent = `// 博客文章数据管理
// 这个文件由build-posts.js自动生成，请勿手动编辑

// 工作杂记数据
const workNotesData = ${JSON.stringify(this.postsData.workNotesData, null, 4)};

// 技术文章数据
const repoData = ${JSON.stringify(this.postsData.repoData, null, 4)};

// 日语学习数据
const japaneseData = ${JSON.stringify(this.postsData.japaneseData, null, 4)};

// 获取所有文章数据并按时间排序
function getAllPostsData() {
    const posts = [];
    
    // 合并所有数据
    posts.push(...workNotesData);
    posts.push(...repoData);
    posts.push(...japaneseData);
    
    // 按日期排序（最新的在前）
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 获取最新文章
function getLatestPosts(count = 10) {
    return getAllPostsData().slice(0, count);
}

// 根据分类获取文章
function getPostsByCategory(category) {
    switch(category) {
        case 'work-notes':
            return workNotesData;
        case 'repo':
            return repoData;
        case 'japanese':
            return japaneseData;
        default:
            return getAllPostsData();
    }
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        workNotesData,
        repoData,
        japaneseData,
        getAllPostsData,
        getLatestPosts,
        getPostsByCategory
    };
}`;

        const dataPath = path.join(__dirname, 'data', 'posts-data.js');
        fs.writeFileSync(dataPath, jsContent, 'utf-8');
        console.log('✓ 已生成: data/posts-data.js');
    }

    // 执行构建
    build() {
        console.log('开始构建博客文章...');
        this.scanPostsDirectory();
        this.generatePostsData();
        console.log('构建完成！');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const builder = new PostBuilder();
    builder.build();
}

module.exports = PostBuilder;