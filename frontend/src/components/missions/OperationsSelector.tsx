// components/missions/OperationsSelector.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UNIT_OPERATIONS_CONFIGS } from '@/lib/missionConstants';

interface OperationsSelectorProps {
  unitType: 'naval' | 'ground' | 'aerial';
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const OperationsSelector: React.FC<OperationsSelectorProps> = ({ unitType, selected, onChange }) => {
  const options = UNIT_OPERATIONS_CONFIGS[unitType] || [];

  const toggle = (op: string) => {
    if (selected.includes(op)) {
      onChange(selected.filter(o => o !== op));
    } else {
      onChange([...selected, op]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Operaciones asignadas</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((op) => {
          const isSelected = selected.includes(op);
          return (
            <Badge
              key={op}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer py-1.5 px-3"
              onClick={() => toggle(op)}
            >
              {op}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};