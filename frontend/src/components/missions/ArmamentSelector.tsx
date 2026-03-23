// components/missions/ArmamentSelector.tsx
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ArmamentSelectorProps {
  armamento: any[]; // Array de objetos de armamento
  onChange: (armamento: any[]) => void;
}

export const ArmamentSelector: React.FC<ArmamentSelectorProps> = ({ armamento, onChange }) => {
  const [localArmamento, setLocalArmamento] = useState<any[]>(() =>
    armamento.map(a => ({ ...a, enabled: a.enabled !== false }))
  );

  const toggleArmamento = (index: number) => {
    const updated = [...localArmamento];
    updated[index].enabled = !updated[index].enabled;
    setLocalArmamento(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Armamento</Label>
      <ScrollArea className="max-h-60">
        {localArmamento.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin armamento</p>
        ) : (
          <div className="space-y-2">
            {localArmamento.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 border rounded p-2">
                <Checkbox
                  id={`arm-${idx}`}
                  checked={item.enabled}
                  onCheckedChange={() => toggleArmamento(idx)}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.type} • {item.quantity} uds. • cal. {item.caliber}
                  </div>
                  {item.ammunition && (
                    <div className="text-xs">Munición: {item.ammunition}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};