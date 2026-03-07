# Installation du Service Systemd 🔧

Vous en avez marre de lancer manuellement le Harvester à chaque fois ? Bonne nouvelle : on va transformer ça en un vrai service qui démarre tout seul comme un grand ! Suivez le guide, c'est plus simple que ça en a l'air. ☕

---

## 1. Transférer les fichiers mis à jour vers la VM

D'abord, on envoie nos petits scripts depuis votre machine Windows vers la VM. Ouvrez votre terminal :

```bash
# Depuis Windows (ajustez les chemins selon votre config)
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\run_with_nester.py user@192.168.146.133:~/seahawks-harvester/
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\nester_integration.py user@192.168.146.133:~/seahawks-harvester/
scp C:\Users\luoni\Desktop\cours\MSPR\seahawks-harvester\seahawks-harvester.service user@192.168.146.133:~/
```

💡 **Astuce** : Si `scp` vous demande un mot de passe à chaque fois, pensez à configurer une clé SSH. Votre poignet vous remerciera !

---

## 2. Sur la VM - Installer les dépendances

Maintenant qu'on est sur la VM, on installe ce qu'il nous manque :

```bash
cd ~/seahawks-harvester
source venv/bin/activate  # On active l'environnement virtuel
pip install psutil        # Pour monitorer les ressources système
```

🎯 **Pourquoi psutil ?** Parce qu'on veut savoir combien de CPU et de RAM notre petit Harvester consomme. C'est toujours bien de garder un œil sur ça !

---

## 3. Installer le service systemd

Allez, c'est parti pour la vraie installation ! On va dire à systemd de gérer notre service :

```bash
# On copie le fichier service au bon endroit
sudo cp ~/seahawks-harvester.service /etc/systemd/system/

# On dit à systemd "Hey, y'a du nouveau !"
sudo systemctl daemon-reload

# On active le démarrage automatique
sudo systemctl enable seahawks-harvester.service

# Et on démarre tout de suite pour voir
sudo systemctl start seahawks-harvester.service
```

🎉 **Et voilà !** Votre Harvester est maintenant un citoyen de première classe dans votre système Linux !

---

## 4. Vérifier que tout roule

Histoire de dormir tranquille, vérifions que notre service fonctionne bien :

---

## 4. Vérifier que tout roule

Histoire de dormir tranquille, vérifions que notre service fonctionne bien :

```bash
# Voir le statut actuel
sudo systemctl status seahawks-harvester

# Suivre les logs en direct (pratique pour débugger !)
sudo journalctl -u seahawks-harvester -f

# Voir les logs dans notre fichier perso
tail -f ~/seahawks-harvester/logs/harvester_service.log
```

✅ **Bon signe** : Si vous voyez "active (running)" en vert, c'est gagné ! 🎊

---

## 5. Commandes utiles (à garder sous le coude)

Voici votre boîte à outils pour gérer le service au quotidien :

```bash
# Redémarrer le service (après une mise à jour par exemple)
sudo systemctl restart seahawks-harvester

# Arrêter le service (pour faire une pause)
sudo systemctl stop seahawks-harvester

# Désactiver le démarrage automatique (si vous voulez reprendre le contrôle manuel)
sudo systemctl disable seahawks-harvester

# Jeter un œil aux logs des dernières 24h (super pratique en cas de problème)
sudo journalctl -u seahawks-harvester --since "24 hours ago"
```

📌 **Mémo** : Collez ces commandes dans un fichier texte sur votre bureau. On ne sait jamais quand on en a besoin !

---

## 6. Sur Windows - Rebuild du dashboard React

Si vous modifiez le dashboard, n'oubliez pas de le recompiler :

```powershell
cd C:\Users\luoni\Desktop\cours\MSPR\seahawks-nester\dashboard-react
npm run build
```

💻 **Note** : Ça prend quelques secondes. Le temps d'aller se chercher un café ! ☕

---

## 🎁 Fonctionnalités ajoutées (ce que vous gagnez)

### 1. Service systemd robuste
- ✅ **Démarrage automatique** — Plus besoin d'y penser au boot !
- ✅ **Redémarrage automatique** — Même si ça plante, ça redémarre tout seul
- ✅ **Logs dans journald** — Tout est centralisé et facile à consulter

### 2. Logging amélioré (pour les curieux)
- ✅ **Métriques système** — CPU, RAM, Disque à chaque scan
- ✅ **Logs détaillés** — Tout est dans `logs/harvester_service.log`
- ✅ **Compteur de scans** — Vous savez exactement combien de scans ont été faits
- ✅ **Upload automatique** — Les logs partent tout seuls vers le Nester

### 3. API Nester enrichie
- ✅ **`POST /api/probe/{id}/logs`** — Envoyer les logs
- ✅ **`GET /api/probe/{id}/logs`** — Récupérer les logs
- ✅ **Stockage intelligent** — Tout est rangé dans `data/probe_logs/`

### 4. Dashboard React amélioré 🎨
- ✅ **Modale de détails** — Cliquez sur une franchise pour tout voir
- ✅ **3 onglets pratiques** — Vue d'ensemble, Équipements, Logs système
- ✅ **Style terminal** — Les logs s'affichent comme dans un vrai terminal
- ✅ **Auto-refresh** — Rafraîchissement automatique toutes les 30 secondes

---

## 📊 Exemple de logs générés

Voici à quoi ressemblent les logs (joli, non ?) :

```
2026-01-26 11:25:00 - INFO - ============================================================
2026-01-26 11:25:00 - INFO - SCAN #1 - 2026-01-26 11:25:00
2026-01-26 11:25:00 - INFO - Métriques système : CPU 12.5% | RAM 45.2% | Disque 67.8%
2026-01-26 11:25:00 - INFO - Scan réseau lancé sur 192.168.1.0/24...
2026-01-26 11:26:30 - INFO - Scan terminé : 15 hôtes détectés
2026-01-26 11:26:31 - INFO - Rapport envoyé au Nester avec succès
2026-01-26 11:26:31 - INFO - ============================================================
```

---

## 🆘 Problèmes courants et solutions

**Le service ne démarre pas ?**
- Vérifiez que Python est bien installé : `python3 --version`
- Vérifiez les permissions : `ls -l /etc/systemd/system/seahawks-harvester.service`

**Les logs sont vides ?**
- Le service vient peut-être de démarrer, attendez un scan complet (quelques minutes)
- Vérifiez que les répertoires existent : `ls -la ~/seahawks-harvester/logs/`

**Le Nester ne reçoit rien ?**
- Vérifiez la connectivité réseau : `ping <ip-du-nester>`
- Regardez les logs pour voir les erreurs : `sudo journalctl -u seahawks-harvester -n 50`

---

## 💡 Conseil de pro

Configurez un alias dans votre `.bashrc` pour gagner du temps :

```bash
echo "alias harvester-status='sudo systemctl status seahawks-harvester'" >> ~/.bashrc
echo "alias harvester-logs='sudo journalctl -u seahawks-harvester -f'" >> ~/.bashrc
source ~/.bashrc
```

Maintenant vous pouvez juste taper `harvester-status` ou `harvester-logs`. Classe, non ? 😎
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
