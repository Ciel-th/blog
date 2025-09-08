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
    
    <!-- MathJax for LaTeX Support -->
    <script>
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    
    <!-- Mermaid for Diagrams -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'LXGW WenKai, -apple-system, BlinkMacSystemFont, sans-serif'
        });
    </script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="{{homeLink}}">電波圏外</a>
            </div>
            <nav class="nav">
                <a href="{{homeLink}}" class="nav-link">首页</a>
                <a href="{{workNotesLink}}" class="nav-link">工作杂记</a>
                <a href="{{repoLink}}" class="nav-link">repo</a>
                <a href="{{japaneseLink}}" class="nav-link">日语学习记录</a>
                <a href="{{aboutLink}}" class="nav-link">关于我</a>
            </nav>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <article class="weekly">
                <header class="weekly-header">
                    <h1 class="weekly-title">{{title}}</h1>
                    <div class="weekly-meta">
                        <time class="weekly-date" datetime="{{date}}">{{displayDate}}</time>
                        {{#tags}}
                        <span class="weekly-tag">{{.}}</span>
                        {{/tags}}
                    </div>
                    
                    <div class="weekly-excerpt">
                        {{excerpt}}
                    </div>
                </header>
                
                <div class="weekly-content">
                    {{content}}
                </div>
                
                <footer class="weekly-footer">
                    <div class="weekly-navigation">
                        <!-- 文章导航将在这里添加 -->
                    </div>
                    
                    <div class="weekly-archive">
                        <a href="{{homeLink}}" class="archive-link">📚 返回首页</a>
                    </div>
                </footer>
            </article>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 電波圏外. All rights reserved.</p>
            <p>Powered by <a href="https://github.com/" target="_blank">GitHub</a> & <a href="https://pages.github.com/" target="_blank">GitHub Pages</a></p>
        </div>
    </footer>
</body>
</html>`;
    }

    generateHtml(metadata, content, relativePath) {
        const depth = (relativePath.match(/\//g) || []).length;
        const prefix = '../'.repeat(depth);
        
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || 'Untitled'} - 電波圏外</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${metadata.excerpt || metadata.description || ''}">
    <meta name="author" content="C_Ciel">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${metadata.title || 'Untitled'}">
    <meta property="og:description" content="${metadata.excerpt || metadata.description || ''}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://ciel-th.github.io/blog/${relativePath}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metadata.title || 'Untitled'}">
    <meta name="twitter:description" content="${metadata.excerpt || metadata.description || ''}">
    
    <!-- Performance Optimizations -->
    <link rel="dns-prefetch" href="//polyfill.io">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="preconnect" href="https://polyfill.io" crossorigin>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preload" href="${prefix}fonts/LXGWWenKai-Regular.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="${prefix}styles/main.css" as="style">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="${prefix}styles/main.css">
    <link rel="stylesheet" href="${prefix}fonts/wenkai.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Vercel Analytics -->
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
    
    <!-- MathJax for LaTeX Support -->
    <script>
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    
    <!-- Mermaid for Diagrams -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'LXGW WenKai, -apple-system, BlinkMacSystemFont, sans-serif'
        });
    </script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="${prefix}index.html">電波圏外</a>
            </div>
            <nav class="nav">
                <a href="${prefix}index.html" class="nav-link">首页</a>
                <a href="${prefix}work-notes.html" class="nav-link">工作杂记</a>
                <a href="${prefix}repo.html" class="nav-link">repo</a>
                <a href="${prefix}japanese-learning.html" class="nav-link">日语学习记录</a>
                <a href="${prefix}about.html" class="nav-link">关于我</a>
            </nav>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <article class="weekly">
                <header class="weekly-header">
                    <h1 class="weekly-title">${metadata.title || 'Untitled'}</h1>
                    <div class="weekly-meta">
                        <time class="weekly-date" datetime="${metadata.date || new Date().toISOString().split('T')[0]}T00:00:00+08:00">${metadata.date || new Date().toISOString().split('T')[0]}</time>
                    </div>
                    
                    <div class="weekly-excerpt">
                        ${metadata.excerpt || metadata.description || ''}
                    </div>
                </header>
                
                ${metadata.cover ? `<div class="weekly-cover">
                    <img src="${prefix}${metadata.cover}" alt="${metadata.title || 'Untitled'} 封面" class="cover-image">
                </div>` : ''}
                
                <div class="weekly-content">
                    ${content}
                </div>
                
                <footer class="weekly-footer">
                    <div class="weekly-navigation">
                        <!-- 文章导航将在这里添加 -->
                    </div>
                    
                    <div class="weekly-archive">
                        <a href="${prefix}index.html" class="archive-link">📚 返回首页</a>
                    </div>
                </footer>
            </article>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 電波圏外. All rights reserved.</p>
            <p>Powered by <a href="https://github.com/" target="_blank">GitHub</a> & <a href="https://pages.github.com/" target="_blank">GitHub Pages</a></p>
        </div>
    </footer>
</body>
</html>`;
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