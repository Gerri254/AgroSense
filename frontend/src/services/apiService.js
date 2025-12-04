import { API_CONFIG } from '../config/apiConfig';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check
  async checkHealth() {
    return this.get(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Authentication
  async register(username, password, role = 'farmer') {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, { username, password, role });
  }

  async login(username, password) {
    const response = await this.post(API_CONFIG.ENDPOINTS.LOGIN, { username, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.get(API_CONFIG.ENDPOINTS.ME);
  }

  // Sensors
  async getCurrentSensorData() {
    return this.get(API_CONFIG.ENDPOINTS.SENSORS_CURRENT);
  }

  async getSensorHistory(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.SENSORS_HISTORY, params);
  }

  async getAggregatedSensorData(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.SENSORS_AGGREGATED, params);
  }

  async getSensorStats(days = 7) {
    return this.get(API_CONFIG.ENDPOINTS.SENSORS_STATS, { days });
  }

  // Actuators
  async controlPump(status, mode) {
    const payload = { status };
    if (mode !== undefined) {
      payload.mode = mode;
    }
    return this.post(API_CONFIG.ENDPOINTS.PUMP_CONTROL, payload);
  }

  async controlFan(status, mode) {
    const payload = { status };
    if (mode !== undefined) {
      payload.mode = mode;
    }
    return this.post(API_CONFIG.ENDPOINTS.FAN_CONTROL, payload);
  }

  async getActuatorLogs(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.ACTUATOR_LOGS, params);
  }

  async getActuatorStats(days = 7) {
    return this.get(API_CONFIG.ENDPOINTS.ACTUATOR_STATS, { days });
  }

  // Alerts
  async getAlerts(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.ALERTS, params);
  }

  async getLatestAlert() {
    return this.get(API_CONFIG.ENDPOINTS.ALERTS_LATEST);
  }

  async acknowledgeAlert(alertId) {
    const endpoint = API_CONFIG.ENDPOINTS.ALERT_ACKNOWLEDGE.replace(':id', alertId);
    return this.patch(endpoint);
  }

  async acknowledgeAllAlerts() {
    return this.post(API_CONFIG.ENDPOINTS.ALERTS_ACKNOWLEDGE_ALL);
  }

  async getAlertStats(days = 7) {
    return this.get(API_CONFIG.ENDPOINTS.ALERTS_STATS, { days });
  }

  // Settings
  async getSettings() {
    return this.get(API_CONFIG.ENDPOINTS.SETTINGS);
  }

  async updateThresholds(thresholds) {
    return this.put(API_CONFIG.ENDPOINTS.SETTINGS_THRESHOLDS, thresholds);
  }

  async updateGSM(gsmNumber) {
    return this.put(API_CONFIG.ENDPOINTS.SETTINGS_GSM, { gsmNumber });
  }

  async updateNotifications(enabled) {
    return this.put(API_CONFIG.ENDPOINTS.SETTINGS_NOTIFICATIONS, { enabled });
  }
}

// Singleton instance
const apiService = new APIService();
export default apiService;
