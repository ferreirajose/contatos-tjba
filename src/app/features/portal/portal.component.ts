import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';

import {
  FiltroUnidades,
  Unidade,
} from '../../core/models/unidade.model';
import { UnidadeService } from './services/unidade.service';
import { ConsultaUnidadesComponent } from './components/consulta-unidades/consulta-unidades.component';
import { UnidadeCardComponent } from './components/unidade-card/unidade-card.component';

interface GrupoCidade {
  readonly cidade: string;
  readonly cidadeDisplay: string;
  readonly unidades: readonly Unidade[];
}

const PAGE_SIZE = 20;
const INITIAL_FILTRO: FiltroUnidades = {
  termo: null,
  areas: [],
  localidades: [],
  comarcaId: null,
  unidadeId: null,
};

@Component({
  selector: 'app-portal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    ConsultaUnidadesComponent,
    UnidadeCardComponent,
  ],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
})
export class PortalComponent implements OnInit, OnDestroy {
  protected readonly filtro = signal<FiltroUnidades>(INITIAL_FILTRO);
  protected readonly limite = signal<number>(PAGE_SIZE);
  protected readonly carregando = signal<boolean>(true);
  protected readonly cidadesColapsadas = signal<Set<string>>(new Set());
  protected readonly skeletonSlots = Array.from({ length: PAGE_SIZE }, (_, i) => i);
  protected readonly unidadesVisiveis = signal<readonly Unidade[]>([]);
  protected readonly totalUnidades = signal<number>(0);

  protected readonly gruposPorCidade = computed<readonly GrupoCidade[]>(() => {
    const unidades = this.unidadesVisiveis();
    const mapaGrupos = new Map<string, Unidade[]>();

    for (const unidade of unidades) {
      const cidade = unidade.comarca;
      if (!mapaGrupos.has(cidade)) {
        mapaGrupos.set(cidade, []);
      }
      mapaGrupos.get(cidade)!.push(unidade);
    }

    return Array.from(mapaGrupos.entries()).map(([cidade, unidadesDaCidade]) => ({
      cidade,
      cidadeDisplay: this.formatarNomeCidade(cidade),
      unidades: unidadesDaCidade,
    }));
  });

  private formatarNomeCidade(cidade: string): string {
    return cidade
      .split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  private readonly unidadeService = inject(UnidadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly filtroChanges$ = new Subject<FiltroUnidades>();
  private readonly limiteChanges$ = new Subject<number>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const filtroFromParams = this.parseQueryParams(params);
      this.filtro.set(filtroFromParams);
      this.filtroChanges$.next(filtroFromParams);
    });

    const filtroStream$ = this.filtroChanges$.pipe(
      startWith(this.filtro()),
      tap(() => this.carregando.set(true)),
    );
    const limiteStream$ = this.limiteChanges$.pipe(startWith(this.limite()));

    const unidadesFiltradas$ = filtroStream$.pipe(
      switchMap((filtro) =>
        this.unidadeService.listarUnidades(filtro).pipe(
          tap((unidades) => {
            this.totalUnidades.set(unidades.length);
            this.carregando.set(false);
          }),
        ),
      ),
    );

    combineLatest([unidadesFiltradas$, limiteStream$])
      .pipe(
        map(([unidades, limite]) => unidades.slice(0, limite)),
        takeUntil(this.destroy$),
      )
      .subscribe((unidades) => this.unidadesVisiveis.set(unidades));
  }

  private parseQueryParams(params: Record<string, string>): FiltroUnidades {
    return {
      termo: params['termo'] || null,
      areas: params['areas'] ? params['areas'].split(',') as FiltroUnidades['areas'] : [],
      localidades: params['localidades'] ? params['localidades'].split(',') as FiltroUnidades['localidades'] : [],
      comarcaId: params['comarcaId'] || null,
      unidadeId: params['unidadeId'] || null,
    };
  }

  protected onConsultar(filtro: FiltroUnidades): void {
    this.filtro.set(filtro);
    this.limite.set(PAGE_SIZE);
    this.filtroChanges$.next(filtro);
    this.limiteChanges$.next(PAGE_SIZE);
  }

  protected carregarMais(): void {
    const novoLimite = this.limite() + PAGE_SIZE;
    this.limite.set(novoLimite);
    this.limiteChanges$.next(novoLimite);
  }

  protected toggleCidade(cidade: string): void {
    const colapsadas = new Set(this.cidadesColapsadas());
    if (colapsadas.has(cidade)) {
      colapsadas.delete(cidade);
    } else {
      colapsadas.add(cidade);
    }
    this.cidadesColapsadas.set(colapsadas);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroChanges$.complete();
    this.limiteChanges$.complete();
  }
}
