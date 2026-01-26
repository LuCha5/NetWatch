#!/usr/bin/env python3
"""
Seahawks Nester - Application de supervision centralisée
Version: 1.0.0
Description: Supervision centralisée des 32 franchises
"""

from flask import Flask, render_template, jsonify, request, send_file
from datetime import datetime, timedelta
from pathlib import Path
import json
import logging
import os


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')


class NesterManager:
    """Gestionnaire de la supervision centralisée"""
    
    VERSION = "1.0.0"
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        self.probes_dir = self.data_dir / "probes"
        self.probes_dir.mkdir(exist_ok=True)
        
        self.reports_dir = self.data_dir / "reports"
        self.reports_dir.mkdir(exist_ok=True)
        
        self.logs_dir = self.data_dir / "probe_logs"
        self.logs_dir.mkdir(exist_ok=True)
        
        self._setup_logging()
        self.logger.info(f"Seahawks Nester v{self.VERSION} démarré")
    
    def _setup_logging(self):
        """Configure le système de logging"""
        log_dir = self.data_dir / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"nester_{datetime.now().strftime('%Y%m%d')}.log"
        
        self.logger = logging.getLogger('SeahawksNester')
        self.logger.setLevel(logging.INFO)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"module": "%(name)s", "message": "%(message)s"}'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def register_probe(self, franchise_id: str, franchise_name: str):
        """Enregistre ou met à jour une sonde"""
        probe_file = self.probes_dir / f"{franchise_id}.json"
        
        probe_data = {
            "franchise_id": franchise_id,
            "franchise_name": franchise_name,
            "registered_at": datetime.now().isoformat(),
            "last_seen": datetime.now().isoformat(),
            "status": "connected"
        }
        
        if probe_file.exists():
            with open(probe_file, 'r') as f:
                existing_data = json.load(f)
                probe_data['registered_at'] = existing_data.get('registered_at')
        
        with open(probe_file, 'w') as f:
            json.dump(probe_data, f, indent=2)
        
        self.logger.info(f"Sonde enregistrée: {franchise_id} - {franchise_name}")
        return probe_data
    
    def update_probe_heartbeat(self, franchise_id: str):
        """Met à jour le heartbeat d'une sonde"""
        probe_file = self.probes_dir / f"{franchise_id}.json"
        
        if not probe_file.exists():
            return None
        
        with open(probe_file, 'r') as f:
            probe_data = json.load(f)
        
        probe_data['last_seen'] = datetime.now().isoformat()
        probe_data['status'] = 'connected'
        
        with open(probe_file, 'w') as f:
            json.dump(probe_data, f, indent=2)
        
        return probe_data
    
    def get_all_probes(self):
        """Récupère toutes les sondes enregistrées"""
        probes = []
        
        for probe_file in self.probes_dir.glob("*.json"):
            with open(probe_file, 'r') as f:
                probe_data = json.load(f)
                
                # Vérifier si la sonde est connectée (heartbeat < 5 minutes)
                last_seen = datetime.fromisoformat(probe_data['last_seen'])
                time_diff = (datetime.now() - last_seen).total_seconds()
                
                if time_diff > 300:  # 5 minutes
                    probe_data['status'] = 'disconnected'
                else:
                    probe_data['status'] = 'connected'
                
                probe_data['last_seen_ago_seconds'] = int(time_diff)
                
                # Récupérer le dernier rapport
                report_file = self.reports_dir / f"{probe_data['franchise_id']}_latest.json"
                if report_file.exists():
                    with open(report_file, 'r') as rf:
                        report = json.load(rf)
                        probe_data['last_report'] = {
                            'timestamp': report.get('timestamp'),
                            'summary': report.get('summary', {}),
                            'wan_latency_ms': report.get('wan_latency_ms'),
                            'scan_duration_seconds': report.get('scan_duration_seconds'),
                            'hosts': report.get('hosts', [])
                        }
                
                probes.append(probe_data)
        
        return sorted(probes, key=lambda x: x['franchise_name'])
    
    def get_probe(self, franchise_id: str):
        """Récupère les informations d'une sonde spécifique"""
        probe_file = self.probes_dir / f"{franchise_id}.json"
        
        if not probe_file.exists():
            return None
        
        with open(probe_file, 'r') as f:
            probe_data = json.load(f)
        
        # Statut de connexion
        last_seen = datetime.fromisoformat(probe_data['last_seen'])
        time_diff = (datetime.now() - last_seen).total_seconds()
        
        if time_diff > 300:
            probe_data['status'] = 'disconnected'
        else:
            probe_data['status'] = 'connected'
        
        probe_data['last_seen_ago_seconds'] = int(time_diff)
        
        return probe_data
    
    def save_report(self, franchise_id: str, report_data: dict):
        """Sauvegarde un rapport de scan"""
        # Rapport avec timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = self.reports_dir / f"{franchise_id}_{timestamp}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        # Dernier rapport
        latest_file = self.reports_dir / f"{franchise_id}_latest.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Rapport sauvegardé pour {franchise_id}")
        
        # Mettre à jour le heartbeat
        self.update_probe_heartbeat(franchise_id)
    
    def get_report(self, franchise_id: str):
        """Récupère le dernier rapport d'une franchise"""
        report_file = self.reports_dir / f"{franchise_id}_latest.json"
        
        if not report_file.exists():
            return None
        
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def get_statistics(self):
        """Calcule les statistiques globales"""
        probes = self.get_all_probes()
        
        stats = {
            "total_probes": len(probes),
            "connected_probes": sum(1 for p in probes if p['status'] == 'connected'),
            "disconnected_probes": sum(1 for p in probes if p['status'] == 'disconnected'),
            "total_equipment": 0,
            "average_wan_latency": 0
        }
        
        latencies = []
        for probe in probes:
            if 'last_report' in probe:
                stats['total_equipment'] += probe['last_report'].get('hosts_up', 0)
                if probe['last_report'].get('wan_latency_ms'):
                    latencies.append(probe['last_report']['wan_latency_ms'])
        
        if latencies:
            stats['average_wan_latency'] = round(sum(latencies) / len(latencies), 2)
        
        return stats
    
    def save_probe_logs(self, franchise_id: str, log_data: dict):
        """Sauvegarde les logs d'une sonde"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_file = self.logs_dir / f"{franchise_id}_{timestamp}.log"
        
        # Sauvegarder les logs
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(log_data.get('lines', ''))
        
        # Sauvegarder les métadonnées
        metadata_file = self.logs_dir / f"{franchise_id}_latest.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': log_data.get('timestamp'),
                'total_lines': log_data.get('total_lines'),
                'sent_lines': log_data.get('sent_lines'),
                'log_file': str(log_file.name)
            }, f, indent=2)
        
        self.logger.info(f"Logs sauvegardés pour {franchise_id} ({log_data.get('sent_lines')} lignes)")
    
    def get_probe_logs(self, franchise_id: str):
        """Récupère les logs d'une sonde"""
        metadata_file = self.logs_dir / f"{franchise_id}_latest.json"
        
        if not metadata_file.exists():
            return None
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        log_file = self.logs_dir / metadata['log_file']
        if log_file.exists():
            with open(log_file, 'r', encoding='utf-8') as f:
                metadata['content'] = f.read()
        
        return metadata


# Instance globale du gestionnaire
nester = NesterManager()


# Routes web
@app.route('/')
def index():
    """Page d'accueil du Nester"""
    return render_template('nester_dashboard.html')


@app.route('/probe/<franchise_id>')
def probe_detail(franchise_id):
    """Page de détail d'une sonde"""
    return render_template('probe_detail.html', franchise_id=franchise_id)


# API REST
@app.route('/api/status')
def api_status():
    """API: Statut général du Nester"""
    return jsonify({
        "version": NesterManager.VERSION,
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "statistics": nester.get_statistics()
    })


@app.route('/api/probes')
def api_probes():
    """API: Liste de toutes les sondes"""
    probes = nester.get_all_probes()
    return jsonify(probes)


@app.route('/api/statistics')
def api_statistics():
    """API: Statistiques globales"""
    stats = nester.get_statistics()
    return jsonify(stats)


@app.route('/api/probe/<franchise_id>')
def api_probe(franchise_id):
    """API: Détail d'une sonde"""
    probe = nester.get_probe(franchise_id)
    
    if probe:
        return jsonify(probe)
    
    return jsonify({"error": "Probe not found"}), 404


@app.route('/api/probe/<franchise_id>/report')
def api_probe_report(franchise_id):
    """API: Dernier rapport d'une sonde"""
    report = nester.get_report(franchise_id)
    
    if report:
        return jsonify(report)
    
    return jsonify({"error": "No report available"}), 404


@app.route('/api/probe/register', methods=['POST'])
def api_register_probe():
    """API: Enregistrement d'une nouvelle sonde"""
    data = request.get_json()
    
    if not data or 'franchise_id' not in data or 'franchise_name' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    probe = nester.register_probe(data['franchise_id'], data['franchise_name'])
    return jsonify(probe), 201


@app.route('/api/probe/<franchise_id>/heartbeat', methods=['POST'])
def api_heartbeat(franchise_id):
    """API: Heartbeat d'une sonde"""
    probe = nester.update_probe_heartbeat(franchise_id)
    
    if probe:
        return jsonify(probe)
    
    return jsonify({"error": "Probe not found"}), 404


@app.route('/api/probe/<franchise_id>/report', methods=['POST'])
def api_upload_report(franchise_id):
    """API: Upload d'un rapport de scan"""
    report_data = request.get_json()
    
    if not report_data:
        return jsonify({"error": "Invalid report data"}), 400
    
    nester.save_report(franchise_id, report_data)
    return jsonify({"success": True, "message": "Report saved"}), 201


@app.route('/api/probe/<franchise_id>/logs', methods=['POST'])
def api_upload_logs(franchise_id):
    """API: Upload des logs d'une sonde"""
    log_data = request.get_json()
    
    if not log_data:
        return jsonify({"error": "Invalid log data"}), 400
    
    nester.save_probe_logs(franchise_id, log_data)
    return jsonify({"success": True, "message": "Logs saved"}), 201


@app.route('/api/probe/<franchise_id>/logs')
def api_get_logs(franchise_id):
    """API: Récupération des logs d'une sonde"""
    logs = nester.get_probe_logs(franchise_id)
    
    if logs:
        return jsonify(logs)
    
    return jsonify({"error": "No logs available"}), 404


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  🏈 Seahawks Nester - Supervision Centralisée")
    print("  Version:", NesterManager.VERSION)
    print("="*60)
    print("\n📊 Dashboard accessible sur: http://0.0.0.0:8080")
    print("📡 API REST disponible sur: http://0.0.0.0:8080/api")
    print("\n🔒 Mode production: Définir SECRET_KEY dans l'environnement\n")
    
    app.run(host='0.0.0.0', port=8080, debug=True)
