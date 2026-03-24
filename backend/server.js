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

// 挂载路由
app.use('/api/navigation', mapRoutes);
app.use('/api/config/llm', configRoutes);

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
    phase: 'Phase 1 - Infrastructure & Database'
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