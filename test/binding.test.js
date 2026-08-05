import { describe, it, expect, beforeEach } from 'vitest';
import aTemplate from '../src/index';

function setTemplate(id, html) {
  document.body.innerHTML = `<script type="text/template" id="${id}">${html}</script><div id="${id}"></div>`;
}

describe('update: golden path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('初回は #id の直後にレンダリング結果を挿入する', () => {
    setTemplate('tpl', 'Hello, {name}!');
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'World' } });
    at.update();
    expect(document.querySelector('[data-id="tpl"]').innerHTML).toBe('Hello, World!');
  });

  it('2回目以降は data-id 要素を morphdom で差分更新する (要素は再生成されない)', () => {
    setTemplate('tpl', 'Hello, {name}!');
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'World' } });
    at.update();
    const before = document.querySelector('[data-id="tpl"]');
    at.data.name = 'Again';
    at.update();
    const after = document.querySelector('[data-id="tpl"]');
    expect(after).toBe(before);
    expect(after.innerHTML).toBe('Hello, Again!');
  });

  it('renderWay="text" のときは innerHTML ではなく innerText で描画する', () => {
    setTemplate('tpl', '<b>{name}</b>');
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'World' } });
    at.update('text');
    expect(document.querySelector('[data-id="tpl"]').innerText).toBe('<b>World</b>');
  });

  it('beforeUpdated / onUpdated フックが呼ばれる', () => {
    setTemplate('tpl', 'x');
    const calls = [];
    const at = new aTemplate({
      templates: ['tpl'],
      beforeUpdated: () => calls.push('before'),
      onUpdated: () => calls.push('after')
    });
    at.update();
    expect(calls).toEqual(['before', 'after']);
  });
});

describe('addDataBind: [data-bind] の双方向バインディング', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('input イベントで data-bind の値を this.data に反映する', () => {
    setTemplate('tpl', '<input data-bind=\'name\'>');
    const at = new aTemplate({ templates: ['tpl'], data: { name: '' } });
    at.update();
    const input = document.querySelector('[data-bind="name"]');
    input.value = 'たろう';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(at.data.name).toBe('たろう');
  });

  it('updateBindingData: this.data の値をフォーム要素に反映する (逆方向)', () => {
    setTemplate('tpl', '<input data-bind=\'name\'>');
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'はじめ' } });
    at.update();
    const input = document.querySelector('[data-bind="name"]');
    expect(input.value).toBe('はじめ');
  });
});

describe('addActionBind: [data-action-*] のメソッドディスパッチ', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('data-action-click に対応するインスタンスメソッドをクリック時に呼び出す', () => {
    setTemplate('tpl', '<button data-action-click=\'handleClick(1,2)\'>go</button>');
    class MyTemplate extends aTemplate {
      handleClick(a, b) {
        this.calledWith = [a, b];
      }
    }
    const at = new MyTemplate({ templates: ['tpl'] });
    at.update();
    document.querySelector('button').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(at.calledWith).toEqual(['1', '2']);
  });

  it('method オプションに登録した名前空間経由でも呼び出せる', () => {
    setTemplate('tpl', '<button data-action-click=\'ns()\'>go</button>');
    const calls = [];
    const at = new aTemplate({
      templates: ['tpl'],
      method: { ns: () => calls.push('called') }
    });
    at.update();
    document.querySelector('button').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual(['called']);
  });
});

describe('addTemplate / removeTemplateEvents', () => {
  it('addTemplate: 実行時にテンプレートを追加できる', () => {
    const at = new aTemplate();
    at.addTemplate('extra', 'Hi {name}');
    expect(at.templates).toContain('extra');
    expect(at.getHtml('extra')).toBe('Hi ');
  });

  it('removeTemplateEvents: バインド済みイベントを解除し、再クリックしても発火しない', () => {
    document.body.innerHTML = '';
    setTemplate('tpl', '<button data-action-click=\'onClick()\'>go</button>');
    const calls = [];
    const at = new aTemplate({ templates: ['tpl'], method: { onClick: () => calls.push(1) } });
    at.update();
    at.removeTemplateEvents();
    document.querySelector('button').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([]);
  });
});
