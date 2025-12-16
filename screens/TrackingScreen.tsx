import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Carrier, TrackingStatus, Order, TrackingEvent } from '../models/types';
import { Package, MapPin, X, Settings, Link, Loader2, Globe, AlertCircle, Trash2 } from 'lucide-react';

interface TrackingScreenProps {
  orders: Order[];
  onAdd: (order: Order) => void;
  onDelete: (id: string) => void;
}

const TrackingScreen: React.FC<TrackingScreenProps> = ({ orders, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    trackingNumber: '',
    carrier: Carrier.UPS,
    itemName: ''
  });

  // Active URL used for fetching
  const [activeWebhookUrl, setActiveWebhookUrl] = useState('');
  // Temporary state for the settings input
  const [configWebhookUrl, setConfigWebhookUrl] = useState('');

  // Load saved configuration on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('gated_tracking_webhook');
    if (savedUrl) {
      setActiveWebhookUrl(savedUrl);
      setConfigWebhookUrl(savedUrl);
    }
  }, []);

  const handleOpenSettings = () => {
    setConfigWebhookUrl(activeWebhookUrl);
    setIsSettingsOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    // basic sanitization
    let urlToSave = configWebhookUrl.trim();
    if (urlToSave && !/^https?:\/\//i.test(urlToSave)) {
      urlToSave = 'https://' + urlToSave;
    }

    setActiveWebhookUrl(urlToSave);
    localStorage.setItem('gated_tracking_webhook', urlToSave);
    setIsSettingsOpen(false);
  };

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
      default: return 'bg-neutral-800 text-white';
    }
  };

  // Map EasyPost status to App Status
  const mapEasyPostStatus = (epStatus: string): TrackingStatus => {
    switch (epStatus?.toLowerCase()) {
      case 'delivered': return TrackingStatus.DELIVERED;
      case 'out_for_delivery': return TrackingStatus.OUT_FOR_DELIVERY;
      case 'in_transit': return TrackingStatus.IN_TRANSIT;
      case 'pre_transit': return TrackingStatus.PRE_TRANSIT;
      default: return TrackingStatus.PRE_TRANSIT;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to stop tracking this order?")) {
        onDelete(id);
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.trackingNumber || !newOrder.itemName || !newOrder.carrier) return;

    setIsLoading(true);

    try {
      let finalOrder: Order | null = null;
      let fetchErrorOccurred = false;

      if (activeWebhookUrl) {
        // Attempt to fetch from user's webhook
        try {
            const response = await fetch(activeWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    carrier: newOrder.carrier,
                    trackingNumber: newOrder.trackingNumber
                })
            });

            if (!response.ok) {
                console.warn(`Webhook Error: ${response.status} ${response.statusText}`);
                fetchErrorOccurred = true;
            } else {
                const data = await response.json();
                
                // Assume data matches EasyPost Tracker structure
                const history: TrackingEvent[] = (data.tracking_details || []).reverse().map((detail: any) => ({
                    date: new Date(detail.datetime).toLocaleString(),
                    location: detail.tracking_location?.city ? `${detail.tracking_location.city}, ${detail.tracking_location.state}` : 'Processing Center',
                    description: detail.message || detail.status
                }));

                finalOrder = {
                    id: Date.now().toString(),
                    trackingNumber: newOrder.trackingNumber,
                    carrier: newOrder.carrier as Carrier,
                    itemName: newOrder.itemName || 'New Shipment',
                    status: mapEasyPostStatus(data.status),
                    estimatedDelivery: data.est_delivery_date || data.estimated_delivery_date || 'Unknown',
                    history: history.length > 0 ? history : [{
                        date: new Date().toLocaleDateString(),
                        location: 'N/A',
                        description: 'Tracking info received (No History)'
                    }]
                };
            }
        } catch (fetchError: any) {
             console.error("Webhook Fetch Failed:", fetchError);
             fetchErrorOccurred = true;
        }
      }

      // Fallback Logic:
      // If no webhook configured OR if fetch failed, use Mock data so the UI doesn't break.
      if (!finalOrder) {
        if (fetchErrorOccurred) {
            alert("Network/CORS Error: Could not reach tracking webhook. Adding order with simulated data.");
        } else if (!activeWebhookUrl) {
            console.warn("No webhook URL configured. Using mock data.");
        }

        finalOrder = {
          id: Date.now().toString(),
          trackingNumber: newOrder.trackingNumber,
          carrier: newOrder.carrier as Carrier,
          itemName: newOrder.itemName!,
          status: TrackingStatus.PRE_TRANSIT,
          estimatedDelivery: 'Calculating...',
          history: [{
            date: new Date().toLocaleDateString(),
            location: 'Origin Scan',
            description: 'Label Created (Simulated)'
          }]
        };
      }

      onAdd(finalOrder);
      setIsAdding(false);
      setNewOrder({ trackingNumber: '', carrier: Carrier.UPS, itemName: '' });

    } catch (error: any) {
      console.error("Critical Tracking Error", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0f0f0f]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Tracking</h2>
          <p className="text-neutral-400">Live updates powered by EasyPost.</p>
        </div>
        <button
          onClick={handleOpenSettings}
          className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors group flex items-center gap-2"
          title="Configure API Keys"
        >
          <span className="text-sm font-medium hidden md:block">Config</span>
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors relative group overflow-hidden">
            
            {/* Simulation Badge (Moved to Left) */}
            {order.history[0]?.description?.includes('Simulated') && (
                <div className="absolute top-0 left-0 bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-1 rounded-br-lg border-r border-b border-yellow-500/20 font-medium z-10">
                    SIMULATED
                </div>
            )}

            {/* Delete Button (Top Right) */}
             <button
                onClick={(e) => handleDelete(order.id, e)}
                className="absolute top-4 right-4 p-2 bg-neutral-800/80 hover:bg-red-600/20 hover:text-red-500 text-neutral-500 rounded-lg transition-all opacity-100 md:opacity-0 group-hover:opacity-100 z-20"
                title="Delete Order"
             >
                <Trash2 size={16} />
             </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 pt-2">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${getCarrierLogo(order.carrier)}`}>
                  {order.carrier}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg pr-8">{order.itemName}</h3>
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
                <p className="text-white font-medium">
                  {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() === 'Invalid Date' ? order.estimatedDelivery : new Date(order.estimatedDelivery).toLocaleDateString() : 'Pending'}
                </p>
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
              {order.history.slice(0, 3).map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-neutral-600'}`} />
                    {idx !== (order.history.length > 3 ? 2 : order.history.length - 1) && <div className="w-px h-full bg-neutral-800 my-1" />}
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
              
              {!activeWebhookUrl && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-500 text-xs">
                  Note: No Webhook URL configured. Tracking will use mock data. Configure in top right settings.
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Fetching Info...
                  </>
                ) : (
                  'Start Tracking'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
                    <Globe size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Tracking Config</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-4 bg-neutral-800/50 rounded-xl mb-4 border border-neutral-800">
                <p className="text-xs text-neutral-400 leading-relaxed">
                    Provide your Webhook or API Endpoint URL. We will POST the <code>trackingNumber</code> and <code>carrier</code> to this URL.
                </p>
                <div className="flex items-start gap-2 mt-2 text-yellow-500 text-[10px] bg-yellow-900/10 p-2 rounded">
                   <AlertCircle size={12} className="mt-0.5" />
                   <p>Ensure your endpoint allows CORS requests (Access-Control-Allow-Origin: *) if calling from a browser.</p>
                </div>
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Webhook / Endpoint URL</label>
                <div className="relative">
                  <Link size={16} className="absolute left-3 top-3 text-neutral-500" />
                  <input 
                    type="url" 
                    value={configWebhookUrl}
                    onChange={e => setConfigWebhookUrl(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-neutral-500 font-mono text-sm placeholder-neutral-600"
                    placeholder="https://your-api.com/track"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                    Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingScreen;