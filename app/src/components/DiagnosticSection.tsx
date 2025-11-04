import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface DiagnosticSectionProps {
  title: string;
  status: 'success' | 'warning' | 'info';
  diagnosis: string;
  recommendation: string;
  idealRange?: string;
}

export function DiagnosticSection({
  title,
  status,
  diagnosis,
  recommendation,
  idealRange
}: DiagnosticSectionProps) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      badgeVariant: 'default' as const
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      badgeVariant: 'secondary' as const
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      badgeVariant: 'outline' as const
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 space-y-3`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
        <h4 className="font-semibold text-sm">{title}</h4>
        {idealRange && (
          <Badge variant={config.badgeVariant} className="text-xs">
            Ideal: {idealRange}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Diagnóstico:</p>
          <p className="text-sm">{diagnosis}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Recomendação:</p>
          <p className="text-sm font-medium">{recommendation}</p>
        </div>
      </div>
    </div>
  );
}
