import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LotteryCard } from "@/components/LotteryCard";
import { useLotteryDrawInfo } from "@/hooks/useLotteryDrawInfo";
import { useMemo } from "react";

const lotteries = [
  {
    id: "mega-sena",
    name: "Mega-Sena",
    description: "6 números entre 1 e 60",
    icon: "🎱",
    numbersCount: 6,
  },
  {
    id: "quina",
    name: "Quina",
    description: "5 números entre 1 e 80",
    icon: "⭐",
    numbersCount: 5,
  },
  {
    id: "lotofacil",
    name: "Lotofácil",
    description: "15 números entre 1 e 25",
    icon: "🎯",
    numbersCount: 15,
  },
  {
    id: "lotomania",
    name: "Lotomania",
    description: "50 números entre 1 e 100",
    icon: "🔮",
    numbersCount: 50,
  },
  {
    id: "dupla-sena",
    name: "Dupla Sena",
    description: "6 números entre 1 e 50 (2 sorteios)",
    icon: "🎲",
    numbersCount: 6,
  },
  {
    id: "timemania",
    name: "Timemania",
    description: "10 números entre 1 e 80",
    icon: "⚽",
    numbersCount: 10,
  },
  {
    id: "mais-milionaria",
    name: "+Milionária",
    description: "6 números + 2 trevos",
    icon: "💰",
    numbersCount: 8,
  },
  {
    id: "federal",
    name: "Federal",
    description: "5 bilhetes de 5 dígitos",
    icon: "🎟️",
    numbersCount: 5,
  },
  {
    id: "dia-de-sorte",
    name: "Dia de Sorte",
    description: "7 números + mês da sorte",
    icon: "🍀",
    numbersCount: 7,
  },
  {
    id: "super-sete",
    name: "Super Sete",
    description: "7 colunas com números",
    icon: "🎰",
    numbersCount: 7,
  },
];

const LotteryCardWithData = ({ lottery, onClick }: { lottery: typeof lotteries[0]; onClick: () => void }) => {
  const { data, isLoading } = useLotteryDrawInfo(lottery.id);

  return (
    <LotteryCard
      name={lottery.name}
      description={lottery.description}
      icon={lottery.icon}
      numbersCount={lottery.numbersCount}
      onClick={onClick}
      nextDrawDate={data?.nextDrawDate}
      estimatedPrize={data?.estimatedPrize}
      isLoading={isLoading}
    />
  );
};

const useLotteryData = (lotteryId: string) => {
  return useLotteryDrawInfo(lotteryId);
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Coletar dados de todas as loterias
  const megaSenaData = useLotteryData("mega-sena");
  const quinaData = useLotteryData("quina");
  const lotofacilData = useLotteryData("lotofacil");
  const lotomaniaData = useLotteryData("lotomania");
  const duplaSenaData = useLotteryData("dupla-sena");
  const timemaniaData = useLotteryData("timemania");
  const maisMilionariaData = useLotteryData("mais-milionaria");
  const federalData = useLotteryData("federal");
  const diaDeSorteData = useLotteryData("dia-de-sorte");
  const superSeteData = useLotteryData("super-sete");

  // Ordenar loterias por data de expiração e prêmio
  const sortedLotteries = useMemo(() => {
    const lotteriesWithData = [
      { ...lotteries[0], drawData: megaSenaData.data },
      { ...lotteries[1], drawData: quinaData.data },
      { ...lotteries[2], drawData: lotofacilData.data },
      { ...lotteries[3], drawData: lotomaniaData.data },
      { ...lotteries[4], drawData: duplaSenaData.data },
      { ...lotteries[5], drawData: timemaniaData.data },
      { ...lotteries[6], drawData: maisMilionariaData.data },
      { ...lotteries[7], drawData: federalData.data },
      { ...lotteries[8], drawData: diaDeSorteData.data },
      { ...lotteries[9], drawData: superSeteData.data },
    ];

    return lotteriesWithData.sort((a, b) => {
      // Critério 1: Ordenar por data (mais próximo primeiro)
      const dateA = a.drawData?.nextDrawDate?.getTime() || Infinity;
      const dateB = b.drawData?.nextDrawDate?.getTime() || Infinity;
      
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // Critério 2: Se datas iguais, ordenar por prêmio (maior primeiro)
      const prizeA = a.drawData?.estimatedPrize || 0;
      const prizeB = b.drawData?.estimatedPrize || 0;
      return prizeB - prizeA;
    });
  }, [
    megaSenaData.data,
    quinaData.data,
    lotofacilData.data,
    lotomaniaData.data,
    duplaSenaData.data,
    timemaniaData.data,
    maisMilionariaData.data,
    federalData.data,
    diaDeSorteData.data,
    superSeteData.data,
  ]);

  const handleLotteryClick = (lotteryId: string) => {
    window.scrollTo(0, 0);
    navigate(`/lottery/${lotteryId}/contests`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Escolha sua Loteria</h1>
          <p className="text-lg text-muted-foreground">
            Selecione a modalidade que deseja analisar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedLotteries.map((lottery) => (
            <LotteryCardWithData
              key={lottery.id}
              lottery={lottery}
              onClick={() => handleLotteryClick(lottery.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
