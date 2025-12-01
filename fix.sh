#!/bin/bash

  echo "修复Nginx视频访问配置..."

  # 备份原配置
  cp /etc/nginx/conf.d/eduapp.conf /etc/nginx/conf.d/eduapp.conf.backup

  # 查找并替换location /public配置
  sed -i '/location \/public/,/}/c\
      # 静态资源（课程文件等）\
      location /public/ {\
          alias /root/code/witdot_education/server/public/;\
          expires 30d;\
          add_header Cache-Control "public, immutable";\
          \
          # MIME类型支持\
          types {\
              video/mp4 mp4;\
              video/webm webm;\
              application/pdf pdf;\
              image/jpeg jpg jpeg;\
              image/png png;\
          }\
      }' /etc/nginx/conf.d/eduapp.conf

  echo "测试Nginx配置..."
  nginx -t

  if [ $? -eq 0 ]; then
      echo "配置正确，重启Nginx..."
      systemctl restart nginx
      echo "✅ Nginx已重启"

      echo ""
      echo "测试视频访问..."
      HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}"
  http://localhost/public/courses/ai-literacy-primary-high/videos/lesson-03.mp4)

      if [ "$HTTP_CODE" = "200" ]; then
          echo "✅ 视频访问成功！HTTP状态码: $HTTP_CODE"
      else
          echo "❌ 视频访问失败，HTTP状态码: $HTTP_CODE"
      fi
  else
      echo "❌ Nginx配置有误，已回滚"
      cp /etc/nginx/conf.d/eduapp.conf.backup /etc/nginx/conf.d/eduapp.conf
  fi