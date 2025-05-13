import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NodeData } from '@/types';
import useWebSocket from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { BarChart } from '@/components/ui/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Cpu, MemoryStick, HardDrive, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Nodes() {
  const params = useParams<{ id: string }>();
  const clusterId = parseInt(params.id, 10);
  
  // Initialize WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket(clusterId);

  // Fetch cluster data
  const { data: cluster, isLoading: isClusterLoading, refetch: refetchCluster } = useQuery({
    queryKey: [`/api/clusters/${clusterId}`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cluster');
      }
      return response.json();
    }
  });

  // Fetch nodes data
  const { data: nodes, isLoading: isNodesLoading, refetch: refetchNodes } = useQuery({
    queryKey: [`/api/clusters/${clusterId}/nodes`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}/nodes`);
      if (!response.ok) {
        throw new Error('Failed to fetch nodes');
      }
      return response.json();
    }
  });

  // Refetch data when we receive updates via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NODE_CREATED') {
      refetchCluster();
      refetchNodes();
    }
  }, [lastMessage, refetchCluster, refetchNodes]);

  const isLoading = isClusterLoading || isNodesLoading;

  // Helper functions
  const getStatusBadge = (status: string) => {
    if (status === 'ready') {
      return <Badge variant="outline" className="bg-success-500/20 text-success-500 border-0">Ready</Badge>;
    } else if (status === 'not_ready') {
      return <Badge variant="outline" className="bg-warning-500/20 text-warning-500 border-0">Not Ready</Badge>;
    } else {
      return <Badge variant="outline" className="bg-destructive/20 text-destructive border-0">Error</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Generate some CPU/MemoryStick utilization data for the chart
  const roleColors = {
    'control-plane': 'var(--chart-1)',
    'worker': 'var(--chart-2)'
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {isClusterLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Nodes: ${cluster?.name || 'Unknown'}`
          )}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isClusterLoading ? (
            <Skeleton className="h-5 w-80" />
          ) : (
            `${cluster?.nodes} nodes in the cluster`
          )}
        </p>
      </div>
      
      {/* Resource utilization summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Average across all nodes
            </p>
            <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: '68%' }} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MemoryStick Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">
              Average across all nodes
            </p>
            <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-success-500" 
                style={{ width: '42%' }} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27%</div>
            <p className="text-xs text-muted-foreground">
              Average across all nodes
            </p>
            <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-success-500" 
                style={{ width: '27%' }} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245 Mbps</div>
            <p className="text-xs text-muted-foreground">
              Current overall traffic
            </p>
            <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-success-500" 
                style={{ width: '24.5%' }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Node table and details */}
      <Card className="mb-6">
        <Tabs defaultValue="table">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Cluster Nodes</CardTitle>
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="chart">Usage Charts</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="table" className="mt-0 pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>MemoryStick</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodes?.map((node: NodeData) => (
                      <TableRow key={node.id}>
                        <TableCell className="font-medium">{node.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "border-0",
                            node.role === "control-plane" 
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary-foreground"
                          )}>
                            {node.role === "control-plane" ? "Control Plane" : "Worker"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(node.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-16 mr-2">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full",
                                    node.cpuUtilization > 80 ? "bg-destructive" :
                                    node.cpuUtilization > 60 ? "bg-warning-500" :
                                    "bg-success-500"
                                  )}
                                  style={{ width: `${node.cpuUtilization}%` }} 
                                />
                              </div>
                            </div>
                            <span className="text-xs">{node.cpuUtilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-16 mr-2">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full",
                                    node.memoryUtilization > 80 ? "bg-destructive" :
                                    node.memoryUtilization > 60 ? "bg-warning-500" :
                                    "bg-success-500"
                                  )}
                                  style={{ width: `${node.memoryUtilization}%` }} 
                                />
                              </div>
                            </div>
                            <span className="text-xs">{node.memoryUtilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(node.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="chart" className="mt-0 pt-4">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-80">
                  <BarChart 
                    data={nodes?.map((node: NodeData) => ({
                      name: node.name,
                      CPU: node.cpuUtilization,
                      MemoryStick: node.memoryUtilization,
                      color: node.role === 'control-plane' ? 'var(--chart-1)' : 'var(--chart-2)'
                    })) || []}
                    index="name"
                    categories={["CPU", "MemoryStick"]}
                    colors={["#6366F1", "#10B981"]}
                    valueFormatter={(value) => `${value}%`}
                    yAxisWidth={40}
                  />
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* Node Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Node Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <div>
                    <div className="font-medium">Ready</div>
                    <div className="text-xs text-muted-foreground">All nodes are ready to accept pods</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success-500/20 text-success-500 border-0">Healthy</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <div>
                    <div className="font-medium">MemoryPressure</div>
                    <div className="text-xs text-muted-foreground">All nodes have sufficient memory</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success-500/20 text-success-500 border-0">Healthy</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <div>
                    <div className="font-medium">DiskPressure</div>
                    <div className="text-xs text-muted-foreground">All nodes have sufficient disk space</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success-500/20 text-success-500 border-0">Healthy</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
                  <div>
                    <div className="font-medium">PIDPressure</div>
                    <div className="text-xs text-muted-foreground">Some nodes have high PID usage</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-warning-500/20 text-warning-500 border-0">Warning</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
