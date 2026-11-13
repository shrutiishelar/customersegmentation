/**
 * API Service Client for Backend Integration
 * 
 * IMPORTANT NOTE:
 * This service connects to the Spring Boot backend (running on http://localhost:8080).
 * 
 * By default, if the backend is not running, connectivity checks will truthfully
 * report "Not Connected (Offline)". No fake successful connections are simulated.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Checks system connectivity for Spring Boot API, MongoDB, and Spark Engine
 * Truthfully probes the backend health endpoint and reports actual status.
 */
export async function checkSystemStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for snappy UI

    const response = await fetch(`${API_BASE_URL}/system/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        apiConnected: true,
        mongoConnected: !!data.mongoConnected,
        sparkConnected: !!data.sparkConnected,
        totalCustomers: data.totalCustomers || 0,
        databaseName: data.databaseName || "customer_segmentation",
        details: data.details || "Connected to Spring Boot backend."
      };
    } else {
      const errJson = await response.json().catch(() => null);
      return {
        apiConnected: false,
        mongoConnected: false,
        sparkConnected: false,
        totalCustomers: 0,
        databaseName: "",
        details: errJson?.message || `Backend returned status ${response.status}`
      };
    }
  } catch (err) {
    // Graceful offline detection when backend is not running
    return {
      apiConnected: false,
      mongoConnected: false,
      sparkConnected: false,
      totalCustomers: 0,
      databaseName: "",
      details: err.name === 'AbortError' 
        ? "Connection timed out (Backend offline)" 
        : "Backend server not reachable on http://localhost:8080"
    };
  }
}

/**
 * Fetch all customers from MongoDB via Spring Boot
 */
export async function fetchCustomersFromApi(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.cluster !== undefined && filters.cluster !== 'all') params.append('cluster', filters.cluster);
  if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);

  const url = `${API_BASE_URL}/customers${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch customers: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch a single customer by ID or customerId
 */
export async function fetchCustomerById(id) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch customer: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Create a new customer record in MongoDB
 */
export async function createCustomerApi(customerData) {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create customer: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Update an existing customer record
 */
export async function updateCustomerApi(id, customerData) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update customer: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Delete a customer record by ID
 */
export async function deleteCustomerApi(id) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to delete customer: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch dashboard summary computed from MongoDB
 */
export async function fetchDashboardSummary() {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch dashboard summary: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Upload dataset CSV to Spring Boot backend
 */
export async function uploadDatasetFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/dataset/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Upload failed with status ${response.status}`);
  }
  return data;
}

/**
 * Trigger Spark MLlib K-Means clustering execution
 */
export async function runSegmentationApi(k = 5, maxIterations = 20) {
  const response = await fetch(`${API_BASE_URL}/segmentation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ k, maxIterations })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Spark clustering failed with status ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch status of the Spark MLlib clustering engine
 */
export async function fetchSegmentationStatus() {
  const response = await fetch(`${API_BASE_URL}/segmentation/status`);
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch Spark status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch latest segmentation results and centroids
 */
export async function fetchSegmentationResults() {
  const response = await fetch(`${API_BASE_URL}/segmentation/results`);
  if (response.status === 204) {
    return null; // No segmentation results yet
  }
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch segmentation results: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch computed Elbow Curve (WCSS vs K) from Spark
 */
export async function fetchElbowCurve(minK = 2, maxK = 8, maxIterations = 20) {
  const params = new URLSearchParams({ minK: String(minK), maxK: String(maxK), maxIterations: String(maxIterations) });
  const response = await fetch(`${API_BASE_URL}/segmentation/elbow?${params.toString()}`);
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to fetch elbow curve: ${response.status}`);
  }
  return await response.json();
}

/**
 * Backwards compatibility alias for triggerSparkSegmentation
 */
export async function triggerSparkSegmentation(k = 5, maxIterations = 20) {
  return runSegmentationApi(k, maxIterations);
}
