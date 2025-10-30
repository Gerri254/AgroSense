import { Home, Activity, BarChart3, Settings } from 'lucide-react';

const SidebarNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'control', name: 'Control', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <nav className="modern-sidebar">
      <h1 className="sidebar-title">Smart Agro</h1>
      <div className="sidebar-logo">🌱</div>

      <ul className="modern-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <li
              key={item.id}
              className={`modern-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <b></b>
              <b></b>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <Icon className="nav-icon" size={20} />
                <span className="nav-text">{item.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNav;
