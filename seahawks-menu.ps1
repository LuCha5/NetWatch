# Seahawks Monitoring - Script d'aide PowerShell
# Facilite les opérations courantes sous Windows

# Couleurs
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Blue
    Write-Host "  $Message" -ForegroundColor Blue
    Write-Host "=" * 60 -ForegroundColor Blue
    Write-Host ""
}

# Menu principal
function Show-Menu {
    Write-Header "Seahawks Monitoring - Menu Principal"
    Write-Host "1. Installer les dépendances Harvester"
    Write-Host "2. Installer les dépendances Nester"
    Write-Host "3. Lancer le Harvester"
    Write-Host "4. Lancer le Dashboard Harvester"
    Write-Host "5. Lancer le Nester (Docker)"
    Write-Host "6. Arrêter le Nester"
    Write-Host "7. Voir les logs Nester"
    Write-Host "8. Tester l'API Nester"
    Write-Host "9. Générer une clé secrète"
    Write-Host "0. Quitter"
    Write-Host ""
}

# Fonction 1: Installer dépendances Harvester
function Install-HarvesterDependencies {
    Write-Header "Installation des dépendances Harvester"
    
    Set-Location seahawks-harvester
    
    Write-Info "Création de l'environnement virtuel..."
    python -m venv venv
    
    Write-Info "Activation de l'environnement..."
    .\venv\Scripts\Activate.ps1
    
    Write-Info "Installation des dépendances..."
    pip install -r requirements.txt
    
    Write-Success "Dépendances installées!"
    Write-Warning "Note: nmap doit être installé séparément depuis https://nmap.org/download.html"
    
    Set-Location ..
}

# Fonction 2: Installer dépendances Nester
function Install-NesterDependencies {
    Write-Header "Installation des dépendances Nester"
    
    Set-Location seahawks-nester
    
    Write-Info "Création de l'environnement virtuel..."
    python -m venv venv
    
    Write-Info "Activation de l'environnement..."
    .\venv\Scripts\Activate.ps1
    
    Write-Info "Installation des dépendances..."
    pip install -r requirements.txt
    
    Write-Success "Dépendances installées!"
    
    Set-Location ..
}

# Fonction 3: Lancer Harvester
function Start-Harvester {
    Write-Header "Lancement du Harvester"
    
    Set-Location seahawks-harvester
    
    if (Test-Path "venv\Scripts\Activate.ps1") {
        .\venv\Scripts\Activate.ps1
        python harvester.py
    } else {
        Write-Error "Environnement virtuel non trouvé. Installez d'abord les dépendances (option 1)"
    }
    
    Set-Location ..
}

# Fonction 4: Lancer Dashboard Harvester
function Start-HarvesterDashboard {
    Write-Header "Lancement du Dashboard Harvester"
    
    Set-Location seahawks-harvester
    
    if (Test-Path "venv\Scripts\Activate.ps1") {
        .\venv\Scripts\Activate.ps1
        Write-Info "Dashboard accessible sur: http://localhost:5000"
        python dashboard.py
    } else {
        Write-Error "Environnement virtuel non trouvé. Installez d'abord les dépendances (option 1)"
    }
    
    Set-Location ..
}

# Fonction 5: Lancer Nester
function Start-Nester {
    Write-Header "Lancement du Nester (Docker)"
    
    Set-Location seahawks-nester
    
    Write-Info "Vérification de Docker..."
    docker --version
    
    if ($?) {
        Write-Info "Démarrage avec Docker Compose..."
        docker compose up -d
        
        Write-Success "Nester démarré!"
        Write-Info "Dashboard accessible sur: http://localhost:8000"
        Write-Info "API accessible sur: http://localhost:8000/api"
    } else {
        Write-Error "Docker n'est pas installé ou n'est pas démarré"
    }
    
    Set-Location ..
}

# Fonction 6: Arrêter Nester
function Stop-Nester {
    Write-Header "Arrêt du Nester"
    
    Set-Location seahawks-nester
    
    Write-Info "Arrêt des conteneurs..."
    docker compose down
    
    Write-Success "Nester arrêté!"
    
    Set-Location ..
}

# Fonction 7: Logs Nester
function Show-NesterLogs {
    Write-Header "Logs du Nester"
    
    Set-Location seahawks-nester
    
    Write-Info "Affichage des logs (Ctrl+C pour quitter)..."
    docker compose logs -f
    
    Set-Location ..
}

# Fonction 8: Tester API
function Test-NesterAPI {
    Write-Header "Test de l'API Nester"
    
    Write-Info "Test GET /api/status..."
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/status" -Method Get
    
    Write-Success "API fonctionnelle!"
    Write-Host ""
    Write-Host "Version: $($response.version)"
    Write-Host "Status: $($response.status)"
    Write-Host "Franchises totales: $($response.statistics.total_probes)"
    Write-Host "Franchises connectées: $($response.statistics.connected_probes)"
    Write-Host ""
}

# Fonction 9: Générer clé secrète
function Generate-SecretKey {
    Write-Header "Génération de clé secrète"
    
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $key = [System.BitConverter]::ToString($bytes) -replace '-', ''
    
    Write-Success "Clé secrète générée:"
    Write-Host ""
    Write-Host $key -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Ajoutez cette clé dans le fichier .env:"
    Write-Host "SECRET_KEY=$key" -ForegroundColor Cyan
    Write-Host ""
}

# Boucle principale
do {
    Show-Menu
    $choice = Read-Host "Choisissez une option"
    
    switch ($choice) {
        "1" { Install-HarvesterDependencies; Pause }
        "2" { Install-NesterDependencies; Pause }
        "3" { Start-Harvester; Pause }
        "4" { Start-HarvesterDashboard; Pause }
        "5" { Start-Nester; Pause }
        "6" { Stop-Nester; Pause }
        "7" { Show-NesterLogs; Pause }
        "8" { Test-NesterAPI; Pause }
        "9" { Generate-SecretKey; Pause }
        "0" { 
            Write-Success "Au revoir!"
            break
        }
        default { 
            Write-Error "Option invalide"
            Pause
        }
    }
} while ($choice -ne "0")
