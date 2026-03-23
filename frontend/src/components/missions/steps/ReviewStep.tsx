import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Mission } from '@/types/mission';

interface ReviewStepProps {
  data: Partial<Mission>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">General Information</h3>
          <p><span className="font-medium">Name:</span> {data.name || '—'}</p>
          <p><span className="font-medium">Description:</span> {data.description || '—'}</p>
          <p><span className="font-medium">Priority:</span> {data.priority || '—'}</p>
          <p><span className="font-medium">Status:</span> {data.status || '—'}</p>
          <p><span className="font-medium">Start Date:</span> {formatDate(data.startDate)}</p>
          <p><span className="font-medium">Tags:</span> {data.tags?.join(', ') || '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Units</h3>
          {data.units?.length === 0 && <p>No units added.</p>}
          {data.units?.map(unit => (
            <div key={unit.id} className="border-b last:border-0 py-2">
              <p><span className="font-medium">{unit.name}</span> ({unit.type})</p>
              {unit.orig_trayectory && (
                <p className="text-sm text-muted-foreground">
                  Origin: {unit.orig_trayectory.lat}, {unit.orig_trayectory.lon}
                </p>
              )}
              {unit.actual_trayectory && (
                <p className="text-sm text-muted-foreground">
                  Current: {unit.actual_trayectory.lat}, {unit.actual_trayectory.lon}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Tasks</h3>
          {data.tasks?.length === 0 && <p>No tasks added.</p>}
          {data.tasks?.map(task => (
            <div key={task.id} className="flex items-center justify-between py-1">
              <span className={task.status === 'completed' ? 'line-through' : ''}>{task.title}</span>
              <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                {task.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Video Feed</h3>
          <p><span className="font-medium">URL:</span> {data.videoUrl || 'Not configured'}</p>
          <p><span className="font-medium">Protocol:</span> {data.videoProtocol || '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Location</h3>
          <p><span className="font-medium">Coordinates:</span> {data.coords || 'Not set'}</p>
          {data.location && (
            <p className="text-sm text-muted-foreground">
              (lat: {data.location.coordinates[1]}, lng: {data.location.coordinates[0]})
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};