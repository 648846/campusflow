# CampusFlow 本地部署指南

## 目录

1. [前置准备](#前置准备)
2. [Windows 部署](#windows-部署)
3. [macOS 部署](#macos-部署)
4. [Linux 部署](#linux-部署)
5. [验证部署](#验证部署)
6. [常见问题](#常见问题)

---

## 前置准备

### 系统要求

- **操作系统**: Windows 10+, macOS 10.14+, Linux (任意发行版)
- **浏览器**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **内存**: 至少 512MB 可用内存
- **磁盘空间**: 至少 50MB 可用空间

### 获取项目文件

确保您有以下文件：

```
CampusFlow/
├── dashboard.html
├── schedule.html
├── tasks.html
├── goals.html
├── focus.html
├── preview.html
├── download.html
└── README.md
```

---

## Windows 部署

### 方法一：直接打开（最简单）

1. **找到项目文件夹
   - 使用文件资源管理器打开项目文件夹

2. **直接打开HTML文件
   - 双击 `dashboard.html`
   - 文件会在默认浏览器中打开
   - 应用已可以使用

### 方法二：使用 Python HTTP 服务器

#### 步骤 1：检查 Python 安装

打开命令提示符（CMD）或 PowerShell：

```powershell
python --version
```

如果显示 Python 版本，说明已安装。如果没有，请从 [python.org](https://www.python.org/downloads/) 下载安装。

#### 步骤 2：启动服务器

```powershell
# 进入项目目录
cd C:\Users\你的用户名\Documents\trae_projects\11

# 启动 HTTP 服务器
python -m http.server 8000
```

#### 步骤 3：访问应用

在浏览器中打开：

```
http://localhost:8000/dashboard.html
```

或直接访问首页：

```
http://localhost:8000/
```

### 方法三：使用 IIS（Windows 专业版）

1. 打开"控制面板" → "程序和功能" → "启用或关闭 Windows 功能"
2. 勾选"Internet Information Services"
3. 将项目文件复制到 `C:\inetpub\wwwroot`
4. 访问 `http://localhost`

---

## macOS 部署

### 方法一：直接打开

1. 打开 Finder，找到项目文件夹
2. 双击 `dashboard.html`
3. 文件会在 Safari 或默认浏览器中打开

### 方法二：使用 Python HTTP 服务器

#### 步骤 1：检查 Python

打开终端：

```bash
python3 --version
```

macOS 通常预装了 Python。如果没有，请从官网下载。

#### 步骤 2：启动服务器

```bash
# 进入项目目录
cd ~/Documents/trae_projects/11

# 启动 HTTP 服务器
python3 -m http.server 8000
```

#### 步骤 3：访问应用

在浏览器中打开：

```
http://localhost:8000/dashboard.html
```

### 方法三：使用 Homebrew + nginx

```bash
# 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 nginx
brew install nginx

# 启动 nginx
brew services start nginx

# 将项目文件复制到 /usr/local/var/www
cp -r *.html /usr/local/var/www/

# 访问
http://localhost/
```

---

## Linux 部署

### 方法一：直接打开

1. 使用文件管理器打开项目文件夹
2. 双击 `dashboard.html`
3. 文件会在默认浏览器中打开

### 方法二：使用 Python HTTP 服务器

#### 步骤 1：检查 Python

```bash
python3 --version
```

如果没有安装：

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3
```

**CentOS/RHEL:**
```bash
sudo yum install python3
```

**Arch Linux:**
```bash
sudo pacman -S python
```

#### 步骤 2：启动服务器

```bash
# 进入项目目录
cd ~/Documents/trae_projects/11

# 启动 HTTP 服务器
python3 -m http.server 8000
```

#### 步骤 3：访问应用

在浏览器中打开：

```
http://localhost:8000/dashboard.html
```

### 方法三：使用 Apache

**Ubuntu/Debian:**
```bash
sudo apt install apache2
sudo systemctl start apache2
sudo cp -r *.html /var/www/html/
```

**CentOS/RHEL:**
```bash
sudo yum install httpd
sudo systemctl start httpd
sudo cp -r *.html /var/www/html/
```

访问：`http://localhost/`

### 方法四：使用 Nginx

```bash
# 安装 Nginx
sudo apt install nginx  # Ubuntu/Debian
# 或
sudo yum install nginx  # CentOS/RHEL

# 启动 Nginx
sudo systemctl start nginx

# 复制文件
sudo cp -r *.html /var/www/html/

# 访问
http://localhost/
```

---

## 验证部署

### 功能检查清单

- [ ] 页面可以正常加载
- [ ] 所有导航可以正常切换
- [ ] 数据可以保存（添加课程/任务/目标）
- [ ] 深色/浅色主题可以切换
- [ ] 专注模式的音效可以播放
- [ ] 所有功能按钮可以正常使用

### 浏览器控制台检查

打开浏览器开发者工具（F12），检查：

- Console 标签页：没有错误
- Network 标签页：所有资源加载成功
- Application 标签页：LocalStorage 可以正常读写

---

## 常见问题

### Q: 端口 8000 被占用了怎么办？

使用其他端口：

```bash
# Windows/macOS/Linux
python -m http.server 8080
# 或
python3 -m http.server 8080
```

然后访问：`http://localhost:8080/`

### Q: 如何在后台运行服务器？

**Windows:**
```powershell
Start-Process python -ArgumentList "-m", "http.server", "8000" -NoNewWindow
```

**macOS/Linux:**
```bash
python3 -m http.server 8000 &
```

### Q: 数据保存在哪里？

数据保存在浏览器的 LocalStorage 中：

- **Chrome**: 设置 → 隐私和安全 → 站点设置 → 存储
- **Firefox**: 设置 → 隐私与安全 → 数据管理
- **Safari**: 偏好设置 → 隐私 → 管理网站数据

### Q: 如何备份数据？

在浏览器控制台（F12）→ Console 标签页，运行：

```javascript
// 导出数据
const data = {
  courses: JSON.parse(localStorage.getItem('campusflow_courses') || '[]'),
  tasks: JSON.parse(localStorage.getItem('campusflow_tasks') || '[]'),
  goals: JSON.parse(localStorage.getItem('campusflow_goals') || '[]'),
  settings: JSON.parse(localStorage.getItem('campusflow_settings') || '{}')
};
console.log(JSON.stringify(data, null, 2));
// 复制输出保存
```

### Q: 局域网访问

如果想在局域网内其他设备访问：

```bash
# 绑定到所有接口
python -m http.server 8000 --bind 0.0.0.0
```

然后访问：`http://你的IP地址:8000/`

确保防火墙允许 8000 端口。

---

## 性能优化建议

1. **使用现代浏览器
2. **定期清除浏览器缓存
3. **定期备份数据
4. **关闭不必要的浏览器标签页

---

## 安全建议

1. **不要在公共计算机上保存敏感数据
2. **定期使用隐私模式访问
3. **定期备份重要数据
4. **注意浏览器安全更新

---

**部署成功后，您就可以开始使用 CampusFlow 了！🎉