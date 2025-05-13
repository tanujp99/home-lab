import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';
import { PipelineData } from '@/types';
import { apiRequest } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DeploymentPipeline() {
  const { 
    data: pipelines, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['/api/pipelines'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/pipelines');
      return response.json();
    }
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-500 bg-opacity-20 text-success-500';
      case 'running':
        return 'bg-primary bg-opacity-20 text-primary';
      case 'failed':
        return 'bg-destructive bg-opacity-20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-500';
      case 'running':
        return 'bg-primary animate-pulse';
      case 'failed':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Deployment Pipeline</h3>
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
          <div className="text-muted-foreground">Latest Deployments</div>
          <a href="#" className="text-primary hover:text-primary/80">View in GitLab</a>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/50 rounded-md p-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted mr-2"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-3 w-40 bg-muted rounded"></div>
                  <div className="h-3 w-10 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : (
            pipelines?.map((pipeline: PipelineData) => (
              <div key={pipeline.id} className="bg-accent rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn("h-2.5 w-2.5 rounded-full mr-2", getStatusIndicatorClass(pipeline.status))}></div>
                    <span className="font-medium">{pipeline.name}</span>
                  </div>
                  <span className={cn("text-xs py-0.5 px-2 rounded", getStatusBadgeClass(pipeline.status))}>
                    {pipeline.status === 'success' ? 'Deployed' : 
                     pipeline.status === 'running' ? 'Running' : 
                     pipeline.status === 'failed' ? 'Failed' : pipeline.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Pipeline #{pipeline.pipelineId} | {pipeline.branch} | {pipeline.project}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(pipeline.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
