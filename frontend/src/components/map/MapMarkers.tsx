// components/Map/MapMarkers.tsx
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ship, Plane, Truck, Crosshair, AlertCircle, Anchor, Target } from 'lucide-react';

// Función para obtener el icono SVG según tipo y estado
const getIconSvg = (type: string, status: string, confidence: number = 50) => {
  // Elegir icono según tipo
  let Icon = Crosshair;
  let bgColor = '#3b82f6'; // azul por defecto

  const typeLower = type?.toLowerCase() || '';

  if (typeLower.includes('vessel') || typeLower.includes('buque') || typeLower.includes('naval') || typeLower.includes('ship')) {
    Icon = Ship;
    bgColor = '#10b981'; // verde
  } else if (typeLower.includes('air') || typeLower.includes('aeronave') || typeLower.includes('plane') || typeLower.includes('helicopter')) {
    Icon = Plane;
    bgColor = '#8b5cf6'; // púrpura
  } else if (typeLower.includes('vehicle') || typeLower.includes('vehículo') || typeLower.includes('land') || typeLower.includes('truck')) {
    Icon = Truck;
    bgColor = '#f59e0b'; // naranja
  } else if (typeLower.includes('anchor') || typeLower.includes('ancla')) {
    Icon = Anchor;
    bgColor = '#06b6d4'; // cyan
  } else if (typeLower.includes('target') || typeLower.includes('objetivo')) {
    Icon = Target;
    bgColor = '#ec4899'; // rosa
  }

  // Color según estado (sobrescribe el color base)
  if (status === 'watchlisted') bgColor = '#ef4444'; // rojo
  if (status === 'flagged') bgColor = '#f59e0b'; // naranja
  if (status === 'active') bgColor = '#10b981'; // verde

  // Tamaño basado en confianza (entre 24 y 40px)
  const size = 24 + (confidence / 5); // 24-44px

  return renderToStaticMarkup(
    <div className="relative group" style={{ width: size, height: size }}>
      {/* Círculo pulsante para objetos watchlisted */}
      {status === 'watchlisted' && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: bgColor }}
        />
      )}

      {/* Círculo de fondo con glow */}
      <div
        className="absolute inset-0 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: bgColor,
          boxShadow: `0 0 15px ${bgColor}`,
          opacity: 0.9
        }}
      />

      {/* Icono */}
      <div
        className="absolute inset-0 flex items-center justify-center text-white"
        style={{ transform: 'scale(0.7)' }}
      >
        <Icon size={size * 0.6} strokeWidth={2} />
      </div>

      {/* Indicador de alerta adicional para watchlisted */}
      {status === 'watchlisted' && (
        <div className="absolute -top-1 -right-1">
          <AlertCircle size={16} color="#ef4444" className="animate-pulse drop-shadow-lg" />
        </div>
      )}

      {/* Tooltip personalizado (opcional) */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap">
        <div className="bg-black/90 text-white text-xs py-1 px-2 rounded shadow-lg">
          {type} - {confidence}%
        </div>
      </div>
    </div>
  );
};

// Función principal para crear iconos de Leaflet
export const createCustomMarker = (type: string, status: string, confidence: number = 50) => {
  const iconHtml = getIconSvg(type, status, confidence);

  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Iconos predefinidos para tipos comunes
export const markerIcons = {
  naval: (status: string = 'normal', confidence: number = 50) =>
    createCustomMarker('naval', status, confidence),

  air: (status: string = 'normal', confidence: number = 50) =>
    createCustomMarker('air', status, confidence),

  land: (status: string = 'normal', confidence: number = 50) =>
    createCustomMarker('land', status, confidence),

  default: (status: string = 'normal', confidence: number = 50) =>
    createCustomMarker('default', status, confidence),
};

// Función para obtener color según estado (útil para las cards de lista)
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'watchlisted': return '#ef4444';
    case 'flagged': return '#f59e0b';
    case 'active': return '#10b981';
    default: return '#3b82f6';
  }
};

// Función para obtener clase CSS según estado
export const getStatusClass = (status: string) => {
  switch (status) {
    case 'watchlisted': return 'bg-red-500 text-white';
    case 'flagged': return 'bg-orange-500 text-white';
    case 'active': return 'bg-green-500 text-white';
    default: return 'bg-blue-500 text-white';
  }
};