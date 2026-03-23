import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, FileText, Calendar, Users, Target, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOperationStore } from '@/store/operationStore';
import { OperationWizard } from '@/components/operations/OperationWizard';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Operation } from '@/types/mission';

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

export default function OperationsPage() {
  const { operations, fetchOperations, addOperation, updateOperation, deleteOperation } = useOperationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  useEffect(() => {
    fetchOperations();
  }, []);

  const filteredOperations = operations.filter(op =>
    op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (op.description && op.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (op.tags && op.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleCreate = (data: Partial<Operation>) => {
    const newOp = {
      ...data,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Operation;
    addOperation(newOp);
    toast.success('Operación creada', { description: `${data.name} ha sido creada.` });
    setShowWizard(false);
    setEditingOperation(null);
  };

  const handleUpdate = (data: Partial<Operation>) => {
    if (editingOperation) {
      updateOperation({ ...editingOperation, ...data } as Operation);
      toast.success('Operación actualizada', { description: `${data.name} ha sido actualizada.` });
    }
    setShowWizard(false);
    setEditingOperation(null);
  };

  const handleEdit = (op: Operation) => {
    setEditingOperation(op);
    setShowWizard(true);
  };

  const handleView = (op: Operation) => {
    setSelectedOperation(op);
    setShowDetailDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta operación? También se eliminarán todas las misiones asociadas.')) {
      await deleteOperation(id);
      toast.success('Operación eliminada');
    }
  };

  const handleGenerateReport = (op: Operation) => {
    const reportData = { ...op, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operation-${op._id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Informe generado', { description: 'Descargado como JSON.' });
  };

  const renderOperationCard = (op: Operation) => (
    <Card key={op._id} className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: op.color }} />
              <h3 className="font-semibold text-lg truncate">{op.name}</h3>
              <Badge variant="outline" className={`text-xs capitalize ${priorityColors[op.priority]}`}>
                {op.priority}
              </Badge>
            </div>
            {op.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{op.description}</p>
            )}
            {op.tags && op.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {op.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
                {op.tags.length > 4 && <Badge variant="secondary">+{op.tags.length - 4}</Badge>}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(op.startDate, 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {op.missions?.length || 0} misiones
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {op.assignedUsers?.length || 0} asignados
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(op)}>
                <Eye className="w-4 h-4 mr-2" /> Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(op)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport(op)}>
                <FileText className="w-4 h-4 mr-2" /> Generar informe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(op._id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operaciones</h1>
          <p className="text-muted-foreground">Gestiona las operaciones y sus misiones asociadas</p>
        </div>
        <Button onClick={() => { setEditingOperation(null); setShowWizard(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Operación
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar operaciones..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtro</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({operations.length})</TabsTrigger>
          <TabsTrigger value="active">Activas ({operations.filter(o => o.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({operations.filter(o => o.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({operations.filter(o => o.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOperations.map(renderOperationCard)}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOperations.filter(o => o.status === 'active').map(renderOperationCard)}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOperations.filter(o => o.status === 'pending').map(renderOperationCard)}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOperations.filter(o => o.status === 'completed').map(renderOperationCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedOperation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedOperation.color }} />
                  <DialogTitle>{selectedOperation.name}</DialogTitle>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[selectedOperation.status]}`}>
                    {selectedOperation.status}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="missions">Misiones ({selectedOperation.missions?.length || 0})</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                  <TabsTrigger value="map">Mapa</TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[60vh]">
                  <TabsContent value="overview" className="space-y-4 p-4">
                    {selectedOperation.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Descripción</h4>
                        <p className="text-sm text-muted-foreground">{selectedOperation.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-xs text-muted-foreground">Prioridad</span><Badge variant="outline" className={`ml-2 ${priorityColors[selectedOperation.priority]}`}>{selectedOperation.priority}</Badge></div>
                      <div><span className="text-xs text-muted-foreground">Fecha inicio</span><p className="text-sm">{format(selectedOperation.startDate, 'PPP')}</p></div>
                      {selectedOperation.endDate && <div><span className="text-xs text-muted-foreground">Fecha fin</span><p className="text-sm">{format(selectedOperation.endDate, 'PPP')}</p></div>}
                      <div><span className="text-xs text-muted-foreground">Creado por</span><p className="text-sm">{selectedOperation.createdBy}</p></div>
                    </div>
                    {selectedOperation.tags && selectedOperation.tags.length > 0 && (
                      <div><h4 className="text-sm font-medium mb-2">Tags</h4><div className="flex flex-wrap gap-2">{selectedOperation.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></div>
                    )}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-3 bg-muted rounded-lg text-center"><Target className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-lg font-bold">{selectedOperation.missions?.length || 0}</p><p className="text-xs">Misiones</p></div>
                      <div className="p-3 bg-muted rounded-lg text-center"><Users className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-lg font-bold">{selectedOperation.assignedUsers?.length || 0}</p><p className="text-xs">Asignados</p></div>
                      <div className="p-3 bg-muted rounded-lg text-center"><Activity className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-lg font-bold">0</p><p className="text-xs">Actividades</p></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="missions" className="p-4">
                    {selectedOperation.missions && selectedOperation.missions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOperation.missions.map(mission => (
                          <Card key={mission.id}>
                            <CardContent className="p-3">
                              <div className="flex justify-between">
                                <span className="font-medium">{mission.name}</span>
                                <Badge variant="outline">{mission.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{mission.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay misiones asignadas.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="p-4">
                    <p className="text-sm text-muted-foreground italic">No hay actividad registrada.</p>
                  </TabsContent>

                  <TabsContent value="map" className="p-4">
                    {selectedOperation.coords ? (
                      <div className="h-64 w-full bg-muted rounded flex items-center justify-center">
                        <p className="text-muted-foreground">Mapa con coordenadas: {selectedOperation.coords}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay coordenadas asociadas.</p>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
                <Button onClick={() => handleGenerateReport(selectedOperation)}>
                  <FileText className="w-4 h-4 mr-2" /> Generar informe
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <OperationWizard
        open={showWizard}
        onClose={() => { setShowWizard(false); setEditingOperation(null); }}
        initialOperation={editingOperation || undefined}
        onSave={editingOperation ? handleUpdate : handleCreate}
      />
    </div>
  );
}