// components/missions/UnitEditor.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SensorConfigModal } from './SensorConfigModal';
import { TargetConfigModal } from './TargetConfigModal';
import { ArmamentSelector } from './ArmamentSelector';
import { OperationsSelector } from './OperationsSelector';
import { MapPin, Radio, Target, X } from 'lucide-react';
import type { UnitConfig } from '@/types/mission';
import { UNIT_TYPE_ICONS } from '@/lib/missionConstants';

interface UnitEditorProps {
  unit: UnitConfig;
  onChange: (unit: UnitConfig) => void;
  onClose: () => void;
  onRequestCoordinateSelect: (type: 'unit-origin' | 'unit-current') => void;
}

export const UnitEditor: React.FC<UnitEditorProps> = ({ unit, onChange, onClose, onRequestCoordinateSelect }) => {
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  const updateField = <K extends keyof UnitConfig>(field: K, value: UnitConfig[K]) => {
    onChange({ ...unit, [field]: value });
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Editar unidad: {unit.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de unidad */}
          <div>
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['naval', 'ground', 'aerial'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={unit.type === type ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => updateField('type', type)}
                >
                  {UNIT_TYPE_ICONS[type]}
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* País y clasificación */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>País</Label>
              <Select value={unit.country || 'ESPAÑA'} onValueChange={(v) => updateField('country', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESPAÑA">ESPAÑA</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="FRANCIA">FRANCIA</SelectItem>
                  <SelectItem value="ALEMANIA">ALEMANIA</SelectItem>
                  <SelectItem value="RUSIA">RUSIA</SelectItem>
                  <SelectItem value="CHINA">CHINA</SelectItem>
                  <SelectItem value="OTRO">OTRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Clasificación</Label>
              <Select value={unit.classification || 'UNCLASSIFIED'} onValueChange={(v) => updateField('classification', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNCLASSIFIED">UNCLASSIFIED</SelectItem>
                  <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                  <SelectItem value="SECRET">SECRET</SelectItem>
                  <SelectItem value="TOP SECRET">TOP SECRET</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coordenadas */}
          <div className="space-y-3">
            <Label>Coordenadas</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Origen</Label>
                <div className="flex gap-1">
                  <Input
                    placeholder="Lat"
                    value={unit.orig_trayectory?.lat ?? ''}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      onChange({
                        ...unit,
                        orig_trayectory: { ...unit.orig_trayectory, lat: isNaN(lat) ? undefined : lat, lon: unit.orig_trayectory?.lon ?? 0 }
                      });
                    }}
                  />
                  <Input
                    placeholder="Lon"
                    value={unit.orig_trayectory?.lon ?? ''}
                    onChange={(e) => {
                      const lon = parseFloat(e.target.value);
                      onChange({
                        ...unit,
                        orig_trayectory: { ...unit.orig_trayectory, lon: isNaN(lon) ? undefined : lon, lat: unit.orig_trayectory?.lat ?? 0 }
                      });
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onRequestCoordinateSelect('unit-origin')}
                    title="Seleccionar en mapa"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Actual</Label>
                <div className="flex gap-1">
                  <Input
                    placeholder="Lat"
                    value={unit.actual_trayectory?.lat ?? ''}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      onChange({
                        ...unit,
                        actual_trayectory: { ...unit.actual_trayectory, lat: isNaN(lat) ? undefined : lat, lon: unit.actual_trayectory?.lon ?? 0 }
                      });
                    }}
                  />
                  <Input
                    placeholder="Lon"
                    value={unit.actual_trayectory?.lon ?? ''}
                    onChange={(e) => {
                      const lon = parseFloat(e.target.value);
                      onChange({
                        ...unit,
                        actual_trayectory: { ...unit.actual_trayectory, lon: isNaN(lon) ? undefined : lon, lat: unit.actual_trayectory?.lat ?? 0 }
                      });
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onRequestCoordinateSelect('unit-current')}
                    title="Seleccionar en mapa"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sensores */}
          <div>
            <Label>Sensores</Label>
            <div className="flex items-center justify-between mt-1 p-2 border rounded">
              <span className="text-sm">{unit.sensors.length} configurados</span>
              <Button size="sm" variant="outline" onClick={() => setShowSensorModal(true)}>
                <Radio className="w-4 h-4 mr-1" /> Configurar
              </Button>
            </div>
          </div>

          {/* Armamento */}
          <ArmamentSelector
            unitType={unit.type}
            selected={unit.armamento}
            onChange={(arm) => updateField('armamento', arm)}
          />

          {/* Operaciones */}
          <OperationsSelector
            unitType={unit.type}
            selected={unit.operaciones}
            onChange={(ops) => updateField('operaciones', ops)}
          />

          {/* Objetivos */}
          <div>
            <Label>Objetivos asignados</Label>
            <div className="flex items-center justify-between mt-1 p-2 border rounded">
              <span className="text-sm">{unit.targets.length} objetivos</span>
              <Button size="sm" variant="outline" onClick={() => setShowTargetModal(true)}>
                <Target className="w-4 h-4 mr-1" /> Asignar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <SensorConfigModal
        isOpen={showSensorModal}
        onClose={() => setShowSensorModal(false)}
        sensors={unit.sensors}
        onUpdateSensors={(sensors) => updateField('sensors', sensors)}
        unitType={unit.type}
        unitName={unit.name}
      />

      <TargetConfigModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        targets={unit.targets}
        onUpdateTargets={(targets) => updateField('targets', targets)}
        unitType={unit.type}
        unitName={unit.name}
      />
    </>
  );
};