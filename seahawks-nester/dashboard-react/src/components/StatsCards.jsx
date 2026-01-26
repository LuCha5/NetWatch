import { Server, Activity, Wifi, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

function StatsCards({ stats, probes }) {
  const connectedCount = probes.filter(p => p.status === 'connected').length
  const disconnectedCount = probes.length - connectedCount
  
  const cards = [
    {
      icon: Server,
      label: 'Sondes totales',
      value: probes.length,
      subtitle: 'Franchises NFL',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '32 franchises'
    },
    {
      icon: CheckCircle,
      label: 'Connectées',
      value: connectedCount,
      subtitle: `${Math.round((connectedCount / probes.length) * 100)}% actives`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'En ligne'
    },
    {
      icon: XCircle,
      label: 'Déconnectées',
      value: disconnectedCount,
      subtitle: 'Nécessitent attention',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: disconnectedCount > 0 ? 'Action requise' : 'Tout va bien'
    },
    {
      icon: Activity,
      label: 'Équipements',
      value: stats?.total_hosts || 0,
      subtitle: 'Total détectés',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: `${stats?.total_ports_open || 0} ports ouverts`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {card.subtitle && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">{card.subtitle}</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {card.value}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {card.trend}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
