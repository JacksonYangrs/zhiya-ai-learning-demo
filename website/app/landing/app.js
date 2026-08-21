// 商业站首页轻交互：滚动进入时淡入
(function () {
  var targets = document.querySelectorAll('.feature, .demo-section, .biz-card');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();
