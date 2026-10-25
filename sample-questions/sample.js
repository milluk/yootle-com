(() => {
  'use strict';
  const loadState = document.getElementById('load-state');
  if (!window.YOOTLE_SAMPLE || !window.YOOTLE_REPORT || !window.YOOTLE_REPORT_VIEW) {
    loadState.textContent = 'The sample did not load completely. Please open the preview in a new tab. Keep any tab with existing answers open.';
    return;
  }
  const { items, scale } = window.YOOTLE_SAMPLE;
  const byId = id => document.getElementById(id);
  const slider = byId('answer-slider');
  const layers = { WHO: 'People & culture', WHOM: 'Customers & stakeholders', WHY: 'Strategy & direction', HOW: 'Execution & processes', WHAT: 'Products & services' };
  // Page-lifetime state only: an untouched thumb is never recorded as an answer.
  let index = 0;
  let reportOpen = false;
  let answers = Object.create(null);
  const hasAnswer = () => Object.hasOwn(answers, items[index].id);

  function showAnswer() {
    const chosen = hasAnswer();
    const text = chosen ? `${answers[items[index].id]} — ${scale.labels[answers[items[index].id]]}` : 'No answer selected';
    byId('answer-value').textContent = text;
    slider.setAttribute('aria-valuetext', chosen ? text : 'No answer selected. Use the arrow keys to choose a value.');
    slider.classList.toggle('unanswered', !chosen);
    slider.dataset.answered = String(chosen);
    byId('next').disabled = !chosen;
    byId('browse-hint').textContent = chosen ? 'Answer selected. Continue when ready.' : 'Choose a value to continue. The starting position is not an answer.';
  }
  function selectAnswer() {
    if (index >= items.length) return;
    answers[items[index].id] = Number(slider.value);
    showAnswer();
  }
  function render(moveFocus = true) {
    const complete = reportOpen || index === items.length;
    byId('question-panel').hidden = complete;
    byId('completion').hidden = !complete;
    byId('next').hidden = complete;
    byId('browse-hint').hidden = complete;
    byId('back').disabled = !complete && index === 0;
    byId('show-report').hidden = complete;
    byId('position').textContent = complete ? 'Your illustrative sample report' : `Question ${index + 1} of ${items.length}`;
    byId('sample-progress').value = Math.min(index + 1, items.length);
    byId('sample-progress').textContent = `${Math.min(index + 1, items.length)} of ${items.length}`;
    if (complete) {
      window.YOOTLE_REPORT_VIEW.render(answers);
      if (moveFocus) byId('completion-title').focus();
      return;
    }
    window.YOOTLE_REPORT_VIEW.clear();
    const item = items[index];
    byId('question-panel').dataset.questionId = item.id;
    byId('layer').textContent = item.layer ? `${item.layer} · ${layers[item.layer]}` : item.category === 'meta' ? 'Your perspective' : 'Questionnaire check';
    byId('perspective').textContent = item.category === 'core' ? (item.type === 'I' ? 'What leadership says' : 'What employees experience') : '';
    byId('question-title').textContent = item.text;
    byId('scale-prompt').textContent = scale.prompt;
    byId('pair-note').textContent = item.type === 'I' ? 'Claim = what your organization says' : 'Reality = what you actually experience';
    byId('pair-note').hidden = item.category !== 'core';
    byId('next').textContent = index === items.length - 1 ? 'View sample report →' : 'Next →';
    slider.value = hasAnswer() ? answers[item.id] : 3;
    byId('scale-labels').closest('details').open = false;
    showAnswer();
    if (moveFocus) byId('question-title').focus();
  }
  for (let point = 1; point <= scale.points; point += 1) {
    const li = document.createElement('li');
    li.textContent = scale.labels[point];
    byId('scale-labels').append(li);
  }
  // Native range input handles touch, dragging and keyboard increments of one.
  slider.addEventListener('input', selectAnswer);
  // Explicitly tapping the resting position also chooses that value.
  slider.addEventListener('pointerup', selectAnswer);
  // Home/End at an already-resting endpoint still represent an explicit choice.
  slider.addEventListener('keyup', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) selectAnswer();
  });
  byId('back').addEventListener('click', () => { if (reportOpen) reportOpen = false; else if (index > 0) index -= 1; render(); });
  byId('next').addEventListener('click', () => { if (index < items.length && hasAnswer()) { index += 1; render(); } });
  byId('reset').addEventListener('click', () => { answers = Object.create(null); index = 0; reportOpen = false; render(); byId('position').textContent = 'Choices cleared · Question 1 of 35'; });
  window.addEventListener('pageshow', event => { if (event.persisted) { answers = Object.create(null); index = 0; reportOpen = false; render(false); } });
  byId('show-report').addEventListener('click', () => { reportOpen = true; render(); });
  byId('complete-answers').addEventListener('click', () => { const missing = window.YOOTLE_REPORT.summarize(answers).missing[0]; if (missing) { index = items.findIndex(item => item.id === missing); reportOpen = false; render(); } });
  render(false);
  byId('sample').hidden = false;
  loadState.hidden = true;
})();
