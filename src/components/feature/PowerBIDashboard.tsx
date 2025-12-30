
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList } from 'recharts';
import { Button } from '../base/Button';

const COLORS = ['#006E5B', '#00FFAA', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

interface PowerBIDashboardProps {
  leads: any[];
  calls: any[];
}

export function PowerBIDashboard({ leads, calls }: PowerBIDashboardProps) {
  const [dateRange, setDateRange] = useState('30');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  const keyMetrics = {
    totalLeads: leads.length,
    conversionRate: ((leads.filter(l => l.status === 'Registered').length / leads.length) * 100).toFixed(1),
    avgSalesCycle: '18 days',
    revenueYTD: '₹2.4 Cr'
  };

  const conversionFunnel = [
    { name: 'New Leads', value: leads.filter(l => l.status === 'New').length, fill: '#006E5B' },
    { name: 'CRT Assigned', value: leads.filter(l => l.status === 'Assigned to CRT').length, fill: '#00FFAA' },
    { name: 'Sales Assigned', value: leads.filter(l => l.status === 'Assigned to Sales').length, fill: '#4CAF50' },
    { name: 'Test Drive', value: leads.filter(l => l.status === 'Test Drive').length, fill: '#2196F3' },
    { name: 'Delivered', value: leads.filter(l => l.status === 'Delivered').length, fill: '#FF9800' },
    { name: 'Registered', value: leads.filter(l => l.status === 'Registered').length, fill: '#9C27B0' }
  ];

  const vehicleInterest = leads.reduce((acc: any, lead) => {
    acc[lead.vehicle_interest] = (acc[lead.vehicle_interest] || 0) + 1;
    return acc;
  }, {});

  const vehicleData = Object.entries(vehicleInterest).map(([name, value]) => ({ name, value }));

  const monthlyTrends = [
    { month: 'Jan', leads: 45, sales: 12 },
    { month: 'Feb', leads: 52, sales: 15 },
    { month: 'Mar', leads: 48, sales: 14 },
    { month: 'Apr', leads: 61, sales: 18 },
    { month: 'May', leads: 58, sales: 16 },
    { month: 'Jun', leads: 67, sales: 21 }
  ];

  const leadSourceHeatmap = [
    { source: 'Auto Expo', jan: 15, feb: 18, mar: 12, apr: 22, may: 19, jun: 25 },
    { source: 'Mall Events', jan: 8, feb: 12, mar: 15, apr: 18, may: 14, jun: 16 },
    { source: 'Digital Campaign', jan: 22, feb: 25, mar: 28, apr: 31, may: 35, jun: 38 },
    { source: 'Referrals', jan: 5, feb: 7, mar: 9, apr: 12, may: 8, jun: 11 }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#006E5B] focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Vehicle:</label>
            <select 
              value={selectedVehicle} 
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#006E5B] focus:border-transparent"
            >
              <option value="all">All Vehicles</option>
              <option value="Kushaq">Kushaq</option>
              <option value="Slavia">Slavia</option>
              <option value="Kodiaq">Kodiaq</option>
              <option value="Superb">Superb</option>
              <option value="Octavia">Octavia</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Source:</label>
            <select 
              value={selectedSource} 
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#006E5B] focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="Auto Expo">Auto Expo</option>
              <option value="Mall Events">Mall Events</option>
              <option value="Digital Campaign">Digital Campaign</option>
              <option value="Referrals">Referrals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#006E5B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-[#006E5B]">{keyMetrics.totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-[#006E5B] rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-white text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#00FFAA]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-[#006E5B]">{keyMetrics.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-[#00FFAA] rounded-lg flex items-center justify-center">
              <i className="ri-trophy-line text-black text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Sales Cycle</p>
              <p className="text-3xl font-bold text-[#006E5B]">{keyMetrics.avgSalesCycle}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-white text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue YTD</p>
              <p className="text-3xl font-bold text-[#006E5B]">{keyMetrics.revenueYTD}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-money-rupee-circle-line text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#006E5B] mb-4">Lead Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnel} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => [`${value} leads`, 'Count']}
                labelFormatter={(label) => `Stage: ${label}`}
              />
              <Bar dataKey="value" fill="#006E5B">
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Interest Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#006E5B] mb-4">Vehicle Interest Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vehicleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#006E5B] mb-4">Monthly Leads vs Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#006E5B" strokeWidth={3} name="Leads" />
              <Line type="monotone" dataKey="sales" stroke="#00FFAA" strokeWidth={3} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Source Heatmap */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#006E5B] mb-4">Lead Source Performance Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#006E5B] text-white">
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-center">Jan</th>
                  <th className="px-3 py-2 text-center">Feb</th>
                  <th className="px-3 py-2 text-center">Mar</th>
                  <th className="px-3 py-2 text-center">Apr</th>
                  <th className="px-3 py-2 text-center">May</th>
                  <th className="px-3 py-2 text-center">Jun</th>
                </tr>
              </thead>
              <tbody>
                {leadSourceHeatmap.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-medium">{row.source}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.jan > 20 ? 'bg-[#006E5B] text-white' : 
                        row.jan > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.jan}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.feb > 20 ? 'bg-[#006E5B] text-white' : 
                        row.feb > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.feb}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.mar > 20 ? 'bg-[#006E5B] text-white' : 
                        row.mar > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.mar}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.apr > 20 ? 'bg-[#006E5B] text-white' : 
                        row.apr > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.apr}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.may > 20 ? 'bg-[#006E5B] text-white' : 
                        row.may > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.may}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.jun > 20 ? 'bg-[#006E5B] text-white' : 
                        row.jun > 15 ? 'bg-[#00FFAA] text-black' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {row.jun}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
