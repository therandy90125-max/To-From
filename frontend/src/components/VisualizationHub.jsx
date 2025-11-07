import { useState } from 'react';
import { motion } from 'framer-motion';
import WorkflowVisualization from './WorkflowVisualization';
import AgentLogs from './AgentLogs';

const VisualizationHub = () => {
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Tabs */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              🎬 Visualization & Monitoring
            </h1>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('workflow')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'workflow'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🔄 Workflow
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'logs'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📋 Logs
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'split'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ⚡ Split View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'workflow' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <WorkflowVisualization />
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full p-6"
          >
            <AgentLogs workflowId="demo-workflow" />
          </motion.div>
        )}

        {activeTab === 'split' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full grid grid-cols-2 gap-4 p-6"
          >
            <div className="h-full overflow-hidden rounded-lg shadow-lg">
              <WorkflowVisualization />
            </div>
            <div className="h-full">
              <AgentLogs workflowId="demo-workflow" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VisualizationHub;

