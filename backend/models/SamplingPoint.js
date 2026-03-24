const mongoose = require('mongoose');

/**
 * 采样点数据模型
 * 用于存储视障语义地图的空间采样点信息
 * 包含坐标、场景描述、8方位图片等数据
 */
const samplingPointSchema = new mongoose.Schema({
  // 采样点唯一标识符
  point_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // 地理坐标（GeoJSON Point 格式）
  // 用于 MongoDB $nearSphere 空间查询
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          // 验证坐标数组长度为 2
          return Array.isArray(v) && v.length === 2;
        },
        message: 'Coordinates must be an array of [longitude, latitude]'
      }
    }
  },

  // 场景描述（自然语言描述，用于 LLM 上下文）
  scene_description: {
    type: String,
    default: ''
  },

  // 8个方位的图片路径
  // N: 北, NE: 东北, E: 东, SE: 东南
  // S: 南, SW: 西南, W: 西, NW: 西北
  images: {
    N: { type: String, default: null },
    NE: { type: String, default: null },
    E: { type: String, default: null },
    SE: { type: String, default: null },
    S: { type: String, default: null },
    SW: { type: String, default: null },
    W: { type: String, default: null },
    NW: { type: String, default: null }
  },

  // 数据同步状态
  status: {
    type: String,
    enum: ['pending', 'uploading', 'synced'],
    default: 'pending'
  },

  // 创建和更新时间戳
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 为 GeoJSON 坐标建立 2dsphere 索引
// 这是进行 $nearSphere 空间查询的必要条件
samplingPointSchema.index({ coordinates: '2dsphere' });

// 更新时间戳中间件
samplingPointSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 创建模型
const SamplingPoint = mongoose.model('SamplingPoint', samplingPointSchema);

module.exports = SamplingPoint;