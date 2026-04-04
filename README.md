# CampusFlow - 大学生专属时间规划

## 项目概述

CampusFlow 是一个专为大学生设计的现代化时间规划和学习管理Web应用。它提供了课程管理、任务规划、学习目标追踪、专注模式以及在线预览等功能，帮助学生更高效地组织学习生活。

## 技术栈

- **前端框架**: 纯 HTML5 + CSS3 + JavaScript
- **样式框架**: Tailwind CSS 3.x
- **图表库**: Chart.js 4.x
- **数据存储**: LocalStorage (浏览器本地存储)
- **音频处理**: Web Audio API

## 功能特性

### 1. 仪表盘 (dashboard.html)
- 数据可视化展示
- 学习进度统计
- 最近课程提醒
- 快速功能入口

### 2. 课程管理 (schedule.html)
- 课程列表展示
- 添加/编辑/删除课程
- 课程进度追踪
- 课程分类管理

### 3. 任务规划 (tasks.html)
- 任务列表管理
- 任务优先级设置
- 完成状态标记
- 任务筛选和搜索

### 4. 学习目标 (goals.html)
- 学习目标创建
- 目标进度追踪
- 目标统计分析
- 进度可视化展示

### 5. 专注模式 (focus.html)
- Pomodoro番茄钟技术
- 多种背景音效
- 音量控制
- 专注时间统计

### 6. 在线预览 (preview.html)
- 文件上传功能
- 多种格式支持
- 实时预览显示
- 拖拽上传支持

### 7. 文件下载 (download.html)
- 所有HTML文件下载
- 直观的下载界面
- 文件预览图标

## 系统架构

### 页面结构
```
CampusFlow/
├── dashboard.html      # 仪表盘
├── schedule.html       # 课程管理
├── tasks.html          # 任务规划
├── goals.html          # 学习目标
├── focus.html          # 专注模式
├── preview.html        # 在线预览
├── download.html       # 文件下载
└── README.md           # 项目文档
```

### 数据存储架构
```javascript
// LocalStorage 键名
- campusflow_courses    # 课程数据
- campusflow_tasks      # 任务数据
- campusflow_goals      # 学习目标数据
- campusflow_settings   # 应用设置
- theme                 # 主题设置
```

## 安装和部署

### 本地部署

#### 方法一：直接打开HTML文件
1. 下载或克隆项目到本地
2. 直接双击任意HTML文件在浏览器中打开
3. 应用即可使用

#### 方法二：使用Python HTTP服务器
```bash
# 进入项目目录
cd CampusFlow

# 启动Python HTTP服务器
python -m http.server 8000

# 在浏览器中访问
http://localhost:8000
```

#### 方法三：使用Node.js HTTP服务器
```bash
# 安装http-server
npm install -g http-server

# 启动服务器
http-server -p 8000

# 在浏览器中访问
http://localhost:8000
```

### 打包成App

#### 方法一：使用Electron打包

1. 安装Node.js和npm
2. 创建package.json文件：
```json
{
  "name": "campusflow",
  "version": "1.0.0",
  "description": "CampusFlow - 大学生专属时间规划",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "package": "electron-builder"
  },
  "build": {
    "appId": "com.campusflow.app",
    "productName": "CampusFlow",
    "directories": {
      "output": "dist"
    },
    "files": [
      "*.html",
      "main.js"
    ],
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  }
}
```

3. 创建main.js文件：
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('dashboard.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

4. 安装依赖并打包：
```bash
# 安装依赖
npm install

# 启动开发版本
npm start

# 打包应用
npm run package
```

#### 方法二：使用PWA (Progressive Web App)

1. 创建manifest.json文件：
```json
{
  "name": "CampusFlow",
  "short_name": "CampusFlow",
  "description": "大学生专属时间规划",
  "start_url": "./dashboard.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. 在HTML文件中添加manifest链接：
```html
<link rel="manifest" href="manifest.json">
```

3. 部署到HTTPS服务器后，用户可以"安装"应用到主屏幕

#### 方法三：使用NW.js打包

1. 创建package.json：
```json
{
  "name": "campusflow",
  "version": "1.0.0",
  "main": "dashboard.html",
  "window": {
    "title": "CampusFlow",
    "width": 1200,
    "height": 800
  }
}
```

2. 下载NW.js SDK
3. 将项目文件和package.json放入NW.js目录
4. 运行nw.exe启动应用

## 使用指南

### 基本使用流程

1. **启动应用**：打开dashboard.html或通过导航访问首页
2. **添加课程**：进入课程管理页面，点击"添加课程"
3. **创建任务**：在任务规划页面添加待办事项
4. **设定目标**：在学习目标页面设定学习目标
5. **专注学习**：使用专注模式进行高效学习
6. **预览文件**：通过在线预览功能查看学习资料

### 数据备份

所有数据存储在浏览器的LocalStorage中，建议定期备份：

```javascript
// 导出数据
function exportData() {
  const data = {
    courses: JSON.parse(localStorage.getItem('campusflow_courses') || '[]'),
    tasks: JSON.parse(localStorage.getItem('campusflow_tasks') || '[]'),
    goals: JSON.parse(localStorage.getItem('campusflow_goals') || '[]'),
    settings: JSON.parse(localStorage.getItem('campusflow_settings') || '{}')
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campusflow-backup.json';
  a.click();
}

// 导入数据
function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    if (data.courses) localStorage.setItem('campusflow_courses', JSON.stringify(data.courses));
    if (data.tasks) localStorage.setItem('campusflow_tasks', JSON.stringify(data.tasks));
    if (data.goals) localStorage.setItem('campusflow_goals', JSON.stringify(data.goals));
    if (data.settings) localStorage.setItem('campusflow_settings', JSON.stringify(data.settings));
    location.reload();
  };
  reader.readAsText(file);
}
```

## 故障排除

### 常见问题

**Q: 数据丢失了怎么办？**
A: 检查浏览器是否清除了缓存或切换了浏览器。建议定期使用备份功能。

**Q: 页面显示不正常？**
A: 清除浏览器缓存，使用现代浏览器（Chrome、Firefox、Edge、Safari）。

**Q: 专注模式没有声音？**
A: 检查浏览器是否允许自动播放音频，点击页面任意位置激活音频上下文。

**Q: 如何切换主题？**
A: 点击右上角的主题切换按钮，在深色/浅色模式之间切换。

### 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## 开发者信息

### 版本历史

- **v1.0.0** (2024-04-03)
  - 初始版本发布
  - 核心功能实现
  - 文档完善

### 项目结构

```
CampusFlow/
├── dashboard.html      # 主仪表盘
├── schedule.html       # 课程管理
├── tasks.html          # 任务规划
├── goals.html          # 学习目标
├── focus.html          # 专注模式
├── preview.html        # 文件预览
├── download.html       # 文件下载
├── README.md           # 本文档
├── package.json        # (可选) Electron配置
├── main.js             # (可选) Electron主进程
└── manifest.json       # (可选) PWA配置
```

### 技术支持

如有问题或建议，请通过以下方式联系：
- 项目地址：[本地项目目录]
- 问题反馈：在项目目录中查看相关文件

## 许可证

本项目仅供学习和个人使用。

## 致谢

感谢所有为本项目做出贡献的开发者和用户。

---

**祝您使用愉快！** 🎉