# Phase 2 前端地图交互模块

## 模块概述

本模块实现了视障语义地图导航预览的前端交互界面，包括：
- LLM 配置管理面板
- 高德地图底座集成
- 空间采样点可视化 (POI)
- 8方位街景预览弹窗
- 导航起终点选点功能

## 文件结构

```
frontend/
├── index.html                    # 主页面入口
├── package.json                  # 依赖管理
├── vite.config.js                # Vite 配置
├── README.md                     # 本文档
└── src/
    ├── main.js                   # 应用入口
    ├── style.css                 # 全局样式
    ├── components/
    │   ├── ConfigPanel.js        # LLM 配置面板
    │   ├── MapViewer.js          # 地图查看器
    │   └── StreetViewModal.js    # 街景弹窗
    └── services/
        └── api.js                # API 请求封装
```

## 安装与运行

```bash
cd frontend
npm install
npm run dev
```

前端服务默认运行在 `http://localhost:3000`，通过代理访问后端 `http://localhost:3002`。

## 功能说明

### 1. LLM 配置面板 (ConfigPanel.js)
- 提供商选择：Google Gemini / OpenAI / Anthropic / Azure
- 模型选择：根据提供商动态加载可用模型
- API Key 输入：安全密码输入框
- 状态显示：当前激活的配置信息

### 2. 地图查看器 (MapViewer.js)
- 高德地图集成：初始中心点北京
- 控件：缩放、定位、比例尺
- 采样点渲染：蓝色标记区分街景采样点
- 事件监听：
  - `moveend` - 地图移动结束后自动加载附近采样点
  - `rightclick` - 右键菜单设置起终点
  - `click` - 点击标记打开街景弹窗

### 3. 街景弹窗 (StreetViewModal.js)
- 场景描述：自然语言描述当前点位
- 8方位图片：N, NE, E, SE, S, SW, W, NW
- 交互：点击缩略图切换主图显示
- 点位信息：ID、坐标、距离

### 4. 导航选点
- 右键菜单："设为起点" / "设为终点" / "清除"
- 视觉反馈：绿色标记起点，红色标记终点
- 生成推演按钮：起终点均设置后启用

## API 接口

### 后端地址
```javascript
const BASE_URL = 'http://localhost:3002'
```

### 可用方法
- `getActiveLLMConfig()` - 获取当前激活的 LLM 配置
- `saveLLMConfig(provider, apiKey, modelName, isActive)` - 保存配置
- `getAvailableModels()` - 获取可用模型列表
- `getNearbyPoints(lat, lon, radius)` - 获取附近采样点
- `healthCheck()` - 健康检查

## 全局状态

```javascript
window.appState = {
  origin: { lng, lat },      // 起点坐标
  destination: { lng, lat }, // 终点坐标
  map: AMap.Map,             // 高德地图实例
  mapViewer: MapViewer       // 地图查看器实例
}
```

## 样式说明

- CSS 变量定义在 `:root` 中，便于主题定制
- 地图标记使用自定义 DOM 实现
- 响应式设计：侧边栏在移动端自动调整宽度

## 依赖

- **axios** - HTTP 请求库
- **Vite** - 构建工具

## 高德地图

使用高德地图 JS API 2.0，需替换 `index.html` 中的 `YOUR_AMAP_KEY`：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY&plugin=AMap.Walking"></script>
```

获取 Key：https://lbs.amap.com/

## 注意事项

1. **端口冲突**：确保 3000 和 3002 端口未被占用
2. **跨域**：开发环境通过 Vite 代理解决跨域
3. **高德 Key**：生产环境需要申请正式 Key
4. **图片路径**：后端返回的图片路径需要可访问