/**
 * 防范式提示词库
 * 
 * 模块 4.1：提示词工程 - 语言重构防线 (Language Optimizer Agent)
 * 
 * 参考文档：
 * - 导航路线行前语音预览POC方案.md
 * 
 * 本模块施加最严厉的防范式约束，强制 LLM 生成标准的三段式盲人导航文本
 */

/**
 * 获取系统提示词（System Prompt）
 * 这是全局元指令，定义了 LLM 的角色和绝对约束法则
 * 
 * @returns {string} 系统提示词
 */
function getSystemPrompt() {
    return `你现在不再是一个普通的聊天助手，你是一位世界顶级的"视障定向行走（Orientation and Mobility, O&M）专家"和"无障碍导航语音控制中心"。你的唯一任务，是将高度结构化的路线空间数据，转化为供视障人士（包括依赖地表触觉的盲杖使用者与依赖结构指令的导盲犬使用者）在安全出门前听取的"路线心理沙盘推演"战略级语音文案。

【核心目标】
基于系统提供给你的 JSON 格式中间路线数据，生成一段极端克制、机械般精准、仅包含绝对必要行动指令与严重风险警告的行前语音预览文本。

【绝对约束法则，违反任何一条将导致系统崩溃与严重事故】

1. 【极简与克制 - 惜字如金原则】
绝对禁止添加任何环境氛围渲染、毫无意义的视觉特征描述（如任何形式的颜色、招牌文字、花草树木、建筑外观）。绝对禁止使用"您将会看到"、"注意您的右手边有"、"美丽的风景"等充满视觉偏见的词汇。输出的每个汉字都必须直接关乎用户的物理安全与下一步行动。坚决禁止生成诸如"你好"、"祝您一路平安"、"请注意脚下安全"等毫无信息熵的废话问候语与结束语。

2. 【纯粹的"时钟定位法则"】
在表达相对方向时，绝对禁止使用"向左转/向右拐"、"偏左侧"、"东南西北"等模糊或依赖绝对罗盘的方位词。必须且只能使用"X点钟方向"来引导转向（例如：向2点钟方向进入路口、保持12点钟方向直行）。请时刻铭记：12点钟方向永远代表用户当前的身体正前方坐标轴。

3. 【聚焦空间拓扑突变与风险节点】
你的播报无需关注平坦、无变化的直线步行区域。你必须将火力集中于那些会导致空间形态剧变的节点（如：向上/向下的台阶、天桥、地下通道入口、红绿灯路口、突然消失的盲道）。对于平滑的路段，只需概括一段长距离（如：保持12点钟方向直行300米即可）。

4. 【最后50米的高保真触觉提示 - 生死攸关】
传统导航在最后50米失效。你必须将最后一段路程单列为最重要的一段，着重渲染其物理触觉边界（例如"使用盲杖沿右侧墙面追踪"、"寻找左侧金属栅栏边缘"），因为这是视障群体发生迷失和焦虑的高危区域。

5. 【拒绝实时避障假象的陈述语气】
请牢记用户此时正坐在家中的沙发上听取这段内容，这是"出门前的战略推演"。你必须使用客观、陈述性、推演性的全局语气（例如"这段路程全程将遇到两个主要风险点"），绝对不要使用仿佛用户正走在马路上的实时紧急命令语气（例如"现在请立刻向右拐"、"小心你前面的台阶"）。

【强制输出结构规范】
你生成的回复必须严格按照以下三个层次输出，直接输出正文自然段，不允许携带任何标题（如"全局概览："、"节点一："等字眼）：

【段落1 - 宏观全局概览】
用一句话说明总距离，以及途中总计需要跨越几个关键复杂节点。

【段落2 - 关键节点时序拆解】
按照路线发展顺序逐一播报，句式必须被锁定为：<距离> + <时钟方位> + <具体物理空间突变特征/风险>。

【段落3 - 最后50米盲区策略】
专门针对到达终点前的微观环境进行精细化盲区应对说明。

【反面示例 - 严禁模仿】
以下是一段典型的灾难性输出，包含啰嗦、视觉依赖、方位感涣散等严重错误：
"亲爱的用户你好，这段路线总共有700米长哦。你出门后首先往前走100米，然后请注意，你的左前方也就是偏左一点点的地方有一座天桥。天桥旁边有一家蓝色的便利店，你可以参考一下。小心走过两段很长的台阶。下桥后再走大概500米，你会看到一个很大的红绿灯路口，这里车很多，没有盲道，请千万注意安全。过了马路后向右拐，进入一个小区，大概再走50米就到了，终点就在你的右手边。祝你出行顺利！"

错误分析：
- 情感认知噪音污染："亲爱的用户你好"、"祝你出行顺利"等社交词汇
- 视觉特征谬误："蓝色的便利店"、"看到很大的红绿灯"对全盲用户毫无意义
- 非标准方位体系："左前方"、"偏左一点点"、"向右拐"缺乏精确性
- 主观模糊量度："很长的台阶"、"很大的路口"缺乏客观标准

【正面示例 - 必须完美复刻】
以下是一段极致完美的符合O&M原则的推演播报：
"全程700米，行程包含两处关键空间突变点与一段无导航覆盖盲区。

12点钟方向直行100米后，向11点钟方向登上天桥，需跨越两段连续向上台阶。

下桥后保持12点钟方向直行500米抵达路口，该路口无盲道铺设且存在机非混行。

穿越路口后，向2点钟方向切入小区内部。最后50米缺乏导航覆盖，需利用盲杖沿右侧实体砖墙直行寻路，到达终点。"

完美特性：
- 极致信噪比：剔除一切多余寒暄、形容词与环境渲染
- 严丝合缝的时钟法则：全篇精确使用"12点钟方向"、"11点钟方向"、"2点钟方向"
- 宏观心理沙盘提前建构：开篇即交付"包含两处突变点和一段盲区"
- 盲区高保真触觉指导："沿右侧实体砖墙直行"融入Trailing寻路技术`;
}

/**
 * 获取用户提示词（User Prompt）
 * 将 IR JSON 数据格式化为 LLM 可理解的输入
 * 
 * @param {Object} irData - Phase 3 生成的中间表示数据
 * @returns {string} 用户提示词
 */
function getUserPrompt(irData) {
    if (!irData || !irData.key_nodes) {
        return '错误：缺少路线数据';
    }

    const summary = irData.route_summary || {};
    const nodes = irData.key_nodes || [];

    // 构建节点数据摘要
    const nodesDescription = nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const hazards = node.hazards || node.perception_data?.hazards || [];

        return {
            index: node.node_index || index + 1,
            distance: node.distance_from_start,
            action: node.action,
            clock_direction: node.clock_direction,
            instruction: node.instruction,
            road: node.road,
            hazards: hazards,
            is_destination: isLast || node.action?.includes('到达')
        };
    });

    // 判断是否有最后50米盲区描述
    const hasLast50mInfo = nodes.some(n =>
        n.instruction?.includes('50米') ||
        n.action?.includes('盲区') ||
        n.perception_data?.final_approach
    );

    return `请解析以下这段路线提取数据，严格遵循你的核心原则，为其生成行前语音预览播报词。

【路线概要】
- 总距离：${summary.total_distance || '未知'}
- 预计时间：${summary.duration_estimate || '未知'}
- 关键节点数：${nodes.length}个
- 数据压缩率：${summary.compression_ratio || '0%'}

【关键节点序列】
${nodesDescription.map(n => `
节点 ${n.index}:
- 距离起点：${n.distance}
- 动作：${n.action}
- 时钟方位：${n.clock_direction}
- 指令：${n.instruction}
- 道路：${n.road || '未知道路'}
${n.hazards.length > 0 ? `- 风险点：${n.hazards.join('、')}` : ''}
${n.is_destination ? '- 【最后路段/目的地】' : ''}
`).join('\n')}

${hasLast50mInfo ? '【注意】数据中包含最后50米盲区信息，请务必在第三段重点描述。' : ''}

请严格按照系统指令中的三段式结构生成播报词：
1. 宏观全局概览（一句话总结）
2. 关键节点时序拆解（按顺序逐一播报，使用<距离>+<时钟方位>+<物理特征>句式）
3. 最后50米盲区策略（重点描述触觉引导）`;
}

/**
 * 获取 Few-Shot 示例提示词
 * 用于上下文学习，帮助 LLM 更好地理解输出风格
 * 
 * @returns {Array} Few-Shot 示例数组
 */
function getFewShotExamples() {
    return [
        {
            role: 'user',
            content: `路线数据：
{
  "total_distance": "700m",
  "key_nodes": [
    {"distance": "100m", "action": "上天桥", "clock": "11点钟方向", "hazards": ["两段连续向上台阶"]},
    {"distance": "600m", "action": "横过路口", "clock": "12点钟方向", "hazards": ["无盲道", "机非混行"]},
    {"distance": "650m", "action": "到达终点", "clock": "2点钟方向", "hazards": ["无导航覆盖", "需沿墙寻路"]}
  ]
}`
        },
        {
            role: 'assistant',
            content: `全程700米，行程包含两处关键空间突变点与一段无导航覆盖盲区。

12点钟方向直行100米后，向11点钟方向登上天桥，需跨越两段连续向上台阶。

下桥后保持12点钟方向直行500米抵达路口，该路口无盲道铺设且存在机非混行。

穿越路口后，向2点钟方向切入小区内部。最后50米缺乏导航覆盖，需利用盲杖沿右侧实体砖墙直行寻路，到达终点。`
        }
    ];
}

/**
 * 获取完整的对话消息列表
 * 用于调用 LLM API
 * 
 * @param {Object} irData - IR 数据
 * @returns {Array} 消息列表
 */
function getChatMessages(irData) {
    const messages = [
        {
            role: 'system',
            content: getSystemPrompt()
        },
        ...getFewShotExamples(),
        {
            role: 'user',
            content: getUserPrompt(irData)
        }
    ];

    return messages;
}

/**
 * 获取 LLM 调用参数
 * 严格控制 Temperature 和 Top-P 以减少随机性
 * 
 * @returns {Object} LLM 参数
 */
function getLLMParameters() {
    return {
        temperature: 0.1,  // 极低温度，确保输出稳定
        top_p: 0.85,       // 限制采样范围
        max_tokens: 800,   // 足够生成完整播报
        presence_penalty: 0,  // 不惩罚重复（某些关键词需要重复）
        frequency_penalty: 0  // 不惩罚频率
    };
}

/**
 * 后处理：清理 LLM 输出中的禁用词
 * 
 * @param {string} text - LLM 原始输出
 * @returns {string} 清理后的文本
 */
function sanitizeOutput(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // 禁用词表（视觉词汇、废话问候等）
    const forbiddenPatterns = [
        // 视觉词汇
        /看[到见]?/g,
        /颜[色彩]/g,
        /红[色]?/g,
        /蓝[色]?/g,
        /绿[色]?/g,
        /黄[色]?/g,
        /漂亮/g,
        /美丽/g,
        /风景/g,
        /招牌/g,
        /标识/g,

        // 废话问候
        /^你好[，！]?/g,
        /^您好[，！]?/g,
        /祝您[一]?路平安/g,
        /请注意安全/g,
        /请注意脚下/g,
        /祝您旅途愉快/g,

        // 模糊方位
        /左前方/g,
        /右前方/g,
        /左后方/g,
        /右后方/g,
        /偏左/g,
        /偏右/g,
        /向[左右][转拐]/g,  // 纯转向词，不含时钟方位

        // 情感渲染
        /亲爱的/g,
        /请小心/g,
        /千万要注意/g,
        /哦[，！]?/g,
        /呢[，！]?/g,
        /呀[，！]?/g
    ];

    let cleaned = text;

    // 应用正则替换
    forbiddenPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    // 清理多余空白和标点
    cleaned = cleaned
        .replace(/\n{3,}/g, '\n\n')  // 最多两个换行
        .replace(/[，,]{2,}/g, '，')  // 合并重复逗号
        .replace(/[！!]{2,}/g, '！')  // 合并重复感叹号
        .trim();

    return cleaned;
}

/**
 * 验证输出是否符合规范
 * 
 * @param {string} text - 清理后的文本
 * @returns {Object} 验证结果
 */
function validateOutput(text) {
    const checks = {
        hasClockDirection: /\d{1,2}点钟方向/.test(text),
        hasThreeParagraphs: text.split('\n\n').filter(p => p.trim()).length >= 3,
        noVisualWords: !/[颜色红蓝绿黄]|看到|看见/.test(text),
        noGreetings: !/^(你好|您好)/.test(text),
        properEnding: !/(祝您|请小心|注意安全)$/.test(text)
    };

    const passed = Object.values(checks).every(v => v === true);

    return {
        passed,
        checks,
        issues: Object.entries(checks)
            .filter(([_, v]) => v === false)
            .map(([k, _]) => k)
    };
}

module.exports = {
    // 核心提示词函数
    getSystemPrompt,
    getUserPrompt,
    getFewShotExamples,
    getChatMessages,
    getLLMParameters,

    // 后处理函数
    sanitizeOutput,
    validateOutput
};
