import { Home, Settings, Activity, BarChart3 } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'control', name: 'Control', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-[72px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-center md:space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 py-3 px-4 transition-colors relative ${
                  isActive
                    ? 'text-agro-green font-semibold'
                    : 'text-gray-600 hover:text-agro-green'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-xs md:text-sm">{tab.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-agro-green rounded-t-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
