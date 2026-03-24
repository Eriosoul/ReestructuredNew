import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, LayoutGrid, Focus } from 'lucide-react';

// Mock data – replace with real video feeds
const mockFeeds = [
  { id: 1, name: 'Mision-defensa', task: 'INTERCEPT-SHAHED-136', active: true },
  { id: 2, name: 'Feed #2', task: 'INTERCEPT-SHAHED-136', active: true },
];

export function VideoFeedPanel() {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="font-semibold">Multi‑Video Surveillance</span>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{mockFeeds.filter(f => f.active).length} active feeds</Badge>
            <Badge variant="outline">{mockFeeds.length} task feeds</Badge>
            <Badge variant="outline">0 target feeds</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockFeeds.map(feed => (
            <div key={feed.id} className="relative bg-muted rounded-lg aspect-video flex items-center justify-center">
              <span className="text-xs text-muted-foreground">{feed.name}</span>
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="text-[10px]">{feed.task}</Badge>
              </div>
              <div className="absolute bottom-1 right-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm"><Focus className="h-3 w-3 mr-1" /> Focus</Button>
          <Button variant="outline" size="sm"><LayoutGrid className="h-3 w-3 mr-1" /> Layout</Button>
        </div>
      </CardContent>
    </Card>
  );
}