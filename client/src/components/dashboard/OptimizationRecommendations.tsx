import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Cpu, Database, Layers, ShieldCheck } from 'lucide-react';
import { OptimizationRecommendation } from '@/types';

interface OptimizationRecommendationsProps {
  clusterId: number;
}

export default function OptimizationRecommendations({ clusterId }: OptimizationRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = () => {
      setLoading(true);
      
      // Simulating API call
      setTimeout(() => {
        // In a real application, these recommendations would come from analyzing
        // resource usage patterns, configuration best practices, etc.
        const demoRecommendations: OptimizationRecommendation[] = [
          {
            id: '1',
            icon: 'cpu',
            title: 'CPU Resource Limits',
            description: 'Adjust CPU limits for auth-service. Currently over-provisioned by 45%.',
            type: 'resource'
          },
          {
            id: '2',
            icon: 'database',
            title: 'Storage Optimization',
            description: 'Consider using dynamic PVC provisioning for analytics-service to reduce storage costs.',
            type: 'storage'
          },
          {
            id: '3',
            icon: 'layers',
            title: 'Pod Scaling',
            description: 'Implement HPA for billing-service based on CPU and memory metrics to handle traffic spikes.',
            type: 'scaling'
          },
          {
            id: '4',
            icon: 'shield',
            title: 'Security Improvement',
            description: 'Implement network policies to restrict traffic between frontend and database services.',
            type: 'security'
          }
        ];
        
        setRecommendations(demoRecommendations);
        setLoading(false);
      }, 800);
    };
    
    loadRecommendations();
  }, [clusterId]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="text-warning-500 mr-2" size={16} />;
      case 'database':
        return <Database className="text-warning-500 mr-2" size={16} />;
      case 'layers':
        return <Layers className="text-primary mr-2" size={16} />;
      case 'shield':
        return <ShieldCheck className="text-success-500 mr-2" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h3 className="font-medium">Optimization Recommendations</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/50 rounded-md p-3 animate-pulse">
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-muted rounded-full mr-2"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
                <div className="h-3 w-full bg-muted rounded mb-2"></div>
                <div className="h-6 w-32 bg-muted rounded"></div>
              </div>
            ))
          ) : (
            recommendations.map((recommendation) => (
              <div key={recommendation.id} className="bg-accent p-3 rounded-md">
                <div className="flex items-center mb-2">
                  {getIconComponent(recommendation.icon)}
                  <div className="text-sm font-medium">{recommendation.title}</div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {recommendation.description}
                </div>
                <Button variant="secondary" size="sm">
                  Apply Recommendation
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
