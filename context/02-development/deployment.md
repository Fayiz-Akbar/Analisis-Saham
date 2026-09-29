# Panduan Deployment: AI-Powered Fundamental Investment Analyzer

Dokumen ini khusus mengatur prosedur membawa aplikasi ke lingkungan staging atau production (VPS / Cloud Server). Untuk panduan menjalankan aplikasi di lingkungan lokal, lihat `04-setup/local-development.md`.

---

## 1. Environment Specifications

### Production Server Specs (Rekomendasi)
- **OS**: Ubuntu Server 24.04 LTS (64-bit)
- **CPU**: 2 vCPU
- **RAM**: 4 GB RAM (minimal 2 GB)
- **Storage**: 40 GB SSD / NVMe
- **Runtimes**: Node.js v20+ LTS, PostgreSQL 17, Docker Compose v2, Nginx, Certbot

---

## 2. Build Pipeline

### 2.1 Frontend Build
Frontend React dikompilasi menjadi bundel aset statis HTML, CSS, dan JavaScript menggunakan Vite:
```sh
cd frontend
npm ci
npm run build
```
Hasil build akan berada di direktori `frontend/dist/`.

### 2.2 Backend Preparation
Backend Node.js dipersiapkan dengan menginstal production dependencies dan menghasilkan Prisma client:
```sh
cd backend
npm ci --only=production
npx prisma generate
```

---

## 3. Production Docker Compose (`compose.prod.yaml`)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: analisis_saham_db_prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    networks:
      - internal_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: analisis_saham_api_prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      MARKET_DATA_API_KEY: ${MARKET_DATA_API_KEY}
      NEWS_API_KEY: ${NEWS_API_KEY}
    networks:
      - internal_network
      - web_network
    ports:
      - "127.0.0.1:5000:5000"

volumes:
  pgdata_prod:

networks:
  internal_network:
    internal: true
  web_network:
```

---

## 4. VPS & Nginx Configuration

Nginx berfungsi sebagai Reverse Proxy untuk API backend dan Web Server untuk menyajikan file statis React frontend.

### Konfigurasi Nginx (`/etc/nginx/sites-available/analisis-saham.conf`):
```nginx
server {
    listen 80;
    server_name saham.yourdomain.com;

    # Redirect seluruh trafik HTTP ke HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saham.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/saham.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saham.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Root direktori statis build React
    root /var/www/analisis-saham/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Route Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy API Gateway ke Express Backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout handling untuk request AI Gemini yang membutuhkan waktu sintesis
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

---

## 5. SSL / TLS Setup

Sertifikat SSL gratis dan otomatis menggunakan Let's Encrypt Certbot:
```sh
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d saham.yourdomain.com
```
Perpanjangan sertifikat otomatis (*auto-renewal*) diverifikasi dengan:
```sh
sudo certbot renew --dry-run
```

---

## 6. CI/CD Pipeline (GitHub Actions)

Alur otomatisasi deployment saat push ke branch `main`:
1. **Lint & Test**: Menjalankan pengujian unit backend dan frontend.
2. **Build**: Melakukan build frontend dan verifikasi migrasi Prisma.
3. **Deploy via SSH**:
   - Pull kode terbaru di VPS.
   - Install dependencies & generate Prisma client.
   - Jalankan migrasi: `npx prisma migrate deploy`.
   - Build frontend ke `/var/www/analisis-saham/frontend/dist`.
   - Reload process PM2 atau restart container Docker backend.

---

## 7. Monitoring & Health Check

- Endpoint Health Check: `GET https://saham.yourdomain.com/api/health`
  - Memverifikasi kesiapan koneksi database PostgreSQL dan respon backend.
- Monitoring Process: PM2 dashboard (`pm2 status`, `pm2 logs`) atau `docker compose logs -f`.
- Server Resources: Htop atau monitoring alert dari VPS provider.

---

## 8. Backup Strategy

### Automated PostgreSQL Backup (Cron Job)
Skrip backup harian dijalankan setiap pukul 02:00 WIB:
```sh
#!/bin/bash
BACKUP_DIR="/var/backups/analisis_saham_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

docker exec -t analisis_saham_db_prod pg_dump -U postgres analisis_saham_db | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Hapus backup yang lebih lama dari 14 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```

---

## 9. Disaster Recovery

Prosedur pemulihan saat server mengalami crash:
1. Siapkan instance server baru dengan runtime Docker & Docker Compose.
2. Clone repository dan konfigurasi file `.env` production.
3. Jalankan container database kosong: `docker compose -f compose.prod.yaml up -d postgres`.
4. Restore data dari file backup terakhir:
   ```sh
   gunzip < db_backup_latest.sql.gz | docker exec -i analisis_saham_db_prod psql -U postgres -d analisis_saham_db
   ```
5. Jalankan backend dan perbarui sertifikat SSL domain.
