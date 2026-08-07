import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Comarca,
  FiltroUnidades,
  Unidade,
  UnidadeOption,
} from '../../../core/models/unidade.model';

const MOCK_UNIDADES: readonly Unidade[] = [
  {
    id: '1',
    nome: '10ª Vara Criminal',
    comarca: 'salvador',
    telefone: '(71) 3460-8046',
    email: 'salvador10vcrime@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Ulisses Guimarães, Nº 690, Sussuarana.',
      cep: '41.213-000',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Jose Henrique',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/1',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/1',
    area: 'PRIMEIRO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '2',
    nome: '1ª Vara Cível',
    comarca: 'alagoinhas',
    telefone: '(71) 3423-8952',
    email: 'alagoinhas1vcivel@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Juracy Magalhães, S/N - Centro.',
      cep: '48.040-210',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Andreia Valença',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/2',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/2',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '3',
    nome: '16ª Vara do Sistema dos Juizados Especiais do Consumidor',
    comarca: 'salvador',
    telefone: '(71) 3372-7390',
    email: 'ssa-16vsje-consumo@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Tancredo Neves, Nº 2000, Caminho das Árvores.',
      cep: '41.820-020',
    },
    funcionamento: '13:00h às 19:00h',
    magistradoResponsavel: 'Carlos Silva',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/3',
    agendaMagistradoUrl: '',
    area: 'JUIZADO',
    localidade: 'CAPITAL',
  },
  {
    id: '4',
    nome: '1ª Vara Cível',
    comarca: 'itaberaba',
    telefone: '(71) 3251-1919',
    email: 'itaberaba1vcivel@tjba.jus.br',
    endereco: {
      logradouro: 'Rua Dr. Osmar Ribeiro dos Santos, S/N - Bairro Vermelho.',
      cep: '46.880-000',
    },
    funcionamento: '09:00h às 14:00h',
    magistradoResponsavel: 'Edinaldo Brandão',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/4',
    agendaMagistradoUrl: '',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '5',
    nome: '2ª Vara de Família',
    comarca: 'salvador',
    telefone: '(71) 3320-1122',
    email: 'salvador2vfamilia@tjba.jus.br',
    endereco: {
      logradouro: 'Praça da Sé, S/N - Centro.',
      cep: '40.020-210',
    },
    funcionamento: '08:00h às 17:00h',
    magistradoResponsavel: 'Maria de Fátima',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/5',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/5',
    area: 'PRIMEIRO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '6',
    nome: 'Vara Criminal',
    comarca: 'feira-de-santana',
    telefone: '(75) 3625-4400',
    email: 'feira1vcrim@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Getúlio Vargas, Nº 1200, Centro.',
      cep: '44.010-000',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Roberto Nogueira',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/6',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/6',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '7',
    nome: 'Turma Recursal dos Juizados',
    comarca: 'salvador',
    telefone: '(71) 3372-5566',
    email: 'ssa-turmarecursal@tjba.jus.br',
    endereco: {
      logradouro: 'Av. ACM, Nº 700, Itaigara.',
      cep: '41.825-000',
    },
    funcionamento: '09:00h às 18:00h',
    magistradoResponsavel: 'Paula Rocha',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/7',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/7',
    area: 'TURMA_RECURSAL',
    localidade: 'CAPITAL',
  },
  {
    id: '8',
    nome: 'Serventia Extrajudicial de Vitória da Conquista',
    comarca: 'vitoria-da-conquista',
    telefone: '(77) 3421-9987',
    email: 'vconquista-extra@tjba.jus.br',
    endereco: {
      logradouro: 'Praça Tancredo Neves, S/N - Centro.',
      cep: '45.020-000',
    },
    funcionamento: '08:00h às 16:00h',
    magistradoResponsavel: 'Antônio Cardoso',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/8',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/8',
    area: 'EXTRAJUDICIAL',
    localidade: 'INTERIOR',
  },
  {
    id: '9',
    nome: '3ª Vara da Fazenda Pública',
    comarca: 'salvador',
    telefone: '(71) 3320-4477',
    email: 'salvador3vfazenda@tjba.jus.br',
    endereco: {
      logradouro: 'Praça da Sé, S/N - Centro.',
      cep: '40.020-210',
    },
    funcionamento: '08:00h às 17:00h',
    magistradoResponsavel: 'Luciana Almeida',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/9',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/9',
    area: 'PRIMEIRO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '10',
    nome: '2ª Câmara Cível',
    comarca: 'salvador',
    telefone: '(71) 3372-1200',
    email: 'ssa-2camaracivel@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Ulisses Guimarães, Nº 690, Sussuarana.',
      cep: '41.213-000',
    },
    funcionamento: '09:00h às 18:00h',
    magistradoResponsavel: 'Ricardo Menezes',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/10',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/10',
    area: 'SEGUNDO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '11',
    nome: 'Juizado Especial Cível',
    comarca: 'ilheus',
    telefone: '(73) 3234-5566',
    email: 'ilheus-jec@tjba.jus.br',
    endereco: {
      logradouro: 'Rua Miguel Calmon, Nº 350 - Centro.',
      cep: '45.653-000',
    },
    funcionamento: '08:00h às 17:00h',
    magistradoResponsavel: 'Fernanda Costa',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/11',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/11',
    area: 'JUIZADO',
    localidade: 'INTERIOR',
  },
  {
    id: '12',
    nome: '4ª Vara Cível',
    comarca: 'salvador',
    telefone: '(71) 3372-9010',
    email: 'salvador4vcivel@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Tancredo Neves, Nº 2000, Caminho das Árvores.',
      cep: '41.820-020',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Bruno Teixeira',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/12',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/12',
    area: 'PRIMEIRO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '13',
    nome: '2ª Vara Criminal',
    comarca: 'feira-de-santana',
    telefone: '(75) 3625-7788',
    email: 'feira2vcrim@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Getúlio Vargas, Nº 1200, Centro.',
      cep: '44.010-000',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Sônia Ferraz',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/13',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/13',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '14',
    nome: 'Serventia Extrajudicial de Barreiras',
    comarca: 'barreiras',
    telefone: '(77) 3611-2244',
    email: 'barreiras-extra@tjba.jus.br',
    endereco: {
      logradouro: 'Av. ACM, Nº 450 - Centro.',
      cep: '47.800-000',
    },
    funcionamento: '08:00h às 16:00h',
    magistradoResponsavel: 'Diego Ramos',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/14',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/14',
    area: 'EXTRAJUDICIAL',
    localidade: 'INTERIOR',
  },
  {
    id: '15',
    nome: '3ª Vara da Família',
    comarca: 'feira-de-santana',
    telefone: '(75) 3625-3399',
    email: 'feira3vfamilia@tjba.jus.br',
    endereco: {
      logradouro: 'Rua Barão de Cotegipe, Nº 550 - Centro.',
      cep: '44.010-000',
    },
    funcionamento: '09:00h às 18:00h',
    magistradoResponsavel: 'Patrícia Lima',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/15',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/15',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '16',
    nome: 'Turma Recursal dos Juizados do Interior',
    comarca: 'vitoria-da-conquista',
    telefone: '(77) 3421-6060',
    email: 'vconquista-turmarecursal@tjba.jus.br',
    endereco: {
      logradouro: 'Praça Tancredo Neves, S/N - Centro.',
      cep: '45.020-000',
    },
    funcionamento: '09:00h às 18:00h',
    magistradoResponsavel: 'Marcelo Pires',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/16',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/16',
    area: 'TURMA_RECURSAL',
    localidade: 'INTERIOR',
  },
  {
    id: '17',
    nome: '1ª Vara da Fazenda Pública',
    comarca: 'ilheus',
    telefone: '(73) 3234-9911',
    email: 'ilheus1vfazenda@tjba.jus.br',
    endereco: {
      logradouro: 'Rua Miguel Calmon, Nº 350 - Centro.',
      cep: '45.653-000',
    },
    funcionamento: '08:00h às 17:00h',
    magistradoResponsavel: 'Rafaela Souza',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/17',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/17',
    area: 'PRIMEIRO_GRAU',
    localidade: 'INTERIOR',
  },
  {
    id: '18',
    nome: '5ª Vara Criminal',
    comarca: 'salvador',
    telefone: '(71) 3460-1010',
    email: 'salvador5vcrime@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Ulisses Guimarães, Nº 690, Sussuarana.',
      cep: '41.213-000',
    },
    funcionamento: '08:00h às 18:00h',
    magistradoResponsavel: 'Henrique Barbosa',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/18',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/18',
    area: 'PRIMEIRO_GRAU',
    localidade: 'CAPITAL',
  },
  {
    id: '19',
    nome: 'Juizado Especial Criminal',
    comarca: 'alagoinhas',
    telefone: '(75) 3423-1177',
    email: 'alagoinhas-jecrim@tjba.jus.br',
    endereco: {
      logradouro: 'Av. Juracy Magalhães, S/N - Centro.',
      cep: '48.040-210',
    },
    funcionamento: '08:00h às 17:00h',
    magistradoResponsavel: 'Cristiane Vasconcelos',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/19',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/19',
    area: 'JUIZADO',
    localidade: 'INTERIOR',
  },
  {
    id: '20',
    nome: '3ª Câmara Criminal',
    comarca: 'salvador',
    telefone: '(71) 3372-8080',
    email: 'ssa-3camaracriminal@tjba.jus.br',
    endereco: {
      logradouro: 'Av. ACM, Nº 700, Itaigara.',
      cep: '41.825-000',
    },
    funcionamento: '09:00h às 18:00h',
    magistradoResponsavel: 'Vinícius Andrade',
    balcaoVirtualUrl: 'https://balcaovirtual.tjba.jus.br/unidade/20',
    agendaMagistradoUrl: 'https://agenda.tjba.jus.br/magistrado/20',
    area: 'SEGUNDO_GRAU',
    localidade: 'CAPITAL',
  },
];

const MOCK_COMARCAS: readonly Comarca[] = [
  { id: 'salvador', nome: 'Salvador' },
  { id: 'alagoinhas', nome: 'Alagoinhas' },
  { id: 'itaberaba', nome: 'Itaberaba' },
  { id: 'feira-de-santana', nome: 'Feira de Santana' },
  { id: 'vitoria-da-conquista', nome: 'Vitória da Conquista' },
  { id: 'ilheus', nome: 'Ilhéus' },
  { id: 'barreiras', nome: 'Barreiras' },
];

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  listarUnidades(filtro?: FiltroUnidades): Observable<readonly Unidade[]> {
    return of(MOCK_UNIDADES).pipe(
      delay(900),
      map((unidades) => (filtro ? this.aplicarFiltro(unidades, filtro) : unidades)),
    );
  }

  listarComarcas(): Observable<readonly Comarca[]> {
    return of(MOCK_COMARCAS).pipe(delay(50));
  }

  listarUnidadesOptions(comarcaId?: string | null): Observable<readonly UnidadeOption[]> {
    return of(
      MOCK_UNIDADES
        .filter((u) => (comarcaId ? u.comarca === comarcaId : true))
        .map<UnidadeOption>((u) => ({ id: u.id, nome: u.nome, comarcaId: u.comarca })),
    ).pipe(delay(50));
  }

  private aplicarFiltro(
    unidades: readonly Unidade[],
    filtro: FiltroUnidades,
  ): readonly Unidade[] {
    const termo = filtro.termo?.trim().toLowerCase() ?? '';
    return unidades.filter((u) => {
      const okTermo =
        termo === '' ||
        u.nome.toLowerCase().includes(termo) ||
        u.comarca.toLowerCase().includes(termo) ||
        u.magistradoResponsavel.toLowerCase().includes(termo);
      const okArea = filtro.areas.length === 0 || filtro.areas.includes(u.area);
      const okLocal = !filtro.localidade || u.localidade === filtro.localidade;
      const okComarca = !filtro.comarcaId || u.comarca === filtro.comarcaId;
      const okUnidade = !filtro.unidadeId || u.id === filtro.unidadeId;
      return okTermo && okArea && okLocal && okComarca && okUnidade;
    });
  }
}
