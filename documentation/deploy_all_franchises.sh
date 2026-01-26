#!/bin/bash

#####################################################################
# Script de déploiement automatisé - Seahawks Harvester
# Usage: ./deploy_all_franchises.sh
# Description: Déploie le Harvester sur toutes les franchises
#####################################################################

set -e

# Configuration
FRANCHISES=(
    "franchise_01:Seattle Seahawks:192.168.1.100"
    "franchise_02:San Francisco 49ers:192.168.2.100"
    "franchise_03:Los Angeles Rams:192.168.3.100"
    "franchise_04:Arizona Cardinals:192.168.4.100"
    "franchise_05:Dallas Cowboys:192.168.5.100"
    "franchise_06:New York Giants:192.168.6.100"
    "franchise_07:Philadelphia Eagles:192.168.7.100"
    "franchise_08:Washington Commanders:192.168.8.100"
    "franchise_09:Green Bay Packers:192.168.9.100"
    "franchise_10:Minnesota Vikings:192.168.10.100"
    "franchise_11:Chicago Bears:192.168.11.100"
    "franchise_12:Detroit Lions:192.168.12.100"
    "franchise_13:Tampa Bay Buccaneers:192.168.13.100"
    "franchise_14:New Orleans Saints:192.168.14.100"
    "franchise_15:Atlanta Falcons:192.168.15.100"
    "franchise_16:Carolina Panthers:192.168.16.100"
    "franchise_17:New England Patriots:192.168.17.100"
    "franchise_18:Buffalo Bills:192.168.18.100"
    "franchise_19:Miami Dolphins:192.168.19.100"
    "franchise_20:New York Jets:192.168.20.100"
    "franchise_21:Pittsburgh Steelers:192.168.21.100"
    "franchise_22:Baltimore Ravens:192.168.22.100"
    "franchise_23:Cleveland Browns:192.168.23.100"
    "franchise_24:Cincinnati Bengals:192.168.24.100"
    "franchise_25:Kansas City Chiefs:192.168.25.100"
    "franchise_26:Las Vegas Raiders:192.168.26.100"
    "franchise_27:Los Angeles Chargers:192.168.27.100"
    "franchise_28:Denver Broncos:192.168.28.100"
    "franchise_29:Indianapolis Colts:192.168.29.100"
    "franchise_30:Tennessee Titans:192.168.30.100"
    "franchise_31:Jacksonville Jaguars:192.168.31.100"
    "franchise_32:Houston Texans:192.168.32.100"
)

SSH_USER="admin"
SSH_KEY="~/.ssh/seahawks_deploy_key"
DEPLOY_SCRIPT="deploy_harvester.sh"

echo "=============================================="
echo "  Déploiement massif - Seahawks Harvester"
echo "  32 franchises NFL"
echo "=============================================="
echo ""

# Vérifier que le script de déploiement existe
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo "❌ Erreur: Script $DEPLOY_SCRIPT introuvable"
    exit 1
fi

# Compteurs
SUCCESS=0
FAILED=0

# Déploiement sur chaque franchise
for franchise_info in "${FRANCHISES[@]}"; do
    IFS=':' read -r franchise_id franchise_name ip_address <<< "$franchise_info"
    
    echo ""
    echo "┌─────────────────────────────────────────────┐"
    echo "│ Franchise: $franchise_name"
    echo "│ ID: $franchise_id"
    echo "│ IP: $ip_address"
    echo "└─────────────────────────────────────────────┘"
    
    # Tester la connectivité
    if ! ping -c 1 -W 2 "$ip_address" > /dev/null 2>&1; then
        echo "❌ Erreur: Impossible de joindre $ip_address"
        ((FAILED++))
        continue
    fi
    
    # Copier le script de déploiement
    echo "📤 Copie du script de déploiement..."
    if ! scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$DEPLOY_SCRIPT" "${SSH_USER}@${ip_address}:/tmp/" 2>/dev/null; then
        echo "❌ Erreur: Échec de la copie du script"
        ((FAILED++))
        continue
    fi
    
    # Exécuter le déploiement
    echo "🚀 Déploiement en cours..."
    if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${SSH_USER}@${ip_address}" \
        "sudo bash /tmp/$DEPLOY_SCRIPT '$franchise_id' '$franchise_name' '192.168.${franchise_id#franchise_}.0/24'" 2>&1 | grep -q "Déploiement terminé"; then
        echo "✅ Déploiement réussi!"
        ((SUCCESS++))
    else
        echo "❌ Erreur lors du déploiement"
        ((FAILED++))
    fi
    
    # Pause entre déploiements
    sleep 2
done

# Résumé
echo ""
echo "=============================================="
echo "  Résumé du déploiement"
echo "=============================================="
echo "✅ Succès: $SUCCESS franchises"
echo "❌ Échecs: $FAILED franchises"
echo "📊 Total: ${#FRANCHISES[@]} franchises"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Déploiement complet réussi!"
    exit 0
else
    echo "⚠️  Déploiement partiel avec erreurs"
    exit 1
fi
