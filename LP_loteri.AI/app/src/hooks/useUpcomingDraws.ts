import { useQuery } from "@tanstack/react-query";
import { useLotteryDrawInfo } from "./useLotteryDrawInfo";
import { generateUpcomingDraws, UpcomingDraw } from "@/utils/lotterySchedule";

export const useUpcomingDraws = (lotteryType: string, count: number = 7) => {
  const { data: drawInfo, isLoading: isLoadingDrawInfo, error: drawInfoError } = useLotteryDrawInfo(lotteryType);

  return useQuery<UpcomingDraw[], Error>({
    queryKey: ["upcomingDraws", lotteryType, count],
    queryFn: () => {
      if (!drawInfo) {
        throw new Error("Informações do concurso não disponíveis");
      }
      return generateUpcomingDraws(lotteryType, drawInfo, count);
    },
    enabled: !!drawInfo && !isLoadingDrawInfo,
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
};
