import { Power } from 'lucide-react';
import { getColorClasses } from '../../utils/colorClasses';

// eslint-disable-next-line no-unused-vars
const ActuatorCard = ({ title, status, mode, icon: Icon, color = 'blue', onToggle, disabled }) => {
  const colors = getColorClasses(color);
  return (
    <div className={`card border-l-4 ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <p className="text-xs text-gray-500">Mode: {mode}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className={`text-sm font-semibold ${status ? 'text-green-600' : 'text-gray-500'}`}>
            {status ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Control Button */}
      {mode === 'manual' && (
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`mt-4 w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            status
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Power className="w-4 h-4" />
          <span>Turn {status ? 'OFF' : 'ON'}</span>
        </button>
      )}

      {mode === 'auto' && (
        <div className="mt-4 p-2 bg-blue-50 rounded-lg text-center">
          <p className="text-xs text-blue-700 font-medium">
            🤖 Automatic Mode Active
          </p>
        </div>
      )}
    </div>
  );
};

export default ActuatorCard;
