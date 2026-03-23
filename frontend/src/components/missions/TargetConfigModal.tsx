// components/missions/TargetConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Target {
  id?: number;
  detection_id?: number;
  name: string;
  country?: string;
  type?: string;
  affiliation?: string;
  coordinates?: string;
  lat?: number;
  lon?: number;
  matricula?: string;
  imo?: string;
  height?: number;
  assigned_sensors?: string[];
}

interface DbHostile {
  _id: string;
  unitId: string;
  name: string;
  class: string;
  country: string;
  flag: string;
  type: string;
  role: string;
  status: string;
  sensors?: any[];
  armament?: any[];
  domain?: string;
}

interface TargetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: any[]; // objetivos ya asignados a la unidad
  onUpdateTargets: (targets: any[]) => void;
  unitType: string;
  unitName: string;
}

export const TargetConfigModal: React.FC<TargetConfigModalProps> = ({
  isOpen, onClose, targets, onUpdateTargets, unitType, unitName
}) => {
  const [selectedTargets, setSelectedTargets] = useState<any[]>(targets || []);
  const [availableTargets, setAvailableTargets] = useState<Target[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'hostile'>('list');
  const [newTarget, setNewTarget] = useState({
    name: '',
    country: '',
    type: '',
    affiliation: 'NEUTRAL',
    lat: '',
    lon: '',
    matricula: '',
    imo: '',
    height: 0,
  });

  // Estados para los hostiles de la BD
  const [hostiles, setHostiles] = useState<DbHostile[]>([]);
  const [hostileSearchTerm, setHostileSearchTerm] = useState('');
  const [isLoadingHostiles, setIsLoadingHostiles] = useState(false);
  const [hostileError, setHostileError] = useState<string | null>(null);

  const affiliationOptions = ['FRIENDLY', 'NEUTRAL', 'HOSTILE', 'UNKNOWN'];
  const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  // Cargar objetivos desde archivos (misma lógica que el original)
  useEffect(() => {
    if (isOpen) loadTargets();
  }, [isOpen]);

  // Cargar hostiles desde el backend cuando se abre la pestaña correspondiente
  useEffect(() => {
    if (isOpen && activeTab === 'hostile') {
      loadHostiles();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    setSelectedTargets(targets || []);
  }, [targets]);

  const loadTargets = async () => {
    setIsLoading(true);
    try {
      // Intenta cargar desde /data/detections/*.json (ajusta según tu backend)
      let targetsData = [];
      try {
        const indexResponse = await fetch('/data/detections/index.json');
        if (indexResponse.ok) {
          const indexData = await indexResponse.json();
          if (indexData.files && Array.isArray(indexData.files)) {
            const promises = indexData.files.map(async (filename: string) => {
              try {
                const res = await fetch(`/data/detections/${filename}`);
                if (res.ok) return await res.json();
              } catch { }
              return null;
            });
            const results = await Promise.all(promises);
            targetsData = results.filter(Boolean).flat();
          }
        }
      } catch { /* ignora */ }

      // Si no se encontró, usar datos de ejemplo
      if (targetsData.length === 0) {
        targetsData = [
          { id: 1, detection_id: 3001, name: 'Buque sospechoso', country: 'DESCONOCIDO', type: 'naval', affiliation: 'HOSTILE', coordinates: '36.2345,-5.6789', matricula: '12546565453215465', imo: '2131231231231', height: 270 },
          { id: 2, detection_id: 3002, name: 'Pesquero irregular', country: 'MARRUECOS', type: 'naval', affiliation: 'NEUTRAL', coordinates: '36.1234,-5.4321' },
          { id: 3, detection_id: 3003, name: 'Patrullera costera', country: 'ESPAÑA', type: 'naval', affiliation: 'FRIENDLY', coordinates: '36.3456,-5.7890' },
          { id: 4, detection_id: 3015, name: 'Submarino no identificado', country: 'DESCONOCIDO', type: 'submarine', affiliation: 'HOSTILE', coordinates: '36.4567,-5.8901', height: -160 },
        ];
      }

      // Formatear los objetivos
      const formatted = targetsData.map((t: any) => ({
        id: t.id || t.detection_id,
        detection_id: t.detection_id || t.id,
        name: t.name || t.target_name || 'Desconocido',
        country: t.country || '',
        type: t.type || t.class_type || '',
        affiliation: t.affiliation || 'UNKNOWN',
        coordinates: t.coordinates || (t.lat && t.lon ? `${t.lat},${t.lon}` : ''),
        lat: t.lat || (t.coordinates ? parseFloat(t.coordinates.split(',')[0]) : undefined),
        lon: t.lon || (t.coordinates ? parseFloat(t.coordinates.split(',')[1]) : undefined),
        matricula: t.matricula || '',
        imo: t.imo || '',
        height: t.height || 0,
      }));

      setAvailableTargets(formatted);
    } catch (error) {
      console.error('Error loading targets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHostiles = async () => {
    setIsLoadingHostiles(true);
    setHostileError(null);
    try {
      const url = `${API_BASE_URL}/api/hostile`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setHostiles(data);
    } catch (err) {
      console.error('Error loading hostiles:', err);
      setHostileError('Error al cargar hostiles. Verifique la conexión con el backend.');
    } finally {
      setIsLoadingHostiles(false);
    }
  };

  const handleSelectTarget = (target: Target) => {
    if (!selectedTargets.some(t => t.detection_id === target.detection_id || t.id === target.id)) {
      setSelectedTargets([...selectedTargets, target]);
    }
  };

  const handleSelectHostile = (dbHostile: DbHostile) => {
    const newTarget: Target = {
      id: Date.now(),
      detection_id: parseInt(dbHostile._id, 36) || Date.now(),
      name: dbHostile.name,
      country: dbHostile.country,
      type: dbHostile.type,
      affiliation: 'HOSTILE',
      coordinates: '',
      lat: undefined,
      lon: undefined,
      matricula: '',
      imo: '',
      height: 0,
      assigned_sensors: [],
    };
    if (!selectedTargets.some(t => t.detection_id === newTarget.detection_id)) {
      setSelectedTargets([...selectedTargets, newTarget]);
    }
  };

  const handleRemoveTarget = (id?: number) => {
    setSelectedTargets(selectedTargets.filter(t => t.id !== id && t.detection_id !== id));
  };

  const handleCreateTarget = () => {
    if (!newTarget.name) return;
    const created = {
      id: Date.now(),
      detection_id: Date.now(),
      name: newTarget.name,
      country: newTarget.country,
      type: newTarget.type,
      affiliation: newTarget.affiliation,
      coordinates: newTarget.lat && newTarget.lon ? `${newTarget.lat},${newTarget.lon}` : '',
      lat: parseFloat(newTarget.lat) || 0,
      lon: parseFloat(newTarget.lon) || 0,
      matricula: newTarget.matricula,
      imo: newTarget.imo,
      height: newTarget.height,
    };
    setSelectedTargets([...selectedTargets, created]);
    setActiveTab('list');
    setNewTarget({ name: '', country: '', type: '', affiliation: 'NEUTRAL', lat: '', lon: '', matricula: '', imo: '', height: 0 });
  };

  const handleSave = () => {
    onUpdateTargets(selectedTargets);
    onClose();
  };

  const filteredTargets = availableTargets.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHostiles = hostiles.filter(h =>
    h.name.toLowerCase().includes(hostileSearchTerm.toLowerCase()) ||
    h.unitId.toLowerCase().includes(hostileSearchTerm.toLowerCase()) ||
    h.country.toLowerCase().includes(hostileSearchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configurar objetivos - {unitName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'new' | 'hostile')} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="list">Seleccionar existentes</TabsTrigger>
            <TabsTrigger value="new">Crear nuevo</TabsTrigger>
            <TabsTrigger value="hostile">Hostiles (BD)</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar objetivos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8">Cargando objetivos...</div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredTargets.map(target => {
                    const isSelected = selectedTargets.some(t => t.id === target.id || t.detection_id === target.detection_id);
                    return (
                      <div
                        key={target.id}
                        className={`p-3 border rounded cursor-pointer transition flex justify-between items-center ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectTarget(target)}
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                target.affiliation === 'HOSTILE' ? 'bg-red-500' :
                                target.affiliation === 'FRIENDLY' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`}
                            />
                            {target.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {target.country} • {target.type} • {target.coordinates}
                          </div>
                        </div>
                        {isSelected && <Badge>Seleccionado</Badge>}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="new">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={newTarget.name}
                    onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                    placeholder="Ej: Buque nodriza"
                  />
                </div>
                <div>
                  <Label>País</Label>
                  <Input
                    value={newTarget.country}
                    onChange={(e) => setNewTarget({ ...newTarget, country: e.target.value })}
                    placeholder="ESPAÑA"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input
                    value={newTarget.type}
                    onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value })}
                    placeholder="naval, aéreo, etc."
                  />
                </div>
                <div>
                  <Label>Afiliación</Label>
                  <Select
                    value={newTarget.affiliation}
                    onValueChange={(v) => setNewTarget({ ...newTarget, affiliation: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {affiliationOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Latitud</Label>
                  <Input
                    value={newTarget.lat}
                    onChange={(e) => setNewTarget({ ...newTarget, lat: e.target.value })}
                    placeholder="36.5"
                  />
                </div>
                <div>
                  <Label>Longitud</Label>
                  <Input
                    value={newTarget.lon}
                    onChange={(e) => setNewTarget({ ...newTarget, lon: e.target.value })}
                    placeholder="-5.5"
                  />
                </div>
                <div>
                  <Label>Matrícula</Label>
                  <Input
                    value={newTarget.matricula}
                    onChange={(e) => setNewTarget({ ...newTarget, matricula: e.target.value })}
                  />
                </div>
                <div>
                  <Label>IMO</Label>
                  <Input
                    value={newTarget.imo}
                    onChange={(e) => setNewTarget({ ...newTarget, imo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Altura (m)</Label>
                  <Input
                    type="number"
                    value={newTarget.height}
                    onChange={(e) => setNewTarget({ ...newTarget, height: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateTarget} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Crear objetivo y añadir
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="hostile" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hostiles..."
                className="pl-10"
                value={hostileSearchTerm}
                onChange={(e) => setHostileSearchTerm(e.target.value)}
              />
            </div>

            {isLoadingHostiles ? (
              <div className="text-center py-8">Cargando hostiles...</div>
            ) : hostileError ? (
              <div className="text-center py-8 text-red-500">{hostileError}</div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredHostiles.map((hostile) => {
                    const isSelected = selectedTargets.some(t => t.detection_id === parseInt(hostile._id, 36) || t.name === hostile.name);
                    return (
                      <div
                        key={hostile._id}
                        className={`p-3 border rounded cursor-pointer transition flex justify-between items-center ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectHostile(hostile)}
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {hostile.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hostile.unitId} · {hostile.type} · {hostile.country}
                            {hostile.domain && <span> · {hostile.domain}</span>}
                          </div>
                        </div>
                        {isSelected && <Badge>Seleccionado</Badge>}
                      </div>
                    );
                  })}
                  {filteredHostiles.length === 0 && !isLoadingHostiles && (
                    <p className="text-center text-muted-foreground">No se encontraron hostiles</p>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Lista de objetivos seleccionados */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Objetivos asignados ({selectedTargets.length})</h4>
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {selectedTargets.map((target, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{target.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {target.affiliation} • {target.country}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTarget(target.id || target.detection_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {selectedTargets.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Ningún objetivo asignado.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar objetivos</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};