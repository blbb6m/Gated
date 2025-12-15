import React from 'react';
import { Shirt, Package, Calendar } from 'lucide-react';
import { Order, Drop } from '../models/types';

interface DashboardScreenProps {
  setActiveTab: (tab: string) => void;
  stats: {
    wardrobeCount: number;
    ordersCount: number;
    dropsCount: number;
    latestOrder?: Order;
    nextDrop?: Drop;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab, stats }) => {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Good Morning, Ben.</h1>
        <p className="text-neutral-400">Here's what's happening in your rotation today.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('wardrobe')}
          className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-600 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-neutral-800 rounded-lg text-purple-400 group-hover:text-purple-300">
              <Shirt size={24} />
            </div>
            <span className="text-3xl font-bold text-white">{stats.wardrobeCount}</span>
          </div>
          <h3 className="text-lg font-medium text-white">Total Items</h3>
          <p className="text-sm text-neutral-500">In your wardrobe</p>
        </div>

        <div 
          onClick={() => setActiveTab('tracking')}
          className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-600 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-neutral-800 rounded-lg text-blue-400 group-hover:text-blue-300">
              <Package size={24} />
            </div>
            <span className="text-3xl font-bold text-white">{stats.ordersCount}</span>
          </div>
          <h3 className="text-lg font-medium text-white">Active Orders</h3>
          <p className="text-sm text-neutral-500">In transit</p>
        </div>

        <div 
          onClick={() => setActiveTab('drops')}
          className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-600 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-neutral-800 rounded-lg text-red-400 group-hover:text-red-300">
              <Calendar size={24} />
            </div>
            <span className="text-3xl font-bold text-white">{stats.dropsCount}</span>
          </div>
          <h3 className="text-lg font-medium text-white">Upcoming Drops</h3>
          <p className="text-sm text-neutral-500">This month</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Latest Shipment</h3>
          {stats.latestOrder ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
               <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                 <Package className="text-neutral-400" />
               </div>
               <div>
                 <p className="text-white font-medium">{stats.latestOrder.itemName}</p>
                 <p className="text-sm text-neutral-500">{stats.latestOrder.status} - {stats.latestOrder.carrier}</p>
               </div>
            </div>
          ) : (
            <p className="text-neutral-500">No active shipments.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Next Drop</h3>
           {stats.nextDrop ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
               <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden">
                 <img src={stats.nextDrop.imageUrl} alt="Drop" className="w-full h-full object-cover" />
               </div>
               <div>
                 <p className="text-white font-medium">{stats.nextDrop.name}</p>
                 <p className="text-sm text-neutral-500">{stats.nextDrop.date} • {stats.nextDrop.brand}</p>
               </div>
            </div>
          ) : (
            <p className="text-neutral-500">No upcoming drops tracked.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;