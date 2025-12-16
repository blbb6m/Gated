import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ClothingItem, Order, Drop } from './models/types';
import { MOCK_WARDROBE, MOCK_ORDERS, MOCK_DROPS } from './constants';

// Widgets
import Sidebar from './widgets/Sidebar';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import WardrobeScreen from './screens/WardrobeScreen';
import TrackingScreen from './screens/TrackingScreen';
import DropsScreen from './screens/DropsScreen';
import StylistScreen from './screens/StylistScreen';
import AuthScreen from './screens/AuthScreen';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  // Manage Auth Session
  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false); // Stop loading if no session so AuthScreen appears
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear state on logout
        setWardrobe([]);
        setOrders([]);
        setDrops([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data from Supabase when Session exists
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session) return;
      
      setLoading(true);
      try {
        // Fetch Wardrobe
        const { data: wardrobeData, error: wardrobeError } = await supabase
          .from('wardrobe')
          .select('*')
          .order('date_added', { ascending: false });

        if (wardrobeData) {
          setWardrobe(wardrobeData.map((item: any) => ({
            id: String(item.id), // Enforce string ID
            name: item.name,
            brand: item.brand,
            category: item.category,
            imageUrl: item.image_url,
            // Convert timestamptz to string YYYY-MM-DD for frontend consistency
            dateAdded: item.date_added ? new Date(item.date_added).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            color: item.color
          })));
        } else if (wardrobeError) {
          console.warn('Error fetching wardrobe (falling back to mock):', wardrobeError.message);
          setWardrobe(MOCK_WARDROBE);
        }

        // Fetch Orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData.map((item: any) => ({
            id: String(item.id), // Enforce string ID
            trackingNumber: item.tracking_number,
            carrier: item.carrier,
            itemName: item.item_name,
            status: item.status,
            // Handle timestamp -> string conversion
            estimatedDelivery: item.estimated_delivery 
              ? new Date(item.estimated_delivery).toLocaleDateString() 
              : 'Pending',
            history: item.history || []
          })));
        } else if (ordersError) {
          console.warn('Error fetching orders (falling back to mock):', ordersError.message);
          setOrders(MOCK_ORDERS);
        }

        // Fetch Drops
        const { data: dropsData, error: dropsError } = await supabase
          .from('drops')
          .select('*')
          .order('drop_datetime', { ascending: true });

        if (dropsData) {
          setDrops(dropsData.map((item: any) => {
            const dropDate = new Date(item.drop_datetime);
            return {
              id: String(item.id), // Enforce string ID
              brand: item.brand,
              name: item.name,
              // Split drop_datetime back into date and time for frontend
              date: dropDate.toISOString().split('T')[0],
              time: dropDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              imageUrl: item.image_url,
              notified: item.notified,
              url: item.url
            };
          }));
        } else if (dropsError) {
          console.warn('Error fetching drops (falling back to mock):', dropsError.message);
          setDrops(MOCK_DROPS);
        }

      } catch (err) {
        console.error('Unexpected error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchInitialData();
    }
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Add Handlers
  const addToWardrobe = async (item: ClothingItem) => {
    if (!session) return;

    // Optimistic update using functional state to ensure we have latest list
    setWardrobe(prev => [item, ...prev]);

    const { data, error } = await supabase
      .from('wardrobe')
      .insert([{
        name: item.name,
        brand: item.brand,
        category: item.category,
        image_url: item.imageUrl,
        date_added: new Date().toISOString(), // Use current time for DB timestamp
        color: item.color,
        user_id: session.user.id
      }])
      .select();

    if (data) {
      // Ensure ID is string
      const newItem = { ...item, id: String(data[0].id) };
      setWardrobe(prev => prev.map(i => i.id === item.id ? newItem : i));
    } else {
      console.error('Error adding to wardrobe:', error?.message);
      // Revert optimistic update on error
      setWardrobe(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const deleteFromWardrobe = async (id: string) => {
    // Optimistic Update
    setWardrobe(prev => prev.filter(item => item.id !== id));
    
    // Fire and forget delete
    try {
      const { error } = await supabase.from('wardrobe').delete().eq('id', id);
      if (error) console.warn("Supabase delete warning (might be mock data):", error.message);
    } catch (e) {
      console.warn("Supabase delete failed (Mock data?)", e);
    }
  };

  const addOrder = async (order: Order) => {
    if (!session) return;

    setOrders(prev => [order, ...prev]);

    // Attempt to convert estimated_delivery to a valid ISO string for DB.
    // If it's "Calculating..." or "Unknown", set to null.
    let dbEstimatedDelivery = null;
    const dateAttempt = new Date(order.estimatedDelivery);
    if (!isNaN(dateAttempt.getTime())) {
      dbEstimatedDelivery = dateAttempt.toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        tracking_number: order.trackingNumber,
        carrier: order.carrier,
        item_name: order.itemName,
        status: order.status,
        estimated_delivery: dbEstimatedDelivery,
        history: order.history,
        user_id: session.user.id
      }])
      .select();

    if (data) {
      const newOrder = { ...order, id: String(data[0].id) };
      setOrders(prev => prev.map(o => o.id === order.id ? newOrder : o));
    } else {
      console.error('Error adding order:', error?.message);
      setOrders(prev => prev.filter(o => o.id !== order.id));
    }
  };

  const deleteOrder = async (id: string) => {
    // Optimistic Update
    setOrders(prev => prev.filter(o => o.id !== id));
    
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) console.warn("Supabase delete warning (might be mock data):", error.message);
    } catch (e) {
      console.warn("Supabase delete failed (Mock data?)", e);
    }
  };

  const addDrop = async (drop: Drop) => {
    if (!session) return;

    setDrops(prev => [drop, ...prev]);

    // Combine date and time into ISO timestamp for DB
    let dropDatetime = new Date().toISOString();
    try {
      if (drop.date && drop.time) {
        // If time is HH:MM
        dropDatetime = new Date(`${drop.date}T${drop.time}`).toISOString();
      } else if (drop.date) {
        dropDatetime = new Date(`${drop.date}T12:00:00`).toISOString();
      }
    } catch (e) {
      console.error("Error parsing date", e);
    }

    const { data, error } = await supabase
      .from('drops')
      .insert([{
        brand: drop.brand,
        name: drop.name,
        drop_datetime: dropDatetime,
        image_url: drop.imageUrl,
        notified: drop.notified,
        url: drop.url,
        user_id: session.user.id
      }])
      .select();

    if (data) {
      const newDrop = { ...drop, id: String(data[0].id) };
      setDrops(prev => prev.map(d => d.id === drop.id ? newDrop : d));
    } else {
      console.error('Error adding drop:', error?.message);
      setDrops(prev => prev.filter(d => d.id !== drop.id));
    }
  };

  const deleteDrop = async (id: string) => {
    // Optimistic Update
    setDrops(prev => prev.filter(d => d.id !== id));
    
    try {
      const { error } = await supabase.from('drops').delete().eq('id', id);
      if (error) console.warn("Supabase delete warning (might be mock data):", error.message);
    } catch (e) {
      console.warn("Supabase delete failed (Mock data?)", e);
    }
  };

  // Screen Router
  const renderScreen = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse">Syncing with Gated Cloud...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'wardrobe':
        return <WardrobeScreen items={wardrobe} onAdd={addToWardrobe} onDelete={deleteFromWardrobe} />;
      case 'tracking':
        return <TrackingScreen orders={orders} onAdd={addOrder} onDelete={deleteOrder} />;
      case 'drops':
        return <DropsScreen drops={drops} onAdd={addDrop} onDelete={deleteDrop} />;
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

  // If no session and not loading, show Auth Screen
  if (!session && !loading) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f0f0f] text-neutral-200 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={session?.user.email}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;