(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const names = ['People & culture', 'Customers & stakeholders', 'Strategy & direction', 'Execution & processes', 'Products & services'];
  function node(tag, attrs, text) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    if (text) el.textContent = text;
    return el;
  }
  function chart(layers) {
    const svg = node('svg', { viewBox: '0 0 560 540', role: 'img', 'aria-labelledby': 'radar-title radar-description' });
    svg.append(node('title', { id: 'radar-title' }, 'Your illustrative claims and perceived-reality profile'));
    svg.append(node('desc', { id: 'radar-description' }, 'Five equal sectors: WHO, WHOM, WHY, HOW, WHAT. Each axis uses the original 1 to 6 scale. Claims are dashed blue with square markers; perceived reality is solid teal with circular markers. Exact values and gaps appear in the table below.'));
    const cx = 280, cy = 262, radius = 190;
    const point = (angle, r) => [cx + Math.cos(angle * Math.PI / 180) * r, cy + Math.sin(angle * Math.PI / 180) * r];
    for (let j = 0; j < 5; j += 1) {
      const angle = -90 + j * 72, a = point(angle - 36, radius), b = point(angle + 36, radius);
      svg.append(node('path', { d: `M ${cx} ${cy} L ${a.join(' ')} A ${radius} ${radius} 0 0 1 ${b.join(' ')} Z`, class: `radar-sector sector-${j}` }));
      svg.append(node('line', { x1: cx, y1: cy, x2: a[0], y2: a[1], class: 'radar-divider' }));
    }
    for (let value = 1; value <= 6; value += 1) {
      svg.append(node('circle', { cx, cy, r: radius * value / 6, class: 'radar-ring' }));
      const tick = point(-54, radius * value / 6);
      svg.append(node('text', { x: tick[0] + 5, y: tick[1] + 4, class: 'radar-tick' }, String(value)));
    }
    layers.forEach((layer, j) => {
      const a = -90 + j * 72, end = point(a, radius), label = point(a, radius + 40);
      svg.append(node('line', { x1: cx, y1: cy, x2: end[0], y2: end[1], class: 'radar-axis' }));
      svg.append(node('text', { x: label[0], y: label[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'radar-label' }, layer.layer));
    });
    for (const type of ['reality', 'claims']) {
      const points = layers.map((layer, j) => point(-90 + j * 72, radius * layer[`${type}Value`] / 6));
      svg.append(node('polygon', { points: points.map(p => p.join(',')).join(' '), class: `radar-shape ${type}` }));
      points.forEach(([x, y]) => svg.append(type === 'claims'
        ? node('rect', { x: x - 4, y: y - 4, width: 8, height: 8, class: 'claims-marker' })
        : node('circle', { cx: x, cy: y, r: 6, class: 'reality-marker' })));
    }
    return svg;
  }
  function clear() {
    document.getElementById('report-chart').replaceChildren();
    document.getElementById('report-rows').replaceChildren();
    document.getElementById('supporting-answers').replaceChildren();
    document.getElementById('report-state').textContent = '';
  }
  function render(answers) {
    clear();
    const report = window.YOOTLE_REPORT.summarize(answers);
    const state = document.getElementById('report-state');
    state.textContent = report.complete ? 'All 30 core answers are included in this illustration.' : `${report.answered} of 30 core answers selected. Answer the remaining ${report.missing.length} to draw both complete profiles. Missing answers are not treated as zero.`;
    document.getElementById('complete-answers').hidden = report.complete;
    document.getElementById('report-chart').hidden = !report.complete;
    document.getElementById('report-legend').hidden = !report.complete;
    if (report.complete) document.getElementById('report-chart').append(chart(report.layers));
    report.layers.forEach((layer, j) => {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = layer.layer;
      heading.title = names[j];
      row.append(heading);
      for (const key of ['claims', 'reality', 'gap']) {
        const cell = document.createElement('td');
        cell.textContent = layer.available ? (key === 'gap' && Number(layer.gap) > 0 ? '+' : '') + layer[key] : 'Unavailable';
        row.append(cell);
      }
      document.getElementById('report-rows').append(row);
    });
    const supportLabels = { 'VAL-C1': 'Speaking up about mismatches', 'VAL-C2': 'Shipping before ready', 'META-1': 'Confidence in these answers' };
    report.supporting.forEach(({ id, value }) => {
      const group = document.createElement('div');
      group.dataset.questionId = id;
      const label = document.createElement('dt');
      label.textContent = supportLabels[id];
      const detail = document.createElement('dd');
      const question = document.createElement('p');
      question.textContent = window.YOOTLE_SAMPLE.items.find(item => item.id === id).text;
      const answer = document.createElement('strong');
      answer.textContent = value === null ? 'Not answered' : `${value} / 6`;
      detail.append(question, answer);
      if (id === 'VAL-C2') {
        const direction = document.createElement('p');
        direction.className = 'support-direction';
        direction.textContent = 'Higher means more premature shipping. This is the original answer, without reverse coding.';
        detail.append(direction);
      }
      group.append(label, detail);
      document.getElementById('supporting-answers').append(group);
    });
    return report;
  }
  window.YOOTLE_REPORT_VIEW = { render, clear };
})();
