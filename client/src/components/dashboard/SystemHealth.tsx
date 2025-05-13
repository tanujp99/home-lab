import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { AlertData } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import useWebSocket from '@/hooks/useWebSocket';

interface SystemHealthProps {
  clusterId: number;
}

export default function SystemHealth({ clusterId }: SystemHealthProps) {
  const { 
    data: alerts, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: [`/api/clusters/${clusterId}/alerts`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}/alerts`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    }
  });
  
  const { lastMessage } = useWebSocket();
  
  // Handle real-time alert updates from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ALERT_CREATED') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive';
      case 'warning':
        return 'border-warning-500';
      case 'info':
        return 'border-success-500';
      default:
        return 'border-muted';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive bg-opacity-20 text-destructive';
      case 'warning':
        return 'bg-warning-500 bg-opacity-20 text-warning-500';
      case 'info':
        return 'bg-success-500 bg-opacity-20 text-success-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAlertIcon = (severity: string, status: string) => {
    if (status === 'resolved') {
      return <CheckCircle className="text-success-500 mr-2" size={16} />;
    }
    
    return <AlertCircle className={`mr-2 ${
      severity === 'critical' ? 'text-destructive' : 
      severity === 'warning' ? 'text-warning-500' : 'text-muted-foreground'
    }`} size={16} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">System Health</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="text-muted-foreground">Active Alerts</div>
          <a href="#" className="text-primary hover:text-primary/80">View All</a>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/50 rounded-md p-3 animate-pulse border-l-4 border-muted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-muted rounded-full mr-2"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="mt-2 h-3 w-full bg-muted rounded"></div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-3 w-16 bg-muted rounded"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : (
            alerts?.map((alert: AlertData) => (
              <div 
                key={alert.id} 
                className={cn(
                  "bg-accent rounded-md p-3 border-l-4", 
                  getBorderColor(alert.severity)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getAlertIcon(alert.severity, alert.status)}
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <span className={cn(
                    "text-xs py-0.5 px-2 rounded",
                    getSeverityBadgeClass(alert.severity)
                  )}>
                    {alert.status === 'resolved' ? 'Resolved' : 
                     alert.severity === 'critical' ? 'Critical' : 
                     alert.severity === 'warning' ? 'Warning' : 'Info'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {alert.description}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="text-muted-foreground">{formatDate(alert.createdAt)}</div>
                  <button className="text-primary hover:text-primary/80">
                    {alert.status === 'resolved' ? 'Details' : 'Investigate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
