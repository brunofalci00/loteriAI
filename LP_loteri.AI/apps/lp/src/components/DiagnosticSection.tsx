import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface DiagnosticSectionProps {
  title: string;
  status: "success" | "warning" | "info";
  diagnosis: string;
  recommendation: string;
  idealRange?: string;
  highlightNumbers?: number[];
  highlightLabel?: string;
}

const statusStyles = {
  success: {
    icon: CheckCircle,
    container: "bg-emerald-900/45 border border-emerald-500/40",
    iconColor: "text-emerald-300",
    badgeClass: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
    chipClass: "bg-emerald-500/25 text-emerald-50 border border-emerald-400/40",
  },
  warning: {
    icon: AlertCircle,
    container: "bg-amber-900/45 border border-amber-500/35",
    iconColor: "text-amber-300",
    badgeClass: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
    chipClass: "bg-amber-500/25 text-amber-50 border border-amber-400/35",
  },
  info: {
    icon: Info,
    container: "bg-sky-900/45 border border-sky-500/35",
    iconColor: "text-sky-300",
    badgeClass: "bg-sky-500/20 text-sky-100 border border-sky-400/40",
    chipClass: "bg-sky-500/25 text-sky-50 border border-sky-400/35",
  },
} as const;

export function DiagnosticSection({
  title,
  status,
  diagnosis,
  recommendation,
  idealRange,
  highlightNumbers,
  highlightLabel,
}: DiagnosticSectionProps) {
  const config = statusStyles[status];
  const Icon = config.icon;

  return (
    <section className={cn("rounded-2xl p-5 space-y-3 shadow-inner", config.container)}>
      <header className="flex items-center gap-3 flex-wrap">
        <Icon className={cn("h-5 w-5", config.iconColor)} />
        <h4 className="font-semibold text-sm text-white tracking-wide">{title}</h4>

        {idealRange && (
          <Badge className={cn("text-[10px] uppercase tracking-wide", config.badgeClass)}>
            Ideal: {idealRange}
          </Badge>
        )}
      </header>

      <div className="space-y-3 text-sm text-white/85 leading-relaxed">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60 mb-1">
            Diagnóstico
          </p>
          <p>{diagnosis}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60 mb-1">
            Recomendações
          </p>
          <p className="font-semibold text-white">{recommendation}</p>
        </div>

        {highlightNumbers && highlightNumbers.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60 mb-2">
              {highlightLabel ?? "Sugestão de números"}
            </p>
            <div className="flex flex-wrap gap-2">
              {highlightNumbers.map((num) => (
                <span
                  key={num}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold shadow-sm tracking-wide",
                    config.chipClass
                  )}
                >
                  {num.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
