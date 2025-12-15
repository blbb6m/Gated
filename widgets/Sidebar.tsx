import React from 'react';
import { 
  LayoutGrid, 
  Shirt, 
  Calendar, 
  Package, 
  Sparkles,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
    { id: 'drops', label: 'Drops', icon: Calendar },
    { id: 'tracking', label: 'Tracking', icon: Package },
    { id: 'stylist', label: 'AI Stylist', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full md:w-64 md:h-screen bg-neutral-900 border-t md:border-t-0 md:border-r border-neutral-800 z-50 flex md:flex-col justify-between p-4">
      
      {/* Logo Area - Desktop Only */}
      <div className="hidden md:flex flex-col mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-white">GATED.</h1>
        <p className="text-xs text-neutral-500 tracking-widest uppercase mt-1">Team 46 Prototype</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex md:flex-col justify-around md:justify-start w-full gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black font-medium' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User / Footer - Desktop Only */}
      <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
          <div className="text-sm">
            <p className="text-white font-medium">User</p>
            <p className="text-neutral-500 text-xs">Premium Member</p>
          </div>
        </div>
        <button className="flex items-center gap-3 p-3 mt-4 text-neutral-500 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;