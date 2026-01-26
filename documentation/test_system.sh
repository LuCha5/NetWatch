#!/bin/bash

#####################################################################
# Script de test et validation - Seahawks Monitoring System
# Usage: ./test_system.sh
# Description: Teste tous les composants du système
#####################################################################

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  $1"
    echo "=============================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Compteurs de tests
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction de test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo ""
    echo -n "Test: $test_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "PASS"
        ((TESTS_PASSED++))
        return 0
    else
        print_error "FAIL"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Début des tests
print_header "Tests Seahawks Monitoring System"

# 1. Tests Prérequis
print_header "1. Vérification des prérequis"

run_test "Python 3.11+ installé" "python3 --version | grep -E '3\.(11|12|13)'"
run_test "pip installé" "pip3 --version"
run_test "nmap installé" "nmap --version"
run_test "Docker installé" "docker --version"
run_test "Docker Compose installé" "docker compose version"

# 2. Tests Harvester
print_header "2. Tests Seahawks Harvester"

if [ -d "../seahawks-harvester" ]; then
    cd ../seahawks-harvester
    
    run_test "Fichier harvester.py existe" "test -f harvester.py"
    run_test "Fichier dashboard.py existe" "test -f dashboard.py"
    run_test "Fichier config.json existe" "test -f config.json"
    run_test "Fichier requirements.txt existe" "test -f requirements.txt"
    run_test "Fichier Dockerfile existe" "test -f Dockerfile"
    
    # Test installation dépendances
    print_info "Installation des dépendances Harvester..."
    if python3 -m venv venv 2>&1 && venv/bin/pip install -q -r requirements.txt 2>&1; then
        print_success "Dépendances installées"
        ((TESTS_PASSED++))
    else
        print_error "Échec installation dépendances"
        ((TESTS_FAILED++))
    fi
    
    # Test syntaxe Python
    run_test "Syntaxe harvester.py valide" "python3 -m py_compile harvester.py"
    run_test "Syntaxe dashboard.py valide" "python3 -m py_compile dashboard.py"
    
    # Test Docker build
    print_info "Build image Docker Harvester..."
    if docker build -t seahawks-harvester:test . > /dev/null 2>&1; then
        print_success "Image Docker construite"
        ((TESTS_PASSED++))
    else
        print_warning "Échec build Docker (non bloquant)"
    fi
    
    cd - > /dev/null
else
    print_error "Répertoire seahawks-harvester introuvable"
fi

# 3. Tests Nester
print_header "3. Tests Seahawks Nester"

if [ -d "../seahawks-nester" ]; then
    cd ../seahawks-nester
    
    run_test "Fichier nester.py existe" "test -f nester.py"
    run_test "Fichier requirements.txt existe" "test -f requirements.txt"
    run_test "Fichier Dockerfile existe" "test -f Dockerfile"
    run_test "Fichier docker-compose.yml existe" "test -f docker-compose.yml"
    
    # Test installation dépendances
    print_info "Installation des dépendances Nester..."
    if python3 -m venv venv 2>&1 && venv/bin/pip install -q -r requirements.txt 2>&1; then
        print_success "Dépendances installées"
        ((TESTS_PASSED++))
    else
        print_error "Échec installation dépendances"
        ((TESTS_FAILED++))
    fi
    
    # Test syntaxe Python
    run_test "Syntaxe nester.py valide" "python3 -m py_compile nester.py"
    
    # Test Docker build
    print_info "Build image Docker Nester..."
    if docker build -t seahawks-nester:test . > /dev/null 2>&1; then
        print_success "Image Docker construite"
        ((TESTS_PASSED++))
    else
        print_warning "Échec build Docker (non bloquant)"
    fi
    
    cd - > /dev/null
else
    print_error "Répertoire seahawks-nester introuvable"
fi

# 4. Tests Documentation
print_header "4. Vérification de la documentation"

run_test "README.md principal existe" "test -f ../README.md"
run_test "Runbook existe" "test -f RUNBOOK_EXPLOITATION.md"
run_test "Guide déploiement existe" "test -f GUIDE_DEPLOIEMENT.md"
run_test "Rapport de travail existe" "test -f RAPPORT_TRAVAIL.md"
run_test "Support présentation existe" "test -f PRESENTATION.md"
run_test "Exemple de rapport existe" "test -f example_report.json"

# Vérifier que les fichiers ne sont pas vides
run_test "README non vide" "test -s ../README.md"
run_test "Runbook non vide" "test -s RUNBOOK_EXPLOITATION.md"

# 5. Tests d'intégration (optionnels)
print_header "5. Tests d'intégration (optionnels)"

# Test Nester avec Docker Compose
if [ -d "../seahawks-nester" ]; then
    cd ../seahawks-nester
    
    print_info "Tentative de démarrage du Nester..."
    if docker compose up -d > /dev/null 2>&1; then
        print_success "Nester démarré"
        
        # Attendre que le service soit prêt
        sleep 5
        
        # Test API
        if curl -s -f http://localhost:8000/api/status > /dev/null; then
            print_success "API Nester accessible"
            ((TESTS_PASSED++))
        else
            print_warning "API Nester non accessible"
        fi
        
        # Arrêter le service
        docker compose down > /dev/null 2>&1
        print_info "Nester arrêté"
    else
        print_warning "Impossible de démarrer Nester (Docker Compose)"
    fi
    
    cd - > /dev/null
fi

# 6. Tests Sécurité
print_header "6. Vérification sécurité"

# Vérifier qu'il n'y a pas de mots de passe en clair
if grep -r -i "password.*=" ../seahawks-harvester/ ../seahawks-nester/ 2>/dev/null | grep -v ".git" | grep -v "venv" | grep -v "# password"; then
    print_error "Mots de passe potentiellement en clair détectés"
    ((TESTS_FAILED++))
else
    print_success "Pas de mot de passe en clair détecté"
    ((TESTS_PASSED++))
fi

# Vérifier les permissions des fichiers sensibles
if [ -f "../seahawks-harvester/.secrets.key" ]; then
    if [ "$(stat -c %a ../seahawks-harvester/.secrets.key)" = "600" ]; then
        print_success "Permissions .secrets.key correctes (600)"
        ((TESTS_PASSED++))
    else
        print_error "Permissions .secrets.key incorrectes"
        ((TESTS_FAILED++))
    fi
fi

# 7. Résumé
print_header "Résumé des tests"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo ""
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}✅ Réussis: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Échoués: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Taux de réussite: ${SUCCESS_RATE}%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "Tous les tests sont passés! 🎉"
    echo ""
    echo "Le système est prêt pour le déploiement."
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    print_warning "Tests majoritairement réussis avec quelques avertissements"
    echo ""
    echo "Le système est fonctionnel mais nécessite quelques ajustements."
    exit 0
else
    print_error "Trop de tests ont échoué"
    echo ""
    echo "Veuillez corriger les erreurs avant le déploiement."
    exit 1
fi
