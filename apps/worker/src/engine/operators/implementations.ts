/**
 * @file apps/worker/src/engine/operators/implementations.ts
 * @description IConditionOperator'ın tüm somut implementasyonları.
 *              Her sınıf tek bir karşılaştırma mantığından sorumludur (SRP).
 *              Yeni operatör eklemek için yalnızca bu dosyaya yeni bir sınıf eklenir;
 *              RuleEngine veya başka bir sınıfa dokunulmaz (OCP).
 */

import type { IConditionOperator } from './IConditionOperator';

export class GreaterThanOperator implements IConditionOperator {
  readonly symbol = '>';
  evaluate(actual: number, threshold: number): boolean {
    return actual > threshold;
  }
}

export class GreaterThanOrEqualOperator implements IConditionOperator {
  readonly symbol = '>=';
  evaluate(actual: number, threshold: number): boolean {
    return actual >= threshold;
  }
}

export class LessThanOperator implements IConditionOperator {
  readonly symbol = '<';
  evaluate(actual: number, threshold: number): boolean {
    return actual < threshold;
  }
}

export class LessThanOrEqualOperator implements IConditionOperator {
  readonly symbol = '<=';
  evaluate(actual: number, threshold: number): boolean {
    return actual <= threshold;
  }
}

export class EqualOperator implements IConditionOperator {
  readonly symbol = '==';
  evaluate(actual: number, threshold: number): boolean {
    return actual === threshold;
  }
}
