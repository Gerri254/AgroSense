import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Analytics = () => {
  const { historicalData, actionLogs } = useApp();
  const [timeRange, setTimeRange] = useState('24h');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffTime;

    switch (timeRange) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return historicalData
      .filter(item => new Date(item.timestamp) >= cutoffTime)
      .map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
  }, [historicalData, timeRange]);

  const exportData = () => {
    const csvContent = [
      ['Timestamp', 'Soil Moisture', 'Temperature', 'Humidity', 'Water Level'].join(','),
      ...filteredData.map(row =>
        [row.timestamp, row.soilMoisture, row.temperature, row.humidity, row.waterLevel].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-data-${timeRange}-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Controls */}
      <section className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-agro-green" />
            <h2 className="text-lg font-semibold text-gray-800">Historical Trends</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportData}
              disabled={filteredData.length === 0}
              className="btn-secondary flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </section>

      {/* Charts - FR 3.1 */}
      {filteredData.length > 0 ? (
        <>
          {/* Soil Moisture Chart */}
          <section className="card">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Soil Moisture Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Soil Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Temperature & Humidity Chart */}
          <section className="card">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Temperature & Humidity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Temperature (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Water Level Chart */}
          <section className="card">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Water Level Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Water Level (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Statistics */}
          <section className="card">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg Soil Moisture</p>
                <p className="text-xl font-bold text-blue-600">
                  {(filteredData.reduce((sum, item) => sum + item.soilMoisture, 0) / filteredData.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg Temperature</p>
                <p className="text-xl font-bold text-orange-600">
                  {(filteredData.reduce((sum, item) => sum + item.temperature, 0) / filteredData.length).toFixed(1)}°C
                </p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg Humidity</p>
                <p className="text-xl font-bold text-cyan-600">
                  {(filteredData.reduce((sum, item) => sum + item.humidity, 0) / filteredData.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg Water Level</p>
                <p className="text-xl font-bold text-indigo-600">
                  {(filteredData.reduce((sum, item) => sum + item.waterLevel, 0) / filteredData.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="card text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-500">
            Historical data will appear here once the system starts collecting sensor readings.
          </p>
        </section>
      )}

      {/* Action Logs - FR 3.2 */}
      <section className="card">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Action Log</h3>
        {actionLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 font-medium text-gray-700">Time</th>
                  <th className="px-4 py-2 font-medium text-gray-700">Action</th>
                  <th className="px-4 py-2 font-medium text-gray-700">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {actionLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{log.action}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          log.trigger === 'manual'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {log.trigger}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No actions recorded yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;
