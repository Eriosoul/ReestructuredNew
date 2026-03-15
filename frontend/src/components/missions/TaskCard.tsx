// components/missions/TaskCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import type { SelectedTask, UnitConfig } from '@/types/mission';

interface TaskCardProps {
  task: SelectedTask;
  onRemove: () => void;
  onAssignUnit: (unitId?: string) => void;
  units: UnitConfig[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onRemove, onAssignUnit, units }) => {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {task.icon}
            <div>
              <h5 className="font-medium text-sm">{task.name}</h5>
              <p className="text-xs text-muted-foreground">{task.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs">Asignar a:</span>
          <Select
            value={task.assignedToUnit || ''}
            onValueChange={(val) => onAssignUnit(val || undefined)}
          >
            <SelectTrigger className="h-7 text-xs w-32">
              <SelectValue placeholder="Misión general" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Misión general</SelectItem>
              {units.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};