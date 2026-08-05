import { describe, it, expect } from 'vitest';
import aTemplate from '../src/index';

describe('resolveBlock: 変数解決', () => {
  it('{key} をアイテムの値に置換する', () => {
    const at = new aTemplate();
    expect(at.resolveBlock('{name}さん', { name: 'たろう' })).toBe('たろうさん');
  });

  it('値が存在しなければ空文字に置換する', () => {
    const at = new aTemplate();
    expect(at.resolveBlock('[{name}]', {})).toBe('[]');
  });

  it('{i} はループのインデックスに置換する', () => {
    const at = new aTemplate();
    expect(at.resolveBlock('{i}', {}, 3)).toBe('3');
  });

  it('値が関数ならインスタンスを this にして実行した結果を使う', () => {
    const at = new aTemplate();
    const item = { greeting() {
      return 'hi';
    } };
    expect(at.resolveBlock('{greeting}', item)).toBe('hi');
  });

  it('convert が定義されていれば変換関数を通す', () => {
    const at = new aTemplate({ convert: { yen: v => `${v}円` } });
    expect(at.resolveBlock('{price}[yen]', { price: 100 })).toBe('100円');
  });
});

describe('resolveBlock: touch / touchnot ブロック', () => {
  const html = '<!-- BEGIN status:touch#ok -->OK<!-- END status:touch#ok -->';
  const htmlNot = '<!-- BEGIN status:touchnot#ok -->NG<!-- END status:touchnot#ok -->';

  it('touch: 値が一致すればブロックの中身を残す', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(html, { status: 'ok' })).toBe('OK');
  });

  it('touch: 値が一致しなければブロックを空にする', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(html, { status: 'ng' })).toBe('');
  });

  it('touchnot: 値が一致しなければブロックの中身を残す', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(htmlNot, { status: 'ng' })).toBe('NG');
  });

  it('touchnot: 値が一致すればブロックを空にする', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(htmlNot, { status: 'ok' })).toBe('');
  });
});

describe('resolveBlock: exist / empty ブロック', () => {
  const existHtml = '<!-- BEGIN name:exist -->あり<!-- END name:exist -->';
  const emptyHtml = '<!-- BEGIN name:empty -->なし<!-- END name:empty -->';

  it('exist: 値が truthy か 0 ならブロックを残す', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(existHtml, { name: 'x' })).toBe('あり');
    expect(at.resolveBlock(existHtml, { name: 0 })).toBe('あり');
  });

  it('exist: 値が falsy (0 を除く) ならブロックを空にする', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(existHtml, { name: '' })).toBe('');
    expect(at.resolveBlock(existHtml, {})).toBe('');
  });

  it('empty: 値が falsy (0 を除く) ならブロックを残す', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(emptyHtml, {})).toBe('なし');
  });

  it('empty: 値が truthy か 0 ならブロックを空にする', () => {
    const at = new aTemplate();
    expect(at.resolveBlock(emptyHtml, { name: 'x' })).toBe('');
    expect(at.resolveBlock(emptyHtml, { name: 0 })).toBe('');
  });
});

describe('resolveAbsBlock', () => {
  it('絶対パス形式 {a.b.c} を this.data から解決する', () => {
    const at = new aTemplate({ data: { user: { name: 'たろう' } } });
    expect(at.resolveAbsBlock('{user.name}')).toBe('たろう');
  });

  it('該当データがなければ getDataByString の戻り値 (null) を文字列化したものになる', () => {
    // getDataByString は未存在パスに対し null を返し、resolveAbsBlock は
    // typeof null !== 'undefined' であるため、そのまま採用してしまう。
    // これは仕様上の癖であり、置換自体はスキップされない。
    const at = new aTemplate({ data: {} });
    expect(at.resolveAbsBlock('{not.exist}')).toBe('null');
  });
});

describe('resolveWith', () => {
  it(':with ブロック内の data-bind に prefix を付与する', () => {
    const at = new aTemplate();
    const html = '<!-- BEGIN user:with --><input data-bind=\'name\'><!-- END user:with -->';
    expect(at.resolveWith(html)).toContain('data-bind=\'user.name\'');
  });
});

describe('hasLoop / resolveLoop', () => {
  it('hasLoop: :loop ブロックがあれば true を返す', () => {
    const at = new aTemplate();
    expect(at.hasLoop('<!-- BEGIN list:loop -->x<!-- END list:loop -->')).toBe(true);
    expect(at.hasLoop('no loop here')).toBe(false);
  });

  it('resolveLoop: 配列の各要素についてブロックを繰り返し描画する', () => {
    const at = new aTemplate({ data: { list: [{ name: 'a' }, { name: 'b' }] } });
    const html = '<!-- BEGIN list:loop --><li>{name}</li><!-- END list:loop -->';
    expect(at.resolveLoop(html)).toBe('<li>a</li><li>b</li>');
  });

  it('resolveLoop: 配列以外 (undefined 等) の場合は空文字になる', () => {
    const at = new aTemplate({ data: {} });
    const html = '<!-- BEGIN list:loop -->x<!-- END list:loop -->';
    expect(at.resolveLoop(html)).toBe('');
  });
});

describe('getHtml (テンプレート解決パイプライン全体)', () => {
  it('登録されていないテンプレート id は空文字を返す', () => {
    const at = new aTemplate();
    expect(at.getHtml('not-registered')).toBe('');
  });

  it('row=true のときは query 自体を html として扱う', () => {
    const at = new aTemplate({ data: { name: 'たろう' } });
    expect(at.getHtml('{name}さん', true)).toBe('たろうさん');
  });

  it('ループ・変数・touch を組み合わせたテンプレートを一括で解決する', () => {
    const at = new aTemplate({
      data: {
        title: '一覧',
        items: [
          { name: 'apple', inStock: 1 },
          { name: 'banana', inStock: '' }
        ]
      }
    });
    at.addTemplate('list', [
      '<h1>{title}</h1>',
      '<!-- BEGIN items:loop -->',
      '<!-- BEGIN inStock:exist --><p>{name}: 在庫あり</p><!-- END inStock:exist -->',
      '<!-- BEGIN inStock:empty --><p>{name}: 在庫なし</p><!-- END inStock:empty -->',
      '<!-- END items:loop -->'
    ].join('\n'));
    const html = at.getHtml('list');
    expect(html).toContain('<h1>一覧</h1>');
    expect(html).toContain('<p>apple: 在庫あり</p>');
    expect(html).toContain('<p>banana: 在庫なし</p>');
  });
});
