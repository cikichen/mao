// 默认配置
const DEFAULT_CONFIG = {
    app: {
        name: '毛主席生平足迹地图',
        version: '2.0.0',
        debug: true,
        defaultCenter: [104.195397, 35.86166],
        defaultZoom: 5,
        defaultProvider: 'leaflet',
    },
    amap: {
        key: 'YOUR_AMAP_API_KEY_HERE',
        version: '2.0',
        plugins: [
            'AMap.Scale',
            'AMap.ToolBar',
            'AMap.InfoWindow',
            'AMap.CircleMarker',
            'AMap.Polyline',
            'AMap.OverlayGroup'
        ]
    },
    theme: {
        primaryColor: '#d32f2f',
        secondaryColor: '#ffd700',
        accentColor: '#ff4444'
    }
};

// 尝试加载本地配置 (如果存在)
// 注意：在 Vite 中，我们通常使用 .env 文件，但为了兼容现有的 config.local.js 模式，
// 我们这里做一个简单的处理。更好的方式是迁移到 .env。
// 目前由于是纯前端构建，无法直接读取文件系统，所以我们依赖 window.LOCAL_CONFIG 
// (如果 config.local.js 仍然被加载) 或者后续迁移到 .env。

// 为了彻底移除 window 依赖，建议用户将 config.local.js 内容迁移到 .env.local
// 这里我们先保留对 window.LOCAL_CONFIG 的兼容读取，以便平滑过渡
const localConfig = window.LOCAL_CONFIG || {};

export const config = {
    app: {
        ...DEFAULT_CONFIG.app,
        ...localConfig
    },
    amap: {
        ...DEFAULT_CONFIG.amap,
        key: localConfig.AMAP_API_KEY || DEFAULT_CONFIG.amap.key
    },
    theme: {
        ...DEFAULT_CONFIG.theme
    }
};

export default config;
