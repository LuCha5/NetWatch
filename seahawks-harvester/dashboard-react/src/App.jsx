import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Activity, 
  Server, 
  Wifi, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Network,
  Shield,
  Zap
} from 'lucide-react'
import HostsList from './components/HostsList'
import StatsCards from './components/StatsCards'
import NetworkChart from './components/NetworkChart'

function App() {
  const [status, setStatus] = useState(null)
  const [report, setReport] = useState(null)
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statusRes, reportRes, hostsRes] = await Promise.all([
        axios.get('/api/status'),
        axios.get('/api/report'),
        axios.get('/api/hosts')
      ])
      
      setStatus(statusRes.data)
      setReport(reportRes.data)
      setHosts(hostsRes.data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-seahawks-green animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-seahawks-blue to-seahawks-navy p-3 rounded-xl">
                  <Network className="w-8 h-8 text-seahawks-green" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Seahawks Harvester
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {status?.franchise_name || 'Seattle Seahawks'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    autoRefresh 
                      ? 'bg-seahawks-green text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>
                
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-seahawks-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-seahawks-navy transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>
            
            {lastUpdate && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
              </div>
            )}
          </div>
        </header>

        {/* Statistics Cards */}
        {report && <StatsCards report={report} status={status} />}

        {/* Network Chart */}
        {hosts.length > 0 && (
          <div className="mb-8">
            <NetworkChart hosts={hosts} />
          </div>
        )}

        {/* Hosts List */}
        {hosts.length > 0 && (
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <Server className="w-6 h-6 text-seahawks-blue" />
              <h2 className="text-2xl font-bold text-gray-900">
                Équipements détectés
              </h2>
              <span className="badge badge-info">
                {hosts.length} hôte{hosts.length > 1 ? 's' : ''}
              </span>
            </div>
            <HostsList hosts={hosts} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-white text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Seahawks Harvester v{status?.version || '1.0.0'}</span>
              <span className="mx-2">•</span>
              <Zap className="w-4 h-4" />
              <span>Monitoring temps réel</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
