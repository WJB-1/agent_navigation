const SamplingPoint = require('../models/SamplingPoint');

/**
 * CorSight 空间查询服务
 * 封装 MongoDB 空间查询逻辑，为 Agent 层提供数据支持
 */

/**
 * 查询指定位置附近的采样点
 * 使用 MongoDB $nearSphere 进行球面距离计算
 * 
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @param {number} radius - 搜索半径（单位：米），默认 50 米
 * @returns {Promise<Array>} 返回附近采样点数组，包含距离信息
 */
async function getNearbyPoints(lat, lon, radius = 50) {
  try {
    // 验证输入参数
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    if (radius <= 0) {
      throw new Error('Radius must be positive');
    }

    // 使用 $nearSphere 查询附近的点
    const points = await SamplingPoint.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat] // GeoJSON 格式: [longitude, latitude]
          },
          $maxDistance: radius // 单位：米
        }
      }
    });

    // 计算每个点的距离并格式化输出
    const formattedPoints = points.map(point => {
      // 将 Mongoose 文档转换为普通对象
      const pointObj = point.toObject();
      
      // 计算距离（使用球面距离公式）
      const distance = calculateDistance(
        lat, 
        lon, 
        pointObj.coordinates.coordinates[1], // latitude
        pointObj.coordinates.coordinates[0]  // longitude
      );

      return {
        point_id: pointObj.point_id,
        location: {
          latitude: pointObj.coordinates.coordinates[1],
          longitude: pointObj.coordinates.coordinates[0]
        },
        scene_description: pointObj.scene_description,
        images: pointObj.images,
        distance_meters: Math.round(distance)
      };
    });

    return formattedPoints;

  } catch (error) {
    console.error('Error in getNearbyPoints:', error.message);
    throw error;
  }
}

/**
 * 根据 point_id 获取单个采样点详情
 * 
 * @param {string} pointId - 采样点唯一标识
 * @returns {Promise<Object|null>} 采样点详情或 null
 */
async function getPointById(pointId) {
  try {
    const point = await SamplingPoint.findOne({ point_id: pointId });
    
    if (!point) {
      return null;
    }

    const pointObj = point.toObject();
    
    return {
      point_id: pointObj.point_id,
      location: {
        latitude: pointObj.coordinates.coordinates[1],
        longitude: pointObj.coordinates.coordinates[0]
      },
      scene_description: pointObj.scene_description,
      images: pointObj.images,
      status: pointObj.status,
      created_at: pointObj.created_at,
      updated_at: pointObj.updated_at
    };

  } catch (error) {
    console.error('Error in getPointById:', error.message);
    throw error;
  }
}

/**
 * 创建新的采样点
 * 
 * @param {Object} pointData - 采样点数据
 * @returns {Promise<Object>} 创建的采样点
 */
async function createPoint(pointData) {
  try {
    const point = new SamplingPoint(pointData);
    await point.save();
    return point.toObject();
  } catch (error) {
    console.error('Error in createPoint:', error.message);
    throw error;
  }
}

/**
 * 使用 Haversine 公式计算两点间的球面距离
 * 
 * @param {number} lat1 - 点1纬度
 * @param {number} lon1 - 点1经度
 * @param {number} lat2 - 点2纬度
 * @param {number} lon2 - 点2经度
 * @returns {number} 距离（单位：米）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = {
  getNearbyPoints,
  getPointById,
  createPoint
};