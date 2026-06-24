// Estado compartido entre el bot y el dashboard web
export const dashboardState = {
  pairingCode: null as string | null,
  pairingCodeGeneratedAt: null as number | null,
  needsPairing: false,
};
