import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VideoPlayerProps {
  src?: string;
  protocol?: 'http' | 'rtsp' | 'udp' | 'hls';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, protocol = 'http' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(null);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);

    // For RTSP/UDP, we can't play directly in browser.
    if (protocol === 'rtsp' || protocol === 'udp') {
      setError(
        `Direct ${protocol.toUpperCase()} playback is not supported in browsers. ` +
        'Please use a streaming server that converts to HLS or WebRTC.'
      );
      setLoading(false);
      return;
    }

    // For HLS (m3u8)
    if (protocol === 'hls' || src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(e => console.warn('Autoplay prevented', e));
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError(`HLS error: ${data.type} ${data.details}`);
          }
        });
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', () => setLoading(false));
      } else {
        setError('HLS is not supported in this browser.');
        setLoading(false);
      }
      return;
    }

    // For MP4 or other direct HTTP streams
    video.src = src;
    video.addEventListener('canplay', () => setLoading(false));
    video.addEventListener('error', (e) => {
      setError('Failed to load video. Check the URL and network.');
      setLoading(false);
    });
  }, [src, protocol]);

  if (!src) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-muted-foreground">No video feed configured</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          Loading video...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        autoPlay
        muted // to allow autoplay in some browsers
      />
    </div>
  );
};