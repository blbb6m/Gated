import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Category, ClothingItem } from '../models/types';
import { removeBackgroundAI } from '../services/geminiService';
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
  Image as ImageIcon, 
  Search, 
  ArrowUpDown,
  Wand2,
  Loader2,
  Trash2
} from 'lucide-react';

interface WardrobeScreenProps {
  items: ClothingItem[];
  onAdd: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
}

const WardrobeScreen: React.FC<WardrobeScreenProps> = ({ items, onAdd, onDelete }) => {
  const [activeTab, setActiveTab] = useState('Dress me');
  const [isAdding, setIsAdding] = useState(false);
  
  // Add Item State
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    category: Category.TOPS,
    color: '',
    brand: '',
    name: '',
    imageUrl: ''
  });
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wardrobe Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // -------------------------
  // "Dress me" Logic
  // -------------------------
  const tops = useMemo(() => items.filter(item => 
    item.category === Category.TOPS || item.category === Category.OUTERWEAR
  ), [items]);
  
  const bottoms = useMemo(() => items.filter(item => 
    item.category === Category.BOTTOMS
  ), [items]);
  
  const shoes = useMemo(() => items.filter(item => 
    item.category === Category.SHOES
  ), [items]);

  const accessories = useMemo(() => items.filter(item => 
    item.category === Category.ACCESSORIES
  ), [items]);

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoeIndex, setShoeIndex] = useState(0);
  const [accessoryIndex, setAccessoryIndex] = useState(0);

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
    if (accessories.length) setAccessoryIndex(Math.floor(Math.random() * accessories.length));
  };

  // -------------------------
  // "Wardrobe" Logic
  // -------------------------
  const filteredWardrobe = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.brand.toLowerCase().includes(q)
      );
    }

    // Filter
    if (selectedCategory !== 'All') {
      result = result.filter(i => i.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, selectedCategory, sortOrder]);


  // -------------------------
  // Handlers
  // -------------------------
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

  const handleRemoveBackground = async () => {
    if (!newItem.imageUrl) return;
    
    setIsProcessingBg(true);
    const processedImage = await removeBackgroundAI(newItem.imageUrl);
    setIsProcessingBg(false);

    if (processedImage) {
      setNewItem({ ...newItem, imageUrl: processedImage });
    } else {
      // Could show a toast error here
      alert("Could not remove background. Ensure it is a valid image file.");
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    // Prevent event from bubbling to parent container
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
        onDelete(id);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderDressMeSection = (sectionItems: ClothingItem[], index: number, setIndex: (n: number) => void, label: string) => {
    if (sectionItems.length === 0) return (
      <div className="flex items-center justify-center bg-neutral-900/30 rounded-xl m-2 border border-neutral-800 border-dashed h-48 md:h-64">
        <p className="text-neutral-500">No {label} found</p>
      </div>
    );

    const safeIndex = index >= sectionItems.length ? 0 : index;
    const currentItem = sectionItems[safeIndex];

    return (
      <div className="flex items-center gap-4 py-2 px-2">
        <button 
          onClick={() => cycle(safeIndex, sectionItems.length, 'prev', setIndex)}
          className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors text-white shrink-0"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 relative group bg-neutral-900/50 rounded-2xl overflow-hidden border border-transparent hover:border-neutral-700 transition-all h-64 md:h-96">
          <div className="absolute inset-0 p-4 flex items-center justify-center">
             {currentItem.imageUrl ? (
               <img 
                src={currentItem.imageUrl} 
                alt={currentItem.name} 
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
             ) : null}
             
             <div className={`absolute inset-0 flex flex-col gap-2 items-center justify-center text-neutral-700 pointer-events-none ${currentItem.imageUrl ? 'hidden' : ''}`}>
               <ImageIcon size={48} className="opacity-50" />
               <span className="text-xs text-neutral-600 font-medium">No Image Available</span>
             </div>
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
          {['Dress me', 'Wardrobe'].map((tab) => (
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
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full pb-32 min-h-0 overflow-y-auto md:overflow-visible">
        
        {/* Dress Me View */}
        {activeTab === 'Dress me' && (
          <div className="space-y-4 max-w-2xl mx-auto w-full">
            {renderDressMeSection(tops, topIndex, setTopIndex, 'Tops')}
            {renderDressMeSection(bottoms, bottomIndex, setBottomIndex, 'Bottoms')}
            {renderDressMeSection(shoes, shoeIndex, setShoeIndex, 'Shoes')}
            {renderDressMeSection(accessories, accessoryIndex, setAccessoryIndex, 'Accessories')}
            
            {/* Floating Bottom Controls for Dress Me only */}
            <div className="fixed bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none md:absolute md:bottom-auto md:top-[90vh]">
              <div className="bg-[#e5e5e5] rounded-3xl p-1.5 flex items-center gap-1 shadow-2xl pointer-events-auto">
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
          </div>
        )}

        {/* Wardrobe View */}
        {activeTab === 'Wardrobe' && (
          <div className="space-y-6">
            
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 sticky top-0 bg-[#0f0f0f] z-10 py-4 border-b border-neutral-800">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search brand, name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neutral-600 text-white placeholder-neutral-500"
                        />
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        className="px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
                    >
                        <ArrowUpDown size={16} />
                        <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
                    </button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                            selectedCategory === 'All'
                            ? 'bg-white text-black border-white' 
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                    >
                        All
                    </button>
                    {Object.values(Category).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                                selectedCategory === cat 
                                ? 'bg-white text-black border-white' 
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWardrobe.map(item => (
                    <div key={item.id} className="group relative bg-neutral-900 rounded-xl overflow-hidden aspect-square border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer">
                        
                        {/* Image */}
                        <div className="absolute inset-0 p-4 flex items-center justify-center">
                             {item.imageUrl ? (
                               <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-contain"
                                 onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const fallback = (e.target as HTMLElement).nextElementSibling;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                             ) : null}
                             <div className={`absolute inset-0 flex flex-col gap-2 items-center justify-center text-neutral-700 pointer-events-none ${item.imageUrl ? 'hidden' : ''}`}>
                               <ImageIcon size={32} className="opacity-50" />
                             </div>
                        </div>
                        
                        {/* Overlay Info */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10 translate-y-2 group-hover:translate-y-0 transition-transform pointer-events-none">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold truncate">{item.brand}</p>
                            <p className="text-sm text-white truncate font-medium">{item.name}</p>
                        </div>

                         {/* Delete Button */}
                        <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600/90 backdrop-blur-sm rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-[60] shadow-lg cursor-pointer active:scale-95"
                            title="Delete Item"
                        >
                           <Trash2 size={16} className="pointer-events-none" />
                        </button>
                    </div>
                ))}
            </div>
            
            {filteredWardrobe.length === 0 && (
                 <div className="text-center py-20 text-neutral-500 flex flex-col items-center gap-4">
                     <LayoutGrid size={48} className="opacity-20" />
                     <p>No items found matching your filters.</p>
                 </div>
            )}
          </div>
        )}

      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
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
                    className="w-24 h-24 bg-neutral-800 rounded-xl border border-dashed border-neutral-600 flex items-center justify-center cursor-pointer hover:border-white hover:bg-neutral-700 transition-all overflow-hidden relative group shrink-0"
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
                  
                  <div className="flex-1 space-y-2">
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
                    
                    {/* Background Removal Button */}
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={!newItem.imageUrl || !newItem.imageUrl.startsWith('data:') || isProcessingBg}
                      className="text-xs flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                    >
                      {isProcessingBg ? (
                        <>
                           <Loader2 size={12} className="animate-spin" />
                           <span>Processing...</span>
                        </>
                      ) : (
                        <>
                           <Wand2 size={12} />
                           <span>Remove Background (AI)</span>
                        </>
                      )}
                    </button>
                    {!newItem.imageUrl?.startsWith('data:') && newItem.imageUrl && (
                      <p className="text-[10px] text-neutral-500">Note: Background removal only works with uploaded images (not URLs) for security.</p>
                    )}
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
                disabled={!newItem.imageUrl || !newItem.name || isProcessingBg}
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

export default WardrobeScreen;