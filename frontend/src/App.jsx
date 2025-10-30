import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SidebarNav from './components/Modern/SidebarNav';
import ModernDashboard from './components/Modern/ModernDashboard';
import ControlPanel from './components/Control/ControlPanel';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import './styles/modern-dashboard.css';

function AppContent() {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ModernDashboard />;
      case 'control':
        return (
          <div className="modern-content" style={{ gridColumn: '1 / 4' }}>
            <ControlPanel />
          </div>
        );
      case 'analytics':
        return (
          <div className="modern-content" style={{ gridColumn: '1 / 4' }}>
            <Analytics />
          </div>
        );
      case 'settings':
        return (
          <div className="modern-content" style={{ gridColumn: '1 / 4' }}>
            <Settings />
          </div>
        );
      default:
        return <ModernDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
      <main className="modern-container">
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
