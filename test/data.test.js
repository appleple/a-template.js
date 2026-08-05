import { describe, it, expect, beforeEach } from 'vitest';
import aTemplate from '../src/index';

describe('getData / setData', () => {
  it('getData: 内部データのディープコピーを返す (関数は除く JSON シリアライズなので)', () => {
    const at = new aTemplate({ data: { a: 1, nested: { b: 2 } } });
    const copy = at.getData();
    expect(copy).toEqual({ a: 1, nested: { b: 2 } });
    copy.nested.b = 999;
    expect(at.data.nested.b).toBe(2);
  });

  it('setData: 関数値は無視して代入する', () => {
    const at = new aTemplate({ data: { a: 1 } });
    at.setData({ a: 2, b: 'x', fn: () => 'y' });
    expect(at.data).toEqual({ a: 2, b: 'x' });
  });
});

describe('saveData / loadData (localStorage 連携)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveData で保存した内容を loadData で復元できる', () => {
    const at = new aTemplate({ data: { a: 1 } });
    at.saveData('key');
    const at2 = new aTemplate({ data: { a: 0 } });
    at2.loadData('key');
    expect(at2.data.a).toBe(1);
  });

  it('loadData: 保存されていないキーの場合は何もしない', () => {
    const at = new aTemplate({ data: { a: 1 } });
    at.loadData('not-saved-key');
    expect(at.data.a).toBe(1);
  });
});

describe('getDataFromObj / getDataByString', () => {
  it('ドット区切りのパスでネストした値を取得できる', () => {
    const at = new aTemplate({ data: { a: { b: { c: 42 } } } });
    expect(at.getDataByString('a.b.c')).toBe(42);
  });

  it('[index] 形式のパスでも取得できる (内部でドット区切りに変換される)', () => {
    const at = new aTemplate({ data: { list: ['x', 'y', 'z'] } });
    expect(at.getDataByString('list[1]')).toBe('y');
  });

  it('存在しないパスは null を返す', () => {
    const at = new aTemplate({ data: { a: 1 } });
    expect(at.getDataByString('a.b.c')).toBeNull();
  });
});

describe('updateDataByString / removeDataByString', () => {
  it('updateDataByString: ネストしたパスに値を設定できる', () => {
    const at = new aTemplate({ data: { a: { b: 1 } } });
    at.updateDataByString('a.b', 2);
    expect(at.data.a.b).toBe(2);
  });

  it('removeDataByString: オブジェクトのキーを削除する', () => {
    const at = new aTemplate({ data: { a: { b: 1, c: 2 } } });
    at.removeDataByString('a.b');
    expect(at.data.a).toEqual({ c: 2 });
  });

  it('removeDataByString: 末尾が数値インデックスなら配列要素を削除する', () => {
    const at = new aTemplate({ data: { list: ['x', 'y', 'z'] } });
    at.removeDataByString('list.1');
    expect(at.data.list).toEqual(['x', 'z']);
  });
});

describe('removeData', () => {
  it('指定したキーのみをトップレベルから削除する', () => {
    const at = new aTemplate({ data: { a: 1, b: 2, c: 3 } });
    const result = at.removeData(['a', 'c']);
    expect(at.data).toEqual({ b: 2 });
    expect(result).toBe(at);
  });
});

describe('remove', () => {
  it('末尾が数値インデックスなら配列要素を削除する (removeDataByString と同等)', () => {
    const at = new aTemplate({ data: { list: ['x', 'y', 'z'] } });
    const result = at.remove('list.0');
    expect(at.data.list).toEqual(['y', 'z']);
    expect(result).toBe(at);
  });

  it('末尾がキー名ならオブジェクトのプロパティを削除する', () => {
    const at = new aTemplate({ data: { a: { b: 1 } } });
    at.remove('a.b');
    expect(at.data.a).toEqual({});
  });
});

describe('applyMethod / getComputedProp', () => {
  it('applyMethod: method に登録した関数を実行して結果を返す', () => {
    const at = new aTemplate({ method: { double: x => x * 2 } });
    expect(at.applyMethod('double', 3)).toBe(6);
  });

  it('getComputedProp: data 内の関数を aTemplate インスタンスに bind して実行する', () => {
    const at = new aTemplate({
      data: {
        base: 10,
        computed() {
          // resolveBlock 等と同じ規約で、関数内の this は aTemplate インスタンス
          return this.data.base + 1;
        }
      }
    });
    expect(at.getComputedProp('computed')).toBe(11);
  });
});
