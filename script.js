// 博客配置
const blogConfig = {
    postsPerPage: 10,
    postsDirectory: 'posts/',
    categories: {
        'work-notes': '工作杂记',
        'repo': 'repo',
        'japanese-learning': '日语学习记录',
        'about': '关于我'
    }
};

// 文章数据（实际使用时可以从JSON文件或API获取）
const posts = [
    {
        id: 'first-post',
        title: '第一篇博客',
        date: '2024-01-15',
        category: 'work-notes',
        excerpt: '欢迎来到我的博客！这里将分享我在工作、学习和日本生活中的点点滴滴。',
        filename: 'first-post.md'
    },
    {
        id: 'learning-japanese',
        title: '日语学习心得',
        date: '2024-01-10',
        category: 'japanese-learning',
        excerpt: '分享一些日语学习的方法和在日本生活中的语言体验。',
        filename: 'learning-japanese.md'
    }
];

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    return blogConfig.categories[category] || category;
}

// 获取URL参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 渲染文章列表
function renderPostList(postsToRender = posts, containerId = 'post-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (postsToRender.length === 0) {
        container.innerHTML = '<p class="no-posts">暂无文章</p>';
        return;
    }

    const postsHtml = postsToRender.map(post => `
        <article class="post-item">
            <h3 class="post-title">
                <a href="post.html?id=${post.id}">${post.title}</a>
            </h3>
            <div class="post-meta">
                ${formatDate(post.date)} · ${getCategoryName(post.category)}
            </div>
            <div class="post-excerpt">${post.excerpt}</div>
        </article>
    `).join('');

    container.innerHTML = postsHtml;
}

// 根据分类过滤文章
function filterPostsByCategory(category) {
    if (!category || category === 'all') {
        return posts;
    }
    return posts.filter(post => post.category === category);
}

// 获取单篇文章
function getPostById(id) {
    return posts.find(post => post.id === id);
}

// 加载Markdown文件并渲染
async function loadAndRenderMarkdown(filename, containerId) {
    try {
        const response = await fetch(`${blogConfig.postsDirectory}${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        const html = marked.parse(markdown);
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error('Error loading markdown:', error);
        document.getElementById(containerId).innerHTML = `
            <div class="error-message">
                <h3>文章加载失败</h3>
                <p>抱歉，无法加载文章内容。请稍后再试。</p>
                <p class="error-details">错误信息: ${error.message}</p>
            </div>
        `;
    }
}

// 渲染文章详情页
function renderPostDetail() {
    const postId = getUrlParameter('id');
    if (!postId) {
        document.getElementById('article-content').innerHTML = '<p>文章不存在</p>';
        return;
    }

    const post = getPostById(postId);
    if (!post) {
        document.getElementById('article-content').innerHTML = '<p>文章不存在</p>';
        return;
    }

    // 更新页面标题
    document.title = `${post.title} - 我的博客`;

    // 更新文章头部信息
    const articleHeader = document.querySelector('.article-header');
    if (articleHeader) {
        articleHeader.innerHTML = `
            <h1 class="article-title">${post.title}</h1>
            <div class="article-meta">
                ${formatDate(post.date)} · ${getCategoryName(post.category)}
            </div>
        `;
    }

    // 加载并渲染Markdown内容
    loadAndRenderMarkdown(post.filename, 'article-content');
}

// 设置导航栏活跃状态
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// 页面初始化
function initPage() {
    setActiveNavLink();
    
    // 根据页面类型执行不同的初始化逻辑
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            // 首页：显示最新文章
            renderPostList(posts.slice(0, blogConfig.postsPerPage));
            break;
            
        case 'work-notes.html':
            // 工作杂记页面
            const workPosts = filterPostsByCategory('work-notes');
            renderPostList(workPosts);
            break;
            
        case 'repo.html':
            // repo页面
            const repoPosts = filterPostsByCategory('repo');
            renderPostList(repoPosts);
            break;
            
        case 'japanese-learning.html':
            // 日语学习记录页面
            const japanesePosts = filterPostsByCategory('japanese-learning');
            renderPostList(japanesePosts);
            break;
            
        case 'post.html':
            // 文章详情页
            renderPostDetail();
            break;
            
        default:
            break;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 导出函数供其他脚本使用
window.blogUtils = {
    renderPostList,
    filterPostsByCategory,
    loadAndRenderMarkdown,
    formatDate,
    getCategoryName
};