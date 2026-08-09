import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  AreaInteresse,
  Comarca,
  FiltroUnidades,
  Localidade,
  Unidade,
  UnidadeOption,
} from '../../../core/models/unidade.model';

import { MOCK_COMARCAS, MOCK_UNIDADES } from '../../../mock/data';

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  listarUnidades(filtro?: FiltroUnidades): Observable<readonly Unidade[]> {
    return of(MOCK_UNIDADES).pipe(
      delay(900),
      map((unidades) => (filtro ? this.aplicarFiltro(unidades, filtro) : unidades)),
      map((unidades) => this.ordenar(unidades)),
    );
  }

  private ordenar(unidades: readonly Unidade[]): readonly Unidade[] {
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    return [...unidades].sort((a, b) => {
      const comarca = collator.compare(a.comarca, b.comarca);
      return comarca !== 0 ? comarca : collator.compare(a.nome, b.nome);
    });
  }

  listarComarcas(
    areas?: readonly AreaInteresse[] | null,
    localidades?: readonly Localidade[] | null,
  ): Observable<readonly Comarca[]> {
    const idsPermitidos = new Set(
      MOCK_UNIDADES
        .filter((u) => (areas && areas.length > 0 ? areas.includes(u.area) : true))
        .filter((u) =>
          localidades && localidades.length > 0 ? localidades.includes(u.localidade) : true,
        )
        .map((u) => u.comarca),
    );
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    const comarcas = MOCK_COMARCAS
      .filter((c) => idsPermitidos.has(c.id))
      .slice()
      .sort((a, b) => collator.compare(a.nome, b.nome));
    return of(comarcas).pipe(delay(50));
  }

  listarUnidadesOptions(
    comarcaId?: string | null,
    areas?: readonly AreaInteresse[] | null,
    localidades?: readonly Localidade[] | null,
  ): Observable<readonly UnidadeOption[]> {
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    const options = MOCK_UNIDADES
      .filter((u) => (comarcaId ? u.comarca === comarcaId : true))
      .filter((u) => (areas && areas.length > 0 ? areas.includes(u.area) : true))
      .filter((u) =>
        localidades && localidades.length > 0 ? localidades.includes(u.localidade) : true,
      )
      .map<UnidadeOption>((u) => ({ id: u.id, nome: u.nome, comarcaId: u.comarca }))
      .sort((a, b) => collator.compare(a.nome, b.nome));
    return of(options).pipe(delay(50));
  }

  private aplicarFiltro(
    unidades: readonly Unidade[],
    filtro: FiltroUnidades,
  ): readonly Unidade[] {
    const termo = normalizar(filtro.termo ?? '');
    return unidades.filter((u) => {
      const okTermo = termo === '' || this.camposPesquisaveis(u).some((c) => c.includes(termo));
      const okArea = filtro.areas.length === 0 || filtro.areas.includes(u.area);
      const okLocal =
        filtro.localidades.length === 0 || filtro.localidades.includes(u.localidade);
      const okComarca = !filtro.comarcaId || u.comarca === filtro.comarcaId;
      const okUnidade = !filtro.unidadeId || u.id === filtro.unidadeId;
      return okTermo && okArea && okLocal && okComarca && okUnidade;
    });
  }

  private camposPesquisaveis(u: Unidade): readonly string[] {
    return [
      u.nome,
      u.comarca,
      u.telefone,
      u.email,
      u.endereco.logradouro,
      u.endereco.cep,
      u.funcionamento,
      u.magistradoResponsavel,
    ].map(normalizar);
  }
}

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
