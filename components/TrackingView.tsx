import React, { useState } from 'react';
import { Carrier, TrackingStatus, Order } from '../types';
import { Truck, CheckCircle, Package, MapPin, X } from 'lucide-react';

interface TrackingViewProps {
  orders: Order[];
  onAdd: (order: Order) => void;
}

const TrackingView: React.FC<TrackingViewProps> = ({ orders, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    trackingNumber: '',
    carrier: Carrier.UPS,
    itemName: ''
  });

  const getStatusColor = (status: TrackingStatus) => {
    switch (status) {
      case TrackingStatus.DELIVERED: return 'text-green-400';
      case TrackingStatus.OUT_FOR_DELIVERY: return 'text-yellow-400';
      case TrackingStatus.IN_TRANSIT: return 'text-blue-400';
      default: return 'text-neutral-400';
    }
  };

  const getCarrierLogo = (carrier: Carrier) => {
    switch (carrier) {
      case Carrier.UPS: return 'bg-[#351C15] text-[#FFB500]';
      case Carrier.FEDEX: return 'bg-[#4D148C] text-white';
      case Carrier.USPS: return 'bg-[#333366] text-white';
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.trackingNumber && newOrder.itemName && newOrder.carrier) {
      onAdd({
        id: Date.now().toString(),
        trackingNumber: newOrder.trackingNumber,
        carrier: newOrder.carrier as Carrier,
        itemName: newOrder.itemName,
        status: TrackingStatus.PRE_TRANSIT,
        estimatedDelivery: 'Calculating...',
        history: [{
          date: new Date().toLocaleDateString(),
          location: 'Origin Scan',
          description: 'Label Created'
        }]
      } as Order);
      setIsAdding(false);
      setNewOrder({ trackingNumber: '', carrier: Carrier.UPS, itemName: '' });
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0f0f0f]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Tracking</h2>
          <p className="text-neutral-400">Live updates from UPS, FedEx, and USPS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${getCarrierLogo(order.carrier)}`}>
                  {order.carrier}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{order.itemName}</h3>
                  <p className="text-sm text-neutral-500 tracking-wider">{order.trackingNumber}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full bg-neutral-800 text-xs font-medium border border-neutral-700 ${getStatusColor(order.status)}`}>
                {order.status}
              </div>
            </div>

            {/* Progress Bar (Visual only for mock) */}
            <div className="w-full h-2 bg-neutral-800 rounded-full mb-6 overflow-hidden">
              <div 
                className={`h-full rounded-full ${order.status === TrackingStatus.DELIVERED ? 'bg-green-500 w-full' : order.status === TrackingStatus.PRE_TRANSIT ? 'bg-neutral-600 w-1/4' : 'bg-blue-500 w-2/3'}`} 
              />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-800/50 p-3 rounded-xl">
                <p className="text-xs text-neutral-500 mb-1">Estimated Delivery</p>
                <p className="text-white font-medium">{order.estimatedDelivery}</p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-xl">
                <p className="text-xs text-neutral-500 mb-1">Latest Location</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <MapPin size={14} className="text-neutral-400" />
                  {order.history[0]?.location || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Timeline (Condensed) */}
            <div className="space-y-4 border-t border-neutral-800 pt-4">
              {order.history.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-neutral-600'}`} />
                    {idx !== order.history.length - 1 && <div className="w-px h-full bg-neutral-800 my-1" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{event.description}</p>
                    <p className="text-xs text-neutral-500">{event.date} • {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ))}

        {/* Add Order Card */}
        <button 
          onClick={() => setIsAdding(true)}
          className="border-2 border-dashed border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center text-neutral-500 hover:border-neutral-600 hover:text-white transition-all h-[300px]"
        >
          <Package size={48} className="mb-4 opacity-50" />
          <span className="font-medium">Track New Package</span>
        </button>
      </div>

      {/* Add Order Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Track Package</h2>
              <button onClick={() => setIsAdding(false)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Item Name / Description</label>
                <input 
                  type="text" 
                  required
                  value={newOrder.itemName}
                  onChange={e => setNewOrder({...newOrder, itemName: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="e.g. New Shoes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Tracking Number</label>
                <input 
                  type="text" 
                  required
                  value={newOrder.trackingNumber}
                  onChange={e => setNewOrder({...newOrder, trackingNumber: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="1Z..."
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Carrier</label>
                  <select 
                    value={newOrder.carrier}
                    onChange={e => setNewOrder({...newOrder, carrier: e.target.value as Carrier})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  >
                    {Object.values(Carrier).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors mt-2"
              >
                Start Tracking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingView;