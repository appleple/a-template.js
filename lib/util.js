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

var on = exports.on = function on(element, query, eventNames, fn) {
  var events = eventNames.split(' ');
  events.forEach(function (event) {
    element.addEventListener(event, function (e) {
      var target = e.target;
      var delegateTarget = findAncestor(e.target, query);
      if (delegateTarget) {
        e.delegateTarget = delegateTarget;
        fn(e);
      }
    });
  });
};