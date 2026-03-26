# CorSight Navigation

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Node.js-18+-brightgreen.svg" alt="Node.js">
</p>

<p align="center">
  <b>视障语义地图导航预览系统</b><br>
  基于多模态大模型的视障人士导航播报生成系统
</p>

---

## 🌟 项目简介

CorSight Navigation 是一个专为视障人士设计的**导航路线行前语音预览系统**。系统利用高德地图 API 获取导航路线，结合街景采样点数据，通过多模态大模型（Gemini/Qwen/DeepSeek）分析街景图片并生成自然、准确、易懂的语音导航播报。

### 核心功能

- 🗺️ **智能路线规划** - 基于高德地图 API 的路径规划
- 🖼️ **街景语义分析** - 多模态大模型分析街景图片，识别障碍物、路口特征
- 🎙️ **自然语音播报** - 生成符合视障人士认知习惯的导航播报文案
- ⏱️ **行前预览模式** - 出发前即可"聆听"完整路线，降低出行焦虑
- 🤖 **多模型支持** - 支持 Gemini、DeepSeek、阿里云百炼 Qwen 等多种大模型
- 🎯 **双模型分工** - 视觉模型分析图片，文本模型生成播报，各司其职

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (Vite + Vanilla JS)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  MapViewer  │  │ ConfigPanel │  │   PreviewPlayer     │  │
│  │  地图渲染    │  │  模型配置    │  │   播报播放器        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端 (Express.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Route Agent │  │PerceptionAgent│  │ LanguageOptimizer │  │
│  │ 路线规划    │  │  环境感知     │  │    语言优化        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Spatial MW  │  │  LLM Client │  │   Model Tester      │  │
│  │ 空间降噪    │  │  大模型接入  │  │   模型探测          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌──────────────┐         ┌──────────────┐
        │ 高德地图 API  │         │  大模型 API   │
        │ 路线/地图数据│         │Gemini/DeepSeek│
        └──────────────┘         └──────────────┘
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0（用于街景数据存储）
- **高德地图 API Key**（路线规划服务）
- **大模型 API Key**（至少配置一个：Gemini/DeepSeek/阿里云百炼）

### 安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd navigation_agent

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 环境配置

在项目根目录 `backend/.env` 文件中配置 API Keys：

```env
# 高德地图 API Key（必须）
GAODE_KEY=your_gaode_api_key

# MongoDB 连接（必须）
MONGODB_URI=mongodb://localhost:27017/blindmap

# 大模型 API Keys（至少配置一个）
GOOGLE_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
DASHSCOPE_API_KEY=your_bailian_api_key

# 代理配置（如需）
HTTPS_PROXY=http://127.0.0.1:7890
```

### 启动服务

**开发模式（需要同时运行三个服务）：**

```bash
# 终端 1: 启动 Blind_map 后端（街景图片服务）
cd ../Blind_map/backend
npm start
# 服务运行在 http://localhost:3001

# 终端 2: 启动 navigation_agent 后端
cd navigation_agent/backend
npm start
# 服务运行在 http://localhost:3002

# 终端 3: 启动 navigation_agent 前端
cd navigation_agent/frontend
npm run dev
# 服务运行在 http://localhost:3000
```

访问 http://localhost:3000 即可使用系统。

---

## 📁 项目结构

```
navigation_agent/
├── backend/                    # Express.js 后端
│   ├── agents/                 # AI Agent 层
│   │   ├── perceptionAgent.js  # 环境感知 Agent（多模态分析）
│   │   └── languageOptimizerAgent.js  # 语言优化 Agent
│   ├── config/                 # 配置管理
│   │   └── llmConfig.js        # LLM 配置（多模型支持）
│   ├── controllers/            # 控制器
│   │   └── previewController.js # 导航预览控制器
│   ├── middleware/             # 中间件
│   │   └── spatialMiddleware.js # 空间逻辑降噪中间件
│   ├── routes/                 # API 路由
│   │   ├── configRoutes.js     # 配置路由
│   │   ├── mapRoutes.js        # 地图路由
│   │   └── navigationRoutes.js # 导航路由
│   ├── services/               # 服务层
│   │   ├── amapService.js      # 高德地图服务
│   │   ├── corsightService.js  # CorSight 数据服务
│   │   ├── llmClient.js        # 统一大模型客户端
│   │   └── modelTester.js      # 模型可用性探测
│   ├── prompts/                # 提示词模板
│   │   ├── defensivePrompts.js # 防御性提示词
│   │   └── sceneScoutPrompts.js # 场景分析提示词
│   ├── server.js               # 服务入口
│   └── .env                    # 环境变量配置
├── frontend/                   # Vite 前端
│   ├── src/
│   │   ├── components/         # UI 组件
│   │   │   ├── ConfigPanel.js  # LLM 配置面板
│   │   │   ├── MapViewer.js    # 地图组件
│   │   │   ├── PreviewPlayer.js # 播报播放器
│   │   │   └── StreetViewModal.js # 街景弹窗
│   │   ├── services/           # API 服务
│   │   │   └── api.js          # API 封装
│   │   ├── utils/              # 工具函数
│   │   │   └── ttsEngine.js    # TTS 语音引擎
│   │   ├── main.js             # 入口文件
│   │   └── style.css           # 样式文件
│   ├── index.html
│   └── vite.config.js
├── test/                       # 测试脚本
│   ├── test-api-models.js      # API 模型测试
│   ├── debug-preview-api.js    # 预览 API 调试
│   └── phase2-debug/           # Phase 2 调试工具
└── project/                    # 项目文档
    └── *.md                    # 开发指导文档
```

---

## 🎯 使用指南

### 1. 配置大模型

进入配置面板：
- 选择**视觉模型**（用于街景图片分析）- 推荐 Gemini 2.5 Flash 或 Qwen-VL
- 选择**文本模型**（用于生成播报文案）- 推荐 DeepSeek V3 或 Qwen-Max

### 2. 规划导航路线

1. 在地图上点击设置**起点**和**终点**
2. 系统自动调用高德 API 规划路线
3. 显示路线上的关键决策点（转弯、路口等）

### 3. 生成导航播报

点击"生成推演播报"按钮：
- **Step 1**: 路线规划 → 获取导航路径
- **Step 2**: 空间降噪 → 提取关键节点
- **Step 3**: 环境感知 → 分析街景图片（并发处理）
- **Step 4**: 语言优化 → 生成自然播报

### 4. 预览播报内容

- 播放器显示完整播报文案
- 支持**播放/暂停/停止**控制
- 配合 TTS 引擎朗读播报内容

---

## 🛠️ 技术栈

### 后端
- **Express.js** - Web 框架
- **Mongoose** - MongoDB ORM
- **Google GenAI SDK** - Gemini 多模态模型
- **OpenAI SDK** - DeepSeek/Qwen API 调用
- **axios** - HTTP 请求
- **https-proxy-agent** - 代理支持

### 前端
- **Vite** - 构建工具
- **Vanilla JavaScript** - 原生 JS
- **高德地图 JSAPI** - 地图渲染
- **原生 Web Speech API** - TTS 语音合成

### 大模型
- **Google Gemini** - 多模态理解
- **DeepSeek** - 文本生成
- **阿里云百炼 Qwen** - 中文优化

---

## 📸 界面预览

<p align="center">
  <i>视障语义地图导航预览系统界面</i>
</p>

系统包含：
- 🗺️ 高德地图底座（支持选点、标记）
- 📋 LLM 配置面板（双模型选择）
- 🎙️ 播报播放器（播放控制、TTS 朗读）
- 🖼️ 街景预览弹窗（8 方向街景切换）

---

## 🔧 高级配置

### 模型探测

系统支持自动探测模型可用性：

```bash
# 访问探测接口
curl http://localhost:3002/api/config/llm/probe
```

或在前端点击"探测模型可用性"按钮。

### 代理配置

如需代理访问外网 API，在 `.env` 中设置：

```env
HTTPS_PROXY=http://127.0.0.1:7890
```

### 自定义模型

在 `backend/config/llmConfig.js` 中添加新模型：

```javascript
availableModels: {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.0-pro'
  ]
  // ...
}
```

---

## 🧪 测试

```bash
# 运行模型 API 测试
cd test
node test-api-models.js

# 调试预览 API
node debug-preview-api.js
```

---

## 📚 相关文档

- [项目启动指南](./PROJECT_SETUP.md) - 详细启动步骤
- [Phase 3 开发文档](./project/Phase%203开发指导文档.md) - 空间逻辑中间件
- [Phase 4 开发文档](./project/Phase%204开发指导文档.md) - 大模型接入
- [Phase 5 开发文档](./project/Phase%205%20开发指导文档.md) - TTS 与播放器

---

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE) 开源。

---

## 💡 致谢

- 高德地图开放平台提供地图 API 服务
- Google Gemini、DeepSeek、阿里云百炼提供大模型能力
- 视障用户研究社区提供的认知模型指导

---

<p align="center">
  Made with ❤️ for Accessibility
</p>
