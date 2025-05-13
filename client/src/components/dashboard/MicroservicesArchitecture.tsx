import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as d3 from 'd3';

interface MicroserviceNode {
  id: string;
  name: string;
  type: string;
  status: string;
  dependencies: string[];
}

interface MicroservicesArchitectureProps {
  clusterId: number;
}

export default function MicroservicesArchitecture({ clusterId }: MicroservicesArchitectureProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Need to redraw the visualization after the container resizes
    setTimeout(() => drawVisualization(), 100);
  };

  useEffect(() => {
    const loadMicroservicesData = () => {
      setLoading(true);
      
      // Simulating API call
      setTimeout(() => {
        setLoading(false);
        drawVisualization();
      }, 800);
    };
    
    loadMicroservicesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterId]);

  // Redraw visualization if fullscreen changes
  useEffect(() => {
    const handleResize = () => {
      drawVisualization();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const drawVisualization = () => {
    if (!svgRef.current) return;

    // Sample microservices data
    const microservices: MicroserviceNode[] = [
      { id: 'gateway', name: 'API Gateway', type: 'gateway', status: 'healthy', dependencies: [] },
      { id: 'auth', name: 'Auth Service', type: 'service', status: 'healthy', dependencies: ['gateway'] },
      { id: 'user', name: 'User Service', type: 'service', status: 'healthy', dependencies: ['gateway', 'auth'] },
      { id: 'billing', name: 'Billing Service', type: 'service', status: 'degraded', dependencies: ['gateway', 'user'] },
      { id: 'inventory', name: 'Inventory Service', type: 'service', status: 'healthy', dependencies: ['gateway'] },
      { id: 'notification', name: 'Notification Service', type: 'service', status: 'healthy', dependencies: ['gateway', 'user'] },
      { id: 'analytics', name: 'Analytics Service', type: 'service', status: 'healthy', dependencies: ['gateway', 'user', 'billing', 'inventory'] },
      { id: 'mongodb', name: 'MongoDB', type: 'database', status: 'healthy', dependencies: [] },
      { id: 'postgres', name: 'PostgreSQL', type: 'database', status: 'healthy', dependencies: [] },
      { id: 'redis', name: 'Redis', type: 'cache', status: 'healthy', dependencies: [] },
    ];

    // Create links from dependencies
    const links = [];
    for (const service of microservices) {
      for (const depId of service.dependencies) {
        links.push({
          source: depId,
          target: service.id
        });
      }
    }

    // Also add some database connections
    links.push({ source: 'postgres', target: 'user' });
    links.push({ source: 'postgres', target: 'auth' });
    links.push({ source: 'mongodb', target: 'billing' });
    links.push({ source: 'mongodb', target: 'inventory' });
    links.push({ source: 'redis', target: 'notification' });
    links.push({ source: 'mongodb', target: 'analytics' });

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up the SVG
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create a force simulation
    const simulation = d3.forceSimulation(microservices as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Add lines for the links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .style('stroke', '#4b5563')
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.6);

    // Create a group for each node
    const node = svg.append('g')
      .selectAll('.node')
      .data(microservices)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, MicroserviceNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles to the nodes
    node.append('circle')
      .attr('r', 30)
      .style('fill', (d) => {
        if (d.type === 'gateway') return '#6366F1';
        if (d.type === 'service') {
          return d.status === 'healthy' ? '#10B981' : '#F59E0B';
        }
        if (d.type === 'database') return '#06b6d4';
        if (d.type === 'cache') return '#8b5cf6';
        return '#9ca3af';
      })
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add text labels to the nodes
    node.append('text')
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .text((d) => d.name)
      .style('fill', '#ffffff')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Set up the tick function
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Functions for the drag behavior
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Microservices Architecture</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => drawVisualization()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'} flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            className={`w-full ${isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-96'} bg-card rounded-lg`}
          ></svg>
        )}
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Service Mesh Status</div>
              <Badge variant="outline" className="bg-success-500 bg-opacity-20 text-success-500 border-0">
                Healthy
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Istio service mesh is operating normally with 12 services and 32 endpoints in the mesh.
            </div>
          </div>
          
          <div className="bg-accent p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Traffic Distribution</div>
              <button className="text-xs text-primary">View Details</button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-success-500 mr-1.5"></div>
                <span className="text-muted-foreground">HTTP 200: 97.3%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-warning-500 mr-1.5"></div>
                <span className="text-muted-foreground">HTTP 4xx: 2.4%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-destructive mr-1.5"></div>
                <span className="text-muted-foreground">HTTP 5xx: 0.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
