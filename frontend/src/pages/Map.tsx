// ============================================
// INTEL OPS PLATFORM - MAP TRACKING PAGE
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Map as MapIcon,
  Layers,
  Navigation,
  Target,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Filter,
  Crosshair,
  Maximize2,
  Minimize2,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMapStore, useObjectStore, useMissionStore } from '@/store';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Set Mapbox token (this is a public token for demo purposes)
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2x1ZzZzZzZzMDAzZzJqbzZzZzZzZzZzZiJ9.zZzZzZzZzZzZzZzZzZzZz';

const mapStyles = [
  { id: 'dark', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'streets', name: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'light', name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const { 
    viewport, 
    setViewport, 
    trackingPoints, 
    zones, 
    playbackState, 
    setPlaybackState,
    mapStyle,
    setMapStyle 
  } = useMapStore();
  const { objects } = useObjectStore();
  const { missions } = useMissionStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      bearing: viewport.bearing,
      pitch: viewport.pitch,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('move', () => {
      if (map.current) {
        const center = map.current.getCenter();
        setViewport({
          latitude: center.lat,
          longitude: center.lng,
          zoom: map.current.getZoom(),
          bearing: map.current.getBearing(),
          pitch: map.current.getPitch(),
        });
      }
    });

    // Add markers for objects
    objects.forEach((obj) => {
      if (obj.lastKnownLocation) {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: ${obj.status === 'watchlisted' ? '#ef4444' : obj.status === 'flagged' ? '#f59e0b' : '#3b82f6'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;

        new mapboxgl.Marker(el)
          .setLngLat([obj.lastKnownLocation.lng, obj.lastKnownLocation.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: 600;">${obj.name}</h4>
                <p style="margin: 0; font-size: 12px; color: #666;">${obj.type}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">
                  Last seen: ${obj.lastSeenAt ? format(obj.lastSeenAt, 'HH:mm') : 'Unknown'}
                </p>
              </div>
            `)
          )
          .addTo(map.current!);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  const handlePlayPause = () => {
    setPlaybackState({ isPlaying: !playbackState.isPlaying });
    toast.info(playbackState.isPlaying ? 'Playback paused' : 'Playback started');
  };

  const handleReset = () => {
    setPlaybackState({ isPlaying: false, currentTime: null });
    toast.info('Playback reset');
  };

  const flyToLocation = (lat: number, lng: number) => {
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 1500,
    });
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-8rem)]'}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        {/* Search & Filters */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Card className="glass">
            <CardContent className="p-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{objects.filter(o => o.lastKnownLocation).length} Active</span>
            </CardContent>
          </Card>
          <Button variant="secondary" size="sm" className="glass">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Map Style & View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="bg-card/90 backdrop-blur-sm border border-border rounded-md px-3 py-2 text-sm"
          >
            {mapStyles.map(style => (
              <option key={style.id} value={style.url}>{style.name}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="icon"
            className="glass"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-20 left-4 pointer-events-auto">
        <Card className="glass w-48">
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <Eye className="w-3 h-3" />
              Object Markers
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <MapIcon className="w-3 h-3" />
              Tracking Paths
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" />
              <Zap className="w-3 h-3" />
              Heatmap
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <Target className="w-3 h-3" />
              Geofences
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" />
              <Navigation className="w-3 h-3" />
              Predictions
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Object List */}
      <div className="absolute top-20 right-4 pointer-events-auto">
        <Card className="glass w-64 max-h-[400px] overflow-hidden">
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Tracked Objects
            </CardTitle>
          </CardHeader>
          <div className="overflow-y-auto max-h-[320px]">
            {objects.filter(o => o.lastKnownLocation).map(obj => (
              <div
                key={obj.id}
                onClick={() => flyToLocation(obj.lastKnownLocation!.lat, obj.lastKnownLocation!.lng)}
                className="p-3 border-t border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: obj.status === 'watchlisted' ? '#ef4444' : 
                                      obj.status === 'flagged' ? '#f59e0b' : '#3b82f6'
                    }}
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

      {/* Playback Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Card className="glass">
          <CardContent className="p-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-10 w-10" onClick={handlePlayPause}>
                    {playbackState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{playbackState.isPlaying ? 'Pause' : 'Play'}</TooltipContent>
              </Tooltip>
            </div>

            <div className="w-48">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Timeline</span>
                <span>{playbackState.currentTime ? format(playbackState.currentTime, 'HH:mm') : '--:--'}</span>
              </div>
              <Slider 
                value={[50]} 
                max={100} 
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <span className="text-xs text-muted-foreground">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-transparent text-sm border border-border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="glass">
          <CardContent className="p-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-muted-foreground" />
              <span>Zoom: {viewport.zoom.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-muted-foreground" />
              <span>{viewport.latitude.toFixed(4)}, {viewport.longitude.toFixed(4)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 pointer-events-auto flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" className="glass">
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Map</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" className="glass">
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Map Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
