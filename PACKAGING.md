# CampusFlow 打包成 App 指南

## 目录

1. [方法一：Electron 打包（推荐）](#方法一electron-打包推荐)
2. [方法二：PWA（渐进式 Web 应用）](#方法二pwa渐进式-web-应用)
3. [方法三：NW.js 打包](#方法三nwjs-打包)
4. [方法四：使用打包工具](#方法四使用打包工具)
5. [快速开始脚本](#快速开始脚本)

---

## 方法一：Electron 打包（推荐）

### 前置准备

1. 安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）
2. 检查 Node.js 和 npm 安装：

```bash
node --version
npm --version
```

### 步骤 1：创建项目结构

在项目根目录创建以下文件：

#### 1.1 package.json

```json
{
  "name": "campusflow",
  "version": "1.0.0",
  "description": "CampusFlow - 大学生专属时间规划",
  "author": "Your Name",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.campusflow.app",
    "productName": "CampusFlow",
    "directories": {
      "output": "dist"
    },
    "files": [
      "*.html",
      "main.js",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": "dmg",
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icon.png"
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  }
}
```

#### 1.2 main.js（Electron 主进程文件）

```javascript
const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'build/icon.png')
  });

  mainWindow.loadFile('dashboard.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 CampusFlow',
              message: 'CampusFlow v1.0.0',
              detail: '大学生专属时间规划应用\n\n© 2024 CampusFlow'
            });
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### 步骤 2：安装依赖

在项目根目录打开终端/命令提示符：

```bash
# 进入项目目录
cd "c:\Users\648\Documents\trae_projects\11"

# 安装依赖
npm install
```

### 步骤 3：测试开发版本

```bash
npm start
```

应用应该会启动，显示 CampusFlow 界面。

### 步骤 4：准备应用图标

创建 `build` 文件夹并准备图标文件：

```
build/
├── icon.ico    # Windows 图标 (256x256)
├── icon.icns   # macOS 图标 (512x512)
└── icon.png    # Linux 图标 (512x512)
```

**快速创建图标：**
- 使用在线工具如 [ConvertIO](https://convertio.co/) 转换图片格式
- 或使用 [RealWorld Icon Editor](http://www.rw-designer.com/) 创建 .ico 文件
- 或者暂时跳过图标步骤（使用默认图标）

### 步骤 5：打包应用

#### Windows 打包

```bash
npm run build:win
```

打包完成后，在 `dist` 文件夹中会生成：
- `CampusFlow Setup 1.0.0.exe` - 安装程序

#### macOS 打包

```bash
npm run build:mac
```

打包完成后，在 `dist` 文件夹中会生成：
- `CampusFlow-1.0.0.dmg` - 磁盘映像文件

#### Linux 打包

```bash
npm run build:linux
```

打包完成后，在 `dist` 文件夹中会生成：
- `CampusFlow-1.0.0.AppImage` - AppImage 格式
- `campusflow_1.0.0_amd64.deb` - Debian/Ubuntu 包

#### 全平台打包

```bash
npm run build
```

---

## 方法二：PWA（渐进式 Web 应用）

### 步骤 1：创建 manifest.json

在项目根目录创建 `manifest.json`：

```json
{
  "name": "CampusFlow",
  "short_name": "CampusFlow",
  "description": "大学生专属时间规划",
  "start_url": "./dashboard.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "scope": "./",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": [
    "education",
    "productivity"
  ]
}
```

### 步骤 2：添加 manifest 链接到 HTML

在每个 HTML 文件的 `<head>` 标签中添加：

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#6366f1">
<link rel="apple-touch-icon" href="icons/icon-192x192.png">
```

### 步骤 3：创建 Service Worker（可选）

创建 `service-worker.js`：

```javascript
const CACHE_NAME = 'campusflow-v1';
const urlsToCache = [
  './',
  './dashboard.html',
  './schedule.html',
  './tasks.html',
  './goals.html',
  './focus.html',
  './preview.html',
  './download.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

在 HTML 中添加注册代码：

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
</script>
```

### 步骤 4：部署到 HTTPS 服务器

PWA 需要 HTTPS（localhost 除外）。部署到：
- GitHub Pages
- Vercel
- Netlify
- 或其他支持 HTTPS 的托管服务

### 步骤 5：安装 PWA

1. 访问部署后的网站
2. Chrome/Edge：点击地址栏右侧的「安装」图标
3. Safari：点击「分享」→「添加到主屏幕」
4. 应用会安装到设备主屏幕

---

## 方法三：NW.js 打包

### 步骤 1：创建 package.json

```json
{
  "name": "campusflow",
  "version": "1.0.0",
  "description": "CampusFlow - 大学生专属时间规划",
  "main": "dashboard.html",
  "window": {
    "title": "CampusFlow",
    "width": 1280,
    "height": 800,
    "min_width": 800,
    "min_height": 600,
    "icon": "icon.png"
  },
  "chromium-args": "--disable-features=IsolateOrigins,site-per-process"
}
```

### 步骤 2：下载 NW.js

从 [NW.js 官网](https://nwjs.io/downloads/) 下载 SDK 版本：
- Windows: `nwjs-sdk-v0.85.0-win-x64.zip`
- macOS: `nwjs-sdk-v0.85.0-osx-x64.zip`
- Linux: `nwjs-sdk-v0.85.0-linux-x64.tar.gz`

### 步骤 3：解压并复制文件

1. 解压 NW.js
2. 将所有 HTML 文件复制到 NW.js 目录
3. 将 package.json 复制到 NW.js 目录
4. 运行 `nw.exe`（Windows）或 `nwjs.app`（macOS）测试

### 步骤 4：打包应用

使用 [nwjs-builder-phoenix](https://github.com/evshiron/nwjs-builder-phoenix)：

```bash
npm install -g nwjs-builder-phoenix
nwb nwbuild -v 0.85.0 -p win64,osx64,linux64 -o ./dist ./
```

---

## 方法四：使用打包工具

### 工具 1：Nativefier

```bash
# 安装 Nativefier
npm install -g nativefier

# 打包（需要先部署到本地服务器）
nativefier "http://localhost:8000" --name "CampusFlow" --width 1280 --height 800
```

### 工具 2：Web2App

使用在线工具：
- [Web2App](https://web2app.xyz/)
- [GoNative](https://gonative.io/)
- [AppGeyser](https://www.appgeyser.com/)

---

## 快速开始脚本

### Windows 快速启动脚本

创建 `start.bat`：

```batch
@echo off
echo Starting CampusFlow...
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found! Please install Python first.
    pause
    exit /b 1
)

REM 启动服务器
start "CampusFlow Server" python -m http.server 8000

REM 等待服务器启动
timeout /t 2 /nobreak >nul

REM 打开浏览器
start http://localhost:8000/dashboard.html

echo.
echo CampusFlow is running!
echo Open your browser to: http://localhost:8000/dashboard.html
echo.
echo Press any key to stop the server...
pause >nul

REM 停止服务器
taskkill /F /IM python.exe >nul 2>&1
echo Server stopped.
```

### macOS/Linux 快速启动脚本

创建 `start.sh`：

```bash
#!/bin/bash

echo "Starting CampusFlow..."
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found! Please install Python first."
    exit 1
fi

# 启动服务器
cd "$(dirname "$0")"
python3 -m http.server 8000 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8000/dashboard.html"
else
    xdg-open "http://localhost:8000/dashboard.html"
fi

echo ""
echo "CampusFlow is running!"
echo "Open your browser to: http://localhost:8000/dashboard.html"
echo ""
echo "Press Ctrl+C to stop the server..."

# 等待用户中断
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait
```

---

## 打包后的使用

### 安装说明

#### Windows
1. 运行 `CampusFlow Setup 1.0.0.exe`
2. 按照安装向导完成安装
3. 从开始菜单或桌面快捷方式启动

#### macOS
1. 打开 `CampusFlow-1.0.0.dmg`
2. 将 CampusFlow 拖拽到 Applications 文件夹
3. 从 Launchpad 或 Applications 文件夹启动

#### Linux (AppImage)
1. 右键点击 AppImage 文件 → 属性
2. 勾选"允许执行文件"
3. 双击运行

#### Linux (deb)
```bash
sudo dpkg -i campusflow_1.0.0_amd64.deb
```

---

## 常见问题

### Q: Electron 打包失败怎么办？

1. 确保使用 Node.js LTS 版本
2. 清理 node_modules 重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```
3. 检查网络连接（electron-builder 需要下载二进制文件）

### Q: 如何自定义应用图标？

1. 准备一个 512x512 的 PNG 图片
2. 使用在线工具转换为需要的格式：
   - .ico: https://convertio.co/png-to-ico/
   - .icns: https://cloudconvert.com/png-to-icns
3. 放到 build 文件夹
4. 更新 package.json 中的图标路径

### Q: 打包体积太大怎么办？

- 使用 electron-builder 的配置优化：
```json
"build": {
  "asar": true,
  "compression": "maximum"
}
```
- 或者使用 PWA 方案（体积最小）

### Q: 数据保存在哪里？

**Electron:**
- Windows: `%APPDATA%/CampusFlow/`
- macOS: `~/Library/Application Support/CampusFlow/`
- Linux: `~/.config/CampusFlow/`

**PWA:**
- 浏览器的 LocalStorage（与 Web 版相同）

---

## 推荐方案总结

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| Electron | 功能完整、跨平台 | 体积较大 | ⭐⭐⭐⭐⭐ |
| PWA | 体积小、自动更新 | 需要 HTTPS | ⭐⭐⭐⭐ |
| NW.js | 简单直接 | 打包工具较少 | ⭐⭐⭐ |
| Nativefier | 超简单 | 定制性低 | ⭐⭐⭐ |

**推荐使用 Electron 方案**，功能最完整且社区支持最好！

---

**打包成功后，您就可以拥有一个独立的桌面应用了！🎉