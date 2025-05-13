import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertClusterSchema,
  insertNodeSchema,
  insertDeploymentSchema,
  insertAlertSchema,
  insertActivitySchema,
  insertPipelineSchema,
  insertServiceSchema,
} from "@shared/schema";

// Type for WebSocket clients with additional cluster info
interface ExtendedWebSocket extends WebSocket {
  clusterId?: number;
  isAlive?: boolean;
}

// WebSocket clients by cluster ID
const clients = new Map<number, Set<ExtendedWebSocket>>();

// Helper to broadcast updates to all clients subscribed to a cluster
const broadcastToCluster = (clusterId: number, message: any) => {
  const clusterClients = clients.get(clusterId);
  if (!clusterClients) return;

  const data = JSON.stringify(message);
  clusterClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // WebSocket ping interval to check for stale connections
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) return ws.terminate();
      extWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(pingInterval);
  });

  wss.on("connection", (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle subscription to cluster updates
        if (data.type === "subscribe" && data.clusterId) {
          ws.clusterId = data.clusterId;
          if (!clients.has(data.clusterId)) {
            clients.set(data.clusterId, new Set());
          }
          clients.get(data.clusterId)!.add(ws);
          console.log(`Client subscribed to cluster ${data.clusterId}`);
        }
      } catch (err) {
        console.error("Invalid WebSocket message", err);
      }
    });

    ws.on("close", () => {
      if (ws.clusterId && clients.has(ws.clusterId)) {
        clients.get(ws.clusterId)!.delete(ws);
        if (clients.get(ws.clusterId)!.size === 0) {
          clients.delete(ws.clusterId);
        }
      }
    });
  });

  // API routes
  app.get("/api/clusters", async (req, res) => {
    const clusters = await storage.getClusters();
    res.json(clusters);
  });

  app.get("/api/clusters/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const cluster = await storage.getCluster(id);
    if (!cluster) {
      return res.status(404).json({ message: "Cluster not found" });
    }

    res.json(cluster);
  });

  app.post("/api/clusters", async (req, res) => {
    try {
      const clusterData = insertClusterSchema.parse(req.body);
      const cluster = await storage.createCluster(clusterData);
      res.status(201).json(cluster);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cluster data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create cluster" });
    }
  });

  app.get("/api/clusters/:id/nodes", async (req, res) => {
    const clusterId = parseInt(req.params.id);
    if (isNaN(clusterId)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const nodes = await storage.getNodesByClusterId(clusterId);
    res.json(nodes);
  });

  app.post("/api/nodes", async (req, res) => {
    try {
      const nodeData = insertNodeSchema.parse(req.body);
      const node = await storage.createNode(nodeData);
      
      // Broadcast node creation to subscribed clients
      broadcastToCluster(nodeData.clusterId, {
        type: "NODE_CREATED",
        node,
      });

      res.status(201).json(node);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid node data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create node" });
    }
  });

  app.get("/api/clusters/:id/deployments", async (req, res) => {
    const clusterId = parseInt(req.params.id);
    if (isNaN(clusterId)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const deployments = await storage.getDeploymentsByClusterId(clusterId);
    res.json(deployments);
  });

  app.post("/api/deployments", async (req, res) => {
    try {
      const deploymentData = insertDeploymentSchema.parse(req.body);
      const deployment = await storage.createDeployment(deploymentData);
      
      // Broadcast deployment creation to subscribed clients
      broadcastToCluster(deploymentData.clusterId, {
        type: "DEPLOYMENT_CREATED",
        deployment,
      });

      res.status(201).json(deployment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deployment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  app.get("/api/clusters/:id/alerts", async (req, res) => {
    const clusterId = parseInt(req.params.id);
    if (isNaN(clusterId)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const alerts = await storage.getAlertsByClusterId(clusterId);
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      
      // Broadcast alert creation to subscribed clients
      broadcastToCluster(alertData.clusterId, {
        type: "ALERT_CREATED",
        alert,
      });

      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.get("/api/clusters/:id/activities", async (req, res) => {
    const clusterId = parseInt(req.params.id);
    if (isNaN(clusterId)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const activities = await storage.getActivitiesByClusterId(clusterId);
    res.json(activities);
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      
      // Broadcast activity creation to subscribed clients
      broadcastToCluster(activityData.clusterId, {
        type: "ACTIVITY_CREATED",
        activity,
      });

      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.get("/api/pipelines", async (req, res) => {
    const pipelines = await storage.getPipelines();
    res.json(pipelines);
  });

  app.post("/api/pipelines", async (req, res) => {
    try {
      const pipelineData = insertPipelineSchema.parse(req.body);
      const pipeline = await storage.createPipeline(pipelineData);
      res.status(201).json(pipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pipeline data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  app.get("/api/clusters/:id/services", async (req, res) => {
    const clusterId = parseInt(req.params.id);
    if (isNaN(clusterId)) {
      return res.status(400).json({ message: "Invalid cluster ID" });
    }

    const services = await storage.getServicesByClusterId(clusterId);
    res.json(services);
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      // Broadcast service creation to subscribed clients
      broadcastToCluster(serviceData.clusterId, {
        type: "SERVICE_CREATED",
        service,
      });

      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Simulated data for demonstration
  app.get("/api/demo/cluster", async (req, res) => {
    const clusterOverview = {
      nodes: {
        total: 9,
        ready: 9,
        status: "healthy",
      },
      pods: {
        total: 45,
        ready: 42,
        status: "warning",
      },
      cpu: {
        utilization: 68,
        status: "warning",
      },
      memory: {
        utilization: 42,
        status: "healthy",
      },
    };
    
    res.json(clusterOverview);
  });

  return httpServer;
}
