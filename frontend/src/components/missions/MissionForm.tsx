// components/missions/MissionForm.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MissionDetails } from './MissionDetails';
import { UnitsConfigurator } from './UnitsConfigurator';
import { TasksSelector } from './TasksSelector';
import { Summary } from './Summary';
import type { Mission, UnitConfig, SelectedTask } from '@/types/mission';

interface MissionFormProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
  onRequestCoordinate: (type: 'mission' | 'unit-origin' | 'unit-current', unitId?: string) => void;
}

export const MissionForm: React.FC<MissionFormProps> = ({ data, onChange, onRequestCoordinate }) => {
  return (
    <div className="p-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <MissionDetails data={data} onChange={onChange} onRequestCoordinate={() => onRequestCoordinate('mission')} />
        </TabsContent>

        <TabsContent value="units">
          <UnitsConfigurator
            units={data.units || []}
            onChange={(units) => onChange({ ...data, units })}
            onRequestCoordinate={onRequestCoordinate}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksSelector
            selectedTasks={data.tasks || []}
            onChange={(tasks) => onChange({ ...data, tasks })}
            units={data.units || []}
          />
        </TabsContent>

        <TabsContent value="summary">
          <Summary data={data} />
          {/* El botón de crear está en el wizard, no aquí */}
        </TabsContent>
      </Tabs>
    </div>
  );
};