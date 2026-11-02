/**
 * dsh-plugin-aghr —— Host 半。
 *
 * 做两件事，都走运行时 API，不往 profile 里贴预设：
 *   1) 把包内 `skill/SKILL.md` 注册成名为 `aghr` 的技能；
 *   2) 用 `ctx.agentPresets.register()` 注册预设 `aghr`（四职责位团队版）。
 * 另外它让本包出现在 host Loader 的行表里：`@deepseek-ai/dsh-client-modules`
 * 按行名解析到本包的 package.json、读 `dsh.client`，才会加载浏览器半 `./client`。
 *
 * 为什么不把预设写进 cordis.patch.yml：那样写出来的是一份**静态复制的插件表**，
 * 换一台机器、换一个版本就得整份重抄，而且会把别人 profile 里的本机配置（绝对路径、
 * 私有 MCP）一起带出去。`ctx.agentPresets.register()` 接受 `{ id, name, description,
 * order, plugins }`，`plugins` 是普通的 Cordis 行表，所以在代码里按需挑行、按需给
 * 配置即可：这份包只声明自己真正需要的行。
 *
 * 为什么不给 `@deepseek-ai/dsh-skill-filesystem` 配 `customSkillDirs` / `bundledSkillDir`：
 * 这两个配置项只有"目录路径"一种表达方式，前者按 dsh 进程 cwd 解析，后者是单值且默认
 * 取环境变量 `DSH_BUNDLED_SKILL_DIR`，第三方包没法指向自己包内目录，只能写死绝对路径。
 * `ctx.skills.register()` 不需要任何路径配置。
 *
 * @module dsh-plugin-aghr
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** 包内技能正文的位置；用 import.meta.url 定位，不写死绝对路径。 */
const SKILL_URL = new URL("../skill/SKILL.md", import.meta.url);

/** 注册到 `ctx.skills` 的技能名，与 SKILL.md frontmatter 的 name 一致。 */
const SKILL_NAME = "aghr";

/** 预设的治理正文，随包分发，改文本不用改代码。 */
const PERSONA_URL = new URL("../assets/persona-aghr.md", import.meta.url);

/** 技能的资源根：模型提到 skill 里的相对路径时按这里解析。 */
const RESOURCE_BASE = {
	kind: "directory",
	path: fileURLToPath(new URL("../assets/", import.meta.url))
};

/** 随包技能在目录里的排序权重，与 skill-filesystem 的随包根同级。 */
const BUNDLED_SKILL_RANK = 600;

/**
 * frontmatter 缺失或解析失败时的兜底描述。
 *
 * `ctx.skills.register()` 要求 description 是非空字符串（dsh-skill 的
 * validateRuntimeSkill 会直接读 `skill.description.length`），所以这条兜底不能省。
 */
const FALLBACK_DESCRIPTION =
	"自适应粒度人机协同求解（AGHR）：先探测再决定要不要拆、怎么拆，用可验证性分类与验证状态控制错误传播。";

/**
 * 拆出 YAML frontmatter 与正文。
 *
 * 只实现本技能需要的极小子集（`---` 包裹、单行 `key: value` 标量），不引入 YAML 依赖：
 * 本包要能被任意 profile 直接 link，多一个依赖就多一处版本冲突。
 *
 * 解析不出 description 时保留兜底描述、仍把正文交给技能服务——宁可退化，不要让技能消失。
 *
 * @param {string} raw - SKILL.md 的完整内容。
 * @returns {{ description: string, content: string }} 技能定义所需的描述与正文。
 */
function parseSkill(raw) {
	const text = raw.replace(/^\uFEFF/, "");
	const opening = /^---[ \t]*\r?\n/.exec(text);
	if (opening === null) return { description: FALLBACK_DESCRIPTION, content: text };

	const rest = text.slice(opening[0].length);
	const closing = /^(?:---|\.\.\.)[ \t]*\r?\n/m.exec(rest);
	if (closing === null) return { description: FALLBACK_DESCRIPTION, content: text };

	const frontmatter = rest.slice(0, closing.index);
	const content = rest.slice(closing.index + closing[0].length);
	if (content.trim() === "") return { description: FALLBACK_DESCRIPTION, content: text };

	let description = "";
	for (const line of frontmatter.split(/\r?\n/)) {
		const match = /^description[ \t]*:[ \t]*(.*)$/.exec(line);
		if (match === null) continue;
		let value = match[1].trim();
		// 去掉可能存在的成对引号；本技能的 description 是裸标量，这里只是容错。
		if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
			value = value.slice(1, -1);
		}
		description = value;
		break;
	}

	return { description: description === "" ? FALLBACK_DESCRIPTION : description, content };
}

// ── 预设行表 ────────────────────────────────────────────────────────────────
// 每一行都是本包自己挑的，不照抄任何一台机器的 profile。
// 需要什么能力就放什么行；放不进去的能力（比如本机私有 MCP）交给使用者自己加。

const PREFIX = "“如果你忘记了自己是谁，回看工作区 AGENTS.md——那里有我给你的信件”。--tigrisheep";

const personaRow = (suffix) => ({
	id: "persona",
	name: "@deepseek-ai/dsh-persona",
	config: { prefix: PREFIX, suffix }
});

const ROW = {
	instructions: { id: "agent-instructions", name: "@deepseek-ai/dsh-agent-instructions", config: { maxBytes: 65536 } },
	time: { id: "time-context", name: "@deepseek-ai/dsh-time-context" },
	fs: { id: "tool-fs", name: "@deepseek-ai/dsh-tool-fs" },
	fsSearch: {
		id: "tool-fs-search",
		name: "@deepseek-ai/dsh-tool-fs-search",
		config: { sampleOverCapGlobResults: false }
	},
	bash: { id: "tool-bash", name: "@deepseek-ai/dsh-tool-bash", disabled: process.platform === "win32" },
	pwsh: { id: "tool-pwsh", name: "@deepseek-ai/dsh-tool-pwsh", disabled: process.platform !== "win32" },
	jobs: { id: "tool-jobs", name: "@deepseek-ai/dsh-tool-jobs" },
	web: { id: "tool-web", name: "@deepseek-ai/dsh-tool-web", config: { fetch: true, searchTimeoutMs: 60000 } },
	skillFiles: { id: "skill-filesystem", name: "@deepseek-ai/dsh-skill-filesystem" },
	skillTool: { id: "tool-skill", name: "@deepseek-ai/dsh-tool-skill" },
	todo: { id: "tool-todo", name: "@deepseek-ai/dsh-tool-todo", config: { allowParallelInProgress: true } },
	ask: { id: "tool-ask-user", name: "@deepseek-ai/dsh-tool-ask-user" },
	present: { id: "present", name: "@deepseek-ai/dsh-tool-present" },
	subagent: {
		id: "tool-subagent",
		name: "@deepseek-ai/dsh-tool-subagent",
		config: { provider: "spawn", toolName: "subagent", modelSelectionSettings: true }
	},
	subagentControl: { id: "tool-subagent-control", name: "@deepseek-ai/dsh-tool-subagent-control" },
	subagentList: { id: "tool-subagent-list-agents", name: "@deepseek-ai/dsh-tool-subagent-control/list-agents" }
};

/**
 * 压缩：必须整组装进同一个 isolate 隔离域。
 *
 * `command-compact` 注入 `compaction` 服务；如果提供者 `compaction-basic` 单独加
 * `isolate: { compaction: true }`，它就在自己的隔离域里，域外的 `command-compact`
 * 永远等不到这个服务，装配会以 `waiting for compaction` 报错。所以这里用 group 行
 * 承载 isolate，让提供者与消费者落在同一域内。
 *
 * `tool-result-pruner` 同样提供域内服务 `toolResultPruner`（`compaction-basic` 用
 * `ctx.get("toolResultPruner")` 按需取用，取不到就退回不裁剪），所以它的服务名也必须
 * 写进 isolate 映射——漏写会让该实现登记到 root realm，预设挂载直接失败：
 * `Preset services require isolate realms: toolResultPruner`。
 *
 * **相对 0.4.1，这一行是新增的，属行为变化而不是纯修复**：装了本预设的会话里，`bash` / `read`
 * 超过阈值的长输出会被裁掉中间一段（头尾保留），上下文增长更慢、更晚触发压缩，模型看到的工具
 * 结果也随之变短。这条不写 config，用插件自身默认 8192/4096/1024。
 *
 * 不设 `compaction-basic.config.modelPolicies`：那是「本机 provider/model 组合 + 每档
 * 预算」的机器相关配置，写进包里等于把别人的模型清单当默认值；`thresholdRatio` 等
 * 通用预算也交给插件自身默认值，避免和上游默认值漂移。`tool-result-pruner` 同理不传
 * config，用包内默认 8192/4096/1024。
 *
 * 这份常量对外导出，仅作可复核的测试缝：验证脚本可以拿它单独装配一次压缩域。
 */
const COMPACTION_ROWS = [
	{
		id: "compaction",
		name: "cordis:group",
		group: true,
		isolate: { compaction: true, toolResultPruner: true },
		config: [
			{ id: "compaction-basic", name: "@deepseek-ai/dsh-compaction-basic" },
			{ id: "command-compact", name: "@deepseek-ai/dsh-command-compact" },
			{ id: "tool-result-pruner", name: "@deepseek-ai/dsh-compaction-tool-result-pruner" }
		]
	}
];

/**
 * 团队版行表：四职责位要能读、能算、能检索、能派活、能计划。
 *
 * 刻意不含的东西：本机私有 MCP、run_code 之外的自定义工具、任何绝对路径。
 */
function teamRows(suffix) {
	return [
		personaRow(suffix),
		ROW.instructions,
		ROW.time,
		ROW.bash,
		ROW.pwsh,
		ROW.fs,
		ROW.fsSearch,
		ROW.jobs,
		ROW.skillFiles,
		ROW.skillTool,
		ROW.web,
		ROW.subagent,
		ROW.subagentControl,
		ROW.subagentList,
		ROW.ask,
		ROW.todo,
		ROW.present,
		...COMPACTION_ROWS
	];
}

const PRESET = {
	id: "aghr",
	name: "AGHR 团队（中文）",
	description: "四职责位：Leader 管用户与交付，Planner 管规划与事后决策，Operator 管执行，Validator 管事后审计。",
	order: 6,
	rows: teamRows
};

function readText(url) {
	return readFileSync(url, "utf8");
}

/** Cordis 插件名。 */
const name = "dsh-plugin-aghr";

/**
 * 依赖的服务：`skills` 负责技能注册，`agentPresets` 负责预设注册。
 *
 * 缺任一服务的 profile 里本行不会启用（技能与预设自然不可用），但浏览器半照样加载：
 * 客户端发现看的是 Loader 行表，不看这一行是否 apply 成功。
 */
const inject = ["skills", "agentPresets"];

/**
 * 注册预设，并把它自己的注销函数交给本插件的 fiber。
 *
 * `ctx.agentPresets.register()` 是 **async**，成功时返回这份定义自己的注销函数。
 * 那个返回值必须挂到 `ctx.effect` 上：热重载时 Cordis 先 dispose 旧 fiber、再重新执行
 * 本插件的 `apply`，没有注销动作，旧定义就留在 `registry.definitions` 里，第二次
 * `register()` 直接抛 `Duplicate agent preset: aghr`（web.log 里表现为
 * `dsh: fatal load failure`）。
 *
 * 注意两件容易写错的事：
 *
 * 1. **必须 await**。`register()` 拒绝时（id 重复、id 为空字符串）异常是走 promise
 *    拒绝的，不 await 就变成未捕获拒绝，绕开下面这个 try/catch，还会打断整条 Loader 行。
 * 2. **挂 disposer 只挂一份**。effect 的回调立即执行、返回的就是注销函数，不要在回调里
 *    再调一次 `register()`：那会在每次重载时多注册一份，反过来杀掉新实例。
 *
 * 装配期（mountPreset）的失败不会让 promise 拒绝——registry 自己把诊断记成 `broken`
 * 并写一条 warn，所以这里 catch 到的都是「定义没能登记」这一层的问题。
 *
 * @param {import("@deepseek-ai/cordis").Context} ctx - Host 插件上下文。
 */
async function registerPreset(ctx) {
	let unregister;
	try {
		const suffix = readText(PERSONA_URL);
		unregister = await ctx.agentPresets.register({
			id: PRESET.id,
			name: PRESET.name,
			description: PRESET.description,
			order: PRESET.order,
			plugins: PRESET.rows(suffix)
		});
	} catch (error) {
		ctx.logger.error(`dsh-plugin-aghr: 注册预设 ${PRESET.id} 失败：${String(error)}`);
		return;
	}

	try {
		ctx.effect(() => () => unregister(), "dsh-plugin-aghr: agent preset");
	} catch (error) {
		// 注册期间本插件的 fiber 已被卸载（热重载的竞态窗口）：effect 挂不上去，
		// 就得当场自己注销，否则这份定义会永久留在 registry 里。
		//
		// 注销动作自身也要包住：它若再抛，异常会从 `apply` 冒出去，把整条 Loader 行打成
		// FAILED —— 正是本次修复要消灭的形态。故失败只记日志、照常返回；代价是那份定义
		// 残留在 registry 里，随进程重启消失。成功路径的顺序未变（先 await，后 warn）。
		try {
			await unregister();
			ctx.logger.warn(`dsh-plugin-aghr: 预设 ${PRESET.id} 登记期间插件已卸载，已当场注销：${String(error)}`);
		} catch (failure) {
			ctx.logger.error(`dsh-plugin-aghr: 预设 ${PRESET.id} 登记期间插件已卸载，且当场注销失败（定义残留至重启）：${String(failure)}；原始错误：${String(error)}`);
		}
	}
}

/**
 * 注册技能与预设。
 *
 * 两件事各自 try/catch：技能失败不该连带预设消失，预设失败也不该让技能掉线。
 * `ctx.skills.register()` 自己把清理动作挂到调用方 fiber 上（`skills.register()`
 * effect），本函数不需要额外处理；`ctx.agentPresets.register()` 则相反，清理函数由
 * 调用方负责，见 {@link registerPreset}。
 *
 * 返回的 promise 不会拒绝：本函数内部已吞掉全部失败，只写日志。这样包内资产缺失或
 * 注册失败都不会把整条 Loader 行打成 FAILED，浏览器半照常加载。
 *
 * @param {import("@deepseek-ai/cordis").Context} ctx - Host 插件上下文。
 */
async function apply(ctx) {
	let content = "";
	let description = FALLBACK_DESCRIPTION;
	try {
		({ content, description } = parseSkill(readText(SKILL_URL)));
		ctx.skills.register({ name: SKILL_NAME, description, content, resourceBase: RESOURCE_BASE, rank: BUNDLED_SKILL_RANK });
	} catch (error) {
		// 包内资产缺失是打包错误。记一条错误就退出，不要抛出把整条 Loader 行打成 FAILED。
		ctx.logger.error(`dsh-plugin-aghr: 注册技能 aghr 失败：${String(error)}`);
	}

	await registerPreset(ctx);
}

export { COMPACTION_ROWS, apply, inject, name, parseSkill };
