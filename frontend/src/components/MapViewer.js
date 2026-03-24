/**
 * 地图查看器组件
 * 负责高德地图初始化、渲染和交互
 */

import { getNearbyPoints } from '../services/api.js';

export class MapViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.map = null;
    this.markers = [];
    this.currentCenter = { lng: 116.397428, lat: 39.90923 }; // 北京默认中心
    this.onMapMoveEnd = null; // 地图移动结束回调
    this.onMarkerClick = null; // 标记点击回调
    this.onContextMenu = null; // 右键菜单回调
    
    this.init();
  }

  /**
   * 初始化地图
   */
  async init() {
    // 检查 JSAPI Loader 是否加载
    if (typeof AMapLoader === 'undefined') {
      console.error('❌ 高德地图 Loader 未加载');
      this.showError('高德地图 Loader 未加载，请检查网络连接');
      return;
    }

    try {
      // 使用 JSAPI Loader 加载地图和插件
      const AMap = await AMapLoader.load({
        key: '0beb99f14b04f13a734c81c032b9a8f1',
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geolocation', 'AMap.Walking']
      });

      // 保存 AMap 到全局（供其他方法使用）
      window.AMap = AMap;

      // 初始化地图
      this.map = new AMap.Map(this.container, {
        zoom: 15,
        center: [this.currentCenter.lng, this.currentCenter.lat],
        viewMode: '2D',
        resizeEnable: true,
        mapStyle: 'amap://styles/normal'
      });

      // 添加地图控件
      this.addControls();

      // 绑定事件
      this.bindEvents();

      console.log('✅ 地图初始化成功');
      
      // 触发首次数据加载
      this.loadNearbyPoints();

    } catch (error) {
      console.error('❌ 地图初始化失败:', error);
      this.showError('地图初始化失败: ' + error.message);
    }
  }

  /**
   * 添加地图控件
   */
  addControls() {
    // 添加缩放控件
    this.map.addControl(new AMap.Scale());
    
    // 添加工具条
    this.map.addControl(new AMap.ToolBar({
      position: 'RB'
    }));

    // 添加定位控件
    this.map.addControl(new AMap.Geolocation({
      showButton: true,
      buttonPosition: 'LB',
      buttonOffset: new AMap.Pixel(10, 20),
      showMarker: true,
      showCircle: true,
      circleOptions: {
        strokeColor: '#4a90d9',
        strokeWeight: 2,
        fillColor: '#4a90d9',
        fillOpacity: 0.2
      }
    }));
  }

  /**
   * 绑定地图事件
   */
  bindEvents() {
    // 地图移动结束事件
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.currentCenter = {
        lng: center.lng,
        lat: center.lat
      };
      
      console.log('🗺️  地图中心变化:', this.currentCenter);
      
      // 加载附近采样点
      this.loadNearbyPoints();
      
      // 触发回调
      if (this.onMapMoveEnd) {
        this.onMapMoveEnd(this.currentCenter);
      }
    });

    // 地图缩放结束事件
    this.map.on('zoomend', () => {
      console.log('🔍 地图缩放级别:', this.map.getZoom());
    });

    // 右键菜单事件
    this.map.on('rightclick', (e) => {
      const lnglat = e.lnglat;
      console.log('🖱️  地图右键点击:', lnglat);
      
      if (this.onContextMenu) {
        this.onContextMenu(lnglat.lng, lnglat.lat, e.pixel);
      }
    });
  }

  /**
   * 加载附近采样点
   */
  async loadNearbyPoints() {
    try {
      const response = await getNearbyPoints(
        this.currentCenter.lat,
        this.currentCenter.lng,
        1000 // 1km 半径
      );

      const points = response.data.points || [];
      console.log(`📍 加载到 ${points.length} 个采样点`);

      // 清除旧标记
      this.clearMarkers();

      // 添加新标记
      points.forEach(point => {
        this.addPointMarker(point);
      });

    } catch (error) {
      console.error('❌ 加载采样点失败:', error);
    }
  }

  /**
   * 添加采样点标记
   */
  addPointMarker(point) {
    const { location, point_id, scene_description } = point;
    
    // 创建自定义标记内容
    const markerContent = document.createElement('div');
    markerContent.className = 'poi-marker';
    markerContent.innerHTML = `
      <div class="poi-icon">📸</div>
      <div class="poi-label">街景点</div>
    `;

    // 创建标记
    const marker = new AMap.Marker({
      position: [location.longitude, location.latitude],
      content: markerContent,
      offset: new AMap.Pixel(-20, -40),
      extData: point // 存储完整数据
    });

    // 点击事件
    marker.on('click', () => {
      console.log('📍 点击采样点:', point_id);
      if (this.onMarkerClick) {
        this.onMarkerClick(point);
      }
    });

    // 鼠标悬停提示
    marker.on('mouseover', () => {
      markerContent.style.transform = 'scale(1.1)';
    });

    marker.on('mouseout', () => {
      markerContent.style.transform = 'scale(1)';
    });

    // 添加到地图
    marker.setMap(this.map);
    this.markers.push(marker);
  }

  /**
   * 清除所有标记
   */
  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  /**
   * 添加起点标记
   */
  addOriginMarker(lng, lat) {
    // 移除已有的起点标记
    if (this.originMarker) {
      this.originMarker.setMap(null);
    }

    const markerContent = document.createElement('div');
    markerContent.className = 'route-marker origin';
    markerContent.innerHTML = `
      <div class="marker-pin">
        <span class="marker-icon">🟢</span>
        <span class="marker-text">起点</span>
      </div>
    `;

    this.originMarker = new AMap.Marker({
      position: [lng, lat],
      content: markerContent,
      offset: new AMap.Pixel(-30, -50),
      animation: 'AMAP_ANIMATION_DROP'
    });

    this.originMarker.setMap(this.map);
  }

  /**
   * 添加终点标记
   */
  addDestinationMarker(lng, lat) {
    // 移除已有的终点标记
    if (this.destinationMarker) {
      this.destinationMarker.setMap(null);
    }

    const markerContent = document.createElement('div');
    markerContent.className = 'route-marker destination';
    markerContent.innerHTML = `
      <div class="marker-pin">
        <span class="marker-icon">🔴</span>
        <span class="marker-text">终点</span>
      </div>
    `;

    this.destinationMarker = new AMap.Marker({
      position: [lng, lat],
      content: markerContent,
      offset: new AMap.Pixel(-30, -50),
      animation: 'AMAP_ANIMATION_DROP'
    });

    this.destinationMarker.setMap(this.map);
  }

  /**
   * 清除路线标记
   */
  clearRouteMarkers() {
    if (this.originMarker) {
      this.originMarker.setMap(null);
      this.originMarker = null;
    }
    if (this.destinationMarker) {
      this.destinationMarker.setMap(null);
      this.destinationMarker = null;
    }
  }

  /**
   * 设置地图中心
   */
  setCenter(lng, lat) {
    this.map.setCenter([lng, lat]);
  }

  /**
   * 获取地图中心
   */
  getCenter() {
    const center = this.map.getCenter();
    return {
      lng: center.lng,
      lat: center.lat
    };
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="map-error">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
      </div>
    `;
  }

  /**
   * 销毁地图
   */
  destroy() {
    this.clearMarkers();
    this.clearRouteMarkers();
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  }
}

export default MapViewer;