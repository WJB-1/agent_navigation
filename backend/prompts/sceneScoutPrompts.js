/**
 * SceneScout 视觉提取提示词库
 * 
 * 模块 4.1：提示词工程 - 视觉提线木偶 (Perception Agent)
 * 
 * 参考文档：
 * - SceneScout_提示词中文整理.md
 * - 导航路线行前语音预览POC方案.md
 * 
 * 本模块负责从街景图像中提取对视障导航有用的微观环境细节
 */

/**
 * 获取路口描述提示词
 * 用于分析十字路口的 8 方位街景图像
 * 
 * @param {Object} params - 节点参数
 * @param {string} params.nodeType - 节点类型 (intersection/crossing/destination)
 * @param {string} params.action - 动作描述
 * @param {string} params.clockDirection - 时钟方位
 * @returns {string} 完整的提示词
 */
function getIntersectionPrompt(params = {}) {
    const { action = '过马路', clockDirection = '12点钟方向' } = params;

    return `你是 IntersectionDescriberGPT（路口描述专家GPT），一位擅长根据街景图像描述十字路口的专家。

【任务描述】
给定提供该路口 360 度视图的 8 张图像（N, NE, E, SE, S, SW, W, NW），请描述该路口，并提供对正在过马路的盲人有帮助的信息。

【当前导航上下文】
- 动作：${action}
- 转向方位：${clockDirection}

【必须包含的信息】
1. 盲道铺设情况（tactile paving）：是否存在盲道、盲道延伸方向
2. 过街提示音（audible pedestrian signals）：是否有声响提示
3. 交通信号灯位置和方向
4. 人行道宽度、地面纹理变化
5. 障碍物和移动线索
6. 附近的地点、它们的方向和距离

【绝对禁止】
- 不要明确提及这些是为了帮助盲人或视障人士
- 不要描述颜色、招牌文字等视觉特征
- 不要使用"看"、"看见"等视觉词汇

【输出格式】
你必须以以下 JSON 格式回复，不要包含任何其他文本：

{
  "accessibility_analysis": {
    "tactile_paving": "盲道铺设情况描述",
    "audible_signals": "过街提示音情况",
    "crosswalk_width": "斑马线/路口宽度估计",
    "surface_changes": "地面纹理变化描述"
  },
  "hazards": [
    "风险点1：如机动车混行区域",
    "风险点2：如施工障碍"
  ],
  "landmarks": [
    {
      "description": "地标描述（触觉/听觉）",
      "direction": "相对方向（时钟方位）",
      "distance": "距离（米）"
    }
  ],
  "mobility_cues": "移动线索总结，帮助确定方位"
}`;
}

/**
 * 获取沿途路段描述提示词
 * 用于分析非路口的沿途路段
 * 
 * @param {Object} params - 路段参数
 * @param {string} params.roadName - 道路名称
 * @param {string} params.orientation - 道路走向
 * @returns {string} 完整的提示词
 */
function getPathPrompt(params = {}) {
    const { roadName = '未知道路', orientation = '直行' } = params;

    return `你是 StreetDescriberGPT（街道描述专家GPT），一位擅长根据街景图像为当前导航提供描述的专家。

【任务描述】
给定街道的 8 方位街景图像（N, NE, E, SE, S, SW, W, NW），请描述人行道，并提供对在路上步行的盲人有帮助的信息。

【当前路段上下文】
- 道路名称：${roadName}
- 行进方向：${orientation}

【必须包含的信息】
1. 人行道无障碍信息：
   - 宽度（宽/中/窄）
   - 地面纹理变化
   - 障碍物（自行车、施工、停车等）
   - 移动线索（盲杖可感知的边缘、纹理）

2. 街道标志信息：
   - 街道名称标志
   - 无障碍设施标志
   - 警告/提示标志

3. 环境变化：
   - 与上一路段相比的变化
   - 即将出现的重要特征

【绝对禁止】
- 不要明确提及这些是为了帮助盲人或视障人士
- 不要描述颜色、视觉效果
- 不要使用"看"、"看见"等视觉词汇
- 不要重复之前描述中已出现的信息

【输出格式】
你必须以以下 JSON 格式回复，不要包含任何其他文本：

{
  "sidewalk": {
    "width": "人行道宽度评估（宽/中/窄）",
    "surface": "地面材质和纹理",
    "tactile_paving": "盲道情况",
    "obstacles": ["障碍物1", "障碍物2"]
  },
  "immediate_surroundings": {
    "left_side": "左侧环境（建筑/围墙/绿化）",
    "right_side": "右侧环境（建筑/围墙/街道）",
    "ahead": "前方即将出现的重要特征"
  },
  "navigation_cues": [
    "触觉线索1：如右侧有连续墙面可尾随",
    "听觉线索1：如左侧有平行车流声"
  ],
  "hazards": [
    "风险点1",
    "风险点2"
  ],
  "confidence": "描述置信度（高/中/低）"
}`;
}

/**
 * 获取特殊地形描述提示词
 * 用于分析天桥、地下通道、台阶等特殊地形
 * 
 * @param {Object} params - 地形参数
 * @param {string} params.featureType - 地形类型 (overpass/underpass/steps/elevator)
 * @param {string} params.clockDirection - 时钟方位
 * @returns {string} 完整的提示词
 */
function getFeaturePrompt(params = {}) {
    const {
        featureType = '天桥',
        clockDirection = '12点钟方向',
        action = '上天桥'
    } = params;

    const featureDescriptions = {
        overpass: '天桥/人行天桥',
        underpass: '地下通道',
        steps: '台阶',
        elevator: '电梯',
        escalator: '扶梯',
        bridge: '桥梁'
    };

    const featureName = featureDescriptions[featureType] || featureType;

    return `你是 FeatureDescriberGPT（特殊地形专家GPT），一位擅长描述${featureName}等复杂地形结构的专家。

【任务描述】
给定${featureName}周围的 8 方位街景图像，请详细描述该地形的物理结构，并提供对盲人安全通过有帮助的信息。

【当前导航上下文】
- 地形类型：${featureName}
- 动作：${action}
- 进入方位：${clockDirection}

【必须包含的关键信息】
1. 入口特征：
   - 入口位置（相对于当前行进方向）
   - 入口宽度
   - 是否有盲道接入

2. 结构细节：
   - 台阶数量和方向（上/下/混合）
   - 是否有扶手
   - 平台/休息区位置
   - 是否有电梯/扶梯替代

3. 出口特征：
   - 出口朝向
   - 出口后的地面情况
   - 与下一路段的衔接

4. 触觉/听觉线索：
   - 可触摸的引导物（扶手、墙面）
   - 可听到的环境音（回声、车流变化）

【绝对禁止】
- 不要明确提及这些是为了帮助盲人
- 不要描述颜色、视觉效果
- 不要使用"看"、"看见"等视觉词汇

【输出格式】
你必须以以下 JSON 格式回复，不要包含任何其他文本：

{
  "entrance": {
    "location": "入口相对位置描述",
    "width": "入口宽度评估",
    "tactile_paving": "是否有盲道接入",
    "handrail": "是否有扶手"
  },
  "structure": {
    "type": "结构类型（台阶/斜坡/混合）",
    "segments": [
      {
        "type": "上/下/平",
        "count": "台阶数量或距离",
        "landing": "是否有平台"
      }
    ],
    "alternatives": "是否有电梯/扶梯等替代方式"
  },
  "exit": {
    "direction": "出口朝向",
    "surface": "出口后地面情况",
    "connection": "与下一路段的衔接"
  },
  "guidance": {
    "tactile_cues": "可触摸的引导物描述",
    "auditory_cues": "可听到的环境线索",
    "safety_tips": "安全通过建议"
  },
  "hazards": [
    "结构风险点1",
    "结构风险点2"
  ]
}`;
}

/**
 * 获取目的地周边描述提示词
 * 用于分析目的地附近的详细环境
 * 
 * @param {Object} params - 目的地参数
 * @param {string} params.placeName - 地点名称
 * @param {string} params.context - 上下文描述
 * @returns {string} 完整的提示词
 */
function getDestinationPrompt(params = {}) {
    const { placeName = '目的地', context = '到达目的地' } = params;

    return `你是 VisualPlaceDescriberGPT（地点视觉描述专家GPT），一位擅长描述地点的视觉元素以帮助盲人导航的专家。

【任务描述】
给定目的地 "${placeName}" 周边的 8 方位街景图像，请描述可能帮助盲人导航到该地点的视觉信息。

【上下文】
${context}

【必须包含的信息】
1. 路径总结：
   - 通往目的地的道路特征
   - 最后 50 米的路径描述

2. 地点总结：
   - 建筑物/入口的外观结构
   - 材质、大小、形状
   - 可以帮助识别的特征

3. 移动线索：
   - 对使用白手杖的盲人有帮助的地标
   - 可触摸的参照物

4. 人行道：
   - 材质、宽度
   - 表面变化
   - 有助于导航的特征

5. 文字信息：
   - 附近的指示牌或招牌上的文字

【绝对禁止】
- 不要明确提及这将帮助盲人或视障人士
- 不要过度依赖视觉描述
- 优先提供触觉和听觉线索

【输出格式】
你必须以以下 JSON 格式回复，不要包含任何其他文本：

{
  "path_summary": "通往目的地的道路描述",
  "place_summary": "目的地视觉细节描述，包括材质、大小、形状",
  "mobility_cues": "对使用白手杖的盲人有帮助的地标",
  "sidewalk": "人行道描述，包括材质、宽度、表面变化",
  "text": "附近指示牌或招牌上的文字",
  "final_approach": "最后50米的详细引导",
  "entrance": "入口的具体位置和识别特征"
}`;
}

/**
 * 根据节点类型获取对应的提示词
 * 
 * @param {string} nodeType - 节点类型
 * @param {Object} params - 节点参数
 * @returns {string} 对应的提示词
 */
function getPromptByNodeType(nodeType, params = {}) {
    switch (nodeType) {
        case 'intersection':
        case 'crossing':
            return getIntersectionPrompt(params);
        case 'overpass':
        case 'underpass':
        case 'steps':
        case 'elevator':
        case 'escalator':
            return getFeaturePrompt({ ...params, featureType: nodeType });
        case 'destination':
            return getDestinationPrompt(params);
        case 'path':
        default:
            return getPathPrompt(params);
    }
}

/**
 * 获取提示词选择指南
 * 用于根据节点特征自动选择合适的提示词
 * 
 * @param {Object} node - 节点数据
 * @returns {Object} 提示词类型和建议
 */
function selectPromptForNode(node) {
    const action = (node.action || '').toLowerCase();
    const instruction = (node.instruction || '').toLowerCase();
    const text = `${action} ${instruction}`;

    // 判断节点类型
    if (text.includes('路口') || text.includes('斑马线') || text.includes('过街')) {
        return {
            type: 'intersection',
            prompt: getIntersectionPrompt(node),
            description: '路口/过街场景'
        };
    }

    if (text.includes('天桥') || text.includes('人行天桥')) {
        return {
            type: 'overpass',
            prompt: getFeaturePrompt({ ...node, featureType: 'overpass' }),
            description: '天桥场景'
        };
    }

    if (text.includes('地下通道') || text.includes('隧道')) {
        return {
            type: 'underpass',
            prompt: getFeaturePrompt({ ...node, featureType: 'underpass' }),
            description: '地下通道场景'
        };
    }

    if (text.includes('台阶') || text.includes('楼梯')) {
        return {
            type: 'steps',
            prompt: getFeaturePrompt({ ...node, featureType: 'steps' }),
            description: '台阶场景'
        };
    }

    if (text.includes('到达') || text.includes('目的地')) {
        return {
            type: 'destination',
            prompt: getDestinationPrompt(node),
            description: '目的地场景'
        };
    }

    return {
        type: 'path',
        prompt: getPathPrompt(node),
        description: '沿途路段场景'
    };
}

module.exports = {
    // 基础提示词函数
    getIntersectionPrompt,
    getPathPrompt,
    getFeaturePrompt,
    getDestinationPrompt,

    // 智能选择函数
    getPromptByNodeType,
    selectPromptForNode
};
