import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, ArrowRight } from "lucide-react";
import { isMegaEventEnabled } from "@/config/features";
import { MEGA_EVENT_CONFIG } from "@/config/megaEvent";

const eventDate = MEGA_EVENT_CONFIG.endDate.getTime();

const formatNumber = (value: number) => value.toString().padStart(2, "0");

export const MegaEventHero = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(eventDate - Date.now(), 0);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(eventDate - Date.now(), 0);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(
    () => [
      { label: "Prêmio", value: "R$ 850 Mi" },
      { label: "Para todos", value: "Usuários app" },
      { label: "Até", value: "07/01/2025" },
    ],
    []
  );

  return (
    <Card className="relative mb-10 overflow-hidden border-0 bg-transparent shadow-none">
      <div className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f7c948] via-[#ffb347] to-[#f06543] p-6 text-slate-900 sm:p-8">
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4 text-balance">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-800/80">
              <Badge variant="secondary" className="bg-white/20 text-slate-900">
                Mega da Virada 24/25
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/40 px-3 py-1">
                <Sparkles className="h-3 w-3" />
                Somente no app
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-800/80">
                Análises exclusivas para o evento
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Use seus créditos em ferramentas especiais para disputar R$ 850 milhões.
              </h1>
            </div>
            <p className="text-base text-slate-900/80 sm:text-lg">
              Geração IA otimizada, análises com dados históricos e variações estratégicas da Mega da Virada.
              Disponível até 07 de janeiro, poucos dias após o sorteio.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                variant="hero"
                className="w-full sm:w-auto"
                disabled={!isMegaEventEnabled}
                onClick={() => {
                  if (isMegaEventEnabled) {
                    navigate("/mega-da-virada");
                  }
                }}
              >
                {isMegaEventEnabled ? "Entrar no evento" : "Em breve"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/50 text-slate-900 hover:bg-white/20 sm:w-auto"
                onClick={() => navigate("/criar-jogo")}
              >
                Construir jogo manual
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-white/20 p-5 text-center text-slate-900 shadow-lg sm:flex-row sm:items-center sm:justify-center lg:flex-col lg:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-800/70">
                Contagem regressiva
              </p>
              <div className="mt-2 flex items-center justify-between gap-3 text-3xl font-bold sm:text-4xl">
                <div className="flex flex-col">
                  <span>{formatNumber(timeLeft.days)}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-800/70">
                    dias
                  </span>
                </div>
                <span className="text-2xl">:</span>
                <div className="flex flex-col">
                  <span>{formatNumber(timeLeft.hours)}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-800/70">
                    horas
                  </span>
                </div>
                <span className="text-2xl">:</span>
                <div className="flex flex-col">
                  <span>{formatNumber(timeLeft.minutes)}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-800/70">
                    min
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:flex-col lg:items-start">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/30 px-4 py-3 text-left shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-800/70">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/30 px-4 py-3 text-sm font-medium">
              <Coins className="h-4 w-4 text-slate-800" />
              1 crédito por ação premium
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
