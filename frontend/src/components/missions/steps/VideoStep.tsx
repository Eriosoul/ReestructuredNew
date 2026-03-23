import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Mission } from '@/types/mission';

interface VideoStepProps {
  data: Partial<Mission>;
  onChange: (data: Partial<Mission>) => void;
}

export const VideoStep: React.FC<VideoStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof Mission, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="videoUrl">Video Feed URL</Label>
        <Input
          id="videoUrl"
          value={data.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          placeholder="rtsp://example.com/stream, http://example.com/stream.m3u8, udp://..."
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Supports HTTP (MP4, HLS), RTSP (requires server transcoding), UDP (MPEG‑TS over WebSocket).
        </p>
      </div>

      <div>
        <Label htmlFor="videoProtocol">Protocol</Label>
        <Select
          value={data.videoProtocol || 'http'}
          onValueChange={(v) => handleChange('videoProtocol', v)}
        >
          <SelectTrigger id="videoProtocol" className="mt-1">
            <SelectValue placeholder="Select protocol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="http">HTTP (MP4 / HLS)</SelectItem>
            <SelectItem value="rtsp">RTSP</SelectItem>
            <SelectItem value="udp">UDP</SelectItem>
            <SelectItem value="hls">HLS (m3u8)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          RTSP and UDP may require additional server-side setup to be viewable in the browser.
        </p>
      </div>
    </div>
  );
};