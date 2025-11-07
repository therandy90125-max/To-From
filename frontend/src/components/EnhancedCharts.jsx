import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Sample data
const performanceData = [
  { date: '2024-01', return: 5.2, risk: 3.1, sharpe: 1.68 },
  { date: '2024-02', return: 7.8, risk: 4.2, sharpe: 1.86 },
  { date: '2024-03', return: 6.5, risk: 3.8, sharpe: 1.71 },
  { date: '2024-04', return: 9.2, risk: 5.1, sharpe: 1.80 },
  { date: '2024-05', return: 11.5, risk: 6.2, sharpe: 1.85 },
  { date: '2024-06', return: 12.8, risk: 6.8, sharpe: 1.88 },
];

const portfolioWeights = [
  { name: 'AAPL', value: 35, originalWeight: 40 },
  { name: 'GOOGL', value: 28, originalWeight: 30 },
  { name: 'MSFT', value: 22, originalWeight: 20 },
  { name: 'AMZN', value: 15, originalWeight: 10 },
];

const riskMetrics = [
  { metric: 'Return', value: 12.5, fullMark: 20 },
  { metric: 'Volatility', value: 6.8, fullMark: 15 },
  { metric: 'Sharpe', value: 1.84, fullMark: 3 },
  { metric: 'Sortino', value: 2.1, fullMark: 3 },
  { metric: 'Max DD', value: -4.2, fullMark: -10 },
];

const methodComparison = [
  { method: 'Classical', time: 2.5, accuracy: 85, sharpe: 1.52 },
  { method: 'Quantum', time: 12.8, accuracy: 92, sharpe: 1.88 },
  { method: 'Hybrid', time: 7.3, accuracy: 95, sharpe: 1.95 },
];

const EnhancedCharts = () => {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
              {entry.name.includes('Return') || entry.name.includes('risk') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Enhanced Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Advanced visualization with real-time animations and insights
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Portfolio Performance Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="return"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorReturn)"
                name="Return (%)"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorRisk)"
                name="Risk (%)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Portfolio Weights Comparison */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Optimized vs Original Weights
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={portfolioWeights}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="originalWeight"
                fill="#9ca3af"
                name="Original (%)"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                name="Optimized (%)"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                animationBegin={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Metrics Radar */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Risk Metrics Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={riskMetrics}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar
                name="Metrics"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                animationDuration={1500}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {riskMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-gray-600">{metric.metric}</span>
                <span className="font-semibold text-gray-800">
                  {metric.value > 0 ? '+' : ''}
                  {metric.value.toFixed(2)}
                  {metric.metric.includes('Return') ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Method Comparison */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ⚡ Optimization Method Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={methodComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="method" stroke="#6b7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Time (s)"
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Accuracy (%)"
                animationDuration={1500}
                animationBegin={300}
              />
              <Line
                type="monotone"
                dataKey="sharpe"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Sharpe Ratio"
                animationDuration={1500}
                animationBegin={600}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {methodComparison.map((method, index) => (
              <div
                key={index}
                className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-center"
              >
                <div className="text-xs text-gray-600 mb-1">{method.method}</div>
                <div className="text-xl font-bold text-gray-800">
                  {method.sharpe.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Sharpe Ratio</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Distribution Pie Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🥧 Portfolio Distribution
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={portfolioWeights}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                >
                  {portfolioWeights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {portfolioWeights.map((stock, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: `${COLORS[index]}15` }}
              >
                <div
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <div className="text-sm font-semibold text-gray-800">{stock.name}</div>
                <div className="text-2xl font-bold text-gray-900 my-1">
                  {stock.value}%
                </div>
                <div className="text-xs text-gray-500">
                  {stock.value > stock.originalWeight ? '↑' : '↓'}{' '}
                  {Math.abs(stock.value - stock.originalWeight)}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Return', value: '+12.8%', icon: '📈', color: 'bg-green-500' },
          { label: 'Portfolio Risk', value: '6.8%', icon: '⚠️', color: 'bg-amber-500' },
          { label: 'Sharpe Ratio', value: '1.88', icon: '🎯', color: 'bg-blue-500' },
          { label: 'Win Rate', value: '92%', icon: '🏆', color: 'bg-purple-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
            className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default EnhancedCharts;

