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
        
        // 先处理代码块，保护其内容不被后续处理影响
        const codeBlocks = [];
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            const langClass = lang ? ` class="language-${lang}"` : '';
            const langLabel = lang ? `<div class="code-lang">${lang}</div>` : '';
            // 对代码内容进行HTML转义
            const escapedCode = code.trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            codeBlocks.push(`<div class="code-block-container">${langLabel}<pre><code${langClass}>${escapedCode}</code></pre></div>`);
            return placeholder;
        });
        
        // 处理带标题的图片 - 语法: ![alt](src "title")
        // 或者 ![alt](src) 后面跟 *图片标题*
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)\s*\*([^\*]+)\*/g, (match, alt, src, caption) => {
            // 修复图片路径 - 添加相对路径前缀
            if (!src.startsWith('http') && !src.startsWith('/')) {
                src = '../../../' + src;
            }
            return `<figure class="image-figure">
                <img src="${src}" alt="${alt}" />
                <figcaption class="image-caption">${caption}</figcaption>
            </figure>`;
        });
        
        // 处理普通图片
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, (match, alt, src) => {
            // 修复图片路径 - 添加相对路径前缀
            if (!src.startsWith('http') && !src.startsWith('/')) {
                src = '../../../' + src;
            }
            return `<img src="${src}" alt="${alt}" />`;
        });
        
        // 处理表格（简单的表格支持）
        html = this.processMarkdownTables(html);
        
        // 标题（从六级到一级，避免匹配冲突）
        html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 删除线（需要在粗体和斜体之前处理）
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // 粗体（支持**和__两种语法）
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 斜体（支持*和_两种语法，但要避免与粗体冲突）
        html = html.replace(/(?<!\*)\*([^\*]+?)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');
        
        // 高亮文本
        html = html.replace(/==(.*?)==/g, '<mark>$1</mark>');
        
        // 上标和下标
        html = html.replace(/\^(.*?)\^/g, '<sup>$1</sup>');
        html = html.replace(/~(.*?)~/g, '<sub>$1</sub>');
        
        // 行内代码
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 键盘按键
        html = html.replace(/\[\[([^\]]+)\]\]/g, '<kbd>$1</kbd>');
        
        // 脚注定义（在文档末尾，需要在脚注引用之前处理）
        html = html.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, '<div class="footnote" id="fn-$1"><sup>$1</sup> $2 <a href="#fnref-$1">↩</a></div>');
        
        // 脚注引用
        html = html.replace(/\[\^([^\]]+)\]/g, '<sup><a href="#fn-$1" id="fnref-$1">$1</a></sup>');
        
        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
        
        // 任务列表（在普通列表之前处理）
        html = html.replace(/^\s*[-\*\+]\s+\[([x\s])\]\s+(.+)$/gm, function(match, checked, content) {
            const isChecked = checked.toLowerCase() === 'x';
            const checkedAttr = isChecked ? ' checked' : '';
            const preservedContent = content.replace(/  +/g, function(spaces) {
                return '&nbsp;'.repeat(spaces.length);
            });
            return `<task-li class="task-list-item"><input type="checkbox" disabled${checkedAttr}> ${preservedContent}</task-li>`;
        });
        
        // 将任务列表项包装在ul中
        html = html.replace(/(<task-li[\s\S]*?<\/task-li>)/g, function(match) {
            const items = match.replace(/<task-li/g, '<li').replace(/<\/task-li>/g, '</li>');
            return '<ul class="task-list">' + items + '</ul>';
        });
        
        // 处理列表（先标记类型，避免冲突）
        // 无序列表 - 保留空格对齐
        html = html.replace(/^\s*[-\*\+]\s+(.+)$/gm, function(match, content) {
            // 将多个连续空格转换为&nbsp;以保持对齐
            const preservedContent = content.replace(/  +/g, function(spaces) {
                return '&nbsp;'.repeat(spaces.length);
            });
            return '<ul-li>' + preservedContent + '</ul-li>';
        });
        
        // 有序列表 - 保留空格对齐
        html = html.replace(/^\s*\d+\.\s+(.+)$/gm, function(match, content) {
            // 将多个连续空格转换为&nbsp;以保持对齐
            const preservedContent = content.replace(/  +/g, function(spaces) {
                return '&nbsp;'.repeat(spaces.length);
            });
            return '<ol-li>' + preservedContent + '</ol-li>';
        });
        
        // 转换为最终HTML
        html = html.replace(/(<ul-li>.*<\/ul-li>)/s, function(match) {
            const items = match.replace(/<ul-li>/g, '<li>').replace(/<\/ul-li>/g, '</li>');
            return '<ul>' + items + '</ul>';
        });
        
        html = html.replace(/(<ol-li>.*<\/ol-li>)/s, function(match) {
            const items = match.replace(/<ol-li>/g, '<li>').replace(/<\/ol-li>/g, '</li>');
            return '<ol>' + items + '</ol>';
        });
        
        // 引用
        html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
        
        // 水平分割线
        html = html.replace(/^---$/gm, '<hr>');
        
        // 段落
        html = html.split('\n\n').map(paragraph => {
            if (paragraph.trim() && 
                !paragraph.startsWith('<h') && 
                !paragraph.startsWith('<pre') && 
                !paragraph.startsWith('<ul') && 
                !paragraph.startsWith('<ol') &&
                !paragraph.startsWith('<figure') &&
                !paragraph.startsWith('<table') &&
                !paragraph.startsWith('<blockquote') &&
                !paragraph.startsWith('<hr') &&
                !paragraph.includes('__CODE_BLOCK_')) {
                return `<p>${paragraph.trim()}</p>`;
            }
            return paragraph;
        }).join('\n\n');
        
        // 换行（但不影响代码块占位符）
        html = html.replace(/\n/g, '<br>');
        
        // 恢复代码块
        codeBlocks.forEach((block, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, block);
        });
        
        return html;
    }
    
    // 处理Markdown表格
    processMarkdownTables(html) {
        // 匹配表格模式：表格标题（可选） + 表格内容
        const tablePattern = /(?:^\*\*([^\*]+)\*\*\s*\n)?((?:^\|.+\|\s*\n)+(?:^\|[-\s\|:]+\|\s*\n)(?:^\|.+\|\s*\n)*)/gm;
        
        return html.replace(tablePattern, (match, tableTitle, tableContent) => {
            // 解析表格内容
            const lines = tableContent.trim().split('\n');
            const headerLine = lines[0];
            const separatorLine = lines[1];
            const dataLines = lines.slice(2);
            
            // 解析表头
            const headers = headerLine.split('|').slice(1, -1).map(h => h.trim());
            
            // 解析数据行
            const rows = dataLines.map(line => {
                return line.split('|').slice(1, -1).map(cell => cell.trim());
            });
            
            // 生成HTML表格
            let tableHtml = '<table class="markdown-table">\n';
            
            // 表头
            tableHtml += '  <thead>\n    <tr>\n';
            headers.forEach(header => {
                tableHtml += `      <th>${header}</th>\n`;
            });
            tableHtml += '    </tr>\n  </thead>\n';
            
            // 表体
            tableHtml += '  <tbody>\n';
            rows.forEach(row => {
                tableHtml += '    <tr>\n';
                row.forEach(cell => {
                    tableHtml += `      <td>${cell}</td>\n`;
                });
                tableHtml += '    </tr>\n';
            });
            tableHtml += '  </tbody>\n</table>';
            
            // 如果有表格标题，包装在figure中
            if (tableTitle) {
                return `<figure class="table-figure">\n  <figcaption class="table-caption">${tableTitle}</figcaption>\n  ${tableHtml}\n</figure>`;
            }
            
            return tableHtml;
        });
    }
}

// HTML模板生成器
class HtmlGenerator {
    constructor() {
        this.template = this.getTemplate();
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
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
    
    <!-- 目录功能脚本 -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const toc = document.querySelector('.table-of-contents');
            const tocNav = document.querySelector('.toc-nav');
            const tocToggle = document.querySelector('.toc-toggle');
            const tocLinks = document.querySelectorAll('.toc-link');
            const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
            
            if (!toc || !tocNav || !tocToggle || tocLinks.length === 0) {
                return;
            }
            
            let isCollapsed = false;
            
            // 折叠/展开功能
            tocToggle.addEventListener('click', function() {
                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    tocNav.style.display = 'none';
                    tocToggle.textContent = '+';
                    tocToggle.setAttribute('aria-label', '展开目录');
                } else {
                    tocNav.style.display = 'block';
                    tocToggle.textContent = '−';
                    tocToggle.setAttribute('aria-label', '折叠目录');
                }
            });
            
            // 平滑滚动
            tocLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerHeight = document.querySelector('.header').offsetHeight || 60;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // 当前位置高亮
            function updateActiveLink() {
                const scrollPosition = window.scrollY + window.innerHeight * 0.3;
                let activeHeading = null;
                
                headings.forEach(heading => {
                    if (heading.offsetTop <= scrollPosition) {
                        activeHeading = heading;
                    }
                });
                
                // 移除所有活动状态
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // 添加当前活动状态
                if (activeHeading) {
                    const activeLink = document.querySelector('a[href="#' + activeHeading.id + '"]');
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            }
            
            // 监听滚动事件
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateActiveLink, 10);
            });
            
            // 初始化当前位置
            updateActiveLink();
            
            // 键盘导航支持
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'k') {
                    e.preventDefault();
                    const firstLink = tocLinks[0];
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            });
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
                
                <footer class="post-footer">
                    <div class="weekly-navigation">
                        <!-- 文章导航将在这里添加 -->
                    </div>
                </footer>
            </article>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 C_Ciel. All rights reserved.</p>
            <p>Powered by <a href="https://github.com/" target="_blank">GitHub</a> & <a href="https://pages.github.com/" target="_blank">GitHub Pages</a></p>
        </div>
    </footer>
</body>
</html>`;
    }

    generateTableOfContents(content) {
        // 提取所有标题
        const headingRegex = /<h([1-6])([^>]*)>([^<]+)<\/h[1-6]>/g;
        const headings = [];
        let match;
        let headingCounter = 0;
        
        // 为每个标题生成唯一ID并收集信息
        const contentWithIds = content.replace(headingRegex, (fullMatch, level, attributes, text) => {
            headingCounter++;
            const id = `heading-${headingCounter}`;
            const cleanText = text.trim();
            
            headings.push({
                level: parseInt(level),
                text: cleanText,
                id: id
            });
            
            // 如果已有id属性，保留；否则添加新的id
            if (attributes.includes('id=')) {
                return fullMatch;
            } else {
                return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
            }
        });
        
        if (headings.length === 0) {
            return { content: contentWithIds, tocHtml: '' };
        }
        
        // 生成目录HTML
        let tocHtml = '<div class="table-of-contents">\n';
        tocHtml += '  <div class="toc-header">\n';
        tocHtml += '    <h3 class="toc-title">目录</h3>\n';
        tocHtml += '    <button class="toc-toggle" aria-label="折叠目录">−</button>\n';
        tocHtml += '  </div>\n';
        tocHtml += '  <nav class="toc-nav">\n';
        tocHtml += '    <ul class="toc-list">\n';
        
        headings.forEach(heading => {
            tocHtml += `      <li class="toc-item toc-h${heading.level}">\n`;
            tocHtml += `        <a href="#${heading.id}" class="toc-link">${heading.text}</a>\n`;
            tocHtml += '      </li>\n';
        });
        
        tocHtml += '    </ul>\n';
        tocHtml += '  </nav>\n';
        tocHtml += '</div>\n';
        
        return { content: contentWithIds, tocHtml: tocHtml };
    }

    generateHtml(metadata, content, relativePath) {
        const depth = (relativePath.match(/\//g) || []).length;
        const prefix = '../'.repeat(depth);
        
        // 修复内容中的图片路径
        content = content.replace(/<img([^>]+)src="([^"]+)"/g, (match, attrs, src) => {
            if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')) {
                src = prefix + src;
            }
            return `<img${attrs}src="${src}"`;
        });
        
        content = content.replace(/<figure[^>]*>\s*<img([^>]+)src="([^"]+)"/g, (match, attrs, src) => {
            if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')) {
                src = prefix + src;
            }
            return match.replace(src, src);
        });
        
        // 生成目录
        const { content: contentWithToc, tocHtml } = this.generateTableOfContents(content);
        
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
    <style>
        /* 目录样式 */
        .article-container {
            display: flex;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
        }
        
        .article-wrapper {
            flex: 1;
            max-width: 800px;
            margin-right: 20px;
        }
        
        .table-of-contents {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 280px;
            max-height: 70vh;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(10px);
        }
        
        .toc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .toc-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }
        
        .toc-toggle {
            background: none;
            border: none;
            font-size: 18px;
            color: #666;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .toc-toggle:hover {
            background-color: #f5f5f5;
            color: #333;
        }
        
        .toc-nav {
            padding: 12px 0;
            max-height: calc(70vh - 60px);
            overflow-y: auto;
        }
        
        .toc-nav::-webkit-scrollbar {
            width: 4px;
        }
        
        .toc-nav::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .toc-nav::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 2px;
        }
        
        .toc-nav::-webkit-scrollbar-thumb:hover {
            background: #bbb;
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .toc-item {
            margin: 0;
        }
        
        .toc-link {
            display: block;
            padding: 6px 20px;
            color: #666;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.4;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }
        
        .toc-link:hover {
            color: #333;
            background-color: #f8f9fa;
        }
        
        .toc-link.active {
            color: #0066cc;
            background-color: #f0f7ff;
            border-left-color: #0066cc;
            font-weight: 500;
        }
        
        /* 不同级别标题的缩进 */
        .toc-h1 .toc-link { padding-left: 20px; font-weight: 500; }
        .toc-h2 .toc-link { padding-left: 32px; }
        .toc-h3 .toc-link { padding-left: 44px; }
        .toc-h4 .toc-link { padding-left: 56px; }
        .toc-h5 .toc-link { padding-left: 68px; }
        .toc-h6 .toc-link { padding-left: 80px; }
        
        /* 响应式设计 */
        @media (max-width: 1400px) {
            .table-of-contents {
                display: none;
            }
            
            .article-wrapper {
                margin-right: 0;
            }
        }
        
        @media (max-width: 768px) {
            .article-container {
                max-width: 100%;
            }
        }
        
        /* 新增Markdown语法样式 */
        /* 删除线 */
        del {
            text-decoration: line-through;
            color: #888;
            opacity: 0.8;
        }
        
        /* 高亮文本 */
        mark {
            background-color: #fff3cd;
            color: #856404;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        /* 上标和下标 */
        sup {
            vertical-align: super;
            font-size: 0.75em;
            line-height: 0;
        }
        
        sub {
            vertical-align: sub;
            font-size: 0.75em;
            line-height: 0;
        }
        
        /* 键盘按键 */
        kbd {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 3px;
            box-shadow: 0 1px 0 rgba(0,0,0,0.2), inset 0 0 0 2px #fff;
            color: #495057;
            display: inline-block;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.875em;
            font-weight: 700;
            line-height: 1;
            padding: 2px 4px;
            white-space: nowrap;
        }
        
        /* 任务列表 */
        .task-list {
            list-style: none;
            padding-left: 0;
        }
        
        .task-list-item {
            list-style: none;
            position: relative;
            margin: 4px 0;
        }
        
        .task-list-item input[type="checkbox"] {
            margin-right: 8px;
            cursor: default;
        }
        
        /* 脚注 */
        .footnote {
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 8px;
            margin-top: 16px;
        }
        
        .footnote sup {
            color: #0066cc;
            font-weight: bold;
        }
        
        .footnote a {
            color: #0066cc;
            text-decoration: none;
        }
        
        .footnote a:hover {
            text-decoration: underline;
        }
    </style>
    
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
        <div class="article-container">
            <div class="article-wrapper">
                <div class="container">
                    <article class="post">
                        <header class="post-header">
                            <h1 class="post-title">${metadata.title || 'Untitled'}</h1>
                            <div class="post-meta">
                                <time class="post-date" datetime="${metadata.date || new Date().toISOString().split('T')[0]}T00:00:00+08:00">${this.formatDate(metadata.date || new Date().toISOString().split('T')[0])}</time>
                                ${metadata.tags && metadata.tags.length > 0 ? `
                                <span class="post-tags">
                                    ${metadata.tags.map(tag => `<span class="tag">#${tag}</span>`).join('\n                                    ')}
                                </span>` : ''}
                                
                            </div>
                            
                            <div class="post-excerpt">
                                ${metadata.excerpt || metadata.description || ''}
                            </div>
                            
                        </header>
                        
                        <div class="post-content">
                            ${contentWithToc}
                        </div>
                
                        <footer class="post-footer">
                            <div class="post-navigation">
                                <!-- 文章导航将在这里添加 -->
                            </div>
                        </footer>
                    </article>
                </div>
            </div>
            
            <!-- 目录 -->
            ${tocHtml}
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
            this.scanCategoryDirectory(category, categoryDir);
        });
    }

    // 递归扫描分类目录中的所有Markdown文件
    scanCategoryDirectory(category, dirPath, relativePath = '') {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item.name);
            const currentRelativePath = relativePath ? path.join(relativePath, item.name) : item.name;
            
            if (item.isDirectory()) {
                // 递归扫描子目录
                this.scanCategoryDirectory(category, itemPath, currentRelativePath);
            } else if (item.name.endsWith('.md')) {
                // 处理Markdown文件
                this.processMarkdownFile(category, currentRelativePath);
            }
        });
    }

    // 处理单个markdown文件
    processMarkdownFile(category, filename) {
        const filePath = path.join(__dirname, 'posts', category, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const { metadata, content: markdownContent } = this.parser.parseFrontMatter(content);
        const htmlContent = this.parser.markdownToHtml(markdownContent);
        
        // 生成HTML文件名（保持目录结构）
        const htmlFilename = filename.replace('.md', '.html');
        const htmlPath = path.join(__dirname, 'posts', category, htmlFilename);
        const relativePath = `posts/${category}/${htmlFilename.replace(/\\/g, '/')}`;
        
        // 确保目录存在
        const htmlDir = path.dirname(htmlPath);
        if (!fs.existsSync(htmlDir)) {
            fs.mkdirSync(htmlDir, { recursive: true });
        }
        
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
        case 'japanese-learning':
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