// components/missions/TasksSelector.tsx
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { DOMAIN_TASKS, DOMAIN_NAMES } from '@/lib/missionConstants';
import type { SelectedTask, UnitConfig } from '@/types/mission';

interface TasksSelectorProps {
  selectedTasks: SelectedTask[];
  onChange: (tasks: SelectedTask[]) => void;
  units: UnitConfig[];
}

export const TasksSelector: React.FC<TasksSelectorProps> = ({
  selectedTasks,
  onChange,
  units,
}) => {
  const [search, setSearch] = useState('');

  // Generar lista plana de todas las tareas disponibles
  const allTasks = useMemo(() => {
    return Object.entries(DOMAIN_TASKS).flatMap(([domain, tasks]) =>
      tasks.map((task) => ({
        ...task,
        domain,
        taskId: task.id,
      }))
    );
  }, []);

  // Filtrar tareas según búsqueda
  const filteredTasks = useMemo(() => {
    if (!search) return allTasks;
    const lowerSearch = search.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.name.toLowerCase().includes(lowerSearch) ||
        task.description.toLowerCase().includes(lowerSearch) ||
        DOMAIN_NAMES[task.domain as keyof typeof DOMAIN_NAMES]
          .toLowerCase()
          .includes(lowerSearch)
    );
  }, [search, allTasks]);

  const toggleTask = (task: (typeof allTasks)[0]) => {
    const exists = selectedTasks.some(
      (t) => t.domain === task.domain && t.taskId === task.taskId
    );
    if (exists) {
      onChange(
        selectedTasks.filter(
          (t) => !(t.domain === task.domain && t.taskId === task.taskId)
        )
      );
    } else {
      onChange([...selectedTasks, task]);
    }
  };

  const assignToUnit = (taskIndex: number, unitId?: string) => {
    const updated = [...selectedTasks];
    const unit = units.find((u) => u.id === unitId);
    updated[taskIndex] = {
      ...updated[taskIndex],
      assignedToUnit: unitId,
      assignedToUnitName: unit?.name,
    };
    onChange(updated);
  };

  const removeTask = (taskIndex: number) => {
    onChange(selectedTasks.filter((_, i) => i !== taskIndex));
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas por nombre, descripción o dominio..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearch('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Lista de tareas disponibles */}
      <ScrollArea className="h-64 border rounded-lg p-2">
        <div className="space-y-1">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic p-2">
              No se encontraron tareas.
            </p>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTasks.some(
                (t) => t.domain === task.domain && t.taskId === task.taskId
              );
              return (
                <div
                  key={`${task.domain}-${task.taskId}`}
                  className={`p-3 rounded cursor-pointer transition flex items-start justify-between ${
                    isSelected
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleTask(task)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.name}</span>
                      {task.requiresTarget && (
                        <Badge variant="outline" className="text-xs">
                          Requiere objetivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dominio:{' '}
                      {DOMAIN_NAMES[task.domain as keyof typeof DOMAIN_NAMES]}
                    </p>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      Seleccionada
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Tareas seleccionadas */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-2">
          Tareas seleccionadas ({selectedTasks.length})
        </h4>
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Ninguna tarea seleccionada.
          </p>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {selectedTasks.map((task, idx) => {
                const domainName =
                  DOMAIN_NAMES[task.domain as keyof typeof DOMAIN_NAMES] ||
                  task.domain;
                return (
                  <div
                    key={idx}
                    className="p-3 border rounded flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({domainName})
                        </span>
                        {task.requiresTarget && (
                          <Badge variant="outline" className="text-xs">
                            Objetivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs">Asignar a:</span>
                        <Select
                          value={task.assignedToUnit || 'none'}
                          onValueChange={(val) =>
                            assignToUnit(idx, val === 'none' ? undefined : val)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue placeholder="Misión general" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Misión general</SelectItem>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(idx)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};