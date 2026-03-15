// components/missions/ArmamentSelector.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UNIT_ARMAMENT_CONFIGS, getIcon } from '@/lib/missionConstants';

interface ArmamentSelectorProps {
  unitType: 'naval' | 'ground' | 'aerial';
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const ArmamentSelector: React.FC<ArmamentSelectorProps> = ({ unitType, selected, onChange }) => {
  const options = UNIT_ARMAMENT_CONFIGS[unitType] || [];

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Selección de Armamento</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isSelected = selected.includes(item.name);
          return (
            <Badge
              key={item.name}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer py-1.5 px-3 flex items-center gap-2 transition-all"
              onClick={() => toggle(item.name)}
            >
              {getIcon(item.icon, 14)}
              <span>{item.name}</span>
            </Badge>
          );
        })}
      </div>
      {options.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No hay armamento disponible para este tipo de unidad.
        </p>
      )}
    </div>
  );
};