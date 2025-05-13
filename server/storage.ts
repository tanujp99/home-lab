import {
  type User,
  type InsertUser,
  type Cluster,
  type InsertCluster,
  type Node,
  type InsertNode,
  type Deployment,
  type InsertDeployment,
  type Alert,
  type InsertAlert,
  type Activity,
  type InsertActivity,
  type Pipeline,
  type InsertPipeline,
  type Service,
  type InsertService,
} from "@shared/schema";

// Define the interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cluster methods
  getClusters(): Promise<Cluster[]>;
  getCluster(id: number): Promise<Cluster | undefined>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;
  updateCluster(id: number, cluster: Partial<Cluster>): Promise<Cluster | undefined>;

  // Node methods
  getNodes(): Promise<Node[]>;
  getNode(id: number): Promise<Node | undefined>;
  getNodesByClusterId(clusterId: number): Promise<Node[]>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: number, node: Partial<Node>): Promise<Node | undefined>;

  // Deployment methods
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  getDeploymentsByClusterId(clusterId: number): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, deployment: Partial<Deployment>): Promise<Deployment | undefined>;

  // Alert methods
  getAlerts(): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByClusterId(clusterId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined>;

  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByClusterId(clusterId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Pipeline methods
  getPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: number, pipeline: Partial<Pipeline>): Promise<Pipeline | undefined>;

  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByClusterId(clusterId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clusters: Map<number, Cluster>;
  private nodes: Map<number, Node>;
  private deployments: Map<number, Deployment>;
  private alerts: Map<number, Alert>;
  private activities: Map<number, Activity>;
  private pipelines: Map<number, Pipeline>;
  private services: Map<number, Service>;

  private userId: number;
  private clusterId: number;
  private nodeId: number;
  private deploymentId: number;
  private alertId: number;
  private activityId: number;
  private pipelineId: number;
  private serviceId: number;

  constructor() {
    this.users = new Map();
    this.clusters = new Map();
    this.nodes = new Map();
    this.deployments = new Map();
    this.alerts = new Map();
    this.activities = new Map();
    this.pipelines = new Map();
    this.services = new Map();

    this.userId = 1;
    this.clusterId = 1;
    this.nodeId = 1;
    this.deploymentId = 1;
    this.alertId = 1;
    this.activityId = 1;
    this.pipelineId = 1;
    this.serviceId = 1;

    // Initialize with a demo cluster
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo cluster
    const cluster: Cluster = {
      id: this.clusterId++,
      name: "Production Cluster",
      endpoint: "https://kubernetes.example.com",
      config: { 
        version: "1.24.0",
        region: "us-west-1",
        provider: "self-hosted"
      },
      status: "healthy",
      nodes: 9,
      createdAt: new Date()
    };
    this.clusters.set(cluster.id, cluster);

    // Create demo nodes
    const nodeTypes = [
      { role: "control-plane", count: 3 },
      { role: "worker", count: 6 }
    ];

    nodeTypes.forEach(type => {
      for (let i = 0; i < type.count; i++) {
        const node: Node = {
          id: this.nodeId++,
          name: `${type.role}-${i+1}`,
          clusterId: cluster.id,
          status: "ready",
          role: type.role,
          cpu: 8,
          memory: 32,
          cpuUtilization: Math.floor(Math.random() * 80) + 10,
          memoryUtilization: Math.floor(Math.random() * 70) + 10,
          createdAt: new Date()
        };
        this.nodes.set(node.id, node);
      }
    });

    // Create demo deployments
    const deploymentNames = ["api-gateway", "auth-service", "billing-service", "user-service", "notification-service"];
    deploymentNames.forEach(name => {
      const replicas = Math.floor(Math.random() * 5) + 1;
      const availableReplicas = Math.floor(Math.random() * replicas) + 1;
      const deployment: Deployment = {
        id: this.deploymentId++,
        name,
        namespace: "default",
        clusterId: cluster.id,
        status: availableReplicas === replicas ? "healthy" : "degraded",
        replicas,
        availableReplicas,
        createdAt: new Date()
      };
      this.deployments.set(deployment.id, deployment);
    });

    // Create demo alerts
    const alertData = [
      { title: "High CPU Usage", description: "Node worker-3 CPU usage over 95% for 10m", severity: "critical", status: "active", resource: "node/worker-3" },
      { title: "Pod Restart", description: "Pod billing-service-54d8f7bc8c-xk2vj restarted 3 times", severity: "warning", status: "active", resource: "pod/billing-service-54d8f7bc8c-xk2vj" },
      { title: "Disk Space", description: "Node worker-5 disk usage over 80%", severity: "warning", status: "active", resource: "node/worker-5" },
      { title: "Service Latency", description: "API gateway response time returned to normal levels", severity: "info", status: "resolved", resource: "service/api-gateway" }
    ];
    
    alertData.forEach(data => {
      const alert: Alert = {
        id: this.alertId++,
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: data.status,
        resource: data.resource,
        clusterId: cluster.id,
        createdAt: new Date(),
        resolvedAt: data.status === "resolved" ? new Date() : null
      };
      this.alerts.set(alert.id, alert);
    });

    // Create demo activities
    const activityData = [
      { type: "system", description: "Updated Node worker-5 to latest version", resource: "node/worker-5" },
      { type: "security", description: "Network policy updated for billing namespace", resource: "networkpolicy/billing" },
      { type: "scaling", description: "HPA scaled auth-service from 3 to 5 replicas", resource: "hpa/auth-service" },
      { type: "deployment", description: "Deployed api-gateway v1.4.2 to production", resource: "deployment/api-gateway" },
      { type: "alert", description: "Critical alert triggered: High CPU usage on worker-3", resource: "node/worker-3" }
    ];
    
    activityData.forEach(data => {
      const activity: Activity = {
        id: this.activityId++,
        type: data.type,
        description: data.description,
        resource: data.resource,
        clusterId: cluster.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000))
      };
      this.activities.set(activity.id, activity);
    });

    // Create demo pipelines
    const pipelineData = [
      { name: "microservice-billing", project: "billing", branch: "main", status: "success", pipelineId: "456", url: "https://gitlab.com/example/billing/pipelines/456" },
      { name: "api-gateway", project: "gateway", branch: "develop", status: "running", pipelineId: "789", url: "https://gitlab.com/example/gateway/pipelines/789" },
      { name: "auth-service", project: "auth", branch: "feature/jwt", status: "failed", pipelineId: "654", url: "https://gitlab.com/example/auth/pipelines/654" },
      { name: "user-service", project: "user", branch: "main", status: "success", pipelineId: "345", url: "https://gitlab.com/example/user/pipelines/345" }
    ];
    
    pipelineData.forEach(data => {
      const pipeline: Pipeline = {
        id: this.pipelineId++,
        name: data.name,
        project: data.project,
        branch: data.branch,
        status: data.status,
        pipelineId: data.pipelineId,
        url: data.url,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
        completedAt: data.status !== "running" ? new Date() : null
      };
      this.pipelines.set(pipeline.id, pipeline);
    });

    // Create demo services
    const serviceData = [
      { name: "api-gateway", namespace: "default", type: "LoadBalancer", status: "healthy", uptime: 100 },
      { name: "auth-service", namespace: "default", type: "ClusterIP", status: "healthy", uptime: 99.8 },
      { name: "billing-service", namespace: "default", type: "ClusterIP", status: "degraded", uptime: 96.5 },
      { name: "user-service", namespace: "default", type: "ClusterIP", status: "healthy", uptime: 100 },
      { name: "notification-service", namespace: "default", type: "ClusterIP", status: "healthy", uptime: 99.9 },
      { name: "analytics-service", namespace: "analytics", type: "ClusterIP", status: "healthy", uptime: 100 },
      { name: "search-service", namespace: "search", type: "ClusterIP", status: "healthy", uptime: 99.7 },
      { name: "reporting-service", namespace: "reporting", type: "ClusterIP", status: "outage", uptime: 85.0 }
    ];
    
    serviceData.forEach(data => {
      const service: Service = {
        id: this.serviceId++,
        name: data.name,
        namespace: data.namespace,
        clusterId: cluster.id,
        type: data.type,
        status: data.status,
        uptime: data.uptime,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000))
      };
      this.services.set(service.id, service);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Cluster methods
  async getClusters(): Promise<Cluster[]> {
    return Array.from(this.clusters.values());
  }

  async getCluster(id: number): Promise<Cluster | undefined> {
    return this.clusters.get(id);
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const id = this.clusterId++;
    const newCluster: Cluster = {
      ...cluster,
      id,
      nodes: 0,
      createdAt: new Date()
    };
    this.clusters.set(id, newCluster);
    return newCluster;
  }

  async updateCluster(id: number, cluster: Partial<Cluster>): Promise<Cluster | undefined> {
    const existingCluster = this.clusters.get(id);
    if (!existingCluster) return undefined;

    const updatedCluster = { ...existingCluster, ...cluster };
    this.clusters.set(id, updatedCluster);
    return updatedCluster;
  }

  // Node methods
  async getNodes(): Promise<Node[]> {
    return Array.from(this.nodes.values());
  }

  async getNode(id: number): Promise<Node | undefined> {
    return this.nodes.get(id);
  }

  async getNodesByClusterId(clusterId: number): Promise<Node[]> {
    return Array.from(this.nodes.values()).filter(node => node.clusterId === clusterId);
  }

  async createNode(node: InsertNode): Promise<Node> {
    const id = this.nodeId++;
    const newNode: Node = {
      ...node,
      id,
      cpuUtilization: 0,
      memoryUtilization: 0,
      createdAt: new Date()
    };
    this.nodes.set(id, newNode);

    // Update cluster node count
    const cluster = this.clusters.get(node.clusterId);
    if (cluster) {
      cluster.nodes += 1;
      this.clusters.set(cluster.id, cluster);
    }

    return newNode;
  }

  async updateNode(id: number, node: Partial<Node>): Promise<Node | undefined> {
    const existingNode = this.nodes.get(id);
    if (!existingNode) return undefined;

    const updatedNode = { ...existingNode, ...node };
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }

  // Deployment methods
  async getDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values());
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async getDeploymentsByClusterId(clusterId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).filter(deployment => deployment.clusterId === clusterId);
  }

  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const id = this.deploymentId++;
    const newDeployment: Deployment = {
      ...deployment,
      id,
      availableReplicas: 0,
      createdAt: new Date()
    };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  async updateDeployment(id: number, deployment: Partial<Deployment>): Promise<Deployment | undefined> {
    const existingDeployment = this.deployments.get(id);
    if (!existingDeployment) return undefined;

    const updatedDeployment = { ...existingDeployment, ...deployment };
    this.deployments.set(id, updatedDeployment);
    return updatedDeployment;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByClusterId(clusterId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.clusterId === clusterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      createdAt: new Date(),
      resolvedAt: null
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined> {
    const existingAlert = this.alerts.get(id);
    if (!existingAlert) return undefined;

    const updatedAlert = { ...existingAlert, ...alert };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivitiesByClusterId(clusterId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.clusterId === clusterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Pipeline methods
  async getPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPipeline(id: number): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }

  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const id = this.pipelineId++;
    const newPipeline: Pipeline = {
      ...pipeline,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.pipelines.set(id, newPipeline);
    return newPipeline;
  }

  async updatePipeline(id: number, pipeline: Partial<Pipeline>): Promise<Pipeline | undefined> {
    const existingPipeline = this.pipelines.get(id);
    if (!existingPipeline) return undefined;

    const updatedPipeline = { ...existingPipeline, ...pipeline };
    this.pipelines.set(id, updatedPipeline);
    return updatedPipeline;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByClusterId(clusterId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.clusterId === clusterId);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const newService: Service = {
      ...service,
      id,
      uptime: 100,
      createdAt: new Date()
    };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;

    const updatedService = { ...existingService, ...service };
    this.services.set(id, updatedService);
    return updatedService;
  }
}

export const storage = new MemStorage();
