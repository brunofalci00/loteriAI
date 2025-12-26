import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";

const formatNumber = (value: number) => value.toString().padStart(2, "0");

// 🔒 CONTROLE DE ACESSO: Mude para false para ativar o evento
const MEGA_EVENT_LOCKED = true;

// Data da Mega da Virada: 31/12/2025 23:59:59
const MEGA_VIRADA_DATE = new Date("2025-12-31T23:59:59");

const calculateTimeLeft = () => {
  const now = new Date();
  const difference = MEGA_VIRADA_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

export const MegaEventHero = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    console.log("🏆 MegaEventHero mounted successfully");
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
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
    <div className="mega-border rounded-3xl p-[1px]">
      <div className="flex flex-col gap-4 rounded-[calc(var(--radius)*2)] bg-gradient-to-b from-amber-200 to-amber-400 px-5 py-5 text-emerald-950 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Badge className="bg-amber-200/30 text-emerald-950">Mega da Virada</Badge>
          <h2 className="text-xl font-black leading-tight sm:text-2xl">
            Tá pronto pra disputar o maior prêmio do ano?
          </h2>
          <p className="text-4xl font-black text-emerald-950">R$ 850 milhões</p>
          {MEGA_EVENT_LOCKED ? (
            <Button
              size="lg"
              disabled
              className="mt-1 w-full rounded-full bg-emerald-950/50 text-amber-200/50 cursor-not-allowed sm:w-auto"
            >
              <Lock className="mr-2 h-4 w-4" />
              Acesso exclusivo
            </Button>
          ) : (
            <Button
              size="lg"
              className="mt-1 w-full rounded-full bg-emerald-950 text-amber-200 hover:bg-emerald-900 sm:w-auto"
              onClick={() => navigate("/mega-da-virada")}
            >
              Entrar no evento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="rounded-2xl bg-emerald-950/10 px-4 py-3 text-center text-emerald-950 shadow-inner sm:min-w-[200px]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-950/70">
            Contagem
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            {countdown.map((item) => (
              <div key={item.label} className="flex-1">
                <p className="text-xl font-black">{item.value}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-950/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
