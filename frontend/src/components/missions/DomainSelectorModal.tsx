// components/missions/DomainSelectorModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DomainSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (domain: string) => void;
}

const domains = [
  { value: 'naval', label: 'Naval', description: 'Buques, submarinos, etc.' },
  { value: 'land', label: 'Terrestre', description: 'Vehículos, tropas, etc.' },
  { value: 'air', label: 'Aéreo', description: 'Aviones, helicópteros, drones' },
  { value: 'space', label: 'Espacial', description: 'Satélites, etc.' },
  { value: 'cyber', label: 'Cibernético', description: 'Operaciones en el ciberespacio' },
];

export const DomainSelectorModal: React.FC<DomainSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = React.useState<string>('naval');

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar dominio</DialogTitle>
          <DialogDescription>
            Elige el dominio al que pertenece la unidad que quieres añadir.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={selected} onValueChange={setSelected} className="py-4">
          {domains.map((domain) => (
            <div key={domain.value} className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value={domain.value} id={domain.value} />
              <div className="grid gap-1.5">
                <Label htmlFor={domain.value} className="font-medium">
                  {domain.label}
                </Label>
                <p className="text-sm text-muted-foreground">{domain.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};