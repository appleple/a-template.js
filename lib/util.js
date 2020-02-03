'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var matches = exports.matches = function matches(element, query) {
  var matches = (element.document || element.ownerDocument).querySelectorAll(query);
  var i = matches.length;
  while (--i >= 0 && matches.item(i) !== element) {}
  return i > -1;
};

var selector = exports.selector = function selector(_selector) {
  return document.querySelector(_selector);
};

var findAncestor = exports.findAncestor = function findAncestor(element, selector) {
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

var listenerList = [];

var on = exports.on = function on(element, query, eventNames, fn) {
  var capture = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  var events = eventNames.split(' ');
  events.forEach(function (event) {
    var listener = function listener(e) {
      var delegateTarget = findAncestor(e.target, query);
      if (delegateTarget) {
        e.delegateTarget = delegateTarget;
        fn(e);
      }
    };
    listenerList.push({ listener: listener, element: element, query: query, event: event, capture: capture });
    element.addEventListener(event, listener, capture);
  });
};

var off = exports.off = function off(element, query, eventNames) {
  var events = eventNames.split(' ');
  events.forEach(function (event) {
    listenerList.forEach(function (item, index) {
      if (item.element === element && item.query === query && item.event === event) {
        element.removeEventListener(event, item.listener, item.capture);
        listenerList.splice(index, 1);
      }
    });
  });
};