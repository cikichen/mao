# 配置设置说明

## API 密钥配置

为了保护敏感信息，本项目使用本地配置文件来存储 API 密钥。

### 设置步骤

1. **复制配置模板**
   ```bash
   cp config.local.example.js config.local.js
   ```

2. **编辑本地配置文件**
   打开 `config.local.js` 文件，将 `YOUR_AMAP_API_KEY_HERE` 替换为你的实际 API 密钥：
   ```javascript
   window.LOCAL_CONFIG = {
       AMAP_API_KEY: '你的高德地图API密钥',
       // 其他配置...
   };
   ```

3. **获取高德地图 API 密钥**
   - 访问 [高德开放平台](https://lbs.amap.com/)
   - 注册/登录账号
   - 创建应用并获取 API 密钥

### 文件说明

- `config.js` - 主配置文件（会被提交到仓库）
- `config.local.js` - 本地配置文件（包含敏感信息，不会被提交）
- `config.local.example.js` - 配置模板文件
- `js/config.js` - 详细配置文件

### 安全性

- `config.local.js` 已添加到 `.gitignore`，不会被提交到代码仓库
- 所有敏感信息都存储在本地配置文件中
- 主配置文件只包含非敏感的默认配置

### 故障排除

如果遇到 API 密钥相关错误：

1. 确认 `config.local.js` 文件存在
2. 检查 API 密钥是否正确
3. 确认 API 密钥的使用权限和配额
4. 查看浏览器控制台的错误信息
