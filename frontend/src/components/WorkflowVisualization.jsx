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

// Custom node styles
const nodeStyle = {
  background: '#fff',
  border: '2px solid #1a192b',
  borderRadius: '8px',
  padding: '10px',
  fontSize: '12px',
  fontWeight: '600',
};

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: '📊 Stock Search' },
    position: { x: 250, y: 0 },
    style: { ...nodeStyle, borderColor: '#3b82f6' },
  },
  {
    id: '2',
    data: { label: '🔍 Data Collection' },
    position: { x: 250, y: 100 },
    style: nodeStyle,
  },
  {
    id: '3',
    data: { label: '🤖 AI Risk Analysis' },
    position: { x: 100, y: 200 },
    style: { ...nodeStyle, borderColor: '#10b981' },
  },
  {
    id: '4',
    data: { label: '📈 Classical Optimization' },
    position: { x: 400, y: 200 },
    style: { ...nodeStyle, borderColor: '#f59e0b' },
  },
  {
    id: '5',
    data: { label: '⚛️ Quantum Optimization' },
    position: { x: 250, y: 300 },
    style: { ...nodeStyle, borderColor: '#8b5cf6' },
  },
  {
    id: '6',
    data: { label: '🎯 Portfolio Result' },
    position: { x: 250, y: 400 },
    style: { ...nodeStyle, borderColor: '#ef4444' },
    type: 'output',
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    label: 'Risk Factor < 0.3',
    labelStyle: { fontSize: 10, fontWeight: 700 },
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    label: 'Classical',
    labelStyle: { fontSize: 10, fontWeight: 700 },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    animated: true,
    style: { stroke: '#ef4444', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },
];

const WorkflowVisualization = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeNode, setActiveNode] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState('idle'); // idle, running, completed

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Simulate workflow execution
  const runWorkflow = () => {
    setWorkflowStatus('running');
    const nodeSequence = ['1', '2', '3', '5', '6'];
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
    }, 1000);
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
                background: '#fef3c7',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
                transform: 'scale(1.1)',
                transition: 'all 0.3s ease',
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md p-4 border-b"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🔄 AI Agent Workflow Visualization
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Multi-step portfolio optimization with conditional branching
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold">Status: </span>
              <span
                className={`px-3 py-1 rounded-full text-white ${
                  workflowStatus === 'idle'
                    ? 'bg-gray-400'
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
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                workflowStatus === 'running'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {workflowStatus === 'running' ? '⏳ Running...' : '▶ Run Workflow'}
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
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.id === activeNode) return '#fbbf24';
              if (node.style?.borderColor) return node.style.borderColor;
              return '#ccc';
            }}
            nodeStrokeWidth={3}
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t p-4"
      >
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>Input/Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span>Classical Opt.</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span>Quantum Opt.</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>Result</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-500"></div>
              <span>Active Step</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowVisualization;

