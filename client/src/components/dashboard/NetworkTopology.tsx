import { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NetworkData } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define node types for custom styling
const nodeTypes = {
  controlPlane: ({ data, ...rest }: any) => (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-card border-2 border-success-500 min-w-40 text-center"
    >
      {data.label}
      <div className="text-xs text-muted-foreground mt-1">{data.role}</div>
    </div>
  ),
  worker: ({ data, ...rest }: any) => (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-card border-2 border-primary min-w-40 text-center"
    >
      {data.label}
      <div className="text-xs text-muted-foreground mt-1">{data.role}</div>
    </div>
  ),
  service: ({ data, ...rest }: any) => (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-card border-2 border-warning-500 min-w-40 text-center"
    >
      {data.label}
      <div className="text-xs text-muted-foreground mt-1">Service</div>
    </div>
  ),
  networkPolicy: ({ data, ...rest }: any) => (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-card border-2 border-secondary min-w-40 text-center"
    >
      {data.label}
      <div className="text-xs text-muted-foreground mt-1">Network Policy</div>
    </div>
  )
};

interface NetworkTopologyProps {
  clusterId: number;
}

export default function NetworkTopology({ clusterId }: NetworkTopologyProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch data from a Kubernetes API
    const generateNetworkData = (): NetworkData => {
      // Generate sample node data
      const nodeData: Node[] = [];
      const edgeData: Edge[] = [];
      
      // Control plane nodes
      for (let i = 0; i < 3; i++) {
        nodeData.push({
          id: `control-${i}`,
          type: 'controlPlane',
          data: { 
            label: `control-plane-${i+1}`,
            role: 'Control Plane',
            status: 'healthy'
          },
          position: { x: 250, y: 100 + i * 100 }
        });
      }
      
      // Worker nodes
      for (let i = 0; i < 6; i++) {
        nodeData.push({
          id: `worker-${i}`,
          type: 'worker',
          data: { 
            label: `worker-${i+1}`,
            role: 'Worker Node',
            status: 'healthy'
          },
          position: { x: 500, y: 50 + i * 100 }
        });
      }
      
      // Services
      for (let i = 0; i < 3; i++) {
        nodeData.push({
          id: `service-${i}`,
          type: 'service',
          data: { 
            label: i === 0 ? 'api-gateway' : i === 1 ? 'auth-service' : 'billing-service',
            status: 'healthy'
          },
          position: { x: 750, y: 100 + i * 150 }
        });
      }
      
      // Network policies
      nodeData.push({
        id: 'network-policy-1',
        type: 'networkPolicy',
        data: { 
          label: 'default-deny',
          status: 'active'
        },
        position: { x: 350, y: 400 }
      });
      
      // Edges connecting nodes
      // Connect control plane nodes to each other
      for (let i = 0; i < 2; i++) {
        edgeData.push({
          id: `control-${i}-to-control-${i+1}`,
          source: `control-${i}`,
          target: `control-${i+1}`,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#4ade80'
          }
        });
      }
      
      // Connect last control plane to first
      edgeData.push({
        id: 'control-2-to-control-0',
        source: 'control-2',
        target: 'control-0',
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#4ade80'
        }
      });
      
      // Connect control plane to worker nodes
      for (let i = 0; i < 3; i++) {
        for (let j = i * 2; j < (i + 1) * 2 && j < 6; j++) {
          edgeData.push({
            id: `control-${i}-to-worker-${j}`,
            source: `control-${i}`,
            target: `worker-${j}`,
            type: 'default',
            style: {
              stroke: '#6366F1'
            }
          });
        }
      }
      
      // Connect worker nodes to services
      for (let i = 0; i < 6; i++) {
        const serviceIndex = i % 3;
        edgeData.push({
          id: `worker-${i}-to-service-${serviceIndex}`,
          source: `worker-${i}`,
          target: `service-${serviceIndex}`,
          type: 'default',
          style: {
            stroke: '#6366F1'
          }
        });
      }
      
      // Connect network policy to selected worker nodes
      edgeData.push({
        id: 'network-policy-1-to-worker-2',
        source: 'network-policy-1',
        target: 'worker-2',
        type: 'default',
        style: {
          stroke: '#f59e0b'
        }
      });
      
      edgeData.push({
        id: 'network-policy-1-to-worker-3',
        source: 'network-policy-1',
        target: 'worker-3',
        type: 'default',
        style: {
          stroke: '#f59e0b'
        }
      });
      
      return { nodes: nodeData, edges: edgeData };
    };

    const loadNetworkData = () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const networkData = generateNetworkData();
        setNodes(networkData.nodes);
        setEdges(networkData.edges);
        setLoading(false);
      }, 800);
    };

    loadNetworkData();
  }, [clusterId, setNodes, setEdges]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Network Topology</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setNodes([...nodes])}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={`p-4 ${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-96'}`}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
              style={{ 
                backgroundColor: 'var(--background)',
                maskColor: 'rgba(0,0,0,0.2)'
              }}
            />
            <Background color="#2a2a2a" gap={16} />
          </ReactFlow>
        )}
        
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
            <span className="text-sm text-foreground">Control Plane (3)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-sm text-foreground">Worker Nodes (6)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
            <span className="text-sm text-foreground">Services (3)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
            <span className="text-sm text-foreground">Restricted Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
