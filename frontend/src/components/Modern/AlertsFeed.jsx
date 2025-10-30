import { AlertTriangle, Info, Droplets, Thermometer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AlertsFeed = () => {
  const { alerts } = useApp();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_soil_moisture':
        return { icon: Droplets, color: '#3b82f6' };
      case 'high_temperature':
        return { icon: Thermometer, color: '#f59e0b' };
      case 'low_water_level':
        return { icon: AlertTriangle, color: '#ef4444' };
      default:
        return { icon: Info, color: '#10b981' };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return alertTime.toLocaleDateString();
  };

  // Get last 3 alerts
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="alerts-feed">
      <h1>Recent Alerts</h1>
      {recentAlerts.length > 0 ? (
        recentAlerts.map((alert) => {
          const { icon: Icon, color } = getAlertIcon(alert.type);

          return (
            <div key={alert.id} className="alert-card">
              <div className="alert-card-header">
                <Icon className="alert-icon" size={24} style={{ color }} />
                <h3>{alert.type?.replace(/_/g, ' ').toUpperCase()}</h3>
              </div>
              <p className="alert-card-message">{alert.message}</p>
              {alert.value !== undefined && (
                <p className="alert-card-message">
                  <strong>Value:</strong> {alert.value}
                </p>
              )}
              <p className="alert-card-time">{formatTime(alert.timestamp)}</p>
            </div>
          );
        })
      ) : (
        <div className="alert-card">
          <div className="alert-card-header">
            <Info className="alert-icon" size={24} style={{ color: '#10b981' }} />
            <h3>All Clear</h3>
          </div>
          <p className="alert-card-message">
            No recent alerts. System running smoothly.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsFeed;
