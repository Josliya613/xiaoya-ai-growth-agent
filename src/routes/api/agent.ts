import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const systemPrompts: Record<string, string> = {
  "Audience Agent": "你是小红书用户研究负责人。只负责受众、需求、账号资产和内容缺口，不生成标题或正文。根据用户提供的公开账号链接或账号描述完成诊断；区分事实、用户输入与合理推断，不得虚构粉丝数、互动量或私密数据。",
  "Trend Agent": "你是小红书内容趋势策略师。只负责趋势信号、时效窗口、竞争拥挤度与账号适配度，不写完整笔记。不要把模型常识冒充实时热榜；无法确认实时数据时必须标注为策略推断。",
  "Content Planner": "你是小红书内容主编。把受众与趋势信号编排为 7 天内容组合，明确每篇内容在拉新、信任、收藏、互动中的任务。不得写成 7 个近义标题。",
  "Writer Agent": "你是小红书资深主笔。只负责把一个选题写成可发布草稿，保持真实、克制、有场景证据，不虚构个人经历和数据。输出标题、Hook、正文结构、封面和互动设计。",
  "Evaluator Agent": "你是独立内容评审，不负责写稿。严格基于用户价值、情绪驱动力、信息密度、互动潜力、平台适配五个维度评分，每维满分 20；每个分数必须给出证据、扣分原因和可执行建议，总分必须等于五维之和。",
  "Optimizer Agent": "你是内容优化编辑。只基于评估结果做定向修改，展示修改前后、对应维度、理由和停止条件；不得为了提高分数虚构经历、夸大收益或制造误导。",
};

const agentSchemas: Record<string, string> = {
  "Audience Agent": `严格输出 JSON：
{"type":"audience","headline":"诊断结论","positioning":{"current":"当前定位","recommended":"建议定位","reason":"依据"},"personas":[{"name":"人群名称","profile":"年龄/阶段/场景","pain":"核心痛点","motivation":"关注动机","contentNeed":"内容需求"}],"contentAssets":["可利用资产"],"gaps":["内容断层"],"opportunities":[{"opportunity":"增长机会","why":"原因","priority":"P0"}],"nextContext":"传递给下游 Agent 的受众结论"}
personas 为 2-3 项，opportunities 为 3 项。`,
  "Trend Agent": `严格输出 JSON：
{"type":"trend","headline":"趋势判断","dataNotice":"数据范围说明","trends":[{"topic":"趋势主题","signal":"上升信号或策略推断","window":"时效窗口","competition":"低/中/高","fit":0,"angle":"账号可执行角度"}],"avoid":["不建议追逐的方向及原因"],"nextContext":"传递给 Planner 的趋势结论"}
trends 为 4 项，fit 为 0-100；无法验证实时热度时 dataNotice 必须明确写“策略推断，非平台实时热榜”。`,
  "Writer Agent": `严格输出 JSON：
{"type":"writer","headline":"创作结论","titles":[{"style":"情绪型","text":"标题"},{"style":"干货型","text":"标题"},{"style":"故事型","text":"标题"},{"style":"争议型","text":"标题"}],"hook":"黄金3秒 Hook","structure":[{"section":"段落作用","content":"该段写什么"}],"body":"完整小红书正文，使用换行分段","cover":{"headline":"封面主标题","visual":"视觉建议","color":"配色"},"tags":["标签"],"interaction":"评论引导","truthCheck":["需要用户补充或确认的真实信息"]}`,
  "Evaluator Agent": `严格输出 JSON：
{"type":"evaluator","headline":"评估结论","totalScore":0,"dimensions":[{"key":"userValue","name":"用户价值","score":0,"evidence":"内容中的具体证据","deduction":"扣分原因","suggestion":"针对性修改"},{"key":"emotion","name":"情绪驱动力","score":0,"evidence":"具体证据","deduction":"扣分原因","suggestion":"针对性修改"},{"key":"density","name":"信息密度","score":0,"evidence":"具体证据","deduction":"扣分原因","suggestion":"针对性修改"},{"key":"interaction","name":"互动潜力","score":0,"evidence":"具体证据","deduction":"扣分原因","suggestion":"针对性修改"},{"key":"platformFit","name":"平台适配","score":0,"evidence":"具体证据","deduction":"扣分原因","suggestion":"针对性修改"}],"verdict":"是否达到发布标准","priorityActions":["按优先级排序的 3 条优化动作"],"risk":"真实性或平台风险"}
每维 0-20，totalScore 必须等于五维分数之和。不能只给泛泛结论。`,
  "Optimizer Agent": `严格输出 JSON：
{"type":"optimizer","headline":"优化结果","beforeScore":0,"afterScore":0,"changes":[{"dimension":"对应评分维度","before":"修改前","after":"修改后","reason":"为什么能提升该维度"}],"optimized":{"title":"优化标题","hook":"优化 Hook","body":"优化正文","interaction":"优化互动引导"},"stopCondition":"停止迭代条件","riskControl":["真实性与夸张风险控制"],"nextTest":"发布后要验证的指标"}`,
};

const plannerSchema = `你必须针对用户输入的账号方向生成完全相关的 7 天计划，不得沿用示例行业。严格输出 JSON：
{
  "strategy": {
    "positioning": "账号定位",
    "audience": "目标用户",
    "mix": "内容配比",
    "goal": "增长目标"
  },
  "plans": [{
    "day": 1,
    "theme": "内容主题",
    "angle": "选题角度",
    "category": "内容类型",
    "hook": "黄金3秒Hook",
    "titles": ["标题1","标题2","标题3"],
    "structure": ["结构1","结构2","结构3","结构4"],
    "cover": "封面建议",
    "interaction": "互动引导",
    "time": "周一 20:00",
    "score": 85
  }]
}
plans 必须恰好 7 项，day 为 1 到 7，所有内容必须贴合用户输入。`;

const agentFallbacks: Record<string, unknown> = {
  "Audience Agent": {
    type: "audience", headline: "受众诊断完成：优先服务有明确目标但缺少路径的人群",
    positioning: { current: "主题方向明确，但人群与价值承诺仍偏宽", recommended: "聚焦一个阶段、一类任务和一种可验证结果", reason: "越具体的使用场景越容易形成关注理由" },
    personas: [
      { name: "入门探索者", profile: "刚开始了解该方向", pain: "信息多但缺少路径", motivation: "降低试错成本", contentNeed: "入门路线、避坑清单" },
      { name: "行动受阻者", profile: "已经尝试但进展缓慢", pain: "不知道问题出在哪", motivation: "获得诊断与反馈", contentNeed: "案例拆解、前后对比" },
    ],
    contentAssets: ["真实经历", "过程记录", "可复用方法"], gaps: ["缺少用户阶段区分", "缺少连续系列"],
    opportunities: [
      { opportunity: "入门路线系列", why: "解决启动焦虑", priority: "P0" },
      { opportunity: "失败复盘系列", why: "增强可信度", priority: "P1" },
      { opportunity: "互动诊断系列", why: "收集真实问题", priority: "P1" },
    ],
    nextContext: "优先面向入门与行动受阻用户，内容要提供路径、案例和反馈。",
  },
  "Trend Agent": {
    type: "trend", headline: "趋势策略完成：优先选择长期需求与可验证的新角度",
    dataNotice: "策略推断，非平台实时热榜",
    trends: [
      { topic: "真实过程复盘", signal: "用户更关注过程证据", window: "长期", competition: "中", fit: 92, angle: "展示决策、失败与修改" },
      { topic: "工具横向实测", signal: "可形成信息增益", window: "新品发布后 48 小时", competition: "高", fit: 84, angle: "同一任务、同一标准横评" },
      { topic: "可复制模板", signal: "收藏动机稳定", window: "长期", competition: "中", fit: 88, angle: "模板加适用边界" },
      { topic: "一人团队 Workflow", signal: "效率话题持续", window: "2-4 周", competition: "中", fit: 90, angle: "公开上下游产物而非只晒结果" },
    ],
    avoid: ["无账号关联的泛热点：流量可能高但无法沉淀定位"], nextContext: "优先真实复盘、同任务横评与可复制模板。",
  },
  "Writer Agent": {
    type: "writer", headline: "初稿完成：用具体场景代替模板腔",
    titles: [
      { style: "情绪型", text: "我终于不再靠灵感做内容了" }, { style: "干货型", text: "一套 6 Agent 内容工作流，拆给你看" },
      { style: "故事型", text: "从写不出来，到拥有一支 AI 内容团队" }, { style: "争议型", text: "AI 写作最没价值的功能，就是直接写正文" },
    ],
    hook: "过去我以为内容做不出来，是因为不会写；后来发现，真正缺的是写之前的决策。",
    structure: [{ section: "冲突", content: "过去的低效方式" }, { section: "过程", content: "六个 Agent 如何协作" }, { section: "证据", content: "展示中间产物" }, { section: "行动", content: "给读者可执行方法" }],
    body: "过去我做内容，总是在空白文档前等灵感。\n\n后来我把运营团队的工作拆成了 6 个角色：先理解用户，再判断趋势，然后规划、写作、评估和优化。\n\n真正有价值的不是 AI 帮我写了一篇，而是每一步都留下了可以检查和修改的中间结果。\n\n如果你也在做内容，先别急着写正文。先回答：这篇为谁解决什么问题？",
    cover: { headline: "6 个 Agent，组成我的内容团队", visual: "横向流程节点 + 真实工作台截图", color: "奶油白 + 珊瑚红" },
    tags: ["AI工作流", "内容运营", "小红书运营"], interaction: "你最希望 AI 接手内容流程中的哪一步？", truthCheck: ["补充真实创作耗时", "确认是否有可公开的失败案例"],
  },
  "Evaluator Agent": {
    type: "evaluator", headline: "五维评估完成：信息价值强，情绪与互动仍有提升空间", totalScore: 85,
    dimensions: [
      { key: "userValue", name: "用户价值", score: 19, evidence: "提供六节点方法与行动问题", deduction: "缺少可下载模板", suggestion: "增加一份最小工作流清单" },
      { key: "emotion", name: "情绪驱动力", score: 15, evidence: "从等灵感到流程化存在反差", deduction: "失败代价不具体", suggestion: "补充一次真实失败场景" },
      { key: "density", name: "信息密度", score: 18, evidence: "每段承担不同功能", deduction: "Agent 分工仍可更具体", suggestion: "用一句话说明每个节点产物" },
      { key: "interaction", name: "互动潜力", score: 16, evidence: "结尾问题门槛较低", deduction: "回复价值承诺不足", suggestion: "承诺按最高票拆解一个节点" },
      { key: "platformFit", name: "平台适配", score: 17, evidence: "标题简短、段落清晰", deduction: "封面关键词偏多", suggestion: "封面只保留 8-12 个字" },
    ],
    verdict: "修改情绪证据和互动承诺后可发布", priorityActions: ["补真实失败细节", "明确六节点产物", "强化评论后的回馈"], risk: "不得虚构耗时或效率提升数字",
  },
  "Optimizer Agent": {
    type: "optimizer", headline: "定向优化完成：不是重写，而是逐维修复", beforeScore: 85, afterScore: 93,
    changes: [
      { dimension: "情绪驱动力", before: "泛泛描述等灵感", after: "加入一次写到凌晨仍推翻的真实场景", reason: "用具体损失建立张力" },
      { dimension: "互动潜力", before: "开放式提问", after: "按最高票公开拆解一个 Agent", reason: "让评论获得明确回报" },
      { dimension: "平台适配", before: "封面信息过多", after: "封面只保留「6 个 Agent 内容团队」", reason: "降低浏览理解成本" },
    ],
    optimized: { title: "AI 写作最没价值的功能，就是直接写正文", hook: "我曾经写到凌晨两点，第二天还是把整篇删了。问题不是文笔，而是写之前没有做决策。", body: "优化版正文将围绕真实失败、六节点产物和可执行清单展开。", interaction: "评论区选一个 Agent，我按最高票公开完整输入输出。" },
    stopCondition: "总分不低于 92，且任一维度不低于 16", riskControl: ["不虚构经历", "不夸大效率"], nextTest: "发布后观察 3 秒停留、收藏率与有效评论率",
  },
};

const plannerFallback = (input: string) => {
  const topic = input
    .replace(/^.*?账号方向[：:]\s*/, "")
    .replace(/[。；;].*$/s, "")
    .trim()
    .slice(0, 48) || "个人成长";
  const ideas = [
    ["定位破冰", `${topic}新人最容易忽略的 3 件事`, "反常识清单，快速建立专业感"],
    ["真实体验", `我体验${topic}一周后，最意外的发现`, "用具体场景和细节建立信任"],
    ["实用攻略", `${topic}入门路线：从 0 到能独立上手`, "可收藏的步骤型内容"],
    ["避坑复盘", `做${topic}之前，我希望有人提醒我的坑`, "失败细节带动评论讨论"],
    ["工具清单", `${topic}高频使用的 5 个工具与模板`, "工具对比提升收藏率"],
    ["观点讨论", `${topic}真的适合所有人吗？`, "用边界条件制造高质量互动"],
    ["系列收口", `我的${topic}7天实践复盘：哪些值得继续`, "用数据与下一期预告沉淀关注"],
  ];
  const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const colors = ["定位", "故事", "干货", "复盘", "清单", "观点", "总结"];
  return {
    strategy: {
      positioning: `围绕「${topic}」输出真实体验、实用攻略与可验证复盘`,
      audience: `对「${topic}」感兴趣、正在入门或希望提升效率的用户`,
      mix: "40% 实用干货 · 30% 真实体验 · 20% 观点互动 · 10% 系列复盘",
      goal: "先验证收藏率与评论问题，再迭代下一轮选题",
    },
    plans: ideas.map(([category, theme, angle], index) => ({
      day: index + 1,
      category: colors[index],
      theme,
      angle,
      hook: index === 0
        ? `如果你刚开始了解${topic}，先别急着照搬别人的方法。`
        : `关于${topic}，这件事和我一开始想的完全不一样。`,
      titles: [
        theme,
        `${topic}新手必看｜第 ${index + 1} 天真实记录`,
        `别再盲目做${topic}了：先看这篇`,
      ],
      structure: ["用户痛点", "真实场景", "方法拆解", "行动建议"],
      cover: `奶油白底色，突出「${topic}」与数字关键词，搭配真实场景图片`,
      interaction: `你在${topic}上最想解决什么问题？评论区告诉我`,
      time: `${weekdays[index]} 20:00`,
      score: 82 + index,
    })),
  };
};

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { agent, input } = (await request.json()) as { agent?: string; input?: string };
        if (!agent || !input) return Response.json({ error: "Missing input" }, { status: 400 });
        let modelInput = String(input).slice(0, 8000);

        if (agent === "Audience Agent") {
          try {
            const url = new URL(String(input));
            const allowed = url.hostname === "xiaohongshu.com" || url.hostname.endsWith(".xiaohongshu.com") || url.hostname === "xhslink.com";
            if (!allowed || url.protocol !== "https:") throw new Error("unsupported host");
            const page = await fetch(url.toString(), {
              redirect: "follow",
              headers: { "User-Agent": "Mozilla/5.0 (compatible; XiaoyaAI/1.0; public-profile-analysis)" },
              signal: AbortSignal.timeout(6000),
            });
            if (page.ok) {
              const html = await page.text();
              const visible = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 12000);
              modelInput = `用户提交的账号链接：${url.toString()}\n公开页面可见文本：${visible}`;
            }
          } catch {
            modelInput = `公开页面当前无法直接读取。请只基于链接和用户目标给出分析框架，不得虚构粉丝数或历史表现：${String(input).slice(0, 1000)}`;
          }
        }

        const workerEnv = env as unknown as {
          DEEPSEEK_API_KEY?: string;
          DEEPSEEK_BASE_URL?: string;
          DEEPSEEK_MODEL?: string;
        };
        if (!workerEnv.DEEPSEEK_API_KEY) {
          return Response.json({ result: agent === "Content Planner" ? plannerFallback(modelInput) : agentFallbacks[agent], mode: "demo" });
        }

        const isPlanner = agent === "Content Planner";
        const isEvaluator = agent === "Evaluator Agent";
        try {
          const response = await fetch(workerEnv.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerEnv.DEEPSEEK_API_KEY}` },
            body: JSON.stringify({
              model: workerEnv.DEEPSEEK_MODEL || "deepseek-chat",
              temperature: 0.55,
              max_tokens: isPlanner ? 3600 : isEvaluator || agent === "Writer Agent" || agent === "Optimizer Agent" ? 2600 : 1800,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: `${systemPrompts[agent] || systemPrompts["Content Planner"]}\n${isPlanner ? plannerSchema : agentSchemas[agent]}` },
                { role: "user", content: modelInput },
              ],
            }),
            signal: AbortSignal.timeout(45000),
          });
          if (!response.ok) {
            const upstream = (await response.text()).slice(0, 500);
            console.error("DeepSeek request failed", response.status, upstream);
            if (isPlanner) {
              return Response.json({ result: plannerFallback(modelInput), mode: "degraded", warning: `DeepSeek 暂时不可用（${response.status}）` });
            }
            return Response.json({ result: agentFallbacks[agent], mode: "degraded", warning: `DeepSeek 暂时不可用（${response.status}）` });
          }
          const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
          if (isPlanner && (!Array.isArray(result.plans) || result.plans.length !== 7)) {
            throw new Error("Planner returned invalid plan count");
          }
          if (isEvaluator) {
            if (!Array.isArray(result.dimensions) || result.dimensions.length !== 5) throw new Error("Evaluator returned invalid dimensions");
            const total = result.dimensions.reduce((sum: number, item: { score?: number }) => sum + Math.max(0, Math.min(20, Number(item.score) || 0)), 0);
            result.totalScore = total;
          }
          return Response.json({ result, mode: "live" });
        } catch (error) {
          console.error("DeepSeek processing error", error instanceof Error ? error.message : error);
          if (isPlanner) {
            return Response.json({ result: plannerFallback(modelInput), mode: "degraded", warning: "DeepSeek 响应超时，已启用主题相关的可靠降级方案" });
          }
          return Response.json({ result: agentFallbacks[agent], mode: "degraded", warning: "DeepSeek 响应异常，已启用该 Agent 专属的可靠降级方案" });
        }
      },
    },
  },
});
