import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  percentage?: number;
  icon: React.ReactNode;
  status?: 'healthy' | 'warning' | 'critical';
}

export default function StatusCard({
  title,
  value,
  subValue,
  percentage = 100,
  icon,
  status = 'healthy'
}: StatusCardProps) {
  const statusColors = {
    healthy: 'bg-success-500',
    warning: 'bg-warning-500',
    critical: 'bg-destructive'
  };

  const iconColors = {
    healthy: 'text-success-500',
    warning: 'text-warning-500',
    critical: 'text-destructive'
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-muted-foreground font-medium">{title}</h3>
        <div className={cn("text-xl", iconColors[status])}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-semibold">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{subValue}</div>
        </div>
        <div className="h-12 w-20 bg-muted rounded-md flex items-end overflow-hidden">
          <div 
            className={cn("h-full w-full", statusColors[status])}
            style={{ height: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
