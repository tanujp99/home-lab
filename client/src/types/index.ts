export interface ClusterOverviewData {
  nodes: {
    total: number;
    ready: number;
    status: string;
  };
  pods: {
    total: number;
    ready: number;
    status: string;
  };
  cpu: {
    utilization: number;
    status: string;
  };
  memory: {
    utilization: number;
    status: string;
  };
}

export interface NodeData {
  id: number;
  name: string;
  clusterId: number;
  status: string;
  role: string;
  cpu: number;
  memory: number;
  cpuUtilization: number;
  memoryUtilization: number;
  createdAt: string;
}

export interface DeploymentData {
  id: number;
  name: string;
  namespace: string;
  clusterId: number;
  status: string;
  replicas: number;
  availableReplicas: number;
  createdAt: string;
}

export interface AlertData {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  resource: string;
  clusterId: number;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ActivityData {
  id: number;
  type: string;
  description: string;
  resource: string;
  clusterId: number;
  createdAt: string;
}

export interface PipelineData {
  id: number;
  name: string;
  project: string;
  branch: string;
  status: string;
  pipelineId: string;
  url: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ServiceData {
  id: number;
  name: string;
  namespace: string;
  clusterId: number;
  type: string;
  status: string;
  uptime: number;
  createdAt: string;
}

export interface NetworkNode {
  id: string;
  type: string;
  data: {
    label: string;
    status: string;
    role?: string;
    nodeData?: NodeData;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  style?: {
    stroke?: string;
  };
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface ResourceMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: string;
}

export interface OptimizationRecommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}
