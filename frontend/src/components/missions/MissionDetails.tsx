// components/missions/MissionDetails.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { Mission } from '@/types/mission';

interface MissionDetailsProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
  onRequestCoordinate: () => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({ data, onChange, onRequestCoordinate }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la misión *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Ej: Operación Cervantes"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={4}
          placeholder="Objetivos, reglas de enfrentamiento, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prioridad</Label>
          <Select
            value={data.priority as string}
            onValueChange={(v) => onChange({ ...data, priority: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado inicial</Label>
          <Select
            value={data.status as string}
            onValueChange={(v) => onChange({ ...data, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="archived">Archivada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Coordenadas de la misión</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={data.coords || ''}
            onChange={(e) => onChange({ ...data, coords: e.target.value })}
            placeholder="lat,lon"
            className="flex-1"
          />
          <Button variant="outline" onClick={onRequestCoordinate}>
            <MapPin className="w-4 h-4 mr-2" />
            Seleccionar en mapa
          </Button>
        </div>
      </div>
    </div>
  );
};