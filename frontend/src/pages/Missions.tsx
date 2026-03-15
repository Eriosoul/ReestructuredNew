// pages/Missions.tsx
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Target,
  Calendar,
  Users,
  MapPin,
  Activity,
  Clock,
  CheckCircle,
  Archive,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  Ship,
  Shield,
  Plane,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMissionStore, useObjectStore } from '@/store';
import { MissionWizard } from '@/components/missions/MissionWizard';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Mission } from '@/types/mission';

// Definición local de UNIT_TYPE_ICONS
const UNIT_TYPE_ICONS = {
  naval: <Ship className="w-5 h-5" />,
  ground: <Shield className="w-5 h-5" />,
  aerial: <Plane className="w-5 h-5" />,
};

const priorityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/30',
  high: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  low: 'bg-green-500/10 text-green-500 border-green-500/30',
};

const statusColors = {
  active: 'bg-green-500/10 text-green-500',
  pending: 'bg-amber-500/10 text-amber-500',
  completed: 'bg-blue-500/10 text-blue-500',
  archived: 'bg-gray-500/10 text-gray-500',
};

export default function MissionsPage() {
  const { missions, activeMission, setActiveMission, addMission, updateMission, deleteMission } = useMissionStore();
  const { objects } = useObjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null); // Para edición
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const filteredMissions = missions.filter(mission =>
    mission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mission.tags && mission.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleCreateMission = (missionData: Mission) => {
    addMission(missionData);
    toast.success('Mission created', { description: `${missionData.name} has been created.` });
    setShowWizard(false);
    setEditingMission(null);
  };

  const handleUpdateMission = (missionData: Mission) => {
    updateMission(missionData);
    toast.success('Mission updated', { description: `${missionData.name} has been updated.` });
    setShowWizard(false);
    setEditingMission(null);
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setShowWizard(true);
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailDialog(true);
    setActiveMission(mission);
  };

  const handleDeleteMission = (missionId: string) => {
    deleteMission(missionId);
    toast.success('Mission deleted');
  };

  const handleGenerateReport = (mission: Mission) => {
    // Crear un objeto con los datos relevantes para el informe
    const reportData = {
      ...mission,
      generatedAt: new Date().toISOString(),
    };
    // Convertir a JSON y descargar
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-${mission.id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report generated', { description: 'Mission report downloaded as JSON.' });
  };

  const renderMissionCard = (mission: Mission) => {
    const missionObjects = objects.filter(o => mission.objects?.includes(o.id) || false);
    const unitsCount = mission.units?.length || 0;
    const tasksCount = mission.tasks?.length || 0;

    return (
      <Card key={mission.id} className="card-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: mission.color }}
                />
                <h3 className="font-semibold text-lg truncate">{mission.name}</h3>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${priorityColors[mission.priority]}`}
                >
                  {mission.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {mission.description}
              </p>

              {mission.tags && mission.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {mission.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {mission.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{mission.tags.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(mission.startDate, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {mission.objects?.length || 0} objects
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {mission.assignedUsers?.length || 0} assigned
                </span>
                {unitsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {unitsCount} units
                  </span>
                )}
                {tasksCount > 0 && (
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {tasksCount} tasks
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMission(mission)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditMission(mission)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Mission
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport(mission)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteMission(mission.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Missions</h1>
          <p className="text-muted-foreground">Manage intelligence operations and assignments</p>
        </div>
        <Button onClick={() => {
          setEditingMission(null);
          setShowWizard(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Mission
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search missions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({missions.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({missions.filter(m => m.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({missions.filter(m => m.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({missions.filter(m => m.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'active').map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'pending').map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'completed').map(renderMissionCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mission Detail Dialog - Versión mejorada */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedMission && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedMission.color }}
                  />
                  <DialogTitle>{selectedMission.name}</DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusColors[selectedMission.status]}`}
                  >
                    {selectedMission.status}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full mt-4">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="units">Unidades ({selectedMission.units?.length || 0})</TabsTrigger>
                  <TabsTrigger value="tasks">Tareas ({selectedMission.tasks?.length || 0})</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                  <TabsTrigger value="map">Mapa</TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[60vh]">
                  {/* Pestaña Resumen */}
                  <TabsContent value="overview" className="space-y-4 p-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Descripción</h4>
                      <p className="text-sm text-muted-foreground">{selectedMission.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Prioridad</span>
                        <Badge variant="outline" className={`text-xs capitalize ${priorityColors[selectedMission.priority]}`}>
                          {selectedMission.priority}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Fecha inicio</span>
                        <p className="text-sm">{format(selectedMission.startDate, 'PPP')}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Creado por</span>
                        <p className="text-sm">{selectedMission.createdBy}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Coordenadas</span>
                        <p className="text-sm font-mono">{selectedMission.coords || 'No especificadas'}</p>
                      </div>
                    </div>

                    {selectedMission.tags && selectedMission.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMission.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-4 pt-2">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{selectedMission.objects?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Objetos</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{selectedMission.assignedUsers?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Asignados</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{selectedMission.activityLog?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Actividades</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{format(selectedMission.startDate, 'MMM d')}</p>
                        <p className="text-xs text-muted-foreground">Inicio</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Pestaña Unidades */}
                  <TabsContent value="units" className="space-y-4 p-4">
                    {selectedMission.units && selectedMission.units.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedMission.units.map((unit, idx) => (
                          <Card key={unit.id || idx}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {UNIT_TYPE_ICONS[unit.type] || <Ship className="w-5 h-5" />}
                                  <span className="font-medium">{unit.name}</span>
                                  <Badge variant="outline" className="text-xs capitalize">{unit.type}</Badge>
                                </div>
                                <Badge>{unit.country || 'ESPAÑA'}</Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3">
                                <div>
                                  <span className="text-muted-foreground">Sensores:</span> {unit.sensors.length}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Armamento:</span> {unit.armamento.length}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Objetivos:</span> {unit.targets.length}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Operaciones:</span> {unit.operaciones.length}
                                </div>
                              </div>

                              {unit.orig_trayectory?.lat && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  📍 Origen: {unit.orig_trayectory.lat.toFixed(4)}, {unit.orig_trayectory.lon.toFixed(4)}
                                </p>
                              )}

                              {unit.sensors.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs font-medium mb-1">Sensores activos:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {unit.sensors.slice(0, 3).map(s => (
                                      <Badge key={s.type} variant="outline" className="text-[10px]">
                                        {s.type}
                                      </Badge>
                                    ))}
                                    {unit.sensors.length > 3 && (
                                      <Badge variant="outline" className="text-[10px]">+{unit.sensors.length - 3}</Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {unit.targets.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Objetivos asignados:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {unit.targets.slice(0, 2).map((t, i) => (
                                      <Badge key={i} variant="destructive" className="text-[10px]">
                                        {t.name}
                                      </Badge>
                                    ))}
                                    {unit.targets.length > 2 && (
                                      <Badge variant="destructive" className="text-[10px]">+{unit.targets.length - 2}</Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay unidades asignadas.</p>
                    )}
                  </TabsContent>

                  {/* Pestaña Tareas */}
                  <TabsContent value="tasks" className="space-y-4 p-4">
                    {selectedMission.tasks && selectedMission.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {selectedMission.tasks.map((task, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{task.name}</span>
                                    {task.assignedToUnitName && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {task.assignedToUnitName}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                  <div className="flex gap-2 mt-2">
                                    {task.requiresTarget && (
                                      <Badge variant="outline" className="text-[10px] border-red-500 text-red-500">
                                        Requiere objetivo
                                      </Badge>
                                    )}
                                    {task.requiresCoordinates && (
                                      <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-500">
                                        Requiere coordenadas
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline">{task.domain}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay tareas específicas.</p>
                    )}
                  </TabsContent>

                  {/* Pestaña Actividad */}
                  <TabsContent value="activity" className="p-4">
                    {selectedMission.activityLog && selectedMission.activityLog.length > 0 ? (
                      <div className="space-y-3">
                        {selectedMission.activityLog.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm">{log.details}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.userName} • {format(log.timestamp, 'PPpp')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay actividad registrada.</p>
                    )}
                  </TabsContent>

                  {/* Pestaña Mapa */}
                  <TabsContent value="map" className="p-4">
                    {selectedMission.coords ? (
                      <div className="h-64 w-full bg-muted rounded flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Mapa con coordenadas: {selectedMission.coords}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay coordenadas para mostrar.</p>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => handleGenerateReport(selectedMission)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generar informe
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mission Wizard (para crear o editar) */}
      {showWizard && (
        <MissionWizard
          initialMission={editingMission || undefined}
          onClose={() => {
            setShowWizard(false);
            setEditingMission(null);
          }}
          onCreate={handleCreateMission}
          onUpdate={handleUpdateMission}
        />
      )}
    </div>
  );
}