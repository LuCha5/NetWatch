import { useState } from 'react'
import { 
  Monitor, 
  Wifi, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react'

function HostsList({ hosts }) {
  const [expandedHost, setExpandedHost] = useState(null)

  const toggleHost = (ip) => {
    setExpandedHost(expandedHost === ip ? null : ip)
  }

  return (
    <div className="space-y-4">
      {hosts.map((host, index) => (
        <div 
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          {/* Host Header */}
          <div 
            className="bg-gradient-to-r from-gray-50 to-white p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleHost(host.ip)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  host.state === 'up' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  <Monitor className={`w-5 h-5 ${
                    host.state === 'up' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {host.hostname || host.ip}
                    </h3>
                    <span className={`badge ${
                      host.state === 'up' 
                        ? 'badge-success' 
                        : 'badge-danger'
                    }`}>
                      {host.state === 'up' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          En ligne
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Hors ligne
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {host.ip}
                    {host.mac_address !== 'Unknown' && (
                      <span className="ml-3 text-gray-400">
                        MAC: {host.mac_address}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-500">Ports ouverts</p>
                  <p className="text-2xl font-bold text-seahawks-blue">
                    {host.ports?.filter(p => p.state === 'open').length || 0}
                  </p>
                </div>
                
                {expandedHost === host.ip ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Host Details */}
          {expandedHost === host.ip && (
            <div className="bg-white p-6 border-t border-gray-200">
              {/* OS Info */}
              {host.os?.name !== 'Unknown' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Système d'exploitation</h4>
                  </div>
                  <p className="text-gray-700">{host.os.name}</p>
                  {host.os.accuracy > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Précision: {host.os.accuracy}%
                    </p>
                  )}
                </div>
              )}

              {/* Ports Table */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-seahawks-blue" />
                  Analyse des ports
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Port
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          État
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Version
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {host.ports?.map((port, portIndex) => (
                        <tr 
                          key={portIndex}
                          className={`hover:bg-gray-50 transition-colors ${
                            port.state === 'open' ? 'bg-green-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-semibold text-gray-900">
                              {port.port}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              port.state === 'open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {port.state === 'open' ? (
                                <>
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Ouvert
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Fermé
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {port.service || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {port.version ? (
                              <div>
                                {port.product && (
                                  <span className="font-medium">{port.product} </span>
                                )}
                                {port.version}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default HostsList
