import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'telefone', standalone: true })
export class TelefonePipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) {
      return '';
    }
    const digitos = valor.replace(/\D/g, '');
    if (digitos.length === 11) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
    if (digitos.length === 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    if (digitos.length === 9) {
      return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
    }
    if (digitos.length === 8) {
      return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    }
    return valor;
  }
}
