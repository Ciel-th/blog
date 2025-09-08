// 博客文章数据管理
// 这个文件由build-posts.js自动生成，请勿手动编辑

// 工作杂记数据
const workNotesData = [
    {
        "title": "关于这个博客",
        "date": "2025-09-08",
        "excerpt": "这篇文章简单介绍了本博客所用到的技术栈，以及展示如何使用Markdown格式来创建博客文章。只需要创建.md文件并push到GitHub即可自动生成HTML页面。",
        "url": "posts/WorkNotes/1stblog/example-post.html",
        "tags": [
            "Markdown",
            "博客",
            "Git"
        ],
        "cover": "images/WorkNotes/202509_02/1st_blog_title.jpg"
    }
];

// 技术文章数据
const repoData = [];

// 日语学习数据
const japaneseData = [];

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
}