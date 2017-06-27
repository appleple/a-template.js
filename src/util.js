
export const matches = (element, query) => {
  const matches = (element.document || element.ownerDocument).querySelectorAll(query);
  let i = matches.length;
  while (--i >= 0 && matches.item(i) !== element) {}
  return i > -1;
}

export const selector = (selector) => {
  return document.querySelector(selector);
}

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
}

export const on = (element, query, eventNames, fn) => {
  const events = eventNames.split(' ');
  events.forEach((event) => {
    element.addEventListener(event, (e) => {
      let target = e.target;
      const delegateTarget = findAncestor(e.target, query);
      if(delegateTarget) {
        e.delegateTarget = delegateTarget;
        fn(e);
      }
    });
  });
};