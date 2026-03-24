import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { type Mission } from '@/types/mission';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusColors = {
  planning: 'bg-blue-500/10 text-blue-500',
  active: 'bg-green-500/10 text-green-500',
  standby: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-gray-500/10 text-gray-500',
  archived: 'bg-muted text-muted-foreground',
};

const riskColors = {
  critical: 'text-red-500 border-red-500/30',
  high: 'text-amber-500 border-amber-500/30',
  medium: 'text-blue-500 border-blue-500/30',
  low: 'text-green-500 border-green-500/30',
};

interface TaskBoardProps {
  tasks: Mission[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: string) => void;
}

export function OperationTaskBoard({ tasks, selectedTaskId, onSelectTask, onUpdateStatus }: TaskBoardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (search && !task.name.toLowerCase().includes(search.toLowerCase()) && !task.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks by name, unit, description, or ID..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStatusFilter('all')}>All Tasks</Badge>
          <Badge variant={statusFilter === 'active' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStatusFilter('active')}>Active</Badge>
          <Badge variant={statusFilter === 'planning' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStatusFilter('planning')}>Planning</Badge>
          <Badge variant={statusFilter === 'completed' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStatusFilter('completed')}>Completed</Badge>
        </div>
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all",
                selectedTaskId === task.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              )}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>{task.status}</Badge>
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, 'active'); }}><Play className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, 'completed'); }}><CheckCircle className="h-3 w-3" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Risk: <Badge variant="outline" className={cn("text-xs", riskColors[task.risk])}>{task.risk}</Badge></span>
                {task.coords && <span>📍 {task.coords}</span>}
                {task.deadline && <span>⏱️ {format(task.deadline, 'dd/MM/yyyy HH:mm')}</span>}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}