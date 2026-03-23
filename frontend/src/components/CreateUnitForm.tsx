// frontend/components/CreateUnitForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Ship, Plane, Truck, Crosshair, Plus, X } from 'lucide-react';

interface CreateUnitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  entityType?: 'units' | 'hostile';
}

interface Identifiers {
  mmsi?: string;
  imo?: string;
  callsign?: string;
  hullNumber?: string;
  registration?: string;
  serialNumber?: string;
  tailNumber?: string;
  licensePlate?: string;
}

interface Builder {
  shipyard?: string;
  location?: string;
  laidDown?: string;
  launched?: string;
  commissioned?: string;
  cost?: { value?: number; currency?: string };
}

interface Displacement {
  standard?: number;
  full?: number;
  unit?: string;
}

interface Dimensions {
  length?: { overall?: number; waterline?: number };
  beam?: { overall?: number; waterline?: number };
  draft?: { max?: number };
  height?: number;
  unit?: string;
}

interface Propulsion {
  system?: string;
  machinery?: Array<{ type?: string; model?: string; manufacturer?: string; quantity?: number; power?: number; powerUnit?: string }>;
  propellers?: string;
  bowThruster?: { power?: number; powerUnit?: string };
  notes?: string;
}

interface Performance {
  speed?: { max?: number; cruise?: number; economic?: number; unit?: string };
  range?: Array<{ value?: number; atSpeed?: number; unit?: string }>;
  endurance?: string;
  seakeeping?: string;
}

interface Complement {
  crew?: number;
  airWing?: number;
  troops?: number;
  flagshipStaff?: number;
  maxCapacity?: number;
  notes?: string;
}

interface Aviation {
  maxAircraft?: number;
  hangar?: { capacity?: { helicopters?: number; fighters?: number } };
  flightDeck?: { type?: string; spots?: number; skiJumpAngle?: number };
}

interface Communications {
  satcom?: string[];
  dataLinks?: string[];
  secureComms?: boolean;
  notes?: string;
}

interface History {
  keelLaid?: string;
  launched?: string;
  commissioned?: string;
  decommissioned?: string;
  majorEvents?: Array<{ event: string; date: string; location?: string }>;
}

interface Metadata {
  sources?: string[];
  dataQuality?: string;
}

export function CreateUnitForm({ onSuccess, onCancel, entityType = 'units' }: CreateUnitFormProps) {
  const [domain, setDomain] = useState<string>('naval');
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic fields
    unitId: '',
    name: '',
    country: '',
    flag: '',
    type: '',
    role: '',
    class: '',
    status: 'activo',
    description: '',
    // Identifiers
    identifiers: {} as Identifiers,
    // Naval info
    homeport: '',
    currentBase: '',
    fleet: '',
    squadron: '',
    // Arrays (weapons, sensors, etc.)
    armament: [] as any[],
    sensors: [] as any[],
    countermeasures: [] as any[],
    // Media
    images: [] as string[],
    videos: [] as string[],
    // Technical fields
    builder: {} as Builder,
    displacement: {} as Displacement,
    dimensions: {} as Dimensions,
    propulsion: {} as Propulsion,
    performance: {} as Performance,
    complement: {} as Complement,
    aviation: {} as Aviation,
    communications: {} as Communications,
    history: {} as History,
    metadata: { sources: ['Usuario'], dataQuality: 'media' } as Metadata,
  });

  // Handlers for simple fields
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for nested objects (one level deep)
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  // Handler for deeper nesting (e.g., dimensions.length.overall)
  const handleDeepNestedChange = (parent: string, child: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: { ...prev[parent][child], [field]: value }
      }
    }));
  };

  // Add item to an array inside a nested object
  const handleArrayItemAdd = (parent: string, arrayField: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [arrayField]: [...(prev[parent][arrayField] || []), item]
      }
    }));
  };

  // Remove item from an array inside a nested object
  const handleArrayItemRemove = (parent: string, arrayField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [arrayField]: (prev[parent][arrayField] || []).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  // Handler for identifiers
  const handleIdentifierChange = (field: keyof Identifiers, value: string) => {
    setFormData(prev => ({
      ...prev,
      identifiers: { ...prev.identifiers, [field]: value }
    }));
  };

  // File upload handlers
  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error uploading file');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
      toast.error(`Error al subir ${file.name}`);
      return null;
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'image');
      if (url) newUrls.push(url);
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newUrls]
    }));
    setUploading(false);
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'video');
      if (url) newUrls.push(url);
    }
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...newUrls]
    }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/${entityType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, domain })
      });

      if (!response.ok) throw new Error('Error al crear unidad');

      toast.success('Unidad creada correctamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear la unidad');
    }
  };

  // ========== Technical section renderers ==========
  const renderBuilderFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Astillero</Label>
        <Input value={formData.builder.shipyard || ''} onChange={e => handleNestedChange('builder', 'shipyard', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Ubicación</Label>
        <Input value={formData.builder.location || ''} onChange={e => handleNestedChange('builder', 'location', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fecha quilla</Label>
        <Input type="date" value={formData.builder.laidDown || ''} onChange={e => handleNestedChange('builder', 'laidDown', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fecha botadura</Label>
        <Input type="date" value={formData.builder.launched || ''} onChange={e => handleNestedChange('builder', 'launched', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fecha alta</Label>
        <Input type="date" value={formData.builder.commissioned || ''} onChange={e => handleNestedChange('builder', 'commissioned', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Costo</Label>
        <div className="flex gap-2">
          <Input placeholder="Valor" value={formData.builder.cost?.value || ''} onChange={e => handleDeepNestedChange('builder', 'cost', 'value', e.target.value)} />
          <Input placeholder="Moneda" value={formData.builder.cost?.currency || ''} onChange={e => handleDeepNestedChange('builder', 'cost', 'currency', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderDisplacementFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Desplazamiento estándar (t)</Label>
        <Input type="number" value={formData.displacement.standard || ''} onChange={e => handleNestedChange('displacement', 'standard', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Desplazamiento a plena carga (t)</Label>
        <Input type="number" value={formData.displacement.full || ''} onChange={e => handleNestedChange('displacement', 'full', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Unidad (opcional)</Label>
        <Input placeholder="t" value={formData.displacement.unit || ''} onChange={e => handleNestedChange('displacement', 'unit', e.target.value)} />
      </div>
    </div>
  );

  const renderDimensionsFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Eslora total (m)</Label>
        <Input type="number" value={formData.dimensions.length?.overall || ''} onChange={e => handleDeepNestedChange('dimensions', 'length', 'overall', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Eslora línea flotación (m)</Label>
        <Input type="number" value={formData.dimensions.length?.waterline || ''} onChange={e => handleDeepNestedChange('dimensions', 'length', 'waterline', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Manga total (m)</Label>
        <Input type="number" value={formData.dimensions.beam?.overall || ''} onChange={e => handleDeepNestedChange('dimensions', 'beam', 'overall', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Manga línea flotación (m)</Label>
        <Input type="number" value={formData.dimensions.beam?.waterline || ''} onChange={e => handleDeepNestedChange('dimensions', 'beam', 'waterline', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Calado máximo (m)</Label>
        <Input type="number" value={formData.dimensions.draft?.max || ''} onChange={e => handleDeepNestedChange('dimensions', 'draft', 'max', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Altura (m)</Label>
        <Input type="number" value={formData.dimensions.height || ''} onChange={e => handleNestedChange('dimensions', 'height', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Unidad (opcional)</Label>
        <Input placeholder="m" value={formData.dimensions.unit || ''} onChange={e => handleNestedChange('dimensions', 'unit', e.target.value)} />
      </div>
    </div>
  );

  const renderPropulsionFields = () => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Sistema de propulsión</Label>
          <Input value={formData.propulsion.system || ''} onChange={e => handleNestedChange('propulsion', 'system', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hélices</Label>
          <Input value={formData.propulsion.propellers || ''} onChange={e => handleNestedChange('propulsion', 'propellers', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Bow thruster potencia (kW)</Label>
          <Input type="number" value={formData.propulsion.bowThruster?.power || ''} onChange={e => handleDeepNestedChange('propulsion', 'bowThruster', 'power', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Unidad bow thruster</Label>
          <Input placeholder="kW" value={formData.propulsion.bowThruster?.powerUnit || ''} onChange={e => handleDeepNestedChange('propulsion', 'bowThruster', 'powerUnit', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notas propulsión</Label>
        <Textarea value={formData.propulsion.notes || ''} onChange={e => handleNestedChange('propulsion', 'notes', e.target.value)} />
      </div>
      <div>
        <Label>Maquinaria</Label>
        {formData.propulsion.machinery?.map((m, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2 p-2 border rounded">
            <Input placeholder="Tipo" value={m.type || ''} onChange={e => {
              const newMachinery = [...(formData.propulsion.machinery || [])];
              newMachinery[idx] = { ...newMachinery[idx], type: e.target.value };
              handleNestedChange('propulsion', 'machinery', newMachinery);
            }} />
            <Input placeholder="Modelo" value={m.model || ''} onChange={e => {
              const newMachinery = [...(formData.propulsion.machinery || [])];
              newMachinery[idx] = { ...newMachinery[idx], model: e.target.value };
              handleNestedChange('propulsion', 'machinery', newMachinery);
            }} />
            <Input placeholder="Fabricante" value={m.manufacturer || ''} onChange={e => {
              const newMachinery = [...(formData.propulsion.machinery || [])];
              newMachinery[idx] = { ...newMachinery[idx], manufacturer: e.target.value };
              handleNestedChange('propulsion', 'machinery', newMachinery);
            }} />
            <Input placeholder="Cantidad" type="number" value={m.quantity || ''} onChange={e => {
              const newMachinery = [...(formData.propulsion.machinery || [])];
              newMachinery[idx] = { ...newMachinery[idx], quantity: parseInt(e.target.value) };
              handleNestedChange('propulsion', 'machinery', newMachinery);
            }} />
            <Input placeholder="Potencia (kW)" value={m.power || ''} onChange={e => {
              const newMachinery = [...(formData.propulsion.machinery || [])];
              newMachinery[idx] = { ...newMachinery[idx], power: parseInt(e.target.value), powerUnit: 'kW' };
              handleNestedChange('propulsion', 'machinery', newMachinery);
            }} />
            <Button variant="ghost" size="sm" onClick={() => handleArrayItemRemove('propulsion', 'machinery', idx)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleArrayItemAdd('propulsion', 'machinery', {})}>
          <Plus className="h-4 w-4 mr-1" /> Añadir maquinaria
        </Button>
      </div>
    </div>
  );

  const renderPerformanceFields = () => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Velocidad máxima</Label>
          <div className="flex gap-2">
            <Input type="number" placeholder="Valor" value={formData.performance.speed?.max || ''} onChange={e => handleDeepNestedChange('performance', 'speed', 'max', e.target.value)} />
            <Input placeholder="Unidad" value={formData.performance.speed?.unit || ''} onChange={e => handleDeepNestedChange('performance', 'speed', 'unit', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Velocidad crucero</Label>
          <Input type="number" value={formData.performance.speed?.cruise || ''} onChange={e => handleDeepNestedChange('performance', 'speed', 'cruise', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Velocidad económica</Label>
          <Input type="number" value={formData.performance.speed?.economic || ''} onChange={e => handleDeepNestedChange('performance', 'speed', 'economic', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Autonomía</Label>
          <Input value={formData.performance.endurance || ''} onChange={e => handleNestedChange('performance', 'endurance', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Comportamiento mar</Label>
          <Input value={formData.performance.seakeeping || ''} onChange={e => handleNestedChange('performance', 'seakeeping', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Rangos</Label>
        {formData.performance.range?.map((r, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 mt-2 p-2 border rounded">
            <Input placeholder="Valor" type="number" value={r.value || ''} onChange={e => {
              const newRange = [...(formData.performance.range || [])];
              newRange[idx] = { ...newRange[idx], value: parseInt(e.target.value) };
              handleNestedChange('performance', 'range', newRange);
            }} />
            <Input placeholder="Unidad" value={r.unit || ''} onChange={e => {
              const newRange = [...(formData.performance.range || [])];
              newRange[idx] = { ...newRange[idx], unit: e.target.value };
              handleNestedChange('performance', 'range', newRange);
            }} />
            <Input placeholder="A velocidad (kn)" type="number" value={r.atSpeed || ''} onChange={e => {
              const newRange = [...(formData.performance.range || [])];
              newRange[idx] = { ...newRange[idx], atSpeed: parseInt(e.target.value) };
              handleNestedChange('performance', 'range', newRange);
            }} />
            <Button variant="ghost" size="sm" onClick={() => handleArrayItemRemove('performance', 'range', idx)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleArrayItemAdd('performance', 'range', {})}>
          <Plus className="h-4 w-4 mr-1" /> Añadir rango
        </Button>
      </div>
    </div>
  );

  const renderComplementFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Tripulación</Label>
        <Input type="number" value={formData.complement.crew || ''} onChange={e => handleNestedChange('complement', 'crew', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Ala aérea</Label>
        <Input type="number" value={formData.complement.airWing || ''} onChange={e => handleNestedChange('complement', 'airWing', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Tropas</Label>
        <Input type="number" value={formData.complement.troops || ''} onChange={e => handleNestedChange('complement', 'troops', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Estado Mayor</Label>
        <Input type="number" value={formData.complement.flagshipStaff || ''} onChange={e => handleNestedChange('complement', 'flagshipStaff', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Capacidad máxima</Label>
        <Input type="number" value={formData.complement.maxCapacity || ''} onChange={e => handleNestedChange('complement', 'maxCapacity', e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-3">
        <Label>Notas</Label>
        <Input value={formData.complement.notes || ''} onChange={e => handleNestedChange('complement', 'notes', e.target.value)} />
      </div>
    </div>
  );

  const renderAviationFields = () => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Máx. aeronaves</Label>
          <Input type="number" value={formData.aviation.maxAircraft || ''} onChange={e => handleNestedChange('aviation', 'maxAircraft', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Helicópteros en hangar</Label>
          <Input type="number" value={formData.aviation.hangar?.capacity?.helicopters || ''} onChange={e => handleDeepNestedChange('aviation', 'hangar', 'capacity', { ...(formData.aviation.hangar?.capacity || {}), helicopters: parseInt(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Cazas en hangar</Label>
          <Input type="number" value={formData.aviation.hangar?.capacity?.fighters || ''} onChange={e => handleDeepNestedChange('aviation', 'hangar', 'capacity', { ...(formData.aviation.hangar?.capacity || {}), fighters: parseInt(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo cubierta vuelo</Label>
          <Input value={formData.aviation.flightDeck?.type || ''} onChange={e => handleDeepNestedChange('aviation', 'flightDeck', 'type', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Spots</Label>
          <Input type="number" value={formData.aviation.flightDeck?.spots || ''} onChange={e => handleDeepNestedChange('aviation', 'flightDeck', 'spots', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Ángulo ski-jump</Label>
          <Input type="number" value={formData.aviation.flightDeck?.skiJumpAngle || ''} onChange={e => handleDeepNestedChange('aviation', 'flightDeck', 'skiJumpAngle', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderCommunicationsFields = () => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>SATCOM</Label>
          <div className="flex flex-wrap gap-2">
            {formData.communications.satcom?.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1 border rounded px-2 py-1">
                <span>{s}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  const newSatcom = [...(formData.communications.satcom || [])];
                  newSatcom.splice(idx, 1);
                  handleNestedChange('communications', 'satcom', newSatcom);
                }} />
              </div>
            ))}
            <Input className="w-32" placeholder="Nuevo" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                const newSatcom = [...(formData.communications.satcom || []), e.currentTarget.value];
                handleNestedChange('communications', 'satcom', newSatcom);
                e.currentTarget.value = '';
              }
            }} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Data Links</Label>
          <div className="flex flex-wrap gap-2">
            {formData.communications.dataLinks?.map((dl, idx) => (
              <div key={idx} className="flex items-center gap-1 border rounded px-2 py-1">
                <span>{dl}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  const newDataLinks = [...(formData.communications.dataLinks || [])];
                  newDataLinks.splice(idx, 1);
                  handleNestedChange('communications', 'dataLinks', newDataLinks);
                }} />
              </div>
            ))}
            <Input className="w-32" placeholder="Nuevo" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                const newDataLinks = [...(formData.communications.dataLinks || []), e.currentTarget.value];
                handleNestedChange('communications', 'dataLinks', newDataLinks);
                e.currentTarget.value = '';
              }
            }} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Comunicaciones seguras</Label>
          <Select value={formData.communications.secureComms ? 'true' : 'false'} onValueChange={v => handleNestedChange('communications', 'secureComms', v === 'true')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notas</Label>
          <Input value={formData.communications.notes || ''} onChange={e => handleNestedChange('communications', 'notes', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderHistoryFields = () => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Quilla puesta</Label>
          <Input type="date" value={formData.history.keelLaid || ''} onChange={e => handleNestedChange('history', 'keelLaid', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Botadura</Label>
          <Input type="date" value={formData.history.launched || ''} onChange={e => handleNestedChange('history', 'launched', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Alta</Label>
          <Input type="date" value={formData.history.commissioned || ''} onChange={e => handleNestedChange('history', 'commissioned', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Baja</Label>
          <Input type="date" value={formData.history.decommissioned || ''} onChange={e => handleNestedChange('history', 'decommissioned', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Eventos destacados</Label>
        {formData.history.majorEvents?.map((ev, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 p-2 border rounded">
            <Input placeholder="Evento" value={ev.event || ''} onChange={e => {
              const newEvents = [...(formData.history.majorEvents || [])];
              newEvents[idx] = { ...newEvents[idx], event: e.target.value };
              handleNestedChange('history', 'majorEvents', newEvents);
            }} />
            <Input placeholder="Fecha" type="date" value={ev.date || ''} onChange={e => {
              const newEvents = [...(formData.history.majorEvents || [])];
              newEvents[idx] = { ...newEvents[idx], date: e.target.value };
              handleNestedChange('history', 'majorEvents', newEvents);
            }} />
            <Input placeholder="Ubicación" value={ev.location || ''} onChange={e => {
              const newEvents = [...(formData.history.majorEvents || [])];
              newEvents[idx] = { ...newEvents[idx], location: e.target.value };
              handleNestedChange('history', 'majorEvents', newEvents);
            }} />
            <Button variant="ghost" size="sm" onClick={() => handleArrayItemRemove('history', 'majorEvents', idx)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleArrayItemAdd('history', 'majorEvents', {})}>
          <Plus className="h-4 w-4 mr-1" /> Añadir evento
        </Button>
      </div>
    </div>
  );

  const renderMetadataFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Fuentes (separadas por coma)</Label>
        <Input value={formData.metadata.sources?.join(', ') || ''} onChange={e => handleNestedChange('metadata', 'sources', e.target.value.split(',').map(s => s.trim()))} />
      </div>
      <div className="space-y-2">
        <Label>Calidad datos</Label>
        <Select value={formData.metadata.dataQuality || 'media'} onValueChange={v => handleNestedChange('metadata', 'dataQuality', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getDomainIcon = (d: string) => {
    switch (d) {
      case 'naval': return <Ship className="w-5 h-5" />;
      case 'submarine': return <Ship className="w-5 h-5" />;
      case 'air':
      case 'aeronaval': return <Plane className="w-5 h-5" />;
      case 'land': return <Truck className="w-5 h-5" />;
      default: return <Crosshair className="w-5 h-5" />;
    }
  };

  const renderIdentifierFields = () => {
    switch (domain) {
      case 'naval':
      case 'submarine':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label>MMSI</Label><Input value={formData.identifiers.mmsi || ''} onChange={e => handleIdentifierChange('mmsi', e.target.value)} /></div>
            <div className="space-y-2"><Label>IMO</Label><Input value={formData.identifiers.imo || ''} onChange={e => handleIdentifierChange('imo', e.target.value)} /></div>
            <div className="space-y-2"><Label>Callsign</Label><Input value={formData.identifiers.callsign || ''} onChange={e => handleIdentifierChange('callsign', e.target.value)} /></div>
            <div className="space-y-2"><Label>Hull Number</Label><Input value={formData.identifiers.hullNumber || ''} onChange={e => handleIdentifierChange('hullNumber', e.target.value)} /></div>
          </div>
        );
      case 'air':
      case 'aeronaval':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Tail Number</Label><Input value={formData.identifiers.tailNumber || ''} onChange={e => handleIdentifierChange('tailNumber', e.target.value)} /></div>
            <div className="space-y-2"><Label>Callsign</Label><Input value={formData.identifiers.callsign || ''} onChange={e => handleIdentifierChange('callsign', e.target.value)} /></div>
            <div className="space-y-2"><Label>Serial Number</Label><Input value={formData.identifiers.serialNumber || ''} onChange={e => handleIdentifierChange('serialNumber', e.target.value)} /></div>
            <div className="space-y-2"><Label>Registration</Label><Input value={formData.identifiers.registration || ''} onChange={e => handleIdentifierChange('registration', e.target.value)} /></div>
          </div>
        );
      case 'land':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label>License Plate</Label><Input value={formData.identifiers.licensePlate || ''} onChange={e => handleIdentifierChange('licensePlate', e.target.value)} /></div>
            <div className="space-y-2"><Label>Serial Number</Label><Input value={formData.identifiers.serialNumber || ''} onChange={e => handleIdentifierChange('serialNumber', e.target.value)} /></div>
            <div className="space-y-2"><Label>Registration</Label><Input value={formData.identifiers.registration || ''} onChange={e => handleIdentifierChange('registration', e.target.value)} /></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-2">
      {/* Dominio */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold">Dominio</Label>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="h-14 text-base"><SelectValue placeholder="Selecciona dominio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="naval"><div className="flex items-center gap-3"><Ship className="w-5 h-5" /> Naval</div></SelectItem>
            <SelectItem value="submarine"><div className="flex items-center gap-3"><Ship className="w-5 h-5" /> Submarino</div></SelectItem>
            <SelectItem value="air"><div className="flex items-center gap-3"><Plane className="w-5 h-5" /> Aire</div></SelectItem>
            <SelectItem value="aeronaval"><div className="flex items-center gap-3"><Plane className="w-5 h-5" /> Aeronaval</div></SelectItem>
            <SelectItem value="land"><div className="flex items-center gap-3"><Truck className="w-5 h-5" /> Tierra</div></SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-14">
          <TabsTrigger value="basic" className="text-base">Básico</TabsTrigger>
          <TabsTrigger value="identifiers" className="text-base">Identificadores</TabsTrigger>
          <TabsTrigger value="technical" className="text-base">Técnico</TabsTrigger>
          <TabsTrigger value="media" className="text-base">Multimedia</TabsTrigger>
        </TabsList>

        {/* ===================== Pestaña Básico ===================== */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Unit ID *</Label>
              <Input
                required
                className="h-12 text-base"
                placeholder="L-61"
                value={formData.unitId}
                onChange={(e) => handleChange('unitId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Nombre *</Label>
              <Input
                required
                className="h-12 text-base"
                placeholder="Juan Carlos I"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">País *</Label>
              <Input
                required
                className="h-12 text-base"
                placeholder="España"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Flag (código)</Label>
              <Input
                className="h-12 text-base"
                placeholder="ESP"
                value={formData.flag}
                onChange={(e) => handleChange('flag', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Tipo</Label>
              <Input
                className="h-12 text-base"
                placeholder="LHD / Fragata / Carro"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Rol</Label>
              <Input
                className="h-12 text-base"
                placeholder="Buque de proyección"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Clase</Label>
              <Input
                className="h-12 text-base"
                placeholder="Juan Carlos I"
                value={formData.class}
                onChange={(e) => handleChange('class', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Estado</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo" className="py-3 text-base">Activo</SelectItem>
                  <SelectItem value="mantenimiento" className="py-3 text-base">Mantenimiento</SelectItem>
                  <SelectItem value="desplegado" className="py-3 text-base">Desplegado</SelectItem>
                  <SelectItem value="inactivo" className="py-3 text-base">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Descripción</Label>
            <Textarea
              className="min-h-[120px] text-base"
              placeholder="Descripción de la unidad..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Campos específicos de dominio naval */}
          {(domain === 'naval' || domain === 'submarine') && (
            <Card className="border-2">
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold">Información naval</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Puerto base</Label>
                    <Input
                      className="h-12 text-base"
                      placeholder="Rota, Cádiz"
                      value={formData.homeport}
                      onChange={(e) => handleChange('homeport', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Base actual</Label>
                    <Input
                      className="h-12 text-base"
                      placeholder="Rota, Cádiz"
                      value={formData.currentBase}
                      onChange={(e) => handleChange('currentBase', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Flota</Label>
                    <Input
                      className="h-12 text-base"
                      placeholder="Flota"
                      value={formData.fleet}
                      onChange={(e) => handleChange('fleet', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Escuadrón</Label>
                    <Input
                      className="h-12 text-base"
                      placeholder="2ª Escuadrilla"
                      value={formData.squadron}
                      onChange={(e) => handleChange('squadron', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===================== Pestaña Identificadores ===================== */}
        <TabsContent value="identifiers" className="space-y-6 mt-6">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                {getDomainIcon(domain)}
                <h3 className="text-lg font-semibold">Identificadores para dominio: {domain}</h3>
              </div>
              {renderIdentifierFields()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== Pestaña Técnico ===================== */}
        <TabsContent value="technical" className="space-y-8 mt-6">
          <div className="space-y-6">
            <div className="space-y-2"><Label className="text-lg font-semibold">Constructor</Label>{renderBuilderFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Desplazamiento</Label>{renderDisplacementFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Dimensiones</Label>{renderDimensionsFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Propulsión</Label>{renderPropulsionFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Rendimiento</Label>{renderPerformanceFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Dotación</Label>{renderComplementFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Aviación</Label>{renderAviationFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Comunicaciones</Label>{renderCommunicationsFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Historial</Label>{renderHistoryFields()}</div>
            <div className="space-y-2"><Label className="text-lg font-semibold">Metadatos</Label>{renderMetadataFields()}</div>
          </div>
        </TabsContent>

        {/* ===================== Pestaña Multimedia ===================== */}
        <TabsContent value="media" className="space-y-6 mt-6">
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              {/* Imágenes */}
              <div>
                <Label className="text-base font-medium block mb-2">Imágenes</Label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  disabled={uploading}
                  className="mb-2"
                />
                <Textarea
                  className="min-h-[100px] text-base font-mono mt-2"
                  placeholder="O escribe URLs de imágenes (una por línea)"
                  value={formData.images.join('\n')}
                  onChange={(e) => handleChange('images', e.target.value.split('\n').filter(Boolean))}
                />
              </div>

              {/* Vídeos */}
              <div>
                <Label className="text-base font-medium block mb-2">Vídeos</Label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.videos.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <video
                        src={url}
                        controls
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoSelect}
                  disabled={uploading}
                  className="mb-2"
                />
                <Textarea
                  className="min-h-[100px] text-base font-mono mt-2"
                  placeholder="O escribe URLs de vídeos (una por línea)"
                  value={formData.videos.join('\n')}
                  onChange={(e) => handleChange('videos', e.target.value.split('\n').filter(Boolean))}
                />
              </div>

              {uploading && (
                <div className="text-center text-muted-foreground">
                  Subiendo archivos...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6 text-base">
          Cancelar
        </Button>
        <Button type="submit" className="h-12 px-6 text-base">
          Crear Unidad
        </Button>
      </div>
    </form>
  );
}