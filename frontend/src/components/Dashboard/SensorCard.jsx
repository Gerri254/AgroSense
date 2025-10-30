import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getColorClasses } from '../../utils/colorClasses';

// eslint-disable-next-line no-unused-vars
const SensorCard = ({ title, value, unit, icon: Icon, color = 'blue', threshold, previousValue }) => {
  const colors = getColorClasses(color);
  // Determine trend
  const getTrend = () => {
    if (!previousValue || previousValue === value) return 'stable';
    return value > previousValue ? 'up' : 'down';
  };

  const trend = getTrend();

  // Check if value is within threshold
  const isWarning = threshold && (
    (threshold.min && value < threshold.min) ||
    (threshold.max && value > threshold.max)
  );

  return (
    <div className={`card border-l-4 ${isWarning ? 'border-red-500 bg-red-50' : colors.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>

        {/* Trend Indicator */}
        {previousValue !== undefined && (
          <div className="flex items-center">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline space-x-1">
          <span className={`text-3xl font-bold ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>

        {/* Threshold indicator */}
        {threshold && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              {threshold.min !== undefined && <span>Min: {threshold.min}{unit}</span>}
              {threshold.max !== undefined && <span>Max: {threshold.max}{unit}</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isWarning ? 'bg-red-500' : colors.progress
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, (value / (threshold.max || 100)) * 100))}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {isWarning && (
          <p className="text-xs text-red-600 font-medium mt-2">
            ⚠ Out of threshold range
          </p>
        )}
      </div>
    </div>
  );
};

export default SensorCard;
