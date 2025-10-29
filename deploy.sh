#!/bin/bash

# ============================================
# witdot Education AI Platform
# CentOS 自动化部署脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户运行此脚本，或使用 sudo"
        exit 1
    fi
}

# 获取服务器 IP
get_server_ip() {
    # 获取内网IP作为参考
    LOCAL_IP=$(hostname -I | awk '{print $1}')

    # 尝试获取公网IP
    print_info "正在检测公网 IP..."
    PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || curl -s --connect-timeout 5 ip.sb 2>/dev/null || echo "")

    echo ""
    print_info "检测到的 IP 地址："
    echo -e "  内网IP: ${YELLOW}$LOCAL_IP${NC}"
    if [ -n "$PUBLIC_IP" ]; then
        echo -e "  公网IP: ${YELLOW}$PUBLIC_IP${NC}"
    else
        echo -e "  公网IP: ${RED}检测失败${NC}"
    fi
    echo ""

    # 让用户选择或手动输入
    if [ -n "$PUBLIC_IP" ]; then
        read -p "请选择要使用的 IP 地址 [1=公网IP, 2=内网IP, 3=手动输入] (默认: 1): " IP_CHOICE
        IP_CHOICE=${IP_CHOICE:-1}

        case $IP_CHOICE in
            1)
                SERVER_IP=$PUBLIC_IP
                print_success "使用公网IP: $SERVER_IP"
                ;;
            2)
                SERVER_IP=$LOCAL_IP
                print_warning "使用内网IP: $SERVER_IP (仅内网可访问)"
                ;;
            3)
                read -p "请输入服务器公网 IP: " SERVER_IP
                print_success "使用手动输入的IP: $SERVER_IP"
                ;;
            *)
                SERVER_IP=$PUBLIC_IP
                print_success "使用公网IP: $SERVER_IP"
                ;;
        esac
    else
        print_warning "无法自动检测公网IP"
        read -p "请手动输入服务器公网 IP (留空使用内网IP $LOCAL_IP): " SERVER_IP
        SERVER_IP=${SERVER_IP:-$LOCAL_IP}
        print_success "使用IP: $SERVER_IP"
    fi

    echo ""
}

# 安装 Node.js 18
install_nodejs() {
    print_info "检查 Node.js 安装状态..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js 已安装: $NODE_VERSION"
        return 0
    fi

    print_info "开始安装 Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs

    print_success "Node.js 安装完成: $(node -v)"
}

# 安装 MongoDB
install_mongodb() {
    print_info "检查 MongoDB 安装状态..."

    if command -v mongod &> /dev/null; then
        print_success "MongoDB 已安装"
        systemctl start mongod || true
        systemctl enable mongod || true
        return 0
    fi

    print_info "开始安装 MongoDB..."

    cat <<EOF > /etc/yum.repos.d/mongodb-org-6.0.repo
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

    yum install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod

    print_success "MongoDB 安装完成"
}

# 安装 Nginx
install_nginx() {
    print_info "检查 Nginx 安装状态..."

    if command -v nginx &> /dev/null; then
        print_success "Nginx 已安装"
        return 0
    fi

    print_info "开始安装 Nginx..."
    yum install -y nginx
    systemctl enable nginx

    print_success "Nginx 安装完成"
}

# 安装 PM2
install_pm2() {
    print_info "检查 PM2 安装状态..."

    if command -v pm2 &> /dev/null; then
        print_success "PM2 已安装"
        return 0
    fi

    print_info "开始安装 PM2..."
    npm install -g pm2

    print_success "PM2 安装完成"
}

# 获取项目路径
get_project_path() {
    PROJECT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    print_info "项目路径: $PROJECT_PATH"
}

# 交互式配置环境变量
configure_env() {
    print_info "开始配置环境变量..."

    # 检查是否已有配置文件
    if [ -f "$PROJECT_PATH/server/.env" ]; then
        echo ""
        print_warning "检测到已存在的环境配置文件"
        read -p "是否使用现有配置？(y/n) [默认: y]: " USE_EXISTING
        USE_EXISTING=${USE_EXISTING:-y}

        if [[ $USE_EXISTING =~ ^[Yy]$ ]]; then
            print_success "使用现有环境配置"

            # 从现有配置读取端口号
            BACKEND_PORT=$(grep "^PORT=" "$PROJECT_PATH/server/.env" | cut -d'=' -f2)
            BACKEND_PORT=${BACKEND_PORT:-3210}

            print_info "后端端口: $BACKEND_PORT"
            return 0
        else
            print_info "将创建新的环境配置"
        fi
    fi

    # 获取用户输入
    echo ""
    read -p "请输入后端服务端口 [默认: 3210]: " BACKEND_PORT
    BACKEND_PORT=${BACKEND_PORT:-3210}

    echo ""
    read -p "请输入 MongoDB 数据库名 [默认: edu_app_prod]: " DB_NAME
    DB_NAME=${DB_NAME:-edu_app_prod}

    echo ""
    read -p "请输入 JWT Secret (留空将自动生成): " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_info "已自动生成 JWT Secret"
    fi

    echo ""
    read -p "请输入 Claude API Key: " CLAUDE_API_KEY
    while [ -z "$CLAUDE_API_KEY" ]; do
        print_warning "Claude API Key 不能为空"
        read -p "请输入 Claude API Key: " CLAUDE_API_KEY
    done

    # 创建后端 .env 文件
    print_info "创建后端环境变量文件..."
    cat > "$PROJECT_PATH/server/.env" <<EOF
# 服务器配置
PORT=$BACKEND_PORT
NODE_ENV=production
HOST=0.0.0.0

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/$DB_NAME

# JWT 配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Claude API 配置
ANTHROPIC_API_KEY=$CLAUDE_API_KEY

# CORS 配置
CORS_ORIGIN=http://$SERVER_IP

# 日志配置
LOG_LEVEL=info
EOF

    print_success "后端环境变量配置完成"

    # 创建前端 .env.production 文件
    print_info "创建前端环境变量文件..."
    cat > "$PROJECT_PATH/client/.env.production" <<EOF
# API 基础地址（通过 Nginx 反向代理）
VITE_API_URL=http://$SERVER_IP/api
EOF

    print_success "前端环境变量配置完成"
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."

    # 安装后端依赖
    print_info "安装后端依赖..."
    cd "$PROJECT_PATH/server"
    npm install --production

    # 安装前端依赖
    print_info "安装前端依赖..."
    cd "$PROJECT_PATH/client"
    npm install

    print_success "依赖安装完成"
}

# 构建前端
build_frontend() {
    print_info "开始构建前端..."

    cd "$PROJECT_PATH/client"
    npm run build

    print_success "前端构建完成"
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."

    cd "$PROJECT_PATH/server"

    # 检查课程同步脚本是否存在
    if [ -f "src/scripts/syncCourses.js" ]; then
        node src/scripts/syncCourses.js || print_warning "课程同步失败，请手动检查"
    else
        print_warning "课程同步脚本不存在，跳过初始化"
    fi

    print_success "数据库初始化完成"
}

# 修复目录权限
fix_permissions() {
    print_info "修复目录权限..."

    # 修复 /root 目录权限（如果项目在 /root 下）
    if [[ "$PROJECT_PATH" == /root* ]]; then
        chmod 755 /root 2>/dev/null || true
    fi

    # 获取项目路径的父目录们并修复权限
    local current_path="$PROJECT_PATH"
    while [ "$current_path" != "/" ]; do
        chmod 755 "$current_path" 2>/dev/null || true
        current_path=$(dirname "$current_path")
    done

    # 修复项目目录权限
    chmod -R 755 "$PROJECT_PATH/client/dist" 2>/dev/null || true
    chmod -R 755 "$PROJECT_PATH/server/public" 2>/dev/null || true

    print_success "目录权限已修复"
}

# 配置 Nginx
configure_nginx() {
    print_info "配置 Nginx..."

    # 创建 Nginx 配置文件
    cat > /etc/nginx/conf.d/eduapp.conf <<EOF
server {
    listen 80;
    server_name $SERVER_IP _;

    # 前端静态文件
    root $PROJECT_PATH/client/dist;
    index index.html;

    # 日志配置
    access_log /var/log/nginx/eduapp-access.log;
    error_log /var/log/nginx/eduapp-error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;

    # 前端路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源（课程文件等）
    location /public {
        alias $PROJECT_PATH/server/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 检查并备份默认配置
    if [ -f /etc/nginx/nginx.conf ]; then
        # 确保 nginx.conf 包含 conf.d 目录
        if ! grep -q "include /etc/nginx/conf.d/\*.conf" /etc/nginx/nginx.conf; then
            print_warning "Nginx 配置可能需要手动调整，请确保包含 conf.d 目录"
        fi
    fi

    # 修复权限问题
    fix_permissions

    # 测试 Nginx 配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx

    print_success "Nginx 配置完成"
}

# 启动后端服务
start_backend() {
    print_info "启动后端服务..."

    cd "$PROJECT_PATH/server"

    # 停止已存在的进程
    pm2 delete eduapp-server 2>/dev/null || true

    # 启动应用
    pm2 start src/app.js --name "eduapp-server"

    # 保存 PM2 进程列表
    pm2 save

    # 设置开机自启
    pm2 startup systemd -u root --hp /root

    print_success "后端服务启动完成"
}

# 配置防火墙
configure_firewall() {
    print_info "配置防火墙..."

    if command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http || true
        firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp || true
        firewall-cmd --reload || true
        print_success "防火墙配置完成"
    else
        print_warning "未检测到 firewall，跳过防火墙配置"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "============================================"
    print_success "部署完成！"
    echo "============================================"
    echo ""
    echo -e "${GREEN}访问地址:${NC}"
    echo -e "  前端页面: ${BLUE}http://$SERVER_IP${NC}"
    echo -e "  后端 API: ${BLUE}http://$SERVER_IP/api${NC}"
    echo ""
    echo -e "${YELLOW}提示:${NC}"
    echo -e "  - 请确保服务器安全组/防火墙已开放 80 端口"
    echo -e "  - 如果无法访问，请检查云服务商的安全组设置"
    echo ""
    echo -e "${GREEN}常用命令:${NC}"
    echo -e "  查看后端日志: ${YELLOW}pm2 logs eduapp-server${NC}"
    echo -e "  查看服务状态: ${YELLOW}pm2 status${NC}"
    echo -e "  重启后端: ${YELLOW}pm2 restart eduapp-server${NC}"
    echo -e "  停止后端: ${YELLOW}pm2 stop eduapp-server${NC}"
    echo -e "  查看 Nginx 日志: ${YELLOW}tail -f /var/log/nginx/eduapp-access.log${NC}"
    echo -e "  测试 Nginx 配置: ${YELLOW}nginx -t${NC}"
    echo -e "  重启 Nginx: ${YELLOW}systemctl restart nginx${NC}"
    echo ""
    echo -e "${GREEN}配置文件位置:${NC}"
    echo -e "  后端 .env: ${YELLOW}$PROJECT_PATH/server/.env${NC}"
    echo -e "  前端 .env: ${YELLOW}$PROJECT_PATH/client/.env.production${NC}"
    echo -e "  Nginx 配置: ${YELLOW}/etc/nginx/conf.d/eduapp.conf${NC}"
    echo ""
    echo -e "${GREEN}故障排查:${NC}"
    echo -e "  1. 检查后端是否运行: ${YELLOW}pm2 status${NC}"
    echo -e "  2. 检查 Nginx 是否运行: ${YELLOW}systemctl status nginx${NC}"
    echo -e "  3. 检查端口监听: ${YELLOW}netstat -tuln | grep -E '80|$BACKEND_PORT'${NC}"
    echo -e "  4. 检查防火墙: ${YELLOW}firewall-cmd --list-all${NC}"
    echo ""
}

# 主函数
main() {
    echo "============================================"
    echo "  witdot Education AI Platform"
    echo "  自动化部署脚本 (CentOS)"
    echo "============================================"
    echo ""

    # 检查 root 权限
    check_root

    # 获取项目路径
    get_project_path

    # 检测是否已部署
    ALREADY_DEPLOYED=false
    if [ -f "$PROJECT_PATH/server/.env" ] && [ -f "/etc/nginx/conf.d/eduapp.conf" ]; then
        ALREADY_DEPLOYED=true
        print_warning "检测到已存在的部署配置"
        echo ""
        echo "请选择部署模式："
        echo "  1) 更新部署（保留配置，仅更新代码）"
        echo "  2) 完全重新部署（重新配置所有内容）"
        echo ""
        read -p "请选择 [1/2] (默认: 1): " DEPLOY_MODE
        DEPLOY_MODE=${DEPLOY_MODE:-1}
        echo ""
    fi

    # 获取服务器 IP
    get_server_ip

    echo ""
    if [ "$DEPLOY_MODE" == "1" ] && [ "$ALREADY_DEPLOYED" = true ]; then
        print_info "开始更新部署..."
        read -p "是否继续？(y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "部署已取消"
            exit 0
        fi

        # 更新部署模式（跳过系统依赖安装和环境配置）
        print_info "步骤 1/5: 检查系统依赖..."
        install_nodejs
        install_mongodb
        install_nginx
        install_pm2

        print_info "步骤 2/5: 使用现有环境配置..."
        # 读取现有配置
        BACKEND_PORT=$(grep "^PORT=" "$PROJECT_PATH/server/.env" | cut -d'=' -f2)
        BACKEND_PORT=${BACKEND_PORT:-3210}
        print_success "后端端口: $BACKEND_PORT"

        print_info "步骤 3/5: 更新项目依赖并构建..."
        install_dependencies
        build_frontend

        print_info "步骤 4/5: 重启服务..."
        configure_nginx
        start_backend

        print_info "步骤 5/5: 完成更新..."
        show_deployment_info
    else
        # 完整部署模式
        print_info "开始完整部署..."
        read -p "是否继续部署？(y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "部署已取消"
            exit 0
        fi

        # 安装系统依赖
        print_info "步骤 1/9: 安装系统依赖..."
        install_nodejs
        install_mongodb
        install_nginx
        install_pm2

        # 配置环境变量
        print_info "步骤 2/9: 配置环境变量..."
        configure_env

        # 安装项目依赖
        print_info "步骤 3/9: 安装项目依赖..."
        install_dependencies

        # 构建前端
        print_info "步骤 4/9: 构建前端..."
        build_frontend

        # 初始化数据库
        print_info "步骤 5/9: 初始化数据库..."
        init_database

        # 配置 Nginx
        print_info "步骤 6/9: 配置 Nginx..."
        configure_nginx

        # 启动后端服务
        print_info "步骤 7/9: 启动后端服务..."
        start_backend

        # 配置防火墙
        print_info "步骤 8/9: 配置防火墙..."
        configure_firewall

        # 显示部署信息
        print_info "步骤 9/9: 完成部署..."
        show_deployment_info
    fi
}

# 运行主函数
main "$@"
