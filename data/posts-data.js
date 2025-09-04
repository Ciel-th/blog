// 博客文章数据管理
// 这个文件包含所有文章的数据，各个页面都会引用这里的数据

// 工作杂记数据
const workNotesData = [
    {
        title: "远程工作效率提升指南：工具、方法与心得",
        date: "2025-01-26",
        excerpt: "分享远程工作中提升效率的实用工具、工作方法和个人心得，帮助远程工作者建立高效的工作流程和良好的工作习惯。",
        url: "posts/WorkNotes/remote-work-productivity-tips.html",
        tags: ["远程工作", "效率提升", "工作"],
        cover: "images/WorkNotes/202509_01/weekly-002-cover.jpeg"
    }
    // 在这里添加新的工作杂记文章
];

// 技术文章数据
const repoData = [
    {
        title: "Git 工作流最佳实践：从个人项目到团队协作",
        date: "2025-01-24",
        excerpt: "深入探讨Git工作流的最佳实践，包括分支管理策略、提交规范、代码审查流程等，帮助开发者建立高效的版本控制工作流。",
        url: "posts/repo/git-workflow-best-practices.html",
        tags: ["Git", "工作流", "技术", "团队协作"],
        cover: "images/repo/nei/weekly-002-cover.jpeg"
    }
    // 在这里添加新的技术文章
];

// 日语学习数据
const japaneseData = [
    {
        title: "日语助词「は」与「が」的区别详解",
        date: "2025-01-25",
        excerpt: "深入解析日语中最容易混淆的两个助词「は」和「が」的用法区别，通过实例帮助理解其在不同语境下的正确使用方法。",
        url: "posts/JpnLearning/japanese-grammar-particles.html",
        tags: ["日语学习", "语法", "学习"],
        cover: "images/JpnLearning/day1/weekly-002-cover.jpeg"
    }
    // 在这里添加新的日语学习文章
];

// 获取所有文章数据并按时间排序
function getAllPostsData() {
    const posts = [];
    
    // 合并所有数据
    posts.push(...workNotesData);
    posts.push(...repoData);
    posts.push(...japaneseData);
    
    // 按日期排序（从新到旧）
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return posts;
}

// 获取最新的N篇文章
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
        case 'japanese-learning':
            return japaneseData;
        default:
            return [];
    }
}

// 导出数据（如果在模块环境中）
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