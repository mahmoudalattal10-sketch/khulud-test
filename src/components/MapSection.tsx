
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Hotel } from '../services/api';

interface MapSectionProps {
  hotels: Hotel[];
  activeHotel?: Hotel;
  hoveredHotel?: Hotel;
  onHotelSelect?: (hotel: Hotel) => void;
}

const MapSection: React.FC<MapSectionProps> = ({ hotels, activeHotel, hoveredHotel, onHotelSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const popupRef = useRef<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Helper to create custom marker icon
  const createMarkerIcon = (hotel: Hotel) => {
    return L.divIcon({
      className: 'custom-hotel-marker',
      html: `
        <div class="marker-pin" style="position: relative; width: 0; height: 0; overflow: visible;">
          <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 0); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div class="marker-content" style="background-color: #059669; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 13px; border: 2px solid white; white-space: nowrap; pointer-events: auto;">
              ${hotel.price} ر.س
            </div>
            <div class="marker-triangle" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #059669; margin-top: -1px;"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if (!L || typeof L.map !== 'function') return;

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [21.4225, 39.8262],
        zoom: 12,
        zoomControl: false,
        markerZoomAnimation: true,
        fadeAnimation: true,
      });

      console.log("🗺️ Map Initialized", mapInstanceRef.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(mapInstanceRef.current);

      // Force generic resize to fix grey tiles
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          console.log("📏 Map Size Invalidated");
        }
      }, 500);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers with Hotels List (Add/Remove)
  useEffect(() => {
    if (!mapInstanceRef.current || !hotels) return;
    console.log(`🏨 Syncing Markers for ${hotels.length} hotels`);

    // Complete reset for stability
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    // Add new markers
    hotels.forEach(hotel => {
      const marker = L.marker(hotel.coords, {
        icon: createMarkerIcon(hotel)
      })
        .addTo(mapInstanceRef.current)
        .on('click', () => handleHotelClick(hotel));

      markersRef.current.set(hotel.id, marker);
    });

    // Fit bounds if hotels changed and no active hotel
    if (hotels.length > 0 && !activeHotel) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [hotels]);

  // Sync Marker States (Active/Hovered) - Optimised for Smooth CSS Transitions
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      if (!element) return;

      const isActive = activeHotel?.id === id;
      const isHovered = hoveredHotel?.id === id;

      // Toggle classes for CSS transitions
      if (isActive) {
        element.classList.add('marker-active');
        element.classList.remove('marker-hover');
      } else if (isHovered) {
        element.classList.add('marker-hover');
        element.classList.remove('marker-active');
      } else {
        element.classList.remove('marker-active', 'marker-hover');
      }
    });
  }, [activeHotel, hoveredHotel]);

  // Pan to active hotel
  useEffect(() => {
    if (activeHotel && mapInstanceRef.current) {
      // Use flyTo for smoother transition
      mapInstanceRef.current.flyTo(activeHotel.coords, 15, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
      setSelectedHotel(activeHotel);
    }
  }, [activeHotel]);


  const handleHotelClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    if (onHotelSelect) onHotelSelect(hotel);
    mapInstanceRef.current.flyTo(hotel.coords, 15, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25
    });
  };

  const closePopup = () => {
    setSelectedHotel(null);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Label */}
      <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-100 shadow-md">
        🗺️ خريطة تفاعلية
      </div>

      {/* Hotel Popup Card */}
      {selectedHotel && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] animate-ios-slide">
          <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-slate-100 flex gap-4 items-center">
            {/* Hotel Image */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
              <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
            </div>

            {/* Hotel Info */}
            <div className="flex-1 text-right min-w-0">
              <h4 className="font-black text-text text-sm truncate">{selectedHotel.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedHotel.distanceFromHaram && selectedHotel.distanceFromHaram.includes('من')
                  ? selectedHotel.distanceFromHaram
                  : `${selectedHotel.distanceFromHaram} من الحرم`}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-gold font-black">{selectedHotel.price}</span>
                  <span className="text-[10px] text-slate-400">ريال سعودي / ليلة</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gold">★</span>
                  <span className="font-bold text-slate-700">{selectedHotel.rating}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                to={`/hotel/${selectedHotel.id}`}
                className="bg-gold text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-gold transition-colors shadow-md"
              >
                عرض التفاصيل
              </Link>
              <button
                onClick={closePopup}
                className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSection;
