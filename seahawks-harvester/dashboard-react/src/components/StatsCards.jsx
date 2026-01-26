import { Server, Activity, Wifi, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

function StatsCards({ report, status }) {
  const stats = [
    {
      icon: Server,
      label: 'Hôtes actifs',
      value: report?.summary?.hosts_up || 0,
      total: report?.summary?.total_hosts || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+2 vs dernier scan'
    },
    {
      icon: Activity,
      label: 'Ports ouverts',
      value: report?.summary?.total_ports_open || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'Stable'
    },
    {
      icon: Wifi,
      label: 'Latence WAN',
      value: report?.wan_latency_ms ? `${report.wan_latency_ms}ms` : 'N/A',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: report?.wan_latency_ms ? 'Excellente' : 'Non mesurée'
    },
    {
      icon: Clock,
      label: 'Durée scan',
      value: report?.scan_duration_seconds ? `${report.scan_duration_seconds.toFixed(1)}s` : 'N/A',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'Rapide'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.total && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">sur {stat.total}</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
