import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { type Mission } from '@/types/mission';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  tasks: Mission[];
  selectedTaskId?: string | null;
}

export function OperationMapView({ tasks, selectedTaskId }: MapViewProps) {
  // Default center (example from your images)
  const defaultCenter: [number, number] = [49.7169, 29.7070];
  const zoom = 8;

  // Find marker for selected task
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const center = selectedTask?.coords ? selectedTask.coords.split(',').map(Number) as [number, number] : defaultCenter;

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {tasks.map(task => task.coords && (
        <Marker key={task.id} position={task.coords.split(',').map(Number) as [number, number]}>
          <Popup>{task.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}