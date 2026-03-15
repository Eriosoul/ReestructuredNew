// ============================================
// INTEL OPS PLATFORM - PREDICTIONS PAGE
// ============================================

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Clock4,
  Filter,
  BarChart3,
  LineChart,
  Zap,
  Play,
  Pause,
  Settings,
  Download,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useObjectStore } from '@/store';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

// Mock prediction data
const predictionAccuracyData = [
  { date: 'Mon', accuracy: 78, predictions: 12 },
  { date: 'Tue', accuracy: 82, predictions: 15 },
  { date: 'Wed', accuracy: 85, predictions: 18 },
  { date: 'Thu', accuracy: 81, predictions: 14 },
  { date: 'Fri', accuracy: 88, predictions: 20 },
  { date: 'Sat', accuracy: 86, predictions: 16 },
  { date: 'Sun', accuracy: 90, predictions: 22 },
];

const modelPerformanceData = [
  { name: 'MovementPredictor', accuracy: 87, latency: 120, predictions: 145 },
  { name: 'BehaviorAnalyzer', accuracy: 82, latency: 85, predictions: 89 },
  { name: 'MaritimeRoute AI', accuracy: 91, latency: 200, predictions: 67 },
  { name: 'AnomalyDetector', accuracy: 79, latency: 45, predictions: 234 },
];

export default function PredictionsPage() {
  const { objects } = useObjectStore();
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Collect all predictions from objects
  const allPredictions = objects.flatMap(obj => 
    obj.predictions.map(pred => ({
      ...pred,
      objectName: obj.name,
      objectType: obj.type,
    }))
  );

  const filteredPredictions = allPredictions.filter(p => p.confidence >= confidenceThreshold);

  const handleViewPrediction = (prediction: any) => {
    setSelectedPrediction(prediction);
    setShowDetailDialog(true);
  };

  const handleRunAnalysis = () => {
    toast.success('Analysis Started', {
      description: 'Running predictive models on selected objects...',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Confirmed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Pending</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movement':
        return <TrendingUp className="w-4 h-4" />;
      case 'behavior':
        return <Activity className="w-4 h-4" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">AI-powered predictive analytics and forecasting</p>
        </div>
        <Button onClick={handleRunAnalysis}>
          <Zap className="w-4 h-4 mr-2" />
          Run Analysis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Predictions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{allPredictions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Confirmed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {allPredictions.filter(p => p.status === 'confirmed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock4 className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-500">
              {allPredictions.filter(p => p.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Avg Accuracy</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-500">
              {Math.round(allPredictions.reduce((acc, p) => acc + p.confidence, 0) / (allPredictions.length || 1))}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Predictions</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Min Confidence:</span>
                <span className="text-xs font-medium">{confidenceThreshold}%</span>
              </div>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={(value) => setConfidenceThreshold(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-32"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPredictions.map((prediction, idx) => (
              <Card key={idx} className="card-hover cursor-pointer" onClick={() => handleViewPrediction(prediction)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(prediction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{prediction.title}</h4>
                        {getStatusBadge(prediction.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{prediction.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {prediction.objectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {prediction.model}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until {format(prediction.validUntil, 'MMM d')}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Confidence</span>
                          <span>{prediction.confidence}%</span>
                        </div>
                        <Progress value={prediction.confidence} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPredictions.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground mt-4">No predictions match your criteria</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setConfidenceThreshold(0)}
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Model Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modelPerformanceData.map((model, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.accuracy}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{model.predictions} predictions</span>
                      <span>{model.latency}ms latency</span>
                    </div>
                    <Progress value={model.accuracy} className="h-1 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Accuracy Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={predictionAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Model Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Predictions
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prediction Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          {selectedPrediction && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getTypeIcon(selectedPrediction.type)}
                  </div>
                  <div>
                    <DialogTitle>{selectedPrediction.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedPrediction.objectName} • {selectedPrediction.model}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedPrediction.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold">{selectedPrediction.confidence}%</p>
                    <Progress value={selectedPrediction.confidence} className="h-1 mt-2" />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-lg font-bold capitalize">{selectedPrediction.status}</p>
                  </div>
                </div>

                {selectedPrediction.factors && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Prediction Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrediction.factors.map((factor: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPrediction.predictedLocation && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Predicted Location</h4>
                    <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedPrediction.predictedLocation.lat.toFixed(6)}, {selectedPrediction.predictedLocation.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedPrediction.predictedTime && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Predicted Time</h4>
                    <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(selectedPrediction.predictedTime, 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Predicted: {format(selectedPrediction.predictedAt, 'MMM d, yyyy')}</span>
                  <span>Valid until: {format(selectedPrediction.validUntil, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
