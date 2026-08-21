# STUDY BUDDY 任务板（汇总）

> 本文件由原 `TASK_BOARD.md`（Phase 2-D）、`TASK_BOARD_P3.md`（Phase 3）、`TASK_BOARD_P4.md`（Phase 4）三份阶段性任务板合并而成，按阶段分节保留完整历史。最新活跃阶段为 **Phase 4（个性化微课视频，进行中）**。
>
> 纪律：用户未明确「开始」不动代码；阶段任务经确认后开干，每完成一项更新状态 + 写记忆。

---

## Phase 2-D · 计费/账户收尾增强（✅ 全部完成）

目标：在 2-A/2-B/2-C/①闭环基础上，补齐计费与账户的收尾能力。用户 2026-08-06 确认范围 = 全部 D1–D8。

### 任务清单

| # | 任务 | 内容 | 优先级 | 状态 | 仓库 |
|---|------|------|--------|------|------|
| D1 | 网关侧 server 计量（防绕过） | gateway 在 AI 响应后代替 app 调 account 扣积分；建「网关↔账户」服务间信任（X-Service-Key + account requireService）；移除 app 端 fire-and-forget consume 防双扣 | P0 | ✅ completed | gateway + account + app |
| D2 | 套餐升降级 | /billing/change-plan：升级即时补差、降级 period-end 生效 | P1 | ✅ completed | account + app |
| D3 | 退款占位 | /billing/refund：paid 订单标记 refunded（mock），可选回退当周期基础积分 | P2 | ✅ completed | account |
| D4 | 发票/账单列表 | paid 订单映射发票；/billing/invoices + 前端「我的→账单」 | P1 | ✅ completed | account + app |
| D5 | 后端价格可调（admin） | 受保护 /admin/plans·/admin/offerings CRUD，改价免发版；附 curl | P2 | ✅ completed | account |
| D6 | 定时 reconcile 守护 | 暴露 /billing/cron/reconcile 或 setInterval 兜底扫过期/续费 | P2 | ✅ completed | account |
| D7 | 低积分告警 | summary 返回 lowBalance；前端提示「积分不足」 | P2 | ✅ completed | account + app |
| D8 | 会话/设备管理 | /auth/sessions 列出 + /auth/sessions/:id/revoke 吊销 | P3 | ✅ completed | account |

### 决策记录
- D1 服务间信任：采用简单 **X-Service-Key header**（共享 `SB_SERVICE_SECRET` 环境变量），dev 足够；后续可升级 mTLS/JWT。
- D1 计费权威方：改为 **gateway 单侧扣费**，app 端 `_consumeAfter` 移除，避免双扣。
- D4/D5 本轮仅后端 API + curl 验证；前端/console UI 留待下一轮（除非用户改口）。

### 进度
- 2026-08-06：建板，开干 D1。
- 2026-08-06：D1–D8 全部 coding 完成并**端到端验证通过**。
  - 修复项：① 账户服务崩溃——Express 4 async 路由未捕获异常致 unhandledRejection 杀进程；装 `express-async-errors` + 顶层错误中间件 + 进程级 unhandledRejection/uncaughtException 守卫；② D3 `/billing/refund` 引用了不存在的 `orders.updated_at` 列 → 去掉该列引用；③ D5 验证脚本误用 POST 调 `PUT /admin/plans/:slug` → 改测试用 PUT。
  - 验证结论：D2 升降级、D3 退款 200、D4 发票列表、D5 admin 401/200/改价生效、D6 cron reconcile(processed 7/errors 0)、D7 lowBalance 双分支、D8 会话列出+吊销 全部通过；account `tsc --noEmit` 0 issues。
  - 服务现状：账户(8788) tsx watch 运行中；网关(8787) 运行中。

### AI 闭环（2026-08-07 启动，用户拍板）
**决策**：自建简单 AI 网关，无路由选择。扫描=VLM，分析/诊断/讲解/题组/周报=推理模型，陪伴=文本模型。供应商由后台 env `SB_PROVIDER`（openai/qwen/zhipu/deepseek）驱动，零代码切换；无 key 自动 mock。

| 编号 | 内容 | 状态 | 落点 |
|---|---|---|---|
| T0.5 | 网关接真模型（后台配置驱动） | ✅ completed | `study-buddy-gateway` config/models.ts + loader.ts + chat.ts + vision.ts |
| T2.3 | 扫描真接通 VLM | ✅ completed | `scan_screen.dart` 调 `GatewayClient.visionScan` |
| T3 | 诊断→KP 树→画像 | ✅ completed | `KnowledgeGraphScreen` 自动点亮薄弱点写 LeafMastery |
| T4 | 两条补救（推理模型） | ✅ completed | `leaf_detail_screen` 微讲座+练一练，prompt 对齐 PRD |
| T5.2 | 聊天式实时评估 | ✅ completed | `scan_screen` 调 `aiText(operation:'report')` |
| T5.4 | 反馈闭环 | ✅ completed | `FeedbackScreen` 已接入扫描结果 |

**验证**：网关 `tsc --noEmit` 0 issues；app `flutter analyze` 0 error。**待用户侧**：真机/真 key 的 live UI 端到端验证；在 `.env` 填 `SB_PROVIDER` + 对应 provider key 即切真实模型。

---

## Phase 3 · 学生端非AI功能补全（✅ 全部完成）

目标：在不依赖模型层的前提下，把学生端 MVP 里"非AI 部分"的明显缺环补齐。
前置已完成（详见 Phase 2-D）：计费/账户 D1–D8、扫描闭环、管培平台 8 模块 CRUD + KP 287、架构加固。

### 未开发完成工作 · 总览

#### A — 非AI（已完成）
| # | 任务 | 内容 | 优先级 | 状态 |
|---|------|------|--------|------|
| N1 | 扫描历史列表 | `ScanRecord` 本地模型已有，缺列表页：按时间倒序卡片，点开看单次明细 | P0 | ✅ done |
| N2 | 反馈/修订 UI | "识别有误？帮 AI 确认"：字符/答案/知识点修订 + 本地书写画像写入 + 可撤回 | P0 | ✅ done |
| N3 | 家长视图(MVP壳) | 角色切换 + 家长首页 + 周报壳(本地扫描记录聚合 mock) | P1 | ✅ done |
| N4 | 设置/隐私与数据保护 | 档案查看/编辑、本地数据导出(JSON)、清除本地档案、撤回反馈列表 | P1 | ✅ done |
| N5 | 成长记录存档 | `GrowthRecordScreen`：成长时间线（扫描/评估存档），本地数据 | P2 | ✅ done |
| N6 | C1 下发包真实消费 | `delivery_client.dart` 拉 console bundle → 初始化 `LeafMastery`；后端不可达优雅降级本地 mock；KG 屏加「C1 同步」按钮 | P2 | ✅ done |

#### B — AI 依赖（暂缓，等模型层桥通）
T0.5/T2.3/T3.x/T4.x/T5.2/T5.4 —— 见 Phase 2-D AI 闭环（已 ✅，待真机验证）。

### 今晚建议顺序
1. N1 扫描历史（最明显断点）
2. N2 反馈/修订（核心原则7）
3. N4 设置/隐私（合规叙事）
4. N3 家长视图壳
5. N5/N6 视余力

### 进度
- 2026-08-06 晚：N1–N4 全部 coding 完成，`flutter analyze` 0 error，`flutter build web --release` 通过。
- 新增文件：`feedback_entry.dart`、`scan_history_screen.dart`、`feedback_screen.dart`、`parent_home_screen.dart`、`weekly_report_screen.dart`、`settings_screen.dart`。
- 验证方式：本机无模拟器，仅静态编译 + web 预览验证，未做真机交互测试。

### ① Android 原生包（2026-08-07 凌晨）
- 装 Android SDK（commandlinetools-mac + openjdk@17 + platform-tools/build-tools;34.0.0/platforms;android-34）。`ANDROID_HOME=~/Library/Android`，`flutter config --android-sdk` 已设。
- `flutter build apk --debug` ✅ → `build/app/outputs/flutter-apk/app-debug.apk`（161MB，可直接 `adb install`）。
- 踩坑修复：`flutter_local_notifications` 需 core library desugaring → `build.gradle.kts` 加 `isCoreLibraryDesugaringEnabled=true` + desugar 依赖。
- `AndroidManifest.xml` 补权限：`INTERNET` / `POST_NOTIFICATIONS` / `SCHEDULE_EXACT_ALARM`，原已有 `CAMERA`。

### ② 知识图谱"色块钻取"改版（B 口径：独立钻取页）
- 用户拍板走 B：点单元跳独立单元详情页，再点末梢进末梢详情。
- 新增 `unit_detail_screen.dart`（单元全屏大色块矩阵）、`leaf_detail_screen.dart`（末梢整页：定义/状态/错因签名/标记/补救A/B）。
- `knowledge_graph_screen.dart` 移除就地展开，单元卡改 `Navigator.push(UnitDetailScreen)`；加「C1 同步」按钮；`pending` 自动点亮改为仅首次应用一次。

### ③ N5/N6（见上表 ✅）
- N5 `growth_record_screen.dart` + home 入口。
- N6 `delivery_client.dart` + KG 屏「C1 同步」。

### 最终验证（2026-08-07 凌晨）
- `flutter analyze` 0 error；`flutter build web --release` ✓；`flutter build apk --debug` ✓。
- Web 预览 http://localhost:8080 已刷新。

---

## Phase 4 · 个性化微课视频（二期，进行中）

### 定位
扫描闭环识别到具体薄弱 KP 后，为**单个学生**生成**针对他错因**的讲解视频 —— 讲「他这次为什么错」的独特视频。复用现有 AI 闭环（网关已接真模型 + app 端 T2.3/T3/T4/T5 已通）。

### 目标
- 路线 A：**幻灯片 + 语音 + 字幕 + ffmpeg 合成 mp4**，先出片再播放（非真·流式）。
- **全自动、无人工干涉**：一键触发 → AI 自动出片，中间零人工。
- **个性化讲师（2026-08-07 用户拍板）**：视频讲师 = 学生选择的 buddy 形象；将来扩展讲师池，每位讲师 = 形象插画 + 专属音色 + 人设语气。→ V2 TTS 需多音色切换、V3 画面含讲师形象。
- 个性化输入：`LeafMastery.errorSignature` + 本次 `ScanRecord` 错题内容（+可选原图局部）。
- 个性化粒度：a（讲稿引错因/错题文字）→ b（错题原图局部贴画面）→ c（错题推导变式再讲），先做 a/b。

### 性能目标（用户硬性要求 2026-08-07）
- **AI 半分钟（30s）内完成一条 1-5 分钟视频，全程无人工干涉**。
- 实现手段：① 并行管线；② 模板画面缓存（命中 15-20s）；③ 冷启动 P90 ≤ 30s。

### 非目标（明确不做）
- ❌ 文生视频（Sora/可灵等）：成本不可控、公式/图形不可控。
- ❌ 真·流式（HLS）：工程难度数周~月，MVP 不划算。
- ❌ 通用模板微课（不读学生错因的）：本阶段只做个性化。

### 成本预估（单条 5/3/1 三档）
| 项 | 成本 |
|---|---|
| 讲稿生成（推理模型） | ≈ ¥0.01-0.1 |
| TTS 语音 | ¥0-1.3（edge-tts 免费 / 云 TTS 付费） |
| 画面+字幕+合成 | ≈0（模板渲染 + ffmpeg 本地） |
| **合计** | **≈ ¥0.1-1.5 / 条** |

### 依赖与现状
- ✅ 网关 T0.5 已接真模型（SB_PROVIDER 配置，无 key 自动 mock）。
- ✅ app 端闭环已通（scan→VLM→KG 点亮→补救文本版 5/3/1）。
- ⚠️ 服务端需确认：ffmpeg 二进制、中文字体、KaTeX 渲染环境。

### 任务清单
| # | 任务 | 内容 | 优先级 | 预估 | 状态 |
|---|------|------|--------|------|------|
| V0 | 选型确认 | TTS / 画面渲染 / ffmpeg 管线选型 | P0 | 0.5-1d | ✅ 部分达成 |
| V1 | 个性化讲稿（粒度 a） | 推理模型 prompt 升级：输入 kp+错因+错题 → 分镜 JSON（5/3/1 三档） | P0 | 1d | ⏳ 待开工 |
| V2 | TTS 服务化 | 分镜→音频（带时间戳），edge-tts 免费起步，mock 兜底 | P0 | 1-1.5d | ✅ 部分达成 |
| V3 | 画面渲染 | 幻灯片模板 + KaTeX 公式渲染；支持 b 级错题原图局部贴入（裁剪+抹姓名学号） | P1 | 2-3d | ⏳ 待开工 |
| V4 | 合成出片 | ffmpeg 图片序列+音频+字幕→mp4 | P1 | 1d | ✅ 部分达成 |
| V5 | 服务化+app 接入 | `POST /v1/course/video`（异步→轮询→mp4 URL，带缓存）；app 端接入；失败回退文本版 | P0 | 2d | ⏳ 待开工 |
| V6 | 个性化 c（可选） | 从错题推导变式再讲 | P2 | 2-3d | ⏳ 待开工 |

### 建议顺序
1. **V1 个性化讲稿（a）**——价值最高、成本最低起点。
2. V0 选型（与 V1 并行）→ V2 TTS → V4 合成 → V5 app 接入。
3. V3 画面（含 b 级原图）与 V6（c 级）后置。

### 开放问题 / 风险
- 服务端 ffmpeg / 中文字体 / headless 渲染环境是否就绪。
- TTS 中文音质（edge-tts 免费但一般；CosyVoice 音质好但付费）。
- 数学公式渲染质量（KaTeX→SVG→PNG）需先出样张验证。
- 数据红线：b 级只裁剪错题局部 + 抹姓名学号后再贴画面。

### 验收
- **性能**：一键触发全自动，P90 ≤ 30s 出片（缓存命中 ≤ 20s）。
- **无人干涉**：从扫描结果到 mp4 全程零人工。
- mock 模式跑通全流程，生成失败自动回退文本版。
- 真 key：真实语音 + 个性化讲稿，mp4 播放正常；错因与扫描结果一致。

### 进度
- 2026-08-07：确认方向（个性化微课视频）→ 挂板；补充硬指标（半分钟全自动）。
- 2026-08-07：**MVP 出片管线已跑通**：网关新增 `POST /v1/course/video` + `/media` 静态产物；edge-tts 真语音 → mp3；PIL 渲染 1280x720 中文字幕幻灯片；ffmpeg 合成 mp4。测试 `{kpName:"移项变号规则",...}` → 5 段 / 38.8 秒视频 / 生成 6.1 秒 / 528KB ✅。
- 2026-08-07：**风格优化 v2**：分镜式版式 + 逐条出现动画 + zoompan 推镜；测试 tier:"3" → 5 段 / 14 要点 / 38.8 秒 / 生成 7.9 秒 / 1.88MB ✅。
- 2026-08-07：**个性化错题 v3**：接口扩展 `errors:[{wrong,right,comment}]`；要点语义色 bad=红/good=绿；真正「专属讲解」达成（学生错式红字标记、正确写法绿色对照）。
- 仍待：**V1 讲稿接推理模型生成分镜**（当前本地模板）+ **V3 讲师形象换真插画** + **V5 app 接入**。
