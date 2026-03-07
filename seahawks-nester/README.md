# Seahawks Nester �

Le poste de commandement central ! C'est ici que toute la magie opère : supervision de vos 32 franchises NFL depuis un seul et même endroit. Installé confortablement à Roubaix, le Nester est votre œil sur tout le réseau. Bienvenue au centre de contrôle ! 🎯

---

## 🎯 Ce qu'il fait pour vous

Le Nester, c'est votre tableau de bord ultime pour garder un œil sur tout :

- **Supervision centralisée** — Voit tout ce que vos Harvesters lui racontent
- **Statut en temps réel** — Connecté, déconnecté ? Vous le savez immédiatement
- **Rapports de scan** — Consultez les derniers scans de chaque franchise
- **Dashboard sublime** — Interface web moderne qui se rafraîchit toute seule
- **API REST complète** — Pour intégrer avec vos outils existants

💡 **En bref** : C'est le cerveau de votre infrastructure de monitoring !

---

## 📋 Ce qu'il vous faut

Pas grand-chose en fait :

- **Python 3.11+** — Le langage qu'on adore
- **Docker et Docker Compose** — Pour une installation propre en 2 minutes
- **Port 8000 libre** — Pour que les Harvesters puissent parler
- **Un bon café** ☕ — Parce qu'on est pas des machines

🖥️ **Machine recommandée** : 4 cores, 8 GB RAM, 100 GB disque (pour tenir longtemps)

---

## 🚀 Installation (3 façons de faire)

### Option 1 : Docker (le plus simple, recommandé)

```bash
# Lancer tout avec Docker Compose (c'est magique)
docker-compose up -d

# Suivre ce qui se passe
docker-compose logs -f

# Tout arrêter proprement
docker-compose down
```

🐳 **Temps d'installation** : Environ 2 minutes. De quoi finir votre café !

### Option 2 : Installation locale (pour le développement)

```bash
# Installer les bibliothèques Python
pip install -r requirements.txt

# Démarrer le serveur en mode dev
python nester.py
```

🔧 **Idéal pour** : Tester des modifications, développer de nouvelles features

### Option 3 : Avec Gunicorn (pour la production)

```bash
# Installer Gunicorn (serveur WSGI robuste)
pip install gunicorn

# Lancer avec 4 workers (ajustez selon vos cores)
gunicorn --bind 0.0.0.0:8000 --workers 4 nester:app
```

⚡ **Plus performant** : Gunicorn gère mieux la charge en production

---

## 🌐 Accéder à votre Nester

Une fois lancé, ouvrez votre navigateur :

- **Dashboard principal** : http://localhost:8000
- **API REST** : http://localhost:8000/api
- **Statut système** : http://localhost:8000/api/status

🎨 Le dashboard se rafraîchit automatiquement toutes les 30 secondes !

---

## 📡 API REST (pour les développeurs)

### Les endpoints que vous allez adorer

#### 1. Statut général ("Comment va l'empire ?")

```http
GET /api/status
```

**Ce que vous recevez** :
```json
{
  "version": "1.0.0",
  "status": "online",
  "timestamp": "2026-03-07T14:30:00",
  "statistics": {
    "total_probes": 32,
    "connected_probes": 28,          // 28 franchises en ligne
    "disconnected_probes": 4,         // 4 qui dorment
    "total_equipment": 384,           // Total d'équipements détectés
    "average_wan_latency": 12.45      // Latence moyenne en ms
  }
}
```

💡 **Utilisez ça pour** : Vérifier rapidement que tout va bien

#### 2. Liste complète des sondes ("Qui est là ?")

```http
GET /api/probes
```

**Réponse typique** :
```json
[
  {
    "franchise_id": "franchise_01",
    "franchise_name": "Seattle Seahawks",
    "status": "connected",                  // En ligne !
    "last_seen": "2026-03-07T14:25:00",
    "last_seen_ago_seconds": 300,           // Vu il y a 5 minutes
    "last_report": {
      "timestamp": "2026-01-26T10:20:00",
      "hosts_up": 12,
      "wan_latency_ms": 15.23
    }
  }
]
```

#### 3. Détail d'une sonde

```http
GET /api/probe/{franchise_id}
```

#### 4. Dernier rapport d'une sonde

```http
GET /api/probe/{franchise_id}/report
```

#### 5. Enregistrer une nouvelle sonde

```http
POST /api/probe/register
Content-Type: application/json

{
  "franchise_id": "franchise_01",
  "franchise_name": "Seattle Seahawks"
}
```

#### 6. Heartbeat d'une sonde

```http
POST /api/probe/{franchise_id}/heartbeat
```

#### 7. Upload d'un rapport

```http
POST /api/probe/{franchise_id}/report
Content-Type: application/json

{
  "scan_id": "scan_20260126_103000",
  "timestamp": "2026-01-26T10:30:00",
  "hosts": [...],
  "summary": {...}
}
```

## 📁 Structure des fichiers

```
seahawks-nester/
├── nester.py                   # Application principale
├── requirements.txt            # Dépendances Python
├── Dockerfile                  # Image Docker
├── docker-compose.yml          # Orchestration Docker
├── templates/
│   ├── nester_dashboard.html  # Dashboard principal
│   └── probe_detail.html      # Détail d'une sonde
└── data/                       # Données (généré)
    ├── probes/                 # Informations des sondes
    ├── reports/                # Rapports de scan
    └── logs/                   # Logs applicatifs
```

## 🔒 Sécurité

### Variables d'environnement

Créer un fichier `.env`:

```bash
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire
FLASK_ENV=production
```

### Principe du moindre privilège

- Exécution en utilisateur non-root (UID 1000)
- Pas de privilèges sudo requis
- Isolation des conteneurs Docker

### HTTPS en production

Utiliser un reverse proxy (Nginx) avec SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name nester.seahawks-monitoring.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring

### Healthcheck

L'application expose un healthcheck:

```bash
curl http://localhost:8000/api/status
```

### Logs

Les logs sont au format JSON structuré:

```json
{
  "timestamp": "2026-01-26 10:30:00",
  "level": "INFO",
  "module": "SeahawksNester",
  "message": "Sonde enregistrée: franchise_01"
}
```

Accès aux logs:

```bash
# Logs Docker
docker-compose logs -f nester

# Logs locaux
tail -f data/logs/nester_*.log
```

## 🔧 Configuration avancée

### Tuning Gunicorn

Éditer `gunicorn_config.py`:

```python
workers = 4                    # Nombre de workers
worker_class = "sync"          # Type de worker
timeout = 30                   # Timeout en secondes
keepalive = 2                  # Keep-alive
```

### Base de données (optionnel)

Pour une mise en production à grande échelle, migrer vers PostgreSQL:

```python
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/nester'
db = SQLAlchemy(app)
```

## 📞 Intégration Harvester → Nester

### Configuration du Harvester

Éditer `config.json` du Harvester:

```json
{
  "nester_url": "http://nester.seahawks-monitoring.com:8000",
  "nester_api_key": "votre-cle-api",
  "upload_enabled": true
}
```

### Script d'upload automatique

```python
import requests

def upload_report(franchise_id, report_data):
    url = f"http://nester.seahawks-monitoring.com:8000/api/probe/{franchise_id}/report"
    response = requests.post(url, json=report_data)
    return response.status_code == 201
```

## 🔄 Maintenance

### Sauvegarde des données

```bash
# Sauvegarder les données
tar -czf backup_$(date +%Y%m%d).tar.gz data/

# Restaurer
tar -xzf backup_20260126.tar.gz
```

### Mise à jour

```bash
# Arrêter le service
docker-compose down

# Mettre à jour le code
git pull

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📈 Performance

- Supporte jusqu'à 100 sondes simultanées
- Actualisation en temps réel (30s)
- Stockage optimisé (fichiers JSON)
- Scalabilité horizontale possible

## 📞 Support

Pour toute question ou problème:
- Email: support@seahawks-monitoring.com
- Documentation: voir `/documentation`

## 📝 Licence

© 2026 Seahawks Monitoring System - Tous droits réservés
