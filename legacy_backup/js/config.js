/**
 * 应用配置文件
 * 包含地图配置、API密钥、主题设置等
 */

// 应用配置
const CONFIG = {
    // 地图配置
    map: {
        // 高德地图API密钥 (从本地配置文件获取)
        amapKey: window.LOCAL_CONFIG?.AMAP_API_KEY || window.AMAP_CONFIG?.key || 'YOUR_AMAP_API_KEY_HERE',
        
        // 默认地图中心点 (中国地理中心)
        center: [104.195397, 35.86166],
        
        // 默认缩放级别
        zoom: 5,
        
        // 地图样式
        mapStyle: 'amap://styles/dark', // 暗色主题
        
        // 地图特性
        features: ['bg', 'point', 'road', 'building'],
        
        // 是否显示地图控件
        showControls: true,
        
        // 路径绘制配置
        pathStyle: {
            strokeColor: '#ff0000',  // 更鲜艳的红色
            strokeWeight: 6,         // 更粗的线条
            strokeOpacity: 0.9,      // 更高的透明度
            strokeStyle: 'solid'
        },
        
        // 标记点样式配置
        markerStyles: {
            historical: {
                fillColor: '#d32f2f',
                strokeColor: '#ffffff',
                strokeWeight: 2,
                radius: 8
            },
            article: {
                fillColor: '#ffd700',
                strokeColor: '#ffffff',
                strokeWeight: 2,
                radius: 8
            },
            poem: {
                fillColor: '#ff4444',
                strokeColor: '#ffffff',
                strokeWeight: 2,
                radius: 8
            }
        }
    },
    
    // 动画配置
    animation: {
        // 播放速度 (毫秒)
        defaultSpeed: 2000,
        minSpeed: 500,
        maxSpeed: 5000,
        
        // 标记点动画
        markerAnimation: {
            duration: 500,
            easing: 'ease-out'
        },
        
        // 路径绘制动画
        pathAnimation: {
            duration: 1000,
            easing: 'ease-in-out'
        },
        
        // 时间轴动画
        timelineAnimation: {
            duration: 300,
            easing: 'ease'
        }
    },
    
    // 数据配置
    data: {
        // 数据文件路径
        eventsFile: 'data/events.json',
        
        // 事件类型
        eventTypes: {
            historical: '历史事件',
            article: '重要文章',
            poem: '诗词作品'
        },
        
        // 重要性级别
        importanceLevels: {
            high: '重要',
            medium: '一般',
            low: '次要'
        }
    },
    
    // UI配置
    ui: {
        // 主题色彩
        theme: {
            primary: '#d32f2f',
            secondary: '#ffd700',
            accent: '#ff4444',
            background: '#1a1a1a',
            surface: '#2d2d2d',
            text: '#ffffff'
        },
        
        // 侧边栏配置
        sidebar: {
            width: 400,
            animationDuration: 300
        },
        
        // 时间轴配置
        timeline: {
            height: 120,
            markerSize: 8,
            progressHeight: 4
        },
        
        // 模态框配置
        modal: {
            backdropBlur: true,
            animationDuration: 300
        }
    },
    
    // 交互配置
    interaction: {
        // 键盘快捷键
        shortcuts: {
            play: 'Space',
            prev: 'ArrowLeft',
            next: 'ArrowRight',
            home: 'Home',
            end: 'End',
            search: 'KeyS',
            filter: 'KeyF'
        },
        
        // 触摸手势
        gestures: {
            swipeThreshold: 50,
            tapTimeout: 300
        },
        
        // 自动播放配置
        autoplay: {
            enabled: false,
            interval: 3000,
            pauseOnHover: true
        }
    },
    
    // 性能配置
    performance: {
        // 虚拟滚动
        virtualScroll: {
            enabled: true,
            itemHeight: 100,
            bufferSize: 5
        },
        
        // 图片懒加载
        lazyLoad: {
            enabled: true,
            threshold: 0.1
        },
        
        // 防抖延迟
        debounceDelay: 300,
        
        // 节流延迟
        throttleDelay: 100
    },
    
    // 本地存储配置
    storage: {
        // 存储键名前缀
        prefix: 'mao_map_',
        
        // 存储的设置项
        settings: [
            'playSpeed',
            'autoplay',
            'theme',
            'favorites',
            'viewHistory'
        ],
        
        // 存储过期时间 (天)
        expireDays: 30
    },
    
    // 分享配置
    sharing: {
        // 支持的分享平台
        platforms: ['weibo', 'wechat', 'qq', 'link'],
        
        // 分享内容模板
        templates: {
            title: '毛主席生平足迹地图 - {eventTitle}',
            description: '通过交互式地图追随伟人足迹，了解波澜壮阔的历史',
            hashtags: ['毛主席', '历史', '足迹地图']
        }
    },
    
    // 开发配置
    development: {
        // 是否启用调试模式
        debug: true,
        
        // 日志级别
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        
        // 是否显示性能监控
        showPerformance: false,
        
        // 模拟数据
        mockData: false
    }
};


