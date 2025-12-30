
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { Textarea } from '../../../components/base/Textarea';
import { AlertsPanel } from '../../../components/feature/AlertsPanel';
import { Calendar } from '../../../components/feature/Calendar';
import { QueryResultTable } from '../../../components/feature/QueryResultTable';
import { PowerBIDashboard } from '../../../components/feature/PowerBIDashboard';
import { db } from '../../../services/database';
import { aiService } from '../../../services/ai';
import { wsService } from '../../../services/websocket';
import { Lead, Call, Schedule } from '../../../types';

const COLORS = ['#006E5B', '#00FFAA', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryResultText, setQueryResultText] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [aiAnalysis, setAiAnalysis] = useState('');

  useEffect(() => {
    loadDashboardData();
    wsService.connect();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, callsData, schedulesData] = await Promise.all([
        db.getLeads(),
        db.getCalls(),
        db.getSchedules(),
      ]);

      setLeads(leadsData);
      setCalls(callsData);
      setSchedules(schedulesData);

      // Process analytics data
      const vehicleInterest = leadsData.reduce((acc: any, lead) => {
        acc[lead.vehicle_interest] = (acc[lead.vehicle_interest] || 0) + 1;
        return acc;
      }, {});

      const statusDistribution = leadsData.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const conversionFunnel = [
        {
          name: 'New Leads',
          value: leadsData.filter((l) => l.status === 'New').length,
        },
        {
          name: 'CRT Assigned',
          value: leadsData.filter((l) => l.status === 'Assigned to CRT').length,
        },
        {
          name: 'Sales Assigned',
          value: leadsData.filter((l) => l.status === 'Assigned to Sales').length,
        },
        {
          name: 'Test Drive',
          value: leadsData.filter((l) => l.status === 'Test Drive').length,
        },
        {
          name: 'Registered',
          value: leadsData.filter((l) => l.status === 'Registered').length,
        },
      ];

      setAnalyticsData({
        vehicleInterest: Object.entries(vehicleInterest).map(
          ([name, value]) => ({ name, value })
        ),
        statusDistribution: Object.entries(statusDistribution).map(
          ([name, value]) => ({ name, value })
        ),
        conversionFunnel,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsLoading(true);
    try {
      // Simulate SQL query execution with realistic data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (sqlQuery.toLowerCase().includes('select * from leads')) {
        setQueryResult(leads);
        setQueryResultText('');
      } else if (sqlQuery.toLowerCase().includes('select * from calls')) {
        setQueryResult(calls);
        setQueryResultText('');
      } else if (sqlQuery.toLowerCase().includes('select * from schedules')) {
        setQueryResult(schedules);
        setQueryResultText('');
      } else if (sqlQuery.toLowerCase().includes('count')) {
        const countResult = [{ total_count: leads.length }];
        setQueryResult(countResult);
        setQueryResultText('');
      } else {
        setQueryResult([]);
        setQueryResultText(
          'Query executed successfully. Results would appear here in a real database connection.'
        );
      }
    } catch (error) {
      setQueryResult([]);
      setQueryResultText('Error executing query: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    setIsLoading(true);
    try {
      if (queryResult.length > 0) {
        // Generate AI analysis based on query results
        const analysis = `
📊 AI Analysis of Query Results:

📈 Data Summary:
• Total records analyzed: ${queryResult.length}
• Data quality: ${queryResult.length > 10 ? 'High' : 'Medium'} sample size

🎯 Key Insights:
${queryResult.length > 0 && queryResult[0].status
          ? `• Lead Status Distribution: ${Object.entries(
              queryResult.reduce((acc: any, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
              }, {})
            )
              .map(([status, count]) => `${status}: ${count}`)
              .join(', ')}`
          : ''}

${queryResult.length > 0 && queryResult[0].vehicle_interest
          ? `• Vehicle Interest Trends: ${Object.entries(
              queryResult.reduce((acc: any, item) => {
                acc[item.vehicle_interest] =
                  (acc[item.vehicle_interest] || 0) + 1;
                return acc;
              }, {})
            )
              .map(([vehicle, count]) => `${vehicle}: ${count}`)
              .join(', ')}`
          : ''}

💡 Recommendations:
• Focus on high-performing lead sources
• Optimize conversion funnel for better results
• Implement targeted follow-up strategies
• Monitor customer feedback patterns

⚠️ Risk Factors:
• Low conversion rates may indicate process gaps
• Extended sales cycles could impact revenue
• Customer satisfaction scores need monitoring

📋 Action Items:
1. Review lead qualification process
2. Enhance CRT training programs
3. Implement automated follow-up systems
4. Analyze competitor pricing strategies
        `;
        setAiAnalysis(analysis);
      } else {
        setAiAnalysis(
          'No data available for AI analysis. Please execute a query that returns results first.'
        );
      }
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
      setAiAnalysis('Error generating AI analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = () => {
    if (queryResult.length === 0) return;

    // Convert to CSV format for Excel compatibility
    const headers = Object.keys(queryResult[0]);
    const csvContent = [
      headers.join(','),
      ...queryResult.map((row) =>
        headers.map((header) => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'application/vnd.ms-excel',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (queryResult.length === 0) return;

    const headers = Object.keys(queryResult[0]);
    const csvContent = [
      headers.join(','),
      ...queryResult.map((row) =>
        headers.map((header) => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-server-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-lg font-bold text-green-600">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-database-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-bold text-blue-600">Connected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#00FFAA] rounded-lg flex items-center justify-center">
              <i className="ri-timer-line text-black text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Job Queue</p>
              <p className="text-lg font-bold text-[#006E5B]">3 Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#006E5B] rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-lg font-bold text-[#006E5B]">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Power BI Sales Performance Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#006E5B] mb-6">
          Sales Performance Dashboard
        </h3>
        <PowerBIDashboard leads={leads} calls={calls} />
      </div>

      {/* SQL Query Interface */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-bold text-[#006E5B] mb-4">
          Database Query Interface
        </h3>

        <div className="space-y-4">
          <Textarea
            label="SQL Query"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SELECT * FROM leads WHERE status = 'New';"
            rows={4}
          />

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={executeQuery} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Executing...' : 'Execute Query'}
            </Button>

            <Button
              variant="secondary"
              onClick={generateAIAnalysis}
              disabled={isLoading || queryResult.length === 0}
              className="w-full sm:w-auto"
            >
              <i className="ri-robot-line mr-2"></i>
              Generate AI Analysis
            </Button>
          </div>

          {queryResult.length > 0 && (
            <QueryResultTable
              data={queryResult}
              onDownloadCSV={downloadCSV}
            />
          )}

          {queryResultText && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Query Result:
              </h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {queryResultText}
              </pre>
            </div>
          )}

          {aiAnalysis && (
            <div className="bg-gradient-to-r from-[#006E5B]/5 to-[#00FFAA]/5 rounded-lg p-4 md:p-6 border border-[#006E5B]/20">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#006E5B] rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-robot-line text-white"></i>
                  </div>
                  <h4 className="font-bold text-[#006E5B]">AI Analysis Report</h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCSV}
                  className="sm:ml-auto w-full sm:w-auto"
                  disabled={queryResult.length === 0}
                >
                  <i className="ri-download-line mr-2"></i>
                  Download CSV
                </Button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {aiAnalysis}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-bold text-[#006E5B] mb-4">
          User Management
        </h3>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full table-auto min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Last Login
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Rajesh Kumar
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    Marketing Team
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    2 hours ago
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      <i className="ri-settings-line mr-1"></i>
                      Manage
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Priya Sharma
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">CRT</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    1 hour ago
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      <i className="ri-settings-line mr-1"></i>
                      Manage
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Amit Singh
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    Sales Executive
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Away
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    30 minutes ago
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      <i className="ri-settings-line mr-1"></i>
                      Manage
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Saved Queries */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-bold text-[#006E5B] mb-4">
          Saved Queries
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#006E5B] transition-colors cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">
              Active Leads Report
            </h4>
            <p className="text-sm text-gray-600 mb-3 break-words">
              SELECT * FROM leads WHERE status IN ('New', 'Assigned to CRT')
            </p>
            <Button
              size="sm"
              onClick={() =>
                setSqlQuery(
                  "SELECT * FROM leads WHERE status IN ('New', 'Assigned to CRT')"
                )
              }
              className="w-full"
            >
              Load Query
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#006E5B] transition-colors cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">
              Conversion Analysis
            </h4>
            <p className="text-sm text-gray-600 mb-3 break-words">
              SELECT vehicle_interest, COUNT(*) FROM leads GROUP BY
              vehicle_interest
            </p>
            <Button
              size="sm"
              onClick={() =>
                setSqlQuery(
                  'SELECT vehicle_interest, COUNT(*) FROM leads GROUP BY vehicle_interest'
                )
              }
              className="w-full"
            >
              Load Query
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#006E5B] transition-colors cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">
              Recent Calls
            </h4>
            <p className="text-sm text-gray-600 mb-3 break-words">
              {'SELECT * FROM calls WHERE date_time >= CURDATE() - INTERVAL 7 DAY'}
            </p>
            <Button
              size="sm"
              onClick={() =>
                setSqlQuery(
                  'SELECT * FROM calls WHERE date_time >= CURDATE() - INTERVAL 7 DAY'
                )
              }
              className="w-full"
            >
              Load Query
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
