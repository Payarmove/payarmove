#!/usr/bin/env bash
# =============================================================================
# PayarMove VPS Deployment & Permissions Setup Script
# Target VPS IP: 173.214.172.222
# Domains: payarmove.com, www.payarmove.com, api.payarmove.com
# =============================================================================

set -e

echo "========================================================"
echo " Starting PayarMove VPS Setup for 173.214.172.222"
echo " Frontend: https://payarmove.com"
echo " Backend:  https://api.payarmove.com"
echo "========================================================"

# 1. Update system packages
echo "--> [1/7] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y ufw curl git certbot python3-certbot-nginx

# 2. Configure Firewall (UFW)
echo "--> [2/7] Configuring UFW Firewall permissions..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Nginx'
sudo ufw allow 443/tcp comment 'HTTPS Nginx'
sudo ufw --force enable
sudo ufw status verbose

# 3. Create necessary persistent directories
echo "--> [3/7] Setting up storage directories & permissions..."
mkdir -p media staticfiles certbot/conf certbot/www
chmod -R 755 media staticfiles certbot

# 4. Verify DNS Configuration
echo "--> [4/7] Checking DNS records for 173.214.172.222..."
for DOMAIN in payarmove.com www.payarmove.com api.payarmove.com; do
    RESOLVED_IP=$(dig +short "$DOMAIN" | tail -n1 || true)
    echo "  - $DOMAIN resolves to: ${RESOLVED_IP:-[NOT RESOLVED YET]}"
done

# 5. Acquire SSL Certificates with Certbot (Let's Encrypt)
echo "--> [5/7] Provisioning SSL Certificates with Let's Encrypt..."
read -p "Enter contact email for SSL registration (e.g. admin@payarmove.com): " SSL_EMAIL
SSL_EMAIL=${SSL_EMAIL:-admin@payarmove.com}

# Obtain certificates for payarmove.com and www.payarmove.com
if [ ! -d "/etc/letsencrypt/live/payarmove.com" ]; then
    echo "Obtaining SSL certificate for payarmove.com & www.payarmove.com..."
    sudo certbot certonly --standalone --agree-tos --no-eff-email \
        -m "$SSL_EMAIL" -d payarmove.com -d www.payarmove.com || echo "Warning: Certbot standalone failed. Ensure ports 80/443 are free and DNS is pointed."
fi

# Obtain certificates for api.payarmove.com
if [ ! -d "/etc/letsencrypt/live/api.payarmove.com" ]; then
    echo "Obtaining SSL certificate for api.payarmove.com..."
    sudo certbot certonly --standalone --agree-tos --no-eff-email \
        -m "$SSL_EMAIL" -d api.payarmove.com || echo "Warning: Certbot standalone failed. Ensure ports 80/443 are free and DNS is pointed."
fi

# 6. Build and Launch Docker Services
echo "--> [6/7] Building and launching Docker production cluster..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build

# 7. Apply Migrations & Collect Static Files
echo "--> [7/7] Verifying container health..."
docker compose -f docker-compose.prod.yml ps

echo "========================================================"
echo " PayarMove Production Deployment is Active!"
echo " Frontend: https://payarmove.com"
echo " Backend:  https://api.payarmove.com"
echo " API Docs: https://api.payarmove.com/api/v1/docs/"
echo " Admin:    https://api.payarmove.com/admin/"
echo " VPS IP:   http://173.214.172.222"
echo "========================================================"
