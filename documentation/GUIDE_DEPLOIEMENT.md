# 🏈 Seahawks Monitoring System - Guide de Déploiement

**Version:** 1.0.0  
**Date:** 26 janvier 2026  
**Classification:** Interne

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Prérequis](#2-prérequis)
3. [Déploiement du Nester](#3-déploiement-du-nester)
4. [Déploiement du Harvester](#4-déploiement-du-harvester)
5. [Configuration réseau](#5-configuration-réseau)
6. [Tests de validation](#6-tests-de-validation)
7. [Production readiness](#7-production-readiness)

---

## 1. Introduction

### 1.1 Objectif

Ce guide décrit le déploiement complet du Seahawks Monitoring System pour superviser 32 franchises NFL.

### 1.2 Architecture

- **Seahawks Nester** : Application centralisée (Datacenter Roubaix)
- **Seahawks Harvester** : 32 agents déployés sur les franchises

### 1.3 Timeline de déploiement

| Phase | Durée | Description |
|-------|-------|-------------|
| Préparation | 1 jour | Installation infrastructure |
| Déploiement Nester | 2 heures | Datacenter central |
| Déploiement Harvester | 30 min/franchise | Déploiement sur site |
| Tests | 1 jour | Validation complète |

---

## 2. Prérequis

### 2.1 Infrastructure datacenter (Nester)

**Serveur physique ou VM:**
- CPU : 4 cores minimum
- RAM : 8 GB minimum
- Disque : 100 GB SSD
- OS : Ubuntu Server 22.04 LTS ou Debian 11
- Réseau : 1 Gbps
- IP publique fixe

**Logiciels:**
```bash
# Mise à jour système
sudo apt-get update && sudo apt-get upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo apt-get install docker-compose-plugin

# Nginx
sudo apt-get install nginx

# Utilitaires
sudo apt-get install git curl wget jq
```

### 2.2 Infrastructure franchise (Harvester)

**Par franchise (x32):**
- CPU : 2 cores minimum
- RAM : 2 GB minimum
- Disque : 20 GB
- OS : Ubuntu Server 22.04 LTS, Debian 11 ou CentOS 8
- Accès réseau local + Internet

**Logiciels:**
```bash
# Python 3.11+
sudo apt-get install python3 python3-pip python3-venv

# nmap
sudo apt-get install nmap

# Git
sudo apt-get install git
```

---

## 3. Déploiement du Nester

### 3.1 Préparation du serveur

```bash
# Créer l'utilisateur dédié
sudo useradd -m -s /bin/bash nester
sudo usermod -aG docker nester

# Créer la structure
sudo mkdir -p /opt/seahawks-monitoring
sudo chown nester:nester /opt/seahawks-monitoring
```

### 3.2 Installation du code

```bash
# Se connecter en tant que nester
sudo su - nester

# Cloner le dépôt
cd /opt/seahawks-monitoring
git clone https://github.com/seahawks/monitoring.git
cd monitoring/seahawks-nester
```

### 3.3 Configuration

```bash
# Créer le fichier .env
nano .env
```

**Contenu du fichier .env:**

```bash
# Clé secrète Flask (générer une clé aléatoire)
SECRET_KEY=votre-cle-tres-longue-et-aleatoire-minimum-32-caracteres

# Environnement
FLASK_ENV=production

# Base de données (optionnel pour évolution future)
# DATABASE_URL=postgresql://user:password@localhost/nester
```

**Générer une clé secrète sécurisée:**

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 3.4 Démarrage

```bash
# Construire et démarrer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Vérifier le statut
docker-compose ps
```

### 3.5 Configuration Nginx (reverse proxy)

```bash
# Créer la configuration
sudo nano /etc/nginx/sites-available/seahawks-nester
```

**Configuration complète:**

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name nester.seahawks-monitoring.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name nester.seahawks-monitoring.com;

    # Certificats SSL (Let's Encrypt recommandé)
    ssl_certificate /etc/letsencrypt/live/nester.seahawks-monitoring.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nester.seahawks-monitoring.com/privkey.pem;
    
    # Paramètres SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Logs
    access_log /var/log/nginx/seahawks_access.log;
    error_log /var/log/nginx/seahawks_error.log;
    
    # Proxy vers le Nester
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API avec rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/seahawks-nester /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 3.6 Obtenir un certificat SSL

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d nester.seahawks-monitoring.com

# Renouvellement automatique (déjà configuré par Certbot)
sudo certbot renew --dry-run
```

### 3.7 Configuration du firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Vérifier
sudo ufw status
```

---

## 4. Déploiement du Harvester

### 4.1 Script de déploiement automatique

Créer un script pour faciliter le déploiement sur les 32 franchises.

**deploy_harvester.sh:**

```bash
#!/bin/bash

# Script de déploiement automatique du Harvester
# Usage: ./deploy_harvester.sh <franchise_id> <franchise_name> <network_range>

set -e

FRANCHISE_ID=$1
FRANCHISE_NAME=$2
NETWORK_RANGE=${3:-"192.168.1.0/24"}

if [ -z "$FRANCHISE_ID" ] || [ -z "$FRANCHISE_NAME" ]; then
    echo "Usage: $0 <franchise_id> <franchise_name> [network_range]"
    echo "Exemple: $0 franchise_01 'Seattle Seahawks' '192.168.1.0/24'"
    exit 1
fi

echo "================================================"
echo "Déploiement Seahawks Harvester"
echo "Franchise: $FRANCHISE_NAME ($FRANCHISE_ID)"
echo "================================================"

# 1. Mise à jour système
echo "[1/8] Mise à jour système..."
sudo apt-get update -qq

# 2. Installation des dépendances
echo "[2/8] Installation des dépendances..."
sudo apt-get install -y python3 python3-pip python3-venv nmap git

# 3. Création de l'utilisateur
echo "[3/8] Création de l'utilisateur..."
if ! id "harvester" &>/dev/null; then
    sudo useradd -m -s /bin/bash harvester
fi

# 4. Clonage du dépôt
echo "[4/8] Clonage du dépôt..."
sudo mkdir -p /opt/seahawks-monitoring
sudo chown harvester:harvester /opt/seahawks-monitoring
sudo -u harvester git clone https://github.com/seahawks/monitoring.git /opt/seahawks-monitoring || true
cd /opt/seahawks-monitoring/seahawks-harvester

# 5. Installation Python
echo "[5/8] Installation environnement Python..."
sudo -u harvester python3 -m venv venv
sudo -u harvester venv/bin/pip install -r requirements.txt

# 6. Configuration
echo "[6/8] Configuration de la franchise..."
sudo -u harvester cat > config.json <<EOF
{
  "franchise_id": "$FRANCHISE_ID",
  "franchise_name": "$FRANCHISE_NAME",
  "scan_network": "$NETWORK_RANGE",
  "scan_ports": "22,80,443,3389,8080",
  "wan_test_host": "8.8.8.8",
  "report_dir": "reports",
  "log_dir": "logs",
  "scan_interval": 3600,
  "nester_url": "https://nester.seahawks-monitoring.com"
}
EOF

# 7. Permissions nmap
echo "[7/8] Configuration des permissions nmap..."
sudo setcap cap_net_raw,cap_net_admin=eip $(which nmap)

# 8. Service systemd
echo "[8/8] Création du service systemd..."
sudo cat > /etc/systemd/system/seahawks-harvester.service <<EOF
[Unit]
Description=Seahawks Harvester - $FRANCHISE_NAME
After=network.target

[Service]
Type=simple
User=harvester
WorkingDirectory=/opt/seahawks-monitoring/seahawks-harvester
ExecStart=/opt/seahawks-monitoring/seahawks-harvester/venv/bin/python harvester.py
Restart=always
RestartSec=3600

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable seahawks-harvester
sudo systemctl start seahawks-harvester

echo ""
echo "✅ Déploiement terminé avec succès!"
echo ""
echo "Commandes utiles:"
echo "  - Statut : sudo systemctl status seahawks-harvester"
echo "  - Logs   : sudo journalctl -u seahawks-harvester -f"
echo "  - Scan   : cd /opt/seahawks-monitoring/seahawks-harvester && sudo -u harvester venv/bin/python harvester.py"
echo ""
```

### 4.2 Déploiement sur une franchise

**Méthode 1 : Exécution locale**

```bash
# 1. Copier le script sur le serveur
scp deploy_harvester.sh admin@franchise-01.seahawks.local:/tmp/

# 2. Se connecter
ssh admin@franchise-01.seahawks.local

# 3. Exécuter le script
sudo bash /tmp/deploy_harvester.sh franchise_01 "Seattle Seahawks" "192.168.1.0/24"
```

**Méthode 2 : Via Ansible (déploiement massif)**

```bash
# Installer Ansible
pip install ansible

# Créer l'inventaire
cat > inventory.ini <<EOF
[franchises]
franchise-01 ansible_host=192.168.1.100 franchise_id=franchise_01 franchise_name="Seattle Seahawks"
franchise-02 ansible_host=192.168.2.100 franchise_id=franchise_02 franchise_name="San Francisco 49ers"
# ... (répéter pour les 32 franchises)
EOF

# Créer le playbook
cat > deploy.yml <<EOF
---
- name: Déployer Seahawks Harvester
  hosts: franchises
  become: yes
  tasks:
    - name: Copier le script
      copy:
        src: deploy_harvester.sh
        dest: /tmp/deploy_harvester.sh
        mode: '0755'
    
    - name: Exécuter le déploiement
      shell: |
        /tmp/deploy_harvester.sh {{ franchise_id }} "{{ franchise_name }}"
EOF

# Déployer sur toutes les franchises
ansible-playbook -i inventory.ini deploy.yml
```

### 4.3 Enregistrement auprès du Nester

```bash
# Sur chaque franchise, après déploiement
cd /opt/seahawks-monitoring/seahawks-harvester
sudo -u harvester venv/bin/python nester_integration.py
```

---

## 5. Configuration réseau

### 5.1 Ports à ouvrir

**Nester (datacenter):**
- Port 80 (HTTP → HTTPS redirect)
- Port 443 (HTTPS)
- Port 22 (SSH admin)

**Harvester (franchises):**
- Sortant : Port 443 vers le Nester
- Local : Port 5000 (dashboard optionnel)

### 5.2 DNS

Configurer l'enregistrement DNS:

```
nester.seahawks-monitoring.com  A  <IP_PUBLIQUE_DATACENTER>
```

### 5.3 Règles firewall Nester

```bash
# Autoriser uniquement les IPs des franchises (optionnel)
sudo ufw allow from 192.168.0.0/16 to any port 8000
```

---

## 6. Tests de validation

### 6.1 Test du Nester

```bash
# Test API
curl https://nester.seahawks-monitoring.com/api/status

# Réponse attendue:
{
  "version": "1.0.0",
  "status": "online",
  "timestamp": "2026-01-26T10:30:00",
  "statistics": {...}
}

# Test dashboard
firefox https://nester.seahawks-monitoring.com
```

### 6.2 Test du Harvester

```bash
# Sur une franchise
cd /opt/seahawks-monitoring/seahawks-harvester

# Test scan local
sudo -u harvester venv/bin/python harvester.py

# Vérifier le rapport
cat reports/latest_report.json | jq

# Test intégration Nester
sudo -u harvester venv/bin/python nester_integration.py

# Vérifier dans le dashboard Nester
firefox https://nester.seahawks-monitoring.com
```

### 6.3 Tests end-to-end

**Checklist de validation:**

- [ ] Nester accessible via HTTPS
- [ ] Certificat SSL valide
- [ ] API répond correctement
- [ ] Dashboard s'affiche
- [ ] Harvester scanne le réseau
- [ ] Rapport généré en JSON
- [ ] Upload vers Nester réussi
- [ ] Franchise visible dans le dashboard
- [ ] Logs structurés générés
- [ ] Services redémarrent automatiquement

---

## 7. Production readiness

### 7.1 Monitoring

**Nagios/Zabbix:**

```bash
# Check API Nester
check_http -H nester.seahawks-monitoring.com -u /api/status -s '"status":"online"'

# Check service Harvester
check_systemd seahawks-harvester
```

### 7.2 Backups

```bash
# Script de backup automatique
cat > /opt/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backup/seahawks"
DATE=$(date +%Y%m%d)

# Backup Nester
tar -czf $BACKUP_DIR/nester_$DATE.tar.gz /opt/seahawks-monitoring/seahawks-nester/data

# Backup Harvester
tar -czf $BACKUP_DIR/harvester_$DATE.tar.gz /opt/seahawks-monitoring/seahawks-harvester/reports

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /opt/backup.sh

# Cron quotidien
echo "0 2 * * * /opt/backup.sh" | sudo crontab -
```

### 7.3 Alerting

**Configuration exemple (Prometheus + Alertmanager):**

```yaml
# alerting_rules.yml
groups:
  - name: seahawks
    rules:
      - alert: FranchiseDisconnected
        expr: franchise_status{status="disconnected"} == 1
        for: 10m
        annotations:
          summary: "Franchise {{ $labels.franchise_name }} déconnectée"
      
      - alert: HighWanLatency
        expr: wan_latency_ms > 100
        for: 5m
        annotations:
          summary: "Latence WAN élevée: {{ $value }}ms"
```

### 7.4 Documentation mise en production

- [x] Architecture documentée
- [x] Runbook d'exploitation
- [x] Guide de déploiement
- [x] Contacts support définis
- [x] Procédures de backup
- [x] Monitoring configuré
- [x] Alerting configuré

---

## Annexes

### A. Liste des 32 franchises

```
franchise_01  Seattle Seahawks
franchise_02  San Francisco 49ers
franchise_03  Los Angeles Rams
franchise_04  Arizona Cardinals
franchise_05  Dallas Cowboys
franchise_06  New York Giants
franchise_07  Philadelphia Eagles
franchise_08  Washington Commanders
franchise_09  Green Bay Packers
franchise_10  Minnesota Vikings
franchise_11  Chicago Bears
franchise_12  Detroit Lions
franchise_13  Tampa Bay Buccaneers
franchise_14  New Orleans Saints
franchise_15  Atlanta Falcons
franchise_16  Carolina Panthers
franchise_17  New England Patriots
franchise_18  Buffalo Bills
franchise_19  Miami Dolphins
franchise_20  New York Jets
franchise_21  Pittsburgh Steelers
franchise_22  Baltimore Ravens
franchise_23  Cleveland Browns
franchise_24  Cincinnati Bengals
franchise_25  Kansas City Chiefs
franchise_26  Las Vegas Raiders
franchise_27  Los Angeles Chargers
franchise_28  Denver Broncos
franchise_29  Indianapolis Colts
franchise_30  Tennessee Titans
franchise_31  Jacksonville Jaguars
franchise_32  Houston Texans
```

### B. Timeline détaillée

| Jour | Activité | Durée |
|------|----------|-------|
| J0 | Préparation infrastructure | 8h |
| J1 | Déploiement Nester | 4h |
| J2-J4 | Déploiement Harvester (batch 1-10) | 3j |
| J5-J7 | Déploiement Harvester (batch 11-22) | 3j |
| J8-J9 | Déploiement Harvester (batch 23-32) | 2j |
| J10 | Tests et validation | 8h |
| J11 | Mise en production | 4h |

---

**Document maintenu par:** Équipe Engineering  
**Dernière révision:** 26 janvier 2026  
**Version:** 1.0.0
