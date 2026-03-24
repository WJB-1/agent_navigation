/**
 * LLM 配置管理模块
 * 在内存中管理用户输入的大模型 API Key 和配置
 * 
 * 支持的 Provider:
 * - gemini: Google Gemini API
 * - openai: OpenAI API
 * - anthropic: Anthropic Claude API
 * - azure: Azure OpenAI API
 */

// 内存存储配置
const configStore = {
  // API Keys 存储
  keys: new Map(),
  
  // 当前激活的配置
  activeProvider: null,
  activeModel: null,
  
  // 各 Provider 的模型列表
  availableModels: {
    gemini: [
      'gemini-robotics-er-1.5-preview',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ],
    openai: [
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    azure: [
      'gpt-4o',
      'gpt-4',
      'gpt-35-turbo'
    ]
  }
};

/**
 * 设置 API Key
 * @param {string} provider - 提供商名称 (gemini, openai, anthropic, azure)
 * @param {string} key - API Key
 */
function setKey(provider, key) {
  if (!provider || typeof provider !== 'string') {
    throw new Error('Provider must be a non-empty string');
  }
  
  if (!key || typeof key !== 'string') {
    throw new Error('API key must be a non-empty string');
  }
  
  configStore.keys.set(provider.toLowerCase(), key);
}

/**
 * 获取 API Key
 * @param {string} provider - 提供商名称
 * @returns {string|null} API Key 或 null
 */
function getKey(provider) {
  if (!provider || typeof provider !== 'string') {
    return null;
  }
  
  return configStore.keys.get(provider.toLowerCase()) || null;
}

/**
 * 设置当前激活的模型
 * @param {string} provider - 提供商名称
 * @param {string} modelName - 模型名称
 */
function setActiveModel(provider, modelName) {
  if (!provider || typeof provider !== 'string') {
    throw new Error('Provider must be a non-empty string');
  }
  
  if (!modelName || typeof modelName !== 'string') {
    throw new Error('Model name must be a non-empty string');
  }
  
  const providerLower = provider.toLowerCase();
  
  // 验证 provider 是否支持
  if (!configStore.availableModels[providerLower]) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  
  configStore.activeProvider = providerLower;
  configStore.activeModel = modelName;
}

/**
 * 获取当前激活的配置
 * @returns {Object} 包含 activeProvider 和 activeModel 的对象
 */
function getActiveConfig() {
  return {
    active_provider: configStore.activeProvider,
    active_model: configStore.activeModel,
    has_active_key: configStore.activeProvider 
      ? configStore.keys.has(configStore.activeProvider)
      : false
  };
}

/**
 * 获取当前激活的 API Key
 * @returns {string|null} 当前激活的 API Key 或 null
 */
function getActiveKey() {
  if (!configStore.activeProvider) {
    return null;
  }
  
  return configStore.keys.get(configStore.activeProvider) || null;
}

/**
 * 获取所有可用的模型列表
 * @returns {Object} 各 Provider 的可用模型列表
 */
function getAvailableModels() {
  return { ...configStore.availableModels };
}

/**
 * 清除指定 Provider 的 API Key
 * @param {string} provider - 提供商名称
 */
function clearKey(provider) {
  if (!provider || typeof provider !== 'string') {
    return;
  }
  
  configStore.keys.delete(provider.toLowerCase());
}

/**
 * 获取所有已配置的 Provider 列表
 * @returns {Array<string>} 已配置 Key 的 Provider 列表
 */
function getConfiguredProviders() {
  return Array.from(configStore.keys.keys());
}

/**
 * 验证指定 Provider 是否有配置 Key
 * @param {string} provider - 提供商名称
 * @returns {boolean} 是否已配置
 */
function hasKey(provider) {
  if (!provider || typeof provider !== 'string') {
    return false;
  }
  
  return configStore.keys.has(provider.toLowerCase());
}

module.exports = {
  setKey,
  getKey,
  setActiveModel,
  getActiveConfig,
  getActiveKey,
  getAvailableModels,
  clearKey,
  getConfiguredProviders,
  hasKey
};