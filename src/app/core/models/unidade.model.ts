export type AreaInteresse =
  | 'PRIMEIRO_GRAU'
  | 'SEGUNDO_GRAU'
  | 'EXTRAJUDICIAL'
  | 'JUIZADO'
  | 'TURMA_RECURSAL';

export type Localidade = 'CAPITAL' | 'INTERIOR';

export interface Endereco {
  readonly logradouro: string;
  readonly cep: string;
}

export interface Unidade {
  readonly id: string;
  readonly nome: string;
  readonly comarca: string;
  readonly telefone: string;
  readonly email: string;
  readonly endereco: Endereco;
  readonly funcionamento: string;
  readonly magistradoResponsavel: string;
  readonly balcaoVirtualUrl: string;
  readonly agendaMagistradoUrl: string;
  readonly area: AreaInteresse;
  readonly localidade: Localidade;
}

export interface Comarca {
  readonly id: string;
  readonly nome: string;
}

export interface UnidadeOption {
  readonly id: string;
  readonly nome: string;
  readonly comarcaId: string;
}

export interface FiltroUnidades {
  readonly termo: string | null;
  readonly areas: readonly AreaInteresse[];
  readonly localidades: readonly Localidade[];
  readonly comarcaId: string | null;
  readonly unidadeId: string | null;
}
