import { Radar, Camera, Wifi, Activity } from 'lucide-react';

export function SensorStatus() {
  const sensors = [
    { name: 'Radar', icon: Radar, count: 1, active: true },
    { name: 'EO/IR', icon: Camera, count: 1, active: true },
    { name: 'DF/RF', icon: Wifi, count: 1, active: true },
  ];

  return (
    <div className="flex gap-4 p-2 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">SENSORES ACTIVOS</span>
        <span className="text-xs text-muted-foreground">TODOS (4)</span>
      </div>
      {sensors.map(sensor => (
        <div key={sensor.name} className="flex items-center gap-1 text-xs">
          <sensor.icon className="h-3 w-3" />
          <span>{sensor.name}</span>
          <span className="text-muted-foreground">({sensor.count})</span>
        </div>
      ))}
    </div>
  );
}