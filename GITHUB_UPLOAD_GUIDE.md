# CampusFlow GitHub 上传指南

## 📁 准备上传的文件

**所有文件都已准备就绪：**

```
CampusFlow/
├── dashboard.html      # 仪表盘
├── schedule.html       # 课程管理
├── tasks.html          # 任务规划
├── goals.html          # 学习目标
├── focus.html          # 专注模式
├── preview.html        # 在线预览
├── download.html       # 文件下载
├── README.md           # 项目文档
├── DEPLOYMENT.md       # 部署指南
├── PACKAGING.md        # 打包指南
├── 快速开始.md         # 快速开始
├── package.json        # Electron配置
├── main.js             # Electron主进程
├── 启动服务器.bat       # Windows启动脚本
└── .gitignore          # Git忽略文件
```

## 🚀 方法一：GitHub 网页上传（最简单，推荐）

### 步骤 1：创建 GitHub 仓库

1. **登录 GitHub**：https://github.com
2. **点击右上角的 "+" → "New repository"**
3. **填写仓库信息**：
   - **Repository name**: `campusflow`
   - **Description**: `CampusFlow - 大学生专属时间规划`
   - **Visibility**: 选择 `Public`（公开）
   - **勾选**：`Add a README file`
   - 其他选项保持默认
   - **点击**：`Create repository`

### 步骤 2：上传文件

1. **进入新创建的仓库页面**
2. **点击**：`Add file` → `Upload files`
3. **拖拽文件**：
   - 打开文件资源管理器，进入 `c:\Users\648\Documents\trae_projects\11`
   - 选择所有文件（除了 `node_modules` 等不需要的文件夹）
   - 拖拽到浏览器的上传区域
4. **填写提交信息**：
   - **Commit message**: `Initial commit: CampusFlow project files`
   - **Description**（可选）: `包含完整的 CampusFlow 项目文件`
5. **点击**：`Commit changes`

### 步骤 3：验证上传

- 刷新仓库页面，查看文件是否全部上传成功
- 点击任意文件，确认内容正确

## 📦 方法二：打包上传（适合文件较多）

### 步骤 1：打包文件

1. **在项目目录中**，选中所有文件
2. **右键** → `发送到` → `压缩(zipped)文件夹`
3. 生成 `11.zip` 或类似的压缩文件

### 步骤 2：在 GitHub 上传

1. **进入仓库** → `Add file` → `Upload files`
2. 拖拽 `11.zip` 文件到上传区域
3. 填写提交信息，点击 `Commit changes`
4. 上传完成后，在 GitHub 上可以直接查看压缩包内容

## 🔧 方法三：使用 GitHub Desktop（推荐给新手）

### 步骤 1：下载安装 GitHub Desktop

1. **访问**：https://desktop.github.com/
2. **下载** 适合您系统的版本
3. **安装** 并登录 GitHub 账号

### 步骤 2：创建仓库

1. **打开 GitHub Desktop**
2. **点击**：`File` → `New repository`
3. **填写信息**：
   - **Name**: `campusflow`
   - **Local path**: `c:\Users\648\Documents\trae_projects\11`
   - **Initialize this repository with a README**：勾选
   - **Git ignore**: 选择 `Node`（可选）
4. **点击**：`Create repository`

### 步骤 3：提交并发布

1. **在 GitHub Desktop 中**，会看到所有文件
2. **在 "Summary" 中** 填写：`Initial commit: CampusFlow project files`
3. **点击**：`Commit to main`
4. **点击**：`Publish repository`
5. **选择**：`Public`，点击 `Publish`

## 📱 方法四：使用 Git 命令行（需要安装 Git）

### 步骤 1：安装 Git

1. **下载 Git**：https://git-scm.com/downloads
2. **安装** Git（勾选 "Add Git to PATH"）
3. **重启** 电脑

### 步骤 2：执行命令

打开命令提示符（CMD），执行以下命令：

```bash
# 进入项目目录
cd c:\Users\648\Documents\trae_projects\11

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交文件
git commit -m "Initial commit: CampusFlow project files"

# 添加远程仓库（替换为您的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/campusflow.git

# 推送代码
git push -u origin main
```

## 🎯 完成后的操作

### 开启 GitHub Pages（可选，推荐）

1. **进入仓库** → `Settings` → `Pages`
2. **Source**：选择 `main` branch
3. **点击**：`Save`
4. 几分钟后，访问：`https://你的用户名.github.io/campusflow/`

### 分享仓库

- 复制仓库地址：`https://github.com/你的用户名/campusflow`
- 分享给朋友或团队成员

## ❓ 常见问题

### Q: 上传文件大小限制
A: GitHub 单文件限制 100MB，超过需要使用 Git LFS

### Q: 上传速度慢
A: 检查网络连接，或使用方法二（打包上传）

### Q: 如何更新代码
A: 重复上传步骤，或使用 Git 命令：
```bash
git add .
git commit -m "更新信息"
git push
```

### Q: 如何删除文件
A: 在 GitHub 页面选择文件 → `Delete file` → `Commit changes`

---

**完成上传后，您的项目就可以在 GitHub 上托管了！**

需要任何帮助，随时告诉我！