window.__ModuleLoader__.load({
	id: "dsh-plugin-aghr",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const h = React.createElement;

		/** 本插件在客户端语言服务里的命名空间。 */
		const NS = "dshPluginAghr";

		//#region 样式
		/**
		 * 本页样式。
		 *
		 * 手写注入而不是 CSS 模块：本包没有编译步骤，`lib/client.js` 就是最终产物。
		 * 只用 dsh 自己的设计令牌（`--dsw-alias-*` / `--dsw-radius-*`），跟随主题与明暗模式；
		 * `data-plugin-css` 上的标记与官方客户端插件同一写法，重复挂载只注入一次。
		 */
		const CSS = [
			".dsh-aghr-section{display:flex;flex-direction:column;gap:16px}",
			".dsh-aghr-head{display:flex;flex-direction:column;gap:6px}",
			".dsh-aghr-title{margin:0;font-size:20px;font-weight:500;line-height:28px}",
			".dsh-aghr-lede{margin:0;font-size:14px;line-height:22px;color:var(--dsw-alias-label-secondary)}",
			".dsh-aghr-block{display:flex;flex-direction:column;gap:8px}",
			".dsh-aghr-block-title{margin:0;font-size:14px;font-weight:500;line-height:20px}",
			".dsh-aghr-muted{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}",
			".dsh-aghr-list{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px}",
			".dsh-aghr-list li{font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}",
			".dsh-aghr-facts{margin:0}",
			".dsh-aghr-facts div{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:40px;padding:6px 2px;border-bottom:.5px solid var(--dsw-alias-border-l2)}",
			".dsh-aghr-facts dt{flex:none;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}",
			".dsh-aghr-facts dd{margin:0;min-width:0;text-align:end;overflow-wrap:anywhere;font-size:13px;line-height:20px}",
			".dsh-aghr-code{font-family:var(--ds-font-family-code);font-size:12px;padding:2px 6px;border-radius:4px;background:var(--dsw-alias-bg-module-platform);box-decoration-break:clone}",
			".dsh-aghr-note{margin:0;display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".dsh-aghr-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;counter-reset:dsh-aghr-step}",
			".dsh-aghr-steps li{display:flex;gap:10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}",
			".dsh-aghr-steps li:before{counter-increment:dsh-aghr-step;content:counter(dsh-aghr-step);flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font-size:11px;font-weight:500}",
		].join("");

		const CSS_TAG_ID = "dsh-plugin-aghr/aghrSection.css";
		if (
			typeof document !== "undefined" &&
			document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_TAG_ID) + "]") === null
		) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-aghr";
			tag.dataset.pluginCss = CSS_TAG_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region 文案
		/** 中文文案。 */
		const zh = {
			tabLabel: "AGHR",
			title: "AGHR 团队（中文）",
			lede: "让模型把复杂任务做完、做对：先探清题目，再决定拆不拆；拆开的每一步都能被检查，验不了的地方老实标成不确定。",
			whatTitle: "它解决什么",
			whatBody:
				"一次性要模型给出完整答案，常见毛病是跳步、隐含假设不说、中间错了一路往后传，最后你还没法核验。这个包把「拆不拆、拆到哪、怎么验」变成一套能照着走的流程，并且让执行和审计由不同的角色来做——因为模型说「我算对了」本身不是证据。",
			contentsTitle: "装了什么",
			contentPresetTitle: "1. 一个会话预设",
			contentPresetBody:
				"新建会话时选上它，会话里就有四个职责位：Leader 对接你并对交付负责，Planner 拆任务定验收标准，Operator 干活，Validator 事后审计。",
			contentSkillTitle: "2. 一份方法技能",
			contentSkillBody:
				"技能正文随包分发，插件启用时注册给会话。内容是照着做的流程：先探测、按认知难点拆、给每个节点定验收条件、验不过就分类回退、结论标验证状态。",
			contentUiTitle: "3. 这一页",
			contentUiBody: "Plugins 页里的说明页，讲清这个包是什么、怎么用、代价在哪。",
			usageTitle: "怎么用",
			usageStep1: "新建会话时在预设选择里挑「AGHR 团队（中文）」，会话就按四个职责位分工。",
			usageStep2: "技能默认可用，模型自己会调；也可以直接说「用 aghr 拆这个问题」。",
			usageStep3: "适合结果必须能验的任务：教材级题目、工程计算、多步代码改动、多来源核对。",
			usageStep4: "在 Plugins 页停用本包就回到你原来的预设，它不改任何全局配置。",
			factsTitle: "包信息",
			factPackage: "包名",
			factVersion: "版本",
			factPreset: "预设",
			factSkill: "技能",
			factSlots: "客户端位置",
			factSlotsValue: "Plugins 页：一个标签页，加详情页里的一段说明",
			noteTitle: "注意",
			noteDuplicate: "这个包比别的预设更费上下文和时间：它的取向是宁可多花也要把任务做完，不是省 token。",
			noteShadow:
				"技能同名冲突：工作区里已经有同名技能时以工作区那份为准——项目级目录的优先级高于包内注册，不是本包的缺陷。",
			detailTitle: "这个包里的东西",
			detailBody: "一个会话预设、一份方法技能，以及 Plugins 页里的这一页说明。",
		};

		/** 英文文案。 */
		const en = {
			tabLabel: "AGHR",
			title: "AGHR team (Chinese)",
			lede: "For finishing hard tasks right: probe the task first, decide whether and where to split, keep every step checkable, and mark what cannot be verified as uncertain.",
			whatTitle: "What it solves",
			whatBody:
				"Asking a model for the full answer in one shot tends to skip steps, hide assumptions, carry an early error to the end, and leave you no way to check. This package turns “whether to split, where, and how to verify” into a procedure, and separates doing from auditing — a model saying “it is correct” is not evidence.",
			contentsTitle: "What is inside",
			contentPresetTitle: "1. A session preset",
			contentPresetBody:
				"Pick it when starting a session and you get four seats: Leader faces you and owns delivery, Planner splits the task and sets acceptance criteria, Operator does the work, Validator audits afterwards.",
			contentSkillTitle: "2. A method skill",
			contentSkillBody:
				"The skill body ships with the package and is registered when the plugin loads: probe first, split by cognitive difficulty, give each node acceptance criteria, classify failures and roll back, label every conclusion with a verification status.",
			contentUiTitle: "3. This page",
			contentUiBody: "A page in Plugins explaining what the package is, how to use it, and what it costs.",
			usageTitle: "How to use it",
			usageStep1: "Start a session and choose “AGHR 团队（中文）” in the preset selector; the session then works in four seats.",
			usageStep2: "The skill is available by default; you can also say “use aghr to split this”.",
			usageStep3: "Best fit: tasks whose results must be checkable — textbook problems, engineering calculations, multi-step code changes, cross-source checks.",
			usageStep4: "Disabling the bundle in Plugins returns you to your previous preset; no global configuration is changed.",
			factsTitle: "Package",
			factPackage: "Package",
			factVersion: "Version",
			factPreset: "Preset",
			factSkill: "Skill",
			factSlots: "Client surface",
			factSlotsValue: "Plugins page: one tab, plus a section on the detail page",
			noteTitle: "Caveats",
			noteDuplicate: "This preset spends more context and time than others: it is built to finish the task, not to save tokens.",
			noteShadow:
				"Same-named skills: a skill in the workspace wins over the bundled one — project roots outrank runtime registration, and that is by design.",
			detailTitle: "Inside this package",
			detailBody: "A session preset, a method skill, and this page in Plugins.",
		};
		//#endregion

		//#region 组件
		/**
		 * 一行键值对。
		 *
		 * @param {object} props - `{ label, value }`。
		 * @returns {object} React 元素。
		 */
		function Fact(props) {
			return h("div", null, h("dt", null, props.label), h("dd", null, props.value));
		}

		/**
		 * 小标题 + 内容块。
		 *
		 * @param {object} props - `{ title, children }`。
		 * @returns {object} React 元素。
		 */
		function Block(props) {
			return h(
				"section",
				{ className: "dsh-aghr-block" },
				h("h3", { className: "dsh-aghr-block-title" }, props.title),
				props.children,
			);
		}

		/**
		 * 本包的说明正文。
		 *
		 * @param {object} props - 由 `inject()` 合入的 `{ t }`，以及 slot 提供的标准 props。
		 * @returns {object} React 元素。
		 */
		function AghrSection(props) {
			const t = props.t;
			return h(
				"div",
				{ className: "dsh-aghr-section" },
				h(
					"header",
					{ className: "dsh-aghr-head" },
					h("h2", { className: "dsh-aghr-title" }, t("title")),
					h("p", { className: "dsh-aghr-lede" }, t("lede")),
				),
				h(Block, { title: t("whatTitle") }, h("p", { className: "dsh-aghr-muted" }, t("whatBody"))),
				h(
					Block,
					{ title: t("contentsTitle") },
					h(
						"ul",
						{ className: "dsh-aghr-list" },
						h("li", null, h("strong", null, t("contentPresetTitle")), " — ", t("contentPresetBody")),
						h("li", null, h("strong", null, t("contentSkillTitle")), " — ", t("contentSkillBody")),
						h("li", null, h("strong", null, t("contentUiTitle")), " — ", t("contentUiBody")),
					),
				),
				h(
					Block,
					{ title: t("usageTitle") },
					h(
						"ol",
						{ className: "dsh-aghr-steps" },
						h("li", null, t("usageStep1")),
						h("li", null, t("usageStep2")),
						h("li", null, t("usageStep3")),
						h("li", null, t("usageStep4")),
					),
				),
				h(
					Block,
					{ title: t("factsTitle") },
					h(
						"dl",
						{ className: "dsh-aghr-facts" },
						h(Fact, { label: t("factPackage"), value: h("code", { className: "dsh-aghr-code" }, "dsh-plugin-aghr") }),
						// 版本号要与 package.json 一致（浏览器半读不到 manifest，只能写在这里）。
						h(Fact, { label: t("factVersion"), value: "0.6.0" }),
						h(Fact, { label: t("factPreset"), value: h("code", { className: "dsh-aghr-code" }, "aghr") }),
						h(Fact, { label: t("factSkill"), value: h("code", { className: "dsh-aghr-code" }, "aghr") }),
						h(
							Fact,
							{
								label: t("factSlots"),
								value: t("factSlotsValue"),
							},
						),
					),
				),
				h(
					Block,
					{ title: t("noteTitle") },
					h("p", { className: "dsh-aghr-note" }, t("noteDuplicate")),
					h("p", { className: "dsh-aghr-note" }, t("noteShadow")),
				),
			);
		}

		/**
		 * 本包详情页上的补充段。
		 *
		 * 只在打开本包的页面时渲染；其它 bundle / 行 / 官方插件一律返回 null。
		 *
		 * @param {object} props - `{ t, subject }`。
		 * @returns {object|null} React 元素。
		 */
		function AghrDetailSection(props) {
			const subject = props.subject;
			const name = subject !== undefined && subject.kind === "bundle" ? subject.pkg.name : undefined;
			if (name !== "dsh-plugin-aghr") return null;
			const t = props.t;
			return h(
				"section",
				{ className: "dsh-aghr-block" },
				h("h3", { className: "dsh-aghr-block-title" }, t("detailTitle")),
				h("p", { className: "dsh-aghr-muted" }, t("detailBody")),
			);
		}
		//#endregion

		/** 依赖的客户端服务。 */
		const inject = ["slots", "locale"];

		/**
		 * 注册文案与两个槽位。
		 *
		 * @param {import("@deepseek-ai/cordis").Context} ctx - 浏览器插件上下文。
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-plugin-aghr: dictionaries");
			const t = ctx.locale.bind(NS);

			// Plugins 页顶部的「AGHR」标签页：说明这个包干什么、装了什么、怎么用。
			// 参数形状照 @deepseek-ai/dsh-client-ui-plugin-market/lib/client.js 的「发现」标签页。
			ctx.slots.inject("plugins.tab", () =>
				ctx.slots.register(
					{
						name: "plugins.tab",
						id: "aghr",
						order: 60,
						label: () => t("tabLabel"),
						locale: NS,
						inject: () => ({ t }),
					},
					AghrSection,
				),
			);

			// 本包自己的详情页：只对 subject.kind === "bundle" 且 pkg.name 为本包名的页面渲染。
			ctx.slots.inject("plugins.detail.section", () =>
				ctx.slots.register(
					{
						name: "plugins.detail.section",
						id: "aghr-detail",
						order: 60,
						inject: () => ({ t }),
					},
					AghrDetailSection,
				),
			);
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
