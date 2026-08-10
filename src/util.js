export const matches = (element, query) => {
  const matches = (element.document || element.ownerDocument).querySelectorAll(query);
  let i = matches.length;
  while (--i >= 0 && matches.item(i) !== element) {
    // 一致する要素が見つかるか、走査し尽くすまでインデックスを進めるだけ
  }
  return i > -1;
};

// document.querySelector と同様、一致する要素がなければ null を返す
export const selector = selector => document.querySelector(selector);

export const findAncestor = (element, selector) => {
  if (typeof element.closest === 'function') {
    return element.closest(selector) || null;
  }
  while (element && element !== document) {
    if (matches(element, selector)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
};

const listenerList = [];

export const on = (element, query, eventNames, fn, capture = false) => {
  const events = eventNames.split(' ');
  events.forEach((event) => {
    // query が null のときは委譲せず element 自身に直接ぶら下げる。
    // window / document は findAncestor が先祖を辿れず必ず null を返すため、
    // resize や keydown のようなグローバルイベントを委譲では扱えない
    const listener = query === null ? fn : (e) => {
      const delegateTarget = findAncestor(e.target, query);
      if (delegateTarget) {
        e.delegateTarget = delegateTarget;
        fn(e);
      }
    };
    listenerList.push({ listener, element, query, event, capture });
    element.addEventListener(event, listener, capture);
  });
};

export const off = (element, query, eventNames) => {
  const events = eventNames.split(' ');
  events.forEach((event) => {
    // 前方から forEach + splice で回すと、削除でインデックスがずれて直後の要素を
    // 読み飛ばす。同一 element/query/event に複数登録した分が解除漏れになり、
    // listenerList が element を掴んだまま detached DOM がリークするため後方から回す
    for (let i = listenerList.length - 1; i >= 0; i -= 1) {
      const item = listenerList[i];
      if (item.element === element && item.query === query && item.event === event) {
        element.removeEventListener(event, item.listener, item.capture);
        listenerList.splice(i, 1);
      }
    }
  });
};

// listenerList は解除漏れがそのままリークになるため、登録数を検証できるようにしておく。
// package.json の exports には util.js を含めていないので公開 API にはならない
export const listenerCount = () => listenerList.length;
