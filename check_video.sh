#!/bin/bash

  echo "========================================="
  echo "视频播放问题诊断"
  echo "========================================="
  echo ""

  PROJECT_PATH="/root/code/witdot_education"

  echo "1. 检查视频文件是否存在..."
  VIDEO_COUNT=$(find $PROJECT_PATH/server/public -name "*.mp4" | wc -l)
  echo "   找到 $VIDEO_COUNT 个MP4文件"

  if [ $VIDEO_COUNT -eq 0 ]; then
      echo "   ❌ 未找到视频文件！"
  else
      echo "   ✅ 视频文件存在"
      echo "   视频列表："
      find $PROJECT_PATH/server/public -name "*.mp4"
  fi

  echo ""
  echo "2. 检查public目录权限..."
  PUBLIC_PERM=$(stat -c "%a" $PROJECT_PATH/server/public 2>/dev/null)
  echo "   权限: $PUBLIC_PERM"
  if [ "$PUBLIC_PERM" -ge "755" ]; then
      echo "   ✅ 权限正常"
  else
      echo "   ❌ 权限不足"
  fi

  echo ""
  echo "3. 检查Nginx配置..."
  if grep -q "$PROJECT_PATH/server/public" /etc/nginx/conf.d/eduapp.conf; then
      echo "   ✅ Nginx配置路径正确"
  else
      echo "   ❌ Nginx配置路径可能有误"
  fi

  echo ""
  echo "4. 检查Nginx文件大小限制..."
  MAX_SIZE=$(grep client_max_body_size /etc/nginx/nginx.conf /etc/nginx/conf.d/*.conf 2>/dev/null
  | grep -v "#" | head -1)
  if [ -z "$MAX_SIZE" ]; then
      echo "   ⚠️  未设置client_max_body_size"
  else
      echo "   $MAX_SIZE"
  fi

  echo ""
  echo "5. 测试视频访问..."
  VIDEO_FILE=$(find $PROJECT_PATH/server/public -name "*.mp4" | head -1)
  if [ -n "$VIDEO_FILE" ]; then
      VIDEO_URL=$(echo $VIDEO_FILE | sed "s|$PROJECT_PATH/server/public||")
      echo "   测试URL: /public$VIDEO_URL"
      HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" http://localhost/public$VIDEO_URL)
      echo "   HTTP状态码: $HTTP_CODE"

      if [ "$HTTP_CODE" = "200" ]; then
          echo "   ✅ 视频可访问"
      else
          echo "   ❌ 视频无法访问 (状态码: $HTTP_CODE)"
      fi
  fi

  echo ""
  echo "========================================="
  echo "诊断完成"
  echo "========================================="