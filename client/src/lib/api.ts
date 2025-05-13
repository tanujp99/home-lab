/**
 * Utility functions for making API requests
 */

/**
 * Makes an API request with the specified method and data
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - API endpoint URL
 * @param data - Optional data to send with the request
 * @returns Promise resolving to the Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }
  
  return response;
}

/**
 * Fetches cluster overview data
 * @returns Promise resolving to the cluster overview data
 */
export async function fetchClusterOverview() {
  const response = await apiRequest('GET', '/api/demo/cluster');
  return response.json();
}

/**
 * Fetches cluster data by ID
 * @param clusterId - ID of the cluster to fetch
 * @returns Promise resolving to the cluster data
 */
export async function fetchCluster(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}`);
  return response.json();
}

/**
 * Fetches nodes for a specific cluster
 * @param clusterId - ID of the cluster
 * @returns Promise resolving to the nodes data
 */
export async function fetchNodes(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}/nodes`);
  return response.json();
}

/**
 * Fetches deployments for a specific cluster
 * @param clusterId - ID of the cluster
 * @returns Promise resolving to the deployments data
 */
export async function fetchDeployments(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}/deployments`);
  return response.json();
}

/**
 * Fetches alerts for a specific cluster
 * @param clusterId - ID of the cluster
 * @returns Promise resolving to the alerts data
 */
export async function fetchAlerts(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}/alerts`);
  return response.json();
}

/**
 * Fetches activities for a specific cluster
 * @param clusterId - ID of the cluster
 * @returns Promise resolving to the activities data
 */
export async function fetchActivities(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}/activities`);
  return response.json();
}

/**
 * Fetches services for a specific cluster
 * @param clusterId - ID of the cluster
 * @returns Promise resolving to the services data
 */
export async function fetchServices(clusterId: number) {
  const response = await apiRequest('GET', `/api/clusters/${clusterId}/services`);
  return response.json();
}

/**
 * Fetches pipelines data
 * @returns Promise resolving to the pipelines data
 */
export async function fetchPipelines() {
  const response = await apiRequest('GET', '/api/pipelines');
  return response.json();
}

/**
 * Creates a new alert
 * @param alertData - Alert data to create
 * @returns Promise resolving to the created alert
 */
export async function createAlert(alertData: any) {
  const response = await apiRequest('POST', '/api/alerts', alertData);
  return response.json();
}

/**
 * Creates a new activity
 * @param activityData - Activity data to create
 * @returns Promise resolving to the created activity
 */
export async function createActivity(activityData: any) {
  const response = await apiRequest('POST', '/api/activities', activityData);
  return response.json();
}

/**
 * Creates a new deployment
 * @param deploymentData - Deployment data to create
 * @returns Promise resolving to the created deployment
 */
export async function createDeployment(deploymentData: any) {
  const response = await apiRequest('POST', '/api/deployments', deploymentData);
  return response.json();
}

/**
 * Creates a new service
 * @param serviceData - Service data to create
 * @returns Promise resolving to the created service
 */
export async function createService(serviceData: any) {
  const response = await apiRequest('POST', '/api/services', serviceData);
  return response.json();
}
