import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { BarChart3, Activity } from 'lucide-react'

function GlobalChart({ probes, stats }) {
  // Données pour le graphique des états
  const connectedCount = probes.filter(p => p.status === 'connected').length
  const disconnectedCount = probes.length - connectedCount

  const statusData = [
    { 
      name: 'Connectées', 
      value: connectedCount,
      color: '#69BE28'
    },
    { 
      name: 'Déconnectées', 
      value: disconnectedCount,
      color: '#ef4444'
    }
  ]

  // Top 10 franchises par nombre d'équipements
  const topFranchises = probes
    .filter(p => p.last_report?.summary?.hosts_up)
    .sort((a, b) => (b.last_report?.summary?.hosts_up || 0) - (a.last_report?.summary?.hosts_up || 0))
    .slice(0, 10)
    .map(p => ({
      name: p.franchise_name?.split(' ').pop() || p.franchise_id.slice(-2),
      hosts: p.last_report?.summary?.hosts_up || 0,
      ports: p.last_report?.summary?.total_ports_open || 0
    }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            {payload[0].value} ({((payload[0].value / probes.length) * 100).toFixed(0)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-seahawks-blue" />
        <h2 className="text-2xl font-bold text-gray-900">
          Analyse globale du réseau
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* État des sondes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            État des sondes ({probes.length})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top franchises */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Top 10 - Équipements détectés
          </h3>
          {topFranchises.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topFranchises}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hosts" fill="#002244" name="Hôtes actifs" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <Activity className="w-12 h-12 mb-2" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-seahawks-blue">
              {stats?.total_hosts || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Équipements totaux</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-seahawks-green">
              {stats?.total_ports_open || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Ports ouverts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.average_latency_ms 
                ? `${stats.average_latency_ms.toFixed(0)}ms` 
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Latence moyenne</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round((connectedCount / probes.length) * 100)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Disponibilité</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalChart
