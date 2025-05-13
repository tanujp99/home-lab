import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceData } from '@/types';
import { Button } from '@/components/ui/button';
import useWebSocket from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

interface ServiceStatusProps {
  clusterId: number;
}

export default function ServiceStatus({ clusterId }: ServiceStatusProps) {
  const { 
    data: services, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: [`/api/clusters/${clusterId}/services`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    }
  });

  const { lastMessage } = useWebSocket();
  
  // Handle real-time service updates from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'SERVICE_CREATED') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success-500';
      case 'degraded':
        return 'bg-warning-500 animate-pulse';
      case 'outage':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getUptimeText = (service: ServiceData) => {
    if (service.status === 'outage') return 'Outage';
    if (service.status === 'degraded') return 'Degraded';
    return `${service.uptime}% uptime`;
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Service Status</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2 rounded hover:bg-accent animate-pulse"
              >
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted mr-2"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            ))
          ) : (
            services?.map((service: ServiceData) => (
              <div 
                key={service.id} 
                className="flex items-center justify-between p-2 rounded hover:bg-accent"
              >
                <div className="flex items-center">
                  <div 
                    className={cn(
                      "h-2.5 w-2.5 rounded-full mr-2",
                      getStatusIndicatorClass(service.status)
                    )}
                  ></div>
                  <span className="text-sm">{service.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getUptimeText(service)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
