// components/missions/UnitsConfigurator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UnitCard } from './UnitCard';
import { UnitEditor } from './UnitEditor';
import type { UnitConfig } from '@/types/mission';

interface UnitsConfiguratorProps {
  units: UnitConfig[];
  onChange: (units: UnitConfig[]) => void;
  onRequestCoordinate: (type: 'unit-origin' | 'unit-current', unitId: string) => void;
}

export const UnitsConfigurator: React.FC<UnitsConfiguratorProps> = ({ units, onChange, onRequestCoordinate }) => {
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const addUnit = () => {
    const newUnit: UnitConfig = {
      id: `unit-${Date.now()}`,
      type: 'naval',
      name: 'Nueva unidad',
      sensors: [],
      armamento: [],
      operaciones: [],
      targets: [],
      country: 'ESPAÑA',
      classification: 'UNCLASSIFIED',
    };
    onChange([...units, newUnit]);
    setEditingUnitId(newUnit.id);
  };

  const updateUnit = (updated: UnitConfig) => {
    onChange(units.map(u => u.id === updated.id ? updated : u));
  };

  const deleteUnit = (id: string) => {
    onChange(units.filter(u => u.id !== id));
    if (editingUnitId === id) setEditingUnitId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Unidades participantes</h3>
        <Button onClick={addUnit} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Añadir unidad
        </Button>
      </div>

      {units.length === 0 && (
        <p className="text-muted-foreground text-sm italic">No hay unidades configuradas.</p>
      )}

      <div className="space-y-3">
        {units.map(unit => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onEdit={() => setEditingUnitId(unit.id)}
            onDelete={() => deleteUnit(unit.id)}
            isEditing={editingUnitId === unit.id}
          />
        ))}
      </div>

      {editingUnitId && (
        <UnitEditor
          unit={units.find(u => u.id === editingUnitId)!}
          onChange={updateUnit}
          onClose={() => setEditingUnitId(null)}
          onRequestCoordinateSelect={(type) => onRequestCoordinate(type, editingUnitId)}
        />
      )}
    </div>
  );
};