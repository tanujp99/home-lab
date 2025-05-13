import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Cluster model for Kubernetes clusters
export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  config: jsonb("config").notNull(),
  status: text("status").notNull(),
  nodes: integer("nodes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClusterSchema = createInsertSchema(clusters).omit({
  id: true,
  createdAt: true,
  nodes: true,
});

// Node model for Kubernetes nodes
export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clusterId: integer("cluster_id").notNull(),
  status: text("status").notNull(),
  role: text("role").notNull(), // control-plane or worker
  cpu: integer("cpu").notNull(),
  memory: integer("memory").notNull(),
  cpuUtilization: integer("cpu_utilization").notNull().default(0),
  memoryUtilization: integer("memory_utilization").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  createdAt: true,
  cpuUtilization: true,
  memoryUtilization: true,
});

// Deployment model for Kubernetes deployments
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namespace: text("namespace").notNull(),
  clusterId: integer("cluster_id").notNull(),
  status: text("status").notNull(),
  replicas: integer("replicas").notNull(),
  availableReplicas: integer("available_replicas").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
  availableReplicas: true,
});

// Alert model for system alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // critical, warning, info
  status: text("status").notNull(), // active, resolved
  resource: text("resource").notNull(),
  clusterId: integer("cluster_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Activity model for system activity
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // deployment, scaling, update, alert
  description: text("description").notNull(),
  resource: text("resource").notNull(),
  clusterId: integer("cluster_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Pipeline model for CI/CD pipelines
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  project: text("project").notNull(),
  branch: text("branch").notNull(),
  status: text("status").notNull(), // running, success, failed
  pipelineId: text("pipeline_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Service model for Kubernetes services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namespace: text("namespace").notNull(),
  clusterId: integer("cluster_id").notNull(),
  type: text("type").notNull(), // ClusterIP, NodePort, LoadBalancer
  status: text("status").notNull(),
  uptime: integer("uptime").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  uptime: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Cluster = typeof clusters.$inferSelect;
export type InsertCluster = z.infer<typeof insertClusterSchema>;

export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
