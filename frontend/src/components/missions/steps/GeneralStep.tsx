import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Mission } from '@/types/mission';

interface GeneralStepProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
}

export const GeneralStep: React.FC<GeneralStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof Mission, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Mission Name *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Operation Night Watch"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the mission objectives and scope..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={data.priority as string || 'medium'}
            onValueChange={(v) => handleChange('priority', v)}
          >
            <SelectTrigger id="priority" className="mt-1">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={data.status as string || 'pending'}
            onValueChange={(v) => handleChange('status', v)}
          >
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleChange('startDate', new Date(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={data.tags?.join(', ') || ''}
          onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="surveillance, urban, hvi"
          className="mt-1"
        />
      </div>
    </div>
  );
};