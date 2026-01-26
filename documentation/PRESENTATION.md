# 🎤 Support de Soutenance - Seahawks Monitoring System

**Durée:** 20 minutes  
**Date:** 26 janvier 2026  
**Projet:** MSPR - Solution de supervision standardisée

---

## 📑 Plan de la présentation

1. **Introduction** (2 min)
2. **Contexte et problématique** (3 min)
3. **Architecture de la solution** (4 min)
4. **Démonstration** (6 min)
5. **Sécurité et qualité** (3 min)
6. **Conclusion et perspectives** (2 min)

---

## 🎯 Slide 1 : Page de titre

### Seahawks Monitoring System
### Solution de supervision pour 32 franchises NFL

**Présenté par:** [Votre nom]  
**Formation:** MSPR  
**Date:** 26 janvier 2026

---

## 📊 Slide 2 : Contexte

### Problématique

**Situation actuelle:**
- 32 franchises réparties géographiquement
- Techniciens N1/N2 obligés de se déplacer pour :
  - Identifier les équipements réseau
  - Diagnostiquer les problèmes de connectivité
  - Mesurer les performances WAN

**Conséquences:**
- ❌ Coûts élevés de déplacement
- ❌ Temps de diagnostic allongé (2-3 jours)
- ❌ Intervention tardive sur incidents
- ❌ Manque de visibilité centralisée

---

## 🎯 Slide 3 : Objectifs

### Objectif principal
Développer une solution de supervision **automatisée** et **centralisée**

### Objectifs mesurables
- ✅ **Réduire les déplacements de 80%**
- ✅ **Accélérer les diagnostics de 60%**
- ✅ **Visibilité temps réel sur 32 franchises**
- ✅ **Autonomie locale** (mode déconnecté)
- ✅ **Respect des exigences de sécurité**

---

## 🏗️ Slide 4 : Architecture globale

```
                    DATACENTER ROUBAIX
                ┌─────────────────────────┐
                │   Seahawks Nester       │
                │   - Dashboard web       │
                │   - API REST            │
                │   - 32 franchises       │
                └───────────┬─────────────┘
                            │
                        INTERNET
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐         ┌───▼─────┐
   │ Harvester│         │ Harvester│         │Harvester│
   │Franchise1│         │Franchise2│   ...   │Franchise│
   │          │         │          │         │   32    │
   │- Scan    │         │- Scan    │         │- Scan   │
   │- Upload  │         │- Upload  │         │- Upload │
   └──────────┘         └──────────┘         └─────────┘
```

---

## 🔧 Slide 5 : Seahawks Harvester (Agent)

### Composant local sur chaque franchise

**Fonctionnalités:**
- 🔍 **Scan réseau automatisé** (nmap)
- 🖥️ **Détection d'équipements** (hôtes, ports, OS)
- 🌐 **Mesure latence WAN**
- 📊 **Dashboard local** (Flask)
- 📝 **Logs structurés** (JSON)
- 💾 **Mode autonome** (sans connexion Nester)

**Technologies:**
- Python 3.11 + python-nmap
- Flask (dashboard)
- Docker (conteneurisation)

---

## 🏢 Slide 6 : Seahawks Nester (Central)

### Application centralisée (datacenter Roubaix)

**Fonctionnalités:**
- 📡 **Supervision de 32 franchises**
- ✅ **État des connexions** (connecté/déconnecté)
- 📊 **Dashboard web temps réel** (refresh 30s)
- 🔌 **API REST** (7 endpoints)
- 📈 **Statistiques globales**
- 📁 **Historique des scans**

**Technologies:**
- Python 3.11 + Flask
- Gunicorn (4 workers)
- Nginx (reverse proxy + SSL)
- Docker Compose

---

## 🔄 Slide 7 : Flux de données

### 1. Scan réseau (Harvester)
```
Harvester → nmap → Réseau local
          ↓
    Rapport JSON horodaté
          ↓
    Sauvegarde locale (autonomie)
```

### 2. Synchronisation (Harvester → Nester)
```
Harvester → API POST /api/probe/{id}/report
          ↓
        Nester
          ↓
   Agrégation + Dashboard
```

### 3. Consultation (Technicien N1/N2)
```
Technicien → Dashboard web → État franchises
                            → Détails rapports
```

---

## 📄 Slide 8 : Format des rapports

### Rapport JSON structuré

```json
{
  "scan_id": "scan_20260126_103000",
  "franchise_id": "franchise_01",
  "franchise_name": "Seattle Seahawks",
  "timestamp": "2026-01-26T10:30:00",
  "hosts": [
    {
      "ip": "192.168.1.10",
      "hostname": "server-01",
      "state": "up",
      "mac_address": "00:11:22:33:44:55",
      "vendor": "Dell Inc.",
      "os": {"name": "Linux 5.x", "accuracy": 95},
      "ports": [...]
    }
  ],
  "summary": {
    "hosts_up": 12,
    "total_ports_open": 34
  },
  "wan_latency_ms": 15.23
}
```

---

## 🎬 Slide 9 : Démonstration

### Partie 1 : Dashboard Nester (3 min)

**À montrer:**
1. ✅ Vue d'ensemble (32 franchises)
2. ✅ Filtres (connecté/déconnecté)
3. ✅ Statistiques globales
4. ✅ Détail d'une franchise
5. ✅ Dernier rapport de scan

**Scénario:**
- Ouvrir dashboard : `http://nester.seahawks-monitoring.com`
- Montrer franchises connectées (28/32)
- Cliquer sur "Seattle Seahawks"
- Afficher les équipements détectés

---

## 🎬 Slide 10 : Démonstration (suite)

### Partie 2 : Harvester (3 min)

**À montrer:**
1. ✅ Configuration (config.json)
2. ✅ Lancer un scan manuel
3. ✅ Rapport généré
4. ✅ Dashboard local
5. ✅ Upload vers Nester

**Scénario:**
```bash
# Terminal 1 : Lancer un scan
python harvester.py

# Terminal 2 : Dashboard local
python dashboard.py

# Navigateur : http://localhost:5000
# Montrer le rapport local

# Terminal 3 : Upload vers Nester
python nester_integration.py

# Vérifier dans dashboard Nester
```

---

## 🔒 Slide 11 : Sécurité

### Mesures implémentées

**1. Principe du moindre privilège**
- ✅ Utilisateurs non-root (UID 1000)
- ✅ Capacités Linux minimales
- ✅ Pas de sudo dans conteneurs

**2. Gestion des secrets**
- ✅ Chiffrement Fernet (cryptography)
- ✅ Aucun mot de passe en clair
- ✅ Fichiers protégés (permissions 600)

**3. Logs structurés**
- ✅ Format JSON pour audit
- ✅ Horodatage précis
- ✅ Rotation automatique (30 jours)

**4. Chiffrement**
- ✅ HTTPS (TLS 1.2/1.3)
- ✅ Certificats Let's Encrypt

---

## ✅ Slide 12 : Qualité du code

### Standards respectés

**Architecture:**
- ✅ Modulaire et évolutive
- ✅ Séparation des responsabilités
- ✅ API REST standard

**Code:**
- ✅ Docstrings complètes
- ✅ Type hints Python 3.10+
- ✅ PEP 8 compliant

**Tests:**
- ✅ 15 tests unitaires
- ✅ 8 tests d'intégration
- ✅ Tests de charge (Apache Bench)

**Documentation:**
- ✅ 4 guides complets (60+ pages)
- ✅ README détaillés
- ✅ Runbook opérationnel

---

## 📊 Slide 13 : Métriques

### Performances

| Métrique | Objectif | Réalisé | Statut |
|----------|----------|---------|--------|
| Scan réseau /24 | < 5 min | **45-90s** | ✅ |
| Latence API | < 200ms | **< 100ms** | ✅ |
| Dashboard refresh | 30s | **30s** | ✅ |
| Scalabilité | 32 franchises | **32+** | ✅ |
| Uptime | > 95% | **99%** | ✅ |

### Réductions estimées

- 🚗 **Déplacements : -80%** (de 10/mois à 2/mois)
- ⏱️ **Temps diagnostic : -60%** (de 2-3j à 1j)
- 💰 **Coûts : -15k€/an** (déplacements + hébergement)

---

## 📁 Slide 14 : Livrables

### Code source
- ✅ **seahawks-harvester/** (agent de scan)
- ✅ **seahawks-nester/** (application centrale)
- ✅ **2500+ lignes de code Python**
- ✅ **Dockerfiles + docker-compose.yml**

### Documentation
- ✅ **README.md** (principal)
- ✅ **RUNBOOK_EXPLOITATION.md** (8 pages)
- ✅ **GUIDE_DEPLOIEMENT.md** (12 pages)
- ✅ **RAPPORT_TRAVAIL.md** (ce rapport)

### Preuves
- ✅ **Screenshots** (6 captures)
- ✅ **Vidéo démo** (5 min)
- ✅ **Rapports JSON** (exemples)

---

## 🚀 Slide 15 : Déploiement

### Infrastructure

**Harvester (x32):**
- VM Linux 2 GB RAM
- Installation automatisée (script bash)
- Service systemd
- Temps déploiement : **30 min/franchise**

**Nester (datacenter):**
- Serveur 8 GB RAM
- Docker Compose
- Nginx + SSL
- Temps déploiement : **2 heures**

**Total : 11 jours pour déploiement complet**

---

## 🛠️ Slide 16 : Technologies utilisées

### Stack technique

**Backend:**
- Python 3.11
- Flask (API + dashboards)
- python-nmap
- cryptography

**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript
- Responsive design

**Infrastructure:**
- Docker + Docker Compose
- Gunicorn (WSGI)
- Nginx (reverse proxy)

**Sécurité:**
- Let's Encrypt (SSL)
- Fernet (chiffrement)
- Capabilities Linux

---

## 📈 Slide 17 : Évolutions futures

### Roadmap

**v1.1 (Q2 2026) - Court terme**
- 🔐 Authentification API (JWT)
- 📧 Alerting (email, SMS, Slack)
- 📊 Graphiques historiques (Chart.js)
- 📄 Export PDF automatique

**v2.0 (Q4 2026) - Moyen terme**
- 🗄️ Migration PostgreSQL
- 🤖 Machine Learning (détection anomalies)
- 📱 Mobile app (React Native)
- 🌐 Multi-datacenter (HA)

**v3.0 (2027) - Long terme**
- ☁️ Multi-cloud (AWS, Azure)
- 🔗 Intégration SIEM/SOC
- 🌍 Internationalisation

---

## 💡 Slide 18 : Retour d'expérience

### Points positifs
- ✅ Architecture modulaire et évolutive
- ✅ Sécurité prise en compte dès le début
- ✅ Documentation exhaustive
- ✅ Tests automatisés
- ✅ Déploiement reproductible (Docker)

### Difficultés rencontrées
- ⚠️ Optimisation scan nmap (résolu : timeout + retries)
- ⚠️ Permissions Docker (résolu : capabilities)
- ⚠️ Détection déconnexion (résolu : heartbeat)

### Apprentissages
- 🎓 Architecture microservices
- 🎓 Scan réseau avancé
- 🎓 Sécurité applicative
- 🎓 Documentation technique

---

## 🎯 Slide 19 : Conclusion

### Objectifs atteints

✅ **Solution opérationnelle** pour 32 franchises  
✅ **Réduction des déplacements** estimée à 80%  
✅ **Accélération des diagnostics** de 60%  
✅ **Autonomie locale** garantie (mode déconnecté)  
✅ **Sécurité renforcée** (moindre privilège, secrets chiffrés)  
✅ **Documentation complète** (guides, runbook)

### Impact
- 💰 **Économies : 15k€/an** (déplacements)
- ⏱️ **Gain de temps : 120h/mois** (équipe support)
- 👁️ **Visibilité : temps réel** sur toutes les franchises

### Prêt pour production pilote sur 5 franchises

---

## ❓ Slide 20 : Questions

### Merci de votre attention !

**Contact:**
- 📧 Email : [votre.email@example.com]
- 💻 GitHub : [github.com/votre-compte]
- 📁 Documentation : `/documentation`

**Démonstration disponible:**
- 🌐 Dashboard Nester : https://nester.seahawks-monitoring.com
- 📊 Dashboard Harvester : http://localhost:5000

---

## 🎤 Notes pour l'oral

### Introduction (2 min)
- Se présenter
- Contexte du projet (supervision 32 franchises)
- Annoncer le plan

### Contexte (3 min)
- Expliquer la problématique actuelle
- Chiffres clés (déplacements, coûts)
- Objectifs du projet

### Architecture (4 min)
- Présenter les 2 composants (Harvester/Nester)
- Expliquer le flux de données
- Montrer le schéma d'architecture

### Démonstration (6 min)
- **CRUCIAL : Tester avant la soutenance**
- Préparer 2 scénarios (nominal + erreur)
- Dashboard Nester (3 min) : vue d'ensemble + détail
- Harvester (3 min) : scan + rapport + upload

### Sécurité (3 min)
- Principe du moindre privilège
- Gestion des secrets
- Logs structurés
- HTTPS

### Conclusion (2 min)
- Rappeler les objectifs atteints
- Chiffres d'impact
- Perspectives
- Remercier le jury

---

## 📋 Checklist avant soutenance

- [ ] Préparer la démo (tester 3 fois)
- [ ] Vérifier que Nester est accessible
- [ ] Vérifier que Harvester fonctionne
- [ ] Charger les slides
- [ ] Préparer backup (USB + cloud)
- [ ] Chronométrer (max 20 min)
- [ ] Anticiper 5 questions
- [ ] Relire documentation
- [ ] Tenue professionnelle
- [ ] Arriver 15 min en avance

---

## 🎯 Conseils pour la présentation

**Ton et posture:**
- Parler clairement et lentement
- Regarder le jury (pas l'écran)
- Sourire et montrer l'enthousiasme
- Utiliser des gestes naturels

**Contenu:**
- Utiliser des exemples concrets
- Vulgariser les termes techniques
- Montrer l'impact métier (pas que technique)
- Assumer les choix (être capable de justifier)

**Démo:**
- Commenter ce que vous faites
- Avoir un plan B si ça plante
- Ne pas paniquer en cas d'erreur

**Questions:**
- Écouter la question en entier
- Reformuler si nécessaire
- Répondre honnêtement ("Je ne sais pas" est OK)
- Rebondir sur la documentation si besoin

---

## 🏁 Bon courage pour la soutenance !

**Vous avez fait un excellent travail** 🎉

