# Seahawks Monitoring System

Solution de supervision réseau distribuée pour la gestion centralisée de 32 franchises.

---

## Vue d'ensemble

Architecture client-serveur composée de deux modules :

- **Harvester** — agent déployé sur site, effectue les scans réseau et remonte les données
- **Nester** — serveur central, agrège les rapports et expose un dashboard temps réel

### Fonctionnalités principales

- Scan réseau automatisé (nmap) avec détection d'hôtes, ports et OS
- Mesure de latence WAN
- Dashboard web temps réel (refresh 30s)
- Mode autonome (fonctionne sans connexion au Nester)
- Logs structurés JSON
- Secrets chiffrés (Fernet), exécution sans privilèges root

---

## Architecture

```
┌─────────────────────────────┐
│     Nester (Port 8000)      │
│  Flask · API REST · Dashboard│
└──────────────┬──────────────┘
               │ WAN
    ┌──────────┼──────────┐
    ▼          ▼          ▼
Franchise 01  02  ...  Franchise 32
 Harvester   Harvester   Harvester
```

---

## Structure

```
MSPR/
├── seahawks-harvester/
│   ├── harvester.py
│   ├── dashboard.py
│   ├── nester_integration.py
│   ├── secrets_manager.py
│   └── Dockerfile
└── seahawks-nester/
    ├── nester.py
    ├── docker-compose.yml
    └── Dockerfile
```

---

## Démarrage rapide

**Harvester**

```bash
pip install -r requirements.txt && sudo apt-get install nmap
python harvester.py
```

**Nester**

```bash
# Configurer .env (SECRET_KEY)
docker-compose up -d
# Dashboard : http://localhost:8000
```

---

## Sécurité

- Conteneurs non-root (UID 1000)
- Capacités Linux minimales (`CAP_NET_RAW` uniquement)
- Secrets chiffrés via `secrets_manager.py`
- Variables d'environnement pour les credentials

---

## API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/status` | Statut général |
| GET | `/api/probes` | Liste des sondes |
| GET | `/api/probe/{id}/report` | Dernier rapport |
| POST | `/api/probe/register` | Enregistrer une sonde |
| POST | `/api/probe/{id}/heartbeat` | Heartbeat |
| POST | `/api/probe/{id}/report` | Upload rapport |

---

## Performances

- Scan /24 en moins de 2 minutes
- Supporte 32 agents simultanément
- Latence API inférieure à 100ms
