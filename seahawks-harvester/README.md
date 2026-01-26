# Seahawks Harvester 🏈

Agent de scan réseau pour les franchises de football américain. Permet la détection automatique d'équipements et la mesure de latence WAN.

## 🎯 Objectifs

- Scan réseau local automatisé
- Détection d'équipements et de ports ouverts
- Mesure de latence WAN
- Dashboard local de visualisation
- Logs structurés en JSON
- Mode autonome (déconnecté)

## 📋 Prérequis

- Python 3.11+
- nmap installé sur le système
- Privilèges réseau pour le scan (capacités CAP_NET_RAW)

## 🚀 Installation

### Installation locale

```bash
# Installer les dépendances
pip install -r requirements.txt

# Installer nmap (Linux)
sudo apt-get install nmap

# Installer nmap (Windows)
# Télécharger depuis https://nmap.org/download.html
```

### Installation via Docker

```bash
# Construire l'image
docker build -t seahawks-harvester:1.0.0 .

# Exécuter le conteneur
docker run -d \
  --name harvester \
  --network host \
  -v $(pwd)/reports:/app/reports \
  -v $(pwd)/logs:/app/logs \
  seahawks-harvester:1.0.0
```

## ⚙️ Configuration

Éditer le fichier `config.json`:

```json
{
  "franchise_id": "franchise_01",
  "franchise_name": "Seattle Seahawks",
  "scan_network": "192.168.1.0/24",
  "scan_ports": "22,80,443,3389,8080",
  "wan_test_host": "8.8.8.8",
  "report_dir": "reports",
  "log_dir": "logs",
  "scan_interval": 3600
}
```

### Paramètres de configuration

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `franchise_id` | Identifiant unique de la franchise | `franchise_01` |
| `franchise_name` | Nom de la franchise | `Seattle Seahawks` |
| `scan_network` | Réseau à scanner (CIDR) | `192.168.1.0/24` |
| `scan_ports` | Ports à scanner | `22,80,443,3389,8080` |
| `wan_test_host` | Hôte pour test latence WAN | `8.8.8.8` |
| `report_dir` | Répertoire des rapports | `reports` |
| `log_dir` | Répertoire des logs | `logs` |
| `scan_interval` | Intervalle entre scans (secondes) | `3600` |

## 📊 Utilisation

### Lancer un scan

```bash
python harvester.py
```

### Démarrer le dashboard

```bash
python dashboard.py
```

Accès au dashboard: http://localhost:5000

## 📁 Structure des fichiers

```
seahawks-harvester/
├── harvester.py          # Script principal de scan
├── dashboard.py          # Dashboard web Flask
├── config.json           # Configuration
├── requirements.txt      # Dépendances Python
├── Dockerfile            # Image Docker
├── templates/
│   └── dashboard.html    # Interface web
├── reports/              # Rapports de scan (JSON)
│   └── latest_report.json
└── logs/                 # Logs structurés
    └── harvester_YYYYMMDD.log
```

## 🔒 Sécurité

### Principe du moindre privilège

- Exécution en utilisateur non-root (UID 1000)
- Pas de mot de passe en clair
- Capacités Linux minimales

### Logs structurés

Format JSON pour faciliter l'analyse:

```json
{
  "timestamp": "2026-01-26 10:30:00",
  "level": "INFO",
  "module": "SeahawksHarvester",
  "message": "Scan terminé: 12 hôtes actifs"
}
```

## 📄 Format des rapports

Les rapports sont générés en JSON avec horodatage:

```json
{
  "scan_id": "scan_20260126_103000",
  "franchise_id": "franchise_01",
  "franchise_name": "Seattle Seahawks",
  "timestamp": "2026-01-26T10:30:00",
  "harvester_version": "1.0.0",
  "network": "192.168.1.0/24",
  "hosts": [
    {
      "ip": "192.168.1.10",
      "hostname": "server-01",
      "state": "up",
      "mac_address": "00:11:22:33:44:55",
      "vendor": "Dell Inc.",
      "os": {
        "name": "Linux 5.x",
        "accuracy": 95
      },
      "ports": [
        {
          "port": 22,
          "state": "open",
          "service": "ssh",
          "version": "OpenSSH 8.0",
          "product": "OpenSSH"
        }
      ]
    }
  ],
  "summary": {
    "total_hosts": 15,
    "hosts_up": 12,
    "hosts_down": 3,
    "total_ports_open": 34
  },
  "wan_latency_ms": 15.23,
  "scan_duration_seconds": 45.67
}
```

## 🔧 Dépannage

### Erreur: Permission denied

```bash
# Donner les capacités nécessaires (Linux)
sudo setcap cap_net_raw,cap_net_admin=eip $(which nmap)
```

### Erreur: Module nmap not found

```bash
pip install python-nmap
```

### Dashboard inaccessible

- Vérifier que le port 5000 n'est pas utilisé
- Vérifier le pare-feu local

## 📞 Support

Pour toute question ou problème:
- Email: support@seahawks-monitoring.com
- Documentation: voir `/documentation`

## 📝 Licence

© 2026 Seahawks Monitoring System - Tous droits réservés
