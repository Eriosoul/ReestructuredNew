// ============================================
// INTEL OPS PLATFORM - MISSIONS PAGE
// ============================================

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Target,
  Calendar,
  Users,
  MapPin,
  Activity,
  Clock,
  CheckCircle,
  Archive,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMissionStore, useObjectStore } from '@/store';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Mission } from '@/types';

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

export default function MissionsPage() {
  const { missions, activeMission, setActiveMission, addMission, updateMission, deleteMission } = useMissionStore();
  const { objects } = useObjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredMissions = missions.filter(mission =>
    mission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateMission = () => {
    const mission: Mission = {
      id: `mission-${Date.now()}`,
      name: newMission.name,
      description: newMission.description,
      status: 'pending',
      priority: newMission.priority,
      startDate: new Date(newMission.startDate),
      createdBy: 'user-1',
      assignedUsers: [],
      objects: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      activityLog: [],
      notes: [],
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
    };
    addMission(mission);
    setShowCreateDialog(false);
    setNewMission({ name: '', description: '', priority: 'medium', startDate: format(new Date(), 'yyyy-MM-dd') });
    toast.success('Mission created', { description: `${mission.name} has been created.` });
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailDialog(true);
    setActiveMission(mission);
  };

  const handleDeleteMission = (missionId: string) => {
    deleteMission(missionId);
    toast.success('Mission deleted');
  };

  const renderMissionCard = (mission: Mission) => {
    const missionObjects = objects.filter(o => mission.objects.includes(o.id));
    
    return (
      <Card key={mission.id} className="card-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: mission.color }}
                />
                <h3 className="font-semibold text-lg truncate">{mission.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${priorityColors[mission.priority]}`}
                >
                  {mission.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {mission.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {mission.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {mission.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{mission.tags.length - 4}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(mission.startDate, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {mission.objects.length} objects
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {mission.assignedUsers.length} assigned
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMission(mission)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Mission
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDeleteMission(mission.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Missions</h1>
          <p className="text-muted-foreground">Manage intelligence operations and assignments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Mission
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search missions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({missions.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({missions.filter(m => m.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({missions.filter(m => m.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({missions.filter(m => m.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'active').map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'pending').map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMissions.filter(m => m.status === 'completed').map(renderMissionCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Mission Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mission Name</Label>
              <Input
                placeholder="Enter mission name..."
                value={newMission.name}
                onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter mission description..."
                value={newMission.description}
                onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newMission.priority}
                  onValueChange={(value: any) => setNewMission({ ...newMission, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newMission.startDate}
                  onChange={(e) => setNewMission({ ...newMission, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMission} disabled={!newMission.name}>
              Create Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mission Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedMission && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedMission.color }}
                  />
                  <DialogTitle>{selectedMission.name}</DialogTitle>
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${statusColors[selectedMission.status]}`}
                  >
                    {selectedMission.status}
                  </Badge>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 py-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedMission.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{selectedMission.objects.length}</p>
                      <p className="text-xs text-muted-foreground">Objects</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{selectedMission.assignedUsers.length}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{selectedMission.activityLog.length}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{format(selectedMission.startDate, 'MMM d')}</p>
                      <p className="text-xs text-muted-foreground">Started</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMission.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Activity Log */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {selectedMission.activityLog.slice(0, 5).map((log, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm">{log.details}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.userName} • {format(log.timestamp, 'MMM d, HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
