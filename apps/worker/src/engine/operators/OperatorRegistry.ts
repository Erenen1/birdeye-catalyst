/**
 * @file apps/worker/src/engine/operators/OperatorRegistry.ts
 * @description Strategy nesnelerini sembol bazlı bir Map'te tutar.
 *              RuleEngine bu registry üzerinden ilgili strategy'yi lookup eder.
 *              Yeni operatör eklemek için sadece bu dosyaya `register()` çağrısı eklenir.
 */

import type { IConditionOperator } from './IConditionOperator';
import {
  GreaterThanOperator,
  GreaterThanOrEqualOperator,
  LessThanOperator,
  LessThanOrEqualOperator,
  EqualOperator,
} from './implementations';

export class OperatorRegistry {
  private readonly registry = new Map<string, IConditionOperator>();

  constructor() {
    // Varsayılan operatörler otomatik kayıt edilir
    this.register(new GreaterThanOperator());
    this.register(new GreaterThanOrEqualOperator());
    this.register(new LessThanOperator());
    this.register(new LessThanOrEqualOperator());
    this.register(new EqualOperator());
  }

  register(operator: IConditionOperator): void {
    this.registry.set(operator.symbol, operator);
  }

  /**
   * Sembol için kayıtlı strategy'yi döndürür.
   * @throws Kayıtlı operatör bulunamazsa Error fırlatır.
   */
  resolve(symbol: string): IConditionOperator {
    const op = this.registry.get(symbol);
    if (!op) {
      throw new Error(`[OperatorRegistry] Bilinmeyen operatör: "${symbol}"`);
    }
    return op;
  }
}
