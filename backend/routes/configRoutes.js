const express = require('express');
const router = express.Router();
const llmConfig = require('../config/llmConfig');

/**
 * 配置管理路由
 * 提供 LLM API Key 和模型配置的增删改查接口
 */

/**
 * POST /api/config/llm
 * 保存 LLM 配置（API Key 和模型设置）
 * 
 * Request Body:
 * {
 *   "provider": "gemini",
 *   "api_key": "AIzaSy...",
 *   "model_name": "gemini-robotics-er-1.5-preview",
 *   "is_active": true
 * }
 */
router.post('/', (req, res) => {
  try {
    const { provider, api_key, model_name, is_active } = req.body;

    // 验证必填参数
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: provider'
      });
    }

    if (!api_key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: api_key'
      });
    }

    if (!model_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: model_name'
      });
    }

    // 设置 API Key
    llmConfig.setKey(provider, api_key);

    // 如果设置为激活状态，则设为当前活跃配置
    if (is_active === true) {
      llmConfig.setActiveModel(provider, model_name);
    }

    res.json({
      success: true,
      message: 'Configuration saved successfully',
      data: {
        provider: provider.toLowerCase(),
        model_name: model_name,
        is_active: is_active === true
      }
    });

  } catch (error) {
    console.error('Error saving LLM config:', error.message);
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/config/llm/active
 * 获取当前激活的 LLM 配置
 * 
 * Response:
 * {
 *   "success": true,
 *   "active_provider": "gemini",
 *   "active_model": "gemini-robotics-er-1.5-preview",
 *   "has_active_key": true
 * }
 */
router.get('/active', (req, res) => {
  try {
    const activeConfig = llmConfig.getActiveConfig();

    res.json({
      success: true,
      ...activeConfig
    });

  } catch (error) {
    console.error('Error getting active config:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/config/llm/models
 * 获取所有可用的模型列表
 */
router.get('/models', (req, res) => {
  try {
    const models = llmConfig.getAvailableModels();
    const configuredProviders = llmConfig.getConfiguredProviders();

    res.json({
      success: true,
      data: {
        available_models: models,
        configured_providers: configuredProviders
      }
    });

  } catch (error) {
    console.error('Error getting models:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/config/llm/status
 * 获取 LLM 配置状态（用于调试）
 */
router.get('/status', (req, res) => {
  try {
    const configuredProviders = llmConfig.getConfiguredProviders();
    const activeConfig = llmConfig.getActiveConfig();

    res.json({
      success: true,
      data: {
        configured_providers: configuredProviders,
        active_config: activeConfig
      }
    });

  } catch (error) {
    console.error('Error getting config status:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;