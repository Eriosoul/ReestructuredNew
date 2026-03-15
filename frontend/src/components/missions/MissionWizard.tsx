// components/missions/MissionWizard.tsx
import React, { useState, useEffect } from 'react';
import { MissionForm } from './MissionForm';
import { Map } from '@/components/Map';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Mission, UnitConfig, SelectedTask } from '@/types/mission';

interface MissionWizardProps {
  initialMission?: Mission; // Para edición
  onClose: () => void;
  onCreate: (mission: Mission) => void;
  onUpdate: (mission: Mission) => void;
}

export const MissionWizard: React.FC<MissionWizardProps> = ({
  initialMission,
  onClose,
  onCreate,
  onUpdate,
}) => {
  const [missionData, setMissionData] = useState<Partial<Mission>>(
    initialMission || {
      name: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      units: [],
      tasks: [],
      coords: '',
    }
  );

  const [coordinateMode, setCoordinateMode] = useState<'mission' | 'unit-origin' | 'unit-current' | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Si hay misión inicial, cargamos sus datos
  useEffect(() => {
    if (initialMission) {
      setMissionData(initialMission);
    }
  }, [initialMission]);

  const handleMapClick = (lat: number, lng: number) => {
    if (coordinateMode === 'mission') {
      setMissionData(prev => ({ ...prev, coords: `${lat},${lng}` }));
    } else if (coordinateMode === 'unit-origin' && selectedUnitId) {
      setMissionData(prev => ({
        ...prev,
        units: prev.units?.map(u =>
          u.id === selectedUnitId
            ? { ...u, orig_trayectory: { lat, lon: lng } }
            : u
        )
      }));
    } else if (coordinateMode === 'unit-current' && selectedUnitId) {
      setMissionData(prev => ({
        ...prev,
        units: prev.units?.map(u =>
          u.id === selectedUnitId
            ? { ...u, actual_trayectory: { lat, lon: lng } }
            : u
        )
      }));
    }
    setCoordinateMode(null);
    setSelectedUnitId(null);
  };

  const handleRequestCoordinate = (type: 'mission' | 'unit-origin' | 'unit-current', unitId?: string) => {
    setCoordinateMode(type);
    if (unitId) setSelectedUnitId(unitId);
  };

  const handleSubmit = () => {
    // Construir misión completa
    const newMission: Mission = {
      id: initialMission?.id || `mission-${Date.now()}`,
      name: missionData.name!,
      description: missionData.description!,
      status: missionData.status as any || 'pending',
      priority: missionData.priority as any || 'medium',
      startDate: missionData.startDate || new Date(),
      createdBy: missionData.createdBy || 'user-1', // deberías obtener el usuario actual
      assignedUsers: missionData.assignedUsers || [],
      objects: missionData.objects || [],
      tags: missionData.tags || [],
      createdAt: missionData.createdAt || new Date(),
      updatedAt: new Date(),
      activityLog: missionData.activityLog || [],
      notes: missionData.notes || [],
      color: missionData.color || '#' + Math.floor(Math.random()*16777215).toString(16),
      units: missionData.units || [],
      tasks: missionData.tasks || [],
      coords: missionData.coords,
      video_feed: missionData.video_feed,
    };
    if (initialMission) {
      onUpdate(newMission);
    } else {
      onCreate(newMission);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm">
      {/* Lado izquierdo: formulario */}
      <div className="w-1/2 h-full overflow-y-auto border-r bg-background">
        <div className="sticky top-0 flex justify-end p-2 bg-background border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <MissionForm
          data={missionData}
          onChange={setMissionData}
          onRequestCoordinate={handleRequestCoordinate}
        />
        <div className="p-6 border-t">
          <Button onClick={handleSubmit} className="w-full">
            {initialMission ? 'Actualizar Misión' : 'Crear Misión'}
          </Button>
        </div>
      </div>

      {/* Lado derecho: mapa */}
      <div className="w-1/2 h-full">
        <Map
          onClick={handleMapClick}
          selectionMode={coordinateMode !== null}
          selectedCoords={missionData.coords}
        />
      </div>
    </div>
  );
};