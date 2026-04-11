#!/bin/bash

# 确保遇到错误时停止执行
set -e

# --- 1. 获取前端提交信息 ---
echo "--------------------------------"
echo "Step 1: Frontend Configuration"
read -p "Enter FRONTEND commit message (default: 'sse ready s1-win'): " fe_msg
# 如果输入为空，则使用默认值
FE_COMMIT_MSG=${fe_msg:-"sse ready s1-win"}

# --- 2. 获取后端提交信息 ---
echo "--------------------------------"
echo "Step 2: Backend Configuration"
read -p "Enter BACKEND commit message (default: 'sse ready s1-win'): " be_msg
BE_COMMIT_MSG=${be_msg:-"sse ready s1-win"}

echo "--------------------------------"
echo "Starting deployment..."

# --- 3. 执行前端推送 ---
# 假设脚本在前端目录下运行
echo "Pushing Frontend..."
git rm -r --cached .
git add .
# 即使没有文件更改也允许脚本继续
git commit -m "$FE_COMMIT_MSG" || echo "No changes to commit in Frontend"
git push origin master

# --- 4. 执行后端推送 ---
echo "Switching to Backend..."
if [ -d "../backend" ]; then
    cd ../backend
    git rm -r --cached .
    git add .
    git commit -m "$BE_COMMIT_MSG" || echo "No changes to commit in Backend"
    git push origin main
    
    # --- 5. 返回原目录 ---
    cd ../frontend
    echo "--------------------------------"
    echo "Done! All repos are up to date."
else
    echo "Error: ../backend directory not found!"
    exit 1
fi