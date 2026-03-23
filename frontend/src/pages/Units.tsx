// frontend/pages/UnitsPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BiggerCard } from '@/components/ui/BiggerCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CreateUnitForm } from '@/components/CreateUnitForm';
import { EditUnitForm } from '@/components/EditUnitForm';
import {
  Search,
  Ship,
  Plane,
  Truck,
  Crosshair,
  Activity,
  Eye,
  PlusCircle
} from 'lucide-react';

interface Unit {
  _id: string;
  unitId: string;
  name: string;
  class: string;
  country: string;
  flag: string;
  type: string;
  role: string;
  status: string;
  sensors: any[];
  armament: any[];
  domain: string;
  images?: { url: string; title?: string }[];
  videos?: { url: string; title?: string }[];
  lastPositions?: { lat: number; lon: number; timestamp: string }[];
  description?: string;
  dimensions?: { length?: number; beam?: number; draft?: number };
  speed?: number;
  range?: number;
  complement?: number;
}

interface Mission {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [unitMissions, setUnitMissions] = useState<Mission[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    let filtered = units;

    if (searchTerm) {
      const keywords = searchTerm
        .toLowerCase()
        .split(/[,\s]+/)
        .filter(k => k.trim() !== '');

      filtered = filtered.filter(u => {
        const name = u.name.toLowerCase();
        const unitId = u.unitId.toLowerCase();
        const country = u.country.toLowerCase();
        return keywords.some(keyword =>
          name.includes(keyword) ||
          unitId.includes(keyword) ||
          country.includes(keyword)
        );
      });
    }

    if (domainFilter !== 'all') {
      filtered = filtered.filter(u => u.domain === domainFilter);
    }

    setFilteredUnits(filtered);
  }, [searchTerm, domainFilter, units]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/units`);
      if (!res.ok) throw new Error('Error al cargar unidades');
      const data = await res.json();
      setUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      toast.error('No se pudieron cargar las unidades');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitMissions = async (unitId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/units/${unitId}/missions`);
      if (!res.ok) throw new Error('Error al cargar misiones');
      const data = await res.json();
      setUnitMissions(data);
    } catch (error) {
      toast.error('No se pudieron cargar las misiones');
    }
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    fetchUnitMissions(unit.unitId);
    setDetailOpen(true);
  };

  const handleEdit = (unitId: string) => {
    setDetailOpen(false);
    setEditingUnitId(unitId);
    setShowEditForm(true);
  };

  const domains = ['all', 'naval', 'aeronaval', 'land', 'air', 'submarine'];

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'naval': return <Ship className="w-4 h-4" />;
      case 'aeronaval':
      case 'air': return <Plane className="w-4 h-4" />;
      case 'land': return <Truck className="w-4 h-4" />;
      default: return <Crosshair className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activo': return 'bg-green-500';
      case 'inactivo': return 'bg-gray-500';
      case 'mantenimiento': return 'bg-yellow-500';
      case 'desplegado': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };
  const handleDelete = async (unitId: string, unitName: string) => {
  const confirmed = window.confirm(`¿Estás seguro de eliminar la unidad "${unitName}"?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/units/${unitId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar unidad');
    
    toast.success('Unidad eliminada correctamente');
    // Actualizar lista después de eliminar
    setDetailOpen(false);
    fetchUnits();  // recarga la lista
  } catch (error) {
    toast.error('Error al eliminar la unidad');
  }
};
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Unidades</h1>
          <p className="text-muted-foreground">
            Explora todas las unidades disponibles en la base de datos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUnits}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Unidad
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ID o país..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Dominio" />
          </SelectTrigger>
          <SelectContent>
            {domains.map(d => (
              <SelectItem key={d} value={d}>
                {d === 'all' ? 'Todos los dominios' : d.charAt(0).toUpperCase() + d.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de unidades */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron unidades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <Card key={unit._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleUnitClick(unit)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getDomainIcon(unit.domain)}
                    <CardTitle className="text-lg">{unit.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{unit.unitId}</Badge>
                </div>
                <CardDescription>
                  {unit.class} • {unit.country} {unit.flag && `(${unit.flag})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Activity className="w-3 h-3" />
                  <span className="capitalize">{unit.role || unit.type}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(unit.status)}>
                    <span className="text-white capitalize">{unit.status || 'desconocido'}</span>
                  </Badge>
                  <Badge variant="secondary">
                    {unit.sensors?.length || 0} sensores
                  </Badge>
                  <Badge variant="secondary">
                    {unit.armament?.length || 0} armas
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleUnitClick(unit); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles con BiggerCard */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Detalles de {selectedUnit?.name || 'unidad'}
          </DialogTitle>

          {selectedUnit && (
            <BiggerCard
              unit={selectedUnit}
              missions={unitMissions}
              onClose={() => setDetailOpen(false)}
              onEdit={() => handleEdit(selectedUnit._id)}
              onDelete={() => handleDelete(selectedUnit._id, selectedUnit.name)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para crear nueva unidad */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Crear Nueva Unidad</DialogTitle>
          <CreateUnitForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchUnits();
              toast.success('Unidad creada correctamente');
            }}
            onCancel={() => setShowCreateForm(false)}
            
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar unidad */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Editar Unidad</DialogTitle>
          {editingUnitId && (
            <EditUnitForm
              unitId={editingUnitId}
              onSuccess={() => {
                setShowEditForm(false);
                fetchUnits();
                toast.success('Unidad actualizada correctamente');
              }}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}