// ============================================
// INTEL OPS PLATFORM - MAP TRACKING PAGE (Leaflet)
// ============================================

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Target,
  Filter,
  Crosshair,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapStore, useObjectStore } from '@/store';
import { format } from 'date-fns';
import { createCustomMarker, getStatusColor, getStatusClass } from '@/components/map/MapMarkers';

// Fix para los iconos de Leaflet (necesario en muchos entornos)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Capas base gratuitas (sin token)
const baseLayers = [
  { id: 'satellite', name: 'Satélite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri' },
  { id: 'osm', name: 'Calles', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap' },
  { id: 'dark', name: 'Oscuro', url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', attribution: '© Stadia Maps' },
  { id: 'streets', name: 'Relieve', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '© OpenTopoMap' },
];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState(baseLayers[0].url);
  const [isObjectsMinimized, setIsObjectsMinimized] = useState(false);

  const { viewport, setViewport } = useMapStore();
  const { objects, isLoading: objectsLoading } = useObjectStore();

  // Inicializar el mapa (solo una vez)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(
      [viewport.latitude, viewport.longitude],
      viewport.zoom
    );

    L.tileLayer(selectedBaseLayer, {
      attribution: baseLayers[0].attribution,
      maxZoom: 19,
    }).addTo(map.current);

    L.control.zoom({ position: 'topright' }).addTo(map.current);

    map.current.on('moveend', () => {
      if (map.current) {
        const center = map.current.getCenter();
        setViewport({
          latitude: center.lat,
          longitude: center.lng,
          zoom: map.current.getZoom(),
        });
      }
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Cambiar capa base cuando el usuario selecciona otra
  useEffect(() => {
    if (!map.current) return;
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.current?.removeLayer(layer);
      }
    });
    const selected = baseLayers.find(l => l.url === selectedBaseLayer) || baseLayers[0];
    L.tileLayer(selectedBaseLayer, {
      attribution: selected.attribution,
      maxZoom: 19,
    }).addTo(map.current);
  }, [selectedBaseLayer]);

  // Actualizar marcadores cuando cambian los objetos (AHORA CON ICONOS PERSONALIZADOS)
  useEffect(() => {
    if (!map.current || !objects) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    objects.forEach((obj) => {
      if (obj.lastKnownLocation) {
        // Crear icono personalizado basado en tipo y estado
        const customIcon = createCustomMarker(
          obj.type || 'default',
          obj.status || 'normal',
          obj.confidence || 50
        );

        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-lg">${obj.name}</h3>
              <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(obj.status)}">
                ${obj.status || 'normal'}
              </span>
            </div>
            <p class="text-sm text-muted-foreground mb-1">Tipo: ${obj.type || 'Desconocido'}</p>
            <p class="text-sm text-muted-foreground mb-2">
              Último avistamiento: ${obj.lastSeenAt ? format(new Date(obj.lastSeenAt), 'HH:mm dd/MM/yyyy') : 'Desconocido'}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium">Confianza:</span>
              <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-500" 
                  style="width: ${obj.confidence || 0}%"
                ></div>
              </div>
              <span class="text-xs font-mono">${obj.confidence || 0}%</span>
            </div>
          </div>
        `;

        const marker = L.marker(
          [obj.lastKnownLocation.lat, obj.lastKnownLocation.lng],
          { 
            icon: customIcon,
            riseOnHover: true,
            zIndexOffset: obj.status === 'watchlisted' ? 1000 : 0
          }
        )
          .bindPopup(popupContent)
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  }, [objects]);

  const flyToLocation = (lat: number, lng: number) => {
    map.current?.flyTo([lat, lng], 14, { duration: 1.5 });
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-border ${
      isFullscreen ? 'fixed inset-0 z-[100] h-screen' : 'h-[calc(100vh-8rem)]'
    }`}>
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-slate-950" />

      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        {/* Fila superior: contador y selector de capas */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <Card className="glass border-none shadow-2xl">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  {objectsLoading ? 'Cargando...' : `${objects.filter(o => o.lastKnownLocation).length} Activos`}
                </span>
              </CardContent>
            </Card>
            <Button variant="secondary" size="sm" className="glass pointer-events-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>

          {/* Selector de capas */}
          <div className="flex items-center gap-2 pointer-events-auto bg-background/80 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-xl">
            <Layers className="w-4 h-4 ml-2 text-muted-foreground" />
            <select
              value={selectedBaseLayer}
              onChange={(e) => setSelectedBaseLayer(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer outline-none"
            >
              {baseLayers.map(layer => (
                <option key={layer.id} value={layer.url} className="bg-background text-foreground">
                  Vista: {layer.name}
                </option>
              ))}
            </select>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Fila inferior: estadísticas y lista de objetos */}
        <div className="flex justify-between items-end pointer-events-none">
          {/* Estadísticas */}
          <div className="pointer-events-auto">
            <Card className="glass border-none shadow-lg">
              <CardContent className="p-2 flex gap-4 text-[10px] font-mono opacity-80">
                <div className="flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  {viewport.latitude.toFixed(4)}, {viewport.longitude.toFixed(4)}
                </div>
                <div>ZOOM: {viewport.zoom.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de objetos (ahora usa getStatusColor para los colores) */}
          <div className="pointer-events-auto mb-2 mr-12">
            <Card className="glass w-64 overflow-hidden transition-all duration-300 ease-in-out">
              <CardHeader
                className="p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setIsObjectsMinimized(!isObjectsMinimized)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetos Rastreados ({objects.filter(o => o.lastKnownLocation).length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsObjectsMinimized(!isObjectsMinimized);
                    }}
                  >
                    {isObjectsMinimized ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                isObjectsMinimized ? 'max-h-0' : 'max-h-[320px]'
              }`}>
                {objects.filter(o => o.lastKnownLocation).map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => flyToLocation(obj.lastKnownLocation!.lat, obj.lastKnownLocation!.lng)}
                    className="p-3 border-t border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(obj.status) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{obj.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{obj.type}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {obj.confidence}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}