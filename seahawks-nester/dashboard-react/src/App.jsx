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
  Globe,
  Search,
  Filter
} from 'lucide-react'
import ProbesList from './components/ProbesList'
import StatsCards from './components/StatsCards'
import GlobalChart from './components/GlobalChart'

function App() {
  const [probes, setProbes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState('all') // all, connected, disconnected
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [probesRes, statsRes] = await Promise.all([
        axios.get('/api/probes'),
        axios.get('/api/statistics')
      ])
      
      setProbes(probesRes.data)
      setStats(statsRes.data)
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

  // Filtrage des sondes
  const filteredProbes = probes.filter(probe => {
    // Filtre par état
    if (filter === 'connected' && probe.status !== 'connected') return false
    if (filter === 'disconnected' && probe.status === 'connected') return false
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        probe.franchise_name?.toLowerCase().includes(search) ||
        probe.franchise_id?.toLowerCase().includes(search)
      )
    }
    
    return true
  })

  if (loading && probes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-seahawks-green animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Chargement du système de supervision...</p>
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
                  <Globe className="w-8 h-8 text-seahawks-green" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Seahawks Nester
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Supervision Centralisée - 32 Franchises NFL
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
        {stats && <StatsCards stats={stats} probes={probes} />}

        {/* Global Chart */}
        {probes.length > 0 && (
          <div className="mb-8">
            <GlobalChart probes={probes} stats={stats} />
          </div>
        )}

        {/* Filters and Search */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filtres:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-seahawks-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes ({probes.length})
                </button>
                <button
                  onClick={() => setFilter('connected')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'connected'
                      ? 'bg-seahawks-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✅ Connectées ({probes.filter(p => p.status === 'connected').length})
                </button>
                <button
                  onClick={() => setFilter('disconnected')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'disconnected'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ❌ Déconnectées ({probes.filter(p => p.status !== 'connected').length})
                </button>
              </div>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une franchise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seahawks-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Probes List */}
        {filteredProbes.length > 0 ? (
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <Server className="w-6 h-6 text-seahawks-blue" />
              <h2 className="text-2xl font-bold text-gray-900">
                Franchises NFL
              </h2>
              <span className="badge badge-info">
                {filteredProbes.length} sonde{filteredProbes.length > 1 ? 's' : ''}
              </span>
            </div>
            <ProbesList probes={filteredProbes} />
          </div>
        ) : (
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune franchise ne correspond aux critères</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-white text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Seahawks Nester v1.0.0</span>
              <span className="mx-2">•</span>
              <Activity className="w-4 h-4" />
              <span>Supervision temps réel 32 franchises</span>
              <span className="mx-2">•</span>
              <span>Datacenter Roubaix</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
