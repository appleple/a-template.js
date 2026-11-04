import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import aTemplate from '../src/index';

function setTemplate(id, html) {
  document.body.innerHTML = `<script type="text/template" id="${id}">${html}</script><div id="${id}"></div>`;
}

function cleanPollution() {
  delete Object.prototype.polluted;
}

describe('プロトタイプ汚染の防止', () => {
  beforeEach(cleanPollution);
  afterEach(cleanPollution);

  it.each([
    '__proto__.polluted',
    'constructor.prototype.polluted',
    'a.__proto__.polluted'
  ])('updateDataByString: %s では Object.prototype を汚染しない', (path) => {
    const at = new aTemplate({ data: { a: {} } });
    expect(() => at.updateDataByString(path, 'yes')).not.toThrow();
    expect({}.polluted).toBeUndefined();
  });

  it('removeDataByString: __proto__ 経由で Object.prototype のプロパティを消さない', () => {
    Object.prototype.polluted = 'keep';
    const at = new aTemplate({ data: {} });
    expect(() => at.removeDataByString('__proto__.polluted')).not.toThrow();
    expect({}.polluted).toBe('keep');
  });

  it('remove: __proto__ 経由で Object.prototype のプロパティを消さない', () => {
    Object.prototype.polluted = 'keep';
    const at = new aTemplate({ data: {} });
    expect(() => at.remove('__proto__.polluted')).not.toThrow();
    expect({}.polluted).toBe('keep');
  });

  it('data-bind="__proto__.polluted" の input イベントで汚染されない', () => {
    setTemplate('tpl', '<input data-bind=\'__proto__.polluted\' value=\'yes\'>');
    const at = new aTemplate({ templates: ['tpl'], data: {} });
    at.update();
    document.querySelector('input').dispatchEvent(new window.Event('input', { bubbles: true }));
    expect({}.polluted).toBeUndefined();
  });

  it('setData / loadData: JSON 由来の __proto__ キーで data のプロトタイプを差し替えない', () => {
    const at = new aTemplate({ data: {} });
    at.setData(JSON.parse('{"__proto__":{"polluted":"yes"},"ok":1}'));
    expect(at.data.polluted).toBeUndefined();
    expect(at.data.ok).toBe(1);
  });

  it('getDataByString: プロトタイプ連鎖のキーは取得できない', () => {
    const at = new aTemplate({ data: {} });
    expect(at.getDataByString('__proto__')).toBeNull();
    expect(at.getDataByString('constructor.prototype')).toBeNull();
  });

  it('通常のネストしたパスは従来どおり更新できる', () => {
    const at = new aTemplate({ data: { user: { name: 'a' } } });
    at.updateDataByString('user.name', 'b');
    expect(at.data.user.name).toBe('b');
  });
});

describe('data-action のディスパッチ制限', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    cleanPollution();
  });
  afterEach(cleanPollution);

  // テンプレート要素はインスタンス生成前に DOM に存在している必要がある
  function render(attr, opt = {}, Klass = aTemplate) {
    setTemplate('tpl', `<button data-action-click='${attr}'>go</button>`);
    const at = new Klass({ templates: ['tpl'], data: {}, ...opt });
    at.update();
    return at;
  }

  function click() {
    document.querySelector('button').dispatchEvent(new window.Event('click', { bubbles: true }));
  }

  it('updateDataByString など組み込みの内部メソッドは HTML から呼べない', () => {
    const at = render('updateDataByString(safe,hacked)');
    click();
    expect(at.data.safe).toBeUndefined();
  });

  it('destroy / addTemplate も HTML から呼べない', () => {
    const at = render('addTemplate(x,<img>)');
    click();
    expect(at.templates).toEqual(['tpl']);
    render('destroy()');
    click();
    expect(document.querySelector('[data-id="tpl"]')).not.toBeNull();
  });

  it('constructor や toString など Object.prototype 由来の名前は呼べない', () => {
    let called = false;
    const at = render('toString()');
    at.toString = () => { called = true; };
    click();
    expect(called).toBe(false);
    render('constructor()');
    expect(() => click()).not.toThrow();
  });

  it('method オプションの継承プロパティは呼べない', () => {
    render('hasOwnProperty(x)', { method: {} });
    expect(() => click()).not.toThrow();
  });

  it('README の例どおり update は data-action から呼べる', () => {
    setTemplate('tpl', '<input data-bind=\'search\' data-action-input=\'update\'>');
    const at = new aTemplate({ templates: ['tpl'], data: { search: '' } });
    let updated = 0;
    at.onUpdated = () => { updated += 1; };
    at.update();
    document.querySelector('input').dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(updated).toBe(2);
  });

  it('サブクラスのユーザー定義メソッドは従来どおり呼べる', () => {
    class My extends aTemplate {
      go(a) { this.got = a; }
    }
    const at = render('go(1)', {}, My);
    click();
    expect(at.got).toBe('1');
  });
});
