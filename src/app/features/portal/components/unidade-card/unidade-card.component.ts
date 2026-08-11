import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AreaInteresse, Unidade } from '../../../../core/models/unidade.model';
import {
  AnalyticsService,
  EventoAcesso,
} from '../../../../core/services/analytics.service';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';

interface AreaConfig {
  readonly label: string;
  readonly cor: string;
}

const AREA_CONFIG: Record<AreaInteresse, AreaConfig> = {
  PRIMEIRO_GRAU: { label: '1º Grau', cor: '#F97316' },
  SEGUNDO_GRAU: { label: '2º Grau', cor: '#6CB6FF' },
  EXTRAJUDICIAL: { label: 'Extrajudicial', cor: '#F84711' },
  JUIZADO: { label: 'Juizado', cor: '#A91E2C' },
  TURMA_RECURSAL: { label: 'Turma Recursal', cor: '#7D11F8' },
};

@Component({
  selector: 'app-unidade-card',
  standalone: true,
  imports: [TelefonePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unidade-card.component.html',
  styleUrl: './unidade-card.component.css',
})
export class UnidadeCardComponent {
  readonly unidade = input.required<Unidade>();

  protected readonly areaConfig = computed(() => AREA_CONFIG[this.unidade().area]);

  private readonly analytics = inject(AnalyticsService);

  protected labelComarca(comarcaId: string): string {
    const partes = comarcaId.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    return partes.join(' ');
  }

  protected registrarAcesso(evento: EventoAcesso, url: string): void {
    const u = this.unidade();
    this.analytics.registrarAcesso({
      evento,
      unidadeId: u.id,
      unidadeNome: u.nome,
      url,
    });
  }
}
