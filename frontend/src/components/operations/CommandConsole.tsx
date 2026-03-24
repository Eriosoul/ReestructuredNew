import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Send } from 'lucide-react';

interface CommandConsoleProps {
  onSendCommand: (command: string) => void;
  history?: string[];
}

export function CommandConsole({ onSendCommand, history = [] }: CommandConsoleProps) {
  const [command, setCommand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onSendCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-2 border-b flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        <span className="text-sm font-medium">Command Console</span>
      </div>
      <ScrollArea className="h-32 p-2">
        {history.map((line, idx) => (
          <div key={idx} className="text-xs font-mono text-muted-foreground">{line}</div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
        <Input
          placeholder="Input Command (e.g., 'START', 'ABORT')..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}