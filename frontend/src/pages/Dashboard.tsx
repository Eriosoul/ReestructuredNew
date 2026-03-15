// ============================================
// INTEL OPS PLATFORM - DASHBOARD PAGE
// ============================================

import { useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useMissionStore, useObjectStore, useEventStore, useNotificationStore } from '@/store';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock chart data
const activityData = [
  { time: '00:00', events: 12, alerts: 2 },
  { time: '04:00', events: 8, alerts: 1 },
  { time: '08:00', events: 24, alerts: 5 },
  { time: '12:00', events: 32, alerts: 3 },
  { time: '16:00', events: 28, alerts: 4 },
  { time: '20:00', events: 18, alerts: 2 },
  { time: '23:59', events: 15, alerts: 1 },
];

const objectTypeData = [
  { name: 'Person', value: 45, color: '#3b82f6' },
  { name: 'Vehicle', value: 28, color: '#10b981' },
  { name: 'Vessel', value: 15, color: '#f59e0b' },
  { name: 'Location', value: 12, color: '#8b5cf6' },
];

const missionStatusData = [
  { name: 'Active', value: 8, color: '#10b981' },
  { name: 'Pending', value: 4, color: '#f59e0b' },
  { name: 'Completed', value: 12, color: '#6b7280' },
  { name: 'Archived', value: 6, color: '#374151' },
];

export default function DashboardPage() {
  const { missions } = useMissionStore();
  const { objects, watchlist } = useObjectStore();
  const { events, unreadCount } = useEventStore();
  const { notifications } = useNotificationStore();

  // Calculate stats
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const activeObjects = objects.filter(o => o.status === 'active').length;
  const watchlistedObjects = objects.filter(o => o.status === 'watchlisted').length;
  const criticalAlerts = events.filter(e => e.severity === 'critical' && !e.verified).length;
  const highConfidenceObjects = objects.filter(o => o.confidence >= 80).length;

  const stats = [
    {
      title: 'Active Missions',
      value: activeMissions,
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tracked Objects',
      value: activeObjects,
      change: '+5',
      trend: 'up',
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Watchlisted',
      value: watchlistedObjects,
      change: '+1',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Critical Alerts',
      value: criticalAlerts,
      change: '-2',
      trend: 'down',
      icon: Bell,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Real-time intelligence overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="live-indicator mr-2" />
          <span className="text-sm text-muted-foreground">Live</span>
          <Button variant="outline" size="sm" onClick={() => toast.success('Dashboard refreshed')}>
            <Zap className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last 24h</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <span className="w-2 h-2 rounded-full bg-primary mr-1" />
                Events
              </Badge>
              <Badge variant="outline" className="text-xs">
                <span className="w-2 h-2 rounded-full bg-destructive mr-1" />
                Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorEvents)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="alerts" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorAlerts)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Object Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Object Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={objectTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {objectTypeData.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {objectTypeData.map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-xs text-muted-foreground">{type.name}</span>
                  <span className="text-xs font-medium ml-auto">{type.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {events.slice(0, 10).map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      event.severity === 'high' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {event.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                       event.severity === 'high' ? <Bell className="w-5 h-5" /> :
                       <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{event.title}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            event.severity === 'critical' ? 'border-red-500 text-red-500' :
                            event.severity === 'high' ? 'border-amber-500 text-amber-500' :
                            'border-blue-500 text-blue-500'
                          }`}
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(event.timestamp, 'HH:mm')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location ? `${event.location.lat.toFixed(2)}, ${event.location.lng.toFixed(2)}` : 'No location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {event.objectIds.length} objects
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mission Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Mission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missionStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {missionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Separator className="my-4" />

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High Confidence</span>
                <div className="flex items-center gap-2">
                  <Progress value={highConfidenceObjects} className="w-20 h-2" />
                  <span className="text-sm font-medium">{highConfidenceObjects}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Quality</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-20 h-2" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Health</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Operational</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Target className="w-6 h-6" />
          <span className="text-sm">New Mission</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Eye className="w-6 h-6" />
          <span className="text-sm">Add Object</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Brain className="w-6 h-6" />
          <span className="text-sm">Run Analysis</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Share2 className="w-6 h-6" />
          <span className="text-sm">Share Report</span>
        </Button>
      </div>
    </div>
  );
}
