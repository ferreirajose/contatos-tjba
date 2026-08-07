import { ChangeDetectionStrategy, Component, output, OnDestroy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pesquisa-geral',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    FloatLabelModule,
  ],
  templateUrl: './pesquisa-geral.component.html',
  styleUrl: './pesquisa-geral.component.css',
})
export class PesquisaGeralComponent implements OnDestroy {
  readonly termoChange = output<string>();

  protected readonly termo = new FormControl<string>('', { nonNullable: true });

  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.termo.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valor) => this.termoChange.emit(valor.trim()));
  }

  protected limpar(): void {
    this.termo.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
