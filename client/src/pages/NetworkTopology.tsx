import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import NetworkTopologyComponent from '@/components/dashboard/NetworkTopology';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import useWebSocket from '@/hooks/useWebSocket';

export default function NetworkTopology() {
  const params = useParams<{ id: string }>();
  const clusterId = parseInt(params.id, 10);
  const [viewMode, setViewMode] = useState<'network' | 'services' | 'policies'>('network');
  
  // Initialize WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket(clusterId);

  // Fetch cluster data
  const { data: cluster, isLoading: isClusterLoading, refetch } = useQuery({
    queryKey: [`/api/clusters/${clusterId}`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cluster');
      }
      return response.json();
    }
  });

  // Refetch data when we receive updates via WebSocket
  useEffect(() => {
    if (lastMessage) {
      refetch();
    }
  }, [lastMessage, refetch]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {isClusterLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Network Topology: ${cluster?.name || 'Unknown'}`
          )}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isClusterLoading ? (
            <Skeleton className="h-5 w-80" />
          ) : (
            `Visualizing network connections between ${cluster?.nodes} nodes and their services`
          )}
        </p>
      </div>
      
      {/* View Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <Button 
            variant={viewMode === 'network' ? 'default' : 'outline'}
            onClick={() => setViewMode('network')}
          >
            Node Network
          </Button>
          <Button 
            variant={viewMode === 'services' ? 'default' : 'outline'}
            onClick={() => setViewMode('services')}
          >
            Service Mesh
          </Button>
          <Button 
            variant={viewMode === 'policies' ? 'default' : 'outline'}
            onClick={() => setViewMode('policies')}
          >
            Network Policies
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Select defaultValue="calico">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="CNI Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="calico">Calico CNI</SelectItem>
                <SelectItem value="flannel">Flannel</SelectItem>
                <SelectItem value="weave">Weave Net</SelectItem>
                <SelectItem value="cilium">Cilium</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button>
            Export Diagram
          </Button>
        </div>
      </div>
      
      {/* Main Topology View */}
      <div className="mb-6">
        <NetworkTopologyComponent clusterId={clusterId} />
      </div>
      
      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245 Mbps</div>
            <p className="text-xs text-muted-foreground">
              Peak: 780 Mbps (2 hours ago)
            </p>
            <div className="h-2 bg-muted mt-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '24.5%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0 Mbps</span>
              <span>1000 Mbps</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success-500">↑ 12.6%</span> from last hour
            </p>
            <div className="grid grid-cols-2 mt-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Internal</div>
                <div>876</div>
              </div>
              <div>
                <div className="text-muted-foreground">External</div>
                <div>408</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Network Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Last updated 35 minutes ago
            </p>
            <div className="grid grid-cols-3 mt-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Ingress</div>
                <div>8</div>
              </div>
              <div>
                <div className="text-muted-foreground">Egress</div>
                <div>3</div>
              </div>
              <div>
                <div className="text-muted-foreground">Both</div>
                <div>1</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Network Troubleshooting Tools */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Network Test</h4>
              <div className="flex space-x-2">
                <Select defaultValue="ping">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ping">Ping</SelectItem>
                      <SelectItem value="trace">Traceroute</SelectItem>
                      <SelectItem value="dns">DNS Lookup</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input 
                  type="text" 
                  placeholder="Source Pod/Service" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button>Run Test</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Packet Capture</h4>
              <div className="flex space-x-2">
                <Select defaultValue="pod">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Target Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pod">Pod</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="node">Node</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input 
                  type="text" 
                  placeholder="Target Name" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button>Start Capture</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
