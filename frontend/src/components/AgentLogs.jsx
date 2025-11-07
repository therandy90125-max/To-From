import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AgentLogs = ({ workflowId }) => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Simulate WebSocket connection (since we don't have WebSocket endpoint yet)
    // In production, this would be: ws://localhost:5000/ws/logs/${workflowId}
    
    setIsConnected(true);

    // Simulate incoming logs
    const simulateLogs = () => {
      const sampleLogs = [
        { timestamp: new Date().toISOString(), level: 'info', message: 'Workflow started', step: 'initialization' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Fetching stock data for AAPL, GOOGL, MSFT', step: 'data_collection' },
        { timestamp: new Date().toISOString(), level: 'success', message: 'Successfully retrieved historical data (1mo)', step: 'data_collection' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Running AI risk analysis...', step: 'risk_analysis' },
        { timestamp: new Date().toISOString(), level: 'warning', message: 'High volatility detected in AAPL', step: 'risk_analysis' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Risk score calculated: 0.65', step: 'risk_analysis' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Initializing quantum optimization (QAOA)', step: 'quantum_optimization' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Setting up quantum circuit with 3 qubits', step: 'quantum_optimization' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Running optimization iterations...', step: 'quantum_optimization' },
        { timestamp: new Date().toISOString(), level: 'success', message: 'Quantum optimization completed', step: 'quantum_optimization' },
        { timestamp: new Date().toISOString(), level: 'success', message: 'Portfolio weights calculated: AAPL=0.45, GOOGL=0.30, MSFT=0.25', step: 'result' },
        { timestamp: new Date().toISOString(), level: 'success', message: 'Expected return: 12.5%, Risk: 8.2%, Sharpe Ratio: 1.52', step: 'result' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Workflow completed successfully ✓', step: 'completion' },
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < sampleLogs.length) {
          setLogs((prev) => [...prev, sampleLogs[index]]);
          index++;
        } else {
          clearInterval(interval);
          setIsConnected(false);
        }
      }, 800);

      return () => clearInterval(interval);
    };

    const cleanup = simulateLogs();

    return () => {
      if (cleanup) cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [workflowId]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-amber-600 bg-amber-50';
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`}
            ></div>
            <span className="text-sm font-semibold text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <span className="text-sm text-gray-500">|</span>
          <span className="text-sm text-gray-400">{logs.length} logs</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded transition-colors"
          >
            💾 Export
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <div>No logs yet. Start a workflow to see real-time logs.</div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`px-3 py-2 rounded-md ${getLevelColor(log.level)} border-l-4`}
                style={{
                  borderLeftColor:
                    log.level === 'error'
                      ? '#dc2626'
                      : log.level === 'warning'
                      ? '#f59e0b'
                      : log.level === 'success'
                      ? '#10b981'
                      : '#3b82f6',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{getLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.step && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                          {log.step}
                        </span>
                      )}
                    </div>
                    <div className="text-sm break-words">{log.message}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-xs text-gray-500 text-center">
        Real-time AI Agent Logs • ToAndFrom Quantum Portfolio Optimizer
      </div>
    </div>
  );
};

export default AgentLogs;

