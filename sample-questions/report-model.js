/* Local illustration of layer arithmetic only. No group-release decision is made.
 * Source: milluk/yootle-platform services/wave-close/aggregate.ts
 * revision ae007b4f0be90a953b7ba4e62e80c578f8bc6beb.
 * That source uses R1–R3 / I1–I3 only; no core item is reverse coded.
 * VAL-C2 is reverse-coded metadata but is excluded, like all checks and META-1.
 * User decision (2026-10-25): sample gap = perceived reality minus claims.
 * This deliberately reverses the current aggregate.ts gap sign (claims minus reality).
 * Means, plot values, item inclusion and canonical backend remain unchanged.
 */
(function (root) {
  'use strict';
  const LAYERS = ['WHO', 'WHOM', 'WHY', 'HOW', 'WHAT'];
  // Same integer rounding as the canonical aggregate (two decimal places).
  function round(p, d) {
    const a = p < 0n ? -p : p, h = (200n * a + d) / (2n * d);
    return (p < 0n && h !== 0n ? '-' : '') + String(h / 100n) + '.' + String(h % 100n).padStart(2, '0');
  }
  function summarize(answers) {
    const missing = [];
    const layers = LAYERS.map(layer => {
      const required = ['R', 'I'].flatMap(type => [1, 2, 3].map(k => `${layer}-${type}${k}`));
      const absent = required.filter(id => !Object.hasOwn(answers, id) || !Number.isInteger(answers[id]) || answers[id] < 1 || answers[id] > 6);
      missing.push(...absent);
      if (absent.length) return { layer, available: false, missing: absent, claims: null, reality: null, gap: null };
      const sum = type => [1, 2, 3].reduce((total, k) => total + BigInt(answers[`${layer}-${type}${k}`]), 0n);
      const r = sum('R'), i = sum('I');
      return { layer, available: true, missing: [], claims: round(i, 3n), reality: round(r, 3n), gap: round(r - i, 3n), claimsValue: Number(i) / 3, realityValue: Number(r) / 3 };
    });
    const supporting = ['VAL-C1', 'VAL-C2', 'META-1'].map(id => ({
      id,
      value: Object.hasOwn(answers, id) && Number.isInteger(answers[id]) && answers[id] >= 1 && answers[id] <= 6 ? answers[id] : null
    }));
    return { complete: missing.length === 0, answered: 30 - missing.length, missing, layers, supporting };
  }
  const api = { summarize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YOOTLE_REPORT = api;
})(typeof window !== 'undefined' ? window : globalThis);
