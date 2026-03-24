import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Users, Target, Activity 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom components
import { OperationWizard } from '@/components/operations/OperationWizard';
import { OperationDetailDialog } from '@/components/operations/OperationDetailDialog';
import { OperationCard } from '@/components/operations/OperationCard';

// Store and types
import { useOperationStore } from '@/store/operationStore';
import type { Operation } from '@/types/mission';

// ----------------------------------------------------------------------------
// Estilos de colores según prioridad y estado
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
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

  // Actualizar operación en el store y en el estado local
  const handleUpdateOperation = (updatedOperation: Operation) => {
    updateOperation(updatedOperation);
    setSelectedOperation(updatedOperation);
    toast.success('Operación actualizada', { description: 'Misión añadida correctamente.' });
  };

  // --------------------------------------------------------------------------
  // Exportación de informes en múltiples formatos
  // --------------------------------------------------------------------------
  const handleGenerateReport = async (op: Operation, format: 'json' | 'csv' | 'pdf') => {
    const reportData = {
      operation: op,
      generatedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operation-${op._id}-report.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Informe JSON generado');
    } 
    else if (format === 'csv') {
      const flatData = {
        id: op._id,
        name: op.name,
        description: op.description,
        status: op.status,
        priority: op.priority,
        startDate: op.startDate,
        endDate: op.endDate,
        createdBy: op.createdBy,
        tags: op.tags?.join(';'),
        missionsCount: op.missions?.length,
        assignedUsersCount: op.assignedUsers?.length,
      };
      const csv = Papa.unparse([flatData]);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operation-${op._id}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Informe CSV generado');
    } 
    else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Operation Report: ${op.name}`, 20, 20);
      doc.setFontSize(12);
      doc.text(`ID: ${op._id}`, 20, 30);
      doc.text(`Status: ${op.status}`, 20, 40);
      doc.text(`Priority: ${op.priority}`, 20, 50);
      doc.text(`Start Date: ${format(op.startDate, 'PPP')}`, 20, 60);
      if (op.endDate) doc.text(`End Date: ${format(op.endDate, 'PPP')}`, 20, 70);
      doc.text(`Created By: ${op.createdBy}`, 20, 80);
      if (op.description) {
        const lines = doc.splitTextToSize(`Description: ${op.description}`, 170);
        doc.text(lines, 20, 90);
      }
      let y = op.description ? 90 + (op.description.length / 40) * 7 : 90;
      doc.text(`Missions (${op.missions?.length || 0}):`, 20, y);
      y += 10;
      if (op.missions?.length) {
        op.missions.forEach((mission, idx) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${idx + 1}. ${mission.name} (${mission.status})`, 20, y);
          y += 8;
          if (mission.description) {
            const descLines = doc.splitTextToSize(mission.description, 170);
            doc.text(descLines, 25, y);
            y += descLines.length * 5 + 2;
          }
        });
      }
      doc.save(`operation-${op._id}-report.pdf`);
      toast.success('Informe PDF generado');
    }
  };

  // --------------------------------------------------------------------------
  // Renderizado principal
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operaciones</h1>
          <p className="text-muted-foreground">Gestiona las operaciones y sus misiones asociadas</p>
        </div>
        <Button onClick={() => { setEditingOperation(null); setShowWizard(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Operación
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
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

      {/* Tabs de estado */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({operations.length})</TabsTrigger>
          <TabsTrigger value="active">Activas ({operations.filter(o => o.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({operations.filter(o => o.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({operations.filter(o => o.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOperations.map(op => (
              <OperationCard
                key={op._id}
                operation={op}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateReport={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOperations.filter(o => o.status === 'active').map(op => (
              <OperationCard
                key={op._id}
                operation={op}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateReport={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOperations.filter(o => o.status === 'pending').map(op => (
              <OperationCard
                key={op._id}
                operation={op}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateReport={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOperations.filter(o => o.status === 'completed').map(op => (
              <OperationCard
                key={op._id}
                operation={op}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateReport={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles táctico */}
      <OperationDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        operation={selectedOperation}
        onGenerateReport={handleGenerateReport}
        onUpdateOperation={handleUpdateOperation}
        statusColors={statusColors}
      />

      {/* Wizard para crear/editar operaciones */}
      <OperationWizard
        open={showWizard}
        onClose={() => { setShowWizard(false); setEditingOperation(null); }}
        initialOperation={editingOperation || undefined}
        onSave={editingOperation ? handleUpdate : handleCreate}
      />
    </div>
  );
}