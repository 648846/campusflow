/* ==========================================================================
   CampusFlow · 侧边栏个人卡与个人资料
   ---------------------------------------------------------------------------
   7 个页面的侧边栏底部原本各写死了一份「昵称 / 专业 / 指标」，
   任何改动都要改七遍。这里改成：页面只留一个占位节点 #cfProfileIdentity，
   内容由本文件统一渲染，并提供资料编辑弹窗。

   数据来自 store.js：CF.getProfile / CF.saveProfile / CF.profileCard
   ========================================================================== */
(function (global) {
  'use strict';

  var TONES = {
    indigo: ['#6366F1', '#8B5CF6'],
    blue: ['#1565C0', '#0288D1'],
    green: ['#059669', '#10B981'],
    amber: ['#F59E0B', '#EF4444']
  };

  var modal = null;
  var draftTone = 'indigo';
  var saveBtn = null;
  var saveLabel = '';
  var closing = null;

  var CHECK_ICON = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>';

  var SAVE_CLS = 'flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white ' +
    'text-sm font-semibold hover-lift shadow-glow flex items-center justify-center gap-1.5';
  var SAVED_CLS = 'flex-1 px-4 py-2.5 rounded-xl bg-success text-white text-sm font-semibold ' +
    'flex items-center justify-center gap-1.5 cursor-default';

  function esc(s) {
    if (global.CF && CF.escapeHtml) return CF.escapeHtml(String(s == null ? '' : s));
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function tone(name) { return TONES[name] || TONES.indigo; }

  function gradient(name) {
    var t = tone(name);
    return 'linear-gradient(135deg,' + t[0] + ',' + t[1] + ')';
  }

  /* --------------------------------- 侧边栏卡 -------------------------------- */

  function avatar(size, profile) {
    return '<div class="' + size + ' rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" ' +
      'style="background:' + gradient(profile.tone) + '">' + esc(profile.avatar) + '</div>';
  }

  function render() {
    var host = document.getElementById('cfProfileIdentity');
    if (!host || !global.CF || !CF.profileCard) return;

    var d = CF.profileCard();
    var p = d.profile;

    host.innerHTML =
      '<div class="flex items-center gap-3 mb-3">' +
        avatar('w-10 h-10', p) +
        '<div class="min-w-0 flex-1">' +
          '<p class="font-medium text-gray-900 dark:text-white truncate">' + esc(p.name) + '</p>' +
          '<p class="text-xs text-gray-500 dark:text-gray-400 truncate">' + esc(p.major) + '</p>' +
        '</div>' +
        '<button type="button" data-cf-profile-edit class="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0" aria-label="编辑个人资料" title="编辑个人资料">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M16.86 4.49a2 2 0 0 1 2.83 2.83L7.5 19.5 3 21l1.5-4.5L16.86 4.49Z"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="mb-3">' +
        '<div class="flex items-center justify-between text-[11px] mb-1.5">' +
          '<span class="font-semibold text-primary">Lv.' + d.level + ' · ' + esc(d.title) + '</span>' +
          '<span class="text-gray-400 dark:text-gray-500">' +
            (d.toNext > 0 ? '距下一级 ' + d.toNext + ' 小时' : '已是最高级') +
          '</span>' +
        '</div>' +
        '<div class="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">' +
          '<div class="h-full rounded-full transition-all duration-500" style="width:' + d.percent + '%;background:' + gradient(p.tone) + '"></div>' +
        '</div>' +
      '</div>';

    var btn = host.querySelector('[data-cf-profile-edit]');
    if (btn) btn.addEventListener('click', open);

    paint();
  }

  /** 移动端顶部条上的头像按钮（由 nav.js 创建），配色跟随个人设置 */
  function paint() {
    var btn = document.getElementById('cfProfileBtn');
    if (!btn || !global.CF || !CF.getProfile) return;
    var p = CF.getProfile();
    btn.textContent = p.avatar;
    btn.style.background = gradient(p.tone);
  }

  /* ---------------------------------- 弹窗 ---------------------------------- */

  function statCell(label, value, unit) {
    return '<div class="rounded-xl bg-white dark:bg-darkLighter border border-gray-100 dark:border-gray-700 p-3">' +
      '<p class="text-lg font-bold text-gray-900 dark:text-white leading-none">' + value +
        '<span class="text-[11px] font-medium text-gray-400 ml-1">' + unit + '</span></p>' +
      '<p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1">' + label + '</p>' +
    '</div>';
  }

  function buildModal() {
    var el = document.createElement('div');
    el.id = 'cfProfileModal';
    el.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden items-center justify-center p-4';
    el.innerHTML =
      '<div class="glass dark:glass-dark rounded-2xl p-6 w-full max-w-md max-h-[88vh] overflow-y-auto">' +
        '<div class="flex items-center justify-between mb-5">' +
          '<h3 class="text-lg font-bold text-gray-900 dark:text-white">个人资料</h3>' +
          '<button type="button" data-cf-profile-close class="p-2 -mr-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="关闭">' +
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +

        '<div class="flex items-center gap-4 mb-5">' +
          '<div id="pfAvatarPreview" class="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"></div>' +
          '<div class="min-w-0">' +
            '<p id="pfNamePreview" class="font-semibold text-gray-900 dark:text-white truncate"></p>' +
            '<p id="pfMajorPreview" class="text-xs text-gray-500 dark:text-gray-400 truncate"></p>' +
            '<p id="pfLevelPreview" class="text-[11px] text-primary font-medium mt-1"></p>' +
          '</div>' +
        '</div>' +

        '<div class="space-y-3">' +
          '<div>' +
            '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">昵称</label>' +
            '<input id="pfName" type="text" maxlength="12" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkLighter text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="怎么称呼你">' +
          '</div>' +
          '<div>' +
            '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专业 / 班级</label>' +
            '<input id="pfMajor" type="text" maxlength="16" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkLighter text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="如：物联网工程">' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-3">' +
            '<div>' +
              '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">头像文字</label>' +
              '<input id="pfAvatar" type="text" maxlength="1" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkLighter text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="首字">' +
              '<p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">留空则取昵称首字</p>' +
            '</div>' +
            '<div>' +
              '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">头像配色</label>' +
              '<div id="pfTones" class="flex items-center gap-2.5 h-[42px]"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="mt-5">' +
          '<p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">累计数据</p>' +
          '<div id="pfStats" class="grid grid-cols-2 gap-3"></div>' +
        '</div>' +

        '<div class="sticky bottom-0 -mx-6 -mb-6 mt-5 px-6 py-4 rounded-b-2xl border-t border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-dark/95 backdrop-blur flex items-center gap-3">' +
          '<button type="button" data-cf-profile-close class="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>' +
          '<button type="button" data-cf-profile-save class="' + SAVE_CLS + '">保存</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(el);

    el.addEventListener('click', function (e) {
      if (e.target === el) close();
    });
    el.querySelectorAll('[data-cf-profile-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    saveBtn = el.querySelector('[data-cf-profile-save]');
    saveLabel = saveBtn.innerHTML;
    saveBtn.addEventListener('click', save);

    ['pfName', 'pfMajor', 'pfAvatar'].forEach(function (id) {
      el.querySelector('#' + id).addEventListener('input', syncPreview);
    });

    return el;
  }

  function toneButtons(current) {
    return Object.keys(TONES).map(function (name) {
      var active = name === current;
      return '<button type="button" data-tone="' + name + '" aria-label="' + name + '" ' +
        'class="w-8 h-8 rounded-full transition-transform hover:scale-110" ' +
        'style="background:' + gradient(name) + ';' +
        (active ? 'box-shadow:0 0 0 2px #fff,0 0 0 4px ' + tone(name)[0] : 'box-shadow:0 0 0 1px rgba(0,0,0,.06)') + '"></button>';
    }).join('');
  }

  function syncPreview() {
    if (!modal) return;
    var name = modal.querySelector('#pfName').value.trim() || '未命名';
    var major = modal.querySelector('#pfMajor').value.trim() || '未填写专业';
    var letter = modal.querySelector('#pfAvatar').value.trim() || name.charAt(0);

    // 占位符跟着昵称走，让"留空取首字"所见即所得
    modal.querySelector('#pfAvatar').placeholder = name.charAt(0);

    modal.querySelector('#pfAvatarPreview').textContent = letter.slice(0, 1);
    modal.querySelector('#pfAvatarPreview').style.background = gradient(draftTone);
    modal.querySelector('#pfNamePreview').textContent = name;
    modal.querySelector('#pfMajorPreview').textContent = major;
  }

  function open() {
    if (!global.CF || !CF.profileCard) return;
    var d = CF.profileCard();
    var p = d.profile;
    draftTone = p.tone;

    if (!modal) modal = buildModal();

    // 上一次保存留下的「已保存」状态要复位
    if (closing) { clearTimeout(closing); closing = null; }
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.className = SAVE_CLS;
      saveBtn.innerHTML = saveLabel;
    }

    modal.querySelector('#pfName').value = p.name;
    modal.querySelector('#pfMajor').value = p.major;

    // 头像本来就等于昵称首字时，输入框留空交给占位符，改昵称即可自动跟随
    var isAuto = p.avatar === p.name.charAt(0);
    modal.querySelector('#pfAvatar').value = isAuto ? '' : p.avatar;
    modal.querySelector('#pfAvatar').placeholder = p.avatar;
    modal.querySelector('#pfLevelPreview').textContent =
      'Lv.' + d.level + ' · ' + d.title + '　累计专注 ' + d.stats.totalHours + ' 小时';

    var tones = modal.querySelector('#pfTones');
    tones.innerHTML = toneButtons(draftTone);
    bindTones();

    modal.querySelector('#pfStats').innerHTML =
      statCell('累计专注', d.stats.totalHours, '小时') +
      statCell('连续专注', d.stats.streak, '天') +
      statCell('已完成任务', d.stats.taskDone, '项') +
      statCell('在学课程', d.stats.courseCount, '门');

    syncPreview();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.querySelector('#pfName').focus();
  }

  function bindTones() {
    var tones = modal.querySelector('#pfTones');
    tones.querySelectorAll('[data-tone]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        draftTone = btn.getAttribute('data-tone');
        tones.innerHTML = toneButtons(draftTone);
        bindTones();
        syncPreview();
      });
    });
  }

  function close() {
    if (closing) { clearTimeout(closing); closing = null; }
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function save() {
    var name = modal.querySelector('#pfName').value.trim();
    if (!name) {
      CF.toast('昵称不能为空', 'error');
      return;
    }

    var major = modal.querySelector('#pfMajor').value.trim() || '未填写专业';
    var letter = modal.querySelector('#pfAvatar').value.trim() || name.charAt(0);

    CF.saveProfile({ name: name, major: major, avatar: letter.slice(0, 1), tone: draftTone });
    render();

    // 就地确认：按钮先变绿打勾，再收起弹窗。
    // 只靠底部 toast 的话，提示会出现在视野之外的屏幕下方，很容易被漏掉。
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.className = SAVED_CLS;
      saveBtn.innerHTML = CHECK_ICON + '已保存';
    }
    // toast 延后到弹窗收起之后再出，避免和弹窗底栏叠在一起
    closing = setTimeout(function () {
      close();
      CF.toast('个人资料已更新');
    }, 820);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) close();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  global.CFProfile = { render: render, open: open, close: close, paint: paint };
})(window);
