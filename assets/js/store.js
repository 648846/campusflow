/* ==========================================================================
   CampusFlow · 数据层
   ---------------------------------------------------------------------------
   统一管理 localStorage 读写、示例数据播种、统计口径与备份导出。
   设计原则：
     1. 读取永不抛错（数据损坏时降级为空列表，不让页面白屏）
     2. 写入失败必须有可见反馈（浏览器配额满时不能静默丢数据）
     3. 统计口径只在这里定义一次，各页面复用，避免仪表盘"各算各的"
   ========================================================================== */
(function (global) {
  'use strict';

  var KEYS = {
    courses: 'campusflow_courses',
    tasks: 'campusflow_tasks',
    goals: 'campusflow_goals',
    focusHistory: 'focusHistory',
    focusStats: 'focusStats',
    settings: 'campusflow_settings',
    seeded: 'campusflow_seeded'
  };

  /* ---------------------------------- 基础读写 --------------------------------- */

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === '') return fallback;
      var val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) {
      console.warn('[CampusFlow] 数据解析失败，已回退：' + key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[CampusFlow] 写入失败：' + key, e);
      if (typeof global.CFNotify === 'function') {
        global.CFNotify('本地存储空间不足，本次修改未保存', 'error');
      }
      return false;
    }
  }

  /* ---------------------------------- 日期工具 --------------------------------- */

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function addDays(d, n) {
    var x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  var WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  /* ------------------------------- 各实体读取 -------------------------------- */

  function getCourses() {
    var list = read(KEYS.courses, []);
    return Array.isArray(list) ? list : [];
  }

  function getTasks() {
    var list = read(KEYS.tasks, []);
    return Array.isArray(list) ? list : [];
  }

  function getGoals() {
    var list = read(KEYS.goals, []) || read('learningGoals', []);
    return Array.isArray(list) ? list : [];
  }

  /**
   * 专注记录统一为 [{timestamp, minutes}]。
   * 兼容 focus.html 写入的 {duration, timestamp} 结构。
   */
  function getFocusSessions() {
    var list = read(KEYS.focusHistory, []);
    if (!Array.isArray(list)) return [];
    return list.map(function (item) {
      var ts = item.timestamp || Date.parse(item.date) || 0;
      var minutes = item.minutes != null ? item.minutes : item.duration || 0;
      return { timestamp: ts, minutes: Number(minutes) || 0, date: ts ? dateKey(new Date(ts)) : null };
    }).filter(function (s) {
      return s.timestamp > 0 && s.minutes > 0;
    });
  }

  /* ---------------------------------- 统计 ----------------------------------- */

  /**
   * 汇总仪表盘需要的全部指标。
   * 口径说明：
   *   - 学习时长 = 专注记录累计时长（不是估算值）
   *   - 本周 = 含今天在内的最近 7 天
   *   - 进度 = 各课程 progress 的算术平均
   */
  function stats() {
    var courses = getCourses();
    var tasks = getTasks();
    var goals = getGoals();
    var sessions = getFocusSessions();

    var totalMinutes = 0;
    var byDate = {};
    sessions.forEach(function (s) {
      totalMinutes += s.minutes;
      byDate[s.date] = (byDate[s.date] || 0) + s.minutes;
    });

    var now = startOfDay(new Date());
    var last7 = [];
    for (var i = 6; i >= 0; i--) {
      var d = addDays(now, -i);
      var key = dateKey(d);
      last7.push({ date: key, label: WEEK_CN[d.getDay()], minutes: byDate[key] || 0 });
    }

    var weekMinutes = 0;
    var prevWeekMinutes = 0;
    for (i = 0; i < 7; i++) {
      weekMinutes += byDate[dateKey(addDays(now, -i))] || 0;
      prevWeekMinutes += byDate[dateKey(addDays(now, -i - 7))] || 0;
    }

    var weekDelta = prevWeekMinutes === 0
      ? (weekMinutes > 0 ? 100 : 0)
      : Math.round((weekMinutes - prevWeekMinutes) / prevWeekMinutes * 100);

    // 连续专注天数（从今天往前数，允许今天还没开始）
    var streak = 0;
    for (i = 0; i < 365; i++) {
      var k = dateKey(addDays(now, -i));
      if ((byDate[k] || 0) > 0) streak++;
      else if (i > 0) break;
      else if (i === 0) continue;
    }

    var doneTasks = tasks.filter(function (t) { return t.completed; }).length;
    var todayTasks = tasks.filter(function (t) {
      return !t.completed && String(t.dueDate || '').indexOf('今天') === 0;
    });

    var avgProgress = courses.length
      ? Math.round(courses.reduce(function (sum, c) { return sum + (Number(c.progress) || 0); }, 0) / courses.length)
      : 0;

    var catMap = {};
    courses.forEach(function (c) {
      var key = c.category || '未分类';
      catMap[key] = (catMap[key] || 0) + 1;
    });
    var categories = Object.keys(catMap).map(function (k) {
      return { name: k, count: catMap[k] };
    }).sort(function (a, b) { return b.count - a.count; });

    var goalsDone = goals.filter(function (g) { return Number(g.progress) >= 100; }).length;

    return {
      courseCount: courses.length,
      taskTotal: tasks.length,
      taskDone: doneTasks,
      taskPending: tasks.length - doneTasks,
      todayTasks: todayTasks,
      goalCount: goals.length,
      goalDone: goalsDone,
      avgProgress: avgProgress,
      totalMinutes: totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      weekMinutes: weekMinutes,
      weekHours: Math.round(weekMinutes / 60 * 10) / 10,
      weekDelta: weekDelta,
      streak: streak,
      last7: last7,
      categories: categories
    };
  }

  /** 今日课程：从 course.time 里解析"周一 09:00"这样的星期与时间 */
  function todayCourses() {
    var today = WEEK_CN[new Date().getDay()];
    return getCourses().filter(function (c) {
      return String(c.time || '').indexOf(today) === 0;
    }).sort(function (a, b) {
      return String(a.time).localeCompare(String(b.time));
    });
  }

  /** 需要关注：进度最低的 N 门课程（替代原来凭空捏造的"推荐课程"） */
  function attentionCourses(limit) {
    return getCourses().slice().sort(function (a, b) {
      return (Number(a.progress) || 0) - (Number(b.progress) || 0);
    }).slice(0, limit || 3);
  }

  /* ------------------------------- 示例数据播种 ------------------------------- */

  var DEMO_COURSES = [
    { id: 1, name: '数据结构与算法', category: '专业核心', progress: 85, time: '周一 09:00', location: 'A101', color: 'from-blue-500 to-blue-600', credits: 4 },
    { id: 2, name: '线性代数', category: '公共基础', progress: 72, time: '周一 10:30', location: 'B203', color: 'from-purple-500 to-purple-600', credits: 3 },
    { id: 3, name: '计算机网络', category: '专业核心', progress: 60, time: '周二 14:00', location: 'A205', color: 'from-green-500 to-green-600', credits: 4 },
    { id: 4, name: '数据库原理', category: '专业核心', progress: 45, time: '周二 15:30', location: 'C301', color: 'from-orange-500 to-orange-600', credits: 3 },
    { id: 5, name: '软件工程', category: '专业核心', progress: 90, time: '周三 08:00', location: 'D401', color: 'from-pink-500 to-pink-600', credits: 4 },
    { id: 6, name: '操作系统', category: '专业核心', progress: 55, time: '周四 11:00', location: 'A302', color: 'from-indigo-500 to-indigo-600', credits: 4 },
    { id: 7, name: '概率论与数理统计', category: '公共基础', progress: 30, time: '周五 16:00', location: 'B105', color: 'from-teal-500 to-teal-600', credits: 3 },
    { id: 8, name: '人工智能导论', category: '专业选修', progress: 20, time: '周五 17:30', location: 'C205', color: 'from-red-500 to-red-600', credits: 2 }
  ];

  var DEMO_TASKS = [
    { id: 1, title: '完成数据结构作业', course: '数据结构与算法', priority: 'high', dueDate: '今天 18:00', completed: false },
    { id: 2, title: '复习线性代数第三章', course: '线性代数', priority: 'medium', dueDate: '今天 21:00', completed: false },
    { id: 3, title: '准备计算机网络实验报告', course: '计算机网络', priority: 'high', dueDate: '明天 14:00', completed: false },
    { id: 4, title: '数据库课程设计', course: '数据库原理', priority: 'medium', dueDate: '周五 16:00', completed: false },
    { id: 5, title: '阅读软件工程论文', course: '软件工程', priority: 'low', dueDate: '下周', completed: true },
    { id: 6, title: '操作系统实验', course: '操作系统', priority: 'high', dueDate: '今天 20:00', completed: true }
  ];

  var DEMO_GOALS = [
    { id: 'g1', title: '本月完成数据结构全部章节', description: '覆盖树、图、排序三大模块', type: 'academic', deadline: '2026-10-31', priority: 'high', progress: 60, createdAt: '2026-10-01T08:00:00.000Z' },
    { id: 'g2', title: '线性代数 WEEKLY 刷题 20 道', description: '重点突破特征值与二次型', type: 'academic', deadline: '2026-10-25', priority: 'medium', progress: 35, createdAt: '2026-10-05T08:00:00.000Z' },
    { id: 'g3', title: '完成一个物联网课程项目', description: '基于 ESP32 的环境监测', type: 'project', deadline: '2026-11-15', priority: 'high', progress: 15, createdAt: '2026-10-08T08:00:00.000Z' }
  ];

  /** 近 14 天专注记录，制造出真实可看的趋势 */
  function demoFocusHistory() {
    var pattern = [70, 95, 40, 120, 85, 30, 110, 65, 100, 55, 130, 90, 45, 105];
    var out = [];
    var now = new Date();
    for (var i = pattern.length - 1; i >= 0; i--) {
      var d = addDays(now, -i);
      var minutes = pattern[pattern.length - 1 - i];
      var sessionTime = new Date(d);
      sessionTime.setHours(20, 10, 0, 0);
      // 一天拆成 1~2 段，更接近真实番茄钟记录
      if (minutes > 60) {
        out.push({ duration: 40, date: sessionTime.toLocaleString('zh-CN'), timestamp: sessionTime.getTime() });
        sessionTime.setHours(21, 5, 0, 0);
        out.push({ duration: minutes - 40, date: sessionTime.toLocaleString('zh-CN'), timestamp: sessionTime.getTime() });
      } else {
        out.push({ duration: minutes, date: sessionTime.toLocaleString('zh-CN'), timestamp: sessionTime.getTime() });
      }
    }
    return out;
  }

  /**
   * 首次访问时写入示例数据，让作品在演示时不是空壳。
   * 只补缺失的键，绝不覆盖用户已有数据；主动清空后不再回填。
   */
  function seedIfEmpty() {
    if (localStorage.getItem(KEYS.seeded) === '1') return false;
    var seeded = false;
    if (getCourses().length === 0) { write(KEYS.courses, DEMO_COURSES); seeded = true; }
    if (getTasks().length === 0) { write(KEYS.tasks, DEMO_TASKS); seeded = true; }
    if (getGoals().length === 0) { write(KEYS.goals, DEMO_GOALS); seeded = true; }
    if (getFocusSessions().length === 0) { write(KEYS.focusHistory, demoFocusHistory()); seeded = true; }
    try { localStorage.setItem(KEYS.seeded, '1'); } catch (e) { /* 忽略 */ }
    return seeded;
  }

  /* ------------------------------- 备份与清空 -------------------------------- */

  function exportAll() {
    return {
      app: 'CampusFlow',
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      courses: getCourses(),
      tasks: getTasks(),
      goals: getGoals(),
      focusHistory: read(KEYS.focusHistory, []),
      settings: read(KEYS.settings, {})
    };
  }

  /**
   * 导入备份。返回 {ok, message}，校验失败时不破坏现有数据。
   */
  function importAll(text) {
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { ok: false, message: '文件不是合法的 JSON，请选择 CampusFlow 导出的备份文件' };
    }
    if (!data || typeof data !== 'object' || (!data.courses && !data.tasks && !data.goals)) {
      return { ok: false, message: '备份内容不完整，未找到课程 / 任务 / 目标数据' };
    }
    if (Array.isArray(data.courses)) write(KEYS.courses, data.courses);
    if (Array.isArray(data.tasks)) write(KEYS.tasks, data.tasks);
    if (Array.isArray(data.goals)) write(KEYS.goals, data.goals);
    if (Array.isArray(data.focusHistory)) write(KEYS.focusHistory, data.focusHistory);
    if (data.settings && typeof data.settings === 'object') write(KEYS.settings, data.settings);
    try { localStorage.setItem(KEYS.seeded, '1'); } catch (e) { /* 忽略 */ }
    return { ok: true, message: '导入成功' };
  }

  function clearAll() {
    [KEYS.courses, KEYS.tasks, KEYS.goals, KEYS.focusHistory, KEYS.focusStats, KEYS.settings, 'learningGoals'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) { /* 忽略 */ }
    });
    // 标记为已初始化，避免清空后又被示例数据填回来
    try { localStorage.setItem(KEYS.seeded, '1'); } catch (e) { /* 忽略 */ }
  }

  /* --------------------------------- 对外接口 -------------------------------- */

  global.CF = {
    KEYS: KEYS,
    read: read,
    write: write,
    getCourses: getCourses,
    getTasks: getTasks,
    getGoals: getGoals,
    getFocusSessions: getFocusSessions,
    stats: stats,
    todayCourses: todayCourses,
    attentionCourses: attentionCourses,
    seedIfEmpty: seedIfEmpty,
    exportAll: exportAll,
    importAll: importAll,
    clearAll: clearAll,
    dateKey: dateKey,
    todayKey: todayKey,
    WEEK_CN: WEEK_CN
  };
})(window);
