// components/missions/SensorConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SensorConfig } from '@/types/mission';

interface SensorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: any[]; // Los sensores completos de la unidad
  onUpdateSensors: (sensors: any[]) => void;
  unitName: string;
}

export const SensorConfigModal: React.FC<SensorConfigModalProps> = ({
  isOpen,
  onClose,
  sensors,
  onUpdateSensors,
  unitName,
}) => {
  // Estado local con copia de los sensores (para poder marcarlos/desmarcarlos)
  const [localSensors, setLocalSensors] = useState<any[]>([]);

  useEffect(() => {
    // Inicializar con los sensores actuales, añadiendo un campo 'enabled' si no existe
    const initialized = sensors.map(s => ({ ...s, enabled: s.enabled !== false }));
    setLocalSensors(initialized);
  }, [sensors]);

  const toggleSensor = (index: number) => {
    const updated = [...localSensors];
    updated[index].enabled = !updated[index].enabled;
    setLocalSensors(updated);
  };

  const handleSave = () => {
    // Guardar los sensores (se puede filtrar solo los enabled si se desea)
    onUpdateSensors(localSensors);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar sensores - {unitName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          {localSensors.length === 0 ? (
            <p className="text-muted-foreground">Esta unidad no tiene sensores configurados.</p>
          ) : (
            <div className="space-y-4">
              {localSensors.map((sensor, idx) => (
                <div key={idx} className="flex items-start space-x-3 border rounded-lg p-3">
                  <Checkbox
                    id={`sensor-${idx}`}
                    checked={sensor.enabled}
                    onCheckedChange={() => toggleSensor(idx)}
                  />
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      {sensor.name || sensor.type}
                      {sensor.manufacturer && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {sensor.manufacturer}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {sensor.type} • {sensor.function || sensor.description || ''}
                    </div>
                    {sensor.range && (
                      <div className="text-xs mt-1">
                        Alcance: {sensor.range} {sensor.rangeUnit || 'km'}
                      </div>
                    )}
                    {sensor.band && (
                      <div className="text-xs">Banda: {sensor.band}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};