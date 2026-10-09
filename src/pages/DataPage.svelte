<script>
  import PageHeader from '../lib/components/PageHeader.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import Legend from '../lib/components/Legend.svelte';
  import LineChart from '../lib/charts/LineChart.svelte';
  import HBarRank from '../lib/charts/HBarRank.svelte';
  import DivergingBars from '../lib/charts/DivergingBars.svelte';
  import { DATASETS, INDEXABLE } from '../data/catalog.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { fmtSci } from '../lib/utils/format.js';
  import { tr, isEn, loc } from '../lib/i18n/lang.svelte.js';

  // 渲染时翻译：仅对含中文的字符串查词典；「A · B」形式的标签逐段翻译
  const ZH = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/;
  const t = (s) => (s != null && ZH.test(String(s)) ? tr(s) : s);
  const tl = (s) => (s != null && ZH.test(String(s)) ? String(s).split(' · ').map(t).join(' · ') : s);
  // 单位：英文模式查「unit:单位」键（避免与用作后缀的短键冲突）
  const tu = (u) => (u != null && ZH.test(String(u)) && isEn() ? tr('unit:' + u) : u);
  // 标题末尾带日期（如「各省生成式 AI 备案数（2026-08-31）」）时以参数形式翻译
  const tTitle = (d) => {
    const mt = d.title.match(/^(.*)（(\d{4}-\d{2}-\d{2})）$/);
    return mt ? tr(mt[1] + '（{date}）', { date: mt[2] }) : t(d.title);
  };

  const GROUPS = ['全部', ...new Set(DATASETS.map((d) => d.group))];
  let group = $state('全部');
  let q = $state('');
  let currentId = $state('core');
  let copied = $state(false);

  const list = $derived(
    DATASETS.filter((d) => (group === '全部' || d.group === group) && (!q.trim() || (d.title + d.source + ' ' + tTitle(d) + ' ' + t(d.source)).toLowerCase().includes(q.trim().toLowerCase()))),
  );
  const ds = $derived(DATASETS.find((d) => d.id === currentId));
  const fmtV = (v) => (ds?.id === 'models' ? fmtSci(v) : Number.isInteger(v) ? v.toLocaleString(loc()) : (+v).toLocaleString(loc(), { maximumFractionDigits: 2 }));
  const sortedCat = $derived(ds && ds.kind === 'cat' ? [...ds.rows].sort((a, b) => b.value - a.value).map((r) => ({ name: tl(r.label), value: r.value })) : []);

  // ---- 导出 ----
  function toCSV(d) {
    const head = [tr('项目'), tr('数值（{unit}）', { unit: tu(d.unit) }), ...(d.rows.some((r) => r.extra) ? [tr('备注')] : [])];
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const lines = [head.map(esc).join(','), ...d.rows.map((r) => [tl(r.label), r.value, ...(r.extra ? [tl(r.extra)] : [])].map(esc).join(','))];
    lines.push('', esc(`${tr('来源：')}${t(d.source)}${d.note ? (isEn() ? '; ' : '；') + t(d.note) : ''}`));
    return '﻿' + lines.join('\n'); // BOM：保证 Excel 正确识别中文
  }
  function download(d) {
    const blob = new Blob([toCSV(d)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tTitle(d)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function copyJSON(d) {
    try {
      const rows = d.rows.map((r) => ({ ...r, label: tl(r.label), ...(r.extra ? { extra: tl(r.extra) } : {}) }));
      await navigator.clipboard.writeText(JSON.stringify({ title: tTitle(d), unit: tu(d.unit), source: t(d.source), rows }, null, 2));
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      copied = false;
    }
  }
  function downloadAll() {
    const blob = new Blob([JSON.stringify(DATASETS, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = tr('智能涌现-全部数据集.json');
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---- 指数对比：以基期 = 100 对齐不同量纲的增长速度（单一 y 轴） ----
  const BASES = ['2020', '2022'];
  let base = $state('2020');
  let picked = $state(['core', 'digital', 'robots-cn', 'adoption']);
  const idxSets = INDEXABLE.map((id) => DATASETS.find((d) => d.id === id));
  const available = (d, b) => d.rows.some((r) => r.label === b);
  const idxSeries = $derived(
    idxSets
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => picked.includes(d.id) && available(d, base))
      .map(({ d, i }) => {
        const b = d.rows.find((r) => r.label === base).value;
        return {
          name: tTitle(d),
          color: pal.series[i],
          points: d.rows.filter((r) => +r.label >= +base).map((r) => ({ x: r.label, y: Math.round((r.value / b) * 1000) / 10 })),
        };
      }),
  );
  function togglePick(id) {
    picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
  }
</script>

<PageHeader
  kicker="Data Workbench"
  title={tr('数据工作台')}
  lead={tr('本站使用的全部 <b>{n} 组数据</b>都在这里：可以检索、查看图表与原始表格、<b>下载 CSV</b> 用于作业和研究，也可以用「指数对比」比较不同指标的增长速度。', { n: DATASETS.length })}
>
  {#snippet aside()}
    <button class="all" onclick={downloadAll}>{tr('⬇ 下载全部数据（JSON）')}</button>
  {/snippet}
</PageHeader>

<div class="container">
  <div class="layout">
    <!-- 目录 -->
    <aside class="cat">
      <input class="q" type="search" placeholder={tr('搜索数据集或来源…')} bind:value={q} aria-label={tr('搜索数据集')} />
      <div class="groups">
        {#each GROUPS as g}
          <button class:on={group === g} onclick={() => (group = g)}>{tr(g)}</button>
        {/each}
      </div>
      <ul>
        {#each list as d}
          <li>
            <button class:on={currentId === d.id} onclick={() => (currentId = d.id)}>
              <span class="t">{tTitle(d)}</span>
              <span class="m">{tr(d.group)} · {tr('{n} 条', { n: d.rows.length })} · {tu(d.unit)}</span>
            </button>
          </li>
        {:else}
          <li class="empty">{tr('没有匹配的数据集')}</li>
        {/each}
      </ul>
    </aside>

    <!-- 详情 -->
    <div class="detail">
      {#if ds}
        <div class="dh">
          <div>
            <span class="tag">{tr(ds.group)}</span>
            <h2>{tTitle(ds)}</h2>
            <div class="meta">{tr('单位：')}{tu(ds.unit)} · {tr('来源：')}{t(ds.source)}{ds.note ? ` · ${t(ds.note)}` : ''}</div>
          </div>
          <div class="acts">
            <button onclick={() => download(ds)}>{tr('⬇ 下载 CSV')}</button>
            <button onclick={() => copyJSON(ds)}>{tr(copied ? '✓ 已复制' : '⧉ 复制 JSON')}</button>
          </div>
        </div>

        <div class="chart">
          {#key ds.id}
            {#if ds.kind === 'time'}
              <LineChart series={[{ name: tTitle(ds), color: pal.accent, points: ds.rows.map((r) => ({ x: r.label, y: r.value })) }]} unit={tu(ds.unit)} fmt={fmtV} ariaLabel={tTitle(ds)} />
            {:else if ds.kind === 'cat'}
              <HBarRank data={sortedCat} color={pal.accent} unit={tu(ds.unit)} fmt={fmtV} rowH={sortedCat.length > 14 ? 22 : 28} labelW={isEn() ? Math.min(220, Math.max(...sortedCat.map((d) => d.name.length)) * 6.8 + 10) : Math.min(170, Math.max(...sortedCat.map((d) => d.name.length)) * 13 + 10)} ariaLabel={tTitle(ds)} />
            {:else if ds.kind === 'div'}
              <DivergingBars data={ds.rows.map((r) => ({ name: tl(r.label), value: r.value }))} ariaLabel={tTitle(ds)} />
            {:else}
              <p class="tbl-only">{tr('该数据集跨越多个数量级或含文本字段，建议查看下方表格；在「数据叙事」页有对应的专门图表。')}</p>
            {/if}
          {/key}
        </div>

        <div class="tw">
          <table>
            <thead><tr><th>{tr('项目')}</th><th class="num">{tr('数值（{unit}）', { unit: tu(ds.unit) })}</th>{#if ds.rows.some((r) => r.extra)}<th>{tr('备注')}</th>{/if}</tr></thead>
            <tbody>
              {#each ds.rows as r}
                <tr><td>{tl(r.label)}</td><td class="num">{fmtV(r.value)}</td>{#if ds.rows.some((x) => x.extra)}<td>{tl(r.extra) ?? ''}</td>{/if}</tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>

  <div class="idx">
    <ChartCard
      title={tr('指数对比：谁增长得最快？')}
      subtitle={tr('不同指标量纲不同，统一换算为「基期 = 100」后放在同一纵轴上比较增长速度。缺少基期数据的指标会自动禁用')}
      table={{
        columns: [tr('指标'), ...[...new Set(idxSeries.flatMap((s) => s.points.map((p) => p.x)))]],
        rows: idxSeries.map((s) => [s.name, ...[...new Set(idxSeries.flatMap((z) => z.points.map((p) => p.x)))].map((x) => s.points.find((p) => p.x === x)?.y ?? '—')]),
      }}
    >
      {#snippet controls()}
        <div class="seg" role="group" aria-label={tr('基期')}>
          {#each BASES as b}<button class:on={base === b} onclick={() => (base = b)}>{tr('基期 {y}', { y: b })}</button>{/each}
        </div>
      {/snippet}
      <div class="picks">
        {#each idxSets as d, i}
          {@const ok = available(d, base)}
          <button class="pk" class:on={picked.includes(d.id) && ok} disabled={!ok} onclick={() => togglePick(d.id)} title={ok ? '' : tr('缺少 {y} 年数据', { y: base })}>
            <i style:background={pal.series[i]}></i>{tTitle(d)}
          </button>
        {/each}
      </div>
      <Legend items={idxSeries.map((s) => ({ label: s.name, color: s.color, shape: 'line' }))} />
      <LineChart series={idxSeries} baseline={100} fmt={(v) => (+v).toFixed(0)} height={320} ariaLabel={tr('指数对比折线图')} />
      {#snippet footer()}
        <p class="fn">{tr('读图提示：以 2020 年为基期，AI 核心产业规模到 2025 年约为基期的 4 倍，增速明显快于数字经济整体——AI 正在成为数字经济中最具活力的增长引擎。')}</p>
      {/snippet}
    </ChartCard>
  </div>
</div>

<style>
  .all {
    padding: 8px 16px;
    border-radius: 999px;
    border: 0;
    color: #fff;
    background: var(--accent-grad);
    font-weight: 700;
    font-size: 13px;
    white-space: nowrap;
    box-shadow: 0 6px 18px rgba(var(--accent-rgb), 0.3);
  }
  .layout {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  .cat {
    position: sticky;
    top: 76px;
    padding: 16px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    max-height: calc(100vh - 96px);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .q {
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font: inherit;
    font-size: 13px;
  }
  .groups {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .groups button {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-2);
    font-size: 12px;
  }
  .groups button.on {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-wash);
  }
  .cat ul {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cat li button {
    width: 100%;
    text-align: left;
    border: 0;
    border-left: 3px solid transparent;
    background: transparent;
    padding: 7px 10px;
    border-radius: 0 8px 8px 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .cat li button:hover {
    background: var(--hover-wash);
  }
  .cat li button.on {
    background: var(--accent-wash);
    border-left-color: var(--accent);
  }
  .t {
    font-size: 13px;
    color: var(--text-1);
    font-weight: 600;
  }
  .m {
    font-size: 11px;
    color: var(--text-3);
  }
  .empty {
    font-size: 12.5px;
    color: var(--text-3);
    padding: 8px;
  }
  .detail {
    padding: 22px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    min-width: 0;
  }
  .dh {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .tag {
    font-size: 11.5px;
    color: var(--accent);
    letter-spacing: 0.1em;
  }
  h2 {
    font-size: 22px;
    margin: 4px 0;
  }
  .meta {
    font-size: 12.5px;
    color: var(--text-3);
  }
  .acts {
    display: flex;
    gap: 8px;
  }
  .acts button {
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: 12.5px;
  }
  .acts button:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .chart {
    min-height: 120px;
    margin-bottom: 16px;
  }
  .tbl-only {
    color: var(--text-3);
    font-size: 13px;
  }
  .tw {
    max-height: 360px;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-s);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th,
  td {
    padding: 7px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  th {
    position: sticky;
    top: 0;
    background: var(--surface-3);
    color: var(--text-2);
  }
  td {
    color: var(--text-2);
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--text-1);
  }
  .idx {
    margin-top: 24px;
  }
  .picks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .pk {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 11px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-3);
    font-size: 12.5px;
  }
  .pk.on {
    color: var(--text-1);
    background: var(--surface-2);
    border-color: var(--border-strong);
  }
  .pk:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .pk i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .fn {
    margin: 0;
    font-size: 12.5px;
    color: var(--text-2);
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .cat {
      position: static;
      max-height: 340px;
    }
  }
</style>
