// ============================================
// INTEL OPS PLATFORM - OBJECTS PAGE
// ============================================

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  MapPin,
  Calendar,
  Target,
  Activity,
  Brain,
  Share2,
  FileText,
  Edit,
  Trash2,
  Plus,
  Bookmark,
  BookmarkX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Truck,
  Ship,
  MapPinned,
  Plane,
  Smartphone,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useObjectStore, useMissionStore } from '@/store';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TargetObject } from '@/types';

const typeIcons = {
  person: User,
  vehicle: Truck,
  vessel: Ship,
  aircraft: Plane,
  device: Smartphone,
  organization: Building2,
  location: MapPinned,
  unknown: HelpCircle,
};

const statusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/30',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
  flagged: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  watchlisted: 'bg-red-500/10 text-red-500 border-red-500/30',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

export default function ObjectsPage() {
  const { objects, selectedObject, setSelectedObject, addToWatchlist, removeFromWatchlist } = useObjectStore();
  const { missions } = useMissionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const filteredObjects = objects.filter(obj =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    obj.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
    obj.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewObject = (obj: TargetObject) => {
    setSelectedObject(obj);
    setShowDetailDialog(true);
  };

  const handleToggleWatchlist = (obj: TargetObject) => {
    if (obj.status === 'watchlisted') {
      removeFromWatchlist(obj.id);
      toast.success(`${obj.name} removed from watchlist`);
    } else {
      addToWatchlist(obj.id);
      toast.success(`${obj.name} added to watchlist`);
    }
  };

  const renderObjectCard = (obj: TargetObject) => {
    const TypeIcon = typeIcons[obj.type];
    
    return (
      <Card key={obj.id} className="card-hover">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${obj.name}`} />
              <AvatarFallback><TypeIcon className="w-5 h-5" /></AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{obj.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${statusColors[obj.status]}`}
                    >
                      {obj.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize flex items-center gap-1 mt-1">
                    <TypeIcon className="w-3 h-3" />
                    {obj.type}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewObject(obj)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleWatchlist(obj)}>
                      {obj.status === 'watchlisted' ? (
                        <><BookmarkX className="w-4 h-4 mr-2" /> Remove from Watchlist</>
                      ) : (
                        <><Bookmark className="w-4 h-4 mr-2" /> Add to Watchlist</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {obj.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {obj.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Confidence: {obj.confidence}%
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Risk: {obj.riskScore}/100
                </span>
                {obj.lastSeenAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(obj.lastSeenAt, 'MMM d')}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Confidence</span>
                  <span>{obj.confidence}%</span>
                </div>
                <Progress value={obj.confidence} className="h-1.5" />
              </div>
            </div>
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
          <h1 className="text-2xl font-bold">Objects</h1>
          <p className="text-muted-foreground">Manage targets, entities, and intelligence objects</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Object
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search objects, aliases, tags..."
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Objects</p>
            <p className="text-2xl font-bold">{objects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">
              {objects.filter(o => o.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Watchlisted</p>
            <p className="text-2xl font-bold text-red-500">
              {objects.filter(o => o.status === 'watchlisted').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Confidence</p>
            <p className="text-2xl font-bold text-blue-500">
              {objects.filter(o => o.confidence >= 80).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({objects.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({objects.filter(o => o.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="watchlisted">Watchlisted ({objects.filter(o => o.status === 'watchlisted').length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({objects.filter(o => o.status === 'flagged').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredObjects.map(renderObjectCard)}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredObjects.filter(o => o.status === 'active').map(renderObjectCard)}
          </div>
        </TabsContent>

        <TabsContent value="watchlisted" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredObjects.filter(o => o.status === 'watchlisted').map(renderObjectCard)}
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredObjects.filter(o => o.status === 'flagged').map(renderObjectCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Object Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedObject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedObject.name}`} />
                    <AvatarFallback>{selectedObject.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedObject.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`capitalize ${statusColors[selectedObject.status]}`}>
                        {selectedObject.status}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {selectedObject.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Confidence: {selectedObject.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[50vh]">
                  <TabsContent value="profile" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedObject.description}</p>
                    </div>

                    {selectedObject.aliases.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Aliases</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedObject.aliases.map(alias => (
                            <Badge key={alias} variant="secondary">{alias}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2">Metadata</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedObject.metadata).map(([key, value]) => (
                          <div key={key} className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase">{key}</p>
                            <p className="text-sm">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedObject.lastKnownLocation && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Last Known Location</h4>
                        <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedObject.lastKnownLocation.lat.toFixed(6)}, {selectedObject.lastKnownLocation.lng.toFixed(6)}
                          </span>
                          {selectedObject.lastSeenAt && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {format(selectedObject.lastSeenAt, 'MMM d, yyyy HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                      <div className="flex items-center gap-4">
                        <Progress value={selectedObject.riskScore} className="flex-1 h-2" />
                        <span className={`text-sm font-medium ${
                          selectedObject.riskScore >= 70 ? 'text-red-500' :
                          selectedObject.riskScore >= 40 ? 'text-amber-500' : 'text-green-500'
                        }`}>
                          {selectedObject.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <div className="space-y-4">
                      {selectedObject.timeline.slice(0, 10).map((event, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(event.timestamp, 'MMM d, yyyy HH:mm')} • Confidence: {event.confidence}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="relationships">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedObject.relationships.map((relId, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">Relationship {idx + 1}</p>
                                <p className="text-xs text-muted-foreground">ID: {relId}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="predictions">
                    <div className="space-y-4">
                      {selectedObject.predictions.length > 0 ? (
                        selectedObject.predictions.map((pred, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{pred.title}</p>
                                  <p className="text-sm text-muted-foreground">{pred.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>Confidence: {pred.confidence}%</span>
                                    <span>Model: {pred.model}</span>
                                  </div>
                                </div>
                                <Badge variant={pred.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {pred.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-12 h-12 mx-auto text-muted-foreground/50" />
                          <p className="text-muted-foreground mt-2">No predictions available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="media">
                    <div className="grid grid-cols-3 gap-4">
                      {selectedObject.media.length > 0 ? (
                        selectedObject.media.map((mediaId, idx) => (
                          <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 text-center py-8">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                          <p className="text-muted-foreground mt-2">No media available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => handleToggleWatchlist(selectedObject)}>
                  {selectedObject.status === 'watchlisted' ? (
                    <><BookmarkX className="w-4 h-4 mr-2" /> Remove from Watchlist</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-2" /> Add to Watchlist</>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
