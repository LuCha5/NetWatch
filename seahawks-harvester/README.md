# Seahawks Harvester 🏈

Votre fidèle assistant de scan réseau ! Imaginez un petit robot qui surveille votre réseau 24/7, détecte tous les équipements et mesure la latence. C'est exactement ça, le Harvester. Bienvenue dans l'équipe ! 🚀

---

## 🎯 Ce qu'il fait pour vous

Le Harvester, c'est comme avoir un expert réseau qui bosse H24 sans jamais prendre de pause café :

- **Scan réseau automatique** — Parcourt votre réseau à intervalle régulier
- **Détection d'équipements** — Trouve tous les hôtes et leurs ports ouverts
- **Mesure de latence WAN** — Vous dit si votre connexion Internet rame
- **Dashboard local** — Une interface web rien que pour vous
- **Logs structurés** — Tout en JSON, propre et facile à exploiter
- **Mode autonome** — Fonctionne même sans connexion au Nester

💡 **En gros** : Installez-le, configurez-le, et laissez-le faire sa magie !

---

## 📋 Ce qu'il vous faut

Rien de bien compliqué, rassurez-vous :

- **Python 3.11+** — Le langage préféré de notre Harvester
- **nmap** — L'outil de scan (installez-le sur votre système)
- **Droits réseau** — La capacité CAP_NET_RAW (pour que nmap puisse scanner)

🖥️ **Compatibilité** : Linux (Ubuntu, Debian, CentOS), Docker, et même Windows avec WSL !

---

## 🚀 Installation (choisissez votre aventure)

### Option 1 : Installation locale (classique et efficace)

```bash
# Installez les petites bibliothèques Python dont on a besoin
pip install -r requirements.txt

# Installez nmap (Linux)
sudo apt-get install nmap

# Sur Windows ? Téléchargez-le ici : https://nmap.org/download.html
```

☕ Pendant que ça s'installe, c'est le moment parfait pour un café !

### Option 2 : Avec Docker (recommandé pour la prod)

```bash
# Construire l'image (une seule fois)
docker build -t seahawks-harvester:1.0.0 .

# Lancer le conteneur (et c'est parti !)
docker run -d \
  --name harvester \
  --network host \
  -v $(pwd)/reports:/app/reports \
  -v $(pwd)/logs:/app/logs \
  seahawks-harvester:1.0.0
```

🐳 **Pourquoi Docker ?** Isolation, portabilité, et déploiement ultra-rapide !

---

## ⚙️ Configuration (personnalisez votre Harvester)

Ouvrez le fichier `config.json` et adaptez-le à votre franchise :

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

### 📖 Petit guide des paramètres

| Paramètre | Qu'est-ce que c'est ? | Exemple |
|-----------|----------------------|---------|
| `franchise_id` | Votre ID unique (important !) | `franchise_01` |
| `franchise_name` | Le nom sympa de votre franchise | `Seattle Seahawks` |
| `scan_network` | Votre réseau à scanner (notation CIDR) | `192.168.1.0/24` |
| `scan_ports` | Les ports qui vous intéressent | `22,80,443,3389,8080` |
| `wan_test_host` | Serveur pour tester Internet (Google DNS par défaut) | `8.8.8.8` |
| `report_dir` | Où stocker les rapports JSON | `reports` |
| `log_dir` | Où écrire les logs | `logs` |
| `scan_interval` | Temps entre deux scans (en secondes) | `3600` (= 1h) |

🔑 **Conseil de pro** : Gardez le `scan_interval` à 3600 secondes (1 heure). C'est l'équilibre parfait entre fraîcheur des données et charge système.

---

## 📊 Utilisation au quotidien

### Lancer un scan manuel

```bash
python harvester.py
```

Vous verrez défiler les informations de scan en temps réel. Fascinant, non ? 🔍

### Démarrer le dashboard local

```bash
python dashboard.py
```

Puis ouvrez votre navigateur sur **http://localhost:5000** et admirez votre réseau ! 🎨

---

## 📁 Organisation des fichiers (où tout se trouve)

```
seahawks-harvester/
├── harvester.py              # 🧠 Le cerveau (script principal)
├── dashboard.py              # 📊 L'interface web locale
## 📁 Organisation des fichiers (où tout se trouve)

```
seahawks-harvester/
├── harvester.py              # 🧠 Le cerveau (script principal)
├── dashboard.py              # 📊 L'interface web locale
├── nester_integration.py     # 🔗 Le bavard qui parle au Nester
├── secrets_manager.py        # 🔐 Garde vos secrets... secrets
├── config.json               # ⚙️ Votre configuration
├── requirements.txt          # 📦 Liste de courses Python
├── Dockerfile                # 🐳 Pour les fans de Docker
├── templates/
│   └── dashboard.html        # 🎨 L'interface jolie
├── reports/                  # 📝 Les rapports de scan
│   └── latest_report.json
└── logs/                     # 📋 Les journaux de bord
    └── harvester_YYYYMMDD.log
```

💡 **Bon à savoir** : Les dossiers `reports/` et `logs/` se créent automatiquement au premier scan !

---

## 🔒 Sécurité (on ne rigole pas avec ça)

### On applique le principe du moindre privilège

- **Pas de root** — Le Harvester tourne avec un utilisateur normal (UID 1000)
- **Pas de mots de passe en clair** — Tout est chiffré proprement
- **Capacités minimales** — Juste ce qu'il faut pour scanner (CAP_NET_RAW)

🛡️ **Pourquoi c'est important ?** Si quelqu'un pirate le Harvester, il n'aura accès qu'à très peu de choses.

### Logs structurés (pour tout suivre)

Tous les logs sont en JSON, ce qui permet de :
- **Chercher facilement** — Filtrez par date, niveau, message...
- **Analyser automatiquement** — Vos outils d'analyse adorent le JSON
- **DebugAger rapidement** — Trouvez le problème en quelques secondes

Exemple de log :
```json
{
  "timestamp": "2026-03-07T14:30:00",
  "level": "INFO",
  "franchise": "franchise_01",
  "message": "Scan terminé : 24 hôtes détectés",
  "hosts_count": 24
}
```

---

## 📊 Format des rapports

Voici à quoi ressemble un rapport généré (super structuré) :

```json
{
  "timestamp": "2026-03-07T14:30:00",
  "franchise_id": "franchise_01",
  "franchise_name": "Seattle Seahawks",
  "scan_duration": 45.2,
  "wan_latency": 12.5,
  "hosts_detected": [
    {
      "ip": "192.168.1.1",
      "hostname": "router.local",
      "status": "up",
      "os_guess": "Linux 5.x",
      "open_ports": [
        {"port": 22, "service": "ssh"},
        {"port": 80, "service": "http"},
        {"port": 443, "service": "https"}
      ]
    }
  ]
}
```

📖 **C'est pratique parce que** : N'importe quel outil peut lire ce format et en tirer des statistiques !

---

## 🔗 Intégration avec le Nester (pour les connectés)

Si vous voulez que votre Harvester parle au serveur central :

1. **Configurez l'URL du Nester** dans `config.json` :
   ```json
   "nester_url": "https://nester.seahawks-monitoring.com:8000"
   ```

2. **Le Harvester enverra automatiquement** :
   - Un heartbeat toutes les 5 minutes ("Je suis vivant !")
   - Les rapports de scan après chaque scan
   - Les logs importants

3. **Mode résilient** : Si le Nester est injoignable, le Harvester continue de bosser en local. Les données seront envoyées dès que la connexion revient !

🌐 **Astuce** : Utilisez HTTPS avec un vrai certificat SSL pour sécuriser les échanges.

---

## 🐛 Dépannage (solutions aux problèmes courants)

### "Permission denied" lors du scan ?

```bash
# Solution : Donnez les bonnes capacités à nmap
sudo setcap cap_net_raw+ep $(which nmap)
```

### Le scan est très lent ?

- **Réduisez la plage réseau** : Scannez seulement ce dont vous avez besoin
- **Diminuez les ports** : Moins de ports = scan plus rapide
- **Vérifiez le réseau** : Un réseau congestionné ralentit nmap

### Le Harvester ne se connecte pas au Nester ?

```bash
# Testez la connexion
curl https://nester.seahawks-monitoring.com:8000/api/status

# Vérifiez les logs
tail -f logs/harvester_$(date +%Y%m%d).log
```

### J'ai modifié le code, ça marche plus !

```bash
# Retour aux sources (littéralement)
git checkout .
git pull
```

---

## 🚀 Optimisations possibles

Vous voulez aller plus loin ? Voici quelques idées :

- **Scans plus fréquents** : Réduisez `scan_interval` (attention à la charge)
- **Plus de ports** : Ajoutez vos ports spécifiques dans la config
- **Alertes** : Ajoutez un script qui vous envoie un email si un équipement disparaît
- **Graphiques** : Utilisez les données JSON pour créer des graphiques historiques

💡 **Contribution** : N'hésitez pas à proposer vos améliorations via une Pull Request !

---

## 🆘 Support et documentation

- 📖 [Documentation complète](../documentation/)
- 🏃 [Runbook d'exploitation](../documentation/RUNBOOK_EXPLOITATION.md)
- 🚀 [Guide de déploiement](../documentation/GUIDE_DEPLOIEMENT.md)
- 💬 Contactez l'équipe support si vous êtes bloqué

---

## ❤️ Développé avec passion

Ce Harvester a été conçu pour vous simplifier la vie. Si vous avez des questions ou des suggestions, n'hésitez pas !

**Version** : 1.0.0  
**Dernière mise à jour** : 7 mars 2026

Bon monitoring à tous ! 🏈🔍

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
