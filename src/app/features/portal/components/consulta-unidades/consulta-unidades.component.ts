import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';

import {
  AreaInteresse,
  Comarca,
  FiltroUnidades,
  Localidade,
  UnidadeOption,
} from '../../../../core/models/unidade.model';
import { UnidadeService } from '../../services/unidade.service';

interface AreaOption {
  readonly value: AreaInteresse;
  readonly label: string;
}

interface LocalidadeOption {
  readonly value: Localidade;
  readonly label: string;
}

interface ConsultaFormValue {
  area: AreaInteresse | null;
  localidade: Localidade | null;
  comarca: Comarca | null;
  unidade: UnidadeOption | null;
}

type ConsultaFormControls = {
  [K in keyof ConsultaFormValue]: FormControl<ConsultaFormValue[K]>;
};

@Component({
  selector: 'app-consulta-unidades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RadioButtonModule,
    AutoCompleteModule,
    ButtonModule,
    FloatLabelModule,
  ],
  templateUrl: './consulta-unidades.component.html',
  styleUrl: './consulta-unidades.component.css',
})
export class ConsultaUnidadesComponent implements OnInit, OnDestroy {
  readonly consultar = output<Omit<FiltroUnidades, 'termo'>>();

  protected readonly areas: readonly AreaOption[] = [
    { value: 'PRIMEIRO_GRAU', label: '1º Grau' },
    { value: 'SEGUNDO_GRAU', label: '2º Grau' },
    { value: 'EXTRAJUDICIAL', label: 'Extrajudicial' },
    { value: 'JUIZADO', label: 'Juizado' },
    { value: 'TURMA_RECURSAL', label: 'Turma Recursal' },
  ];

  protected readonly localidades: readonly LocalidadeOption[] = [
    { value: 'CAPITAL', label: 'Capital' },
    { value: 'INTERIOR', label: 'Interior' },
  ];

  protected readonly form = new FormGroup<ConsultaFormControls>({
    area: new FormControl<AreaInteresse | null>('PRIMEIRO_GRAU'),
    localidade: new FormControl<Localidade | null>('CAPITAL'),
    comarca: new FormControl<Comarca | null>(null),
    unidade: new FormControl<UnidadeOption | null>({ value: null, disabled: true }),
  });

  protected comarcasSugestoes: Comarca[] = [];
  protected unidadesSugestoes: UnidadeOption[] = [];

  private todasComarcas: Comarca[] = [];
  private todasUnidades: UnidadeOption[] = [];

  private readonly unidadeService = inject(UnidadeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    const area$ = this.form.controls.area.valueChanges.pipe(
      startWith(this.form.controls.area.value),
      distinctUntilChanged(),
    );
    const localidade$ = this.form.controls.localidade.valueChanges.pipe(
      startWith(this.form.controls.localidade.value),
      distinctUntilChanged(),
    );

    combineLatest([area$, localidade$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([area, localidade]) => {
        this.form.controls.comarca.setValue(null, { emitEvent: false });
        this.form.controls.unidade.setValue(null, { emitEvent: false });
        this.form.controls.unidade.disable({ emitEvent: false });
        this.recarregarComarcas(area, localidade);
        this.recarregarUnidades(null, area, localidade);
      });

    this.form.controls.comarca.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((comarca) => {
        this.form.controls.unidade.setValue(null, { emitEvent: false });
        if (comarca) {
          this.form.controls.unidade.enable({ emitEvent: false });
        } else {
          this.form.controls.unidade.disable({ emitEvent: false });
        }
        this.recarregarUnidades(
          comarca?.id ?? null,
          this.form.controls.area.value,
          this.form.controls.localidade.value,
        );
      });
  }

  protected filtrarComarcas(event: AutoCompleteCompleteEvent): void {
    const q = event.query.trim().toLowerCase();
    this.comarcasSugestoes = q
      ? this.todasComarcas.filter((c) => c.nome.toLowerCase().includes(q))
      : [...this.todasComarcas];
  }

  protected filtrarUnidades(event: AutoCompleteCompleteEvent): void {
    const q = event.query.trim().toLowerCase();
    this.unidadesSugestoes = q
      ? this.todasUnidades.filter((u) => u.nome.toLowerCase().includes(q))
      : [...this.todasUnidades];
  }

  protected onSubmit(): void {
    const value = this.form.getRawValue();
    this.consultar.emit({
      areas: value.area ? [value.area] : [],
      localidades: value.localidade ? [value.localidade] : [],
      comarcaId: value.comarca?.id ?? null,
      unidadeId: value.unidade?.id ?? null,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private recarregarComarcas(
    area: AreaInteresse | null,
    localidade: Localidade | null,
  ): void {
    const areas = area ? [area] : [];
    const localidades = localidade ? [localidade] : [];
    this.unidadeService
      .listarComarcas(areas, localidades)
      .pipe(takeUntil(this.destroy$))
      .subscribe((c) => {
        this.todasComarcas = [...c];
        this.comarcasSugestoes = [];
        this.cdr.markForCheck();
      });
  }

  private recarregarUnidades(
    comarcaId: string | null,
    area: AreaInteresse | null,
    localidade: Localidade | null,
  ): void {
    const areas = area ? [area] : [];
    const localidades = localidade ? [localidade] : [];
    this.unidadeService
      .listarUnidadesOptions(comarcaId, areas, localidades)
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => {
        this.todasUnidades = [...u];
        this.unidadesSugestoes = [];
        this.cdr.markForCheck();
      });
  }
}
