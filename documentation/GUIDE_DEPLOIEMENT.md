# 🏈 Seahawks Monitoring System - Guide de Déploiement

**Version:** 1.0.0  
**Date:** 26 janvier 2026  
**Classification:** Interne

Bienvenue dans le guide qui va transformer votre infrastructure en machine bien huilée ! On va déployer le système de monitoring sur 32 franchises. Ça paraît beaucoup, mais avec ce guide, ça va rouler ! 🚀

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

### 1.1 L'objectif du jour

Aujourd'hui, on va installer le Seahawks Monitoring System qui va superviser les 32 franchises NFL. Imaginez : plus besoin de courir d'un site à l'autre pour diagnostiquer un problème réseau ! 🎯

### 1.2 Architecture (vue d'ensemble)

Pensez à notre système comme une équipe de football :

- **Le Nester** — C'est l'entraîneur au datacenter de Roubaix qui voit tout
- **Les Harvesters** — Ce sont les 32 joueurs sur le terrain, un par franchise

### 1.3 Planning réaliste (pas de panique !)

| Phase | Durée | Description | Difficulté |
|-------|-------|-------------|------------|
| Préparation | 1 jour | Installation infrastructure | ⭐⭐ |
| Déploiement Nester | 2 heures | Datacenter central | ⭐⭐⭐ |
| Déploiement Harvester | 30 min/franchise | Déploiement sur site | ⭐⭐ |
| Tests | 1 jour | Validation complète | ⭐⭐ |

💡 **Conseil** : Commencez par une seule franchise en test avant de tout déployer. Rome ne s'est pas faite en un jour !

---

## 2. Prérequis

### 2.1 Ce qu'il vous faut au datacenter (pour le Nester)

**La machine (serveur ou VM) :**

- **CPU** : 4 cores minimum (plus c'est mieux !)
- **RAM** : 8 GB minimum (16 GB si vous êtes prévoyant)
- **Disque** : 100 GB SSD (parce que la vitesse, ça compte)
- **OS** : Ubuntu Server 22.04 LTS ou Debian 11
- **Réseau** : 1 Gbps (on n'est pas là pour attendre)
- **IP publique fixe** : Pour que les franchises puissent vous trouver

**Les logiciels à installer :** (suivez les commandes, c'est facile)

```bash
# D'abord, on met tout à jour (toujours une bonne idée)
sudo apt-get update && sudo apt-get upgrade -y

# Docker - Notre meilleur ami pour les conteneurs
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose - Pour orchestrer tout ça
sudo apt-get install docker-compose-plugin

# Nginx - Le gardien de la porte (reverse proxy)
sudo apt-get install nginx

# Quelques utilitaires qui sauveront votre vie
sudo apt-get install git curl wget jq
```

☕ **Pause café** : Pendant que ça installe, c'est le moment parfait !

### 2.2 Ce qu'il vous faut sur chaque franchise (pour les Harvesters)

**Par franchise (à multiplier par 32, mais c'est scriptable !) :**

- **CPU** : 2 cores minimum
- **RAM** : 2 GB minimum (c'est léger, ça passe partout)
- **Disque** : 20 GB (on n'est pas gourmand)
- **OS** : Ubuntu Server 22.04 LTS, Debian 11 ou CentOS 8
- **Accès réseau** : Local + Internet (pour parler au patron)

**Installation des logiciels :**

```bash
# Python 3.11+ - Le langage de nos petits Harvesters
sudo apt-get install python3 python3-pip python3-venv

# nmap - L'outil magique pour scanner les réseaux
sudo apt-get install nmap

# Git - Pour récupérer notre code
sudo apt-get install git
```

🎯 **Astuce de pro** : Créez un script d'installation et exécutez-le sur toutes les franchises. Vous gagnerez des heures !

---

## 3. Déploiement du Nester (le cerveau central)

### 3.1 Préparation du serveur (on fait les choses bien)

On va créer un utilisateur dédié, parce que faire tourner les services en root, c'est mal !

```bash
# Créer l'utilisateur "nester"
sudo useradd -m -s /bin/bash nester
sudo usermod -aG docker nester  # On lui donne accès à Docker

# Créer son petit chez-soi
sudo mkdir -p /opt/seahawks-monitoring
sudo chown nester:nester /opt/seahawks-monitoring
```

✅ **Pourquoi faire ça ?** Sécurité et organisation ! Chaque service a son propre utilisateur.

### 3.2 Installation du code (on récupère tout)

Maintenant qu'on a préparé le terrain, récupérons le code :

```bash
# On se connecte en tant que l'utilisateur nester
sudo su - nester

# Direction notre répertoire de travail
cd /opt/seahawks-monitoring

# On clone notre magnifique code
git clone https://github.com/seahawks/monitoring.git
cd monitoring/seahawks-nester
```

🎉 **C'est fait !** Le code est là, prêt à être configuré.

### 3.3 Configuration (la partie importante)

On va créer notre fichier de configuration secret. Attention, c'est sensible !

```bash
# Ouvrir l'éditeur (ou utilisez vim si vous êtes un guerrier)
nano .env
```

**Copiez-collez ce contenu dans le fichier .env :**

```bash
# Clé secrète Flask (ATTENTION : changez-la !)
SECRET_KEY=votre-cle-tres-longue-et-aleatoire-minimum-32-caracteres

# Mode production (pas de blagues ici)
FLASK_ENV=production

# Base de données (pour plus tard si vous évoluez)
# DATABASE_URL=postgresql://user:password@localhost/nester
```

🔐 **IMPORTANT** : Générez une vraie clé aléatoire ! Voici comment :

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copiez le résultat dans votre fichier .env à la place de "votre-cle-tres-longue...". Cette clé, c'est comme la clé de votre maison : on ne la partage pas !

### 3.4 Démarrage (le moment de vérité)

Allez, on lance tout ça !

```bash
# Construire et démarrer les conteneurs
docker-compose up -d

# Suivre ce qui se passe en direct
docker-compose logs -f

# Vérifier que tout tourne bien
docker-compose ps
```

✅ **Bon signe** : Vous devriez voir "Up" et "healthy" dans la colonne State. Si c'est le cas, félicitations ! 🎊

❌ **Problème ?** Regardez les logs avec `docker-compose logs`. 90% du temps, la réponse est là !

### 3.5 Configuration Nginx (la touche professionnelle)

On va maintenant mettre Nginx devant pour gérer le HTTPS et la sécurité :

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/seahawks-nester
```

**Voici la configuration complète** (copiez-collez, j'ai tout préparé) :

```nginx
# Redirection HTTP → HTTPS (on force le chiffrement)
server {
    listen 80;
    server_name nester.seahawks-monitoring.com;
    # On redirige tout vers HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS sécurisée
server {
    listen 443 ssl http2;
    server_name nester.seahawks-monitoring.com;

    # Certificats SSL (utilisez Let's Encrypt, c'est gratuit !)
    ssl_certificate /etc/letsencrypt/live/nester.seahawks-monitoring.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nester.seahawks-monitoring.com/privkey.pem;
    
    # Paramètres SSL modernes (exit TLS 1.0 et 1.1)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # En-têtes de sécurité (ça fait plaisir aux audits sécu)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Logs (pour suivre qui va où)
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
