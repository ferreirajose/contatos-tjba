import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Unidade } from '../../../../core/models/unidade.model';
import {
  AnalyticsService,
  EventoAcesso,
} from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-unidade-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unidade-card.component.html',
  styleUrl: './unidade-card.component.css',
})
export class UnidadeCardComponent {
  readonly unidade = input.required<Unidade>();

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
