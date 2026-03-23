// frontend/components/missions/HostileSelectorModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UnitConfig } from '@/types/mission';

interface UnitSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (unit: UnitConfig) => void;
  domain?: string; // nuevo prop opcional para filtrar por dominio
}

interface DbUnit {
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
  domain?: string; // incluimos domain
}

export const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  domain,
}) => {
  const [units, setUnits] = useState<DbUnit[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // En Vite, las variables de entorno se acceden con import.meta.env
  const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      // Construir URL con query param si hay domain
      let url = `${API_BASE_URL}/api/hostile`;
      if (domain) {
        url += `?domain=${encodeURIComponent(domain)}`;
      }
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => setUnits(data))
        .catch((err) => {
          console.error('Error loading units:', err);
          setError('Failed to load units. Check backend connection.');
        })
        .finally(() => setLoading(false));
    }
  }, [open, API_BASE_URL, domain]);

  const filteredUnits = units.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.unitId.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (dbUnit: DbUnit) => {
    const newUnit: UnitConfig = {
      id: `unit-${Date.now()}-${dbUnit.unitId}`,
      type: mapUnitType(dbUnit.type),
      name: dbUnit.name,
      sensors: dbUnit.sensors || [],
      armamento: dbUnit.armament || [],
      operaciones: [],
      targets: [],
      country: dbUnit.country,
      classification: 'UNCLASSIFIED',
      domain: dbUnit.domain, // guardamos el dominio si existe
    };
    onSelect(newUnit);
    onClose();
  };

  const mapUnitType = (dbType: string): 'naval' | 'aeronaval' | 'submarine' | 'land' | 'air' => {
    const typeMap: Record<string, 'naval' | 'aeronaval' | 'submarine' | 'land' | 'air'> = {
      'LHD': 'naval',
      'Frigate': 'naval',
      'Destroyer': 'naval',
      'Submarine': 'submarine',
      'Aircraft': 'air',
      'Helicopter': 'air',
      'Tank': 'land',
      'APC': 'land',
    };
    return typeMap[dbType] || 'naval';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select unit from database</DialogTitle>
          {domain && <p className="text-sm text-muted-foreground">Filtering by domain: {domain}</p>}
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search by name or ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {loading && <p className="text-center">Loading units...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit._id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleSelect(unit)}
                  >
                    <div className="font-medium">{unit.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {unit.unitId} · {unit.type} · {unit.country}
                      {unit.domain && <span> · {unit.domain}</span>}
                    </div>
                  </div>
                ))}
                {filteredUnits.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No units found
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};