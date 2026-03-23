import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Ship, Plane, Truck, Crosshair, Calendar, MapPin, Edit, X,
  Navigation, Shield, Flag, Anchor, Gauge, Users, Building,
  Radio, HardDrive, Activity, Video, Image as ImageIcon,
  Wrench, Home, Layers, Target, Ruler, Wind, Zap,
  ChevronRight, Maximize2, Minimize2, AlertTriangle, Trash
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Interfaces (sin cambios)
export interface Unit {
  _id: string;
  unitId: string;
  name: string;
  class: string;
  country: string;
  flag: string;
  type: string;
  role: string;
  status: string;
  identifiers?: { mmsi?: string | null; imo?: string | null; callsign?: string | null; hullNumber?: string; };
  builder?: { shipyard?: string; location?: string; laidDown?: string | { $date: string }; launched?: string | { $date: string }; commissioned?: string | { $date: string }; cost?: { value?: number | null; currency?: string; }; };
  displacement?: { standard?: number; full?: number; unit?: string; };
  dimensions?: { length?: { overall?: number; waterline?: number | null; }; beam?: { overall?: number; waterline?: number | null; }; draft?: { max?: number; }; height?: number | null; unit?: string; };
  propulsion?: { system?: string; machinery?: Array<{ type?: string; model?: string; manufacturer?: string; quantity?: number; power?: number; powerUnit?: string; }>; propellers?: string; bowThruster?: { power?: number | null; powerUnit?: string; }; notes?: string | null; };
  performance?: { speed?: { max?: number; cruise?: number | null; economic?: number | null; unit?: string; }; range?: Array<{ value?: number; atSpeed?: number; unit?: string; }>; endurance?: string | null; seakeeping?: string | null; };
  complement?: { crew?: number; airWing?: number | null; troops?: number | null; flagshipStaff?: number | null; maxCapacity?: number | null; notes?: string | null; };
  aviation?: any;
  amphibious?: any;
  armament?: Array<any>;
  sensors?: Array<any>;
  countermeasures?: Array<any>;
  communications?: { satcom?: string[]; dataLinks?: string[]; secureComms?: boolean | null; notes?: string | null; };
  homeport?: string;
  currentBase?: string;
  fleet?: string;
  squadron?: string | null;
  history?: any;
  metadata?: any;
  domain?: string;
  images?: { url: string; title?: string }[];
  videos?: { url: string; title?: string }[];
  lastPositions?: { lat: number; lon: number; timestamp: string }[];
  description?: string;
}

interface Mission {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface BiggerCardProps {
  unit: Unit;
  missions: Mission[];
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

// ── Componentes Auxiliares ──

const CompactDataGrid = ({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 5 }) => {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
  };
  return <div className={cn("grid gap-3 md:gap-4", colClasses[cols])}>{children}</div>;
};

const InfoChip = ({
  label,
  value,
  icon: Icon,
  unit = "",
  color = "default"
}: {
  label: string;
  value?: string | number | null;
  icon?: any;
  unit?: string;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}) => {
  const displayValue = (value != null && value !== "") ? `${value} ${unit}`.trim() : "—";

  const colorStyles = {
    default: "bg-card/70 border-border/50 backdrop-blur-sm hover:border-border/80",
    primary: "bg-primary/8 border-primary/30 backdrop-blur-sm hover:bg-primary/12",
    success: "bg-emerald-950/30 border-emerald-500/30 hover:bg-emerald-950/40",
    warning: "bg-amber-950/30 border-amber-500/30 hover:bg-amber-950/40",
    danger: "bg-red-950/30 border-red-500/30 hover:bg-red-950/40",
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200",
      "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
      colorStyles[color]
    )}>
      {Icon && (
        <div className="p-1.5 rounded-lg bg-background/50 group-hover:bg-background/70 transition-colors">
          <Icon className="w-4 h-4 text-muted-foreground/80 group-hover:text-primary transition-colors" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/80">
          {label}
        </div>
        <div className="font-mono font-semibold text-sm md:text-base leading-tight truncate">
          {displayValue}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ children, title, icon: Icon }: { children: React.ReactNode; title: string; icon?: any }) => (
  <div className={cn(
    "relative p-5 rounded-xl overflow-hidden",
    "bg-gradient-to-br from-card/80 via-card/60 to-card/40",
    "border border-border/50 shadow-sm",
    "transition-all duration-200 hover:shadow-lg hover:border-primary/40 group"
  )}>
    <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-15 transition-opacity duration-300">
      {Icon && <Icon className="w-24 h-24 text-primary rotate-12" />}
    </div>

    <div className="relative flex items-center gap-2.5 text-xs uppercase tracking-wider text-muted-foreground mb-2">
      {Icon && <Icon className="w-4 h-4 text-primary/80" />}
      {title}
    </div>

    <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
      {children}
    </div>
  </div>
);

const SectionCollapsible = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 font-medium text-sm">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {title}
        </div>
        <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", isOpen && "rotate-90")} />
      </button>
      {isOpen && <div className="px-5 pb-5 pt-1 border-t border-border/40">{children}</div>}
    </div>
  );
};

const DateBadge = ({ date, label }: { date?: string | { $date: string } | null; label?: string }) => {
  if (!date) return null;

  let dateObj: Date | null = null;
  if (typeof date === 'string') dateObj = new Date(date);
  else if (date.$date) dateObj = new Date(date.$date);

  return dateObj ? (
    <Badge variant="outline" className="text-[10px] font-mono px-2.5 py-0.5 border-primary/30 bg-primary/5">
      {label && <span className="text-muted-foreground mr-1.5">{label}:</span>}
      {format(dateObj, 'dd/MM/yyyy')}
    </Badge>
  ) : null;
};

// ── Componente Principal MEJORADO ──

export function BiggerCard({ unit, missions, onClose, onEdit, onDelete, className }: BiggerCardProps) {
  const [denseMode, setDenseMode] = React.useState(true);

  const getDomainIcon = (domain?: string) => {
    switch (domain?.toLowerCase()) {
      case 'naval': return <Ship className="w-7 h-7 md:w-9 md:h-9" />;
      case 'air': case 'aeronaval': return <Plane className="w-7 h-7 md:w-9 md:h-9" />;
      case 'land': return <Truck className="w-7 h-7 md:w-9 md:h-9" />;
      default: return <Crosshair className="w-7 h-7 md:w-9 md:h-9" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'activo': return 'bg-emerald-600 text-white border-emerald-700/40';
      case 'mantenimiento': return 'bg-amber-600 text-white border-amber-700/40';
      case 'desplegado': return 'bg-blue-600 text-white border-blue-700/40';
      default: return 'bg-slate-700 text-white border-slate-800/40';
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full w-full bg-gradient-to-br from-background via-background to-muted/30",
      "relative isolate overflow-hidden rounded-xl border border-border/40 shadow-2xl",
      className
    )}>
      {/* Header - Siempre visible */}
      <header className={cn(
        "relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        "px-6 md:px-8 py-5 border-b bg-gradient-to-r from-card/90 via-card to-card/90 backdrop-blur-xl",
        "shadow-sm flex-shrink-0"
      )}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="p-3.5 md:p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
              {getDomainIcon(unit.domain)}
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-background shadow-sm",
              unit.status?.toLowerCase() === 'activo' ? 'bg-emerald-500' : 'bg-slate-500'
            )} />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={cn(
                "text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight",
                "bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent",
                "leading-tight truncate max-w-[280px] md:max-w-[420px] lg:max-w-none"
              )}>
                {unit.name}
              </h2>
              <Badge variant="outline" className="font-mono text-xs py-0 h-6 border-muted-foreground/40 bg-muted/40">
                {unit.unitId}
              </Badge>
              <Badge className={cn(
                "text-xs font-bold uppercase px-3 py-0 h-6 border-0 shadow-sm",
                getStatusColor(unit.status)
              )}>
                {unit.status || 'Desconocido'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> {unit.country}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="italic">{unit.class}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="font-semibold text-primary/90 uppercase text-[11px]">{unit.role || unit.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9"
            onClick={() => setDenseMode(!denseMode)}
            title={denseMode ? "Vista expandida" : "Vista compacta"}
          >
            {denseMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-9 text-xs gap-1.5 px-3"
              onClick={onEdit}  // Asegúrate de que esto llama a la función
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}
          {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 md:h-9 text-xs gap-1.5 px-3"
                onClick={onDelete}
              >
                <Trash className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Tabs - Con altura flexible y scroll en contenido */}
      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 md:px-8 bg-gradient-to-b from-muted/20 to-transparent border-b shrink-0 overflow-x-auto scrollbar-thin flex-shrink-0">
          <TabsList className={cn(
            "h-11 md:h-12 bg-transparent rounded-none w-max justify-start gap-3 md:gap-8 border-b border-border/30",
            "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-primary/60 after:to-primary/30 after:transition-all"
          )}>
            {[
              { value: "general", label: "General" },
              { value: "aviation", label: "Aviación + Anfibio" },
              { value: "weapons", label: `Armamento / Sensores / CM (${(unit.armament?.length || 0) + (unit.sensors?.length || 0) + (unit.countermeasures?.length || 0)})` },
              { value: "history", label: "Historial" },
              { value: "missions", label: `Misiones (${missions.length})` },
              { value: "multimedia", label: "Multimedia" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative px-5 md:px-7 data-[state=active]:text-primary",
                  "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenedor con scroll para todas las pestañas */}
        <div className="flex-1 min-h-0 relative">
          {/* General */}
          <TabsContent value="general" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                {/* Info principal */}
                <CompactDataGrid cols={denseMode ? 4 : 3}>
                  <InfoChip label="Tipo" value={unit.type} icon={Ship} color="primary" />
                  <InfoChip label="Clase" value={unit.class} icon={Layers} />
                  <InfoChip label="Rol" value={unit.role} icon={Target} />
                  <InfoChip label="País" value={unit.country} icon={Flag} color="success" />
                  <InfoChip label="Puerto Base" value={unit.homeport} icon={Home} />
                  <InfoChip label="Base Actual" value={unit.currentBase} icon={MapPin} />
                  <InfoChip label="Flota" value={unit.fleet} icon={Shield} />
                  <InfoChip label="Escuadrón" value={unit.squadron} icon={Flag} />
                </CompactDataGrid>

                {/* Identificadores + Constructor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {unit.identifiers && (
                    <div className="p-4 rounded-xl border bg-card/50">
                      <p className="text-sm font-medium mb-2">Identificadores</p>
                      <div className="flex flex-wrap gap-2">
                        {unit.identifiers.mmsi && <Badge>MMSI: {unit.identifiers.mmsi}</Badge>}
                        {unit.identifiers.imo && <Badge>IMO: {unit.identifiers.imo}</Badge>}
                        {unit.identifiers.callsign && <Badge>Callsign: {unit.identifiers.callsign}</Badge>}
                        {unit.identifiers.hullNumber && <Badge>Hull: {unit.identifiers.hullNumber}</Badge>}
                      </div>
                    </div>
                  )}

                  {unit.builder && (
                    <div className="p-4 rounded-xl border bg-card/50">
                      <p className="text-sm font-medium mb-2">Constructor</p>
                      <div className="space-y-1.5 text-sm">
                        {unit.builder.shipyard && <div>Astillero: {unit.builder.shipyard}</div>}
                        {unit.builder.location && <div>Ubicación: {unit.builder.location}</div>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <DateBadge date={unit.builder.laidDown} label="Quilla" />
                          <DateBadge date={unit.builder.launched} label="Botado" />
                          <DateBadge date={unit.builder.commissioned} label="Alta" />
                        </div>
                        {unit.builder.cost?.value && (
                          <div className="mt-2 font-medium">Coste: {unit.builder.cost.value} {unit.builder.cost.currency}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dimensiones + Desplazamiento */}
                <SectionCollapsible title="Dimensiones y Desplazamiento" icon={Ruler} defaultOpen>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <CompactDataGrid cols={2}>
                        <InfoChip label="Eslora total" value={unit.dimensions?.length?.overall} unit="m" />
                        <InfoChip label="Eslora LWL" value={unit.dimensions?.length?.waterline} unit="m" />
                        <InfoChip label="Manga total" value={unit.dimensions?.beam?.overall} unit="m" />
                        <InfoChip label="Manga LWL" value={unit.dimensions?.beam?.waterline} unit="m" />
                        <InfoChip label="Calado máx." value={unit.dimensions?.draft?.max} unit="m" />
                        <InfoChip label="Altura" value={unit.dimensions?.height} unit="m" />
                      </CompactDataGrid>
                    </div>
                    <div>
                      <CompactDataGrid cols={2}>
                        <InfoChip label="Desplazamiento estándar" value={unit.displacement?.standard} unit="t" />
                        <InfoChip label="Desplazamiento plena carga" value={unit.displacement?.full} unit="t" color="primary" />
                      </CompactDataGrid>
                    </div>
                  </div>
                </SectionCollapsible>

                {/* Propulsión */}
                <SectionCollapsible title="Propulsión" icon={Gauge} defaultOpen>
                  <CompactDataGrid cols={3}>
                    <InfoChip label="Sistema" value={unit.propulsion?.system} color="primary" />
                    <InfoChip label="Hélices" value={unit.propulsion?.propellers} />
                    {unit.propulsion?.bowThruster?.power && (
                      <InfoChip label="Bow thruster" value={unit.propulsion.bowThruster.power} unit={unit.propulsion.bowThruster.powerUnit || "kW"} />
                    )}
                  </CompactDataGrid>

                  {unit.propulsion?.machinery?.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {unit.propulsion.machinery.map((m, i) => (
                        <div key={i} className="p-3 border rounded-lg bg-card/60 text-sm">
                          <div className="font-medium">{m.type} {m.model ? `(${m.model})` : ''}</div>
                          {m.manufacturer && <div className="text-muted-foreground">{m.manufacturer}</div>}
                          {m.power && <div>{m.power} {m.powerUnit} × {m.quantity}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {unit.propulsion?.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic">{unit.propulsion.notes}</p>
                  )}
                </SectionCollapsible>

                {/* Rendimiento */}
                <SectionCollapsible title="Rendimiento" icon={Zap} defaultOpen>
                  <CompactDataGrid cols={4}>
                    <InfoChip label="Vel. máxima" value={unit.performance?.speed?.max} unit={unit.performance?.speed?.unit} color="primary" />
                    <InfoChip label="Vel. crucero" value={unit.performance?.speed?.cruise} unit={unit.performance?.speed?.unit} />
                    <InfoChip label="Vel. económica" value={unit.performance?.speed?.economic} unit={unit.performance?.speed?.unit} />
                    <InfoChip label="Autonomía" value={unit.performance?.endurance} />
                  </CompactDataGrid>

                  {unit.performance?.range?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Rangos</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {unit.performance.range.map((r, i) => (
                          <div key={i} className="p-3 bg-card/60 rounded-lg text-sm border">
                            {r.value} {r.unit} a {r.atSpeed} kn
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {unit.performance?.seakeeping && (
                    <p className="mt-3 text-sm">Estado de la mar: {unit.performance.seakeeping}</p>
                  )}
                </SectionCollapsible>

                {/* Dotación + Comunicaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionCollapsible title="Dotación" icon={Users}>
                    <CompactDataGrid cols={2}>
                      <InfoChip label="Tripulación" value={unit.complement?.crew} />
                      <InfoChip label="Ala aérea" value={unit.complement?.airWing} />
                      <InfoChip label="Tropas" value={unit.complement?.troops} />
                      <InfoChip label="Cap. máxima" value={unit.complement?.maxCapacity} />
                    </CompactDataGrid>
                    {unit.complement?.notes && <p className="mt-3 text-sm text-muted-foreground">{unit.complement.notes}</p>}
                  </SectionCollapsible>

                  <SectionCollapsible title="Comunicaciones" icon={Radio}>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-1.5">SATCOM</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(unit.communications?.satcom) && unit.communications.satcom.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>) || "—"}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5">Data Links</p>
                        <div className="flex flex-wrap gap-2">
                          {unit.communications?.dataLinks?.map((d, i) => <Badge key={i} variant="secondary">{d}</Badge>) || "—"}
                        </div>
                      </div>
                      <InfoChip
                        label="Comunicaciones seguras"
                        value={unit.communications?.secureComms ? "Sí" : "No"}
                        color={unit.communications?.secureComms ? "success" : "danger"}
                      />
                      {unit.communications?.notes && <p className="text-sm mt-2">{unit.communications.notes}</p>}
                    </div>
                  </SectionCollapsible>
                </div>

                {/* Descripción si existe */}
                {unit.description && (
                  <div className="p-4 rounded-xl border bg-card/50">
                    <p className="text-sm font-medium mb-2">Descripción</p>
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* AVIACIÓN + ANFIBIO */}
          <TabsContent value="aviation" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                {unit.aviation && (
                  <SectionCollapsible title="Aviación" icon={Plane} defaultOpen>
                    <CompactDataGrid cols={3}>
                      <InfoChip label="Máx. aeronaves" value={unit.aviation.maxAircraft} />
                      <InfoChip label="Helicópteros hangar" value={unit.aviation.hangar?.capacity?.helicopters} />
                      <InfoChip label="Cazas" value={unit.aviation.hangar?.capacity?.fighters} />
                    </CompactDataGrid>
                    {unit.aviation.flightDeck && (
                      <div className="mt-4 p-4 rounded-xl border bg-card/50">
                        <p className="font-medium">Cubierta de vuelo</p>
                        <p className="text-sm text-muted-foreground">Tipo: {unit.aviation.flightDeck.type}</p>
                        <p className="text-sm text-muted-foreground">Spots: {unit.aviation.flightDeck.spots}</p>
                        {unit.aviation.flightDeck.skiJumpAngle && <p className="text-sm text-muted-foreground">Ski-jump: {unit.aviation.flightDeck.skiJumpAngle}°</p>}
                      </div>
                    )}
                  </SectionCollapsible>
                )}

                {unit.amphibious && (
                  <SectionCollapsible title="Capacidad Anfibia" icon={Anchor} defaultOpen>
                    {unit.amphibious.wellDeck && (
                      <div className="p-4 rounded-xl border bg-card/50 mb-4">
                        <p className="font-medium">Well Deck</p>
                        <p className="text-sm">Longitud: {unit.amphibious.wellDeck.length} m | Ancho: {unit.amphibious.wellDeck.width} m</p>
                      </div>
                    )}
                    {unit.amphibious.vehicleDeck && (
                      <div className="p-4 rounded-xl border bg-card/50">
                        <p className="font-medium">Vehículos</p>
                        <p className="text-sm">Tanques: {unit.amphibious.vehicleDeck.capacity?.tanks} | Vehículos ligeros: {unit.amphibious.vehicleDeck.capacity?.lightVehicles}</p>
                      </div>
                    )}
                  </SectionCollapsible>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ARMAMENTO + SENSORES + CONTRAMEDIDAS */}
          <TabsContent value="weapons" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                {/* Armamento */}
                {unit.armament && unit.armament.length > 0 && (
                  <SectionCollapsible title="Armamento" icon={Target} defaultOpen>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {unit.armament.map((weapon, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-base">{weapon.name}</p>
                              <p className="text-sm text-muted-foreground">{weapon.type}</p>
                            </div>
                            {weapon.quantity && <Badge variant="outline" className="text-xs shrink-0">×{weapon.quantity}</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            {weapon.caliber && <span className="text-muted-foreground">Cal: {weapon.caliber}</span>}
                            {weapon.fireControl && <span className="text-muted-foreground text-right">FC: {weapon.fireControl}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCollapsible>
                )}

                {/* Sensores */}
                {unit.sensors && unit.sensors.length > 0 && (
                  <SectionCollapsible title="Sensores" icon={Radio} defaultOpen>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unit.sensors.map((sensor, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-card/50">
                          <div className="flex items-center gap-3">
                            <Radio className="w-5 h-5 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-base truncate">{sensor.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{sensor.type}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            {sensor.manufacturer && <span className="truncate">{sensor.manufacturer}</span>}
                            {sensor.range && <span className="text-right">{sensor.range}{sensor.rangeUnit || 'km'}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCollapsible>
                )}

                {/* Contramedidas */}
                {unit.countermeasures && unit.countermeasures.length > 0 && (
                  <SectionCollapsible title="Contramedidas" icon={AlertTriangle} defaultOpen>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {unit.countermeasures.map((cm, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-card/50">
                          <p className="font-medium">{cm.name}</p>
                          <p className="text-sm text-muted-foreground">{cm.type}</p>
                          {cm.quantity && <p className="text-xs mt-1">Cantidad: {cm.quantity}</p>}
                        </div>
                      ))}
                    </div>
                  </SectionCollapsible>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* HISTORIAL */}
          <TabsContent value="history" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl">
                  <DateBadge date={unit.history?.keelLaid} label="Quilla" />
                  <DateBadge date={unit.history?.launched} label="Botadura" />
                  <DateBadge date={unit.history?.commissioned} label="Alta" />
                  <DateBadge date={unit.history?.decommissioned} label="Baja" />
                </div>

                {unit.history?.majorEvents && unit.history.majorEvents.length > 0 && (
                  <div className="space-y-3">
                    {unit.history.majorEvents.map((event: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border bg-card/50 text-sm">
                        <div className="flex justify-between items-start gap-3">
                          <span className="font-medium">{event.event}</span>
                          <DateBadge date={event.date} />
                        </div>
                        {event.location && <p className="text-sm text-muted-foreground mt-2">{event.location}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* MISIONES */}
          <TabsContent value="missions" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                {missions.length > 0 ? (
                  <div className="space-y-4">
                    {missions.map((mission) => (
                      <div key={mission._id} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-base truncate">{mission.name}</p>
                            {mission.description && <p className="text-sm text-muted-foreground mt-1 truncate">{mission.description}</p>}
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">{mission.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                          {format(new Date(mission.startDate), 'dd/MM/yy')}
                          {mission.endDate && ` — ${format(new Date(mission.endDate), 'dd/MM/yy')}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-sm text-muted-foreground">Sin misiones registradas</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* MULTIMEDIA */}
          <TabsContent value="multimedia" className="absolute inset-0 mt-0 data-[state=active]:block hidden">
            <ScrollArea className="h-full bg-muted/5">
              <div className={cn("p-5 md:p-8", denseMode ? "space-y-6" : "space-y-10")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {unit.images?.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Imágenes</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {unit.images.map((img, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden bg-black">
                            <img
                              src={img.url}
                              alt={img.title || "Imagen de la unidad"}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform"
                            />
                            {img.title && <p className="p-2 text-xs text-center bg-muted/80">{img.title}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay imágenes registradas</p>
                  )}

                  {unit.videos?.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Videos</h3>
                      <div className="space-y-6">
                        {unit.videos.map((vid, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden bg-black">
                            <video
                              src={vid.url}
                              controls
                              className="w-full h-64 object-contain"
                            />
                            {vid.title && <p className="p-2 text-sm text-center bg-muted/80">{vid.title}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay videos registrados</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer - Siempre visible */}
      <footer className="px-6 md:px-8 py-3 border-t bg-muted/20 text-[10px] md:text-xs font-mono text-muted-foreground flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <HardDrive className="w-3.5 h-3.5" />
          <span>v2.5.2 - General ampliado</span>
          <Activity className="w-3.5 h-3.5 ml-2" />
          <span className="text-emerald-500">Online</span>
        </div>
        <div>ID: {unit._id?.toString().slice(-6) || '—'}</div>
      </footer>
    </div>
  );
}