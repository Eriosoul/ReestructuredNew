// components/missions/SensorConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // si usas checkbox, o Badge
import { Label } from '@/components/ui/label';
import { UNIT_SENSOR_CONFIGS, getIcon } from '@/lib/missionConstants';
import type { SensorConfig } from '@/types/mission';

interface SensorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: SensorConfig[];
  onUpdateSensors: (sensors: SensorConfig[]) => void;
  unitType: 'naval' | 'ground' | 'aerial';
  unitName: string;
}

export const SensorConfigModal: React.FC<SensorConfigModalProps> = ({
  isOpen,
  onClose,
  sensors,
  onUpdateSensors,
  unitType,
  unitName,
}) => {
  const [selected, setSelected] = useState<SensorConfig[]>(sensors);

  useEffect(() => {
    setSelected(sensors);
  }, [sensors]);

  const availableSensors = UNIT_SENSOR_CONFIGS[unitType] || [];

  const toggleSensor = (sensorType: string) => {
    const exists = selected.find(s => s.type === sensorType);
    if (exists) {
      setSelected(selected.filter(s => s.type !== sensorType));
    } else {
      const sensorConfig = availableSensors.find(s => s.type === sensorType);
      if (sensorConfig) {
        setSelected([
          ...selected,
          {
            type: sensorType,
            capabilities: sensorConfig.capabilities,
            assignedTargets: [],
          },
        ]);
      }
    }
  };

  const handleSave = () => {
    onUpdateSensors(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar sensores - {unitName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {availableSensors.map((sensor) => {
            const isChecked = selected.some(s => s.type === sensor.type);
            return (
              <div key={sensor.type} className="flex items-start space-x-3">
                <Checkbox
                  id={sensor.type}
                  checked={isChecked}
                  onCheckedChange={() => toggleSensor(sensor.type)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={sensor.type} className="text-sm font-medium flex items-center gap-2">
                    {getIcon(sensor.icon, 16)}
                    {sensor.type}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {sensor.capabilities.join(' • ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};