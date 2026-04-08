// 电影厅切换功能
(function () {
  let observer;

  function applyThemeStyles() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.getAttribute('data-theme') === 'dark';
    const container = document.querySelector('.hall-container');
    const buttons = document.querySelectorAll('.tab-nav button');

    if (container) {
      if (isDark) {
        container.style.background = '#1a1a1a';
        container.style.color = '#e0e0e0';
      } else {
        container.style.background = '#f5f5f5';
        container.style.color = '#333';
      }
    }

    buttons.forEach(btn => {
      if (isDark) {
        if (btn.classList.contains('active')) {
          btn.style.background = '#00b38a';
          btn.style.color = '#fff';
        } else {
          btn.style.background = '#2d2d2d';
          btn.style.color = '#ccc';
        }
      } else {
        if (btn.classList.contains('active')) {
          btn.style.background = '#00b38a';
          btn.style.color = '#fff';
        } else {
          btn.style.background = '#e0e0e0';
          btn.style.color = '#333';
        }
      }
    });
  }

  function handleTabClick(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const buttons = document.querySelectorAll('.tab-nav button');
    buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.style.removeProperty('background');
      btn.style.removeProperty('color');
    });

    target.classList.add('active');

    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const contentId = target.getAttribute('data-target');
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    applyThemeStyles();
  }

  function init() {
    const tabNav = document.getElementById('tabNav');
    const tabContents = document.querySelectorAll('.tab-content');

    if (!tabNav || tabContents.length === 0) return;

    tabNav.removeEventListener('click', handleTabClick);
    tabNav.addEventListener('click', handleTabClick);

    if (!observer) {
      observer = new MutationObserver(applyThemeStyles);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    applyThemeStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('pjax:complete', init);
})();
