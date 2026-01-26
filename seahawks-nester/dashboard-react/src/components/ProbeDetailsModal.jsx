import { useState, useEffect } from 'react'
import { X, Activity, Server, Clock, Wifi, FileText, TrendingUp } from 'lucide-react'
import axios from 'axios'

function ProbeDetailsModal({ probe, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [logs, setLogs] = useState(null)
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    if (activeTab === 'logs' && !logs) {
      loadLogs()
    }
  }, [activeTab])

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await axios.get(`/api/probe/${probe.franchise_id}/logs`)
      setLogs(response.data)
    } catch (error) {
      console.error('Erreur chargement logs:', error)
      setLogs({ error: 'Logs non disponibles' })
    } finally {
      setLoadingLogs(false)
    }
  }

  if (!probe) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-seahawks-blue to-seahawks-green p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{probe.franchise_name}</h2>
              <p className="text-seahawks-blue-light">ID: {probe.franchise_id}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-seahawks-blue text-seahawks-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'equipment'
                  ? 'border-seahawks-blue text-seahawks-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Server className="w-4 h-4 inline mr-2" />
              Équipements
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'logs'
                  ? 'border-seahawks-blue text-seahawks-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Logs système
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Wifi className="w-4 h-4 mr-2" />
                    Statut
                  </div>
                  <p className={`text-xl font-bold ${
                    probe.status === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {probe.status === 'connected' ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Server className="w-4 h-4 mr-2" />
                    Équipements
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {probe.last_report?.summary?.hosts_up || 0}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Activity className="w-4 h-4 mr-2" />
                    Ports ouverts
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {probe.last_report?.summary?.total_ports_open || 0}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Latence WAN
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {probe.last_report?.wan_latency_ms 
                      ? `${probe.last_report.wan_latency_ms}ms` 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Informations temporelles</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enregistrée le:</span>
                    <span className="font-medium">{new Date(probe.registered_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernier contact:</span>
                    <span className="font-medium">{new Date(probe.last_seen).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernier scan:</span>
                    <span className="font-medium">
                      {probe.last_report?.timestamp 
                        ? new Date(probe.last_report.timestamp).toLocaleString('fr-FR')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4">
              {probe.last_report?.hosts && probe.last_report.hosts.length > 0 ? (
                probe.last_report.hosts.map((host, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-seahawks-blue transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{host.ip}</h4>
                      <span className={`badge ${host.state === 'up' ? 'badge-success' : 'badge-danger'}`}>
                        {host.state}
                      </span>
                    </div>
                    {host.hostname && (
                      <p className="text-sm text-gray-600 mb-2">Hostname: {host.hostname}</p>
                    )}
                    {host.ports && host.ports.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Ports ouverts:</p>
                        <div className="flex flex-wrap gap-2">
                          {host.ports.map((port, pidx) => (
                            <span key={pidx} className="badge badge-info">
                              {port.port}/{port.protocol} - {port.service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun équipement détecté</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              {loadingLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seahawks-blue mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des logs...</p>
                </div>
              ) : logs?.error ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{logs.error}</p>
                </div>
              ) : logs ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Dernière mise à jour: {new Date(logs.timestamp).toLocaleString('fr-FR')}</span>
                    <span>{logs.sent_lines} lignes (sur {logs.total_lines})</span>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{logs.content}</pre>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProbeDetailsModal
