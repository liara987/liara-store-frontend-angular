import { Injectable } from '@angular/core';
import { translations, TranslationKeys } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  /** Retorna o objeto de traduções em PT */
  readonly t: () => TranslationKeys = () => translations;
}
