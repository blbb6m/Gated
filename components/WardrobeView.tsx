import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Category, ClothingItem } from '../types';
import { 
  X, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw, 
  LayoutGrid, 
  Rows,
  Save,
  Plus,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface WardrobeViewProps {
  items: ClothingItem[];
  onAdd: (item: ClothingItem) => void;
}

const WardrobeView: React.FC<WardrobeViewProps> = ({ items, onAdd }) => {
  const [activeTab, setActiveTab] = useState('Dress me');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    category: Category.TOPS,
    color: '',
    brand: '',
    name: '',
    imageUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorize items
  const tops = useMemo(() => items.filter(item => 
    item.category === Category.TOPS || item.category === Category.OUTERWEAR
  ), [items]);
  
  const bottoms = useMemo(() => items.filter(item => 
    item.category === Category.BOTTOMS
  ), [items]);
  
  const shoes = useMemo(() => items.filter(item => 
    item.category === Category.SHOES
  ), [items]);

  // State for current indices for each section
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoeIndex, setShoeIndex] = useState(0);

  // Initialize with random values on mount
  useEffect(() => {
    shuffleAll();
  }, []);

  const cycle = (
    current: number, 
    total: number, 
    direction: 'prev' | 'next', 
    setter: (n: number) => void
  ) => {
    if (total === 0) return;
    if (direction === 'next') {
      setter((current + 1) % total);
    } else {
      setter((current - 1 + total) % total);
    }
  };

  const shuffleAll = () => {
    if (tops.length) setTopIndex(Math.floor(Math.random() * tops.length));
    if (bottoms.length) setBottomIndex(Math.floor(Math.random() * bottoms.length));
    if (shoes.length) setShoeIndex(Math.floor(Math.random() * shoes.length));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.brand && newItem.category && newItem.imageUrl) {
      onAdd({
        id: Date.now().toString(),
        name: newItem.name,
        brand: newItem.brand,
        category: newItem.category as Category,
        imageUrl: newItem.imageUrl,
        color: newItem.color || 'Multi',
        dateAdded: new Date().toISOString().split('T')[0]
      } as ClothingItem);
      setIsAdding(false);
      setNewItem({ category: Category.TOPS, color: '', brand: '', name: '', imageUrl: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderSection = (sectionItems: ClothingItem[], index: number, setIndex: (n: number) => void, label: string) => {
    if (sectionItems.length === 0) return (
      <div className="flex-1 flex items-center justify-center bg-neutral-900/30 rounded-xl m-2 border border-neutral-800 border-dashed">
        <p className="text-neutral-500">No {label} found</p>
      </div>
    );

    // Safety check if index is out of bounds
    const safeIndex = index >= sectionItems.length ? 0 : index;
    const currentItem = sectionItems[safeIndex];

    return (
      <div className="flex-1 flex items-center gap-4 py-2 md:py-4 px-2 min-h-0">
        <button 
          onClick={() => cycle(safeIndex, sectionItems.length, 'prev', setIndex)}
          className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors text-white shrink-0"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 h-full bg-neutral-900/50 rounded-2xl flex items-center justify-center relative group border border-transparent hover:border-neutral-700 transition-all overflow-hidden min-h-0">
          <div className="absolute inset-0 p-4">
             <img 
              src={currentItem.imageUrl} 
              alt={currentItem.name} 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          <div className="absolute bottom-3 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <span className="bg-black/60 backdrop-blur-md text-xs text-white px-3 py-1.5 rounded-full font-medium">
               {currentItem.brand} — {currentItem.name}
             </span>
          </div>
        </div>

        <button 
          onClick={() => cycle(safeIndex, sectionItems.length, 'next', setIndex)}
          className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors text-white shrink-0"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen md:h-auto min-h-screen bg-[#0f0f0f] text-white relative overflow-hidden">
      
      {/* Header */}
      <div className="pt-6 px-6 md:pt-10 md:px-10 pb-4 bg-[#0f0f0f] z-20 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <button className="p-2 -ml-2 hover:bg-neutral-800 rounded-full text-white">
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold">Styling</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdding(true)}
              className="p-2 hover:bg-neutral-800 rounded-full text-white"
            >
              <Plus size={24} />
            </button>
            <button className="p-2 -mr-2 hover:bg-neutral-800 rounded-full text-white">
              <MoreVertical size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-around md:justify-start md:gap-10 border-b border-neutral-800 pb-1">
          {['Dress me', 'Canvas', 'Moodboards'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all relative ${
                activeTab === tab ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-2xl mx-auto w-full pb-24 min-h-0">
        {activeTab === 'Dress me' ? (
          <>
            {renderSection(tops, topIndex, setTopIndex, 'Tops')}
            {renderSection(bottoms, bottomIndex, setBottomIndex, 'Bottoms')}
            {renderSection(shoes, shoeIndex, setShoeIndex, 'Shoes')}
          </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 gap-4">
             <LayoutGrid size={48} className="opacity-20" />
             <p>{activeTab} view is currently empty.</p>
           </div>
        )}
      </div>

      {/* Floating Bottom Controls */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none">
        <div className="bg-[#e5e5e5] rounded-3xl p-1.5 flex items-center gap-1 shadow-2xl pointer-events-auto">
          <button className="p-3 hover:bg-neutral-200 rounded-full text-black transition-colors" title="Grid View">
            <LayoutGrid size={20} />
          </button>
          <button className="p-3 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors" title="List View">
            <Rows size={20} />
          </button>
          
          <div className="w-px h-6 bg-neutral-300 mx-1" />
          
          <button 
            onClick={shuffleAll}
            className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white hover:bg-black active:scale-95 transition-all"
            title="Shuffle All"
          >
            <RotateCcw size={20} />
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          <button className="p-3 hover:bg-neutral-200 rounded-full text-neutral-500 hover:text-green-600 transition-colors" title="Save Outfit">
             <Save size={20} />
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Item</h2>
              <button onClick={() => setIsAdding(false)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Item Image</label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={triggerFileUpload}
                    className="w-24 h-24 bg-neutral-800 rounded-xl border border-dashed border-neutral-600 flex items-center justify-center cursor-pointer hover:border-white hover:bg-neutral-700 transition-all overflow-hidden relative group"
                  >
                    {newItem.imageUrl ? (
                      <>
                        <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                      value={newItem.imageUrl}
                      onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500 text-sm"
                      placeholder="Or paste image URL..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="e.g. Vintage Tee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Brand</label>
                <input 
                  type="text" 
                  required
                  value={newItem.brand}
                  onChange={e => setNewItem({...newItem, brand: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  placeholder="e.g. Nike"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as Category})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Color</label>
                  <input 
                    type="text" 
                    value={newItem.color}
                    onChange={e => setNewItem({...newItem, color: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-500"
                    placeholder="e.g. Black"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newItem.imageUrl || !newItem.name}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Wardrobe
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WardrobeView;