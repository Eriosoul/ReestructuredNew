// ============================================
// INTEL OPS PLATFORM - GLOBAL FILTERS
// ============================================

import { useState } from 'react';
import { 
  Calendar, 
  Target, 
  Tag, 
  MapPin, 
  Activity, 
  Users, 
  AlertTriangle,
  X,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFilterStore, useMissionStore, useObjectStore } from '@/store';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GlobalFiltersProps {
  onClose?: () => void;
}

const objectTypes = ['person', 'vehicle', 'vessel', 'aircraft', 'device', 'organization', 'location'];
const objectStatuses = ['active', 'inactive', 'flagged', 'watchlisted', 'archived'];
const relationshipTypes = ['associate', 'family', 'colleague', 'communication', 'transaction', 'movement', 'ownership'];
const eventTypes = ['sighting', 'movement', 'communication', 'transaction', 'alert', 'prediction', 'manual', 'system'];
const severityLevels = ['critical', 'high', 'medium', 'low', 'info'];

const presets = [
  { id: 'last-24h', label: 'Last 24 Hours', icon: Activity },
  { id: 'last-7d', label: 'Last 7 Days', icon: Calendar },
  { id: 'high-confidence', label: 'High Confidence Only', icon: Check },
  { id: 'active-only', label: 'Active Objects', icon: Target },
  { id: 'critical-alerts', label: 'Critical Alerts', icon: AlertTriangle },
];

export default function GlobalFilters({ onClose }: GlobalFiltersProps) {
  const { filters, setTimeRange, setMissions, setObjectTypes, setObjectStatuses, setTags, setConfidenceRange, setGeographicArea, setRelationshipTypes, setEventTypes, setSeverity, resetFilters, applyPreset } = useFilterStore();
  const { missions } = useMissionStore();
  const { objects } = useObjectStore();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Get all unique tags from objects and missions
  const allTags = Array.from(new Set([
    ...objects.flatMap(o => o.tags),
    ...missions.flatMap(m => m.tags),
  ]));

  const handleApplyPreset = (presetId: string) => {
    applyPreset(presetId);
    toast.success('Filter preset applied', {
      description: `Applied preset: ${presets.find(p => p.id === presetId)?.label}`,
    });
  };

  const handleReset = () => {
    resetFilters();
    toast.info('Filters reset', {
      description: 'All filters have been cleared.',
    });
  };

  const activeFilterCount = [
    filters.timeRange.start ? 1 : 0,
    filters.missions.length,
    filters.objectTypes.length,
    filters.objectStatuses.length,
    filters.tags.length,
    filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100 ? 1 : 0,
    filters.geographicArea ? 1 : 0,
    filters.relationshipTypes.length,
    filters.eventTypes.length,
    filters.severity.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header with active count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Badge variant={activeFilterCount > 0 ? 'default' : 'secondary'}>
            {activeFilterCount}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset All
        </Button>
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="space-y-6 pr-4">
          {/* Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Quick Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className="filter-chip hover:bg-secondary/80 transition-colors"
                >
                  <preset.icon className="w-3 h-3" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Time Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Time Range
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left">
                    {filters.timeRange.start ? (
                      format(filters.timeRange.start, 'PP')
                    ) : (
                      <span className="text-muted-foreground">Start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.timeRange.start || undefined}
                    onSelect={(date) => setTimeRange(date || null, filters.timeRange.end)}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left">
                    {filters.timeRange.end ? (
                      format(filters.timeRange.end, 'PP')
                    ) : (
                      <span className="text-muted-foreground">End date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.timeRange.end || undefined}
                    onSelect={(date) => setTimeRange(filters.timeRange.start, date || null)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Missions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Missions
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {missions.map((mission) => (
                <div key={mission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mission-${mission.id}`}
                    checked={filters.missions.includes(mission.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMissions([...filters.missions, mission.id]);
                      } else {
                        setMissions(filters.missions.filter(id => id !== mission.id));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`mission-${mission.id}`}
                    className="text-sm cursor-pointer flex items-center gap-2"
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: mission.color }}
                    />
                    {mission.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Object Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Object Types
            </Label>
            <div className="flex flex-wrap gap-2">
              {objectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (filters.objectTypes.includes(type as any)) {
                      setObjectTypes(filters.objectTypes.filter(t => t !== type));
                    } else {
                      setObjectTypes([...filters.objectTypes, type as any]);
                    }
                  }}
                  className={`filter-chip capitalize ${
                    filters.objectTypes.includes(type as any) ? 'active' : ''
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Object Statuses */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Object Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {objectStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    if (filters.objectStatuses.includes(status as any)) {
                      setObjectStatuses(filters.objectStatuses.filter(s => s !== status));
                    } else {
                      setObjectStatuses([...filters.objectStatuses, status as any]);
                    }
                  }}
                  className={`filter-chip capitalize ${
                    filters.objectStatuses.includes(status as any) ? 'active' : ''
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Confidence Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              Confidence Range
            </Label>
            <div className="px-2">
              <Slider
                value={filters.confidenceRange}
                onValueChange={(value) => setConfidenceRange(value as [number, number])}
                min={0}
                max={100}
                step={5}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{filters.confidenceRange[0]}%</span>
                <span>{filters.confidenceRange[1]}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (filters.tags.includes(tag)) {
                      setTags(filters.tags.filter(t => t !== tag));
                    } else {
                      setTags([...filters.tags, tag]);
                    }
                  }}
                  className={`filter-chip ${filters.tags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Event Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Event Types
            </Label>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (filters.eventTypes.includes(type as any)) {
                      setEventTypes(filters.eventTypes.filter(t => t !== type));
                    } else {
                      setEventTypes([...filters.eventTypes, type as any]);
                    }
                  }}
                  className={`filter-chip capitalize ${
                    filters.eventTypes.includes(type as any) ? 'active' : ''
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Severity
            </Label>
            <div className="flex flex-wrap gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    if (filters.severity.includes(level as any)) {
                      setSeverity(filters.severity.filter(s => s !== level));
                    } else {
                      setSeverity([...filters.severity, level as any]);
                    }
                  }}
                  className={`filter-chip capitalize ${
                    filters.severity.includes(level as any) ? 'active' : ''
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Geographic Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Geographic Area
            </Label>
            <div className="p-4 border border-dashed border-border rounded-lg text-center">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Draw an area on the map to filter by geographic region
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Open Map
              </Button>
            </div>
          </div>

          <Separator />

          {/* Relationship Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Relationship Types
            </Label>
            <div className="flex flex-wrap gap-2">
              {relationshipTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (filters.relationshipTypes.includes(type as any)) {
                      setRelationshipTypes(filters.relationshipTypes.filter(t => t !== type));
                    } else {
                      setRelationshipTypes([...filters.relationshipTypes, type as any]);
                    }
                  }}
                  className={`filter-chip capitalize ${
                    filters.relationshipTypes.includes(type as any) ? 'active' : ''
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => {
          toast.success('Filters applied', {
            description: `${activeFilterCount} filter(s) now active across all modules.`,
          });
          onClose?.();
        }}>
          <Check className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
