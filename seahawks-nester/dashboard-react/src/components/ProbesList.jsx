import { useState } from 'react'
import { 
  MapPin, 
  Wifi, 
  Activity, 
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Server,
  BarChart3
} from 'lucide-react'
import ProbeDetailsModal from './ProbeDetailsModal'

function ProbesList({ probes }) {
  const [selectedProbe, setSelectedProbe] = useState(null)

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Jamais'
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (seconds < 60) return `Il y a ${seconds}s`
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
    return `Il y a ${Math.floor(seconds / 86400)}j`
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {probes.map((probe) => (
        <div 
          key={probe.franchise_id}
          className={`probe-card ${
            probe.status === 'connected' 
              ? 'probe-card-connected' 
              : 'probe-card-disconnected'
          }`}
          onClick={() => setSelectedProbe(probe)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {probe.franchise_name || probe.franchise_id}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {probe.franchise_id}
              </p>
            </div>
            
            <span className={`badge ${
              probe.status === 'connected' 
                ? 'badge-success' 
                : 'badge-danger'
            }`}>
              {probe.status === 'connected' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  En ligne
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Hors ligne
                </>
              )}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Server className="w-3 h-3 mr-1" />
                Équipements
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {probe.last_report?.summary?.hosts_up || 0}
              </p>
            </div>
            
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Activity className="w-3 h-3 mr-1" />
                Ports ouverts
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {probe.last_report?.summary?.total_ports_open || 0}
              </p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{getTimeAgo(probe.last_heartbeat || probe.last_contact)}</span>
              </div>
              
              <button className="text-seahawks-blue hover:text-seahawks-green font-medium flex items-center">
                Détails
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Additional Info for Connected */}
          {probe.status === 'connected' && probe.last_report && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Latence WAN</span>
                <span className="font-medium text-gray-900">
                  {probe.last_report.wan_latency_ms 
                    ? `${probe.last_report.wan_latency_ms}ms` 
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Durée scan</span>
                <span className="font-medium text-gray-900">
                  {probe.last_report.scan_duration_seconds 
                    ? `${probe.last_report.scan_duration_seconds.toFixed(1)}s` 
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
      </div>

      {selectedProbe && (
        <ProbeDetailsModal 
          probe={selectedProbe} 
          onClose={() => setSelectedProbe(null)} 
        />
      )}
    </>
  )
}

export default ProbesList
