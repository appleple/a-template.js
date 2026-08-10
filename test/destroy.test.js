import { describe, it, expect, beforeEach } from 'vitest';
import aTemplate from '../src/index';
import { listenerCount } from '../src/util';

function setTemplate(id, html) {
  document.body.innerHTML = `<script type="text/template" id="${id}">${html}</script>`;
}

describe('listen', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('セレクタを渡すとイベント委譲で登録され、delegateTarget が渡る', () => {
    document.body.innerHTML = '<ul id="list"><li class="item">a</li></ul>';
    const list = document.getElementById('list');
    const at = new aTemplate();
    const calls = [];
    at.listen(list, '.item', 'click', e => calls.push(e.delegateTarget));
    document.querySelector('.item').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([document.querySelector('.item')]);
  });

  it('セレクタに null を渡すと委譲せず対象へ直接登録される (window / document 用)', () => {
    const at = new aTemplate();
    const calls = [];
    at.listen(window, null, 'resize', () => calls.push('resize'));
    window.dispatchEvent(new window.Event('resize'));
    expect(calls).toEqual(['resize']);
  });

  it('登録したリスナーは destroy() で解除される (登録と記録が一体化している)', () => {
    const at = new aTemplate();
    const calls = [];
    at.listen(window, null, 'resize keydown', e => calls.push(e.type));
    at.destroy();
    window.dispatchEvent(new window.Event('resize'));
    window.dispatchEvent(new window.Event('keydown'));
    expect(calls).toEqual([]);
  });

  it('複数イベントをまとめて登録できる', () => {
    const at = new aTemplate();
    const calls = [];
    at.listen(window, null, 'resize keydown', e => calls.push(e.type));
    window.dispatchEvent(new window.Event('resize'));
    window.dispatchEvent(new window.Event('keydown'));
    expect(calls).toEqual(['resize', 'keydown']);
  });

  it('メソッドチェーンできる', () => {
    const at = new aTemplate();
    expect(at.listen(window, null, 'resize', () => {})).toBe(at);
  });
});

describe('destroy', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('data-action 系のイベントを全種類解除する', () => {
    setTemplate('tpl', '<input data-action-keydown=\'onKey()\' data-action-click=\'onKey()\'>');
    const calls = [];
    const at = new aTemplate({ templates: ['tpl'], method: { onKey: () => calls.push(1) } });
    at.update();
    const input = document.querySelector('input');
    at.destroy();
    input.dispatchEvent(new window.Event('keydown', { bubbles: true }));
    input.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([]);
  });

  it('update() が挿入した [data-id] コンテナを DOM から撤去する', () => {
    setTemplate('tpl', 'Hello');
    const at = new aTemplate({ templates: ['tpl'] });
    at.update();
    expect(document.querySelector('[data-id="tpl"]')).not.toBeNull();
    at.destroy();
    expect(document.querySelector('[data-id="tpl"]')).toBeNull();
  });

  it('テンプレート定義用の script 要素は残す (自分が挿入したものではない)', () => {
    setTemplate('tpl', 'Hello');
    const at = new aTemplate({ templates: ['tpl'] });
    at.update();
    at.destroy();
    expect(document.getElementById('tpl')).not.toBeNull();
  });

  it('複数テンプレートのコンテナをすべて撤去する', () => {
    document.body.innerHTML = '<script type="text/template" id="a">A</script><script type="text/template" id="b">B</script>';
    const at = new aTemplate({ templates: ['a', 'b'] });
    at.update();
    at.destroy();
    expect(document.querySelector('[data-id="a"]')).toBeNull();
    expect(document.querySelector('[data-id="b"]')).toBeNull();
  });

  it('内部リスナーリストに登録が残らない', () => {
    setTemplate('tpl', '<input data-bind=\'name\' data-action-keydown=\'onKey()\'>');
    const before = listenerCount();
    const at = new aTemplate({ templates: ['tpl'], data: { name: '' }, method: { onKey: () => {} } });
    at.update();
    at.destroy();
    expect(listenerCount()).toBe(before);
  });

  it('最後に処理したイベントへの参照 (this.e) を手放す', () => {
    setTemplate('tpl', '<input data-action-keydown=\'onKey()\'>');
    const at = new aTemplate({ templates: ['tpl'], method: { onKey: () => {} } });
    at.update();
    document.querySelector('input').dispatchEvent(new window.Event('keydown', { bubbles: true }));
    expect(at.e).toBeTruthy();
    at.destroy();
    expect(at.e).toBeNull();
  });

  it('2回呼んでも例外を投げない (冪等)', () => {
    setTemplate('tpl', '<input data-action-keydown=\'onKey()\'>');
    const at = new aTemplate({ templates: ['tpl'], method: { onKey: () => {} } });
    at.update();
    at.destroy();
    expect(() => at.destroy()).not.toThrow();
  });

  it('update() する前に呼んでも例外を投げない', () => {
    setTemplate('tpl', 'Hello');
    const at = new aTemplate({ templates: ['tpl'] });
    expect(() => at.destroy()).not.toThrow();
  });

  it('メソッドチェーンできる', () => {
    const at = new aTemplate();
    expect(at.destroy()).toBe(at);
  });

  it('destroy() 後に update() すると再描画・再バインドできる', () => {
    setTemplate('tpl', '<input data-action-keydown=\'onKey()\'>');
    const calls = [];
    const at = new aTemplate({ templates: ['tpl'], method: { onKey: () => calls.push(1) } });
    at.update();
    at.destroy();
    at.update();
    expect(document.querySelector('[data-id="tpl"]')).not.toBeNull();
    document.querySelector('input').dispatchEvent(new window.Event('keydown', { bubbles: true }));
    expect(calls).toEqual([1]);
  });
});

describe('Symbol.dispose', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('destroy() のエイリアスとして呼べる', () => {
    setTemplate('tpl', 'Hello');
    const at = new aTemplate({ templates: ['tpl'] });
    at.update();
    at[Symbol.dispose]();
    expect(document.querySelector('[data-id="tpl"]')).toBeNull();
  });

  it('using 宣言でスコープを抜けるときに後片付けされる', () => {
    setTemplate('tpl', 'Hello');
    {
      using at = new aTemplate({ templates: ['tpl'] });
      at.update();
      expect(document.querySelector('[data-id="tpl"]')).not.toBeNull();
    }
    expect(document.querySelector('[data-id="tpl"]')).toBeNull();
  });
});
