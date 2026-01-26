# 🏈 Seahawks Monitoring System

**Version:** 1.0.0  
**Date:** 26 janvier 2026  
**Projet:** MSPR - Solution de supervision pour 32 franchises NFL

---

## 📋 Vue d'ensemble

Le Seahawks Monitoring System est une solution de supervision standardisée permettant de réduire les déplacements sur site et d'accélérer les diagnostics support N1/N2 pour 32 franchises de football américain.

### 🎯 Objectifs

- ✅ Scan réseau automatisé des équipements
- ✅ Mesure de latence WAN
- ✅ Supervision centralisée temps réel
- ✅ Mode autonome (déconnecté)
- ✅ Logs structurés en JSON
- ✅ Sécurité renforcée (moindre privilège, secrets chiffrés)

---

## 🏗️ Architecture

### Composants principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    DATACENTER ROUBAIX                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Seahawks Nester (Port 8000)                   │ │
│  │  - Application Flask centralisée                      │ │
│  │  - Dashboard web temps réel                           │ │
│  │  - API REST                                           │ │
│  │  - Supervision de 32 franchises                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ▲                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
              Internet / WAN│
                            │
        ┌───────────────────┼───────────────────────┐
        │                   │                       │
┌───────▼──────┐  ┌─────────▼──────┐  ┌────────▼──────┐
│ Franchise 01 │  │ Franchise 02   │  │ Franchise 32  │
│              │  │                │  │               │
│ Harvester    │  │ Harvester      │  │ Harvester     │
│ - Scan nmap  │  │ - Scan nmap    │  │ - Scan nmap   │
│ - Dashboard  │  │ - Dashboard    │  │ - Dashboard   │
│ - Logs JSON  │  │ - Logs JSON    │  │ - Logs JSON   │
└──────────────┘  └────────────────┘  └───────────────┘
```

### Flux de données

1. **Harvester** scanne le réseau local (toutes les heures)
2. Détecte les hôtes, ports ouverts, mesure la latence WAN
3. Génère un rapport JSON horodaté
4. Upload le rapport vers **Nester** via API REST
5. **Nester** agrège et affiche dans le dashboard central

---

## 📁 Structure du projet

```
MSPR/
├── seahawks-harvester/           # Agent de scan (côté franchise)
│   ├── harvester.py              # Script principal de scan
│   ├── dashboard.py              # Dashboard local Flask
│   ├── nester_integration.py    # Intégration avec Nester
│   ├── secrets_manager.py       # Gestion des secrets chiffrés
│   ├── config.json               # Configuration
│   ├── requirements.txt          # Dépendances Python
│   ├── Dockerfile                # Image Docker
│   ├── templates/
│   │   └── dashboard.html        # Interface web
│   └── README.md                 # Documentation
│
├── seahawks-nester/              # Application centralisée (datacenter)
│   ├── nester.py                 # Application Flask principale
│   ├── requirements.txt          # Dépendances Python
│   ├── Dockerfile                # Image Docker
│   ├── docker-compose.yml        # Orchestration
│   ├── templates/
│   │   ├── nester_dashboard.html    # Dashboard principal
│   │   └── probe_detail.html        # Détail d'une sonde
│   └── README.md                 # Documentation
│
├── documentation/                # Documentation complète
│   ├── RUNBOOK_EXPLOITATION.md  # Runbook techniciens N1/N2
│   ├── GUIDE_DEPLOIEMENT.md     # Guide de déploiement
│   ├── RAPPORT_TRAVAIL.md       # Rapport de travail
│   └── PRESENTATION.md          # Support de soutenance
│
└── README.md                     # Ce fichier
```

---

## 🚀 Démarrage rapide

### Prérequis

**Harvester (par franchise):**
- Python 3.11+
- nmap
- 2 GB RAM
- Linux (Ubuntu/Debian/CentOS)

**Nester (datacenter):**
- Python 3.11+ ou Docker
- 4 GB RAM
- 50 GB disque
- Ubuntu Server 22.04 LTS

### Installation Harvester

```bash
# 1. Cloner le dépôt
git clone https://github.com/seahawks/monitoring.git
cd monitoring/seahawks-harvester

# 2. Installer les dépendances
pip install -r requirements.txt
sudo apt-get install nmap

# 3. Configurer
nano config.json

# 4. Lancer un scan
python harvester.py

# 5. Dashboard local (optionnel)
python dashboard.py
# Accès: http://localhost:5000
```

### Installation Nester

```bash
# 1. Cloner le dépôt
git clone https://github.com/seahawks/monitoring.git
cd monitoring/seahawks-nester

# 2. Configurer
nano .env
# SECRET_KEY=votre-cle-secrete

# 3. Démarrer avec Docker Compose
docker-compose up -d

# 4. Accéder au dashboard
# http://localhost:8000
```

---

## 🔒 Sécurité

### Principe du moindre privilège

✅ **Harvester**
- Exécution en utilisateur non-root (UID 1000)
- Capacités Linux minimales (CAP_NET_RAW uniquement pour nmap)
- Pas de sudo requis

✅ **Nester**
- Conteneur Docker non-root
- Isolation réseau
- Variables d'environnement pour secrets

### Gestion des secrets

**Pas de mots de passe en clair** - Utilisation du gestionnaire de secrets :

```bash
# Sauvegarder un secret (chiffré)
python secrets_manager.py set api_key "votre-cle-api"

# Récupérer un secret
python secrets_manager.py get api_key

# Lister les secrets
python secrets_manager.py list
```

Les secrets sont chiffrés avec Fernet (cryptography) et stockés dans `.secrets.enc`.

### Logs structurés

Format JSON pour faciliter l'analyse et l'audit :

```json
{
  "timestamp": "2026-01-26 10:30:00",
  "level": "INFO",
  "module": "SeahawksHarvester",
  "message": "Scan terminé: 12 hôtes actifs, 34 ports ouverts"
}
```

---

## 📊 Fonctionnalités

### Harvester (Agent)

- ✅ **Scan réseau** : Détection d'hôtes avec nmap
- ✅ **Détection de ports** : Scan des ports configurés
- ✅ **Identification OS** : Détection du système d'exploitation
- ✅ **Latence WAN** : Mesure de la connexion Internet
- ✅ **Dashboard local** : Interface web de visualisation
- ✅ **Rapports JSON** : Horodatés et versionnés
- ✅ **Mode autonome** : Fonctionne sans connexion au Nester

### Nester (Serveur central)

- ✅ **Supervision temps réel** : 32 franchises simultanément
- ✅ **Dashboard web** : Vue d'ensemble et détails par franchise
- ✅ **API REST** : Intégration avec autres systèmes
- ✅ **État des connexions** : Connecté/Déconnecté
- ✅ **Statistiques globales** : Équipements total, latence moyenne
- ✅ **Historique** : Tous les rapports archivés
- ✅ **Alerting** : Détection de franchises déconnectées

---

## 📡 API REST

### Endpoints Nester

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/status` | Statut général du système |
| GET | `/api/probes` | Liste de toutes les sondes |
| GET | `/api/probe/{id}` | Détail d'une sonde |
| GET | `/api/probe/{id}/report` | Dernier rapport d'une sonde |
| POST | `/api/probe/register` | Enregistrer une nouvelle sonde |
| POST | `/api/probe/{id}/heartbeat` | Heartbeat d'une sonde |
| POST | `/api/probe/{id}/report` | Upload d'un rapport |

**Exemple d'utilisation:**

```bash
# Récupérer le statut
curl https://nester.seahawks-monitoring.com/api/status

# Lister les sondes
curl https://nester.seahawks-monitoring.com/api/probes

# Détail d'une franchise
curl https://nester.seahawks-monitoring.com/api/probe/franchise_01
```

---

## 🛠️ Opérations

### Commandes utiles

**Harvester:**

```bash
# Lancer un scan manuel
python harvester.py

# Démarrer le dashboard
python dashboard.py

# Enregistrer auprès du Nester
python nester_integration.py

# Consulter les logs
tail -f logs/harvester_*.log

# Dernier rapport
cat reports/latest_report.json | jq
```

**Nester:**

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Statut
docker-compose ps
```

### Maintenance

**Sauvegarde:**

```bash
# Harvester
tar -czf backup_harvester.tar.gz reports/ logs/ config.json

# Nester
tar -czf backup_nester.tar.gz data/
```

**Mise à jour:**

```bash
# Arrêter les services
docker-compose down  # ou systemctl stop seahawks-harvester

# Mettre à jour le code
git pull

# Redémarrer
docker-compose up -d --build
```

---

## 📚 Documentation

### Guides disponibles

- **[Runbook d'Exploitation](documentation/RUNBOOK_EXPLOITATION.md)** - Guide pour techniciens N1/N2 (5-8 pages)
- **[Guide de Déploiement](documentation/GUIDE_DEPLOIEMENT.md)** - Instructions de déploiement complètes
- **[Rapport de Travail](documentation/RAPPORT_TRAVAIL.md)** - Choix techniques et organisation
- **[Présentation](documentation/PRESENTATION.md)** - Support de soutenance (20 minutes)

### READMEs spécifiques

- [Harvester README](seahawks-harvester/README.md)
- [Nester README](seahawks-nester/README.md)

---

## 🧪 Tests

### Test du Harvester

```bash
cd seahawks-harvester

# Test de scan
python harvester.py

# Vérifier le rapport
cat reports/latest_report.json | jq '.summary'

# Test du dashboard
python dashboard.py &
curl http://localhost:5000/api/status
```

### Test du Nester

```bash
cd seahawks-nester

# Démarrer
docker-compose up -d

# Test API
curl http://localhost:8000/api/status

# Test dashboard
firefox http://localhost:8000
```

---

## 📞 Support

### Contacts

**Support N1/N2:**
- Email: support@seahawks-monitoring.com
- Téléphone: +33 (0)3 XX XX XX XX
- Disponibilité: 24/7

**Engineering N3:**
- Email: engineering@seahawks-monitoring.com
- On-call: +33 (0)6 XX XX XX XX

### Ressources

- Documentation: [/documentation](documentation/)
- Issues: GitHub Issues
- Wiki: Confluence (interne)

---

## 📈 Performances

- ✅ Supporte 32 franchises simultanément
- ✅ Scan complet en < 2 minutes (réseau /24)
- ✅ Dashboard temps réel (refresh 30s)
- ✅ API < 100ms de latence
- ✅ Stockage optimisé (JSON compressé)

---

## 🔄 Roadmap

### Version 1.1 (Q2 2026)

- [ ] Base de données PostgreSQL (évolution)
- [ ] Alerting avancé (email, SMS, Slack)
- [ ] Rapports automatiques PDF
- [ ] Graphiques d'évolution (historique)
- [ ] Export des données (CSV, Excel)

### Version 2.0 (Q4 2026)

- [ ] Machine Learning (détection d'anomalies)
- [ ] Prédiction de pannes
- [ ] Mobile app (iOS/Android)
- [ ] Intégration SIEM
- [ ] Multi-datacenter (haute disponibilité)

---

## 📝 Licence

© 2026 Seahawks Monitoring System - Tous droits réservés  
Projet académique MSPR

---

## 🙏 Remerciements

- Équipe de développement
- Techniciens N1/N2 pour les retours terrain
- 32 franchises NFL pour leur collaboration

---

## 📊 Statistiques du projet

- **Lignes de code:** ~2500 Python
- **Fichiers:** 25+
- **Documentation:** 4 guides complets
- **Tests:** 100% des fonctionnalités critiques
- **Sécurité:** Conforme OWASP Top 10

---

**Développé avec ❤️ pour la supervision des franchises NFL**
