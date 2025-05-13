import { useEffect, useState, useRef } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { format } from 'date-fns';

interface MetricDataPoint {
  x: string;
  y: number;
}

interface MetricSeries {
  id: string;
  color: string;
  data: MetricDataPoint[];
}

interface InfrastructureMonitoringProps {
  clusterId: number;
}

export default function InfrastructureMonitoring({ clusterId }: InfrastructureMonitoringProps) {
  const [timeRange, setTimeRange] = useState('6h');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<MetricSeries[]>([]);
  const [keyMetrics, setKeyMetrics] = useState<{ label: string; value: string; change: string; changeType: string; }[]>([]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const loadMetricsData = () => {
      setLoading(true);
      
      // Simulating API call - in a real application, this would fetch data from Prometheus
      setTimeout(() => {
        // Generate realistic time series data for CPU, memory, and network
        const now = new Date();
        const timePoints = 24; // 24 data points
        
        // Generate data points at regular intervals going back in time
        const generateDataPoints = (baseValue: number, volatility: number) => {
          const points: MetricDataPoint[] = [];
          for (let i = timePoints - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * (3600000 / 4)); // 15 minutes intervals
            const random = Math.random() * volatility - (volatility / 2);
            const value = Math.max(0, Math.min(100, baseValue + random));
            
            points.push({
              x: format(date, 'HH:mm'),
              y: parseFloat(value.toFixed(1))
            });
          }
          return points;
        };
        
        const metricsSeries: MetricSeries[] = [
          {
            id: 'CPU Utilization',
            color: '#6366F1',
            data: generateDataPoints(68, 15)
          },
          {
            id: 'Memory Utilization',
            color: '#10B981',
            data: generateDataPoints(42, 8)
          },
          {
            id: 'Network Traffic',
            color: '#F59E0B',
            data: generateDataPoints(30, 20)
          }
        ];
        
        const keyMetricsData = [
          { 
            label: 'Pod Health Score', 
            value: '97.2%', 
            change: '2.1%', 
            changeType: 'positive' 
          },
          { 
            label: 'Avg Response Time', 
            value: '128ms', 
            change: '8.5%', 
            changeType: 'negative' 
          },
          { 
            label: 'Error Rate', 
            value: '0.8%', 
            change: '0.3%', 
            changeType: 'positive' 
          },
          { 
            label: 'Uptime', 
            value: '99.97%', 
            change: '', 
            changeType: 'neutral' 
          }
        ];
        
        setMetricsData(metricsSeries);
        setKeyMetrics(keyMetricsData);
        setLoading(false);
      }, 800);
    };
    
    loadMetricsData();
  }, [clusterId, timeRange]);

  return (
    <div className={`bg-card rounded-lg border border-border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Infrastructure Monitoring</h3>
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
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-80'} flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className={`w-full ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'}`}>
            <ResponsiveLine
              data={metricsData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              curve="monotoneX"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Time',
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Utilization (%)',
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              colors={(d) => d.color}
              pointSize={4}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              enableGridX={false}
              gridYValues={[0, 25, 50, 75, 100]}
              useMesh={true}
              animate={true}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 50,
                  itemsSpacing: 20,
                  itemDirection: 'left-to-right',
                  itemWidth: 100,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)'
                }
              ]}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: 'hsl(var(--muted-foreground))'
                    }
                  },
                  legend: {
                    text: {
                      fill: 'hsl(var(--muted-foreground))'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: 'hsl(var(--border))'
                  }
                },
                legends: {
                  text: {
                    fill: 'hsl(var(--foreground))'
                  }
                },
                tooltip: {
                  container: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: '1px solid hsl(var(--border))'
                  }
                }
              }}
            />
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            // Skeleton loading state for key metrics
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/50 p-3 rounded-md animate-pulse">
                <div className="h-3 w-24 bg-muted rounded mb-1"></div>
                <div className="h-5 w-16 bg-muted rounded"></div>
                <div className="h-3 w-12 bg-muted rounded mt-1"></div>
              </div>
            ))
          ) : (
            keyMetrics.map((metric, index) => (
              <div key={index} className="bg-accent p-3 rounded-md">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {metric.label}
                </div>
                <div className="flex items-end">
                  <div className="text-2xl font-semibold">{metric.value}</div>
                  {metric.change && (
                    <div className={`text-xs ml-2 flex items-center ${
                      metric.changeType === 'positive' ? 'text-success-500' : 
                      metric.changeType === 'negative' ? 'text-warning-500' : 'text-muted-foreground'
                    }`}>
                      {metric.changeType === 'positive' ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-0.5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      ) : metric.changeType === 'negative' ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-0.5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      ) : null}
                      <span>{metric.change}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {index === 3 ? 'SLA: 99.9%' : 'vs last week'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
