# AlgorithmCamp Deployment Script
# One-click deployment to production server

set -e

echo "=========================================="
echo " AlgorithmCamp Deployment Script"
echo "=========================================="

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/algorithmcamp}"
BACKEND_DIR="$DEPLOY_DIR/AlgorithmCamp/server"
FRONTEND_DIR="$DEPLOY_DIR/site"
REPO_URL="${GIT_REPO_URL:-https://github.com/zimingttkx/AlgorithmCamp.git}"
BRANCH="${DEPLOY_BRANCH:-main}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f "$DEPLOY_DIR/deploy/.env" ]; then
    echo -e "${RED}Error: .env file not found at $DEPLOY_DIR/deploy/.env${NC}"
    echo -e "${YELLOW}Please create it from .env.example first${NC}"
    exit 1
fi

# Load environment variables
source "$DEPLOY_DIR/deploy/.env"

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
cd "$DEPLOY_DIR"
if [ -d ".git" ]; then
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR
fi

echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd "$DEPLOY_DIR"
if [ -f "package.json" ]; then
    npm ci --production
    npm run build 2>/dev/null || npm run build:site 2>/dev/null || echo "Build step may vary"
fi

echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm ci --production

echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
if [ -f "node_modules/.bin/sequelize" ]; then
    node_modules/.bin/sequelize db:migrate
elif [ -f "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma migrate deploy
else
    echo -e "${YELLOW}No migration tool found, skipping...${NC}"
fi

echo -e "${YELLOW}Step 5: Starting Docker containers...${NC}"
cd "$DEPLOY_DIR/deploy"
docker-compose down 2>/dev/null || true
docker-compose pull
docker-compose up -d --build

echo -e "${YELLOW}Step 6: Restarting PM2 processes...${NC}"
cd "$BACKEND_DIR"
pm2 stop algorithmcamp-api 2>/dev/null || true
pm2 delete algorithmcamp-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${YELLOW}Step 7: Checking service health...${NC}"
sleep 5
curl -f http://localhost/health &>/dev/null && echo -e "${GREEN}Nginx: Healthy${NC}" || echo -e "${RED}Nginx: Unhealthy${NC}"
pm2 describe algorithmcamp-api &>/dev/null && echo -e "${GREEN}PM2: Running${NC}" || echo -e "${RED}PM2: Not running${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo " Deployment complete!"
echo "=========================================="
echo ""
echo "Services:"
echo "- Frontend: http://localhost"
echo "- API: http://localhost:3000"
echo "- Nginx: http://localhost"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs algorithmcamp-api"
echo "- Docker logs: docker-compose logs -f"
echo "- Restart: pm2 restart algorithmcamp-api"
echo ""
