import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const systemPrompts: Record<string, string> = {
  "Audience Agent": "你是小红书 Audience Agent。根据用户提供的公开账号链接或账号描述，分析账号定位、目标用户、内容资产、内容断层和增长机会。不得声称读取了无法访问的私密数据。",
  "Trend Agent": "你是小红书 Trend Agent。识别与账号方向匹配的上升趋势、竞争缺口、时效节点和可执行选题角度。",
  "Content Planner": "你是小红书 Content Planner。把用户画像与趋势信号转化为内容组合，明确拉新、信任、收藏、互动四类内容的分工。",
  "Writer Agent": "你是小红书 Writer Agent。生成真实、克制、有个人证据的笔记，不使用模板腔，不虚构经历，输出 Hook、内容结构、正文和互动引导。",
  "Evaluator Agent": "你是小红书 Evaluator Agent。基于用户价值、情绪驱动、信息密度、互动潜力、平台适配五维评分，并指出最重要的改进。",
  "Optimizer Agent": "你是小红书 Optimizer Agent。根据评分反馈重写内容，明确修改动作、版本差异、停止条件和风险控制。",
};

const outputSchema = `严格输出 JSON：
{"headline":"一句话结论","score":0,"insights":[["维度名","具体洞察"],["维度名","具体洞察"],["维度名","具体洞察"],["维度名","具体洞察"]],"action":"下一步建议"}`;

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

const fallback = (agent: string) => ({
  headline: `${agent} 已完成本轮任务`,
  score: 91,
  insights: [
    ["关键发现", "真实经历是当前账号最强的内容资产"],
    ["用户需求", "用户需要可执行路径，而不是泛泛的工具介绍"],
    ["内容机会", "把方法、案例和失败复盘组合成连续系列"],
    ["差异化", "展示 Agent 的决策过程与评估标准"],
  ],
  action: "将本轮结构化产物发送给下一个 Agent，继续完成内容闭环。",
});

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
          return Response.json({ result: fallback(agent), mode: "demo" });
        }

        const isPlanner = agent === "Content Planner";
        try {
          const response = await fetch(workerEnv.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerEnv.DEEPSEEK_API_KEY}` },
            body: JSON.stringify({
              model: workerEnv.DEEPSEEK_MODEL || "deepseek-chat",
              temperature: 0.55,
              max_tokens: isPlanner ? 3600 : 1400,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: `${systemPrompts[agent] || systemPrompts["Content Planner"]}\n${isPlanner ? plannerSchema : outputSchema}` },
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
            return Response.json({ result: fallback(agent), mode: "degraded", warning: `DeepSeek 暂时不可用（${response.status}）` });
          }
          const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
          if (isPlanner && (!Array.isArray(result.plans) || result.plans.length !== 7)) {
            throw new Error("Planner returned invalid plan count");
          }
          return Response.json({ result, mode: "live" });
        } catch (error) {
          console.error("DeepSeek processing error", error instanceof Error ? error.message : error);
          if (isPlanner) {
            return Response.json({ result: plannerFallback(modelInput), mode: "degraded", warning: "DeepSeek 响应超时，已启用主题相关的可靠降级方案" });
          }
          return Response.json({ result: fallback(agent), mode: "degraded", warning: "DeepSeek 响应异常，已启用可靠降级方案" });
        }
      },
    },
  },
});
