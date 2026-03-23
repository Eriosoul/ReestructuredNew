// components/missions/UnitCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { UNIT_TYPE_ICONS } from '@/lib/missionConstants';
import type { UnitConfig } from '@/types/mission';

interface UnitCardProps {
  unit: UnitConfig;
  onEdit: () => void;
  onDelete: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded">{UNIT_TYPE_ICONS[unit.type]}</div>
          <div>
            <p className="font-medium">{unit.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {unit.type} • {unit.country} {unit.domain && `• ${unit.domain}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {unit.sensors.length} sensores • {unit.armamento.length} armas • {unit.targets.length} objetivos
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};