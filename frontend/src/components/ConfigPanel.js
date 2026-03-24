/**
 * LLM 配置面板组件
 * 用于设置和管理大模型 API Key 和模型选择
 */

import { getActiveLLMConfig, saveLLMConfig, getAvailableModels } from '../services/api.js';

export class ConfigPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.availableModels = {};
    this.currentConfig = null;
    this.init();
  }

  /**
   * 初始化组件
   */
  async init() {
    this.render();
    await this.loadAvailableModels();
    await this.loadActiveConfig();
    this.bindEvents();
  }

  /**
   * 渲染面板 HTML
   */
  render() {
    this.container.innerHTML = `
      <div class="config-panel">
        <h3>🤖 LLM 配置</h3>
        
        <div class="config-status" id="config-status">
          <span class="status-indicator"></span>
          <span class="status-text">加载中...</span>
        </div>

        <form id="llm-config-form" class="config-form">
          <div class="form-group">
            <label for="provider-select">选择提供商</label>
            <select id="provider-select" required>
              <option value="">请选择</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>

          <div class="form-group">
            <label for="model-select">选择模型</label>
            <select id="model-select" required disabled>
              <option value="">请先选择提供商</option>
            </select>
          </div>

          <div class="form-group">
            <label for="api-key-input">API Key</label>
            <input 
              type="password" 
              id="api-key-input" 
              placeholder="输入您的 API Key" 
              required
              autocomplete="off"
            />
            <small class="form-hint">API Key 仅存储在服务器内存中</small>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" id="is-active-checkbox" checked />
              设为当前激活配置
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">保存配置</button>
          </div>
        </form>

        <div id="config-message" class="config-message"></div>
      </div>
    `;

    this.elements = {
      form: this.container.querySelector('#llm-config-form'),
      providerSelect: this.container.querySelector('#provider-select'),
      modelSelect: this.container.querySelector('#model-select'),
      apiKeyInput: this.container.querySelector('#api-key-input'),
      isActiveCheckbox: this.container.querySelector('#is-active-checkbox'),
      statusIndicator: this.container.querySelector('#config-status'),
      messageContainer: this.container.querySelector('#config-message')
    };
  }

  /**
   * 加载可用的模型列表
   */
  async loadAvailableModels() {
    try {
      const response = await getAvailableModels();
      this.availableModels = response.data.available_models || {};
    } catch (error) {
      console.error('加载模型列表失败:', error);
      this.showMessage('加载模型列表失败', 'error');
    }
  }

  /**
   * 加载当前激活的配置
   */
  async loadActiveConfig() {
    try {
      const config = await getActiveLLMConfig();
      this.currentConfig = config;
      this.updateStatusUI(config);
      
      // 如果已有配置，填充表单
      if (config.active_provider) {
        this.elements.providerSelect.value = config.active_provider;
        this.updateModelOptions(config.active_provider);
        
        // 尝试设置模型（如果选项存在）
        if (config.active_model) {
          setTimeout(() => {
            this.elements.modelSelect.value = config.active_model;
          }, 100);
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      this.updateStatusUI(null);
    }
  }

  /**
   * 更新状态显示
   */
  updateStatusUI(config) {
    const indicator = this.elements.statusIndicator.querySelector('.status-indicator');
    const text = this.elements.statusIndicator.querySelector('.status-text');
    
    if (config && config.active_provider) {
      indicator.className = 'status-indicator status-active';
      text.textContent = `当前已激活: ${this.getProviderDisplayName(config.active_provider)} / ${config.active_model}`;
    } else {
      indicator.className = 'status-indicator status-inactive';
      text.textContent = '未配置 LLM';
    }
  }

  /**
   * 获取提供商显示名称
   */
  getProviderDisplayName(provider) {
    const names = {
      gemini: 'Google Gemini',
      openai: 'OpenAI',
      anthropic: 'Anthropic Claude',
      azure: 'Azure OpenAI'
    };
    return names[provider] || provider;
  }

  /**
   * 根据提供商更新模型选项
   */
  updateModelOptions(provider) {
    const modelSelect = this.elements.modelSelect;
    const models = this.availableModels[provider] || [];
    
    modelSelect.innerHTML = '';
    
    if (models.length === 0) {
      modelSelect.innerHTML = '<option value="">该提供商暂无可选模型</option>';
      modelSelect.disabled = true;
    } else {
      modelSelect.disabled = false;
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 提供商选择变化时更新模型列表
    this.elements.providerSelect.addEventListener('change', (e) => {
      const provider = e.target.value;
      if (provider) {
        this.updateModelOptions(provider);
      } else {
        this.elements.modelSelect.innerHTML = '<option value="">请先选择提供商</option>';
        this.elements.modelSelect.disabled = true;
      }
    });

    // 表单提交
    this.elements.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  /**
   * 处理表单提交
   */
  async handleSubmit() {
    const provider = this.elements.providerSelect.value;
    const modelName = this.elements.modelSelect.value;
    const apiKey = this.elements.apiKeyInput.value;
    const isActive = this.elements.isActiveCheckbox.checked;

    if (!provider || !modelName || !apiKey) {
      this.showMessage('请填写所有必填项', 'error');
      return;
    }

    try {
      this.showMessage('保存中...', 'info');
      
      await saveLLMConfig(provider, apiKey, modelName, isActive);
      
      this.showMessage('配置保存成功！', 'success');
      await this.loadActiveConfig();
      
      // 清空 API Key 输入框
      this.elements.apiKeyInput.value = '';
      
    } catch (error) {
      console.error('保存配置失败:', error);
      this.showMessage(`保存失败: ${error.message}`, 'error');
    }
  }

  /**
   * 显示消息
   */
  showMessage(message, type = 'info') {
    const container = this.elements.messageContainer;
    container.textContent = message;
    container.className = `config-message message-${type}`;
    
    // 3秒后清除消息
    setTimeout(() => {
      container.textContent = '';
      container.className = 'config-message';
    }, 3000);
  }
}

export default ConfigPanel;