/**
 * API 服务模块
 * 封装 HTTP 请求，对接后端 3002 端口
 */

const BASE_URL = 'http://localhost:3002';

/**
 * 基础请求函数
 * @param {string} url - 请求路径
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

/**
 * 获取当前激活的 LLM 配置
 * @returns {Promise<Object>}
 */
export async function getActiveLLMConfig() {
  return request('/api/config/llm/active');
}

/**
 * 保存 LLM 配置
 * @param {string} provider - 提供商 (gemini, openai, anthropic, azure)
 * @param {string} apiKey - API Key
 * @param {string} modelName - 模型名称
 * @param {boolean} isActive - 是否设为激活状态
 * @returns {Promise<Object>}
 */
export async function saveLLMConfig(provider, apiKey, modelName, isActive = true) {
  return request('/api/config/llm', {
    method: 'POST',
    body: JSON.stringify({
      provider,
      api_key: apiKey,
      model_name: modelName,
      is_active: isActive
    })
  });
}

/**
 * 获取可用的 LLM 模型列表
 * @returns {Promise<Object>}
 */
export async function getAvailableModels() {
  return request('/api/config/llm/models');
}

/**
 * 获取附近的采样点
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @param {number} radius - 搜索半径（米），默认 1000
 * @returns {Promise<Object>}
 */
export async function getNearbyPoints(lat, lon, radius = 1000) {
  return request(`/api/navigation/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
}

/**
 * 健康检查
 * @returns {Promise<Object>}
 */
export async function healthCheck() {
  const response = await fetch(`${BASE_URL}/health`);
  return response.json();
}

export default {
  getActiveLLMConfig,
  saveLLMConfig,
  getAvailableModels,
  getNearbyPoints,
  healthCheck
};