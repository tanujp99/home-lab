import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Server, Layers, Cpu, MemoryStick } from 'lucide-react';
import StatusCard from '@/components/dashboard/StatusCard';
import NetworkTopology from '@/components/dashboard/NetworkTopology';
import ResourceMetrics from '@/components/dashboard/ResourceMetrics';
import SystemHealth from '@/components/dashboard/SystemHealth';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import RecentActivity from '@/components/dashboard/RecentActivity';
import InfrastructureMonitoring from '@/components/dashboard/InfrastructureMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { ClusterOverviewData } from '@/types';
import useWebSocket from '@/hooks/useWebSocket';

export default function ClusterOverview() {
  const params = useParams<{ id: string }>();
  const clusterId = parseInt(params.id, 10);
  
  // Initialize WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket(clusterId);

  // Fetch cluster data
  const { data: cluster, isLoading: isClusterLoading } = useQuery({
    queryKey: [`/api/clusters/${clusterId}`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cluster');
      }
      return response.json();
    }
  });

  // Fetch cluster overview metrics
  const { data: overview, isLoading: isOverviewLoading, refetch } = useQuery({
    queryKey: ['/api/demo/cluster'],
    queryFn: async () => {
      const response = await fetch('/api/demo/cluster');
      if (!response.ok) {
        throw new Error('Failed to fetch cluster overview');
      }
      return response.json() as Promise<ClusterOverviewData>;
    }
  });

  // Refetch data when we receive updates via WebSocket
  useEffect(() => {
    if (lastMessage) {
      refetch();
    }
  }, [lastMessage, refetch]);

  const isLoading = isClusterLoading || isOverviewLoading;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {isClusterLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Cluster: ${cluster?.name || 'Unknown'}`
          )}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isClusterLoading ? (
            <Skeleton className="h-5 w-80" />
          ) : (
            `${cluster?.nodes} Nodes • ${cluster?.endpoint}`
          )}
        </p>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Node Status Card */}
        <StatusCard
          title="Nodes"
          value={isLoading ? '...' : `${overview?.nodes.ready}/${overview?.nodes.total}`}
          subValue="Ready"
          percentage={isLoading ? 0 : (overview?.nodes.ready / overview?.nodes.total) * 100}
          icon={<Server className="h-5 w-5" />}
          status={isLoading ? 'healthy' : overview?.nodes.status as 'healthy' | 'warning' | 'critical'}
        />
        
        {/* Pod Status Card */}
        <StatusCard
          title="Pods"
          value={isLoading ? '...' : `${overview?.pods.ready}/${overview?.pods.total}`}
          subValue="Ready"
          percentage={isLoading ? 0 : (overview?.pods.ready / overview?.pods.total) * 100}
          icon={<Layers className="h-5 w-5" />}
          status={isLoading ? 'healthy' : overview?.pods.status as 'healthy' | 'warning' | 'critical'}
        />
        
        {/* CPU Utilization Card */}
        <StatusCard
          title="CPU"
          value={isLoading ? '...' : `${overview?.cpu.utilization}%`}
          subValue="Utilization"
          percentage={isLoading ? 0 : overview?.cpu.utilization || 0}
          icon={<Cpu className="h-5 w-5" />}
          status={isLoading ? 'healthy' : overview?.cpu.status as 'healthy' | 'warning' | 'critical'}
        />
        
        {/* MemoryStick Utilization Card */}
        <StatusCard
          title="MemoryStick"
          value={isLoading ? '...' : `${overview?.memory.utilization}%`}
          subValue="Utilization"
          percentage={isLoading ? 0 : overview?.memory.utilization || 0}
          icon={<MemoryStick className="h-5 w-5" />}
          status={isLoading ? 'healthy' : overview?.memory.status as 'healthy' | 'warning' | 'critical'}
        />
      </div>
      
      {/* Network Topology & Resource Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Network Topology Visualization */}
        <div className="lg:col-span-2">
          <NetworkTopology clusterId={clusterId} />
        </div>
        
        {/* Resource Utilization Metrics */}
        <div>
          <ResourceMetrics clusterId={clusterId} />
        </div>
      </div>
      
      {/* Infrastructure Monitoring Dashboard */}
      <div className="mb-6">
        <InfrastructureMonitoring clusterId={clusterId} />
      </div>
      
      {/* System Health & Service Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* System Health & Alerts */}
        <SystemHealth clusterId={clusterId} />
        
        {/* Service Status */}
        <ServiceStatus clusterId={clusterId} />
      </div>
      
      {/* Recent Activity */}
      <div className="mb-6">
        <RecentActivity clusterId={clusterId} />
      </div>
    </div>
  );
}
