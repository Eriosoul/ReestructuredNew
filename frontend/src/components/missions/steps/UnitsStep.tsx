import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, MapPin, Target } from 'lucide-react';
import type { Mission, UnitConfig } from '@/types/mission';

interface UnitsStepProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
  onRequestCoordinate: (type: 'unit-origin' | 'unit-current', unitId: string) => void;
}

export const UnitsStep: React.FC<UnitsStepProps> = ({ data, onChange, onRequestCoordinate }) => {
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState('');

  const addUnit = () => {
    if (!newUnitName.trim()) return;
    const newUnit: UnitConfig = {
      id: `unit-${Date.now()}`,
      name: newUnitName,
      type: newUnitType || 'generic',
    };
    onChange({
      ...data,
      units: [...(data.units || []), newUnit],
    });
    setNewUnitName('');
    setNewUnitType('');
  };

  const removeUnit = (id: string) => {
    onChange({
      ...data,
      units: (data.units || []).filter(u => u.id !== id),
    });
  };

  const updateUnitField = (id: string, field: keyof UnitConfig, value: any) => {
    onChange({
      ...data,
      units: (data.units || []).map(u => u.id === id ? { ...u, [field]: value } : u),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add New Unit</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Unit name (e.g., Alpha Team)"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Type (e.g., drone, vehicle)"
            value={newUnitType}
            onChange={(e) => setNewUnitType(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addUnit} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Units</h3>
        {data.units?.length === 0 && (
          <p className="text-muted-foreground text-sm">No units added yet.</p>
        )}
        {data.units?.map(unit => (
          <Card key={unit.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{unit.name}</h4>
                  <p className="text-sm text-muted-foreground">Type: {unit.type}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeUnit(unit.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Origin Coordinates</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={unit.orig_trayectory ? `${unit.orig_trayectory.lat}, ${unit.orig_trayectory.lon}` : ''}
                      readOnly
                      placeholder="Not set"
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestCoordinate('unit-origin', unit.id)}
                    >
                      <MapPin className="h-3 w-3 mr-1" /> Set
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Current Coordinates</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={unit.actual_trayectory ? `${unit.actual_trayectory.lat}, ${unit.actual_trayectory.lon}` : ''}
                      readOnly
                      placeholder="Not set"
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestCoordinate('unit-current', unit.id)}
                    >
                      <Target className="h-3 w-3 mr-1" /> Set
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};