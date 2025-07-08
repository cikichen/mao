# 毛主席生平足迹地图

📍 跟着教员走遍中国 - 通过交互式动态地图展示毛泽东主席1893-1976年波澜壮阔的一生足迹，包含重要文章和诗词，让历史"活"起来。

## ✨ 项目特色

### 🎯 核心功能
- **交互式地图**：基于高德地图API，支持缩放、拖拽、标记点击
- **动态时间轴**：可播放、暂停、拖拽定位的时间轴控制器
- **事件详情面板**：展示历史事件、重要文章、诗词作品的详细信息
- **智能搜索**：支持按地点、事件、文章、诗词等多维度搜索
- **灵活筛选**：按事件类型、时间范围、重要性等条件筛选
- **响应式设计**：完美适配PC端和移动端

### 📚 内容丰富
- **历史事件**：从出生到逝世的重要历史节点
- **重要文章**：《湖南农民运动考察报告》、《论持久战》等经典著作
- **诗词作品**：《沁园春·长沙》、《沁园春·雪》等传世名篇
- **地理信息**：精确的地理坐标和详细的地点信息

### 🎨 现代化UI
- **暗色主题**：护眼的深色界面设计
- **流畅动画**：丰富的过渡动画和交互效果
- **直观操作**：简洁明了的用户界面
- **快捷键支持**：提高操作效率

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 支持ES6+语法
- 网络连接（用于加载地图API）

### 安装部署

1. **克隆项目**
```bash
git clone https://github.com/your-username/mao-map-enhanced.git
cd mao-map-enhanced
```

2. **配置地图API**
编辑 `js/config.js` 文件，替换高德地图API密钥：
```javascript
map: {
    amapKey: 'YOUR_AMAP_KEY_HERE', // 替换为你的高德地图API密钥
    // ...
}
```

3. **启动本地服务器**
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

4. **访问应用**
打开浏览器访问 `http://localhost:8000`

### 获取高德地图API密钥

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册并登录账号
3. 创建应用，选择"Web端(JS API)"
4. 获取API Key并替换到配置文件中

## 📖 使用指南

### 基本操作
- **地图导航**：鼠标拖拽移动地图，滚轮缩放
- **查看事件**：点击地图上的标记点查看事件详情
- **时间轴控制**：使用底部时间轴播放历史进程
- **搜索功能**：点击搜索按钮或按Ctrl+S打开搜索
- **筛选功能**：点击筛选按钮设置显示条件

### 快捷键
- `空格键`：播放/暂停时间轴
- `←/→`：上一个/下一个事件
- `Home/End`：跳转到起点/终点
- `Ctrl+S`：打开搜索
- `Ctrl+F`：打开筛选
- `ESC`：关闭模态框

### 移动端操作
- **左右滑动**：切换事件
- **双指缩放**：地图缩放
- **长按标记**：查看事件详情

## 🏗️ 项目结构

```
mao-map-enhanced/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── main.css           # 主样式
│   ├── timeline.css       # 时间轴样式
│   ├── sidebar.css        # 侧边栏样式
│   └── animations.css     # 动画效果
├── js/                     # JavaScript文件
│   ├── config.js          # 配置文件
│   ├── data.js            # 数据管理
│   ├── map.js             # 地图功能
│   ├── timeline.js        # 时间轴组件
│   ├── sidebar.js         # 侧边栏组件
│   ├── search.js          # 搜索功能
│   ├── filter.js          # 筛选功能
│   └── main.js            # 主应用
├── data/                   # 数据文件
│   └── events.json        # 事件数据
└── README.md              # 项目说明
```

## 🔧 技术栈

- **前端框架**：原生JavaScript (ES6+)
- **地图服务**：高德地图API
- **样式技术**：CSS3 + CSS变量
- **数据格式**：JSON
- **构建工具**：无需构建，直接运行

## 📊 数据结构

### 事件数据格式
```json
{
  "id": "事件唯一标识",
  "date": "1893-12-26",
  "year": 1893,
  "age": 0,
  "type": "historical|article|poem",
  "importance": "high|medium|low",
  "title": "事件标题",
  "location": {
    "province": "省份",
    "city": "城市",
    "district": "区县",
    "detail": "详细地址",
    "coordinates": [经度, 纬度]
  },
  "description": "事件描述",
  "content": {
    "title": "文章/诗词标题",
    "text": "完整内容",
    "background": "创作背景",
    "significance": "历史意义"
  },
  "tags": ["标签1", "标签2"],
  "sources": ["史料来源"],
  "images": ["图片路径"]
}
```

## 🎨 自定义主题

项目使用CSS变量定义主题色彩，可以轻松自定义：

```css
:root {
    --primary-color: #d32f2f;      /* 主色调 */
    --secondary-color: #ffd700;    /* 次要色 */
    --accent-color: #ff4444;       /* 强调色 */
    --bg-color: #1a1a1a;          /* 背景色 */
    --surface-color: #2d2d2d;     /* 表面色 */
    --text-primary: #ffffff;       /* 主文字色 */
    /* ... */
}
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献方式
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 数据贡献
- 补充缺失的历史事件
- 完善事件描述和背景信息
- 添加更多诗词和文章内容
- 修正地理坐标信息

## 📝 更新日志

### v2.0.0 (2025-01-03)
- ✨ 新增重要文章和诗词内容
- 🎨 全新的UI设计和动画效果
- 🔍 增强的搜索和筛选功能
- 📱 完善的移动端适配
- ⚡ 性能优化和代码重构

### v1.0.0 (基于原项目)
- 📍 基础地图功能
- ⏱️ 时间轴播放
- 📋 事件详情展示

## 📄 开源协议

本项目采用 [GPL-3.0 License](LICENSE) 协议开源。

## 🙏 致谢

- 感谢 [sansan0/mao-map](https://github.com/sansan0/mao-map) 项目提供的灵感和基础
- 感谢高德地图提供的地图服务
- 感谢所有为历史数据完善做出贡献的朋友们

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/mao-map-enhanced/issues)
- 发起 [Discussion](https://github.com/your-username/mao-map-enhanced/discussions)

---

**让我们一起追随伟人的脚步，感受那段波澜壮阔的历史！** 🇨🇳
