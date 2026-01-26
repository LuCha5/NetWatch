#!/usr/bin/env python3
"""
Script pour lancer le Harvester avec intégration Nester
"""
import time
import subprocess
import json
import logging
import psutil
from datetime import datetime
from pathlib import Path
from nester_integration import NesterUploader

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/harvester_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_system_metrics():
    """Collecte les métriques système"""
    try:
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur collecte métriques: {e}")
        return None

def main():
    logger.info("=" * 60)
    logger.info("Démarrage du service Seahawks Harvester")
    logger.info("=" * 60)
    
    # Créer dossier logs
    Path('logs').mkdir(exist_ok=True)
    
    # Charger la config
    with open('config.json', 'r') as f:
        config = json.load(f)
    
    nester_url = config.get('nester_url')
    if not nester_url:
        logger.error("nester_url non configuré dans config.json")
        return
    
    logger.info(f"Connexion au Nester: {nester_url}")
    
    # Créer l'uploader (utilise config.json automatiquement)
    uploader = NesterUploader()
    
    # Enregistrer la sonde
    logger.info("Enregistrement auprès du Nester...")
    if uploader.register_probe():
        logger.info("✅ Enregistrement réussi!")
    else:
        logger.warning("⚠️ Échec de l'enregistrement (le Nester est peut-être hors ligne)")
    
    # Boucle principale
    scan_count = 0
    while True:
        try:
            scan_count += 1
            logger.info(f"\n{'='*60}")
            logger.info(f"SCAN #{scan_count} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"{'='*60}")
            
            # Collecter métriques système
            metrics = get_system_metrics()
            if metrics:
                logger.info(f"💻 Métriques système: CPU {metrics['cpu_percent']}% | RAM {metrics['memory_percent']}% | Disque {metrics['disk_percent']}%")
            
            # Lancer un scan
            logger.info("🔍 Lancement du scan réseau...")
            scan_result = subprocess.run(['python', 'harvester.py'], capture_output=True)
            if scan_result.returncode == 0:
                logger.info("✅ Scan terminé avec succès")
            else:
                logger.error(f"❌ Erreur scan: {scan_result.stderr.decode()}")
            
            # Envoyer heartbeat
            logger.info("💓 Envoi heartbeat...")
            uploader.send_heartbeat()
            
            # Uploader le dernier rapport
            logger.info("📤 Upload du rapport...")
            if uploader.sync_latest_report():
                logger.info("✅ Rapport envoyé au Nester")
            else:
                logger.warning("⚠️ Échec de l'upload (mode autonome)")
            
            # Uploader les logs vers le Nester
            logger.info("📋 Upload des logs...")
            if uploader.sync_logs():
                logger.info("✅ Logs envoyés au Nester")
            else:
                logger.warning("⚠️ Échec upload logs")
            
            # Attendre avant le prochain scan
            interval = config.get('scan_interval', 3600)
            logger.info(f"⏳ Prochain scan dans {interval}s...")
            time.sleep(interval)
            
        except KeyboardInterrupt:
            logger.info("\n👋 Arrêt du Harvester demandé")
            break
        except Exception as e:
            logger.error(f"❌ Erreur: {e}", exc_info=True)
            time.sleep(60)

if __name__ == '__main__':
    main()
