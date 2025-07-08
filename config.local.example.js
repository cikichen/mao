/**
 * 本地配置文件模板
 * 复制此文件为 config.local.js 并填入实际的配置值
 * config.local.js 不会被提交到代码仓库
 */

// 本地环境配置
window.LOCAL_CONFIG = {
    // 高德地图API密钥
    // 获取方式：https://lbs.amap.com/
    AMAP_API_KEY: 'YOUR_AMAP_API_KEY_HERE',
    
    // 其他可能的API密钥
    // BAIDU_MAP_KEY: 'YOUR_BAIDU_MAP_KEY_HERE',
    // GOOGLE_MAP_KEY: 'YOUR_GOOGLE_MAP_KEY_HERE',
    
    // 开发环境特定配置
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug'
};

console.log('本地配置已加载 (敏感信息已隐藏)');
