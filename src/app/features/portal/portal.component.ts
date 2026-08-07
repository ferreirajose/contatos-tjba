import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';

import {
  FiltroUnidades,
  Unidade,
} from '../../core/models/unidade.model';
import { UnidadeService } from './services/unidade.service';
import { PesquisaGeralComponent } from './components/pesquisa-geral/pesquisa-geral.component';
import { ConsultaUnidadesComponent } from './components/consulta-unidades/consulta-unidades.component';
import { UnidadeCardComponent } from './components/unidade-card/unidade-card.component';

const PAGE_SIZE = 4;
const INITIAL_FILTRO: FiltroUnidades = {
  termo: null,
  areas: [],
  localidade: null,
  comarcaId: null,
  unidadeId: null,
};

@Component({
  selector: 'app-portal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    PesquisaGeralComponent,
    ConsultaUnidadesComponent,
    UnidadeCardComponent,
  ],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
})
export class PortalComponent implements OnInit, OnDestroy {
  protected readonly filtro = signal<FiltroUnidades>(INITIAL_FILTRO);
  protected readonly limite = signal<number>(PAGE_SIZE);
  protected readonly mostrarAvancada = signal<boolean>(false);
  protected readonly carregando = signal<boolean>(true);
  protected readonly skeletonSlots = Array.from({ length: PAGE_SIZE }, (_, i) => i);
  protected readonly unidadesVisiveis = signal<readonly Unidade[]>([]);
  protected readonly totalUnidades = signal<number>(0);

  @ViewChild('consultaAvancada') private consultaAvancadaRef?: ElementRef<HTMLElement>;

  private readonly unidadeService = inject(UnidadeService);
  private readonly injector = inject(Injector);
  private readonly filtroChanges$ = new Subject<FiltroUnidades>();
  private readonly limiteChanges$ = new Subject<number>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
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

  protected onTermoChange(termo: string): void {
    const atual = this.filtro();
    const proximo: FiltroUnidades = { ...atual, termo: termo || null };
    this.filtro.set(proximo);
    this.limite.set(PAGE_SIZE);
    this.filtroChanges$.next(proximo);
    this.limiteChanges$.next(PAGE_SIZE);
  }

  protected onConsultar(parcial: Omit<FiltroUnidades, 'termo'>): void {
    const proximo: FiltroUnidades = { ...this.filtro(), ...parcial };
    this.filtro.set(proximo);
    this.limite.set(PAGE_SIZE);
    this.filtroChanges$.next(proximo);
    this.limiteChanges$.next(PAGE_SIZE);
  }

  protected toggleAvancada(): void {
    const proximo = !this.mostrarAvancada();
    this.mostrarAvancada.set(proximo);
    if (!proximo) {
      return;
    }
    afterNextRender(
      () => {
        const alvo = this.consultaAvancadaRef?.nativeElement;
        if (!alvo) {
          return;
        }
        const header = document.querySelector<HTMLElement>('.app-header');
        const offset = header?.getBoundingClientRect().height ?? 0;
        const top = alvo.getBoundingClientRect().top + window.scrollY - offset - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      },
      { injector: this.injector },
    );
  }

  protected carregarMais(): void {
    const novoLimite = this.limite() + PAGE_SIZE;
    this.limite.set(novoLimite);
    this.limiteChanges$.next(novoLimite);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroChanges$.complete();
    this.limiteChanges$.complete();
  }
}
