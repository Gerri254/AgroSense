import '../../styles/modern-dashboard.css';
import SensorGrid from './SensorGrid';
import ActionTimeline from './ActionTimeline';
import ThresholdStatus from './ThresholdStatus';
import SystemHealth from './SystemHealth';
import AlertsFeed from './AlertsFeed';
import UserInfoModern from './UserInfoModern';

const ModernDashboard = () => {
  return (
    <>
      {/* Main Content Area */}
      <div className="modern-content">
        {/* Top Section: Sensor Grid */}
        <SensorGrid />

        {/* Bottom Section: Action Timeline & Threshold Status */}
        <div className="modern-bottom">
          <ActionTimeline />
          <ThresholdStatus />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="modern-sidebar-right">
        <UserInfoModern />
        <SystemHealth />
        <AlertsFeed />
      </div>
    </>
  );
};

export default ModernDashboard;
