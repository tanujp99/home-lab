import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ActivityData } from '@/types';
import { Button } from '@/components/ui/button';
import useWebSocket from '@/hooks/useWebSocket';

interface RecentActivityProps {
  clusterId: number;
}

export default function RecentActivity({ clusterId }: RecentActivityProps) {
  const { 
    data: activities, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: [`/api/clusters/${clusterId}/activities`],
    queryFn: async () => {
      const response = await fetch(`/api/clusters/${clusterId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    }
  });

  const { lastMessage } = useWebSocket();
  
  // Handle real-time activity updates from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ACTIVITY_CREATED') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const getIconClass = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-primary';
      case 'security':
        return 'bg-success-500';
      case 'scaling':
        return 'bg-warning-500';
      case 'deployment':
        return 'bg-primary';
      case 'alert':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getIconContent = (type: string) => {
    switch (type) {
      case 'system':
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        );
      case 'security':
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        );
      case 'scaling':
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.74"/>
          </svg>
        );
      case 'deployment':
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
            <path d="m16 5 3 3-3 3"/>
            <path d="M10 8.5H5"/>
            <path d="M10 11.5H5"/>
            <path d="M10 14.5H5"/>
          </svg>
        );
      case 'alert':
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      default:
        return (
          <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
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

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Recent Activity</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => refetch()}
        >
          View All
        </Button>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start animate-pulse">
                <div className="rounded-full h-8 w-8 bg-muted flex-shrink-0 mt-1"></div>
                <div className="ml-3 w-full">
                  <div className="flex items-center">
                    <div className="h-4 bg-muted rounded w-20 mr-2"></div>
                    <div className="h-4 bg-muted rounded w-4 mx-1.5"></div>
                    <div className="h-4 bg-muted rounded w-40"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-20 mt-1"></div>
                </div>
              </div>
            ))
          ) : (
            activities?.map((activity: ActivityData) => (
              <div key={activity.id} className="flex items-start">
                <div className={`${getIconClass(activity.type)} rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1`}>
                  {getIconContent(activity.type)}
                </div>
                <div className="ml-3">
                  <div className="flex items-center text-sm">
                    <span className="font-medium capitalize">{activity.type}</span>
                    <span className="mx-1.5 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{activity.description}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(activity.createdAt)}
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
