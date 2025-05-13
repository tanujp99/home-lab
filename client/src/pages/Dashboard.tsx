import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Server, Layers, Cpu, MemoryStick } from 'lucide-react';
import StatusCard from '@/components/dashboard/StatusCard';
import NetworkTopology from '@/components/dashboard/NetworkTopology';
import ResourceMetrics from '@/components/dashboard/ResourceMetrics';
import DeploymentPipeline from '@/components/dashboard/DeploymentPipeline';
import SystemHealth from '@/components/dashboard/SystemHealth';
import MicroservicesArchitecture from '@/components/dashboard/MicroservicesArchitecture';
import OptimizationRecommendations from '@/components/dashboard/OptimizationRecommendations';
import InfrastructureMonitoring from '@/components/dashboard/InfrastructureMonitoring';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClusterOverviewData } from '@/types';
import useWebSocket from '@/hooks/useWebSocket';

export default function Dashboard() {
  const [refreshInterval, setRefreshInterval] = useState('1m');
  // For the demo, we'll use cluster ID 1 as the default
  const clusterId = 1;
  
  // Initialize WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket(clusterId);
  
  // Fetch cluster overview data
  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ['/api/demo/cluster'],
    queryFn: async () => {
      const response = await fetch('/api/demo/cluster');
      if (!response.ok) {
        throw new Error('Failed to fetch cluster overview');
      }
      return response.json() as Promise<ClusterOverviewData>;
    },
  });

  // Set up auto-refresh based on selected interval
  useEffect(() => {
    let intervalId: number;
    
    if (refreshInterval) {
      const intervalMap: Record<string, number> = {
        '10s': 10 * 1000,
        '30s': 30 * 1000,
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
      };
      
      intervalId = window.setInterval(() => {
        refetch();
      }, intervalMap[refreshInterval] || 60 * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval, refetch]);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      // Refresh data when relevant messages are received
      refetch();
    }
  }, [lastMessage, refetch]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Cluster Overview</h2>
          <p className="text-muted-foreground mt-1">9-Node Kubernetes Cluster with Calico CNI</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Refresh:</span>
            <Select 
              value={refreshInterval}
              onValueChange={setRefreshInterval}
            >
              <SelectTrigger className="bg-background w-20">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10s">10s</SelectItem>
                <SelectItem value="30s">30s</SelectItem>
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            <span>Add Widget</span>
          </Button>
        </div>
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
      
      {/* Deployment Pipeline & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CI/CD Pipeline Status */}
        <DeploymentPipeline />
        
        {/* System Health & Alerts */}
        <SystemHealth clusterId={clusterId} />
      </div>
      
      {/* Infrastructure Overview & Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Microservices Architecture Dashboard */}
        <div className="lg:col-span-2">
          <MicroservicesArchitecture clusterId={clusterId} />
        </div>
        
        {/* Resource Optimization Recommendations */}
        <div>
          <OptimizationRecommendations clusterId={clusterId} />
        </div>
      </div>
      
      {/* Infrastructure Monitoring Dashboard */}
      <div className="mb-6">
        <InfrastructureMonitoring clusterId={clusterId} />
      </div>
      
      {/* Recent Activity & Service Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity clusterId={clusterId} />
        </div>
        
        {/* Service Status */}
        <div>
          <ServiceStatus clusterId={clusterId} />
        </div>
      </div>
    </div>
  );
}
