
export const matches = (element, query) => {
  const matches = (element.document || element.ownerDocument).querySelectorAll(query);
  let i = matches.length;
  while (--i >= 0 && matches.item(i) !== element) {}
  return i > -1;
};

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
    const listener = (e) => {
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
    listenerList.forEach((item, index) => {
      if (item.element === element && item.query === query && item.event === event) {
        element.removeEventListener(event, item.listener, item.capture);
        listenerList.splice(index, 1);
      }
    });
  });
};
