const shell = document.querySelector('.app-shell');
const roleButtons = document.querySelectorAll('.role-button');
const navItems = document.querySelectorAll('.nav-item');
const toast = document.getElementById('toast');
let activeRole = 'student';
let toastTimer;

const roleHome = { student: 'home', parent: 'parent-home' };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function showScreen(target) {
  const isParent = target.startsWith('parent') || target === 'report' || target === 'evidence';
  if (isParent && activeRole !== 'parent') switchRole('parent');
  if (!isParent && activeRole !== 'student') switchRole('student');
  const selector = activeRole === 'parent' ? '.parent-screen' : '.student-screen';
  document.querySelectorAll(selector).forEach((screen) => screen.classList.remove('is-active'));
  const selected = document.querySelector(`[data-screen="${target}"]`);
  if (selected) selected.classList.add('is-active');

  if (activeRole === 'student') {
    const navTarget = ['home', 'capture', 'knowledge-map', 'learn'].includes(target) ? target : '';
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.nav === navTarget));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchRole(role) {
  activeRole = role;
  shell.classList.toggle('parent-mode', role === 'parent');
  roleButtons.forEach((button) => {
    const selected = button.dataset.role === role;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  showScreen(roleHome[role]);
}

roleButtons.forEach((button) => button.addEventListener('click', () => switchRole(button.dataset.role)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.go)));
navItems.forEach((item) => item.addEventListener('click', () => showScreen(item.dataset.nav)));

document.getElementById('startScan').addEventListener('click', () => {
  showToast('识别完成：12 道题已切分，1 处需要你确认。');
  window.setTimeout(() => showScreen('scan'), 450);
});

document.getElementById('pickPhoto').addEventListener('click', () => {
  showToast('演示数据已加载，可以开始识别。');
});

document.querySelectorAll('.choice').forEach((choice) => choice.addEventListener('click', () => {
  document.querySelectorAll('.choice').forEach((item) => item.classList.remove('is-selected'));
  choice.classList.add('is-selected');
}));

document.getElementById('saveCorrection').addEventListener('click', () => {
  showToast('已记住这次书写特征，下次会更准确。');
  window.setTimeout(() => showScreen('scan'), 500);
});

document.querySelectorAll('[data-answer]').forEach((answer) => answer.addEventListener('click', () => {
  const correct = answer.dataset.answer === 'right';
  document.querySelectorAll('[data-answer]').forEach((item) => item.classList.remove('is-correct', 'is-wrong'));
  answer.classList.add(correct ? 'is-correct' : 'is-wrong');
  document.getElementById('lessonFeedback').textContent = correct
    ? '答对了！斜率为负时，x 越大，y 越小。'
    : '再想想：斜率前面的负号，表示 y 的变化方向相反。';
  document.getElementById('lessonFeedback').style.color = correct ? '#1d9b72' : '#c85c4a';
}));

document.getElementById('nextLesson').addEventListener('click', () => {
  showToast('已完成第 1 步。下一步：用 3 道题巩固判断。');
});

document.getElementById('profileButton').addEventListener('click', () => {
  showToast(activeRole === 'student' ? '林知夏 · 初二（人教版）' : '正在查看林知夏的学习档案');
});

document.querySelectorAll('[data-node]').forEach((node) => node.addEventListener('click', () => {
  const label = node.dataset.node;
  const status = node.classList.contains('green') ? '近期掌握稳定，先不用安排额外练习。'
    : node.classList.contains('red') ? '已列入本周优先补强清单。'
      : '建议下次复测时用 1-2 道变式题确认。';
  showToast(`${label}：${status}`);
}));
