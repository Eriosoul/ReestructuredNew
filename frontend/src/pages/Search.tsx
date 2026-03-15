// ============================================
// INTEL OPS PLATFORM - SEARCH PAGE
// ============================================

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Target,
  Eye,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon,
  Video,
  Clock,
  ArrowRight,
  Sparkles,
  History,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSearchStore, useObjectStore, useMissionStore, useEventStore } from '@/store';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock search suggestions
const searchSuggestions = [
  'Target Alpha',
  'Operation Night Watch',
  'Financial District',
  'Vehicle XJ-447',
  'MV Ocean Trader',
  'high confidence objects',
  'critical alerts',
  'active missions',
];

// Mock recent searches
const recentSearches = [
  { query: 'Target Alpha', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { query: 'active missions', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { query: 'high risk objects', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { objects } = useObjectStore();
  const { missions } = useMissionStore();
  const { events } = useEventStore();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setQuery(searchQuery);
    setShowSuggestions(false);

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Perform fuzzy search across all data
    const results: any[] = [];
    const q = searchQuery.toLowerCase();

    // Search objects
    objects.forEach(obj => {
      if (
        obj.name.toLowerCase().includes(q) ||
        obj.aliases.some(a => a.toLowerCase().includes(q)) ||
        obj.description.toLowerCase().includes(q)) {
        results.push({
          type: 'object',
          title: obj.name,
          subtitle: obj.type,
          description: obj.description,
          data: obj,
          relevance: 0.95,
        });
      }
    });

    // Search missions
    missions.forEach(mission => {
      if (
        mission.name.toLowerCase().includes(q) ||
        mission.description.toLowerCase().includes(q) ||
        mission.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({
          type: 'mission',
          title: mission.name,
          subtitle: mission.status,
          description: mission.description,
          data: mission,
          relevance: 0.9,
        });
      }
    });

    // Search events
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q)) {
        results.push({
          type: 'event',
          title: event.title,
          subtitle: event.type,
          description: event.description,
          data: event,
          relevance: 0.85,
        });
      }
    });

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    setSearchResults(results);
    setIsSearching(false);

    toast.success(`Found ${results.length} results`, {
      description: `Search completed for "${searchQuery}"`,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const filteredResults = activeFilter === 'all' 
    ? searchResults 
    : searchResults.filter(r => r.type === activeFilter);

  const resultCounts = {
    all: searchResults.length,
    object: searchResults.filter(r => r.type === 'object').length,
    mission: searchResults.filter(r => r.type === 'mission').length,
    event: searchResults.filter(r => r.type === 'event').length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object': return Eye;
      case 'mission': return Target;
      case 'event': return Calendar;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'object': return 'text-blue-500 bg-blue-500/10';
      case 'mission': return 'text-green-500 bg-green-500/10';
      case 'event': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Intelligence Search</h1>
        <p className="text-muted-foreground">Search across all intelligence data and entities</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search objects, missions, events, locations..."
            className="pl-12 pr-12 py-6 text-lg"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSearchResults([]);
                setShowSuggestions(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50">
            <CardContent className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">Suggestions</p>
              {searchSuggestions
                .filter(s => s.toLowerCase().includes(query.toLowerCase()))
                .map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-2 hover:bg-secondary rounded-md text-sm flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Stats */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Found <span className="font-medium text-foreground">{searchResults.length}</span> results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter by:</span>
            <div className="flex gap-1">
              {['all', 'object', 'mission', 'event'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    activeFilter === filter 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} ({resultCounts[filter as keyof typeof resultCounts]})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 ? (
        <div className="space-y-3">
          {filteredResults.map((result, idx) => {
            const Icon = getTypeIcon(result.type);
            return (
              <Card key={idx} className="card-hover cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(result.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{result.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(result.relevance * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {result.type === 'object' && (
                          <>
                            <span>Confidence: {result.data.confidence}%</span>
                            <span>Risk: {result.data.riskScore}/100</span>
                          </>
                        )}
                        {result.type === 'mission' && (
                          <>
                            <span>Status: {result.data.status}</span>
                            <span>Priority: {result.data.priority}</span>
                          </>
                        )}
                        {result.type === 'event' && (
                          <>
                            <span>Severity: {result.data.severity}</span>
                            <span>{format(result.data.timestamp, 'MMM d, yyyy')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : query && !isSearching ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <h3 className="text-lg font-medium mt-4">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search.query)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search.query}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(search.timestamp, 'MMM d')}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSearch('high confidence')}
                  className="p-3 text-left hover:bg-secondary rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">High Confidence</p>
                  <p className="text-xs text-muted-foreground">{objects.filter(o => o.confidence >= 80).length} objects</p>
                </button>
                <button
                  onClick={() => handleSearch('active missions')}
                  className="p-3 text-left hover:bg-secondary rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">Active Missions</p>
                  <p className="text-xs text-muted-foreground">{missions.filter(m => m.status === 'active').length} missions</p>
                </button>
                <button
                  onClick={() => handleSearch('critical alerts')}
                  className="p-3 text-left hover:bg-secondary rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">Critical Alerts</p>
                  <p className="text-xs text-muted-foreground">{events.filter(e => e.severity === 'critical').length} events</p>
                </button>
                <button
                  onClick={() => handleSearch('watchlisted')}
                  className="p-3 text-left hover:bg-secondary rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">Watchlisted</p>
                  <p className="text-xs text-muted-foreground">{objects.filter(o => o.status === 'watchlisted').length} objects</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-1">Exact Match</p>
                  <p className="text-xs text-muted-foreground">
                    Use quotes for exact phrases: &quot;Target Alpha&quot;
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-1">Type Filtering</p>
                  <p className="text-xs text-muted-foreground">
                    Prefix with type: object:person, mission:active
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-1">Date Range</p>
                  <p className="text-xs text-muted-foreground">
                    Use dates: after:2024-01-01 before:2024-12-31
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
