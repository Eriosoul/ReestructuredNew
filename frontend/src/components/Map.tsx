// components/Map.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  onClick?: (lat: number, lng: number) => void;
  selectionMode?: boolean;
  selectedCoords?: string; // "lat,lng"
  onLayerChange?: (layer: string) => void;
}

export const Map: React.FC<MapProps> = ({ onClick, selectionMode, selectedCoords, onLayerChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentLayer, setCurrentLayer] = useState<string>('street');

  // Capas disponibles
  const layers = {
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    })
  };

  useEffect(() => {
    if (!mapRef.current) {
      // Inicializar mapa con capa por defecto
      const map = L.map('map').setView([36.5, -5.5], 10);
      layers.street.addTo(map);
      mapRef.current = map;
    }

    const map = mapRef.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (selectionMode && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [selectionMode, onClick]);

  // Cambiar capa
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    // Remover todas las capas
    Object.values(layers).forEach(layer => map.removeLayer(layer));
    // Añadir la seleccionada
    layers[currentLayer].addTo(map);
    if (onLayerChange) onLayerChange(currentLayer);
  }, [currentLayer, onLayerChange]);

  // Actualizar marcador
  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (selectedCoords) {
      const [lat, lng] = selectedCoords.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
    }
  }, [selectedCoords]);

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full" />
      {/* Panel inferior con botones de capa e información */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentLayer('street')}
            className={`px-3 py-1 text-xs rounded transition ${currentLayer === 'street' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Callejero
          </button>
          <button
            onClick={() => setCurrentLayer('satellite')}
            className={`px-3 py-1 text-xs rounded transition ${currentLayer === 'satellite' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Satélite
          </button>
          <button
            onClick={() => setCurrentLayer('dark')}
            className={`px-3 py-1 text-xs rounded transition ${currentLayer === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Oscuro
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          {selectionMode ? '⚡ Haz clic en el mapa para seleccionar' : '📍 Modo vista'}
        </div>
      </div>
    </div>
  );
};