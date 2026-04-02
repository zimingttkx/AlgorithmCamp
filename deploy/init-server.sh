#!/bin/bash
# AlgorithmCamp Server Initialization Script
# Ubuntu/Debian
# Run as root or with sudo

set -e

echo "=========================================="
echo " AlgorithmCamp Server Initialization"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${YELLOW}Installing essential packages...${NC}"
apt install -y curl wget git unzip

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Verify Docker is running
echo -e "${YELLOW}Verifying Docker...${NC}"
docker run --rm hello-world &> /dev/null && echo -e "${GREEN}Docker is running correctly${NC}" || echo -e "${RED}Docker is not running${NC}"

# Configure firewall (UFW)
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw reload
    echo -e "${GREEN}Firewall configured (UFW)${NC}"
fi

# Create application directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p /var/www/algorithmcamp
mkdir -p /var/www/algorithmcamp/site
mkdir -p /var/www/algorithmcamp/server/logs
chown -R $USER:$USER /var/www/algorithmcamp 2>/dev/null || true

# Install Node.js 20.x (for PM2 and backend)
echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}Node.js $(node -v) installed${NC}"
else
    echo -e "${GREEN}Node.js $(node -v) is already installed${NC}"
fi

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully${NC}"
else
    echo -e "${GREEN}PM2 is already installed${NC}"
fi

# Setup PM2 startup script
echo -e "${YELLOW}Generating PM2 startup script...${NC}"
env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER 2>/dev/null || true

echo ""
echo -e "${GREEN}=========================================="
echo " Server initialization complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy deployment files to /var/www/algorithmcamp/"
echo "2. Create .env file: cp deploy/.env.example deploy/.env"
echo "3. Edit .env with your configuration"
echo "4. Run: cd deploy && docker-compose up -d"
echo "5. Run: pm2 start ecosystem.config.js"
echo ""
echo "Don't forget to:"
echo "- Configure your domain DNS"
echo "- Setup SSL with Certbot: certbot --nginx"
echo "- Enable HTTPS in nginx.conf"
echo ""
