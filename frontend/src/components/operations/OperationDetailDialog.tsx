import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { OperationMapView } from './OperationMapView';
import { OperationTaskBoard } from './OperationTaskBoard';
import { VideoFeedPanel } from './VideoFeedPanel';
import { SensorStatus } from './SensorStatus';
import { CommandConsole } from './CommandConsole';
import { MissionWizard } from '@/components/missions/MissionWizard';
import type { Operation, Mission } from '@/types/mission';

interface OperationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onGenerateReport: (op: Operation, format: 'json' | 'csv' | 'pdf') => void;
  onUpdateOperation: (updatedOperation: Operation) => void; // nueva prop
  statusColors: Record<string, string>;
}

export function OperationDetailDialog({
  open,
  onOpenChange,
  operation,
  onGenerateReport,
  onUpdateOperation,
  statusColors,
}: OperationDetailDialogProps) {
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showMissionWizard, setShowMissionWizard] = useState(false);

  // Actualizar tareas cuando cambia la operación
  useEffect(() => {
    if (operation) {
      setTasks(operation.missions || []);
      setSelectedTaskId(null);
      setCommandHistory([]);
    }
  }, [operation]);

  // Manejadores internos
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setCommandHistory(prev => [...prev, `Task ${taskId} status changed to ${newStatus}`]);
    // Aquí se podría llamar a una API para persistir el cambio
  };

  const handleSendCommand = (cmd: string) => {
    setCommandHistory(prev => [...prev, `> ${cmd}`]);
    const upperCmd = cmd.toUpperCase();
    if (selectedTaskId && (upperCmd === 'START' || upperCmd === 'ACTIVATE')) {
      handleUpdateTaskStatus(selectedTaskId, 'active');
      setCommandHistory(prev => [...prev, `Task ${selectedTaskId} activated`]);
    } else if (selectedTaskId && upperCmd === 'ABORT') {
      handleUpdateTaskStatus(selectedTaskId, 'archived');
      setCommandHistory(prev => [...prev, `Task ${selectedTaskId} aborted`]);
    } else if (selectedTaskId && upperCmd === 'COMPLETE') {
      handleUpdateTaskStatus(selectedTaskId, 'completed');
      setCommandHistory(prev => [...prev, `Task ${selectedTaskId} completed`]);
    } else {
      setCommandHistory(prev => [...prev, `Command '${cmd}' sent to backend (not implemented)`]);
    }
  };

  const handleMissionCreated = (newMission: Mission) => {
    if (!operation) return;

    // Actualizar la operación con la nueva misión
    const updatedOperation = {
      ...operation,
      missions: [...(operation.missions || []), newMission],
    };
    onUpdateOperation(updatedOperation);
    setTasks(updatedOperation.missions || []);
    setShowMissionWizard(false);
  };

  if (!operation) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
            !w-[98vw] !max-w-none !h-[95vh] !max-h-[95vh]
            md:!w-[95vw] md:!h-[90vh]
            flex flex-col p-0 overflow-hidden
          "
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b shrink-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: operation.color }} />
                <DialogTitle className="text-xl sm:text-2xl">{operation.name}</DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${statusColors[operation.status]}`}
                >
                  {operation.status}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => setShowMissionWizard(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Nueva Misión
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Columna izquierda: mapa + lista de tareas */}
              <div className="md:col-span-2 flex flex-col gap-4 h-full">
                <div className="flex-1 min-h-0 rounded-lg border overflow-hidden bg-card">
                  <OperationMapView tasks={tasks} selectedTaskId={selectedTaskId} />
                </div>
                <div className="flex-1 min-h-0">
                  <OperationTaskBoard
                    tasks={tasks}
                    selectedTaskId={selectedTaskId}
                    onSelectTask={handleSelectTask}
                    onUpdateStatus={handleUpdateTaskStatus}
                  />
                </div>
              </div>

              {/* Columna derecha: vídeos, sensores, consola */}
              <div className="flex flex-col gap-4 h-full">
                <div className="flex-1 min-h-0">
                  <VideoFeedPanel />
                </div>
                <div className="flex-1 min-h-0">
                  <SensorStatus />
                </div>
                <div className="flex-1 min-h-0">
                  <CommandConsole onSendCommand={handleSendCommand} history={commandHistory} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={() => onGenerateReport(operation, 'json')}>
              <FileText className="w-4 h-4 mr-2" /> JSON
            </Button>
            <Button variant="outline" onClick={() => onGenerateReport(operation, 'csv')}>
              <FileText className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" onClick={() => onGenerateReport(operation, 'pdf')}>
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wizard para crear nuevas misiones */}
      {showMissionWizard && (
        <MissionWizard
          operationId={operation._id}
          onClose={() => setShowMissionWizard(false)}
          onCreate={handleMissionCreated}
          onUpdate={() => {}}
        />
      )}
    </>
  );
}