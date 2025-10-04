'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  userRole: 'admin' | 'doctor' | 'health_officer';
}

export default function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const rolePermissions = {
    admin: ['workers', 'reports', 'system', 'users', 'analytics'],
    doctor: ['workers', 'reports', 'medical'],
    health_officer: ['reports', 'surveillance', 'analytics']
  };

  const hasPermission = (permission: string) => {
    return rolePermissions[userRole].includes(permission);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-kerala-teal">
            {userRole === 'admin' ? 'System Admin Dashboard' : 
             userRole === 'doctor' ? 'Healthcare Provider Dashboard' :
             'Health Officer Dashboard'}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {hasPermission('workers') && (
              <button
                onClick={() => setActiveTab('workers')}
                className={`py-4 px-1 font-medium text-sm ${
                  activeTab === 'workers' ? 'border-b-2 border-kerala-teal text-kerala-teal' : 'text-gray-500'
                }`}
              >
                Worker Profiles ({1247})
              </button>
            )}
            {hasPermission('reports') && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 font-medium text-sm ${
                  activeTab === 'reports' ? 'border-b-2 border-kerala-teal text-kerala-teal' : 'text-gray-500'
                }`}
              >
                Health Reports
              </button>
            )}
            {hasPermission('surveillance') && (
              <button
                onClick={() => setActiveTab('surveillance')}
                className={`py-4 px-1 font-medium text-sm ${
                  activeTab === 'surveillance' ? 'border-b-2 border-kerala-teal text-kerala-teal' : 'text-gray-500'
                }`}
              >
                Disease Surveillance
              </button>
            )}
            {hasPermission('analytics') && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 font-medium text-sm ${
                  activeTab === 'analytics' ? 'border-b-2 border-kerala-teal text-kerala-teal' : 'text-gray-500'
                }`}
              >
                Analytics & Insights
              </button>
            )}
          </nav>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-500">Total Workers</div>
            <div className="text-3xl font-bold text-kerala-teal">1,247</div>
            <div className="text-sm text-green-600">+12% from last month</div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-500">Active Alerts</div>
            <div className="text-3xl font-bold text-orange-600">23</div>
            <div className="text-sm text-red-600">5 critical</div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-500">Health Records</div>
            <div className="text-3xl font-bold text-blue-600">3,892</div>
            <div className="text-sm text-green-600">+8% this week</div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-500">Disease Hotspots</div>
            <div className="text-3xl font-bold text-red-600">7</div>
            <div className="text-sm text-yellow-600">2 new this week</div>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          {activeTab === 'workers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Worker Management</h2>
                <button className="bg-kerala-teal text-white px-4 py-2 rounded-lg">
                  Export CSV
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search workers..."
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Industries</option>
                  <option>Construction</option>
                  <option>Manufacturing</option>
                  <option>Agriculture</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Districts</option>
                  <option>Thiruvananthapuram</option>
                  <option>Kochi</option>
                  <option>Kozhikode</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Risk Levels</option>
                  <option>High Risk</option>
                  <option>Medium Risk</option>
                  <option>Low Risk</option>
                </select>
              </div>

              {/* Worker Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checkup</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">MH-{1000 + i}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Worker {i + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Construction</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            i % 3 === 0 ? 'bg-red-100 text-red-800' :
                            i % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-kerala-teal hover:text-kerala-teal/80 mr-3">View</button>
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'surveillance' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Disease Surveillance Map</h2>
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">3D Kerala Disease Map</h3>
                <p className="text-blue-700">Real-time disease hotspot visualization with Kerala geographic data</p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded">
                    <div className="font-bold text-red-600">7</div>
                    <div>Active Hotspots</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="font-bold text-orange-600">23</div>
                    <div>Alerts</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="font-bold text-yellow-600">156</div>
                    <div>Suspected Cases</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="font-bold text-green-600">94%</div>
                    <div>Detection Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Health Analytics & Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">📊 Health Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Respiratory Issues</span>
                      <span className="font-bold text-red-600">↑ 15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heat Exhaustion</span>
                      <span className="font-bold text-orange-600">↑ 32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Back Injuries</span>
                      <span className="font-bold text-yellow-600">↑ 8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mental Health</span>
                      <span className="font-bold text-blue-600">→ Stable</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">🏭 Industry Risk Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Construction</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-sm font-medium">High</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Manufacturing</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-sm font-medium">Medium</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Agriculture</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                        <span className="text-sm font-medium">Medium-High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}