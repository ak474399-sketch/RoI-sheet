# IAP 订阅 ROI 预测器 — 产品需求与技术规格文档

> 版本：v1.0 | 日期：2026-05-21
> 目标：基于 Next.js 构建一个 Web 端订阅类 IAP 项目 Day180 ROI 回收预测工具

---

## 一、产品概述

用户输入投放参数与产品参数，工具实时计算并展示：
- 逐周订阅用户数衰减曲线
- 逐周累计收益与累计 ROI
- Day180 回收预测
- 扣年指标（剔除年订阅一次性收益后的真实回收节奏）
- 多方案对比
- 导出 CSV/Excel

---

## 二、核心计算逻辑（必须严格实现）

### 2.1 基础参数

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `adSpend` | 买量成本（总投放消耗） | 3000 |
| `cpi` | 每次安装成本 | 3.00 |
| `totalUsers` | 用户数 = adSpend / cpi | 1000 |
| `weeklySubRate` | 周订阅转化率 | 13.5%（展示为14%） |
| `yearlySubRate` | 年订阅转化率 | 1.5% |
| `weeklySubPrice` | 周订阅价格 | 9.99 |
| `yearlySubPrice` | 年订阅价格 | 39.99 |
| `platformFee` | 平台抽成 | 默认 0.15，可选 0.30 |
| `adRevenueLTV` | 广告收益（全体用户 ARPU，总量） | 30 |
| `rebateRevenue` | 返点收益（总量） | 0（可配置） |
| `firstWeekMode` | 首周计费模式 | `'intro099'` \| `'direct'` \| `'free_trial'` |

### 2.2 衍生计算

```
weeklyUsers   = totalUsers * weeklySubRate        // 周付费用户数（如 135）
yearlyUsers   = totalUsers * yearlySubRate        // 年付费用户数（如 15）
totalPayUsers = weeklyUsers + yearlyUsers         // 总付费用户数（如 150）
cpa           = adSpend / totalPayUsers           // 每付费用户成本（如 20）
```

### 2.3 留存衰减表（默认值，用户可编辑每行）

```
W0:  100%  W1:  45%  W2:  70%  W3:  75%  W4:  75%
W5:  80%   W6:  80%  W7:  90%  W8:  90%  W9:  90%
W10: 90%   W11: 99%  W12~W25: 99%（之后保持 99%）
```

- `subscribers[0] = weeklyUsers`
- `subscribers[N] = subscribers[N-1] * retentionRates[N]`（N ≥ 1）

### 2.4 各周收益计算

**年订阅一次性收益（仅在第 0 周计入）：**
```
annualRevenue = yearlyUsers * yearlySubPrice * (1 - platformFee)
// 示例: 15 * 39.99 * 0.85 = 509.86
```

**周订阅每周净收益：**
```
// W0 首周，根据 firstWeekMode：
if firstWeekMode == 'direct':
    weeklyRev[0] = subscribers[0] * weeklySubPrice * (1 - platformFee)
if firstWeekMode == 'intro099':
    weeklyRev[0] = subscribers[0] * 0.99 * (1 - platformFee)
    // 示例: 135 * 0.99 * 0.85 = 113.47
if firstWeekMode == 'free_trial':
    weeklyRev[0] = 0

// W1 及以后：
weeklyRev[N] = subscribers[N] * weeklySubPrice * (1 - platformFee)
// 示例 W1: 60.75 * 9.99 * 0.85 = 515.85
```

**广告收益（adRevenueLTV）处理：**
- 作为一次性总量在第 0 周全额计入累计收益
- 若用户将广告收益设为 0 则不计入

**返点收益（rebateRevenue）处理：**
- 同上，作为一次性总量在第 0 周全额计入

**累计收益：**
```
cumRevenue[0] = annualRevenue + weeklyRev[0] + adRevenueLTV + rebateRevenue
cumRevenue[N] = cumRevenue[N-1] + weeklyRev[N]   （N ≥ 1）
```

> ✅ 验证：cumRevenue[0] = 509.86 + 113.47 + 0 + 0 = 623.33 ≈ 623.48（示例值）

**累计 ROI：**
```
roi[N] = cumRevenue[N] / adSpend * 100%
// 示例 W0: 623.48 / 3000 = 20.78% ≈ 21%
```

### 2.5 扣年指标

```
// 扣年消耗：剔除年订阅首付后的"等效净成本"
netCostExYear = adSpend - annualRevenue
// 示例: 3000 - 509.86 = 2490.14

// 扣年 Day7 ROI：首周累计收益 / 扣年消耗
day7RoiExYear = cumRevenue[0] / netCostExYear * 100%
// 示例: 623.48 / 2490.13 = 25.04% ≈ 25%
```

### 2.6 预测结果需展示的衍生指标

- **回本周数**：`roi[N] >= 100%` 时的最小 N（插值，精确到小数）
- **Day180 ROI**：第 25.7 周（≈180天/7天）时的累计 ROI，可线性插值
- **Day7 ROI（含年）**：`cumRevenue[0] / adSpend`
- **Day7 ROI（扣年）**：`cumRevenue[0] / netCostExYear`

---

## 三、页面结构与组件规划

```
app/
├── page.tsx                    # 主页，管理全局状态（scenario 列表）
├── layout.tsx                  # 全局布局
└── globals.css

components/
├── ParamPanel/
│   ├── index.tsx               # 参数面板容器（Tab 切换或卡片分组）
│   ├── InvestmentSection.tsx   # 投放端：买量成本、CPI（自动计算用户数和CPA）
│   ├── VariableSection.tsx     # 变量：订阅率、订阅价格、平台抽成
│   ├── ConversionSection.tsx   # 转化率：广告收益、返点收益、首周模式
│   └── RetentionEditor.tsx     # 续订率表格（可编辑每周留存率，最少26周）
├── ResultPanel/
│   ├── index.tsx               # 结果面板容器
│   ├── SummaryCards.tsx        # 关键指标卡片（Day7/Day30/Day60/Day180 ROI，回本周，扣年指标）
│   ├── ROIChart.tsx            # ROI 折线图（x轴=周数，y轴=ROI%，标注100%回本线）
│   └── ProjectionTable.tsx     # 详细预测表格（周数、订阅数、周收益、累计收益、累计ROI）
└── ScenarioManager/
    ├── ScenarioTabs.tsx        # 多方案 Tab（最多4个方案，可新增/删除/重命名）
    └── CompareView.tsx         # 对比视图（2个方案并排展示图表和关键指标）

lib/
├── types.ts                    # 所有 TypeScript 类型定义
├── calculator.ts               # 纯函数计算逻辑（不含 UI）
└── defaultParams.ts            # 默认参数（与示例表格完全对应）

utils/
└── exportData.ts               # CSV 导出逻辑（使用原生 Blob，不依赖重型库）
```

---

## 四、数据类型定义（lib/types.ts）

```typescript
export type FirstWeekMode = 'direct' | 'intro099' | 'free_trial';

export interface ProjectionParams {
  // 投放端
  adSpend: number;          // 买量成本
  cpi: number;              // CPI

  // 产品变量
  weeklySubRate: number;    // 周订阅率（0~1，如 0.135）
  yearlySubRate: number;    // 年订阅率（0~1，如 0.015）
  weeklySubPrice: number;   // 周订阅价格（如 9.99）
  yearlySubPrice: number;   // 年订阅价格（如 39.99）

  // 转化率 & 其他
  platformFee: number;      // 平台抽成（0.15 或 0.30）
  adRevenueLTV: number;     // 广告收益总量（ARPU × 用户数）
  rebateRevenue: number;    // 返点收益总量
  firstWeekMode: FirstWeekMode;

  // 续订率（index 0 = W0，index 1 = W1，以此类推，至少26个）
  retentionRates: number[]; // 每周留存率（0~1）
}

export interface WeeklyRow {
  week: number;             // 第N周
  label: string;            // "首周订阅" / "次周订阅" / "3周订阅" ...
  subscribers: number;      // 当周活跃订阅数
  weeklyRevenue: number;    // 当周订阅净收益
  cumulativeRevenue: number;// 累计收益
  roiPct: number;           // 累计 ROI（%）
}

export interface ProjectionResult {
  params: ProjectionParams;

  // 衍生基础数据
  totalUsers: number;
  weeklyUsers: number;
  yearlyUsers: number;
  totalPayUsers: number;
  cpa: number;
  annualRevenue: number;
  netCostExYear: number;    // 扣年消耗

  // 各周明细
  rows: WeeklyRow[];        // 26周（W0~W25）

  // 关键指标
  day7Roi: number;          // Day7 ROI（含年，%）
  day7RoiExYear: number;    // Day7 ROI（扣年，%）
  day30Roi: number;         // Day30 ROI（≈第4周，%）
  day60Roi: number;         // Day60 ROI（≈第8周，%）
  day180Roi: number;        // Day180 ROI（插值，%）
  breakEvenWeek: number | null; // 回本周数（null = 26周内未回本）
}

export interface Scenario {
  id: string;
  name: string;
  params: ProjectionParams;
  result: ProjectionResult;
}
```

---

## 五、默认参数（与示例表格完全对应）

```typescript
// lib/defaultParams.ts
export const DEFAULT_PARAMS: ProjectionParams = {
  adSpend: 3000,
  cpi: 3.00,
  weeklySubRate: 0.135,
  yearlySubRate: 0.015,
  weeklySubPrice: 9.99,
  yearlySubPrice: 39.99,
  platformFee: 0.15,
  adRevenueLTV: 0,       // 广告收益默认为0，用户可输入30
  rebateRevenue: 0,
  firstWeekMode: 'intro099',
  retentionRates: [
    1.00, 0.45, 0.70, 0.75, 0.75,  // W0~W4
    0.80, 0.80, 0.90, 0.90, 0.90,  // W5~W9
    0.90, 0.99, 0.99, 0.99, 0.99,  // W10~W14
    0.99, 0.99, 0.99, 0.99, 0.99,  // W15~W19
    0.99, 0.99, 0.99, 0.99, 0.99,  // W20~W24
    0.99,                           // W25
  ],
};
```

---

## 六、计算逻辑实现（lib/calculator.ts）

calculator.ts 必须导出一个纯函数 `calculateProjection(params: ProjectionParams): ProjectionResult`，内部逻辑严格按照第二节规格实现，**不得引入任何副作用或 UI 依赖**。

关键注意点：
1. `totalUsers` 由 `adSpend / cpi` 计算得到，不是直接输入
2. Day30 ROI 使用第 4 周（index=4）的数据（4×7=28天，最近似30天）
3. Day60 ROI 使用第 8 周（index=8）的数据
4. Day180 ROI 使用第 25 周与第 26 周之间的线性插值（180/7 ≈ 25.71）
5. 续订率数组长度不足26时，用最后一个值补全

---

## 七、UI 设计规范

### 技术栈
- **框架**：Next.js 15（App Router）
- **语言**：TypeScript（严格模式）
- **样式**：Tailwind CSS + shadcn/ui 组件库
- **图表**：Recharts
- **导出**：原生 Blob（CSV），不引入 xlsx 等重型库

### 视觉风格
- 整体色调：深色专业风（深灰背景 `#0f1117`，卡片 `#1a1d27`）
- 主色：蓝紫渐变（`#6366f1` ~ `#8b5cf6`）
- 正向数据（ROI > 100%）绿色高亮
- 负向/未回本数据红色标注
- 字体：系统字体栈，数字使用等宽字体

### 布局
```
┌─────────────────────────────────────────────────────────┐
│  顶栏：标题 + 方案 Tabs（+新增方案按钮）+ 对比/单视图切换  │
├────────────────┬────────────────────────────────────────┤
│                │  关键指标卡片行                          │
│  参数输入面板   ├────────────────────────────────────────┤
│  （左侧固定）   │  ROI 折线图                             │
│                ├────────────────────────────────────────┤
│                │  周预测详细表格（可滚动，固定表头）        │
└────────────────┴────────────────────────────────────────┘
```

### 参数面板细节
- 分为三个卡片分组：「投放端」、「产品变量」、「其他收益」
- 续订率可以用紧凑型网格编辑（每格一个输入框，宽度最小化）
- 参数变化时实时计算（`useMemo` 或 `useEffect`，无需提交按钮）
- 数字输入框限制合理范围（如订阅率 0~100%，价格 > 0）

### ROI 图表细节
- X 轴：第 0~25 周（下方标注天数：D0, D7, D14...）
- Y 轴：百分比，自适应范围
- 红色虚线标注 ROI = 100%（回本线）
- Tooltip 显示：周数、订阅数、累计收益、ROI%
- 标注 Day7 / Day30 / Day60 / Day180 四个参考点

### 预测表格列定义
| 列 | 说明 |
|----|------|
| 周期 | 首周订阅 / 次周订阅 / 3周订阅... |
| 周订阅数 | 保留2位小数 |
| 周订阅收益 | ¥ 保留1位小数 |
| 累计收益 | ¥ 保留1位小数 |
| 累计ROI | % 保留0位小数，>= 100% 绿色 |

---

## 八、多方案对比功能

- 最多支持 4 个方案
- 默认方案名："方案A"、"方案B"...
- 每个方案独立维护参数和计算结果
- 新建方案时复制当前方案参数
- 对比视图：两个方案的 ROI 折线图叠加展示（不同颜色），关键指标并排卡片

---

## 九、导出功能

CSV 导出内容：
```
周期,周订阅数,周订阅收益,累计收益,累计ROI
首周订阅,135,113.6,623.5,21%
次周订阅,60.75,515.9,1139.3,38%
...
```

文件名格式：`roi-prediction-方案A-20260521.csv`

---

## 十、验证数据（开发完成后必须核对）

使用以下参数运行，结果需与参考值对齐（±0.5 以内）：

| 参数 | 值 |
|------|----|
| adSpend | 3000 |
| cpi | 3.00 |
| weeklySubRate | 0.135 |
| yearlySubRate | 0.015 |
| weeklySubPrice | 9.99 |
| yearlySubPrice | 39.99 |
| platformFee | 0.15 |
| firstWeekMode | intro099 |
| adRevenueLTV | 0 |

| 指标 | 期望值 |
|------|--------|
| totalUsers | 1000 |
| weeklyUsers | 135 |
| yearlyUsers | 15 |
| cpa | 20.00 |
| W0 subscribers | 135 |
| W1 subscribers | 60.75 |
| W2 subscribers | 42.53 |
| W0 weeklyRevenue | 113.5 |
| W1 weeklyRevenue | 515.9 |
| W0 cumRevenue | 623.5 |
| W1 cumRevenue | 1139.3 |
| W0 ROI | 21% |
| W1 ROI | 38% |
| netCostExYear | 2490.1 |
| day7RoiExYear | 25% |
| W14 cumRevenue | ~3001.9（回本周） |

---

## 十一、开发顺序建议

1. `npx create-next-app@latest . --typescript --tailwind --app --no-eslint --import-alias "@/*" --yes`
2. `npx shadcn@latest init`，选择 Default style，Dark theme
3. 安装依赖：`npm install recharts`
4. 实现 `lib/types.ts` → `lib/defaultParams.ts` → `lib/calculator.ts`
5. 编写 calculator 单元测试（用 Node.js 脚本跑，验证第十节数据）
6. 构建 UI 组件（从内到外：卡片 → 图表 → 表格 → 面板 → 页面）
7. 整合主页面状态管理
8. 实现导出功能
9. 响应式调试（最小支持 1280px 宽度）

---

## 十二、注意事项

- 所有计算在前端完成，无需后端 API
- 严禁引入不必要的重型依赖（目标 bundle < 500KB gzip）
- 组件使用 `'use client'` 声明（因为有大量交互状态）
- 数字精度统一用 `Math.round(x * 100) / 100` 处理
- 续订率输入框输入百分比（如输入 45 表示 45%），内部存储为小数（0.45）
- 所有中文文案硬编码即可，不需要 i18n
