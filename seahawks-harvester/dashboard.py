#!/usr/bin/env python3
"""
Seahawks Harvester - Dashboard Local
Interface web simple pour visualiser l'état des scans
"""

from flask import Flask, render_template, jsonify
from pathlib import Path
import json
from datetime import datetime


app = Flask(__name__)


def load_latest_report():
    """Charge le dernier rapport de scan"""
    report_file = Path("reports/latest_report.json")
    
    if report_file.exists():
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def load_config():
    """Charge la configuration"""
    config_file = Path("config.json")
    
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


@app.route('/')
def index():
    """Page principale du dashboard"""
    return render_template('dashboard.html')


@app.route('/api/status')
def api_status():
    """API: Retourne le statut actuel"""
    config = load_config()
    report = load_latest_report()
    
    status = {
        "version": "1.0.0",
        "franchise_id": config.get("franchise_id", "Unknown"),
        "franchise_name": config.get("franchise_name", "Unknown"),
        "last_scan": None,
        "equipment_count": 0,
        "status": "offline"
    }
    
    if report:
        status['last_scan'] = report.get('timestamp')
        status['equipment_count'] = report['summary']['hosts_up']
        status['wan_latency_ms'] = report.get('wan_latency_ms')
        status['status'] = 'online'
        
        # Calcul du temps écoulé depuis le dernier scan
        last_scan_dt = datetime.fromisoformat(report.get('timestamp'))
        time_diff = (datetime.now() - last_scan_dt).total_seconds()
        status['last_scan_ago_seconds'] = int(time_diff)
    
    return jsonify(status)


@app.route('/api/report')
def api_report():
    """API: Retourne le dernier rapport complet"""
    report = load_latest_report()
    
    if report:
        return jsonify(report)
    
    return jsonify({"error": "No report available"}), 404


@app.route('/api/hosts')
def api_hosts():
    """API: Liste des hôtes découverts"""
    report = load_latest_report()
    
    if report:
        hosts = []
        for host in report.get('hosts', []):
            hosts.append({
                "ip": host['ip'],
                "hostname": host['hostname'],
                "state": host['state'],
                "mac_address": host['mac_address'],
                "vendor": host['vendor'],
                "os": host['os']['name'],
                "ports_count": len(host['ports'])
            })
        return jsonify(hosts)
    
    return jsonify([])


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  🏈 Seahawks Harvester - Dashboard Local")
    print("="*60)
    print("\n📊 Dashboard accessible sur: http://localhost:5000")
    print("🔄 Actualisation automatique toutes les 30 secondes\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
