// ============================================
// INTEL OPS PLATFORM - NETWORK ANALYSIS PAGE
// ============================================

import { useState } from 'react';
import {
  Network,
  Activity,
  Users,
  ArrowRightLeft,
  Target,
  Filter,
  Download,
  Play,
  Pause,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Share2,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useObjectStore } from '@/store';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

// Mock network metrics
const centralityData = [
  { name: 'Target Alpha', degree: 12, betweenness: 0.85, closeness: 0.72 },
  { name: 'Target Beta', degree: 8, betweenness: 0.45, closeness: 0.68 },
  { name: 'Vehicle XJ-447', degree: 6, betweenness: 0.32, closeness: 0.55 },
  { name: 'Safe House', degree: 5, betweenness: 0.28, closeness: 0.48 },
  { name: 'MV Ocean Trader', degree: 4, betweenness: 0.22, closeness: 0.42 },
];

const flowData = [
  { source: 'Target Alpha', target: 'Target Beta', volume: 45, frequency: 12 },
  { source: 'Target Alpha', target: 'Vehicle XJ-447', volume: 32, frequency: 8 },
  { source: 'Target Beta', target: 'Safe House', volume: 28, frequency: 6 },
  { source: 'MV Ocean Trader', target: 'Coastal Runner', volume: 18, frequency: 4 },
  { source: 'Chicago Hub', target: 'Fleet Delta', volume: 52, frequency: 15 },
];

const communityData = [
  { name: 'Network A', nodes: 12, density: 0.75, color: '#3b82f6' },
  { name: 'Network B', nodes: 8, density: 0.68, color: '#10b981' },
  { name: 'Network C', nodes: 6, density: 0.82, color: '#f59e0b' },
  { name: 'Network D', nodes: 4, density: 0.55, color: '#8b5cf6' },
];

const temporalData = [
  { time: '00:00', interactions: 12, newConnections: 2 },
  { time: '04:00', interactions: 8, newConnections: 1 },
  { time: '08:00', interactions: 24, newConnections: 5 },
  { time: '12:00', interactions: 32, newConnections: 3 },
  { time: '16:00', interactions: 28, newConnections: 4 },
  { time: '20:00', interactions: 18, newConnections: 2 },
  { time: '23:59', interactions: 15, newConnections: 1 },
];

export default function NetworkPage() {
  const { objects } = useObjectStore();
  const [timeWindow, setTimeWindow] = useState(24);
  const [minInteractions, setMinInteractions] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    toast.success('Network Simulation Started', {
      description: 'Analyzing network patterns and flow dynamics...',
    });
    setTimeout(() => {
      setIsSimulating(false);
      toast.success('Simulation Complete');
    }, 3000);
  };

  const handleExportAnalysis = () => {
    toast.success('Analysis Exported', {
      description: 'Network analysis report has been generated.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Analysis</h1>
          <p className="text-muted-foreground">Spatial network visualization and flow dynamics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportAnalysis}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRunSimulation} disabled={isSimulating}>
            {isSimulating ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Nodes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{objects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Connections</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-500">47</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Communities</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-500">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Network Density</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-500">0.72</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="centrality" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="centrality">Centrality Metrics</TabsTrigger>
          <TabsTrigger value="flow">Flow Analysis</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Dynamics</TabsTrigger>
        </TabsList>

        <TabsContent value="centrality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Degree Centrality */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Degree Centrality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centralityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="degree" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Betweenness vs Closeness */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Betweenness vs Closeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        dataKey="betweenness" 
                        name="Betweenness" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        domain={[0, 1]}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="closeness" 
                        name="Closeness" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        domain={[0, 1]}
                      />
                      <ZAxis type="number" dataKey="degree" range={[50, 400]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Scatter name="Nodes" data={centralityData} fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Centrality Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Node Centrality Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Node</th>
                      <th className="text-center py-2 px-4">Degree</th>
                      <th className="text-center py-2 px-4">Betweenness</th>
                      <th className="text-center py-2 px-4">Closeness</th>
                      <th className="text-center py-2 px-4">Influence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centralityData.map((node, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="py-2 px-4 font-medium">{node.name}</td>
                        <td className="text-center py-2 px-4">{node.degree}</td>
                        <td className="text-center py-2 px-4">{(node.betweenness * 100).toFixed(0)}%</td>
                        <td className="text-center py-2 px-4">{(node.closeness * 100).toFixed(0)}%</td>
                        <td className="text-center py-2 px-4">
                          <Progress value={node.betweenness * 100} className="w-20 h-2 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flow Volume */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Flow Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Flow Frequency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Interaction Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="frequency" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Community Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Community Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={communityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="nodes"
                      >
                        {communityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {communityData.map((community) => (
                    <div key={community.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: community.color }} />
                        <span className="text-sm">{community.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{community.nodes} nodes</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Community Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityData.map((community, idx) => (
                    <div key={idx} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: community.color }} />
                          <span className="font-medium">{community.name}</span>
                        </div>
                        <Badge variant="outline">{community.nodes} nodes</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Density</span>
                            <span>{(community.density * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={community.density * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Temporal Network Dynamics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temporalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={2} name="Interactions" />
                    <Line type="monotone" dataKey="newConnections" stroke="#10b981" strokeWidth={2} name="New Connections" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filters Panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Time Window</span>
                <span className="text-sm">{timeWindow}h</span>
              </div>
              <Slider
                value={[timeWindow]}
                onValueChange={(value) => setTimeWindow(value[0])}
                min={1}
                max={168}
                step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Min Interactions</span>
                <span className="text-sm">{minInteractions}</span>
              </div>
              <Slider
                value={[minInteractions]}
                onValueChange={(value) => setMinInteractions(value[0])}
                min={1}
                max={50}
                step={1}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
