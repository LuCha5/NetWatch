# 🏈 Seahawks Nester - Dashboard React

Dashboard moderne et dynamique en React pour la supervision centralisée des 32 franchises NFL.

## ✨ Fonctionnalités

- ⚡ **Vue globale** des 32 franchises en temps réel
- 📊 **Statistiques agrégées** : sondes, équipements, disponibilité
- 🔍 **Filtres avancés** : Toutes / Connectées / Déconnectées
- 🔎 **Recherche** instantanée par nom de franchise
- 📈 **Graphiques interactifs** : état des sondes, top franchises
- 🔄 **Auto-refresh** configurable (30 secondes)
- 📱 **Responsive** : adapté à tous les écrans

## 🚀 Installation

```bash
# Dans le dossier dashboard-react
cd dashboard-react

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Dashboard accessible sur http://localhost:3001
```

## 📦 Build pour production

```bash
npm run build
# Le résultat sera dans dist/
```

## 🔧 Configuration

Le dashboard se connecte à l'API Nester sur le port 8080.

Pour modifier :
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // Modifier ici
      changeOrigin: true
    }
  }
}
```

## 🎯 Utilisation

1. **Démarrer le Nester** (dans seahawks-nester/)
   ```bash
   python nester.py
   ```

2. **Démarrer le dashboard React**
   ```bash
   cd dashboard-react
   npm run dev
   ```

3. **Ouvrir le navigateur**
   ```
   http://localhost:3001
   ```

## 📊 Composants

### StatsCards
- Total sondes (32)
- Sondes connectées
- Sondes déconnectées
- Total équipements détectés

### ProbesList
- Grille de cartes par franchise
- État (connecté/déconnecté)
- Nombre d'équipements
- Dernière activité
- Détails du dernier scan

### GlobalChart
- Graphique état des sondes
- Top 10 franchises par équipements
- Statistiques globales

## 🎨 Fonctionnalités avancées

### Filtres
- **Toutes** : affiche les 32 franchises
- **Connectées** : franchises en ligne uniquement
- **Déconnectées** : franchises hors ligne (action requise)

### Recherche
- Recherche par nom de franchise
- Recherche par ID de franchise
- Résultats instantanés

### Auto-refresh
- Mise à jour automatique toutes les 30s
- Peut être désactivé
- Bouton de rafraîchissement manuel

## 🎨 Personnalisation

Couleurs définies dans `tailwind.config.js` :
```javascript
colors: {
  'seahawks-blue': '#002244',
  'seahawks-green': '#69BE28',
  'seahawks-navy': '#001433',
}
```

## 🚀 Technologies

- **React 18** + **Vite**
- **Tailwind CSS**
- **Recharts** (graphiques)
- **Axios** (HTTP)
- **Lucide React** (icônes)

## 📝 API Endpoints utilisés

```
GET /api/probes          → Liste des 32 sondes
GET /api/statistics      → Stats globales
GET /api/probes/:id      → Détail d'une sonde
```

## 🎯 Pour la soutenance

Le dashboard Nester montre :
- ✅ Supervision centralisée des 32 franchises
- ✅ État temps réel (connecté/déconnecté)
- ✅ Statistiques globales et par franchise
- ✅ Interface moderne et professionnelle
- ✅ Filtres et recherche avancés

Parfait pour démontrer la vision globale du système NFL IT ! 🏈
