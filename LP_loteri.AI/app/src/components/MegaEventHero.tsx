import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, Crown, Target, Zap } from "lucide-react";

const formatNumber = (value: number) => value.toString().padStart(2, "0");

const insights = [
  { icon: Crown, title: "Jackpot", value: "R$ 850 Mi" },
  { icon: Target, title: "Para", value: "Todos os usuários" },
  { icon: Clock, title: "Até", value: "31/12/2025" },
];

export const MegaEventHero = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 48, hours: 12, minutes: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes } = prev;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days = Math.max(days - 1, 0);
          }
        }
        return { days, hours, minutes };
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const countdown = useMemo(
    () => [
      { label: "dias", value: formatNumber(timeLeft.days) },
      { label: "horas", value: formatNumber(timeLeft.hours) },
      { label: "min", value: formatNumber(timeLeft.minutes) },
    ],
    [timeLeft]
  );

  return (
    <div className="shimmer-border rounded-3xl p-[1px] text-foreground shadow-lg shadow-emerald-500/20">
      <div className="relative flex flex-col gap-6 rounded-[calc(var(--radius)*2)] bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-slate-950/80 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-emerald-100/70">
            <Badge variant="secondary" className="bg-emerald-400/15 text-emerald-100">
              Mega da Virada 25/26
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 px-3 py-1 text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Somente no app
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-100/70">
              Evento exclusivo
            </p>
            <h2 className="text-2xl font-black leading-tight sm:text-3xl">
              Estratégias prontas para disputar o maior prêmio do ano.
            </h2>
            <p className="text-sm text-emerald-100/70">
              Insights históricos, análises assistidas por IA e combos de números sugeridos para entrar no concurso especial da Mega da Virada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="min-w-[180px]" onClick={() => navigate("/mega-da-virada")}>
              Entrar no evento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/criar-jogo")}
            >
              Montar jogo manual
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4 text-sm text-white/80 backdrop-blur lg:max-w-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <span>Contagem</span>
            <span>regressiva</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-emerald-600/10 px-4 py-3">
            {countdown.map((item, index) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {insights.map((stat) => (
              <div key={stat.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <stat.icon className="h-4 w-4 text-amber-300" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">{stat.title}</p>
                  <p className="text-sm font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            <Zap className="h-4 w-4" />
            1 crédito por ação premium
          </div>
        </div>
      </div>
    </div>
  );
};
