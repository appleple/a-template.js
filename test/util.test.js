import { describe, it, expect, beforeEach } from 'vitest';
import {
  selector, matches, findAncestor, on, off
} from '../src/util';

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

describe('matches', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul><li class="item">a</li><li>b</li></ul>';
  });

  it('要素がセレクタに一致すれば true を返す', () => {
    const li = document.querySelector('.item');
    expect(matches(li, '.item')).toBe(true);
  });

  it('要素がセレクタに一致しなければ false を返す', () => {
    const li = document.querySelectorAll('li')[1];
    expect(matches(li, '.item')).toBe(false);
  });
});

describe('findAncestor', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="outer"><span class="inner"><b id="leaf">x</b></span></div>';
  });

  it('closest が使える環境ではそれを使って先祖要素を返す', () => {
    const leaf = document.getElementById('leaf');
    expect(findAncestor(leaf, '.outer')).toBe(document.querySelector('.outer'));
  });

  it('closest が使えない環境では手動で辿って先祖要素を返す (フォールバック)', () => {
    const leaf = document.getElementById('leaf');
    const original = leaf.closest;
    leaf.closest = undefined;
    try {
      expect(findAncestor(leaf, '.outer')).toBe(document.querySelector('.outer'));
    } finally {
      leaf.closest = original;
    }
  });

  it('一致する先祖が存在しなければ null を返す', () => {
    const leaf = document.getElementById('leaf');
    leaf.closest = undefined;
    expect(findAncestor(leaf, '.not-exists')).toBeNull();
  });
});

describe('on / off (イベント委譲)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul id="list"><li class="item">a</li></ul>';
  });

  it('on: 委譲対象の子要素がイベントに一致すれば delegateTarget 付きでハンドラが呼ばれる', () => {
    const list = document.getElementById('list');
    const item = document.querySelector('.item');
    const calls = [];
    on(list, '.item', 'click', (e) => {
      calls.push(e.delegateTarget);
    });
    item.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([item]);
  });

  it('on: 一致しない要素からのイベントではハンドラが呼ばれない', () => {
    const list = document.getElementById('list');
    const calls = [];
    on(list, '.not-exists', 'click', () => calls.push(true));
    list.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([]);
  });

  it('off: 登録したハンドラを解除できる', () => {
    const list = document.getElementById('list');
    const item = document.querySelector('.item');
    const calls = [];
    const handler = () => calls.push(true);
    on(list, '.item', 'click', handler);
    off(list, '.item', 'click');
    item.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(calls).toEqual([]);
  });
});
