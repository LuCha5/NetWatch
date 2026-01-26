#!/usr/bin/env python3
"""
Script d'intégration Harvester → Nester
Upload automatique des rapports de scan vers le serveur central
"""

import json
import requests
from pathlib import Path
from datetime import datetime
import logging


class NesterUploader:
    """Gestionnaire d'upload vers le Nester"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.nester_url = self.config.get("nester_url", "http://localhost:8000")
        self.franchise_id = self.config.get("franchise_id")
        
        self._setup_logging()
    
    def _load_config(self, config_path: str):
        """Charge la configuration"""
        with open(config_path, 'r') as f:
            return json.load(f)
    
    def _setup_logging(self):
        """Configure le logging"""
        self.logger = logging.getLogger('NesterUploader')
        self.logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def register_probe(self):
        """Enregistre la sonde auprès du Nester"""
        try:
            url = f"{self.nester_url}/api/probe/register"
            data = {
                "franchise_id": self.config.get("franchise_id"),
                "franchise_name": self.config.get("franchise_name")
            }
            
            response = requests.post(url, json=data, timeout=10)
            
            if response.status_code in [200, 201]:
                self.logger.info(f"Sonde enregistrée avec succès: {self.franchise_id}")
                return True
            else:
                self.logger.error(f"Erreur enregistrement sonde: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Erreur lors de l'enregistrement: {str(e)}")
            return False
    
    def send_heartbeat(self):
        """Envoie un heartbeat au Nester"""
        try:
            url = f"{self.nester_url}/api/probe/{self.franchise_id}/heartbeat"
            response = requests.post(url, timeout=10)
            
            if response.status_code == 200:
                self.logger.info("Heartbeat envoyé avec succès")
                return True
            else:
                self.logger.warning(f"Erreur heartbeat: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Erreur lors du heartbeat: {str(e)}")
            return False
    
    def upload_report(self, report_path: str):
        """Upload un rapport de scan vers le Nester"""
        try:
            with open(report_path, 'r', encoding='utf-8') as f:
                report_data = json.load(f)
            
            url = f"{self.nester_url}/api/probe/{self.franchise_id}/report"
            response = requests.post(url, json=report_data, timeout=30)
            
            if response.status_code == 201:
                self.logger.info(f"Rapport uploadé avec succès: {report_path}")
                return True
            else:
                self.logger.error(f"Erreur upload rapport: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Erreur lors de l'upload: {str(e)}")
            return False
    
    def sync_latest_report(self):
        """Synchronise le dernier rapport avec le Nester"""
        report_dir = Path(self.config.get("report_dir", "reports"))
        latest_report = report_dir / "latest_report.json"
        
        if not latest_report.exists():
            self.logger.warning("Aucun rapport à synchroniser")
            return False
        
        return self.upload_report(str(latest_report))
    
    def sync_logs(self, max_lines: int = 500):
        """Upload les logs récents vers le Nester"""
        try:
            log_file = Path("logs/harvester_service.log")
            
            if not log_file.exists():
                self.logger.warning("Fichier de logs introuvable")
                return False
            
            # Lire les dernières lignes
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                recent_logs = lines[-max_lines:] if len(lines) > max_lines else lines
            
            # Préparer les données
            log_data = {
                'timestamp': datetime.now().isoformat(),
                'lines': ''.join(recent_logs),
                'total_lines': len(lines),
                'sent_lines': len(recent_logs)
            }
            
            url = f"{self.nester_url}/api/probe/{self.franchise_id}/logs"
            response = requests.post(url, json=log_data, timeout=30)
            
            if response.status_code in [200, 201]:
                self.logger.info(f"Logs uploadés avec succès ({len(recent_logs)} lignes)")
                return True
            else:
                self.logger.error(f"Erreur upload logs: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Erreur lors de l'upload des logs: {str(e)}")
            return False


def main():
    """Point d'entrée principal"""
    print("\n🔗 Seahawks Harvester → Nester Integration")
    print("="*60)
    
    uploader = NesterUploader()
    
    # Enregistrement de la sonde
    print("\n1. Enregistrement de la sonde...")
    if uploader.register_probe():
        print("   ✅ Sonde enregistrée")
    else:
        print("   ❌ Échec de l'enregistrement")
        return
    
    # Envoi du heartbeat
    print("\n2. Envoi du heartbeat...")
    if uploader.send_heartbeat():
        print("   ✅ Heartbeat envoyé")
    else:
        print("   ⚠️  Heartbeat échoué")
    
    # Synchronisation du dernier rapport
    print("\n3. Synchronisation du dernier rapport...")
    if uploader.sync_latest_report():
        print("   ✅ Rapport synchronisé")
    else:
        print("   ⚠️  Aucun rapport à synchroniser")
    
    print("\n✅ Intégration terminée\n")


if __name__ == "__main__":
    main()
