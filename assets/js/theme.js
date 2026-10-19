/* ==========================================================================
   CampusFlow · 日间 / 夜间模式切换
   ---------------------------------------------------------------------------
   切换分两条视觉路径：
   1. 支持 View Transitions 的浏览器（Chrome / Edge / Safari 18+）：
      以点击位置为圆心做一次圆形扩散，新主题从按钮处铺满整屏；
   2. 其余浏览器：给根节点临时挂上 cf-theme-anim，
      让背景、边框、文字、图标在 380ms 内一起渐变过去。

   两条路径都会派发 cf:themechange 事件，供图表、热力图这类
   画进 canvas 的组件重绘 —— CSS 过渡管不到画布像素。
   ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'theme';
  var FADE_MS = 380;
  var REVEAL_MS = 520;

  function prefersReduced() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function notify(dark) {
    try {
      document.dispatchEvent(new CustomEvent('cf:themechange', { detail: { dark: dark } }));
    } catch (e) { /* 极旧浏览器不支持 CustomEvent 构造器，忽略即可 */ }
  }

  /** 真正落地主题：切类名、写存储、通知订阅者 */
  function apply(dark) {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (e) { /* 隐私模式忽略 */ }
    notify(dark);
  }

  /** 圆形扩散的圆心：优先取被点击的按钮，取不到就落在右上角 */
  function originOf(el) {
    if (el && el.getBoundingClientRect) {
      var r = el.getBoundingClientRect();
      if (r.width || r.height) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: global.innerWidth - 48, y: 48 };
  }

  function toggle(origin) {
    var next = !document.documentElement.classList.contains('dark');
    var root = document.documentElement;

    // 系统开启「减少动态效果」时不做任何过渡，直接切换
    if (prefersReduced()) {
      apply(next);
      return;
    }

    var canMorph = typeof document.startViewTransition === 'function';

    if (!canMorph) {
      root.classList.add('cf-theme-anim');
      void root.offsetWidth;   // 强制重排，确保过渡属性先于颜色变化生效
      apply(next);
      global.setTimeout(function () { root.classList.remove('cf-theme-anim'); }, FADE_MS + 80);
      return;
    }

    var p = originOf(origin);
    // 半径取圆心到最远角的距离，保证圆形能盖住整屏
    var radius = Math.hypot(
      Math.max(p.x, global.innerWidth - p.x),
      Math.max(p.y, global.innerHeight - p.y)
    );

    var vt;
    try {
      vt = document.startViewTransition(function () { apply(next); });
    } catch (e) {
      apply(next);
      return;
    }

    vt.ready.then(function () {
      root.animate(
        {
          clipPath: [
            'circle(0px at ' + p.x + 'px ' + p.y + 'px)',
            'circle(' + radius + 'px at ' + p.x + 'px ' + p.y + 'px)'
          ]
        },
        {
          duration: REVEAL_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(function () { /* 过渡被跳过时主题已经切好了，不影响结果 */ });
  }

  /* 事件委托：桌面侧边栏 #themeToggle、移动端顶部条 #cfThemeToggle 共用一套逻辑 */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('#themeToggle, #cfThemeToggle') : null;
    if (!btn) return;
    e.preventDefault();
    toggle(btn);
  });

  global.CFTheme = { toggle: toggle, apply: apply };
})(window);
