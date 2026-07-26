# 小芽 AI｜小红书内容增长 Agent

面向小红书运营者、个人创作者和品牌方的 AI Native 内容策划工作台。产品不是一次性生成文案，而是把专业运营流程拆解为可观察、可评估、可迭代的多 Agent Workflow。

## 核心能力

- Audience Agent：粘贴小红书账号链接，基于公开可见信息分析定位、受众和内容断层
- Trend Agent：识别趋势信号、竞争缺口与可执行选题
- Content Planner：生成 7 天内容组合与增长目标
- Writer Agent：标题、Hook、正文、标签和互动引导创作台
- Evaluator Agent：用户价值、情绪驱动、信息密度、互动潜力、平台适配五维评分
- Optimizer Agent：根据评估结果定向改写并形成迭代闭环
- 灵感卡翻转、收藏、一键复制、Agent 运行过程动画
- 真实小红书公开搜索入口；不绕过登录、验证码或反爬限制

## 技术架构

- TanStack Start + React 19
- Tailwind CSS 4
- Framer Motion
- Cloudflare Workers
- DeepSeek Chat API
- JSON 结构化输出

DeepSeek Key 只保存在 Cloudflare Worker Secret 中，不会发送至浏览器或写入源码。

## 本地开发

```bash
pnpm install
pnpm dev
```

未配置 `DEEPSEEK_API_KEY` 时，Agent 接口会返回内置 Demo 数据。

## 构建与部署

```bash
pnpm build
wrangler secret put DEEPSEEK_API_KEY
wrangler deploy
```

生产地址：

<https://xiaoya-ai-growth-agent.xiaoya-ai-joy.workers.dev>

## 简历描述

设计并落地 AI Native 内容增长 Agent，将专业小红书运营流程拆解为 Audience、Trend、Planner、Writer、Evaluator、Optimizer 六类 Agent；通过多阶段 Prompt、JSON 结构化输出和五维内容评分形成从用户洞察、选题规划、内容生成到优化迭代的闭环，并基于 TanStack Start 部署至 Cloudflare Workers。
