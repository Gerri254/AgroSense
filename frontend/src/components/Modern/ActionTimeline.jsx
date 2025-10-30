import { useApp } from '../../context/AppContext';

const ActionTimeline = () => {
  const { actionLogs } = useApp();

  const getTimelineClass = (trigger) => {
    switch (trigger) {
      case 'automatic':
        return 'timeline-auto';
      case 'manual':
        return 'timeline-manual';
      default:
        return 'timeline-config';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
    };
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get last 4 actions
  const recentActions = actionLogs.slice(0, 4);

  return (
    <div className="action-timeline">
      <h1>Recent Activity</h1>
      <div className="timeline-container">
        {recentActions.length > 0 ? (
          recentActions.map((log) => {
            const { day, month } = formatDate(log.timestamp);

            return (
              <div
                key={log.id}
                className={`timeline-item ${getTimelineClass(log.trigger)}`}
              >
                <div className="timeline-date">
                  <h2>{day}</h2>
                  <p>{month}</p>
                </div>
                <div className="timeline-content">
                  <h3>{log.action}</h3>
                  <p>{formatTime(log.timestamp)}</p>
                </div>
                <span className="timeline-badge">
                  {log.trigger === 'automatic' ? '🤖 Auto' : '👤 Manual'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="timeline-item timeline-config">
            <div className="timeline-content" style={{ gridColumn: '1 / 4', borderLeft: 'none', paddingLeft: 0 }}>
              <p style={{ textAlign: 'center', padding: '20px' }}>
                No recent activity. Actions will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionTimeline;
