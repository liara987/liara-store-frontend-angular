import { Pipe, PipeTransform } from '@angular/core';

/** Converte centavos (inteiro vindo da API) em moeda brasileira. */
@Pipe({ name: 'cents' })
export class CentsPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    return ((value ?? 0) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
