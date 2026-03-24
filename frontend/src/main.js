/**
 * 前端主入口
 * 初始化各个组件并协调数据流
 */

import { ConfigPanel } from './components/ConfigPanel.js';
import { MapViewer } from './components/MapViewer.js';
import { StreetViewModal } from './components/StreetViewModal.js';
import { healthCheck } from './services/api.js';

// 全局状态
window.appState = {
  origin: null,      // 起点坐标 {lng, lat}
  destination: null, // 终点坐标 {lng, lat}
  map: null,         // 高德地图实例
  markers: []        // 当前显示的标记点
};

/**
 * 检查后端服务健康状态
 */
async function checkBackendHealth() {
  try {
    const health = await healthCheck();
    console.log('✅ 后端服务状态:', health);
    return true;
  } catch (error) {
    console.error('❌ 后端服务连接失败:', error);
    alert('无法连接到后端服务，请确保后端服务已启动 (cd backend && node server.js)');
    return false;
  }
}

/**
 * 初始化应用
 */
async function initApp() {
  console.log('🚀 初始化视障语义地图导航预览...');
  
  // 检查后端健康状态
  const isHealthy = await checkBackendHealth();
  if (!isHealthy) {
    return;
  }
  
  // 初始化配置面板
  const configPanel = new ConfigPanel('config-panel-container');
  console.log('✅ 配置面板已初始化');
  
  // 初始化地图
  const mapViewer = new MapViewer('map-viewer');
  window.appState.mapViewer = mapViewer;
  window.appState.map = mapViewer.map;
  
  // 初始化街景弹窗
  const streetViewModal = new StreetViewModal('street-view-modal');
  
  // 地图标记点击事件 - 打开街景弹窗
  mapViewer.onMarkerClick = (point) => {
    streetViewModal.open(point);
  };
  
  // 地图右键菜单事件
  mapViewer.onContextMenu = (lng, lat, pixel) => {
    showContextMenu(lng, lat, pixel);
  };
  
  console.log('✅ 地图组件已初始化');
  
  // 初始化起终点状态显示
  updateRouteDisplay();
  
  console.log('✅ 应用初始化完成');
}

/**
 * 更新起终点显示
 */
function updateRouteDisplay() {
  const originEl = document.getElementById('origin-value');
  const destinationEl = document.getElementById('destination-value');
  const generateBtn = document.getElementById('generate-preview-btn');
  
  if (window.appState.origin) {
    const { lng, lat } = window.appState.origin;
    originEl.textContent = `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    originEl.classList.add('set');
  } else {
    originEl.textContent = '未设置';
    originEl.classList.remove('set');
  }
  
  if (window.appState.destination) {
    const { lng, lat } = window.appState.destination;
    destinationEl.textContent = `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    destinationEl.classList.add('set');
  } else {
    destinationEl.textContent = '未设置';
    destinationEl.classList.remove('set');
  }
  
  // 只有起点和终点都设置了，才启用生成按钮
  const canGenerate = window.appState.origin && window.appState.destination;
  generateBtn.disabled = !canGenerate;
}

/**
 * 设置起点
 */
window.setOrigin = function(lng, lat) {
  window.appState.origin = { lng, lat };
  updateRouteDisplay();
  console.log('📍 起点已设置:', lng, lat);
};

/**
 * 设置终点
 */
window.setDestination = function(lng, lat) {
  window.appState.destination = { lng, lat };
  updateRouteDisplay();
  console.log('📍 终点已设置:', lng, lat);
};

/**
 * 清除起终点
 */
window.clearRoutePoints = function() {
  window.appState.origin = null;
  window.appState.destination = null;
  updateRouteDisplay();
  console.log('🗑️  起终点已清除');
};

// 监听生成推演播报按钮
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-preview-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (window.appState.origin && window.appState.destination) {
        console.log('🎬 生成推演播报:');
        console.log('  起点:', window.appState.origin);
        console.log('  终点:', window.appState.destination);
        // Phase 3/4 将实现实际的后端请求
        alert('起终点已就绪！坐标已输出到控制台。');
      }
    });
  }
});

/**
 * 显示右键菜单
 */
function showContextMenu(lng, lat, pixel) {
  // 移除已存在的菜单
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建菜单
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${pixel.x}px`;
  menu.style.top = `${pixel.y}px`;
  
  menu.innerHTML = `
    <div class="context-menu-item" data-action="set-origin">
      <span class="icon">🟢</span>
      <span>设为起点</span>
    </div>
    <div class="context-menu-item" data-action="set-destination">
      <span class="icon">🔴</span>
      <span>设为终点</span>
    </div>
    <div class="context-menu-item" data-action="clear">
      <span class="icon">🗑️</span>
      <span>清除起终点</span>
    </div>
  `;

  // 绑定点击事件
  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      
      switch (action) {
        case 'set-origin':
          window.setOrigin(lng, lat);
          if (window.appState.mapViewer) {
            window.appState.mapViewer.addOriginMarker(lng, lat);
          }
          break;
        case 'set-destination':
          window.setDestination(lng, lat);
          if (window.appState.mapViewer) {
            window.appState.mapViewer.addDestinationMarker(lng, lat);
          }
          break;
        case 'clear':
          window.clearRoutePoints();
          if (window.appState.mapViewer) {
            window.appState.mapViewer.clearRouteMarkers();
          }
          break;
      }
      
      menu.remove();
    });
  });

  // 添加到页面
  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 0);
}

// 启动应用
initApp().catch(console.error);

export { updateRouteDisplay, showContextMenu };