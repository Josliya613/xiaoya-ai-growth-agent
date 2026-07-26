import { createFileRoute } from "@tanstack/react-router";

import {
  ArrowLeft, ArrowRight, BarChart3, Bookmark, BookmarkCheck, Bot, Check, ChevronDown,
  Clock3, Copy, Heart, LayoutGrid, Lightbulb, MessageCircle, MoreHorizontal, PenLine,
  ExternalLink, FileText, Link2, Plus, RefreshCw, Search, Send, Sparkles, Target,
  TrendingUp, UserRound, WandSparkles, Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Plan = {
  day: number; theme: string; angle: string; category: string; hook: string;
  titles: string[]; structure: string[]; cover: string; interaction: string;
  time: string; score: number; color: string;
};

type Strategy = { positioning: string; audience: string; mix: string; goal: string };

const plans: Plan[] = [
  { day: 1, category: "人设故事", theme: "985 毕业生转 AI 产品经理的真实路径", angle: "用反差经历建立可信人设", hook: "如果你现在想进入 AI 行业，一定不要先学编程。", titles: ["26岁转行AI产品，我踩过最大的坑", "从0到AI产品经理，我只做对了这3件事", "劝退：不是所有人都适合做AI产品"], structure: ["痛点引入", "转行经历", "方法总结", "行动建议"], cover: "大字标题「转行 AI 的第 100 天」；奶油白底 + 红色批注；人物半身照", interaction: "评论区留下你的行业，我帮你分析转行方向", time: "周一 20:30", score: 92, color: "#FFD9DE" },
  { day: 2, category: "认知干货", theme: "AI 产品经理的能力地图", angle: "高收藏的结构化知识清单", hook: "面试了 20 个 AI PM 后，我发现公司真正要的不是 Prompt。", titles: ["一张图看懂AI产品经理能力地图", "AI PM不是套壳：这5种能力最值钱", "面试官不会告诉你的AI PM门槛"], structure: ["错误认知", "能力分层", "案例说明", "学习清单"], cover: "手账式能力地图；珊瑚红 + 深棕；5 个能力标签环绕人物", interaction: "你最缺哪项能力？评论区打 1—5", time: "周二 12:15", score: 88, color: "#FFEAC7" },
  { day: 3, category: "案例拆解", theme: "一个 AI Agent 项目如何写进简历", angle: "可直接抄作业的 STAR 模板", hook: "别再写「调用大模型生成内容」了，面试官根本不买账。", titles: ["AI项目写进简历，80%的人都写错了", "这样讲Agent项目，面试官会追问", "我的AI PM简历项目拆解（附模板）"], structure: ["失败写法", "产品拆解", "指标设计", "简历模板"], cover: "左右对比「普通写法 vs 高阶写法」；醒目红笔打叉与勾", interaction: "收藏后私信「模板」，获取项目描述框架", time: "周三 20:00", score: 95, color: "#DDF4E9" },
  { day: 4, category: "工具实测", theme: "4 个主流大模型做内容策划横评", angle: "真实任务横评，制造讨论", hook: "同一份选题，我同时丢给了 GPT、Claude、Gemini 和 DeepSeek。", titles: ["4个大模型写小红书，差距太明显了", "别再只用GPT：内容策划横评结果", "DeepSeek这次真的赢麻了？"], structure: ["测试标准", "结果对比", "优缺点", "选择建议"], cover: "四宫格模型名 + 评分条；视觉像测评榜单", interaction: "下一期想看哪个 AI 工具？评论区点名", time: "周四 19:45", score: 86, color: "#E3E4FF" },
  { day: 5, category: "工作流", theme: "我的一人 AI 内容团队 Workflow", angle: "展示效率提升与专业方法", hook: "过去写一篇笔记要 3 小时，现在我用 6 个 Agent 只花 20 分钟。", titles: ["我的AI内容团队，终于不靠灵感了", "6个Agent如何帮我日更？Workflow公开", "一人公司必备：AI内容流水线"], structure: ["旧流程痛点", "Agent 分工", "演示结果", "避坑建议"], cover: "横向工作流节点；加入计时器「3h → 20min」", interaction: "想要完整 Prompt 的评论区扣「工作流」", time: "周五 20:30", score: 94, color: "#D7F0F4" },
  { day: 6, category: "避坑清单", theme: "做 AI 项目最容易犯的 7 个错误", angle: "损失规避驱动收藏", hook: "这是我做完 3 个 AI Demo 后，最想劝退自己的 7 件事。", titles: ["AI项目避坑：别让Demo死在这7步", "做AI产品最大的坑，竟然不是技术", "如果重做一次AI项目，我会删掉这些"], structure: ["失败现场", "7 个误区", "修正方法", "检查清单"], cover: "便签清单 + 7 个红色编号；有“内部复盘”感", interaction: "你中了几条？评论区报数字", time: "周六 11:30", score: 89, color: "#FFF0C9" },
  { day: 7, category: "互动诊断", theme: "免费诊断 10 份 AI PM 简历", angle: "用稀缺名额拉动高质量评论", hook: "本周开放 10 个位置：我会用面试官视角，直接改你的 AI 项目描述。", titles: ["免费改10份AI PM简历，先到先得", "你的AI简历为什么没有面试？我来拆", "开放10个AI产品简历诊断名额"], structure: ["活动说明", "参与门槛", "诊断维度", "结果承诺"], cover: "醒目数字「10」+ 简历局部；红色印章「免费诊断」", interaction: "评论「年限 + 目标岗位」，我抽 10 位诊断", time: "周日 20:00", score: 91, color: "#FFDCEB" },
];

const workflow = [
  { name: "Audience Agent", zh: "用户画像分析", desc: "识别核心人群、需求与情绪", icon: UserRound, color: "#FF5C6C" },
  { name: "Trend Agent", zh: "热点趋势分析", desc: "匹配平台趋势与内容机会", icon: TrendingUp, color: "#F5A623" },
  { name: "Content Planner", zh: "7 天选题规划", desc: "平衡人设、干货与互动", icon: LayoutGrid, color: "#29A37A" },
  { name: "Writer Agent", zh: "笔记内容生成", desc: "标题、Hook、正文与标签", icon: PenLine, color: "#7B6CF6" },
  { name: "Evaluator Agent", zh: "爆款潜力评分", desc: "五维评估内容质量", icon: BarChart3, color: "#337BEA" },
  { name: "Optimizer Agent", zh: "策略优化迭代", desc: "根据评分自动改写", icon: WandSparkles, color: "#E8589B" },
];

const scoreItems = [
  ["用户价值", 19, "#FF5C6C"], ["情绪驱动力", 18, "#F5A623"], ["信息密度", 19, "#29A37A"],
  ["互动潜力", 20, "#7B6CF6"], ["平台适配", 17, "#337BEA"],
];

const publicReferences = [
  { author: "传凌.AI", title: "找工作第一步不是改简历", likes: "1,000+", query: "找工作第一步不是改简历 AI产品经理" },
  { author: "Vivi｜AI产品", title: "AI 产品经理：软技能才是硬实力", likes: "14.7w 赞藏账号", query: "AI产品经理 软技能才是硬实力" },
  { author: "AI 产品经理创作者", title: "分析了 54 份 JD 后，我发现…", likes: "高收藏", query: "分析了54份JD AI产品经理" },
  { author: "AI 工具测评博主", title: "主流大模型内容策划实测", likes: "热门讨论", query: "大模型 内容策划 实测" },
  { author: "一人公司创作者", title: "我的 AI 内容工作流公开", likes: "高收藏", query: "AI内容工作流 一人公司" },
  { author: "产品复盘博主", title: "做 AI 项目最容易踩的坑", likes: "热门干货", query: "AI项目 避坑 产品经理" },
  { author: "AI 求职博主", title: "AI PM 简历诊断现场", likes: "高互动", query: "AI产品经理 简历诊断" },
];

function Logo() {
  return <div className="logo"><span className="logo-leaf">✦</span><span>小芽 <b>AI</b></span></div>;
}

function MiniAvatar({ name = "你" }: { name?: string }) {
  return <div className="avatar">{name}</div>;
}

function App() {
  const [view, setView] = useState<"home" | "plan" | "detail" | "workflow" | "about" | "agent">("home");
  const [activeAgent, setActiveAgent] = useState(0);
  const [topic, setTopic] = useState("AI 产品经理");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Plan>(plans[2]);
  const [saved, setSaved] = useState<number[]>([3]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const [detailTab, setDetailTab] = useState<"writer" | "titles" | "comments">("writer");
  const [mobileNav, setMobileNav] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<Plan[]>(plans);
  const [strategy, setStrategy] = useState<Strategy>({
    positioning: "用真实转行经历，帮助 0—3 年经验职场人进入 AI 产品行业",
    audience: "22—30 岁 · 一二线城市",
    mix: "40% 干货 · 30% 故事 · 30% 互动",
    goal: "收藏率 ≥ 8% · 互动率 ≥ 5%",
  });

  useEffect(() => {
    if (!loading) return;
    if (step < 4) {
      const t = setTimeout(() => setStep((s) => s + 1), 560);
      return () => clearTimeout(t);
    }
  }, [loading, step]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setToast("已复制到剪贴板");
    setTimeout(() => setToast(""), 1600);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setStep(0);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "Content Planner", input: `账号方向：${topic.trim()}。请生成真实可执行、彼此不重复的 7 天小红书内容计划。` }),
      });
      if (!response.ok) throw new Error("planner failed");
      const data = await response.json() as {
        result?: { strategy?: Strategy; plans?: Array<Omit<Plan, "color">> };
        mode?: "live" | "degraded" | "demo";
        warning?: string;
      };
      if (!data.result?.plans || data.result.plans.length !== 7) throw new Error("invalid plan");
      const colors = ["#FFD9DE", "#FFEAC7", "#DDF4E9", "#E3E4FF", "#D7F0F4", "#FFF0C9", "#FFDCEB"];
      setGeneratedPlans(data.result.plans.map((plan, index) => ({ ...plan, day: index + 1, color: colors[index] })));
      if (data.result.strategy) setStrategy(data.result.strategy);
      setSelected({ ...data.result.plans[0], day: 1, color: colors[0] });
      setView("plan");
      if (data.mode === "degraded") {
        setToast(data.warning || "模型响应超时，已生成主题相关的降级计划");
        setTimeout(() => setToast(""), 3600);
      }
    } catch {
      setToast("生成失败，请稍后重试");
      setTimeout(() => setToast(""), 1800);
    } finally {
      setLoading(false); setStep(0);
    }
  };
  const openDetail = (plan: Plan) => { setSelected(plan); setDetailTab("writer"); setView("detail"); window.scrollTo(0, 0); };
  const openAgent = (index: number) => { setActiveAgent(index); setView("agent"); window.scrollTo(0, 0); };
  const nav = (v: typeof view) => { setView(v); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <main>
      <header>
        <button className="brand-button" onClick={() => nav("home")}><Logo /></button>
        <nav className={mobileNav ? "open" : ""}>
          <button className={view === "home" ? "active" : ""} onClick={() => nav("home")}>首页</button>
          <button className={view === "plan" || view === "detail" ? "active" : ""} onClick={() => nav("plan")}>内容计划</button>
          <button className={view === "workflow" || view === "agent" ? "active" : ""} onClick={() => nav("workflow")}>Agent 工作流</button>
          <button className={view === "about" ? "active" : ""} onClick={() => nav("about")}>产品亮点</button>
        </nav>
        <div className="header-actions">
          <button className="saved-button" onClick={() => nav("plan")}><Bookmark size={17} /> <span>已收藏 {saved.length}</span></button>
          <MiniAvatar />
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><MoreHorizontal /></button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "home" && <Home key="home" topic={topic} setTopic={setTopic} generate={generate} nav={nav} openAgent={openAgent} />}
        {view === "plan" && <PlanView key="plan" topic={topic} plans={generatedPlans} strategy={strategy} saved={saved} setSaved={setSaved} flipped={flipped} setFlipped={setFlipped} openDetail={openDetail} copy={copy} nav={nav} />}
        {view === "detail" && <Detail key="detail" plan={selected} detailTab={detailTab} setDetailTab={setDetailTab} copy={copy} saved={saved} setSaved={setSaved} back={() => nav("plan")} />}
        {view === "workflow" && <Workflow key="workflow" openAgent={openAgent} />}
        {view === "agent" && <AgentWorkspace key={`agent-${activeAgent}`} active={activeAgent} setActive={setActiveAgent} back={() => nav("workflow")} copy={copy} />}
        {view === "about" && <About key="about" nav={nav} />}
      </AnimatePresence>

      <AnimatePresence>{loading && <LoadingOverlay step={step} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}><Check size={16} />{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}

function Home({ topic, setTopic, generate, nav, openAgent }: any) {
  const examples = ["AI 产品经理", "留学生租房", "港大生活", "新能源汽车", "健身减脂"];
  return <motion.div className="home-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className="hero">
      <div className="hero-blur one" /><div className="hero-blur two" />
      <motion.div className="eyebrow" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><Sparkles size={15} /> AI Native 内容增长 Agent <span>NEW</span></motion.div>
      <motion.h1 initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .08 }}>让每一个灵感，<br />都长成<span>爆款内容</span></motion.h1>
      <motion.p initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .14 }}>你的专属小红书运营团队。从账号定位到发布优化，<br className="desktop" />6 个 AI Agent 为你规划一整周的内容增长路径。</motion.p>
      <motion.div className="prompt-box" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .2 }}>
        <div className="prompt-label"><Target size={17} />告诉我们，你想做什么方向的账号？</div>
        <div className="input-row">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="例如：AI 产品经理、港大生活、健身减脂..." />
          <button onClick={generate} disabled={!topic.trim()}><WandSparkles size={19} />生成爆款计划</button>
        </div>
        <div className="suggestions"><span>试试：</span>{examples.map((x: string) => <button key={x} onClick={() => setTopic(x)}>{x}</button>)}</div>
      </motion.div>
      <div className="proof"><div className="proof-avatars"><MiniAvatar name="L" /><MiniAvatar name="Y" /><MiniAvatar name="A" /></div><b>2,836</b> 位创作者正在用小芽长内容 <span>★ 4.9</span></div>
    </section>
    <section className="team-section">
      <div className="section-kicker">MEET YOUR AI TEAM</div><h2>一个人，也能拥有一支内容团队</h2><p>每个 Agent 专注一个环节，像真正的运营团队一样协作。</p>
      <div className="team-grid">{workflow.slice(0, 4).map((w, i) => <motion.button className="team-card" key={w.name} whileHover={{ y: -6 }} onClick={() => openAgent(i)}>
        <div className="team-icon" style={{ background: `${w.color}18`, color: w.color }}><w.icon /></div><div><b>{w.name}</b><span>{w.zh}</span></div><p>{w.desc}</p><div className="agent-status"><i /> 在线</div>
      </motion.button>)}</div>
      <button className="text-link" onClick={() => nav("workflow")}>查看完整 Agent 工作流 <ArrowRight size={16} /></button>
    </section>
  </motion.div>;
}

function LoadingOverlay({ step }: { step: number }) {
  const items = ["分析账号定位", "拆解目标用户", "生成内容方向", "设计爆款结构", "优化互动策略"];
  return <motion.div className="loading-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="loading-card" initial={{ scale: .95, y: 20 }} animate={{ scale: 1, y: 0 }}>
      <div className="brain"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}><Sparkles /></motion.div></div>
      <div className="loading-copy"><span>小芽 AI 正在思考</span><h3>正在组建你的内容增长策略</h3><p>6 个 Agent 正在协同工作，请稍候...</p></div>
      <div className="steps">{items.map((x, i) => <div key={x} className={`step ${i < step ? "done" : i === step ? "doing" : ""}`}><div className="step-dot">{i < step ? <Check size={13} /> : i + 1}</div><span>{x}</span>{i === step && <em>分析中...</em>}</div>)}</div>
      <div className="progress"><motion.div animate={{ width: `${Math.min((step + 1) * 20, 100)}%` }} /></div>
    </motion.div>
  </motion.div>;
}

function PlanView({ topic, plans, strategy, saved, setSaved, flipped, setFlipped, openDetail, copy, nav }: any) {
  const toggleSave = (day: number) => setSaved((s: number[]) => s.includes(day) ? s.filter((x) => x !== day) : [...s, day]);
  return <motion.div className="plan-view page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="plan-head">
      <div><div className="breadcrumb">首页 <span>/</span> 内容增长计划</div><h1>为「{topic}」定制的 7 天计划</h1><p>策略生成完成 · 建议从周一开始执行</p></div>
      <div className="plan-actions"><button onClick={() => nav("home")}><RefreshCw size={16} />重新生成</button><button className="primary" onClick={() => copy(plans.map((p: Plan) => `Day ${p.day}｜${p.theme}`).join("\n"))}><Copy size={16} />复制全部计划</button></div>
    </div>
    <div className="strategy-strip">
      <div className="strategy-main"><div className="mini-icon"><Target /></div><div><span>账号定位</span><b>{strategy.positioning}</b></div></div>
      <div><span>目标用户</span><b>{strategy.audience}</b></div><div><span>内容策略</span><b>{strategy.mix}</b></div><div><span>增长目标</span><b>{strategy.goal}</b></div>
    </div>
    <div className="plan-summary"><div><span className="pulse" />7 天内容灵感</div><span>点击卡片查看完整内容 · 点击右上角可翻转策略面</span></div>
    <div className="cards-grid">{plans.map((p: Plan, i: number) => {
      const isFlipped = flipped.includes(p.day);
      const reference = publicReferences[i];
      const realNoteUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${topic} ${p.theme}`)}&source=web_explore_feed`;
      return <motion.article className={`idea-card ${isFlipped ? "is-flipped" : ""}`} key={p.day} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }}>
        <div className="card-inner">
          <div className="card-face card-front">
            <div className="card-color" style={{ background: p.color }}><span>DAY {p.day}</span><small>{p.category}</small><div className="cover-copy">{p.theme.split("的").map((x, idx) => <b key={idx}>{x}{idx === 0 && p.theme.includes("的") ? "的" : ""}</b>)}</div><div className="fake-note"><Heart size={13} fill="currentColor" /> 2.4k <MessageCircle size={13} /> 189</div></div>
            <div className="card-body"><div className="card-topline"><span>{p.category}</span><div><button aria-label="翻转策略卡" onClick={() => setFlipped((f: number[]) => [...f, p.day])}><RefreshCw size={15} /></button><button aria-label="收藏" onClick={() => toggleSave(p.day)}>{saved.includes(p.day) ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}</button></div></div>
            <h3>{p.theme}</h3><div className="hook"><Zap size={14} fill="currentColor" /><p>{p.hook}</p></div>
            <a className="real-note-link" href={realNoteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><span><i />查看小红书真实相关笔记</span><ExternalLink size={13} /></a>
            <div className="tags"><span><Clock3 size={13} />{p.time}</span><span className="score"><Sparkles size={13} />爆款分 {p.score}</span></div>
            <button className="card-cta" onClick={() => openDetail(p)}>展开内容 Agent <ArrowRight size={15} /></button></div>
          </div>
          <div className="card-face card-back">
            <div className="back-head"><div><span>DAY {p.day}</span><h3>运营策略拆解</h3></div><button onClick={() => setFlipped((f: number[]) => f.filter((x) => x !== p.day))}><RefreshCw size={16} /></button></div>
            <div className="back-section"><span>选题角度</span><p>{p.angle}</p></div>
            <div className="back-section"><span>笔记结构</span><div className="structure-row">{p.structure.map((x, idx) => <i key={x}>{idx + 1}. {x}</i>)}</div></div>
            <div className="back-section"><span>封面建议</span><p>{p.cover}</p></div>
            <div className="back-section"><span>互动钩子</span><p>“{p.interaction}”</p></div>
            <button className="card-cta" onClick={() => openDetail(p)}>进入内容增强 <ArrowRight size={15} /></button>
          </div>
        </div>
      </motion.article>;
    })}</div>
  </motion.div>;
}

function Detail({ plan, detailTab, setDetailTab, copy, saved, setSaved, back }: any) {
  const isSaved = saved.includes(plan.day);
  const body = `如果你正在考虑进入 AI 行业，我想先劝你：不要一上来就学编程。\n\n过去 6 个月，我从一个几乎不懂技术的传统产品，转向 AI 产品经理。最开始我也以为，要把 Python、模型原理全部学完才有资格投简历。\n\n后来真正做了 3 个 AI 项目、面试了 12 家公司后，我才发现面试官更在意这 3 件事：\n\n01｜能不能找到值得用 AI 解决的问题\n02｜能不能把模型能力变成稳定的产品 Workflow\n03｜能不能设计评估指标，让效果持续变好\n\n我的建议是：先选一个真实场景，做出最小闭环，再倒推需要补的技术知识。项目，永远比课程更能暴露你的认知盲区。\n\n如果你也在转行路上，评论区留下「行业 + 年限」，我帮你看看适合从哪里切入。`;
  const titleOptions = [
    ["情绪型", "26岁转行AI产品，我最后悔先学了编程"], ["干货型", "0基础转AI产品经理：我的3步实战路径"],
    ["争议型", "想转AI产品？劝你先别学Prompt"], ["故事型", "985毕业两年后，我决定从头做AI产品"],
    ["数字型", "面试12家公司后，我总结了3条转行真相"],
  ];
  const comments = [
    ["这个方法适合应届生吗？", "适合！应届生更建议从校园/实习里的真实场景切入，先做一个小闭环。你是什么专业呀？"],
    ["没有产品经验也可以转吗？", "可以，但需要用项目证明你的产品思维。可以先从自己最熟悉的行业问题开始。"],
    ["可以分享具体项目模板吗？", "当然！我正在整理完整模板，收藏这篇，下一期会详细拆解～"],
  ];
  return <motion.div className="detail-view page" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
    <button className="back" onClick={back}><ArrowLeft size={17} />返回 7 天计划</button>
    <div className="detail-head">
      <div><span>DAY {plan.day} · {plan.category}</span><h1>{plan.theme}</h1><p>内容增强 Agent 已基于策略完成初稿</p></div>
      <div><button onClick={() => setSaved((s: number[]) => isSaved ? s.filter((x) => x !== plan.day) : [...s, plan.day])}>{isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{isSaved ? "已收藏" : "收藏"}</button><button className="primary" onClick={() => copy(`${plan.titles[0]}\n\n${body}\n\n#AI产品经理 #转行 #职场成长`)}><Copy size={16} />一键复制笔记</button></div>
    </div>
    <div className="detail-layout">
      <section className="editor-panel">
        <div className="editor-tabs">
          <button className={detailTab === "writer" ? "active" : ""} onClick={() => setDetailTab("writer")}><PenLine size={16} />笔记生成</button>
          <button className={detailTab === "titles" ? "active" : ""} onClick={() => setDetailTab("titles")}><Sparkles size={16} />标题优化 <i>10</i></button>
          <button className={detailTab === "comments" ? "active" : ""} onClick={() => setDetailTab("comments")}><MessageCircle size={16} />评论预测 <i>3</i></button>
        </div>
        <AnimatePresence mode="wait">
          {detailTab === "writer" && <motion.div className="note-editor" key="writer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="field-label"><span>标题</span><button onClick={() => copy(plan.titles[0])}><Copy size={14} />复制</button></div><h2>{plan.titles[0]}</h2>
            <div className="field-label"><span>正文</span><button onClick={() => copy(body)}><Copy size={14} />复制</button></div>
            <div className="body-copy">{body.split("\n").map((p, i) => <p key={i}>{p || <br />}</p>)}</div>
            <div className="field-label"><span>推荐标签</span><button onClick={() => copy("#AI产品经理 #转行 #职场成长 #产品经理 #人工智能")}><Copy size={14} />复制</button></div>
            <div className="note-tags"><span>#AI产品经理</span><span>#转行</span><span>#职场成长</span><span>#产品经理</span><span>#人工智能</span></div>
          </motion.div>}
          {detailTab === "titles" && <motion.div className="title-list" key="titles" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-intro"><Sparkles /><div><h3>标题优化 Agent</h3><p>基于情绪张力、信息增益和平台语感生成不同风格</p></div></div>
            {titleOptions.map(([style, title], i) => <div className="title-option" key={title}><b>{String(i + 1).padStart(2, "0")}</b><div><span>{style}</span><p>{title}</p></div><button onClick={() => copy(title)}><Copy size={15} /></button></div>)}
          </motion.div>}
          {detailTab === "comments" && <motion.div className="comments-list" key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-intro purple"><MessageCircle /><div><h3>评论预测 Agent</h3><p>提前识别用户疑问，准备高情商回复，延长互动链路</p></div></div>
            {comments.map(([q, a], i) => <div className="comment-item" key={q}><div className="comment-q"><MiniAvatar name={["Z", "M", "K"][i]} /><div><span>预测评论 · {86 - i * 7}% 可能</span><p>{q}</p></div></div><div className="reply"><b>建议回复</b><p>{a}</p><button onClick={() => copy(a)}><Copy size={14} />复制回复</button></div></div>)}
          </motion.div>}
        </AnimatePresence>
      </section>
      <aside className="score-panel">
        <div className="score-title"><div><Sparkles size={18} />爆款评分</div><span>Evaluator Agent</span></div>
        <div className="score-ring" style={{ "--score": `${plan.score * 3.6}deg` } as any}><div><strong>{plan.score}</strong><span>/ 100</span></div></div>
        <div className="score-status">表现优秀 <TrendingUp size={15} /></div>
        <div className="score-bars">{scoreItems.map(([name, value, color]: any) => <div key={name}><div><span>{name}</span><b>{value}/20</b></div><div className="bar"><i style={{ width: `${value * 5}%`, background: color }} /></div></div>)}</div>
        <div className="optimization"><div><Lightbulb size={17} />优化建议</div><p>开头反常识观点很强。建议在正文第 2 段增加一个具体失败案例，提升真实感与停留时长。</p><button><WandSparkles size={15} />AI 一键优化</button></div>
        <div className="publish"><Clock3 size={17} /><div><span>推荐发布时间</span><b>{plan.time}</b></div></div>
      </aside>
    </div>
  </motion.div>;
}

const agentDemoResults = [
  {
    headline: "账号诊断完成：高潜力「AI 转行实战」型账号",
    score: 87,
    insights: [
      ["核心受众", "22—30 岁、0—3 年经验、想转 AI 但缺少真实项目的职场人"],
      ["信任资产", "真实转行过程和项目复盘，比泛知识搬运更容易建立差异化"],
      ["内容断层", "干货占比偏高，缺少人物故事和阶段性成长记录"],
      ["增长机会", "围绕「真实项目—简历表达—面试验证」建立连续追更系列"],
    ],
    action: "建议未来 14 天采用 4:3:2:1 内容配比：实战干货 40%、转行故事 30%、项目拆解 20%、互动诊断 10%。",
  },
  {
    headline: "趋势雷达：发现 4 个值得跟进的内容机会",
    score: 91,
    insights: [
      ["上升话题", "Agent Workflow、AI Eval、Context Engineering、一人公司"],
      ["竞争缺口", "大多数内容只讲工具，缺少产品决策和评估过程"],
      ["可借势节点", "秋招前 6 周、周日职业焦虑时段、模型新品发布后 48 小时"],
      ["推荐角度", "从「工具介绍」升级为「同一真实任务的决策横评」"],
    ],
    action: "首发选题：同一个小红书增长任务，6 个 Agent 如何协作？附过程轨迹和失败迭代。",
  },
  {
    headline: "7 天内容组合已生成：兼顾拉新、建立信任与互动转化",
    score: 93,
    insights: [
      ["拉新内容", "反常识转行故事 + AI 岗位趋势洞察"],
      ["信任内容", "Agent 项目完整拆解 + 失败复盘"],
      ["收藏内容", "能力地图 + 简历项目表达模板"],
      ["互动内容", "开放 10 个账号或简历诊断名额"],
    ],
    action: "Planner 已把每个选题的受众痛点、内容目标和发布节奏同步给 Writer 与 Evaluator。",
  },
  {
    headline: "创作初稿已完成：保留个人经历，不生成模板腔",
    score: 95,
    insights: [
      ["Hook", "别再写「调用大模型生成内容」了，面试官根本不买账。"],
      ["内容骨架", "失败写法 → 产品拆解 → 指标设计 → 可复用模板"],
      ["人设证据", "补入做 3 个 Demo、面试 12 家公司的真实经历"],
      ["互动钩子", "评论区留下行业 + 年限，承诺给出具体切入建议"],
    ],
    action: "已生成 10 个标题、1 篇完整正文、5 个标签及封面文案，可继续送入评分 Agent。",
  },
  {
    headline: "爆款潜力 89 分：价值密度高，故事证据仍可加强",
    score: 89,
    insights: [
      ["用户价值", "19/20 · 提供明确可执行模板"],
      ["情绪驱动", "17/20 · 反常识冲突成立"],
      ["信息密度", "19/20 · 每段都有新增信息"],
      ["互动潜力", "18/20 · 问题足够具体"],
    ],
    action: "建议补充一个失败项目的具体数字，并把第 3 段压缩 30%，预计总分可提升至 94。",
  },
  {
    headline: "优化迭代完成：保留原意，提升停留与互动",
    score: 94,
    insights: [
      ["本轮动作", "Hook 前置结果、增加失败细节、压缩背景段落"],
      ["停止条件", "总分 ≥ 92 且任一维度不低于 16"],
      ["版本差异", "正文缩短 18%，案例证据增加 2 个"],
      ["风险控制", "没有虚构经历，没有夸张收益承诺"],
    ],
    action: "Optimizer 已达到停止条件。可查看 v1/v2 差异，或回退到任意版本。",
  },
];

function AgentWorkspace({ active, setActive, back, copy }: { active: number; setActive: (n: number) => void; back: () => void; copy: (t: string) => void }) {
  const agent = workflow[active];
  const Icon = agent.icon;
  const [accountUrl, setAccountUrl] = useState("https://www.xiaohongshu.com/user/profile/...");
  const [brief, setBrief] = useState("把我做 AI Native 内容增长 Agent 的项目写成一篇适合小红书的项目复盘，目标用户是想转 AI PM 的职场人。");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [runStep, setRunStep] = useState(0);

  const run = async () => {
    setRunning(true); setResult(null); setRunStep(0);
    const timer = setInterval(() => setRunStep((s) => Math.min(s + 1, 3)), 480);
    try {
      const input = active === 0 ? accountUrl : brief;
      const response = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agent: agent.name, input }) });
      const data = await response.json() as { result?: unknown };
      setResult(data.result || agentDemoResults[active]);
    } catch {
      setResult(agentDemoResults[active]);
    } finally {
      clearInterval(timer); setRunStep(4); setRunning(false);
    }
  };

  return <motion.div className="agent-workspace page" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
    <button className="back" onClick={back}><ArrowLeft size={17} />返回 Agent 工作流</button>
    <div className="agent-shell">
      <aside className="agent-sidebar">
        <div className="side-label">YOUR AI TEAM</div>
        {workflow.map((w, i) => <button key={w.name} className={active === i ? "active" : ""} onClick={() => { setActive(i); setResult(null); }}>
          <span style={{ background: `${w.color}18`, color: w.color }}><w.icon /></span><div><b>{w.name}</b><small>{w.zh}</small></div>{active === i && <ArrowRight size={14} />}
        </button>)}
        <div className="context-memory"><Sparkles size={15} /><div><b>Shared Context</b><span>6 个 Agent 共享账号定位、用户画像和历史版本</span></div></div>
      </aside>
      <section className="agent-main">
        <div className="agent-main-head">
          <div className="big-agent-icon" style={{ background: `${agent.color}18`, color: agent.color }}><Icon /></div>
          <div><span>AGENT WORKSPACE · 0{active + 1}</span><h1>{agent.name}</h1><p>{agent.zh} · {agent.desc}</p></div>
          <div className="live-pill"><i /> DeepSeek · Ready</div>
        </div>

        {active === 0 ? <div className="agent-input-card">
          <div className="input-card-title"><Link2 /><div><b>粘贴小红书账号链接</b><span>Agent 会读取公开账号信息，并结合可见内容样本进行定位诊断</span></div></div>
          <div className="analysis-input"><input value={accountUrl} onChange={(e) => setAccountUrl(e.target.value)} placeholder="https://www.xiaohongshu.com/user/profile/..." /><button onClick={run} disabled={running || !accountUrl.trim()}>{running ? <RefreshCw className="spin" /> : <Search />}开始账号分析</button></div>
          <div className="privacy-note"><Check size={13} />仅分析公开页面信息，不需要账号登录，不保存用户链接</div>
        </div> : active === 3 ? <div className="writer-studio">
          <div className="studio-top"><div><span>CONTENT BRIEF</span><b>AI Native 创作工作台</b></div><div className="studio-chips"><span>账号人设已同步</span><span>Audience 已同步</span><span>目标：收藏</span></div></div>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
          <div className="studio-controls">
            <label>内容类型 <button>项目复盘 <ChevronDown size={13} /></button></label>
            <label>表达语气 <button>真实克制 <ChevronDown size={13} /></button></label>
            <label>目标长度 <button>600—800 字 <ChevronDown size={13} /></button></label>
            <button className="studio-run" onClick={run} disabled={running}>{running ? <RefreshCw className="spin" /> : <WandSparkles />}生成内容初稿</button>
          </div>
        </div> : <div className="agent-input-card">
          <div className="input-card-title"><FileText /><div><b>输入本次任务 Brief</b><span>上游 Agent 产物会自动作为上下文，无需重复粘贴</span></div></div>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
          <button className="wide-run" onClick={run} disabled={running}>{running ? <RefreshCw className="spin" /> : <Sparkles />}运行 {agent.name}</button>
        </div>}

        <div className="trace-card">
          <div className="trace-head"><div><Bot />执行轨迹</div><span>可观测</span></div>
          {["读取输入与共享上下文", "调用公开信息分析工具", "按 JSON Schema 生成结果", "质量检查与风险过滤"].map((x, i) => <div className={`trace-step ${running && i <= runStep ? "doing" : result || (running && i < runStep) ? "done" : ""}`} key={x}><span>{result || (running && i < runStep) ? <Check size={12} /> : i + 1}</span><b>{x}</b><small>{result ? `${180 + i * 73} ms` : running && i === runStep ? "运行中…" : "等待"}</small></div>)}
        </div>

        <AnimatePresence>{result && <motion.div className="agent-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="result-head"><div><span>STRUCTURED OUTPUT</span><h2>{result.headline}</h2></div><div className="result-score"><b>{result.score}</b><span>/100</span></div></div>
          <div className="insight-grid">{result.insights.map(([k, v]: string[]) => <div key={k}><span>{k}</span><p>{v}</p></div>)}</div>
          <div className="next-action"><Lightbulb /><div><b>Agent 建议</b><p>{result.action}</p></div></div>
          <div className="result-actions"><button onClick={() => copy(JSON.stringify(result, null, 2))}><Copy size={15} />复制结果</button><button className="primary" onClick={() => setActive(Math.min(active + 1, 5))}>发送到下一个 Agent <ArrowRight size={15} /></button></div>
        </motion.div>}</AnimatePresence>
      </section>
      <aside className="difference-panel">
        <span>WHY 小芽 AI</span><h3>不是平台内的<br />“帮我写一篇”</h3>
        <div><b>01 · 跨 Agent 记忆</b><p>账号定位、受众和历史表现贯穿整个工作流，不必每次重新描述。</p></div>
        <div><b>02 · 证据可溯源</b><p>区分公开样本、AI 推断与用户输入，策略结论可以回看来源。</p></div>
        <div><b>03 · 质量有标准</b><p>生成后进入五维 Eval，不达标自动重写，不把第一版当答案。</p></div>
        <div><b>04 · 目标是增长</b><p>从单篇文案延伸到 7 天组合、互动策略与发布后复盘。</p></div>
        <div className="platform-compare"><span>小红书平台</span><b>发布与消费内容</b><i>+</i><span>小芽 AI</span><b>研究、规划、评估与迭代</b></div>
      </aside>
    </div>
  </motion.div>;
}

function Workflow({ openAgent }: { openAgent: (index: number) => void }) {
  return <motion.div className="workflow-view page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="center-head"><div className="eyebrow"><Bot size={15} /> MULTI-AGENT WORKFLOW</div><h1>不是一次生成，而是一场团队协作</h1><p>把专业运营团队的决策流程拆成 6 个 Agent。每一步有明确输入、结构化输出和质量标准。</p></div>
    <div className="flow-canvas">
      <div className="flow-input"><div><UserRound /></div><span>USER INPUT</span><b>“AI 产品经理”</b><small>账号方向 + 内容目标</small></div>
      <div className="vertical-line"><i /></div>
      <div className="flow-grid">{workflow.map((w, i) => <motion.button className="flow-node" key={w.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }} whileHover={{ y: -4 }} onClick={() => openAgent(i)}>
        <div className="node-number">0{i + 1}</div><div className="node-icon" style={{ background: `${w.color}18`, color: w.color }}><w.icon /></div><div><b>{w.name}</b><span>{w.zh}</span><p>{w.desc}</p></div><div className="node-output"><i />JSON Schema 输出</div>
      </motion.button>)}</div>
      <div className="feedback-loop"><RefreshCw size={17} /><b>Evaluation Loop</b><span>评分低于 80 分时，Optimizer 自动触发迭代，最多 2 次</span></div>
    </div>
    <section className="prompt-architecture"><div><span>PROMPT ARCHITECTURE</span><h2>可观测、可评估、可迭代</h2><p>每个 Agent 只解决一个明确问题，避免超长 Prompt 的指令冲突和输出漂移。</p></div>
      <div className="code-card"><div className="code-top"><span><i /><i /><i /></span><b>planner_output.schema.json</b></div><pre>{`{
  "day": 3,
  "theme": "AI 项目如何写进简历",
  "titles": ["...", "...", "..."],
  "hook": "别再写调用大模型...",
  "structure": ["痛点", "案例", "方法"],
  "interaction": "评论区留下...",
  "score": 95
}`}</pre></div></section>
  </motion.div>;
}

function About({ nav }: any) {
  return <motion.div className="about-view page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="about-hero"><span>PRODUCT STORY</span><h1>为创作者设计的<br /><em>AI Native</em> 内容工作台</h1><p>小芽 AI 不是写文案工具。它把用户洞察、选题策略、内容生产与质量评估串成完整闭环。</p><button onClick={() => nav("home")}>体验完整 Demo <ArrowRight size={17} /></button></div>
    <div className="metrics"><div><b>6</b><span>协作 Agent</span></div><div><b>7×</b><span>内容生产提效</span></div><div><b>5</b><span>质量评估维度</span></div><div><b>100%</b><span>结构化输出</span></div></div>
    <section className="principles"><div className="section-kicker">PRODUCT PRINCIPLES</div><h2>产品设计的三个关键判断</h2><div className="principle-grid">
      <div><span>01</span><Bot /><h3>从 Copilot 到 Agent</h3><p>不仅响应一次指令，而是主动拆解目标、编排任务，并在评分后自动优化。</p></div>
      <div><span>02</span><Target /><h3>过程比结果可控</h3><p>每一步展示运行状态与结构化产物，让用户理解 AI 为什么给出这个建议。</p></div>
      <div><span>03</span><RefreshCw /><h3>评估驱动增长闭环</h3><p>用五维评分建立内容质量基线，持续积累“什么内容更有效”的反馈。</p></div>
    </div></section>
    <section className="interview-card"><div><span>FOR AI PM INTERVIEW</span><h2>这不是一个“套壳 Demo”</h2><p>它是一套可被清晰讲述的 AI 产品方法：场景拆解 → Agent 分工 → Prompt 编排 → 结构化输出 → 评估闭环。</p></div><div className="quote">“我将专业小红书运营团队的工作流拆解为 Audience、Planner、Writer 和 Evaluator 等 Agent，实现从用户洞察到内容优化的生产闭环。”</div></section>
  </motion.div>;
}

export const Route = createFileRoute("/")({
  component: App,
});
