import { describe, it, expect, beforeEach } from 'vitest';
import { selector } from '../src/util';

describe('selector', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="exists"></div>';
  });

  it('一致する要素があればその要素を返す', () => {
    expect(selector('#exists')).toBe(document.getElementById('exists'));
  });

  it('一致する要素がなければ null を返す (document.querySelector と同じ契約)', () => {
    expect(selector('#not-exists')).toBeNull();
  });
});
