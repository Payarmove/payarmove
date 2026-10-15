# PayarMove 🚗 💳 ⛓️
**Institutional Cross-Border Mobility Payments, Hourly Rentals & Soroban Escrow on Stellar**

| Target | Public URL / Host | Destination / Port | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | [https://payarmove.com](https://payarmove.com) | Port 443 / Nginx SPA | Production Ready |
| **Frontend Canonical** | [https://www.payarmove.com](https://www.payarmove.com) | Port 443 / 301 Redirect | Production Ready |
| **Backend REST API** | [https://api.payarmove.com](https://api.payarmove.com) | Gunicorn Port 8000 | Production Ready |
| **Production VPS Host**| `<YOUR_VPS_IP>` | Ports 22, 80, 443 | Ubuntu Linux VPS |
| **Interactive Swagger**| [https://api.payarmove.com/api/v1/docs/](https://api.payarmove.com/api/v1/docs/) | OpenAPI 3.0 UI | Live |
| **Interactive ReDoc**  | [https://api.payarmove.com/api/v1/redoc/](https://api.payarmove.com/api/v1/redoc/) | ReDoc UI | Live |
| **OpenAPI Schema**     | [https://api.payarmove.com/api/v1/schema/](https://api.payarmove.com/api/v1/schema/) | YAML / JSON | Live |

PayarMove is a decentralized peer-to-peer vehicle rental infrastructure platform engineered for emerging markets. PayarMove eliminates cross-border remittance friction, settlement delays, and currency volatility by enabling renters to **rent by the hour and pay in Stellar USDC**, holding funds in a **custom Soroban WebAssembly Smart Contract escrow**, and autonomously disbursing atomic payouts to vehicle owners and the platform treasury.

---

## 🌟 Key Features

1. **Rent by the Hour & Custom Trip Calculator**:
   - Flexible hourly trip booking (presets for 4 hrs, 8 hrs, 24 hrs, 48 hrs, 3 days, 1 week, or custom hour selection).
   - Dynamic real-time calculation: $\text{Rental Fee} = \text{Hourly Rate} \times \text{Duration (Hours)}$.
   - Independent security deposit locking via smart contract escrow.
2. **Dual-Mode Authentication & IAM**:
   - **Web2**: Email & password authentication with secure JWT access and refresh token lifecycle.
   - **Web3 Wallet Connect**: Native Stellar **SEP-0010** challenge-response authentication. Users sign a cryptographically bound challenge transaction using **Freighter**, **Lobstr**, or **xBull** to authenticate without password risk.
3. **Tiered KYC & Compliance Subsystem**:
   - Tier 0: Unverified visitor.
   - Tier 1: Verified contact details.
   - Tier 2: Verified National ID / Passport, Driver's License, or Vehicle Ownership Logbook.
   - Role & Tier-based access control protecting rental bookings and vehicle listings.
4. **Decentralized Escrow via Soroban Smart Contract**:
   - Rust-compiled smart contract deployed to Stellar Testnet (`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`).
   - Locks 100% of the payment (Rental amount + Security deposit).
   - **Atomic Settlement**: Automatically routes 90% of the rental fee to the host, 10% platform fee to the PayarMove treasury, and refunds 100% of the security deposit to the renter upon vehicle inspection.
   - **Dispute Resolution Engine**: Multi-sig arbitration allowing deposit splits in case of vehicle damage claims.
5. **OpenAPI 3.0 & Swagger UI (`drf-spectacular`)**:
   - Interactive Swagger UI: `https://api.payarmove.com/api/v1/docs/`
   - Interactive ReDoc: `https://api.payarmove.com/api/v1/redoc/`
   - Complete technical documentation in [**`API_DOCS.md`**](./API_DOCS.md).
6. **Containerized Production Topology**:
   - Production multi-container topology with **Docker Compose**: Django 5 / Gunicorn, PostgreSQL 16, Redis 7, Celery Worker, Celery Beat, Soroban Event Indexer, Nginx Reverse Proxy, and Certbot SSL auto-renewal.

---

## 🏛️ System Architecture

```
                                  +------------------------------+
                                  |   Renter / Host / Admin UI   |
                                  |      https://payarmove.com   |
                                  +---------------+--------------+
                                                  |
                                                  | HTTPS / REST
                                                  v
                                      +-----------------------+
                                      |   Nginx Reverse Proxy |
                                      |     (Port 80 / 443)   |
                                      +---+---------------+---+
                                          |               |
                         +----------------+               +----------------+
                         | (payarmove.com)                                 | (api.payarmove.com)
                         v                                                 v
           +---------------------------+                     +---------------------------+
           |   Built Frontend SPA      |                     |   Django 5 Gunicorn API   |
           |    (/var/www/frontend)    |                     |        (Port 8000)        |
           +---------------------------+                     +-------------+-------------+
                                                                           |
                                                      +--------------------+--------------------+
                                                      |                                         |
                                                      v                                         v
                                        +---------------------------+             +---------------------------+
                                        |       PostgreSQL 16       |             |          Redis 7          |
                                        |  Users, KYC, Rentals, DB  |             | Celery Broker & Sessions  |
                                        +---------------------------+             +-------------+-------------+
                                                                                                |
                                                                                  +-------------+-------------+
                                                                                  |                           |
                                                                                  v                           v
                                                                      +--------------------+     +--------------------+
                                                                      |   Celery Worker    |     |  Soroban Indexer   |
                                                                      | (Horizon / Tasks)  |     | (Event Streaming)  |
                                                                      +---------+----------+     +---------+----------+
                                                                                |                          |
                                                                                +------------+-------------+
                                                                                             |
                                                                                             v
                                                                              +------------------------------+
                                                                              |  Stellar Testnet / Soroban   |
                                                                              |  - Escrow Smart Contract     |
                                                                              |  - Circle USDC (SAC)         |
                                                                              +------------------------------+
```

---

## 🚀 Production Deployment on VPS

Follow these instructions to deploy the frontend at **`payarmove.com`** and backend API at **`api.payarmove.com`** on your production VPS.

### 1. DNS Records Setup
In your domain registrar / DNS provider (Cloudflare, Namecheap, GoDaddy, etc.), create the following **A Records**:

| Type | Name / Host | Target IPv4 | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (`payarmove.com`) | `<YOUR_VPS_IP>` | Auto / 300 | DNS Only (or Proxied) |
| **A** | `www` (`www.payarmove.com`) | `<YOUR_VPS_IP>` | Auto / 300 | DNS Only (or Proxied) |
| **A** | `api` (`api.payarmove.com`) | `<YOUR_VPS_IP>` | Auto / 300 | DNS Only (or Proxied) |

---

### 2. VPS Firewall & Port Configuration
SSH into your VPS server:
```bash
ssh <USER>@<YOUR_VPS_IP>
```

Configure **UFW (Uncomplicated Firewall)** to allow SSH, HTTP, and HTTPS:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Nginx'
sudo ufw allow 443/tcp comment 'HTTPS Nginx'
sudo ufw --force enable
sudo ufw status verbose
```

---

### 3. Clone Repository & Setup Environment Variables
Clone the repository:
```bash
git clone https://github.com/Lucifer-010/PayarMove.git /home/payarmove
cd /home/payarmove
```

Copy the example environment files:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Edit `.env` and fill in your actual production values and secret credentials:
```ini
# Django Core Settings
DJANGO_SECRET_KEY=<YOUR_DJANGO_SECRET_KEY>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.payarmove.com,payarmove.com,www.payarmove.com,<YOUR_VPS_IP>,localhost,127.0.0.1,web

# Security & CORS Origins
CORS_ALLOWED_ORIGINS=https://payarmove.com,https://www.payarmove.com,https://api.payarmove.com,http://<YOUR_VPS_IP>,http://localhost:5173
DJANGO_CSRF_TRUSTED_ORIGINS=https://payarmove.com,https://www.payarmove.com,https://api.payarmove.com,http://<YOUR_VPS_IP>,http://localhost:5173

# Application Routing
FRONTEND_URL=https://payarmove.com
BACKEND_URL=https://api.payarmove.com
VPS_IP=<YOUR_VPS_IP>
VITE_API_BASE_URL=https://api.payarmove.com/api/v1

# Database Configuration
POSTGRES_DB=payarmove_db
POSTGRES_USER=payarmove_user
POSTGRES_PASSWORD=<YOUR_DATABASE_PASSWORD>
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis & Celery
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1

# Stellar & Soroban Credentials
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
STELLAR_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
STELLAR_USDC_CODE=USDC
SOROBAN_ESCROW_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Platform Treasury Keypair
STELLAR_SERVER_PUBLIC_KEY=<YOUR_STELLAR_TREASURY_PUBLIC_KEY>
STELLAR_SERVER_SECRET_KEY=<YOUR_STELLAR_TREASURY_SECRET_KEY>
```

---

### 4. Provision SSL Certificates (Let's Encrypt / Certbot)
Install Certbot:
```bash
sudo apt-get update && sudo apt-get install -y certbot
```

Obtain SSL certificates for both domains:
```bash
# Frontend Certificates (Root & WWW)
sudo certbot certonly --standalone --agree-tos --no-eff-email \
  -m <YOUR_ADMIN_EMAIL> -d payarmove.com -d www.payarmove.com

# Backend API Certificate
sudo certbot certonly --standalone --agree-tos --no-eff-email \
  -m <YOUR_ADMIN_EMAIL> -d api.payarmove.com
```

The certificates will be saved under:
- `/etc/letsencrypt/live/payarmove.com/fullchain.pem`
- `/etc/letsencrypt/live/api.payarmove.com/fullchain.pem`

---

### 5. Launch Production Services with Docker Compose
Run the production multi-container suite:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Check the status of running containers:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

### 6. Create Superuser for Platform Administration
Create an initial administrator account to log in to the Admin Portal:
```bash
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```
Follow the interactive prompts:
- **Email**: `<YOUR_ADMIN_EMAIL>`
- **Username**: `<YOUR_ADMIN_USERNAME>`
- **Password**: `<YOUR_SECURE_PASSWORD>`

You can now sign in at **[https://payarmove.com/?view=admin-signin](https://payarmove.com/?view=admin-signin)** or the Django Admin at **[https://api.payarmove.com/admin/](https://api.payarmove.com/admin/)**.

---

### 7. Automated One-Command VPS Setup (Alternative)
For rapid automated provisioning, execute the bundled VPS deployment script:
```bash
bash deploy/setup_vps.sh
```

---

## 💻 Local Development Guide

### Option 1: Running with Docker Compose (Local)

1. **Launch all local containers**:
   ```bash
   docker compose up --build -d
   ```

2. **Access local services**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API & Swagger**: [http://localhost:8000/api/v1/docs/](http://localhost:8000/api/v1/docs/)
   - **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

### Option 2: Running Locally with Python Virtual Environment

1. **Backend setup**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔐 API Reference Overview

Full interactive endpoint documentation is provided in [**`API_DOCS.md`**](./API_DOCS.md).

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/signup/` | Register Email, Password & Role (`RENTER`/`HOST`) |
| **Auth** | `POST` | `/api/v1/auth/signin/` | Authenticate credentials $\rightarrow$ JWT Tokens |
| **Auth** | `POST` | `/api/v1/auth/wallet/challenge/` | Request SEP-0010 Challenge XDR for Freighter |
| **Auth** | `POST` | `/api/v1/auth/wallet/verify/` | Submit signed XDR $\rightarrow$ Verified wallet & JWT Tokens |
| **Auth** | `GET` | `/api/v1/auth/me/` | Current user profile and linked wallets |
| **KYC** | `POST` | `/api/v1/kyc/submit/` | Submit ID / Driver's license documentation |
| **KYC** | `GET` | `/api/v1/kyc/status/` | Query KYC verification status and tier level |
| **KYC** | `POST` | `/api/v1/kyc/admin/applications/{id}/review/` | Admin approves or rejects KYC record |
| **Rentals** | `GET` | `/api/v1/rentals/vehicles/` | Browse available mobility vehicles |
| **Rentals** | `POST` | `/api/v1/rentals/vehicles/` | Host lists vehicle for rental |
| **Rentals** | `POST` | `/api/v1/rentals/rentals/` | Create rental booking with custom duration hours |
| **Escrow** | `POST` | `/api/v1/escrow/prepare/{rental_id}/` | Generate Soroban invocation parameters & XDR |
| **Escrow** | `GET` | `/api/v1/escrow/{rental_id}/` | Check on-chain escrow state & balances |
| **Escrow** | `POST` | `/api/v1/escrow/{rental_id}/submit-deposit/` | Submit Freighter on-chain deposit tx hash |
| **Escrow** | `POST` | `/api/v1/escrow/{rental_id}/settle/` | Complete rental $\rightarrow$ 90% Host / 10% Platform / 100% Deposit refund |
| **Payouts**| `GET` | `/api/v1/payouts/` | Host payout ledger & earnings breakdown |
| **Dashboard**| `GET` | `/api/v1/dashboard/admin/summary/` | Admin volume, confirmed, pending, host payouts |
| **Dashboard**| `GET` | `/api/v1/dashboard/host/summary/` | Host earnings and rental booking counts |

---

## 📦 Soroban Escrow Smart Contract

The smart contract code resides in `contracts/payarmove_escrow/`.

### Building and Testing the Contract:
```bash
cd contracts/payarmove_escrow
cargo test
cargo build --target wasm32-unknown-unknown --release
```

### Deployed Testnet Contract Address:
- **Contract ID**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Network**: Stellar Testnet (`https://horizon-testnet.stellar.org` & `https://soroban-testnet.stellar.org`)
- **Stellar Expert Explorer**: [https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

---

## 🛡️ License & Security
Copyright &copy; 2026 PayarMove. All rights reserved.

To report security vulnerabilities or sensitive issues, please contact the security team directly at `<SECURITY_CONTACT_EMAIL>`.
