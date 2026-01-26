#!/usr/bin/env python3
"""
Seahawks Harvester - Agent de scan réseau pour les franchises
Version: 1.0.0
Description: Scan réseau autonome pour détection d'équipements et mesure de latence
"""

import json
import logging
import os
import socket
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

import nmap


class SeahawksHarvester:
    """Agent de scan réseau pour supervision de franchises"""
    
    VERSION = "1.0.0"
    
    def __init__(self, config_path: str = "config.json"):
        """Initialise le Harvester avec la configuration"""
        self.config = self._load_config(config_path)
        self.scan_results = []
        self.report_dir = Path(self.config.get("report_dir", "reports"))
        self.report_dir.mkdir(exist_ok=True)
        
        # Configuration du logger
        self._setup_logging()
        self.logger.info(f"Seahawks Harvester v{self.VERSION} démarré")
        
        # Initialisation du scanner nmap
        self.nm = nmap.PortScanner()
    
    def _load_config(self, config_path: str) -> Dict:
        """Charge la configuration depuis un fichier JSON"""
        if not os.path.exists(config_path):
            # Configuration par défaut
            default_config = {
                "franchise_id": "franchise_01",
                "franchise_name": "Seattle Seahawks",
                "scan_network": "192.168.1.0/24",
                "scan_ports": "22,80,443,3389,8080",
                "wan_test_host": "8.8.8.8",
                "report_dir": "reports",
                "log_dir": "logs",
                "scan_interval": 3600
            }
            # Sauvegarder la config par défaut
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            return default_config
        
        with open(config_path, 'r') as f:
            return json.load(f)
    
    def _setup_logging(self):
        """Configure le système de logging en format JSON"""
        log_dir = Path(self.config.get("log_dir", "logs"))
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"harvester_{datetime.now().strftime('%Y%m%d')}.log"
        
        # Configuration du logger
        self.logger = logging.getLogger('SeahawksHarvester')
        self.logger.setLevel(logging.INFO)
        
        # Handler pour fichier
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Handler pour console
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter JSON
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"module": "%(name)s", "message": "%(message)s"}'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def measure_wan_latency(self, host: str = None, ping_count: int = 4) -> Optional[float]:
        """
        Mesure la latence WAN vers un hôte de test avec plusieurs pings ICMP
        
        Args:
            host: Hôte de test (défaut: 8.8.8.8)
            ping_count: Nombre de pings pour la moyenne (défaut: 4)
        
        Returns:
            Latence moyenne en ms, ou None en cas d'erreur
        """
        if host is None:
            host = self.config.get("wan_test_host", "8.8.8.8")
        
        try:
            # Utiliser ping ICMP via subprocess
            import subprocess
            import platform
            
            # Adapter la commande selon l'OS
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            command = ['ping', param, str(ping_count), host]
            
            # Exécuter ping
            result = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=ping_count * 2 + 5,
                text=True
            )
            
            if result.returncode != 0:
                self.logger.error(f"Ping échoué vers {host}")
                return None
            
            # Parser les résultats pour extraire les latences
            import re
            latencies = []
            
            # Regex pour extraire les temps (format: time=XX.X ms)
            for match in re.finditer(r'time[=<](\d+\.?\d*)\s*ms', result.stdout):
                latencies.append(float(match.group(1)))
            
            if not latencies:
                self.logger.error(f"Impossible d'extraire les latences pour {host}")
                return None
            
            # Calculer les statistiques
            avg_latency = sum(latencies) / len(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            
            self.logger.info(
                f"Latence WAN vers {host}: {len(latencies)}/{ping_count} pings réussis | "
                f"Moyenne: {avg_latency:.2f}ms | Min: {min_latency:.2f}ms | Max: {max_latency:.2f}ms"
            )
            
            return round(avg_latency, 2)
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la mesure de latence vers {host}: {e}")
            return None
    
    def scan_network(self) -> Dict:
        """Effectue un scan complet du réseau local"""
        network = self.config.get("scan_network", "192.168.1.0/24")
        ports = self.config.get("scan_ports", "22,80,443,3389,8080")
        
        self.logger.info(f"Démarrage scan réseau: {network} ports: {ports}")
        
        scan_start = datetime.now()
        results = {
            "scan_id": f"scan_{scan_start.strftime('%Y%m%d_%H%M%S')}",
            "franchise_id": self.config.get("franchise_id"),
            "franchise_name": self.config.get("franchise_name"),
            "timestamp": scan_start.isoformat(),
            "harvester_version": self.VERSION,
            "network": network,
            "hosts": [],
            "summary": {
                "total_hosts": 0,
                "hosts_up": 0,
                "hosts_down": 0,
                "total_ports_open": 0
            }
        }
        
        try:
            # Scan du réseau
            self.nm.scan(hosts=network, arguments=f'-p {ports} -sV --max-retries 2 --host-timeout 30s')
            
            for host in self.nm.all_hosts():
                host_info = {
                    "ip": host,
                    "hostname": self.nm[host].hostname() or "Unknown",
                    "state": self.nm[host].state(),
                    "mac_address": self.nm[host].get('addresses', {}).get('mac', 'Unknown'),
                    "vendor": self.nm[host].get('vendor', {}).get(
                        self.nm[host].get('addresses', {}).get('mac', ''), 'Unknown'
                    ),
                    "os": self._extract_os_info(host),
                    "ports": []
                }
                
                # Ports ouverts
                if 'tcp' in self.nm[host]:
                    for port in self.nm[host]['tcp'].keys():
                        port_info = self.nm[host]['tcp'][port]
                        host_info['ports'].append({
                            "port": port,
                            "state": port_info['state'],
                            "service": port_info.get('name', 'unknown'),
                            "version": port_info.get('version', ''),
                            "product": port_info.get('product', '')
                        })
                        
                        if port_info['state'] == 'open':
                            results['summary']['total_ports_open'] += 1
                
                results['hosts'].append(host_info)
                results['summary']['total_hosts'] += 1
                
                if host_info['state'] == 'up':
                    results['summary']['hosts_up'] += 1
                else:
                    results['summary']['hosts_down'] += 1
            
            # Mesure latence WAN
            wan_latency = self.measure_wan_latency()
            results['wan_latency_ms'] = wan_latency
            
            scan_duration = (datetime.now() - scan_start).total_seconds()
            results['scan_duration_seconds'] = round(scan_duration, 2)
            
            self.logger.info(
                f"Scan terminé: {results['summary']['hosts_up']} hôtes actifs, "
                f"{results['summary']['total_ports_open']} ports ouverts"
            )
            
            # Sauvegarde du rapport
            self._save_report(results)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Erreur lors du scan réseau: {str(e)}")
            results['error'] = str(e)
            return results
    
    def _extract_os_info(self, host: str) -> Dict:
        """Extrait les informations OS détectées"""
        os_info = {
            "name": "Unknown",
            "accuracy": 0
        }
        
        if 'osmatch' in self.nm[host] and len(self.nm[host]['osmatch']) > 0:
            best_match = self.nm[host]['osmatch'][0]
            os_info['name'] = best_match.get('name', 'Unknown')
            os_info['accuracy'] = int(best_match.get('accuracy', 0))
        
        return os_info
    
    def _save_report(self, results: Dict):
        """Sauvegarde le rapport de scan"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = self.report_dir / f"scan_report_{timestamp}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Lien symbolique vers le dernier rapport
        latest_report = self.report_dir / "latest_report.json"
        if latest_report.exists():
            latest_report.unlink()
        
        # Copier le contenu du dernier rapport
        with open(latest_report, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Rapport sauvegardé: {report_file}")
    
    def get_last_report(self) -> Optional[Dict]:
        """Récupère le dernier rapport de scan"""
        latest_report = self.report_dir / "latest_report.json"
        
        if latest_report.exists():
            with open(latest_report, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def get_status(self) -> Dict:
        """Retourne le statut actuel du Harvester"""
        last_report = self.get_last_report()
        
        status = {
            "harvester_version": self.VERSION,
            "franchise_id": self.config.get("franchise_id"),
            "franchise_name": self.config.get("franchise_name"),
            "last_scan": None,
            "equipment_count": 0,
            "status": "ready"
        }
        
        if last_report:
            status['last_scan'] = last_report.get('timestamp')
            status['equipment_count'] = last_report['summary']['hosts_up']
            status['wan_latency_ms'] = last_report.get('wan_latency_ms')
        
        return status


def main():
    """Point d'entrée principal"""
    harvester = SeahawksHarvester()
    
    print(f"\n{'='*60}")
    print(f"  Seahawks Harvester v{harvester.VERSION}")
    print(f"  Franchise: {harvester.config.get('franchise_name')}")
    print(f"{'='*60}\n")
    
    # Démarrage du scan
    print("🔍 Démarrage du scan réseau...")
    results = harvester.scan_network()
    
    # Affichage des résultats
    print(f"\n✅ Scan terminé en {results.get('scan_duration_seconds', 0)}s")
    print(f"\n📊 Résumé:")
    print(f"  - Hôtes actifs: {results['summary']['hosts_up']}")
    print(f"  - Hôtes inactifs: {results['summary']['hosts_down']}")
    print(f"  - Ports ouverts: {results['summary']['total_ports_open']}")
    print(f"  - Latence WAN: {results.get('wan_latency_ms', 'N/A')}ms")
    
    print(f"\n📁 Rapport sauvegardé dans: {harvester.report_dir}")
    print("\n💡 Utilisez dashboard.py pour voir l'interface web\n")


if __name__ == "__main__":
    main()
