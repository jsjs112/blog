(function () {
  let ticking = false;

  function percent() {
    const up = document.querySelector('#go-up');
    if (!up || up.childNodes.length < 2) return;

    const scrollTop = document.documentElement.scrollTop || window.pageYOffset;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    ) - document.documentElement.clientHeight;

    const result = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    if (result <= 95) {
      up.childNodes[0].style.display = 'none';
      up.childNodes[1].style.display = 'block';
      up.childNodes[1].textContent = String(result);
    } else {
      up.childNodes[1].style.display = 'none';
      up.childNodes[0].style.display = 'block';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      percent();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('pjax:complete', percent);
  document.addEventListener('DOMContentLoaded', percent);
})();
