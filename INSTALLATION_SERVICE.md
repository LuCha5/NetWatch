# Installation du Service Systemd

## 1. Transférer les fichiers mis à jour vers la VM

```bash
# Depuis Windows
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\run_with_nester.py user@192.168.146.133:~/seahawks-harvester/
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\nester_integration.py user@192.168.146.133:~/seahawks-harvester/
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\seahawks-harvester.service user@192.168.146.133:~/
```

## 2. Sur la VM - Installer les dépendances

```bash
cd ~/seahawks-harvester
source venv/bin/activate
pip install psutil
```

## 3. Installer le service systemd

```bash
# Copier le fichier service
sudo cp ~/seahawks-harvester.service /etc/systemd/system/

# Recharger systemd
sudo systemctl daemon-reload

# Activer le service au démarrage
sudo systemctl enable seahawks-harvester.service

# Démarrer le service
sudo systemctl start seahawks-harvester.service
```

## 4. Vérifier le fonctionnement

```bash
# Voir le statut
sudo systemctl status seahawks-harvester

# Voir les logs en temps réel
sudo journalctl -u seahawks-harvester -f

# Voir les logs du fichier
tail -f ~/seahawks-harvester/logs/harvester_service.log
```

## 5. Commandes utiles

```bash
# Redémarrer le service
sudo systemctl restart seahawks-harvester

# Arrêter le service
sudo systemctl stop seahawks-harvester

# Désactiver le démarrage automatique
sudo systemctl disable seahawks-harvester

# Voir les logs des dernières 24h
sudo journalctl -u seahawks-harvester --since "24 hours ago"
```

## 6. Sur Windows - Rebuild du dashboard React

```powershell
cd C:\Users\luoni\Desktop\cours\MSPR\seahawks-nester\dashboard-react
npm run build
```

## Fonctionnalités ajoutées

### 1. Service systemd
- ✅ Démarrage automatique au boot de la VM
- ✅ Redémarrage automatique en cas de crash
- ✅ Logs dans journald

### 2. Logging amélioré
- ✅ Métriques système (CPU, RAM, Disque) à chaque scan
- ✅ Logs détaillés dans `logs/harvester_service.log`
- ✅ Compteur de scans avec timestamps
- ✅ Upload automatique des logs vers le Nester

### 3. API Nester
- ✅ `POST /api/probe/{id}/logs` - Upload des logs
- ✅ `GET /api/probe/{id}/logs` - Récupération des logs
- ✅ Stockage dans `data/probe_logs/`

### 4. Dashboard React
- ✅ Modale de détails par franchise
- ✅ 3 onglets : Vue d'ensemble, Équipements, Logs système
- ✅ Affichage des logs avec style terminal
- ✅ Auto-refresh toutes les 30 secondes

## Exemple de logs générés

```
2026-01-26 11:25:00 - INFO - ============================================================
2026-01-26 11:25:00 - INFO - SCAN #1 - 2026-01-26 11:25:00
2026-01-26 11:25:00 - INFO - ============================================================
2026-01-26 11:25:01 - INFO - 💻 Métriques système: CPU 15.2% | RAM 42.8% | Disque 68.5%
2026-01-26 11:25:01 - INFO - 🔍 Lancement du scan réseau...
2026-01-26 11:25:06 - INFO - ✅ Scan terminé avec succès
2026-01-26 11:25:06 - INFO - 💓 Envoi heartbeat...
2026-01-26 11:25:06 - INFO - 📤 Upload du rapport...
2026-01-26 11:25:06 - INFO - ✅ Rapport envoyé au Nester
2026-01-26 11:25:07 - INFO - 📋 Upload des logs...
2026-01-26 11:25:07 - INFO - ✅ Logs envoyés au Nester
2026-01-26 11:25:07 - INFO - ⏳ Prochain scan dans 3600s...
```
