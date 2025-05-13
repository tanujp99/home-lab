import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResourceMetric } from '@/types';
import { cn } from '@/lib/utils';

const getBarColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'from-success-500 to-success-600';
    case 'warning':
      return 'from-warning-500 to-warning-600';
    case 'critical':
      return 'from-destructive to-destructive/90';
    default:
      return 'from-primary to-primary/90';
  }
};

interface ResourceMetricsProps {
  clusterId: number;
}

export default function ResourceMetrics({ clusterId }: ResourceMetricsProps) {
  const [timeRange, setTimeRange] = useState('6h');
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResourceMetrics = () => {
      setLoading(true);
      
      // Simulating API call
      setTimeout(() => {
        // In a real application, this would come from an API call to 
        // Prometheus or Kubernetes metrics server
        const demoMetrics: ResourceMetric[] = [
          {
            name: 'CPU Utilization',
            value: 68,
            max: 100,
            unit: '%',
            status: 'warning'
          },
          {
            name: 'Memory Utilization',
            value: 42,
            max: 100,
            unit: '%',
            status: 'healthy'
          },
          {
            name: 'Storage Utilization',
            value: 27,
            max: 100,
            unit: '%',
            status: 'healthy'
          },
          {
            name: 'Network (Mbps)',
            value: 245,
            max: 1000,
            unit: '',
            status: 'healthy'
          }
        ];
        
        setMetrics(demoMetrics);
        setLoading(false);
      }, 800);
    };
    
    loadResourceMetrics();
  }, [clusterId, timeRange]);

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Resource Metrics</h3>
        <div className="flex space-x-2">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="bg-background w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-10"></div>
                </div>
                <div className="h-10 bg-muted rounded-md w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-muted-foreground">{metric.name}</div>
                  <div className="text-sm font-medium">
                    {metric.value}{metric.unit === '%' ? '%' : ` / ${metric.max}${metric.unit}`}
                  </div>
                </div>
                <div className="h-10 bg-muted rounded-md overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r rounded-l-md",
                      getBarColor(metric.status)
                    )}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <a 
                href="#" 
                className="text-primary text-sm hover:text-primary/80 flex items-center"
              >
                <span>View detailed metrics</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
