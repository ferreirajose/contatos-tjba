import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { CheckboxModule } from 'primeng/checkbox';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

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
  termo: string;
  areas: AreaInteresse[];
  localidades: Localidade[];
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
    CheckboxModule,
    AutoCompleteModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
  ],
  templateUrl: './consulta-unidades.component.html',
  styleUrl: './consulta-unidades.component.css',
})
export class ConsultaUnidadesComponent implements OnInit, OnDestroy {
  readonly mostrarToggle = input<boolean>(false);
  readonly hasIndex = input<boolean>(false);
  readonly consultar = output<FiltroUnidades>();
  readonly fechar = output<void>();

  protected readonly areas: readonly AreaOption[] = [
    { value: 'JUIZADO', label: 'Juizado' },
    { value: 'EXTRAJUDICIAL', label: 'Extrajudicial' },
    { value: 'PRIMEIRO_GRAU', label: '1º Grau' },
    { value: 'TURMA_RECURSAL', label: 'Turma Recursal' },
    { value: 'SEGUNDO_GRAU', label: '2º Grau' },
  ];

  protected readonly localidades: readonly LocalidadeOption[] = [
    { value: 'CAPITAL', label: 'Capital' },
    { value: 'INTERIOR', label: 'Interior' },
  ];

  protected readonly form = new FormGroup<ConsultaFormControls>({
    termo: new FormControl<string>('', { nonNullable: true }),
    areas: new FormControl<AreaInteresse[]>([], { nonNullable: true }),
    localidades: new FormControl<Localidade[]>([], { nonNullable: true }),
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
    const areas$ = this.form.controls.areas.valueChanges.pipe(
      startWith(this.form.controls.areas.value),
    );
    const localidades$ = this.form.controls.localidades.valueChanges.pipe(
      startWith(this.form.controls.localidades.value),
    );

    combineLatest([areas$, localidades$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([areas, localidades]) => {
        this.form.controls.comarca.setValue(null, { emitEvent: false });
        this.form.controls.unidade.setValue(null, { emitEvent: false });
        this.form.controls.unidade.disable({ emitEvent: false });
        this.recarregarComarcas(areas, localidades);
        this.recarregarUnidades(null, areas, localidades);
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
          this.form.controls.areas.value,
          this.form.controls.localidades.value,
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
    this.consultar.emit(this.getFormValues());
  }

  getFormValues(): FiltroUnidades {
    const value = this.form.getRawValue();
    return {
      termo: value.termo.trim() || null,
      areas: value.areas,
      localidades: value.localidades,
      comarcaId: value.comarca?.id ?? null,
      unidadeId: value.unidade?.id ?? null,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private recarregarComarcas(
    areas: AreaInteresse[],
    localidades: Localidade[],
  ): void {
    this.unidadeService
      .listarComarcas(areas, localidades)
      .pipe(takeUntil(this.destroy$))
      .subscribe((c) => {
        this.todasComarcas = [...c];
        this.comarcasSugestoes = [];
        if (localidades.length === 1 && localidades[0] === 'CAPITAL' && this.todasComarcas.length === 1) {
          this.form.controls.comarca.setValue(this.todasComarcas[0]);
        }
        this.cdr.markForCheck();
      });
  }

  private recarregarUnidades(
    comarcaId: string | null,
    areas: AreaInteresse[],
    localidades: Localidade[],
  ): void {
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
