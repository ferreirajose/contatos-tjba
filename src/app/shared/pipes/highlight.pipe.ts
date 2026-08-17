import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined, termo: string | null | undefined): SafeHtml {
    if (!value || !termo || termo.trim() === '') {
      return value ?? '';
    }

    const termoNormalizado = this.removerAcentos(termo.trim().toLowerCase());
    const palavras = termoNormalizado.split(/\s+/).filter(p => p.length > 0);

    if (palavras.length === 0) {
      return value;
    }

    const pattern = palavras.map(p => this.escapeRegex(p)).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const resultado = value.replace(regex, (match) => {
      return `<mark class="highlight">${match}</mark>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  private escapeRegex(texto: string): string {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
