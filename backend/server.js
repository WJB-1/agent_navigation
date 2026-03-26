const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入路由
const mapRoutes = require('./routes/mapRoutes');
const configRoutes = require('./routes/configRoutes');
const navigationRoutes = require('./routes/navigationRoutes');

// 挂载路由
app.use('/api/navigation', mapRoutes);
app.use('/api/config/llm', configRoutes);
app.use('/api/navigation', navigationRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'nav-preview-backend',
    timestamp: new Date().toISOString()
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    service: 'nav-preview-backend',
    version: '1.0.0',
    phase: 'Phase 3 - Spatial Logic & Navigation Preview',
    apis: {
      nearby: '/api/navigation/nearby',
      preview: '/api/navigation/preview',
      preview_test: '/api/navigation/preview/test',
      preview_health: '/api/navigation/preview/health',
      config: '/api/config/llm'
    }
  });
});

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDB();

    // 启动 HTTP 服务
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🗺️  Map API: http://localhost:${PORT}/api/navigation/nearby`);
      console.log(`🧭 Preview API: http://localhost:${PORT}/api/navigation/preview`);
      console.log(`🔍 Preview Test: http://localhost:${PORT}/api/navigation/preview/test`);
      console.log(`⚙️  Config API: http://localhost:${PORT}/api/config/llm/active`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 启动服务
startServer();

module.exports = app;