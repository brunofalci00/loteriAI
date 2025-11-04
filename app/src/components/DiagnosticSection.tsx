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
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100',
      badgeVariant: 'default' as const
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      badgeVariant: 'secondary' as const
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100',
      badgeVariant: 'outline' as const
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 space-y-3`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <h4 className={`font-semibold text-sm ${config.textColor}`}>{title}</h4>
        {idealRange && (
          <Badge variant={config.badgeVariant} className="text-xs">
            Ideal: {idealRange}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className={`text-xs font-medium mb-1 ${config.textColor} opacity-70`}>Diagnóstico:</p>
          <p className={`text-sm ${config.textColor}`}>{diagnosis}</p>
        </div>

        <div>
          <p className={`text-xs font-medium mb-1 ${config.textColor} opacity-70`}>💡 Recomendação:</p>
          <p className={`text-sm font-medium ${config.textColor}`}>{recommendation}</p>
        </div>
      </div>
    </div>
  );
}
