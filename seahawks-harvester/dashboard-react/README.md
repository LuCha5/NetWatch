# 🎨 Seahawks Harvester - Dashboard React

Dashboard moderne et dynamique en React + Vite + Tailwind CSS pour le monitoring réseau Seahawks.

## ✨ Fonctionnalités

- ⚡ **React 18** avec Vite pour des performances optimales
- 🎨 **Tailwind CSS** pour un design moderne et responsive
- 📊 **Recharts** pour des graphiques interactifs
- 🔄 **Auto-refresh** configurable (30 secondes par défaut)
- 📱 **Responsive** : fonctionne sur mobile, tablette et desktop
- 🎯 **Temps réel** : mise à jour automatique des données
- 🌈 **Animations** fluides et transitions élégantes

## 🚀 Installation

```bash
# Dans le dossier dashboard-react
cd dashboard-react

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Le dashboard sera accessible sur http://localhost:3000
```

## 📦 Build pour production

```bash
# Créer le build optimisé
npm run build

# Le résultat sera dans le dossier dist/
# Servir avec n'importe quel serveur web statique
```

## 🔧 Configuration

Le dashboard se connecte automatiquement à l'API Flask sur le port 5000 via un proxy configuré dans `vite.config.js`.

Si votre API est sur un autre port, modifiez :

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:VOTRE_PORT', // Modifier ici
        changeOrigin: true
      }
    }
  }
})
```

## 🎯 Utilisation

1. **Démarrer l'API Flask** (dans seahawks-harvester/)
   ```bash
   python dashboard.py
   ```

2. **Démarrer le dashboard React** (dans dashboard-react/)
   ```bash
   npm run dev
   ```

3. **Ouvrir le navigateur**
   ```
   http://localhost:3000
   ```

## 📊 Composants

### StatsCards
Affiche les statistiques principales :
- Nombre d'hôtes actifs
- Ports ouverts
- Latence WAN
- Durée du scan

### HostsList
Liste détaillée des équipements avec :
- État (en ligne/hors ligne)
- Adresse IP et hostname
- Ports scannés (ouverts/fermés)
- Services et versions détectés
- Système d'exploitation

### NetworkChart
Graphiques circulaires pour visualiser :
- Répartition des équipements en ligne/hors ligne
- Analyse des ports ouverts/fermés

## 🎨 Personnalisation

Les couleurs Seahawks sont définies dans `tailwind.config.js` :

```javascript
colors: {
  'seahawks-blue': '#002244',
  'seahawks-green': '#69BE28',
  'seahawks-navy': '#001433',
}
```

## 🔄 Auto-refresh

Le dashboard se met à jour automatiquement toutes les 30 secondes. Vous pouvez :
- Désactiver l'auto-refresh avec le bouton toggle
- Forcer une mise à jour avec le bouton "Actualiser"

## 📱 Responsive Design

Le dashboard s'adapte automatiquement :
- **Mobile** : 1 colonne
- **Tablette** : 2 colonnes
- **Desktop** : 4 colonnes pour les stats

## 🚀 Technologies

- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Framework CSS utility-first
- **Axios** : Client HTTP
- **Recharts** : Bibliothèque de graphiques
- **Lucide React** : Icônes modernes

## 📝 Notes

- Le dashboard nécessite que l'API Flask soit lancée sur le port 5000
- Les données sont rafraîchies automatiquement
- Design optimisé pour la présentation et la démo
