import React, { useState, useRef } from 'react';
import { Drop } from '../models/types';
import { Bell, BellOff, Calendar, Plus, X, Upload, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface DropsScreenProps {
  drops: Drop[];
  onAdd: (drop: Drop) => void;
}

const DropsScreen: React.FC<DropsScreenProps> = ({ drops, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDrop, setNewDrop] = useState<Partial<Drop>>({
    brand: '',
    name: '',
    date: '',
    time: '12:00 PM EST',
    imageUrl: '',
    url: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDrop.name && newDrop.date) {
      onAdd({
        id: Date.now().toString(),
        brand: newDrop.brand || 'Unknown Brand',
        name: newDrop.name,
        date: newDrop.date,
        time: newDrop.time || 'TBD',
        imageUrl: newDrop.imageUrl || 'https://picsum.photos/400/400?blur=5',
        notified: true,
        url: newDrop.url
      } as Drop);
      setIsAdding(false);
      setNewDrop({ brand: '', name: '', date: '', time: '12:00 PM EST', imageUrl: '', url: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setNewItemImage = (url: string) => {
    setNewDrop(prev => ({ ...prev, imageUrl: url }));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0f0f0f]">
      <div className="flex justify-between items-start mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Release Calendar</h2>
           <p className="text-neutral-400">Stay ahead of upcoming drops.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors"
        >
          <Plus size={18} />
          Add Drop
        </button>
      </div>

      <div className="space-y-4 max-w-4xl">
        {drops.map((drop) => (
          <div key={drop.id} className="group flex flex-col sm:flex-row bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all">
            
            {/* Image */}
            <div className="sm:w-48 h-48 sm:h-auto bg-neutral-800 relative">
              <img src={drop.imageUrl} alt={drop.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white">
                {drop.brand}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{drop.name}</h3>
                <button className={`p-2 rounded-full transition-colors ${drop.notified ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                  {drop.notified ? <Bell size={18} fill="currentColor" /> : <BellOff size={18} />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-neutral-400 mb-6">
                <Calendar size={16} />
                <span className="text-sm font-medium">{drop.date} @ {drop.time}</span>
              </div>

              <div className="flex gap-3 mt-auto">
                 <button className="flex-1 py-2 rounded-lg bg-neutral-100 text-black font-medium text-sm hover:bg-white transition-colors">
                  Add to Calendar
                </button>
                <a 
                  href={drop.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex-1 py-2 rounded-lg border border-neutral-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors ${drop.url ? 'text-white hover:border-neutral-500 hover:bg-neutral-800' : 'text-neutral-500 cursor-not-allowed opacity-50'}`}
                  onClick={(e) => !drop.url && e.preventDefault()}
                >
                  Visit Site <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Drop Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Drop</h2>
              <button onClick={() => setIsAdding(false)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddDrop} className="space-y-4">
              
              {/* Drop URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Drop URL</label>
                <div className="relative">
                  <input 
                    type="url" 
                    required
                    value={newDrop.url}
                    onChange={e => setNewDrop({...newDrop, url: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-neutral-500"
                    placeholder="https://brand.com/drop..."
                  />
                  <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>

              {/* Name & Brand */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Drop Name</label>
                <input 
                  type="text" 
                  required
                  value={newDrop.name}
                  onChange={e => setNewDrop({...newDrop, name: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="e.g. Fall/Winter Week 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Brand</label>
                <input 
                  type="text" 
                  value={newDrop.brand}
                  onChange={e => setNewDrop({...newDrop, brand: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="e.g. Supreme (Optional)"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newDrop.date}
                    onChange={e => setNewDrop({...newDrop, date: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Time</label>
                  <input 
                    type="text" 
                    value={newDrop.time}
                    onChange={e => setNewDrop({...newDrop, time: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                    placeholder="12:00 PM EST"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Image (Optional)</label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={triggerFileUpload}
                    className="w-24 h-24 bg-neutral-800 rounded-xl border border-dashed border-neutral-600 flex items-center justify-center cursor-pointer hover:border-white hover:bg-neutral-700 transition-all overflow-hidden relative group shrink-0"
                  >
                    {newDrop.imageUrl ? (
                      <>
                        <img src={newDrop.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-neutral-500">
                        <Upload size={20} />
                        <span className="text-[10px] uppercase font-bold">Upload</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <input 
                      type="url" 
                      value={newDrop.imageUrl}
                      onChange={e => setNewDrop({...newDrop, imageUrl: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500 text-sm"
                      placeholder="Or paste image URL..."
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                       We'll attempt to grab an image from the Drop URL if this is left blank.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors mt-2"
              >
                Add Release
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropsScreen;