#!/usr/bin/env node
/**
 * 站内资源与离线完整性检查（零依赖，CI 用）
 *   1. 每个 HTML 的本地 href/src 是否都真实存在
 *   2. 是否残留 http(s) 外链（本项目承诺运行时零外部请求）
 *   3. manifest 声明的图标是否都存在
 *   4. service-worker 预缓存清单是否都命中真实文件
 * 用法：node scripts/check-assets.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
let checked = 0;

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

function exists(p) {
  try {
    return fs.statSync(path.join(ROOT, p)).isFile();
  } catch (e) {
    return false;
  }
}

/* ---------------- 1 & 2：HTML 内链与外链 ---------------- */
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

for (const page of pages) {
  const html = read(page);
  const refs = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:)?\/\//i.test(ref)) {
      problems.push(`${page}: 外链残留 ${ref}`);
      continue;
    }
    if (/^(#|mailto:|javascript:|data:)/i.test(ref)) continue;

    const clean = ref.split('#')[0].split('?')[0];
    if (!clean || clean === '.' || clean === './' || clean.endsWith('/')) continue;
    checked++;
    if (!exists(clean)) problems.push(`${page}: 引用不存在 → ${clean}`);
  }
}

/* ---------------- 3：manifest 图标 ---------------- */
const manifest = JSON.parse(read('manifest.webmanifest'));
for (const icon of manifest.icons || []) {
  checked++;
  if (!exists(icon.src)) problems.push(`manifest: 图标缺失 → ${icon.src}`);
}
if (!manifest.start_url) problems.push('manifest: 缺少 start_url');

/* ---------------- 4：service worker 预缓存清单 ---------------- */
const sw = read('service-worker.js');
const shellBlock = sw.match(/SHELL_FILES\s*=\s*\[([\s\S]*?)\]/);
if (!shellBlock) {
  problems.push('service-worker.js: 找不到 SHELL_FILES 清单');
} else {
  const items = [...shellBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const item of items) {
    const clean = item.replace(/^\.\//, '');
    if (!clean) continue; // './' 表示根目录
    checked++;
    if (!exists(clean)) problems.push(`service-worker: 预缓存文件缺失 → ${item}`);
  }
}

/* ---------------- 结果 ---------------- */
if (problems.length) {
  console.error(`✗ 发现 ${problems.length} 个问题（已检查 ${checked} 项）：`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log(`✓ 资源检查通过：${pages.length} 个页面、${checked} 个引用，无外链、无缺失`);
