import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

// Custom node styles for actual application workflow
const nodeStyle = {
  background: '#fff',
  border: '3px solid #1a192b',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '13px',
  fontWeight: '600',
  minWidth: '180px',
  textAlign: 'center',
};

// Real application workflow nodes
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: '🌐 Frontend (React)\nUser Input' },
    position: { x: 250, y: 0 },
    style: { ...nodeStyle, borderColor: '#3b82f6', background: '#eff6ff' },
  },
  {
    id: '2',
    data: { label: '📡 Vite Proxy\nAPI Routing' },
    position: { x: 250, y: 100 },
    style: { ...nodeStyle, borderColor: '#8b5cf6', background: '#f5f3ff' },
  },
  {
    id: '3',
    data: { label: '☕ Spring Boot\nAPI Gateway (8080)' },
    position: { x: 250, y: 200 },
    style: { ...nodeStyle, borderColor: '#10b981', background: '#f0fdf4' },
  },
  {
    id: '4',
    data: { label: '💾 MariaDB/H2\nData Persistence' },
    position: { x: 100, y: 320 },
    style: { ...nodeStyle, borderColor: '#f59e0b', background: '#fffbeb' },
  },
  {
    id: '5',
    data: { label: '🐍 Flask (Python)\nOptimization Engine (5000)' },
    position: { x: 400, y: 320 },
    style: { ...nodeStyle, borderColor: '#ec4899', background: '#fdf2f8' },
  },
  {
    id: '6',
    data: { label: '⚛️ Qiskit\nQuantum Computing' },
    position: { x: 400, y: 440 },
    style: { ...nodeStyle, borderColor: '#8b5cf6', background: '#f5f3ff' },
  },
  {
    id: '7',
    data: { label: '📊 yfinance\nStock Data API' },
    position: { x: 550, y: 320 },
    style: { ...nodeStyle, borderColor: '#06b6d4', background: '#ecfeff' },
  },
  {
    id: '8',
    type: 'output',
    data: { label: '✅ Result Display\nCharts & Analytics' },
    position: { x: 250, y: 560 },
    style: { ...nodeStyle, borderColor: '#ef4444', background: '#fef2f2' },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'HTTP Request',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'Proxy :8080',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    label: 'Save/Load',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    label: 'Optimize API',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    label: 'QAOA',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    label: 'Stock Price',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e5-8',
    source: '5',
    target: '8',
    label: 'Result',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e4-8',
    source: '4',
    target: '8',
    label: 'History',
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
];

const WorkflowVisualization = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeNode, setActiveNode] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState('idle');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Simulate workflow execution
  const runWorkflow = () => {
    setWorkflowStatus('running');
    const nodeSequence = ['1', '2', '3', '5', '7', '6', '8', '4'];
    let index = 0;

    const interval = setInterval(() => {
      if (index < nodeSequence.length) {
        setActiveNode(nodeSequence[index]);
        index++;
      } else {
        setWorkflowStatus('completed');
        clearInterval(interval);
        setTimeout(() => {
          setActiveNode(null);
          setWorkflowStatus('idle');
        }, 2000);
      }
    }, 800);
  };

  // Update node styles based on active state
  useEffect(() => {
    if (activeNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === activeNode) {
            return {
              ...node,
              style: {
                ...node.style,
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
                transform: 'scale(1.15)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
              },
            };
          }
          return {
            ...node,
            style: {
              ...initialNodes.find((n) => n.id === node.id).style,
              transition: 'all 0.3s ease',
            },
          };
        })
      );
    }
  }, [activeNode, setNodes]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg p-6 border-b-2 border-gray-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              🔄 Application Architecture & Workflow
            </h1>
            <p className="text-sm text-gray-600">
              Real-time visualization of ToAndFrom system components and data flow
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Status: </span>
              <span
                className={`px-4 py-2 rounded-full text-white font-semibold ${
                  workflowStatus === 'idle'
                    ? 'bg-gray-500'
                    : workflowStatus === 'running'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-green-500'
                }`}
              >
                {workflowStatus === 'idle'
                  ? 'Ready'
                  : workflowStatus === 'running'
                  ? 'Running...'
                  : 'Completed ✓'}
              </span>
            </div>
            <button
              onClick={runWorkflow}
              disabled={workflowStatus === 'running'}
              className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                workflowStatus === 'running'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {workflowStatus === 'running' ? '⏳ Running...' : '▶ Simulate Workflow'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.id === activeNode) return '#fbbf24';
              if (node.style?.borderColor) return node.style.borderColor;
              return '#ccc';
            }}
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background variant="dots" gap={16} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t-2 border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">System Components Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Frontend Layer */}
            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <span className="font-bold text-blue-900">Frontend Layer</span>
              </div>
              <p className="text-xs text-blue-700 ml-8">React + Vite (Port 5173)</p>
            </div>

            {/* API Gateway */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
                <span className="font-bold text-green-900">API Gateway</span>
              </div>
              <p className="text-xs text-green-700 ml-8">Spring Boot (Port 8080)</p>
            </div>

            {/* Processing Engine */}
            <div className="bg-pink-50 border-2 border-pink-500 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                <span className="font-bold text-pink-900">Processing Engine</span>
              </div>
              <p className="text-xs text-pink-700 ml-8">Flask + Qiskit (Port 5000)</p>
            </div>

            {/* Data Layer */}
            <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                <span className="font-bold text-amber-900">Data Layer</span>
              </div>
              <p className="text-xs text-amber-700 ml-8">H2/MariaDB + yfinance</p>
            </div>
          </div>

          {/* Data Flow */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Data Flow Types:</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500"></div>
                <span className="text-gray-700">HTTP Request</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-green-500"></div>
                <span className="text-gray-700">Response Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-amber-500"></div>
                <span className="text-gray-700">Database I/O</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b, #f59e0b 5px, transparent 5px, transparent 10px)' }}></div>
                <span className="text-gray-700">Async/Cache</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-yellow-200 border-2 border-yellow-500 animate-pulse"></div>
                <span className="text-gray-700 font-semibold">Active Component</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowVisualization;
