// 排程引擎自测（不依赖浏览器）
const fs = require('fs');
const path = require('path');

global.window = global;
global.CF = { dateKey: (d) => d.toDateString() };
eval(fs.readFileSync(path.join(__dirname, '..', 'assets/js/scheduler.js'), 'utf8'));

const P = global.CFPlan;
let pass = 0, fail = 0;
function eq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; } else { fail++; console.log('FAIL', name, 'got', JSON.stringify(actual), 'want', JSON.stringify(expected)); }
}

// 1. 时间解析
eq('parse 周一 09:00', P.parseCourseTime('周一 09:00').start, 540);
eq('parse 周日 14:30', P.parseCourseTime('周日 14:30').weekday, 0);
eq('parse 非法', P.parseCourseTime('待定'), null);

// 2. 冲突检测
const conflictCourses = [
  { name: 'A', time: '周一 09:00' },
  { name: 'B', time: '周一 10:00' },   // 与 A 重叠（A: 9:00-10:30）
  { name: 'C', time: '周一 14:00' },
  { name: 'D', time: '周二 09:00' }
];
const conflicts = P.detectConflicts(conflictCourses);
eq('冲突数量', conflicts.length, 1);
eq('冲突课程', [conflicts[0].a.name, conflicts[0].b.name], ['A', 'B']);

// 3. 打分：逾期 > 今天 > 明天
const now = new Date('2026-10-20T10:00:00'); // 周二，晚上 19:00-22:00 可用
const courseMap = { 数学: { name: '数学', progress: 20 } };
const s1 = P.scoreTask({ priority: 'high', dueDate: '今天 18:00', course: '数学' }, courseMap, now);
const s2 = P.scoreTask({ priority: 'high', dueDate: '明天 18:00', course: '数学' }, courseMap, now);
const s3 = P.scoreTask({ priority: 'low', dueDate: '今天 18:00', course: '数学' }, courseMap, now);
eq('今天 > 明天', s1.score > s2.score, true);
eq('高优先级 > 低优先级', s1.score > s3.score, true);
eq('进度缺口计入', s1.gap > 0, true);

// 4. 生成计划：任务能装进 180 分钟窗口
const tasks = [
  { id: 1, title: 'T1', course: '数学', priority: 'high', dueDate: '今天 18:00', estimate: 60, completed: false },
  { id: 2, title: 'T2', course: '数学', priority: 'medium', dueDate: '明天 10:00', estimate: 45, completed: false },
  { id: 3, title: 'T3', course: '数学', priority: 'low', dueDate: '周五 10:00', estimate: 90, completed: false },
  { id: 4, title: 'DONE', course: '数学', priority: 'high', dueDate: '今天 08:00', estimate: 30, completed: true }
];
const plan = P.buildDayPlan(now, tasks, conflictCourses);
eq('跳过已完成', plan.blocks.some(b => b.task.id === 4), false);
eq('排入 2 项（第三项时长不够）', plan.blocks.length, 2);
eq('容量 180', plan.capacityMinutes, 180);
eq('首块 19:00 开始', plan.blocks[0].startLabel, '19:00');
eq('块之间留间隔', plan.blocks[0].end + 10, plan.blocks[1].start);
eq('已排时长', plan.plannedMinutes, 105);
eq('顺延 1 项', plan.skipped.length, 1);

// 5. 超量任务应被顺延
const many = [];
for (let i = 0; i < 12; i++) many.push({ id: i, title: 'X' + i, course: '数学', priority: 'high', dueDate: '今天 18:00', estimate: 40, completed: false });
const plan2 = P.buildDayPlan(now, many, conflictCourses);
eq('超量有顺延', plan2.skipped.length > 0, true);
eq('排入不超过容量', plan2.plannedMinutes <= plan2.capacityMinutes, true);

// 6. 本周负荷
const load = P.buildWeekLoad(tasks, conflictCourses, now);
eq('7 天', load.days.length, 7);
eq('周一有课', load.days[0].courses >= 2, true);

console.log('\n通过 ' + pass + ' 项，失败 ' + fail + ' 项');
process.exit(fail ? 1 : 0);
