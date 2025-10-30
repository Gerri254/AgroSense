import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { getColorClasses } from '../../utils/colorClasses';

const AlertCard = ({ alert }) => {
  if (!alert) {
    return (
      <div className="card bg-green-50 border-l-4 border-green-500">
        <div className="flex items-center space-x-3">
          <Info className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">All Systems Normal</h3>
            <p className="text-xs text-green-600">No critical alerts at this time</p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const colorName = getAlertColor(alert.severity);
  const colors = getColorClasses(colorName);

  const alertBgClass = {
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50'
  }[colorName];

  const alertTextClasses = {
    red: { heading: 'text-red-800', body: 'text-red-700', meta: 'text-red-600' },
    yellow: { heading: 'text-yellow-800', body: 'text-yellow-700', meta: 'text-yellow-600' },
    blue: { heading: 'text-blue-800', body: 'text-blue-700', meta: 'text-blue-600' }
  }[colorName];

  return (
    <div className={`card ${alertBgClass} border-l-4 ${colors.border} animate-pulse-slow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getAlertIcon(alert.severity)}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm font-semibold ${alertTextClasses.heading}`}>
                {alert.type?.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <span className={`text-xs ${alertTextClasses.meta}`}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className={`text-sm ${alertTextClasses.body}`}>{alert.message}</p>
            {alert.value !== undefined && (
              <p className={`text-xs ${alertTextClasses.meta} mt-1`}>
                Current value: {alert.value}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
