/* ==========================================================================
   CampusFlow · 移动端导航（顶部状态条 + 底部标签栏）
   只在 < 1024px 显示；桌面端仍使用左侧边栏，互不干扰。
   ========================================================================== */
(function () {
  'use strict';

  var ICONS = {
    dashboard: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
    schedule: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z',
    tasks: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
    goals: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    focus: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    plan: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z',
    preview: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z'
  };

  var PAGES = [
    { file: 'index.html', label: '仪表盘', icon: 'dashboard' },
    { file: 'plan.html', label: '计划', icon: 'plan' },
    { file: 'schedule.html', label: '课程', icon: 'schedule' },
    { file: 'tasks.html', label: '任务', icon: 'tasks' },
    { file: 'goals.html', label: '目标', icon: 'goals' },
    { file: 'focus.html', label: '专注', icon: 'focus' },
    { file: 'preview.html', label: '预览', icon: 'preview' }
  ];

  function svg(name, cls) {
    return '<svg class="' + cls + '" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="' + ICONS[name] + '"/></svg>';
  }

  function currentFile() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f.indexOf('.html') > -1 ? f : 'index.html';
  }

  function buildTopbar(page) {
    var el = document.createElement('header');
    el.id = 'cfTopbar';
    el.className = 'fixed top-0 left-0 right-0 z-40 h-14 items-center justify-between px-4 ' +
      'border-b border-gray-200 dark:border-gray-800 bg-white/85 dark:bg-dark/85 backdrop-blur-xl';
    el.innerHTML =
      '<a href="index.html" class="flex items-center gap-2.5 min-w-0">' +
        '<span class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow flex-shrink-0">' +
          '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' +
          '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253"/></svg>' +
        '</span>' +
        '<span class="leading-tight min-w-0">' +
          '<span class="block text-sm font-bold gradient-text">CampusFlow</span>' +
          '<span class="block text-[10px] text-gray-500 dark:text-gray-400 truncate">' + page.label + '</span>' +
        '</span>' +
      '</a>' +
      '<button id="cfThemeToggle" type="button" aria-label="切换深色模式" ' +
        'class="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">' +
        '<svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z"/></svg>' +
        '<svg class="w-5 h-5 hidden dark:block text-yellow-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707.707M12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>' +
      '</button>';
    document.body.appendChild(el);

    el.querySelector('#cfThemeToggle').addEventListener('click', toggleTheme);
  }

  function buildTabbar(page) {
    var el = document.createElement('nav');
    el.id = 'cfTabbar';
    el.className = 'fixed bottom-0 left-0 right-0 z-40 items-stretch safe-bottom ' +
      'border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-dark/90 backdrop-blur-xl';
    el.innerHTML = PAGES.map(function (p) {
      var active = p.file === page.file;
      return '<a href="' + p.file + '" class="cf-tab flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 ' +
        'text-[10px] font-medium text-gray-500 dark:text-gray-400"' +
        (active ? ' aria-current="page"' : '') + '>' +
        '<span class="cf-tab-icon w-8 h-8 rounded-xl flex items-center justify-center transition-all">' +
          svg(p.icon, 'w-[18px] h-[18px]') +
        '</span><span>' + p.label + '</span></a>';
    }).join('');
    document.body.appendChild(el);
  }

  function toggleTheme() {
    var root = document.documentElement;
    var dark = root.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  function init() {
    if (document.getElementById('cfTabbar')) return;
    var file = currentFile();
    var page = null;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].file === file) { page = PAGES[i]; break; }
    }
    if (!page) {
      for (var j = 0; j < PAGES.length; j++) {
        var f = document.title || '';
        if (f.indexOf('课程') > -1 && PAGES[j].file === 'schedule.html') { page = PAGES[j]; break; }
      }
    }
    page = page || { file: file, label: document.title.replace('CampusFlow - ', '').replace('CampusFlow', 'CampusFlow') };

    buildTopbar(page);
    buildTabbar(page);

    // 图片/素材加载失败时不留破图
    document.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG') { t.style.display = 'none'; }
    }, true);
  }

  // ---- PWA：注册 Service Worker ----
  // 仅 http/https 生效；直接双击 index.html（file://）时浏览器禁止注册，跳过即可。
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {
        /* 离线缓存不可用不影响主体功能，静默跳过 */
      });
    });
  }

  // 记录安装事件：Chrome 地址栏会显示安装图标，需要时也可用 window.__cfInstallPrompt.prompt() 手动唤起
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__cfInstallPrompt = e;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
