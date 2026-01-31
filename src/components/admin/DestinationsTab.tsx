import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Hotel as HotelIcon, Star, MapPin, Coffee, Utensils, Wifi, Edit2, Trash2, Save, X,
  Image as ImageIcon, Check, ChevronDown, Bed, Calendar, Users, Briefcase, Car, Globe,
  MessageSquare, Info, LayoutGrid, Eye, EyeOff, MapPinned, ArrowRight, XCircle, Map,
  Loader2, Maximize, ExternalLink, Search, Filter, Settings2,
  Waves, Dumbbell, Plane, Sparkles, Bell, Gamepad2, Shirt, UserCheck, Key,
  BedDouble, Refrigerator, Shield, Microwave, Sun, Moon, Activity, Tags,
  UtensilsCrossed, CalendarDays, PlusCircle, CalendarClock, History,
  Coffee as CoffeeIcon, Tv, Wind, Mountain, DoorOpen, Images, DollarSign, Edit3, Trees,
  Zap, AlertTriangle, AlertCircle, Clock, Bus
} from 'lucide-react';
import { AdminHotel, Room, PricingPeriod, Review } from '../../adminTypes';
import MapPicker from './MapPicker';
import { HotelsAPI } from '../../services/api';
import ImageUploader from './ImageUploader';
import { getImageUrl } from '../../utils/imageHelper';

// --- المكونات والأنواع الأساسية ---

const HOTEL_AMENITIES_LIST = [
  { id: 'wifi', label: 'واي فاي مجاني', icon: <Wifi size={16} /> },
  { id: 'parking', label: 'مواقف سيارات', icon: <Car size={16} /> },
  { id: 'pool', label: 'مسبح فندقي', icon: <Waves size={16} /> },
  { id: 'gym', label: 'نادي رياضي', icon: <Dumbbell size={16} /> },
  { id: 'food', label: 'مطعم فاخر', icon: <Utensils size={16} /> },
  { id: 'shuttle', label: 'نقل للحرم 24/7', icon: <Plane size={16} /> },
  { id: 'spa', label: 'مركز سبا وعافية', icon: <Sparkles size={16} /> },
  { id: 'room_service', label: 'خدمة غرف 24/7', icon: <Bell size={16} /> },
  { id: 'kids_club', label: 'نادي أطفال', icon: <Gamepad2 size={16} /> },
  { id: 'business', label: 'مركز أعمال', icon: <Briefcase size={16} /> },
  { id: 'laundry', label: 'خدمة غسيل', icon: <Shirt size={16} /> },
  { id: 'concierge', label: 'كونسيرج', icon: <UserCheck size={16} /> },
  { id: 'cafe', label: 'مقهى', icon: <Coffee size={16} /> },
  { id: 'valet', label: 'صف سيارات', icon: <Key size={16} /> }
];

const MEAL_PLANS = [
  { id: 'none', label: 'بدون وجبات' },
  { id: 'breakfast', label: 'فطور' },
  { id: 'half_board', label: 'وجبتين' },
  { id: 'full_board', label: 'ثلاث وجبات' }
];

const ROOM_TYPES = [
  { id: 'single', label: 'غرفة فردية' },
  { id: 'double', label: 'غرفة ثنائية' },
  { id: 'triple', label: 'غرفة ثلاثية' },
  { id: 'quad', label: 'غرفة رباعية' },
  { id: 'suite', label: 'جناح' },
  { id: 'studio', label: 'استوديو' },
  { id: 'custom', label: 'اسم مخصص...' }
];

const VIEW_OPTIONS = [
  { label: 'بدون إطلالة محددة', icon: <EyeOff size={14} className="opacity-40" /> },
  { label: 'اطلالة كاملة علي الكعبه', icon: <Sparkles size={14} className="text-amber-500" /> },
  { label: 'اطلالة كاملة علي المسجد النبوي', icon: <Moon size={14} className="text-slate-800" /> },
  { label: 'اطلالة مدينة', icon: <Map size={14} className="text-slate-500" /> },
  { label: 'اطلالة جزئية علي الكعبه', icon: <Sparkles size={14} className="text-amber-300" /> },
  { label: 'اطلالة جزئية علي المسجد النبوي', icon: <Moon size={14} className="text-slate-400" /> },
  { label: 'اطلالة شاطئ', icon: <Waves size={14} className="text-blue-500" /> },
  { label: 'اطلالة حديقة', icon: <Trees size={14} className="text-emerald-500" /> }
];

const BEDDING_SUGGESTIONS = [
  "1 سرير كينج",
  "2 سرير فردي",
  "3 أسرّة فردية",
  "4 أسرّة فردية",
  "1 سرير كينج + 1 أريكة سرير",
  "2 سرير كينج"
];

const ArabCountries = [
  { id: 'all', label: 'كل الدول' },
  { id: 'SA', label: 'المملكة العربية السعودية' },
  { id: 'AE', label: 'الإمارات العربية المتحدة' },
  { id: 'QA', label: 'قطر' },
  { id: 'KW', label: 'الكويت' },
  { id: 'BH', label: 'البحرين' },
  { id: 'OM', label: 'عمان' },
  { id: 'EG', label: 'مصر' },
  { id: 'JO', label: 'الأردن' }
];

const PopularCities = [
  { id: 'makkah', label: 'مكة المكرمة' },
  { id: 'madinah', label: 'المدينة المنورة' },
  { id: 'jeddah', label: 'جدة' },
  { id: 'riyadh', label: 'الرياض' },
  { id: 'dubai', label: 'دبي' },
  { id: 'abu_dhabi', label: 'أبوظبي' },
  { id: 'doha', label: 'الدوحة' }
];

const FILTER_STATUS_OPTIONS = [
  { id: 'all', label: 'عرض الكل', icon: <LayoutGrid size={14} /> },
  { id: 'active', label: 'الفنادق النشطة', icon: <Check size={14} className="text-[#0f172a]" /> },
  { id: 'inactive', label: 'الفنادق الغير نشطة', icon: <XCircle size={14} className="text-red-500" /> },
  { id: 'featured', label: 'الفنادق المميزة', icon: <Star size={14} className="text-amber-500" /> },
  { id: 'low_stock', label: 'غرفها قربت تخلص', icon: <AlertTriangle size={14} className="text-orange-500" /> },
  { id: 'sold_out', label: 'فنادق خلصانة (Sold Out)', icon: <XCircle size={14} className="text-slate-500" /> },
  { id: 'expiring_soon', label: 'أسعارها قربت تخلص', icon: <Clock size={14} className="text-orange-500" /> },
  { id: 'expired_prices', label: 'أسعارها منتهية', icon: <Activity size={14} className="text-red-500" /> },
];

const CountryCityMap: { [key: string]: { id: string, label: string }[] } = {
  'SA': [
    { id: 'makkah', label: 'مكة المكرمة' },
    { id: 'madinah', label: 'المدينة المنورة' },
    { id: 'jeddah', label: 'جدة' },
    { id: 'riyadh', label: 'الرياض' },
    { id: 'khobar', label: 'الخبر' },
    { id: 'dammam', label: 'الدمام' },
    { id: 'abha', label: 'أبها' }
  ],
  'AE': [
    { id: 'dubai', label: 'دبي' },
    { id: 'abu_dhabi', label: 'أبوظبي' },
    { id: 'sharjah', label: 'الشارقة' },
    { id: 'ajman', label: 'عجمان' },
    { id: 'ras_al_khaimah', label: 'رأس الخيمة' }
  ],
  'QA': [
    { id: 'doha', label: 'الدوحة' },
    { id: 'al_wakrah', label: 'الوكرة' },
    { id: 'al_khor', label: 'الخور' }
  ],
  'KW': [
    { id: 'kuwait_city', label: 'مدينة الكويت' },
    { id: 'hawally', label: 'حولي' },
    { id: 'al_ahmadi', label: 'الأحمدي' }
  ],
  'BH': [
    { id: 'manama', label: 'المنامة' },
    { id: 'muharraq', label: 'المحرق' },
    { id: 'riffa', label: 'الرفاع' }
  ],
  'OM': [
    { id: 'muscat', label: 'مسقط' },
    { id: 'salalah', label: 'صلالة' },
    { id: 'sohar', label: 'صحار' }
  ],
  'EG': [
    { id: 'cairo', label: 'القاهرة' },
    { id: 'alexandria', label: 'الإسكندرية' },
    { id: 'sharm_el_sheikh', label: 'شرم الشيخ' },
    { id: 'hurghada', label: 'الغردقة' },
    { id: 'el_gouna', label: 'الجونة' },
    { id: 'north_coast', label: 'الساحل الشمالي' },
    { id: 'marassi', label: 'مراسي' }
  ],
  'JO': [
    { id: 'amman', label: 'عمان' },
    { id: 'aqaba', label: 'العقبة' }
  ]
};

// --- المكونات المساعدة للواجهة ---

const PremiumDropdown = ({ value, options, onChange, icon: Icon, label, disabled = false }: { value: string, options: { id?: string, label: string, icon?: React.ReactNode }[], onChange: (val: string) => void, icon?: any, label: string, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => (o.id || o.label) === value) || options[0];

  return (
    <div className={`relative group ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3 mr-2 tracking-tight">
        {Icon && <Icon size={12} className="text-[#0f172a]" />} {label}
      </label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-black text-text outline-none shadow-sm text-xs hover:border-slate-200 transition-all cursor-pointer group-hover:shadow-md min-h-[50px]"
      >
        <div className="flex items-center gap-3">
          {selectedOption.icon && <span className="text-[#0f172a] opacity-60 group-hover:opacity-100 transition-opacity">{selectedOption.icon}</span>}
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-2 no-scrollbar">
            {options.map((opt, i) => (
              <button
                key={opt.id || opt.label}
                onClick={() => {
                  onChange(opt.id || opt.label);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${((opt.id || opt.label) === value) ? 'bg-slate-100 text-[#0f172a]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {opt.icon && <span className={(opt.id || opt.label) === value ? 'text-slate-800' : 'text-slate-400'}>{opt.icon}</span>}
                {opt.label}
                {((opt.id || opt.label) === value) && <Check size={14} className="mr-auto text-[#0f172a]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface DestinationsTabProps {
  hotels: AdminHotel[];
  setHotels: React.Dispatch<React.SetStateAction<AdminHotel[]>>;
  // New API-based props (optional for backward compatibility)
  onSave?: (hotel: AdminHotel) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (id: string) => Promise<boolean>;
  onCreate?: (hotel: Partial<AdminHotel>) => Promise<AdminHotel | null>;
  onRefresh?: () => Promise<void>;
  saving?: boolean;
  onCreateReview?: (review: Partial<Review> & { hotelId: string }) => Promise<boolean>;
  onDeleteReview?: (id: string) => Promise<boolean>;
  onToggleFeatured?: (id: string) => Promise<boolean>;
  onToggleVisibility?: (id: string) => Promise<boolean>;
  onUpdateRoom?: (hotelId: string, roomId: string, roomData: Partial<Room>) => Promise<{ success: boolean; error?: string }>;
}

const DestinationsTab: React.FC<DestinationsTabProps> = ({
  hotels,
  setHotels,
  onSave,
  onDelete,
  onCreate,
  onRefresh,
  saving = false,
  onCreateReview,
  onDeleteReview,
  onToggleFeatured,
  onToggleVisibility,
  onUpdateRoom
}) => {
  /* New Filter State */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
  const [activeEditTab, setActiveEditTab] = useState<'overview' | 'rooms' | 'gallery' | 'reviews'>('overview');
  const [editingHotel, setEditingHotel] = useState<AdminHotel | null>(null);
  const [isManualCity, setIsManualCity] = useState(false);
  const [roomImageInputs, setRoomImageInputs] = useState<{ [key: number]: string }>({});
  const [galleryInput, setGalleryInput] = useState('');

  // New Review State
  const [newReview, setNewReview] = useState({ user: '', comment: '', rating: 5, date: new Date().toISOString().split('T')[0] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [bulkActionTab, setBulkActionTab] = useState<'visibility' | 'featured'>('visibility');
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState<number | null>(null); // Track which room is picking images


  // Helper Functions for Advanced Filters
  const getTotalAvailability = (hotel: AdminHotel) => {
    return (hotel.rooms || []).reduce((acc, r) => acc + (r.available || 0), 0);
  };

  const isPricingExpiringSoon = (hotel: AdminHotel) => {
    // Check if any room has active pricing periods ending within 7 days
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return (hotel.rooms || []).some(r =>
      (r.pricingPeriods || []).some(p => {
        const end = new Date(p.endDate);
        return end > now && end <= nextWeek;
      })
    );
  };

  const isPricingExpired = (hotel: AdminHotel) => {
    // If no periods or all periods ended
    if (!hotel.rooms || hotel.rooms.length === 0) return false;
    const now = new Date();
    return (hotel.rooms || []).some(r =>
      (r.pricingPeriods || []).length > 0 &&
      (r.pricingPeriods || []).every(p => new Date(p.endDate) < now)
    );
  };


  const generateRoomAnalysisSummary = (h: AdminHotel): string => {
    if (!h.rooms || h.rooms.length === 0) return "لا توجد غرف مسجلة حالياً لتحليلها.";
    const totalAvail = h.rooms.reduce((acc: number, r: Room) => acc + (r.available || 0), 0);
    const avgPrice = h.rooms.length > 0 ? Math.round(h.rooms.reduce((acc: number, r: Room) => acc + (r.price || 0), 0) / h.rooms.length) : 0;

    let analysis = `تحليل elattal co: متوفر ${totalAvail} غرف بمتوسط سعر ${avgPrice} ريال سعودي.\n\n`;
    h.rooms.forEach(r => {
      const activePeriods = r.pricingPeriods?.length || 0;
      const meal = MEAL_PLANS.find(m => m.id === r.mealPlan)?.label || 'بدون وجبات';
      analysis += `• ${r.name}: ${r.price} ريال سعودي | ${activePeriods} فترات تسعير | ${meal}\n`;
    });
    return analysis;
  };



  const toggleHotelAmenity = (id: string) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const current = [...(prev.amenities || [])];
      const index = current.indexOf(id);
      if (index > -1) current.splice(index, 1);
      else current.push(id);
      return { ...prev, amenities: current };
    });
  };

  const toggleRoomAmenity = (roomIdx: number, amenityId: string) => {
    setEditingHotel(prev => {
      if (!prev || !prev.rooms || !prev.rooms[roomIdx]) return prev;
      const updatedRooms = [...prev.rooms];
      const room = { ...updatedRooms[roomIdx] };
      const currentAmenities = [...(room.amenities || [])];
      const index = currentAmenities.indexOf(amenityId);
      if (index > -1) currentAmenities.splice(index, 1);
      else currentAmenities.push(amenityId);
      room.amenities = currentAmenities;
      updatedRooms[roomIdx] = room;
      return { ...prev, rooms: updatedRooms };
    });
  };

  const deleteHotel = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف الفندق نهائياً؟')) {
      if (onDelete) {
        // Always call onDelete with string id
        await onDelete(String(id));
        // Refresh the list after deletion
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setHotels(hotels.filter(h => h.id !== id));
      }
    }
  };

  const toggleVisibility = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (onToggleVisibility) {
      const success = await onToggleVisibility(String(id));
      if (success) {
        if (onRefresh) await onRefresh();
      } else {
        alert('فشل في تحديث حالة الظهور. يرجى التأكد من تشغيل السيرفر.');
      }
    } else {
      // Fallback for local state
      setHotels(hotels.map(h => h.id === id ? { ...h, isVisible: !h.isVisible } : h));
    }
  };

  const toggleFeaturedHelper = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (onToggleFeatured) {
      const success = await onToggleFeatured(String(id));
      if (success) {
        if (onRefresh) await onRefresh();
      } else {
        alert('فشل في تحديث حالة التميز.');
      }
    }
  };

  // Bulk toggle all hotels visibility
  const toggleAllHotelsVisibility = async (show: boolean) => {
    if (!onToggleVisibility) return;

    const hotelsToToggle = hotels.filter(h => h.isVisible !== show);
    const promises = hotelsToToggle.map(hotel =>
      typeof hotel.id === 'string' ? onToggleVisibility(hotel.id) : Promise.resolve(false)
    );

    await Promise.all(promises);
    if (onRefresh) await onRefresh();
  };

  // Bulk toggle featured hotels visibility
  const toggleFeaturedHotelsVisibility = async (show: boolean) => {
    if (!onToggleVisibility) return;

    const featuredHotels = hotels.filter(h => h.isFeatured && h.isVisible !== show);
    const promises = featuredHotels.map(hotel =>
      typeof hotel.id === 'string' ? onToggleVisibility(hotel.id) : Promise.resolve(false)
    );

    await Promise.all(promises);
    if (onRefresh) await onRefresh();
  };

  // Bulk make all hotels featured
  const makeAllFeatured = async (featured: boolean) => {
    if (!onToggleFeatured) return;

    const hotelsToToggle = hotels.filter(h => h.isFeatured !== featured);
    const promises = hotelsToToggle.map(hotel =>
      typeof hotel.id === 'string' ? onToggleFeatured(hotel.id) : Promise.resolve()
    );

    await Promise.all(promises);
    if (onRefresh) await onRefresh();
  };

  // [FIX] Parse coords (lat,lng string) to separate fields if they don't exist
  const startEditing = (hotel: AdminHotel) => {
    let initialLat = hotel.lat || '';
    let initialLng = hotel.lng || '';

    // If lat/lng missing but coords exists (from DB), parse it
    if ((!initialLat || !initialLng) && (hotel as any).coords) {
      const coords = (hotel as any).coords;
      if (Array.isArray(coords) && coords.length === 2) {
        initialLat = String(coords[0]);
        initialLng = String(coords[1]);
      } else if (typeof coords === 'string') {
        const parts = coords.split(',');
        if (parts.length === 2) {
          initialLat = parts[0].trim();
          initialLng = parts[1].trim();
        }
      }
    }

    const isManual = !(CountryCityMap[hotel.country || 'SA'] || []).some(c => c.id === hotel.city);
    setIsManualCity(isManual);

    setEditingHotel({
      ...hotel,
      lat: initialLat,
      lng: initialLng,
      summary: generateRoomAnalysisSummary(hotel)
    });
    setActiveEditTab('overview');
    setViewMode('edit');
  };

  const saveChanges = async (keepOpen: boolean = false) => {
    if (editingHotel) {
      // [FIX] Sync lat/lng back to coords string for API
      const hotelToSave = {
        ...editingHotel,
        distanceFromHaram: (editingHotel.distance || editingHotel.distanceFromHaram || '').toString().trim(),
      };

      // Check if it's a new hotel (ID is a timestamp)
      const isNew = typeof editingHotel.id === 'string' && editingHotel.id.length > 10 && !isNaN(Number(editingHotel.id));

      let result: { success: boolean; error?: string } = { success: false };
      if (isNew && onCreate) {
        const created = await onCreate(hotelToSave);
        if (created) result = { success: true };
      } else if (onSave) {
        result = await onSave(hotelToSave);
      } else {
        // Fallback for local state only (dev mode)
        const updatedHotel = isNew ? { ...hotelToSave, id: `hotel-${Date.now()}` } : (hotelToSave as any);
        if (isNew) {
          setHotels([...hotels, updatedHotel]);
        } else {
          setHotels(hotels.map(h => h.id === editingHotel.id ? updatedHotel : h));
        }
        result = { success: true };
        setEditingHotel(null);
      }

      if (result.success) {
        if (!keepOpen) {
          setViewMode('grid');
          setEditingHotel(null);
        } else if (onRefresh) {
          await onRefresh();
        }
        alert('تم حفظ التغييرات بنجاح!');
      } else {
        alert(`حدث خطأ أثناء حفظ التعديلات: ${result.error || 'خطأ غير معروف'}`);
      }
    }
  };


  const updateRoomField = (idx: number, field: keyof Room, value: any) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = [...prev.rooms];
      let room = { ...updated[idx], [field]: value };

      if (field === 'type') {
        const typeToCapacity: Record<string, number> = {
          'single': 1, 'double': 2, 'triple': 3, 'quad': 4, 'suite': 4, 'studio': 2
        };
        if (typeToCapacity[value]) room.capacity = typeToCapacity[value];
      }

      updated[idx] = room;
      const summary = generateRoomAnalysisSummary({ ...prev, rooms: updated });
      return { ...prev, rooms: updated, summary };
    });
  };



  // ✨ Handle Quick Save for Single Room
  const handleSaveRoom = async (roomIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Saving room:', roomIdx);

    if (!editingHotel) {
      alert('حدث خطأ: لا يوجد فندق قيد التعديل');
      return;
    }

    const room = (editingHotel.rooms || [])[roomIdx];
    console.log('Room data to save:', room);

    try {
      if (!room.id) {
        console.log('New room, triggering main save');
        await saveChanges(true); // Keep open
        return;
      }

      if (!onUpdateRoom) {
        console.log('No onUpdateRoom function provided, triggering main save');
        await saveChanges(true); // Keep open
        return;
      }

      console.log('Calling onUpdateRoom with:', editingHotel.id, room.id, room);
      const result = await onUpdateRoom(String(editingHotel.id), room.id, room);
      console.log('Save result:', result);

      if (result.success) {
        alert('تم حفظ بيانات الغرفة بنجاح!');
        if (onRefresh) await onRefresh();
      } else {
        console.log('Update failed:', result.error);
        alert(`فشل حفظ بيانات الغرفة: ${result.error || 'خطأ مجهول'}`);
      }
    } catch (err) {
      console.error('Error saving room:', err);
      // Try one last time with main save
      try {
        await saveChanges(true);
      } catch (e) {
        alert('حدث خطأ أثناء الحفظ.');
      }
    }
  };

  const removeRoom = (idx: number) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = (prev.rooms || []).filter((_, i) => i !== idx);
      const summary = generateRoomAnalysisSummary({ ...prev, rooms: updated });
      return { ...prev, rooms: updated, summary };
    });
  };

  const addPricingPeriod = (roomIdx: number) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = [...prev.rooms];
      const newPeriod: PricingPeriod = {
        id: `p-${Date.now()}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        price: updated[roomIdx].price
      };
      updated[roomIdx] = {
        ...updated[roomIdx],
        pricingPeriods: [...(updated[roomIdx].pricingPeriods || []), newPeriod]
      };
      return { ...prev, rooms: updated };
    });
  };

  const removePricingPeriod = (roomIdx: number, periodId: string) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = [...(prev.rooms || [])];
      if (!updated[roomIdx]) return prev;

      // DEEP SAFETY: Ensure pricingPeriods exists before filtering
      const currentPeriods = updated[roomIdx].pricingPeriods || [];

      updated[roomIdx] = {
        ...updated[roomIdx],
        pricingPeriods: currentPeriods.filter(p => p.id !== periodId)
      };
      return { ...prev, rooms: updated };
    });
  };

  const updatePricingPeriod = (roomIdx: number, periodId: string, field: keyof PricingPeriod, value: any) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = [...(prev.rooms || [])];
      if (!updated[roomIdx]) return prev;

      // DEEP SAFETY: Initialize if undefined
      const currentPeriods = updated[roomIdx].pricingPeriods || [];

      updated[roomIdx] = {
        ...updated[roomIdx],
        pricingPeriods: currentPeriods.map(p =>
          p.id === periodId ? { ...p, [field]: value } : p
        )
      };
      return { ...prev, rooms: updated };
    });
  };

  const addRoomImage = (roomIdx: number) => {
    const url = roomImageInputs[roomIdx];
    if (url && url.trim() !== '') {
      setEditingHotel(prev => {
        if (!prev) return prev;
        const updated = [...(prev.rooms || [])];
        updated[roomIdx] = {
          ...updated[roomIdx],
          images: [...(updated[roomIdx].images || []), url]
        };
        return { ...prev, rooms: updated };
      });
      setRoomImageInputs(prev => ({ ...prev, [roomIdx]: '' }));
    }
  };

  const removeRoomImage = (roomIdx: number, imgUrl: string) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const updated = [...prev.rooms];
      updated[roomIdx] = {
        ...updated[roomIdx],
        images: updated[roomIdx].images.filter(img => img !== imgUrl)
      };
      return { ...prev, rooms: updated };
    });
  };


  const duplicateRoom = (roomIdx: number) => {
    setEditingHotel(prev => {
      if (!prev) return prev;
      const roomToClone = prev.rooms[roomIdx];
      // [FIX] Strip ID to ensure it's treated as a NEW room by the backend
      const { id, ...roomDataWithoutId } = roomToClone;
      const newRoom = {
        ...roomDataWithoutId,
        name: roomToClone.name, // [FIX] Remove the "(نسخة)" suffix
        images: [...(roomToClone.images || [])],
        amenities: [...(roomToClone.amenities || [])],
        pricingPeriods: roomToClone.pricingPeriods?.map(p => ({ ...p, id: `p-${Date.now()}-${Math.random()}` })) || []
      };
      return { ...prev, rooms: [...prev.rooms, newRoom] };
    });
  };

  // --- FILTERING LOGIC ---
  const filteredHotels = hotels.filter(h => {
    // 1. Search Query
    if (searchQuery && !h.name.includes(searchQuery)) return false;

    // 2. Country Filter
    if (selectedCountry !== 'all' && h.country !== selectedCountry) return false;

    // 3. City Filter
    if (selectedCity !== 'all' && h.city !== selectedCity) return false;

    // 4. Status Filter
    if (filterStatus === 'active' && !h.isVisible) return false;
    if (filterStatus === 'inactive' && h.isVisible) return false;
    if (filterStatus === 'featured' && !h.isFeatured) return false;

    if (filterStatus === 'low_stock') {
      const total = getTotalAvailability(h);
      if (total === 0 || total > 5) return false;
    }

    if (filterStatus === 'sold_out') {
      if (getTotalAvailability(h) > 0) return false;
    }

    if (filterStatus === 'expiring_soon' && !isPricingExpiringSoon(h)) return false;
    if (filterStatus === 'expired_prices' && !isPricingExpired(h)) return false;

    return true;
  });

  const getMapUrl = (hotel: AdminHotel) => {
    if (hotel.lat && hotel.lng && String(hotel.lat).trim() !== '' && String(hotel.lng).trim() !== '') {
      return `https://maps.google.com/maps?q=${String(hotel.lat).trim()},${String(hotel.lng).trim()}&z=16&output=embed`;
    }
    const query = hotel.mapQuery && String(hotel.mapQuery).trim() !== '' ? hotel.mapQuery : hotel.name;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  };



  const handleAddFromGallery = (url: string) => {
    if (showGalleryPicker === null) return;

    setEditingHotel(prev => {
      if (!prev) return prev;
      const idx = showGalleryPicker;

      // Check duplicate
      if ((prev.rooms[idx].images || []).includes(url)) {
        return prev;
      }

      if ((prev.rooms[idx].images || []).length >= 8) {
        alert('عذراً، الحد الأقصى لصور الغرفة هو 8 صور فقط لضمان سرعة تصفح الموقع.');
        return prev;
      }

      const updatedRooms = [...prev.rooms];
      updatedRooms[idx] = {
        ...updatedRooms[idx],
        images: [...(updatedRooms[idx].images || []), url]
      };

      return { ...prev, rooms: updatedRooms };
    });

    setShowGalleryPicker(null);
  };

  if (viewMode === 'edit' && editingHotel) {
    const isSaudi = editingHotel.country === 'SA';
    return (
      <div className="animate-in slide-in-from-left duration-500">
        {/* Gallery Picker Modal */}
        {showGalleryPicker !== null && editingHotel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGalleryPicker(null)}>
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                    <Images size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">اختر من معرض الفندق</h3>
                    <p className="text-xs text-slate-400">انقر على الصورة لإضافتها للغرفة فوراً</p>
                  </div>
                </div>
                <button onClick={() => setShowGalleryPicker(null)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
                {(editingHotel.gallery && editingHotel.gallery.length > 0) ? editingHotel.gallery.map((img, i) => {
                  const isSelected = editingHotel.rooms[showGalleryPicker]?.images?.includes(img);
                  return (
                    <div
                      key={i}
                      onClick={() => !isSelected && handleAddFromGallery(img)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-emerald-500 opacity-50 cursor-not-allowed' : 'border-transparent hover:border-sky-500'}`}
                    >
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-3xl">
                    <Images size={48} className="opacity-20" />
                    <p className="text-sm font-black opacity-50">لا توجد صور في معرض الفندق</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4 md:gap-5">
            <button onClick={() => setViewMode('grid')} className="p-3 md:p-4 bg-white rounded-2xl md:rounded-3xl text-slate-400 hover:text-[#0f172a] border border-slate-100 shadow-sm transition-all active:scale-90 flex-shrink-0"><ArrowRight size={22} /></button>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-text leading-tight">{editingHotel.name}</h2>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[8px] md:text-[10px]">نظام الإدارة الفائق - ضيافة خلود v3.5</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              disabled={saving}
              onClick={() => setViewMode('grid')}
              className="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              disabled={saving}
              onClick={() => saveChanges()}
              className="flex-[2] md:flex-none px-8 md:px-10 py-3.5 md:py-4 bg-[#0ca678] text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm disabled:bg-emerald-800 disabled:opacity-80 transition-all active:scale-95"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-10 p-2 bg-white/50 backdrop-blur rounded-[2rem] border border-white overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'بيانات الفندق', icon: <Activity size={18} /> },
            { id: 'rooms', label: 'إدارة الغرف والتسعير', icon: <Bed size={18} /> },
            { id: 'gallery', label: 'معرض الصور الملحقة', icon: <Images size={18} /> },
            { id: 'reviews', label: 'إدارة التقييمات', icon: <MessageSquare size={18} /> }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveEditTab(tab.id as any)} className={`flex-1 min-w-fit flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all ${activeEditTab === tab.id ? 'bg-[#0ca678] text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-white hover:text-slate-700'}`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        <div className="pb-20 space-y-8">
          {activeEditTab === 'overview' && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Right Content - Form - 65% */}
              <div className="lg:w-[65%] space-y-8 md:space-y-10">
                <div className="bg-white/70 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group/form">
                  {/* Decorative background element */}
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-slate-800/5 rounded-full blur-3xl transition-transform duration-1000 group-hover/form:scale-150"></div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                        <Info size={22} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-text tracking-tight">المعلومات الأساسية</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic Information Details</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-800 animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-500">وضع التعديل النشط</span>
                    </div>
                  </div>

                  {/* Main Hotel Image Uploader */}
                  <div className="mb-8">
                    <ImageUploader
                      label="الصورة الرئيسية للفندق"
                      hotelId={String(editingHotel.id)}
                      hotelName={editingHotel.name}
                      type="hotel"
                      onUploadSuccess={(url) => setEditingHotel(prev => prev ? { ...prev, image: url } : prev)}
                    />
                    {editingHotel.image && (
                      <div
                        className="mt-4 aspect-[3/2] rounded-[2.5rem] overflow-hidden border-2 border-[#0f172a] shadow-xl animate-in zoom-in-95 duration-500 self-start w-full md:w-2/3 lg:w-1/2"
                        style={{ aspectRatio: '3/2' }}
                      >
                        <img src={getImageUrl(editingHotel.image)} className="w-full h-full object-cover" alt="Main" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-8 relative z-10">
                    {/* Name & Location Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group/input">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-3 mr-1 transition-colors group-focus-within/input:text-primary">
                          <HotelIcon size={14} /> اسم الفندق
                        </label>
                        <input
                          type="text"
                          value={editingHotel.name}
                          onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                          className="w-full px-7 py-5 bg-slate-50/50 border border-slate-200/60 rounded-[1.5rem] font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-[#0ca678] focus:ring-4 ring-[#0ca678]/5 placeholder:text-slate-300"
                        />
                      </div>
                      <div className="group/input">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-3 mr-2 transition-colors group-focus-within/input:text-primary">
                          <MapPin size={14} /> الموقع (الحي / المنطقة)
                        </label>
                        <input
                          type="text"
                          value={editingHotel.location}
                          onChange={(e) => setEditingHotel({ ...editingHotel, location: e.target.value })}
                          placeholder="مثال: المنطقة المركزية"
                          className="w-full px-7 py-5 bg-slate-50/50 border border-slate-200/60 rounded-[1.5rem] font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-[#0ca678] focus:ring-4 ring-[#0ca678]/5 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Country & City Grid (New) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group/input">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-3 mr-1 transition-colors group-focus-within/input:text-indigo-600">
                          <Globe size={14} /> الدولة
                        </label>
                        <PremiumDropdown
                          label=""
                          value={editingHotel.country || 'SA'}
                          options={ArabCountries}
                          onChange={(val) => {
                            const firstCity = (CountryCityMap[val] && CountryCityMap[val].length > 0) ? CountryCityMap[val][0].id : '';
                            setIsManualCity(false);
                            setEditingHotel({ ...editingHotel, country: val, city: firstCity });
                          }}
                        />
                      </div>
                      <div className="group/input">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-3 mr-1 transition-colors group-focus-within/input:text-indigo-600">
                          <Map size={14} /> المدينة
                        </label>
                        <div className="flex gap-2">
                          {!isManualCity ? (
                            <div className="flex-1">
                              <PremiumDropdown
                                label=""
                                value={editingHotel.city}
                                options={[
                                  ...(CountryCityMap[editingHotel.country || 'SA'] || []),
                                  { id: 'other', label: 'مدينة أخرى...' }
                                ]}
                                onChange={(val) => {
                                  if (val !== 'other') {
                                    setEditingHotel({ ...editingHotel, city: val });
                                  } else {
                                    setIsManualCity(true);
                                    setEditingHotel({ ...editingHotel, city: '' });
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex gap-2 animate-in slide-in-from-left-4 duration-300">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={editingHotel.city}
                                  autoFocus
                                  onChange={(e) => setEditingHotel({ ...editingHotel, city: e.target.value })}
                                  placeholder="اكتب اسم المدينة هنا..."
                                  className="w-full px-7 py-5 bg-white border-2 border-indigo-500 rounded-[1.5rem] font-bold text-slate-700 outline-none shadow-lg shadow-indigo-500/10 text-xs"
                                />
                                <button
                                  onClick={() => {
                                    const firstCity = (CountryCityMap[editingHotel.country || 'SA'] || [])[0]?.id || '';
                                    setIsManualCity(false);
                                    setEditingHotel({ ...editingHotel, city: firstCity });
                                  }}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                                  title="إلغاء والعودة للقائمة"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating & Distance Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                      {/* Star Rating Box */}
                      <div className="xl:col-span-7 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-center items-center group/stars border-dashed hover:border-amber-200 hover:bg-amber-50/10 transition-all duration-500">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-4">تصنيف النجوم الفندقي</label>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setEditingHotel({ ...editingHotel, rating: star })}
                              className={`transition-all duration-500 p-2 rounded-2xl ${editingHotel.rating >= star ? 'scale-110 active:scale-90 text-amber-400 rotate-0' : 'text-slate-200 hover:text-slate-300 -rotate-12'}`}
                            >
                              <Star size={36} fill={editingHotel.rating >= star ? "currentColor" : "none"} strokeWidth={editingHotel.rating >= star ? 1.5 : 2} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Distance Box */}
                      <div className="xl:col-span-12 flex flex-col group/dist">
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-3 mr-2 transition-colors group-focus-within/dist:text-blue-600">
                          {editingHotel.city?.includes('مكة') ? 'المسافة عن الكعبة' :
                            editingHotel.city?.includes('المدينة') ? 'المسافة عن المسجد النبوي' :
                              'المسافة عن المركز'}
                        </label>
                        <div className="relative h-full">
                          <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center pointer-events-none transition-transform duration-500 group-focus-within/dist:scale-110">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                              <MapPinned size={20} />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={editingHotel.distance || ''}
                            onChange={(e) => setEditingHotel({ ...editingHotel, distance: e.target.value })}
                            placeholder={isSaudi ? "مثال: 500 متر" : "مثال: 2 كم"}
                            className="w-full h-full pl-6 pr-20 py-5 bg-slate-50/50 border border-slate-200/60 rounded-[2rem] font-bold text-text outline-none transition-all focus:bg-white focus:border-[#0ca678] focus:ring-4 ring-[#0ca678]/5 placeholder:text-slate-300 text-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* New Row: View & Free Transport */}
                    <div className={`grid grid-cols-1 ${isSaudi ? 'md:grid-cols-2' : ''} gap-8`}>
                      <div className="group/input">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-3 mr-1 transition-colors group-focus-within/input:text-primary">
                          <LayoutGrid size={14} /> الإطلالة المميزة
                        </label>
                        <PremiumDropdown
                          label=""
                          value={editingHotel.view || ''}
                          onChange={(val) => setEditingHotel({ ...editingHotel, view: val })}
                          icon={Sparkles}
                          options={isSaudi ? [
                            { id: '', label: 'بدون إطلالة محددة' },
                            { id: 'Kaaba View', label: 'إطلالة على الكعبة', icon: <div className="w-3 h-3 bg-primary rounded-sm" /> },
                            { id: 'Prophet Mosque View', label: 'إطلالة على المسجد النبوي', icon: <div className="w-3 h-3 bg-primary rounded-sm" /> }
                          ] : [
                            { id: '', label: 'بدون إطلالة محددة' },
                            { id: 'City View', label: 'إطلالة على المدينة', icon: <Sun size={14} /> },
                            { id: 'Sea View', label: 'إطلالة على الشاطئ', icon: <Waves size={14} /> },
                            { id: 'Garden View', label: 'إطلالة على الحديقة', icon: <Mountain size={14} /> }
                          ]}
                        />
                      </div>

                      {isSaudi && (
                        <div className="flex items-center p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 h-full group/toggle">
                          <div className="flex-1">
                            <h4 className="font-bold text-text mb-1 flex items-center gap-2">
                              <Bus size={16} className="text-primary" />
                              توصيل مجاني للحرم
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold">خدمة نقل ترددية مجانية للنزلاء</p>
                          </div>
                          <button
                            onClick={() => setEditingHotel({ ...editingHotel, hasFreeTransport: !editingHotel.hasFreeTransport })}
                            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${editingHotel.hasFreeTransport ? 'bg-slate-800' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${editingHotel.hasFreeTransport ? 'left-1 translate-x-0' : 'left-1 translate-x-6'}`}></div>
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Description Section */}
                    <div className="group/textarea">
                      <div className="flex items-center justify-between mb-3 mr-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase transition-colors group-focus-within/textarea:text-primary">وصف الفندق التفصيلي</label>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter transition-all group-focus-within/textarea:bg-emerald-100 group-focus-within/textarea:text-primary">SEO Optimized Content</span>
                      </div>
                      <div className="relative">
                        <textarea
                          value={editingHotel.description}
                          onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                          className="w-full h-44 px-7 py-6 bg-slate-50/50 border border-slate-200/60 rounded-[2rem] font-medium text-slate-600 outline-none custom-scrollbar resize-none transition-all focus:bg-white focus:border-[#0ca678] focus:ring-4 ring-[#0ca678]/5 text-sm leading-relaxed"
                          placeholder="اكتب وصفاً جذاباً للفندق يتضمن أهم المميزات والموقع..."
                        />
                        <div className="absolute bottom-4 left-4 pointer-events-none opacity-20 group-focus-within/textarea:opacity-40 transition-opacity">
                          <LayoutGrid size={24} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geographic Location (New Section) */}
                <div className="bg-white/70 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group/location animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-4 mb-8 md:mb-10 relative z-10">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Map size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text tracking-tight">الموقع الجغرافي الدقيق</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exact Location (Map)</p>
                    </div>
                  </div>

                  <MapPicker
                    initialLat={typeof editingHotel.lat === 'string' ? editingHotel.lat : '21.4225'}
                    initialLng={typeof editingHotel.lng === 'string' ? editingHotel.lng : '39.8262'}
                    onLocationSelect={(lat, lng) => setEditingHotel({ ...editingHotel, lat, lng })}
                    isSaving={saving}
                    onSave={async (lat, lng) => {
                      // Check if it's a new hotel (no ID or temporary timestamp ID)
                      // New hotels use Date.now().toString() as ID (numeric string > 10 chars)
                      const isNew = !editingHotel.id ||
                        (typeof editingHotel.id === 'string' && editingHotel.id.startsWith('new-')) ||
                        (typeof editingHotel.id === 'string' && !isNaN(Number(editingHotel.id)) && editingHotel.id.length > 10); // Date.now() check

                      if (isNew) {
                        // For new hotels, just update local state and return success
                        setEditingHotel({ ...editingHotel, lat, lng });
                        return true;
                      }

                      // For existing hotels, update via API
                      try {
                        const result = await HotelsAPI.update(String(editingHotel.id), {
                          coords: [parseFloat(lat), parseFloat(lng)]
                        } as any);

                        if (result.success) {
                          setEditingHotel({ ...editingHotel, lat, lng });
                          if (onRefresh) await onRefresh();
                          return true;
                        }
                        return false;
                      } catch (e) {
                        console.error('Error saving location:', e);
                        return false;
                      }
                    }}
                  />
                </div>

                {/* Facilities & Landmarks */}
                <div className="bg-white/70 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group/facilities">
                  <div className="flex items-center gap-4 mb-8 md:mb-10 relative z-10">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <LayoutGrid size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text tracking-tight">التجهيزات والمحيط</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facilities & Surroundings</p>
                    </div>
                  </div>

                  <div className="space-y-10 relative z-10">
                    {/* Amenities */}
                    <div className="group/amenities">
                      <div className="flex items-center justify-between mb-5 mr-1">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider transition-colors group-active/amenities:text-blue-600">المرافق والخدمات المتوفرة</h4>
                        <div className="h-0.5 flex-1 bg-slate-100 mx-4 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {HOTEL_AMENITIES_LIST.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleHotelAmenity(item.id)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 transform active:scale-95 group/btn ${editingHotel.amenities.includes(item.id) ? 'bg-[#0ca678] border-[#0ca678] text-white shadow-xl shadow-emerald-100 -translate-y-1' : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-white hover:border-emerald-200 hover:text-[#0ca678] hover:shadow-lg'}`}
                          >
                            <div className={`transition-all duration-300 ${editingHotel.amenities.includes(item.id) ? 'text-white scale-110' : 'text-slate-300 group-hover/btn:text-slate-800'}`}>
                              {item.icon}
                            </div>
                            <span className="text-xs font-bold leading-none">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Creative Summary - 35% */}
              <div className="lg:w-[35%] space-y-6">
                {/* Live Summary Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                  {/* Subtle Background Accent */}
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#e6fcf5] text-[#0ca678] rounded-[1.25rem] flex items-center justify-center shadow-sm border border-[#c3fae8]">
                          <Activity size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight">ملخص العرض</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Live Information</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-[#0ca678] text-[9px] font-black rounded-lg border border-emerald-100/50 animate-pulse tracking-widest">LIVE</span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-slate-400 text-xs font-black flex items-center gap-3 uppercase tracking-wider">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#0ca678]">
                            <DollarSign size={14} />
                          </div>
                          السعر الأساسي
                        </span>
                        <span className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                          {editingHotel.price} <span className="text-[10px] text-slate-300 font-bold uppercase">SAR</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-slate-400 text-xs font-black flex items-center gap-3 uppercase tracking-wider">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                            <Bed size={14} />
                          </div>
                          عدد الغرف
                        </span>
                        <span className="text-2xl font-black text-slate-800">{editingHotel.rooms.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-slate-400 text-xs font-black flex items-center gap-3 uppercase tracking-wider">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                            <Star size={14} />
                          </div>
                          التقييم
                        </span>
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < editingHotel.rating ? "currentColor" : "none"} className={i < editingHotel.rating ? "" : "text-slate-100"} />)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-slate-400 text-xs font-black flex items-center gap-3 uppercase tracking-wider">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                            <MapPinned size={14} />
                          </div>
                          المسافة
                        </span>
                        <span className="text-sm font-black text-slate-700">{editingHotel.distance || "غير محدد"}</span>
                      </div>
                    </div>

                    <a
                      href={`/hotels/${editingHotel.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full mt-10 py-5 bg-[#e6fcf5] text-[#0ca678] hover:bg-[#0ca678] hover:text-white rounded-[1.5rem] border border-[#c3fae8] font-black text-xs transition-all flex items-center justify-center gap-3 group/preview shadow-sm"
                    >
                      <ExternalLink size={18} className="group-hover/preview:scale-110 group-hover/preview:rotate-12 transition-transform" />
                      معاينة صفحة الفندق
                    </a>
                  </div>
                </div>

                {/* Map Sidebar Card */}
                {/* Map Sidebar Removed */}
              </div>
            </div>
          )}

          {activeEditTab === 'rooms' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-12">
              {(editingHotel.rooms || []).map((room, idx) => (
                <div key={idx} className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] border-2 border-slate-100 relative group hover:shadow-2xl hover:border-emerald-200 transition-all duration-700 shadow-xl shadow-slate-200/40">
                  <div className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-[#0ca678] text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center font-black shadow-2xl z-20 border-8 border-[#f8fafc] text-sm md:text-xl">#{idx + 1}</div>

                  <div className="flex flex-col gap-8 md:gap-10">
                    {/* Top Bar: Title & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:items-center">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-2 md:mb-4">
                          <div className="p-3 bg-emerald-50 rounded-xl text-[#0ca678]">
                            <BedDouble size={24} />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم الغرفة</label>
                            <input
                              type="text"
                              value={room.name}
                              onChange={(e) => updateRoomField(idx, 'name', e.target.value)}
                              className="w-full text-xl font-black text-text bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                              placeholder="مثال: جناح ديلوكس مطل - 3 أفراد"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => updateRoomField(idx, 'isVisible', !(room.isVisible !== false))}
                          className={`p-3 rounded-xl border transition-all shadow-sm active:scale-95 ${room.isVisible !== false ? 'bg-emerald-50 text-[#0ca678] hover:bg-[#0ca678] hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          title={room.isVisible !== false ? 'إخفاء الغرفة' : 'إظهار الغرفة'}
                        >
                          {room.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => duplicateRoom(idx)}
                          className="flex-1 md:flex-none p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-[10px] font-black group/btn active:scale-95 shadow-sm"
                          title="نسخ الغرفة"
                        >
                          <Images size={16} className="group-hover/btn:scale-110 transition-transform" /> <span>نسخ</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذه الغرفة؟')) {
                              removeRoom(idx);
                            }
                          }}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                          title="حذف الغرفة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                      {/* Right Column: Images (4 cols) */}
                      <div className="xl:col-span-4 space-y-4">
                        <label className="text-xs font-black text-slate-500 flex items-center gap-2"><ImageIcon size={14} className="text-slate-800" /> صور الغرفة</label>

                        <div
                          className="relative w-full aspect-[3/2] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group/roomimg self-start"
                          style={{ aspectRatio: '3/2' }}
                        >
                          {room.images && room.images.length > 0 ? (
                            <img src={getImageUrl(room.images[0])} className="w-full h-full object-cover" alt="Room preview" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                              <Bed size={48} className="opacity-10" />
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">لا توجد صور</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <ImageUploader
                            label="رفع صورة للغرفة"
                            hotelId={String(editingHotel.id)}
                            hotelName={editingHotel.name}
                            roomId={room.id || `room-${idx}`}
                            roomName={room.name || `غرفة-${idx + 1}`}
                            type="room"
                            className="flex-1"
                            onUploadSuccess={(url) => {
                              setEditingHotel(prev => {
                                if (!prev) return prev;
                                if ((prev.rooms[idx].images || []).length >= 8) {
                                  alert('عذراً، الحد الأقصى لصور الغرفة هو 8 صور فقط لضمان سرعة تصفح الموقع.');
                                  return prev;
                                }
                                const updatedRooms = [...prev.rooms];
                                updatedRooms[idx] = {
                                  ...updatedRooms[idx],
                                  images: [...(updatedRooms[idx].images || []), url]
                                };
                                return { ...prev, rooms: updatedRooms };
                              });
                            }}
                          />
                          <button
                            onClick={() => setShowGalleryPicker(idx)}
                            className="h-40 px-4 border-2 border-dashed border-sky-100 bg-sky-50 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-sky-100 hover:border-sky-200 transition-all text-sky-600 self-end mb-3"
                          >
                            <Images size={20} />
                            <span className="text-[10px] font-black uppercase text-center w-20">من معرض الفندق</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 px-1">
                          <span>الصور المرفوعة</span>
                          <span>{(room.images || []).length} / 8</span>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                          {room.images?.map((img, i) => (
                            <div key={i} className="relative min-w-[60px] h-[60px] rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 group/thumb cursor-pointer hover:border-emerald-500 transition-colors">
                              <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                              <button onClick={() => removeRoomImage(idx, img)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all"><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Center Column: Specs (8 cols) */}
                      <div className="xl:col-span-8 space-y-8">

                        {/* 1. Main Specs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Inventory & Price */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">المخزون</label>
                              <input type="number" value={room.available} onChange={(e) => updateRoomField(idx, 'available', Number(e.target.value))} className="w-full px-5 py-4 bg-slate-50 border-slate-100 rounded-2xl font-black outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all text-sm" />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">السعر الأساسي</label>
                              <div className="relative">
                                <input type="number" value={room.price} onChange={(e) => updateRoomField(idx, 'price', Number(e.target.value))} className="w-full px-5 py-4 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-2xl font-black outline-none text-sm" />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">SAR</span>
                              </div>
                            </div>
                          </div>

                          {/* Capacity & Size */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">السعة (أفراد)</label>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateRoomField(idx, 'capacity', Math.max(1, (room.capacity || 2) - 1))} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">-</button>
                                <div className="flex-1 h-10 flex items-center justify-center font-black bg-slate-50 rounded-xl border border-slate-100">{room.capacity || 2}</div>
                                <button onClick={() => updateRoomField(idx, 'capacity', (room.capacity || 2) + 1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">+</button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">المساحة (م²)</label>
                              <div className="relative">
                                <input type="number" value={room.area} onChange={(e) => updateRoomField(idx, 'area', Number(e.target.value))} className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-black outline-none text-sm" placeholder="35" />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">م²</span>
                              </div>
                            </div>
                          </div>

                          {/* Beds */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-wider">تكوين الأسرة</label>
                              <input
                                type="text"
                                value={room.beds}
                                onChange={(e) => updateRoomField(idx, 'beds', e.target.value)}
                                className="w-full px-5 py-5 bg-white border border-slate-100 rounded-[1.5rem] font-black outline-none text-xs shadow-sm hover:border-emerald-100 focus:border-emerald-500 transition-all"
                                placeholder="مثال: 1 كينج"
                              />
                              {/* Bedding Suggestions */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {BEDDING_SUGGESTIONS.map(sug => (
                                  <button
                                    key={sug}
                                    onClick={() => updateRoomField(idx, 'beds', sug)}
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-emerald-50 hover:text-primary hover:border-emerald-200 transition-all"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Features Selects - Updated to Custom Dropdowns and Extra Bed Policy */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                          <div>
                            <PremiumDropdown
                              label="تصنيف الغرفة"
                              icon={LayoutGrid}
                              value={ROOM_TYPES.some(t => t.id === room.type) ? room.type : 'custom'}
                              onChange={(val) => updateRoomField(idx, 'type', val === 'custom' ? '' : val)}
                              options={ROOM_TYPES.map(t => ({ id: t.id, label: t.label, icon: <LayoutGrid size={14} /> }))}
                            />
                            {(!ROOM_TYPES.some(t => t.id === room.type) || room.type === 'custom') && (
                              <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                <input
                                  type="text"
                                  value={room.type === 'custom' ? '' : room.type}
                                  onChange={(e) => updateRoomField(idx, 'type', e.target.value)}
                                  placeholder="اكتب اسم التصنيف (مثال: غرفة ملكية)..."
                                  className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-[1.2rem] text-xs font-bold focus:ring-4 ring-emerald-500/5 outline-none placeholder:text-emerald-800/20 text-emerald-900 shadow-inner"
                                />
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-wider">سياسة السرير الإضافي</label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 h-[60px]">
                              <button
                                onClick={() => updateRoomField(idx, 'allowExtraBed', !room.allowExtraBed)}
                                className={`w-12 h-6 rounded-full transition-all relative ${room.allowExtraBed ? 'bg-blue-600' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${room.allowExtraBed ? 'right-6' : 'right-1'}`} />
                              </button>
                              <div className="flex-1">
                                <span className="text-[10px] font-black text-slate-700">تسمح بسرير إضافي؟ (سيخصم من رصيد الفندق الشامل)</span>
                              </div>
                              {room.allowExtraBed && (
                                <div className="flex items-center gap-6 animate-in slide-in-from-right-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase">أقصى عدد أسرة</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="5"
                                      value={room.maxExtraBeds || 1}
                                      onChange={(e) => updateRoomField(idx, 'maxExtraBeds', Number(e.target.value))}
                                      className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-center outline-none focus:border-blue-500 transition-all"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase">السعر لكل سرير</label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        value={room.extraBedPrice || 0}
                                        onChange={(e) => updateRoomField(idx, 'extraBedPrice', Number(e.target.value))}
                                        className="w-24 p-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-center outline-none focus:border-blue-500 transition-all pl-7"
                                      />
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">SAR</span>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400 mt-1">{room.extraBedPrice === 0 ? 'سيظهر كـ "مجاني"' : 'سيضاف لسعر الغرفة'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                          <PremiumDropdown
                            label="خطة الوجبات"
                            icon={Utensils}
                            value={room.mealPlan}
                            onChange={(val) => updateRoomField(idx, 'mealPlan', val)}
                            options={MEAL_PLANS.map(m => ({
                              id: m.id,
                              label: m.label,
                              icon: m.id === 'none' ? <XCircle size={14} /> : <Coffee size={14} />
                            }))}
                          />

                          <PremiumDropdown
                            label="إطلالة الغرفة"
                            icon={Mountain}
                            value={room.view}
                            onChange={(val) => updateRoomField(idx, 'view', val)}
                            options={VIEW_OPTIONS.map(v => ({
                              label: v.label,
                              icon: v.icon
                            }))}
                          />
                        </div>


                      </div>
                    </div>

                    {/* 3. Date Pricing Schedule */}
                    <div className="pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><CalendarDays size={28} /></div>
                          <div>
                            <h5 className="font-black text-text text-lg leading-none">تسعير مخصص لتواريخ محددة</h5>
                            <p className="text-[11px] font-bold text-slate-400 mt-2 tracking-tight">أضف أسعاراً خاصة للمواسم، الأعياد، أو أي فترة زمنية</p>
                          </div>
                        </div>
                        <button onClick={() => addPricingPeriod(idx)} className="flex items-center gap-3 px-6 py-3 bg-primary text-white text-xs font-black rounded-2xl hover:bg-primary transition-all shadow-lg">
                          <PlusCircle size={18} /> إضافة فترة
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {room.pricingPeriods && room.pricingPeriods.length > 0 ? (
                          room.pricingPeriods.map((period) => (
                            <div key={period.id} className="grid grid-cols-1 md:grid-cols-10 gap-6 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 items-center animate-in zoom-in-95 duration-300 relative group/period">
                              <div className="md:col-span-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3 mr-1"><CalendarClock size={12} className="text-slate-800" /> من تاريخ</label>
                                <div className="relative group/date">
                                  <input type="date" value={period.startDate} onChange={(e) => updatePricingPeriod(idx, period.id, 'startDate', e.target.value)} className="w-full px-6 py-4 bg-white rounded-[1.2rem] text-xs font-black border border-slate-100 outline-none focus:ring-4 ring-emerald-500/5 hover:border-emerald-200 transition-all text-center appearance-none shadow-sm cursor-pointer" />
                                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover/date:text-slate-800 transition-colors" />
                                </div>
                              </div>
                              <div className="md:col-span-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3 mr-1"><History size={12} className="text-amber-500" /> إلى تاريخ</label>
                                <div className="relative group/date">
                                  <input type="date" value={period.endDate} onChange={(e) => updatePricingPeriod(idx, period.id, 'endDate', e.target.value)} className="w-full px-6 py-4 bg-white rounded-[1.2rem] text-xs font-black border border-slate-100 outline-none focus:ring-4 ring-amber-500/5 hover:border-amber-200 transition-all text-center appearance-none shadow-sm cursor-pointer" />
                                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover/date:text-amber-500 transition-colors" />
                                </div>
                              </div>
                              <div className="md:col-span-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3 mr-1"><DollarSign size={12} /> السعر لهذه الفترة</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={period.price}
                                    onChange={(e) => updatePricingPeriod(idx, period.id, 'price', Number(e.target.value))}
                                    className="w-full px-5 py-4 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-[1.2rem] font-black outline-none text-xs"
                                  />
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">SAR</span>
                                </div>
                              </div>
                              <div className="md:col-span-1 flex justify-end">
                                <button onClick={() => removePricingPeriod(idx, period.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                            لا توجد فترات مخصصة مضافة لهذه الغرفة
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✨ SAVE ROOM BUTTON ✨ */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={(e) => handleSaveRoom(idx, e)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                      >
                        <Save size={16} /> حفظ بيانات الغرفة
                      </button>
                    </div>
                  </div>
                </div>

              ))}

              <button onClick={() => setEditingHotel({ ...editingHotel, rooms: [...editingHotel.rooms, { name: 'فئة غرفة جديدة', type: 'double', capacity: 2, available: 5, price: 400, mealPlan: 'breakfast', area: 35, beds: 'مثال: 1 كينج', view: 'مطلة كاملة على المدينة', images: [], pricingPeriods: [], amenities: [], sofa: false, isVisible: true }] })} className="w-full py-12 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black flex flex-col items-center justify-center gap-4 hover:bg-emerald-50 hover:border-emerald-200 hover:text-primary transition-all group shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-xl transition-all"><Plus size={32} /></div>
                <div className="text-center">
                  <span className="text-lg">إضافة غرفة جديدة</span>
                </div>
              </button>
            </div >
          )}

          {activeEditTab === 'reviews' && (
            <div className="glass-card p-10 rounded-[3rem] border border-white animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 text-primary font-black"><MessageSquare size={24} /> <h3 className="text-xl text-text">إدارة تقييمات العملاء</h3></div>
                <div className="bg-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-500">
                  {Array.isArray(editingHotel.reviews) ? editingHotel.reviews.length : 0} تقييمات مسجلة
                </div>
              </div>
              <div className="space-y-6">
                {/* Add Review Form */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="font-bold text-text mb-4 flex items-center gap-2">
                    <PlusCircle size={18} className="text-slate-800" />
                    إضافة تقييم جديد
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">اسم الضيف</label>
                      <input
                        type="text"
                        value={newReview.user}
                        onChange={e => setNewReview({ ...newReview, user: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500"
                        placeholder="مثال: محمد العتيبي"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">التقييم</label>
                      <select
                        value={newReview.rating}
                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500 bg-white"
                      >
                        <option value="5">5 نجوم</option>
                        <option value="4">4 نجوم</option>
                        <option value="3">3 نجوم</option>
                        <option value="2">2 نجوم</option>
                        <option value="1">1 نجمة</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">التاريخ</label>
                      <input
                        type="text"
                        value={newReview.date}
                        onChange={e => setNewReview({ ...newReview, date: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500"
                        placeholder="أكتوبر 2025"
                      />
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">التعليق</label>
                      <input
                        type="text"
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500"
                        placeholder="اكتب تعليق الضيف هنا..."
                      />
                    </div>
                    <div className="md:col-span-12 flex justify-end mt-2">
                      <button
                        onClick={async () => {
                          if (!newReview.user || !newReview.comment) return alert('يرجى تعبئة جميع الحقول');
                          setIsSubmittingReview(true);
                          if (onCreateReview && editingHotel) {
                            const success = await onCreateReview({
                              ...newReview,
                              hotelId: String(editingHotel.id) // Ensure ID is string
                            });
                            if (success) {
                              if (onRefresh) await onRefresh();
                              // Reset form
                              setNewReview({ user: '', comment: '', rating: 5, date: new Date().toISOString().split('T')[0] });

                              // Optimistic update for immediate feedback
                              const optimisticReview = { id: Date.now().toString(), ...newReview };
                              setEditingHotel(prev => prev ? { ...prev, reviews: [optimisticReview, ...prev.reviews] } : prev);
                            }
                          }
                          setIsSubmittingReview(false);
                        }}
                        disabled={isSubmittingReview}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {isSubmittingReview ? 'جاري الإضافة...' : 'نشر التقييم'}
                      </button>
                    </div>
                  </div>
                </div>

                {editingHotel.reviews && editingHotel.reviews.length > 0 ? (
                  editingHotel.reviews.map((review) => (
                    <div key={review.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-start justify-between group hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 font-black text-sm shadow-sm border border-slate-100">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-bold text-text text-base">{review.user}</h5>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mb-2">{review.comment}</p>
                          <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 inline-block">{review.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                            if (onDeleteReview) {
                              const success = await onDeleteReview(review.id);
                              if (success && editingHotel) {
                                const updatedReviews = editingHotel.reviews.filter(r => r.id !== review.id);
                                setEditingHotel({ ...editingHotel, reviews: updatedReviews });
                              }
                            } else {
                              // Fallback for local delete if no API
                              const updatedReviews = editingHotel.reviews.filter(r => r.id !== review.id);
                              setEditingHotel({ ...editingHotel, reviews: updatedReviews });
                            }
                          }
                        }}
                        className="p-4 bg-white text-red-500 border border-slate-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:scale-110"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4"><MessageSquare size={32} /></div>
                    <h3 className="text-slate-400 font-bold text-lg">لا توجد تقييمات</h3>
                    <p className="text-slate-300 text-xs mt-2">لم يقم أحد بتقييم هذا الفندق بعد</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeEditTab === 'gallery' && (
            <div className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-white animate-in fade-in slide-in-from-bottom-4">
              {/* Main Hotel Gallery Section */}
              <div className="mb-12 border-b border-slate-100 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                  <div className="flex items-center gap-3"><Images className="text-primary" size={24} /><h3 className="text-xl font-black text-text">صور الفندق الرئيسية</h3></div>
                  <div className="w-full md:w-auto">
                    <ImageUploader
                      label="رفع صور جديدة للمعرض (متعدد)"
                      hotelId={String(editingHotel.id)}
                      hotelName={editingHotel.name}
                      type="hotel"
                      multiple={true}
                      onUploadSuccess={(url) => setEditingHotel(prev => prev ? { ...prev, gallery: [...(prev.gallery || []), url] } : prev)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {/* Filter out the cover image from gallery display to avoid duplication */}
                  {editingHotel.gallery && editingHotel.gallery.filter(img => img !== editingHotel.image).length > 0 ? (
                    editingHotel.gallery.filter(img => img !== editingHotel.image).map((img, i) => (
                      <div
                        key={i}
                        className="group relative aspect-[3/2] rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-sm transition-all hover:border-emerald-500 self-start w-full"
                        style={{ aspectRatio: '3/2' }}
                      >
                        <img src={getImageUrl(img)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {/* Set as Cover Button */}
                          <button
                            onClick={() => setEditingHotel(prev => prev ? { ...prev, image: img } : prev)}
                            className="bg-amber-500 text-white p-3 rounded-xl hover:scale-110 transition-transform shadow-lg"
                            title="تعيين كصورة غلاف"
                          >
                            <Star size={20} />
                          </button>
                          <button onClick={() => setEditingHotel(prev => prev ? { ...prev, gallery: prev.gallery.filter(g => g !== img) } : prev)} className="bg-red-500 text-white p-3 rounded-xl hover:scale-110 transition-transform shadow-lg"><Trash2 size={20} /></button>
                          <a href={img} target="_blank" rel="noreferrer" className="bg-white text-text p-3 rounded-xl hover:scale-110 transition-transform shadow-lg"><ExternalLink size={20} /></a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">لا توجد صور رئيسية للفندق</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Images Section (Helper Title) */}
              <div className="flex items-center gap-3 mb-8"><Bed className="text-primary" size={24} /><h3 className="text-xl font-black text-text opacity-50">صور الغرف (تتم إدارتها من تبويب الغرف)</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* DEEP SAFETY: Safe access to flatMap */}
                {(editingHotel.rooms || []).flatMap(r => r.images || []).slice(0, 6).map((img, i) => (
                  <div key={i} className="h-32 rounded-3xl overflow-hidden relative"><img src={getImageUrl(img)} className="w-full h-full object-cover" /></div>
                ))}
                <div className="h-32 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">المزيد في الغرف...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in slide-in-from-right duration-500">
      {/* --- NEW FILTER BAR --- */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0ca678] transition-colors" size={20} />
            <input
              type="text"
              placeholder="البحث باسم الفندق، المدينة، أو رقم التعريف..."
              className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#0ca678]/5 focus:border-[#0ca678] font-black text-slate-700 transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-[0.5] min-w-[200px]">
            <PremiumDropdown
              label="الدولة"
              icon={Globe}
              value={selectedCountry}
              options={[
                { id: 'all', label: 'كل الدول' },
                { id: 'SA', label: 'السعودية' },
                { id: 'EG', label: 'مصر' },
                { id: 'AE', label: 'الإمارات' },
                { id: 'QA', label: 'قطر' },
                { id: 'KW', label: 'الكويت' },
                { id: 'BH', label: 'البحرين' },
                { id: 'OM', label: 'عمان' },
                { id: 'JO', label: 'الأردن' },
              ]}
              onChange={(val) => {
                setSelectedCountry(val);
                setSelectedCity('all'); // Reset city when country changes
              }}
            />
          </div>

          <div className="flex-[0.5] min-w-[200px]">
            <PremiumDropdown
              label="المدينة"
              icon={MapPin}
              value={selectedCity}
              options={[
                { id: 'all', label: 'كل المدن' },
                ...(selectedCountry !== 'all' ? (CountryCityMap[selectedCountry] || []) : [])
              ]}
              onChange={setSelectedCity}
              disabled={selectedCountry === 'all'}
            />
          </div>

          <div className="flex-[0.6] min-w-[240px]">
            <PremiumDropdown
              label="تصفية حسب"
              icon={Filter}
              value={filterStatus}
              options={FILTER_STATUS_OPTIONS}
              onChange={setFilterStatus}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الفنادق والعروض</h2>
          <p className="text-slate-400 font-bold mt-2 flex items-center gap-2 text-sm uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#0ca678]"></span>
            لوحة التحكم المركزية - {filteredHotels.length} فندق نشط
          </p>


          {/* Bulk Action Tabs - Collapsible */}
          <div className="mt-6">
            <button
              onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 border ${isBulkActionsOpen
                ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <Settings2 size={18} className={isBulkActionsOpen ? "text-emerald-400" : "text-slate-400"} />
              <span>أدوات التحكم الجماعي</span>
              <ChevronDown size={16} className={`mr-2 transition-transform duration-300 ${isBulkActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isBulkActionsOpen ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="flex gap-3 border-b border-slate-200 pb-0">
                <button
                  onClick={() => setBulkActionTab('visibility')}
                  className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${bulkActionTab === 'visibility'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-y-[1px]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  <Eye size={16} className="inline ml-2" />
                  التحكم في الظهور
                </button>
                <button
                  onClick={() => setBulkActionTab('featured')}
                  className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${bulkActionTab === 'featured'
                    ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 translate-y-[1px]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  <Star size={16} className="inline ml-2" fill={bulkActionTab === 'featured' ? 'currentColor' : 'none'} />
                  التحكم في التمييز
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-b-2xl rounded-tr-2xl border border-slate-200/60 shadow-inner">
                {bulkActionTab === 'visibility' ? (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => toggleAllHotelsVisibility(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Eye size={18} />
                      إظهار الكل
                    </button>
                    <button
                      onClick={() => toggleAllHotelsVisibility(false)}
                      className="flex items-center gap-2 px-5 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-600/20 active:scale-95"
                    >
                      <EyeOff size={18} />
                      إخفاء الكل
                    </button>
                    <div className="w-px bg-slate-300 mx-2"></div>
                    <button
                      onClick={() => toggleFeaturedHotelsVisibility(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-400/20 active:scale-95"
                    >
                      <Star size={18} fill="currentColor" />
                      إظهار المميزة
                    </button>
                    <button
                      onClick={() => toggleFeaturedHotelsVisibility(false)}
                      className="flex items-center gap-2 px-5 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-500/20 active:scale-95"
                    >
                      <Star size={18} />
                      إخفاء المميزة
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => makeAllFeatured(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <Star size={18} fill="currentColor" />
                      تمييز الكل
                    </button>
                    <button
                      onClick={() => makeAllFeatured(false)}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-600/20"
                    >
                      <Star size={18} />
                      إلغاء التمييز
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <button
          onClick={() => {
            const newHotel: AdminHotel = {
              id: Date.now().toString(),
              name: 'فندق جديد',
              location: 'مكة المكرمة',
              city: (selectedCity !== 'all' ? selectedCity : 'makkah') as any,
              lat: '21.4225',
              lng: '39.8262',
              rating: 5,
              reviews: [],
              image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80',
              amenities: [],
              rooms: [],
              isVisible: false,
              description: '',
              nearbyLandmarks: [],
              gallery: [],
              price: 0
            };
            setEditingHotel({ ...newHotel, summary: generateRoomAnalysisSummary(newHotel) });
            setActiveEditTab('overview');
            setViewMode('edit');
          }}
          className="flex items-center gap-3 bg-[#0ca678] text-white px-8 py-4 rounded-[1.5rem] font-black text-xs shadow-lg shadow-emerald-200 hover:bg-[#087f5b] transition-all active:scale-95"
        >
          <Plus size={18} /> إضافة سريعة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {/* Primary Add Hotel Card */}
        <button
          onClick={() => {
            const newHotel: AdminHotel = {
              id: Date.now().toString(),
              name: 'فندق جديد',
              location: 'مكة المكرمة',
              city: (selectedCity !== 'all' ? selectedCity : 'makkah') as any,
              lat: '21.4225',
              lng: '39.8262',
              rating: 5,
              reviews: [], // Fixed: Empty array instead of 0
              image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80',
              amenities: [],
              rooms: [],
              isVisible: false,
              description: '',
              nearbyLandmarks: [],
              gallery: [],
              price: 0
            };
            setEditingHotel({ ...newHotel, summary: generateRoomAnalysisSummary(newHotel) });
            setActiveEditTab('overview');
            setViewMode('edit');
          }}
          className="group relative h-[550px] bg-white border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-500 overflow-hidden text-slate-300"
        >
          <div className="relative z-10 w-28 h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100">
            <Plus size={40} strokeWidth={3} />
          </div>
          <div className="text-center relative z-10 px-8">
            <h3 className="text-xl font-black text-slate-400 group-hover:text-emerald-800 transition-colors">إضافة فندق جديد</h3>
            <p className="text-[10px] font-bold text-slate-300 mt-3 group-hover:text-primary/60 leading-relaxed">أضف فندقاً جديداً للنظام وابدأ في تخصيص الغرف والمرافق والأسعار الموسمية</p>
          </div>
          {/* Decorative background circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-slate-800/5 rounded-full blur-3xl group-hover:scale-[3] transition-transform duration-1000"></div>
        </button>

        {filteredHotels.map((hotel) => (
          <div key={hotel.id} onClick={() => startEditing(hotel)} className={`bg-white rounded-[3.5rem] overflow-hidden group border transition-all duration-700 cursor-pointer relative flex flex-col h-[550px] ${hotel.isVisible ? 'border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2' : 'grayscale opacity-60 border-slate-200 shadow-none'}`}>
            <div className="absolute top-6 left-6 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
              <button
                onClick={(e) => toggleVisibility(e, hotel.id)}
                className={`p-4 rounded-2xl backdrop-blur-xl transition-all border border-white/20 shadow-lg ${hotel.isVisible ? 'bg-white/90 text-slate-800 hover:bg-white' : 'bg-red-500 text-white'}`}
              >
                {hotel.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={(e) => toggleFeaturedHelper(e, hotel.id)}
                className={`p-4 rounded-2xl backdrop-blur-xl transition-all border border-white/20 shadow-lg ${hotel.isFeatured ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white/90 text-slate-300 hover:text-amber-400'}`}
                title="تحديد كفندق مميز"
              >
                <Star size={18} fill={hotel.isFeatured ? "currentColor" : "none"} />
              </button>
              <button onClick={(e) => deleteHotel(e, hotel.id)} className="p-4 bg-white/90 backdrop-blur-xl text-red-600 rounded-2xl border border-white/20 shadow-lg hover:bg-red-50"><Trash2 size={18} /></button>
            </div>

            {/* Featured Badge */}
            {(hotel as any).isFeatured && (
              <div className="absolute top-6 right-6 z-10 bg-amber-400 text-white px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 animate-pulse">
                <Star size={12} fill="currentColor" /> مميـز
              </div>
            )}

            <div className="relative h-64 overflow-hidden">
              <img src={getImageUrl(hotel.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
              <div className="absolute bottom-6 right-6 text-white pr-2">
                <div className="flex items-center gap-2 text-[10px] font-black bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mb-3">
                  <MapPin size={12} className="text-emerald-300" /> {hotel.location}
                </div>
                <h3 className="font-black text-2xl leading-tight tracking-tight">{hotel.name}</h3>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-amber-50 px-4 py-2 rounded-xl text-amber-600 border border-amber-100 flex items-center gap-2 shadow-sm">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-black">{hotel.rating}</span>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {hotel.rooms.length} أنواع الغرف
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {hotel.rooms.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group/room hover:border-emerald-200 hover:bg-[#e6fcf5]/30 transition-all duration-300">
                    <span className="text-[10px] font-black text-slate-600 truncate max-w-[120px]">{r.name}</span>
                    <span className="text-[10px] font-black text-slate-800 group-hover/room:text-[#0ca678] transition-colors flex items-baseline gap-1">
                      {r.price} <span className="text-[8px] text-slate-400">SAR</span>
                    </span>
                  </div>
                ))}
                {hotel.rooms.length > 3 && (
                  <div className="text-center text-[10px] font-black text-slate-400 pt-1 tracking-widest uppercase">+ {hotel.rooms.length - 3} عرف إضافية</div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between group/link text-slate-400 hover:text-[#0ca678] transition-all duration-500">
                <span className="text-[11px] font-black tracking-widest uppercase">تعديل التفاصيل الكاملة</span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#0ca678] group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all transform group-hover:-rotate-45">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsTab;
