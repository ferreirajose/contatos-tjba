import { Injectable } from '@angular/core';

export type EventoAcesso =
  | 'BALCAO_VIRTUAL'
  | 'AGENDA_MAGISTRADO';

export interface RegistroAcesso {
  readonly evento: EventoAcesso;
  readonly unidadeId: string;
  readonly unidadeNome: string;
  readonly url: string;
  readonly timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  registrarAcesso(registro: Omit<RegistroAcesso, 'timestamp'>): void {
    const evento: RegistroAcesso = {
      ...registro,
      timestamp: new Date().toISOString(),
    };
    console.info('[metricas] acesso registrado', evento);
  }
}
