/**
 * 配置文件示例
 * 复制此文件为 config.js 并填入你的API密钥
 */

// 高德地图API配置
window.AMAP_CONFIG = {
    // 在这里填入你的高德地图API密钥
    // 获取方式：https://lbs.amap.com/
    key: 'YOUR_AMAP_KEY_HERE',
    
    // API版本
    version: '1.4.15',
    
    // 插件列表
    plugins: [
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.InfoWindow',
        'AMap.CircleMarker',
        'AMap.Polyline',
        'AMap.OverlayGroup'
    ]
};

// 应用配置
window.APP_CONFIG = {
    // 应用名称
    name: '毛主席生平足迹地图',
    
    // 版本号
    version: '2.0.0',
    
    // 是否启用调试模式
    debug: false,
    
    // 默认地图中心点（中国地理中心）
    defaultCenter: [104.195397, 35.86166],
    
    // 默认缩放级别
    defaultZoom: 5,
    
    // 数据文件路径
    dataFile: 'data/events.json',
    
    // 性能配置
    performance: {
        // 防抖延迟（毫秒）
        debounceDelay: 300,
        
        // 节流延迟（毫秒）
        throttleDelay: 100,
        
        // 动画持续时间（毫秒）
        animationDuration: 300
    },
    
    // 主题配置
    theme: {
        // 主色调
        primaryColor: '#d32f2f',
        
        // 次要色
        secondaryColor: '#ffd700',
        
        // 强调色
        accentColor: '#ff4444'
    }
};
