import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Unidade } from '../../../../core/models/unidade.model';

@Component({
  selector: 'app-unidade-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unidade-card.component.html',
  styleUrl: './unidade-card.component.css',
})
export class UnidadeCardComponent {
  readonly unidade = input.required<Unidade>();

  protected labelComarca(comarcaId: string): string {
    const partes = comarcaId.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    return partes.join(' ');
  }
}
