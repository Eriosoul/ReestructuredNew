// components/missions/Summary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Mission } from '@/types/mission';

interface SummaryProps {
  data: Partial<Mission>;
}

export const Summary: React.FC<SummaryProps> = ({ data }) => {
  const units = data.units || [];
  const tasks = data.tasks || [];

  const totalSensors = units.reduce((acc, u) => acc + u.sensors.length, 0);
  const totalArmamento = units.reduce((acc, u) => acc + u.armamento.length, 0);
  const totalTargets = units.reduce((acc, u) => acc + u.targets.length, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la misión</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Nombre:</strong> {data.name || 'Sin nombre'}</p>
          <p><strong>Descripción:</strong> {data.description || 'Sin descripción'}</p>
          <p><strong>Prioridad:</strong> <Badge variant="outline">{data.priority}</Badge></p>
          <p><strong>Estado:</strong> <Badge variant="outline">{data.status}</Badge></p>
          <p><strong>Coordenadas:</strong> {data.coords || 'No definidas'}</p>
          <p><strong>Video feed:</strong> {data.video_feed || 'No'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unidades ({units.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sensores: {totalSensors}</p>
          <p>Armamento: {totalArmamento}</p>
          <p>Objetivos: {totalTargets}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tareas ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.map(t => (
            <div key={t.taskId} className="mb-2">
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">Asignada a: {t.assignedToUnitName || 'Misión general'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};