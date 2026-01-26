import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { BarChart3 } from 'lucide-react'

function NetworkChart({ hosts }) {
  // Données pour le graphique des états
  const stateData = [
    { 
      name: 'En ligne', 
      value: hosts.filter(h => h.state === 'up').length,
      color: '#22c55e'
    },
    { 
      name: 'Hors ligne', 
      value: hosts.filter(h => h.state === 'down').length,
      color: '#ef4444'
    }
  ]

  // Données pour le graphique des ports
  const openPorts = hosts.reduce((sum, host) => 
    sum + (host.ports?.filter(p => p.state === 'open').length || 0), 0
  )
  const closedPorts = hosts.reduce((sum, host) => 
    sum + (host.ports?.filter(p => p.state === 'closed').length || 0), 0
  )

  const portsData = [
    { name: 'Ports ouverts', value: openPorts, color: '#3b82f6' },
    { name: 'Ports fermés', value: closedPorts, color: '#9ca3af' }
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            {payload[0].value} ({((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%)
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
          Analyse du réseau
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* État des hôtes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            État des équipements
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* État des ports */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Analyse des ports
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={portsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {portsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default NetworkChart
