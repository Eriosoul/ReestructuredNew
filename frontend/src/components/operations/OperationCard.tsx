import { MoreVertical, Eye, Edit, Trash2, FileText, Calendar, Users, Target, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Operation } from '@/types/mission';

// Estilos de colores (los mismos que en OperationsPage)
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

interface OperationCardProps {
  operation: Operation;
  onView: (op: Operation) => void;
  onEdit: (op: Operation) => void;
  onDelete: (id: string) => void;
  onGenerateReport: (op: Operation, format: 'json' | 'csv' | 'pdf') => void;
}

// Helper para formatear fechas de forma segura
const safeFormatDate = (date: Date | string | undefined | null, formatStr: string, fallback = '—'): string => {
  if (!date) return fallback;
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

export function OperationCard({
  operation,
  onView,
  onEdit,
  onDelete,
  onGenerateReport,
}: OperationCardProps) {
  return (
    <Card className="card-hover overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-6 space-y-4">
        {/* Header con color, título, prioridad y estado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: operation.color }}
            />
            <h3 className="font-bold text-xl tracking-tight">{operation.name}</h3>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${priorityColors[operation.priority]}`}
            >
              {operation.priority}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${statusColors[operation.status]}`}
            >
              {operation.status}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(operation)}>
                <Eye className="w-4 h-4 mr-2" /> Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(operation)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateReport(operation, 'json')}>
                <FileText className="w-4 h-4 mr-2" /> JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateReport(operation, 'csv')}>
                <FileText className="w-4 h-4 mr-2" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateReport(operation, 'pdf')}>
                <FileText className="w-4 h-4 mr-2" /> PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(operation._id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Descripción completa (sin truncar) */}
        {operation.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {operation.description}
          </p>
        )}

        {/* Tags (todos) */}
        {operation.tags && operation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {operation.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Métricas en grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Inicio: {safeFormatDate(operation.startDate, 'dd/MM/yyyy')}</span>
          </div>
          {operation.endDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Fin: {safeFormatDate(operation.endDate, 'dd/MM/yyyy')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{operation.missions?.length || 0} misiones</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{operation.assignedUsers?.length || 0} asignados</span>
          </div>
        </div>

        {/* Footer opcional: actividad reciente o más métricas */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <Activity className="w-3 h-3" />
          <span>
            Actualizado:{' '}
            {safeFormatDate(operation.updatedAt || operation.createdAt, 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}