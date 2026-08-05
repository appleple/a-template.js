import { describe, it, expect, beforeEach } from 'vitest';
import aTemplate from '../src/index';

describe('aTemplate のコンストラクタ', () => {
  it('テンプレート要素が存在する場合、その innerHTML を読み込む', () => {
    document.body.innerHTML = '<script type="text/template" id="tpl">Hello, {name}!</script>';
    const at = new aTemplate({ templates: ['tpl'] });
    expect(at.atemplate).toEqual([{ id: 'tpl', html: 'Hello, {name}!', binded: false }]);
  });

  it('テンプレート要素が存在しない場合でも例外を投げず、html は空文字になる', () => {
    document.body.innerHTML = '';
    expect(() => new aTemplate({ templates: ['not-exist'] })).not.toThrow();
    const at = new aTemplate({ templates: ['not-exist'] });
    expect(at.atemplate).toEqual([{ id: 'not-exist', html: '', binded: false }]);
  });
});

describe('resolveInclude', () => {
  it('#include で指定した id が存在すれば innerHTML に置換する', () => {
    document.body.innerHTML = '<div id="included">included content</div>';
    const at = new aTemplate();
    const html = at.resolveInclude('<!-- #include id="included" -->');
    expect(html).toBe('included content');
  });

  it('#include で指定した id が存在しなくても例外を投げず、空文字に置換する', () => {
    document.body.innerHTML = '';
    const at = new aTemplate();
    expect(() => at.resolveInclude('<!-- #include id="missing" -->')).not.toThrow();
    expect(at.resolveInclude('<!-- #include id="missing" -->')).toBe('');
  });
});

describe('update', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('アンカー要素(#id)が存在しない場合、例外を投げずに何もしない', () => {
    const at = new aTemplate({ templates: ['tpl'] });
    expect(() => at.update()).not.toThrow();
    expect(document.querySelector('[data-id="tpl"]')).toBeNull();
  });

  it('アンカー要素が存在する場合、直後に描画結果を挿入する', () => {
    document.body.innerHTML = '<script type="text/template" id="tpl">Hello, {name}!</script><div id="tpl"></div>';
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'World' } });
    at.update();
    const rendered = document.querySelector('[data-id="tpl"]');
    expect(rendered).not.toBeNull();
    expect(rendered.innerHTML).toBe('Hello, World!');
  });

  it('既に描画済みの場合、再描画してもアンカー要素は必要ない', () => {
    document.body.innerHTML = '<script type="text/template" id="tpl">Hello, {name}!</script><div id="tpl"></div>';
    const at = new aTemplate({ templates: ['tpl'], data: { name: 'World' } });
    at.update();
    // アンカーを消しても、data-id 要素が既にあるので再描画できる
    document.getElementById('tpl').remove();
    at.data.name = 'Again';
    expect(() => at.update()).not.toThrow();
    expect(document.querySelector('[data-id="tpl"]').innerHTML).toBe('Hello, Again!');
  });
});
