import React, { useState } from 'react';
import { MOCK_WARDROBE, MOCK_ORDERS, MOCK_DROPS } from './constants';
import { ClothingItem, Order, Drop } from './models/types';

// Widgets
import Sidebar from './widgets/Sidebar';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import WardrobeScreen from './screens/WardrobeScreen';
import TrackingScreen from './screens/TrackingScreen';
import DropsScreen from './screens/DropsScreen';
import StylistScreen from './screens/StylistScreen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State (acting as a high-level Provider/BLoC)
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(MOCK_WARDROBE);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [drops, setDrops] = useState<Drop[]>(MOCK_DROPS);

  const addToWardrobe = (item: ClothingItem) => {
    setWardrobe([...wardrobe, item]);
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const addDrop = (drop: Drop) => {
    setDrops([...drops, drop]);
  };

  // Screen Router
  const renderScreen = () => {
    switch (activeTab) {
      case 'wardrobe':
        return <WardrobeScreen items={wardrobe} onAdd={addToWardrobe} />;
      case 'tracking':
        return <TrackingScreen orders={orders} onAdd={addOrder} />;
      case 'drops':
        return <DropsScreen drops={drops} onAdd={addDrop} />;
      case 'stylist':
        return <StylistScreen wardrobe={wardrobe} />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen 
            setActiveTab={setActiveTab} 
            stats={{
              wardrobeCount: wardrobe.length,
              ordersCount: orders.length,
              dropsCount: drops.length,
              latestOrder: orders[0],
              nextDrop: drops[0]
            }} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f0f0f] text-neutral-200 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;