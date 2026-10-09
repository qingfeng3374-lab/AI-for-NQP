// 全站共享的单例提示框状态。图表通过 showTip / moveTip / hideTip 驱动。
// content: { title, rows: [{ label, value, color }], note }
export const tip = $state({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  rows: [],
  note: '',
});

export function showTip(event, content) {
  tip.title = content.title ?? '';
  tip.rows = content.rows ?? [];
  tip.note = content.note ?? '';
  moveTip(event);
  tip.visible = true;
}

export function moveTip(event) {
  // 键盘聚焦时没有鼠标坐标，使用元素中心
  if (event && 'clientX' in event && event.clientX !== undefined && !(event.clientX === 0 && event.clientY === 0)) {
    tip.x = event.clientX;
    tip.y = event.clientY;
  } else if (event?.target?.getBoundingClientRect) {
    const r = event.target.getBoundingClientRect();
    tip.x = r.left + r.width / 2;
    tip.y = r.top;
  }
}

export function hideTip() {
  tip.visible = false;
}
