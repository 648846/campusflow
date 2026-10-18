@echo off
chcp 65001 >nul
echo ========================================
echo    CampusFlow - 大学生专属时间规划
echo ========================================
echo.
echo 正在启动 CampusFlow...
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python！
    echo.
    echo 请先安装 Python：
    echo 1. 访问 https://www.python.org/downloads/
    echo 2. 下载并安装 Python（记得勾选 "Add Python to PATH"）
    echo.
    pause
    exit /b 1
)

echo [成功] Python 已找到
echo.

REM 启动服务器
echo [信息] 正在启动本地服务器...
cd /d "%~dp0"
start "CampusFlow Server" cmd /k "python -m http.server 8000"

REM 等待服务器启动
echo [信息] 等待服务器启动...
timeout /t 3 /nobreak >nul

REM 打开浏览器
echo [信息] 正在打开浏览器...
start http://localhost:8000/index.html

echo.
echo ========================================
echo    CampusFlow 已成功启动！
echo ========================================
echo.
echo 请在浏览器中访问：
echo http://localhost:8000/index.html
echo.
echo 功能页面：
echo - 仪表盘:      http://localhost:8000/index.html
echo - 课程管理:    http://localhost:8000/schedule.html
echo - 任务规划:    http://localhost:8000/tasks.html
echo - 学习目标:    http://localhost:8000/goals.html
echo - 专注模式:    http://localhost:8000/focus.html
echo - 在线预览:    http://localhost:8000/preview.html
echo - 文件下载:    http://localhost:8000/download.html
echo.
echo ========================================
echo.
echo 提示：
echo - 本窗口关闭后服务器将停止
echo - 要停止服务器，请关闭 "CampusFlow Server" 窗口
echo - 如需下次使用，再次运行此脚本即可
echo.
echo 按任意键关闭此窗口...
pause >nul