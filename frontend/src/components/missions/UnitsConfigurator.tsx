// frontend/components/missions/UnitsConfigurator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FilePlus } from 'lucide-react';
import { UnitCard } from './UnitCard';
import { UnitEditor } from './UnitEditor';
import { UnitSelectorModal } from './UnitSelectorModal';
import { DomainSelectorModal } from './DomainSelectorModal'; // Importar
import type { UnitConfig } from '@/types/mission';

interface UnitsConfiguratorProps {
  units: UnitConfig[];
  onChange: (units: UnitConfig[]) => void;
  onRequestCoordinate: (type: 'unit-origin' | 'unit-current', unitId: string) => void;
  missionDomain?: string; // Dominio de la misión actual (si existe)
}

export const UnitsConfigurator: React.FC<UnitsConfiguratorProps> = ({
  units,
  onChange,
  onRequestCoordinate,
  missionDomain,
}) => {
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [domainSelectorOpen, setDomainSelectorOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(missionDomain);

  const addBlankUnit = () => {
    const newUnit: UnitConfig = {
      id: `unit-${Date.now()}`,
      type: 'naval',
      name: 'New unit',
      sensors: [],
      armamento: [],
      operaciones: [],
      targets: [],
      country: 'ESPAÑA',
      classification: 'UNCLASSIFIED',
      domain: missionDomain, // asignamos el dominio de la misión
    };
    onChange([...units, newUnit]);
    setEditingUnitId(newUnit.id);
  };

  const handleAddUnitClick = () => {
    if (missionDomain) {
      // Si la misión ya tiene dominio, abrir directamente el selector
      setSelectedDomain(missionDomain);
      setSelectorOpen(true);
    } else {
      // Si no, preguntar dominio primero
      setDomainSelectorOpen(true);
    }
  };

  const handleDomainSelected = (domain: string) => {
    setSelectedDomain(domain);
    setSelectorOpen(true);
  };

  const handleSelectFromDb = (selectedUnit: UnitConfig) => {
    onChange([...units, selectedUnit]);
    setEditingUnitId(selectedUnit.id);
  };

  const updateUnit = (updated: UnitConfig) => {
    onChange(units.map((u) => (u.id === updated.id ? updated : u)));
  };

  const deleteUnit = (id: string) => {
    onChange(units.filter((u) => u.id !== id));
    if (editingUnitId === id) setEditingUnitId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Participating Units</h3>
        <div className="flex gap-2">
          <Button onClick={addBlankUnit} size="sm" variant="outline">
            <FilePlus className="w-4 h-4 mr-2" /> New Blank
          </Button>
          <Button onClick={handleAddUnitClick} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Unit
          </Button>
        </div>
      </div>

      {units.length === 0 && (
        <p className="text-muted-foreground text-sm italic">No units configured.</p>
      )}

      <div className="space-y-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onEdit={() => setEditingUnitId(unit.id)}
            onDelete={() => deleteUnit(unit.id)}
          />
        ))}
      </div>

      {/* Modal de selección de dominio */}
      <DomainSelectorModal
        open={domainSelectorOpen}
        onClose={() => setDomainSelectorOpen(false)}
        onSelect={handleDomainSelected}
      />

      {/* Modal de selección de unidades (filtrado por dominio) */}
      <UnitSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectFromDb}
        domain={selectedDomain} // pasamos el dominio seleccionado
      />

      {editingUnitId && (
        <UnitEditor
          unit={units.find((u) => u.id === editingUnitId)!}
          onChange={updateUnit}
          onClose={() => setEditingUnitId(null)}
          onRequestCoordinateSelect={(type) => onRequestCoordinate(type, editingUnitId)}
        />
      )}
    </div>
  );
};