/**
 * @file apps/worker/src/engine/operators/IConditionOperator.ts
 * @description Strategy Pattern için temel arayüz.
 *              Her operatör tipi bu interface'i implemente eder.
 *              Yeni bir operatör eklemek (örn: 'between') hiçbir mevcut kodu değiştirmez.
 *              (Open/Closed Principle — OCP)
 */

export interface IConditionOperator {
  /** Bu strategy'nin sorumlu olduğu operatör sembolü. */
  readonly symbol: string;

  /**
   * Gerçek değeri eşik değeriyle karşılaştırır.
   * @param actual   Token'dan gelen gerçek sayısal değer
   * @param threshold Kuralda tanımlanan eşik değeri
   * @returns true → koşul sağlanıyor, job kuyruğa gidecek
   */
  evaluate(actual: number, threshold: number): boolean;
}
