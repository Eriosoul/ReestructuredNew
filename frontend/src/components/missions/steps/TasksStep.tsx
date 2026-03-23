import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { Mission, SelectedTask } from '@/types/mission';

interface TasksStepProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
}

export const TasksStep: React.FC<TasksStepProps> = ({ data, onChange }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: SelectedTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'pending',
    };
    onChange({
      ...data,
      tasks: [...(data.tasks || []), newTask],
    });
    setNewTaskTitle('');
  };

  const removeTask = (id: string) => {
    onChange({
      ...data,
      tasks: (data.tasks || []).filter(t => t.id !== id),
    });
  };

  const toggleTaskStatus = (id: string) => {
    onChange({
      ...data,
      tasks: (data.tasks || []).map(t =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add New Task</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Task description"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addTask} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
        {data.tasks?.length === 0 && (
          <p className="text-muted-foreground text-sm">No tasks added yet.</p>
        )}
        {data.tasks?.map(task => (
          <Card key={task.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => toggleTaskStatus(task.id)}
                />
                <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};