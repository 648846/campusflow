/* ==========================================================================
   CampusFlow · 智能排程引擎
   ---------------------------------------------------------------------------
   目标：把「课程表 + 任务截止 + 课程进度」三类数据合成一份可执行的学习计划，
        并检出课表时间冲突。全部为纯函数，不依赖 DOM，便于单独验证与讲解。

   依赖：assets/js/store.js（读取数据）
   对外：window.CFPlan
   ========================================================================== */
(function (global) {
  'use strict';

  var WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var WEEK_ORDER = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  var CLASS_MINUTES = 90;    // 一节大课按 90 分钟计
  var SLOT_GAP = 10;         // 相邻学习块之间的休息间隔（分钟）
  var DEFAULT_ESTIMATE = 25; // 未填写预计时长时，按 1 个番茄计

  /* --------------------------------- 时间工具 -------------------------------- */

  function toMinutes(hhmm) {
    var parts = String(hhmm || '').split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h)) return null;
    return h * 60 + (isNaN(m) ? 0 : m);
  }

  function toHHMM(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
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

  function dayDiff(a, b) {
    return Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
  }

  /** '周一 09:00' -> { weekday: 1, start: 540 }；解析失败返回 null */
  function parseCourseTime(text) {
    var m = String(text || '').match(/周([一二三四五六日])\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    var idx = '日一二三四五六'.indexOf(m[1]);
    var weekday = idx === 0 ? 0 : idx; // 周日=0，周一=1 … 周六=6
    return {
      weekday: weekday,
      start: parseInt(m[2], 10) * 60 + parseInt(m[3], 10),
      end: parseInt(m[2], 10) * 60 + parseInt(m[3], 10) + CLASS_MINUTES
    };
  }

  /* -------------------------------- 冲突检测 -------------------------------- */

  /**
   * 找出同一星期几、时间区间重叠的课程对。
   * 这是排课前必须先做的数据质量检查——课表本身冲突，任何排程都没有意义。
   */
  function detectConflicts(courses) {
    var slots = [];
    (courses || []).forEach(function (c) {
      var t = parseCourseTime(c.time);
      if (t) slots.push({ course: c, weekday: t.weekday, start: t.start, end: t.end });
    });

    var conflicts = [];
    for (var i = 0; i < slots.length; i++) {
      for (var j = i + 1; j < slots.length; j++) {
        var a = slots[i];
        var b = slots[j];
        if (a.weekday !== b.weekday) continue;
        if (a.start < b.end && b.start < a.end) {
          conflicts.push({
            weekday: a.weekday,
            weekdayLabel: WEEK_CN[a.weekday],
            a: a.course,
            b: b.course,
            range: toHHMM(Math.max(a.start, b.start)) + '–' + toHHMM(Math.min(a.end, b.end))
          });
        }
      }
    }
    return conflicts;
  }

  /* --------------------------------- 截止解析 -------------------------------- */

  // 从 "今天 18:00" / "明天 10:00" / "周五 16:00" 这类展示文本里取出相对日期
  function parseDueText(text, now) {
    var s = String(text || '');
    if (!s) return null;
    var hm = s.match(/(\d{1,2}):(\d{2})/);
    var minuteOfDay = hm ? parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10) : 23 * 60 + 59;

    var base = null;
    if (s.indexOf('今天') === 0) base = 0;
    else if (s.indexOf('后天') === 0) base = 2;
    else if (s.indexOf('明天') === 0) base = 1;
    else if (s.indexOf('下周') === 0) base = 7;
    else {
      var m = s.match(/周([一二三四五六日])/);
      if (m) {
        var idx = '日一二三四五六'.indexOf(m[1]);
        var target = idx === 0 ? 0 : idx;
        var delta = (target - now.getDay() + 7) % 7;
        base = delta === 0 ? 7 : delta; // 本周已过则顺延到下周
      }
    }
    if (base === null) return null;

    var d = startOfDay(addDays(now, base));
    d.setMinutes(minuteOfDay);
    return d;
  }

  /** 统一解析截止时间：优先用结构化 due 字段，其次解析展示文本 */
  function resolveDue(task, now) {
    if (task && task.due) {
      var parsed = new Date(task.due);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return parseDueText(task && task.dueDate, now);
  }

  /* --------------------------------- 任务打分 -------------------------------- */

  /**
   * 排程优先级 = 紧迫度 × 0.6 + 重要度 × 0.8 + 课程缺口
   *   紧迫度（0–100）：越接近截止越高，已逾期最高
   *   重要度（10–30）：任务自身的高/中/低优先级
   *   课程缺口（0–10）：所属课程进度越低，越需要投入
   */
  function scoreTask(task, courseMap, now) {
    var due = resolveDue(task, now);
    var days = due === null ? 99 : dayDiff(due, now);

    var urgency;
    if (days < 0) urgency = 100;
    else if (days === 0) urgency = 90;
    else if (days === 1) urgency = 70;
    else if (days <= 3) urgency = 50;
    else if (days <= 7) urgency = 30;
    else urgency = 15;

    var importance = task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10;

    var course = courseMap[task.course];
    var gap = course ? Math.max(0, (100 - (Number(course.progress) || 0)) / 10) : 0;

    var score = Math.round(urgency * 0.6 + importance * 0.8 + gap);

    var reason = [];
    if (days < 0) reason.push('已逾期');
    else if (days === 0) reason.push('今天截止');
    else if (days === 1) reason.push('明天截止');
    else if (days <= 7) reason.push(days + ' 天后截止');
    else reason.push('暂无明确截止');
    if (task.priority === 'high') reason.push('高优先级');
    if (course && gap >= 5) reason.push('课程进度仅 ' + course.progress + '%');

    return { score: score, urgency: urgency, importance: importance, gap: gap, days: days, reason: reason.join(' · ') };
  }

  /* --------------------------------- 时间窗口 -------------------------------- */

  /**
   * 每天可投入的学习时段：
   *   工作日 19:00–22:00
   *   周末   09:00–11:30 / 14:00–17:30 / 19:00–22:00
   */
  function availableWindows(date) {
    var wd = date.getDay();
    if (wd === 0 || wd === 6) {
      return [
        { start: 9 * 60, end: 11 * 60 + 30 },
        { start: 14 * 60, end: 17 * 60 + 30 },
        { start: 19 * 60, end: 22 * 60 }
      ];
    }
    return [{ start: 19 * 60, end: 22 * 60 }];
  }

  function windowsMinutes(windows) {
    return windows.reduce(function (sum, w) { return sum + (w.end - w.start); }, 0);
  }

  /* --------------------------------- 生成计划 -------------------------------- */

  /**
   * 生成某一天的学习计划。
   * @param {Date} date
   * @param {Array} tasks   全部任务（内部会过滤已完成）
   * @param {Array} courses 全部课程
   * @returns {Object} { date, windows, blocks, skipped, conflicts, plannedMinutes, capacityMinutes }
   */
  function buildDayPlan(date, tasks, courses) {
    var now = new Date();
    var courseMap = {};
    (courses || []).forEach(function (c) { courseMap[c.name] = c; });

    var windows = availableWindows(date);
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var isToday = dayDiff(date, now) === 0;

    // 排"今天"时不能把任务排到已经过去的时间段
    if (isToday) {
      windows = windows.filter(function (w) { return w.end > nowMin; })
        .map(function (w) {
          var start = Math.max(w.start, Math.ceil(nowMin / 5) * 5);
          return { start: start, end: w.end };
        });
    }
    if (!windows.length) {
      return {
        date: date, weekdayLabel: WEEK_CN[date.getDay()], windows: [],
        blocks: [], skipped: [], conflicts: detectConflicts(courses),
        plannedMinutes: 0, capacityMinutes: 0
      };
    }

    var capacity = windowsMinutes(windows);

    var candidates = (tasks || []).filter(function (t) {
      return !t.completed;
    }).map(function (t) {
      return Object.assign({ task: t }, scoreTask(t, courseMap, now));
    }).sort(function (a, b) { return b.score - a.score; });

    var blocks = [];
    var skipped = [];
    var wi = 0;
    var cursor = windows[0].start;

    candidates.forEach(function (item) {
      var need = Number(item.task.estimate) || DEFAULT_ESTIMATE;

      // 找到放得下的窗口
      while (wi < windows.length && cursor + need > windows[wi].end) {
        wi++;
        if (wi < windows.length) cursor = windows[wi].start;
      }

      if (wi >= windows.length) {
        skipped.push(item);
        return;
      }

      blocks.push({
        start: cursor,
        end: cursor + need,
        startLabel: toHHMM(cursor),
        endLabel: toHHMM(cursor + need),
        minutes: need,
        task: item.task,
        score: item.score,
        reason: item.reason,
        course: courseMap[item.task.course] || null
      });

      cursor += need + SLOT_GAP;
    });

    return {
      date: date,
      weekdayLabel: WEEK_CN[date.getDay()],
      windows: windows,
      blocks: blocks,
      skipped: skipped,
      conflicts: detectConflicts(courses),
      plannedMinutes: blocks.reduce(function (s, b) { return s + b.minutes; }, 0),
      capacityMinutes: capacity
    };
  }

  /**
   * 本周负荷概览：逐天统计课程数、当天到期任务数与预计工作量。
   * 用于直观看出"哪一天会堆爆"。
   */
  function buildWeekLoad(tasks, courses, baseDate) {
    var now = baseDate || new Date();
    var monday = addDays(startOfDay(now), -((now.getDay() + 6) % 7));
    var courseMap = {};
    (courses || []).forEach(function (c) { courseMap[c.name] = c; });

    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(monday, i);
      var wd = d.getDay();
      var dayCourses = (courses || []).filter(function (c) {
        var t = parseCourseTime(c.time);
        return t && t.weekday === wd;
      });
      var dueTasks = (tasks || []).filter(function (t) {
        if (t.completed) return false;
        var due = resolveDue(t, now);
        return due && dayDiff(due, d) === 0;
      });
      var minutes = dueTasks.reduce(function (s, t) { return s + (Number(t.estimate) || DEFAULT_ESTIMATE); }, 0);
      var capacity = windowsMinutes(availableWindows(d));

      days.push({
        date: d,
        key: global.CF ? global.CF.dateKey(d) : String(d),
        label: WEEK_CN[wd],
        isToday: dayDiff(d, now) === 0,
        courses: dayCourses.length,
        tasks: dueTasks.length,
        minutes: minutes,
        capacity: capacity,
        overloaded: minutes > capacity
      });
    }

    var totalMinutes = days.reduce(function (s, d) { return s + d.minutes; }, 0);
    var totalMine = days.reduce(function (s, d) { return s + d.capacity; }, 0);

    return { days: days, totalMinutes: totalMinutes, capacity: totalMine };
  }

  global.CFPlan = {
    WEEK_CN: WEEK_CN,
    WEEK_ORDER: WEEK_ORDER,
    parseCourseTime: parseCourseTime,
    detectConflicts: detectConflicts,
    resolveDue: resolveDue,
    scoreTask: scoreTask,
    availableWindows: availableWindows,
    buildDayPlan: buildDayPlan,
    buildWeekLoad: buildWeekLoad,
    toMinutes: toMinutes,
    toHHMM: toHHMM,
    dayDiff: dayDiff
  };
})(window);
