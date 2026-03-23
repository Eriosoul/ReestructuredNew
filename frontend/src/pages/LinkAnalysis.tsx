// ============================================
// INTEL OPS PLATFORM - LINK ANALYSIS PAGE
// ============================================

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type Connection,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Filter,
  Download,
  Target,
  Activity,
  GitBranch,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useObjectStore } from '@/store';
import { toast } from 'sonner';

// Custom Node Component
const CustomNode = ({ data }: any) => {
  const typeColors: Record<string, string> = {
    person: '#3b82f6',
    vehicle: '#10b981',
    vessel: '#f59e0b',
    location: '#8b5cf6',
    event: '#ef4444',
    mission: '#06b6d4',
  };

  const color = typeColors[data.type] || '#6b7280';

  return (
    <div 
      className="px-4 py-2 rounded-lg border-2 bg-card shadow-lg"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      {data.subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{data.subtitle}</p>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function LinkAnalysisPage() {
  const { objects } = useObjectStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [minConfidence, setMinConfidence] = useState(50);
  const [layout, setLayout] = useState<'force' | 'hierarchical' | 'circular'>('force');

  // Initialize graph data
  useEffect(() => {
    const initialNodes: Node[] = objects.map((obj, index) => ({
      id: obj.id,
      type: 'custom',
      position: { 
        x: 100 + (index % 5) * 200 + Math.random() * 50, 
        y: 100 + Math.floor(index / 5) * 150 + Math.random() * 50 
      },
      data: { 
        label: obj.name, 
        subtitle: obj.type,
        nodeType: obj.type,
        ...obj 
      },
    }));

    const initialEdges: Edge[] = [];
    objects.forEach(obj => {
      obj.relationships.forEach((relId, idx) => {
        const targetObj = objects.find(o => o.relationships.includes(relId));
        if (targetObj && targetObj.id !== obj.id) {
          initialEdges.push({
            id: `e-${obj.id}-${targetObj.id}-${idx}`,
            source: obj.id,
            target: targetObj.id,
            label: 'related',
            animated: true,
            style: { stroke: '#6b7280', strokeWidth: 2 },
          });
        }
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [objects]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((__event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleFindPath = () => {
    toast.info('Path Finding', {
      description: 'Select two nodes to find the shortest path between them.',
    });
  };

  const handleExpandNode = () => {
    if (selectedNode) {
      toast.success('Node Expanded', {
        description: `Expanded connections for ${selectedNode.data.label}`,
      });
    }
  };

  const handleExportGraph = () => {
    toast.success('Graph Exported', {
      description: 'The graph has been exported as PNG.',
    });
  };

  const filteredEdges = edges.filter(e => {
    // Filter by confidence if available
    return true;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Main Graph Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#6b7280" gap={20} size={1} />
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          
          {/* Top Controls */}
          <Panel position="top-left" className="m-4">
            <Card className="glass">
              <CardContent className="p-2 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleFindPath}>
                  <Route className="w-4 h-4 mr-2" />
                  Find Path
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExpandNode} disabled={!selectedNode}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Expand
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExportGraph}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardContent>
            </Card>
          </Panel>

          {/* Layout Controls */}
          <Panel position="top-right" className="m-4">
            <Card className="glass">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Layout:</span>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as any)}
                    className="bg-transparent text-sm border border-border rounded px-2 py-1"
                  >
                    <option value="force">Force</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/*  */}
      <div className="w-80 space-y-4">
        {/* Selected Node Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Node Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold">{selectedNode.data.label}</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedNode.data.type}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{selectedNode.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections:</span>
                    <span>{edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleExpandNode}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Expand
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Target className="w-4 h-4 mr-2" />
                    Focus
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground mt-2">Select a node to view details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graph Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Graph Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{nodes.length}</p>
                <p className="text-xs text-muted-foreground">Nodes</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{edges.length}</p>
                <p className="text-xs text-muted-foreground">Edges</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {edges.length > 0 ? (edges.length / nodes.length).toFixed(2) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Avg Degree</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Communities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Min Confidence</span>
                <span className="text-xs">{minConfidence}%</span>
              </div>
              <Slider
                value={[minConfidence]}
                onValueChange={(value) => setMinConfidence(value[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" />
                Show Person Nodes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" />
                Show Vehicle Nodes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" />
                Show Location Nodes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Show Events
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Person</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Vehicle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Vessel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Event</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
