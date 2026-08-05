/*!
 * a-template v0.6.1
 * (c) appleple
 * Released under the MIT License.
 */
var aTemplate = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    default: () => aTemplate
  });

  // node_modules/morphdom/dist/morphdom-esm.js
  var DOCUMENT_FRAGMENT_NODE = 11;
  function morphAttrs(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
      attr = toNodeAttrs[i];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
      attr = fromNodeAttrs[d];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range;
  var NS_XHTML = "http://www.w3.org/1999/xhtml";
  var doc = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
  var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
  function createFragmentFromTemplate(str) {
    var template = doc.createElement("template");
    template.innerHTML = str;
    return template.content.childNodes[0];
  }
  function createFragmentFromRange(str) {
    if (!range) {
      range = doc.createRange();
      range.selectNode(doc.body);
    }
    var fragment = range.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap(str) {
    var fragment = doc.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT) {
      return createFragmentFromTemplate(str);
    } else if (HAS_RANGE_SUPPORT) {
      return createFragmentFromRange(str);
    }
    return createFragmentFromWrap(str);
  }
  function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name) : doc.createElementNS(namespaceURI, name);
  }
  function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
      fromEl[name] = toEl[name];
      if (fromEl[name]) {
        fromEl.setAttribute(name, "");
      } else {
        fromEl.removeAttribute(name);
      }
    }
  }
  var specialElHandlers = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp(fromEl, toEl, "checked");
      syncBooleanAttrProp(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
            if (!curChild) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i;
                break;
              }
              i++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE = 1;
  var DOCUMENT_FRAGMENT_NODE$1 = 11;
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;
  function noop() {
  }
  function defaultGetNodeKey(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory(morphAttrs2) {
    return function morphdom2(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML") {
          var toNodeHtml = toNode;
          toNode = doc.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else if (fromNode.nodeName === "BODY") {
          var toNodeBody = toNode;
          toNode = doc.createElement("html");
          toNode.innerHTML = toNodeBody;
          var bodyElement = toNode.querySelector("body");
          if (bodyElement) {
            toNode = bodyElement;
          }
        } else {
          toNode = toElement(toNode);
        }
      } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        toNode = toNode.firstElementChild;
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
      var onNodeAdded = options.onNodeAdded || noop;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop;
      var onElUpdated = options.onElUpdated || noop;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
      var onNodeDiscarded = options.onNodeDiscarded || noop;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
      var skipFromChildren = options.skipFromChildren || noop;
      var addChild = options.addChild || function(parent, child) {
        return parent.appendChild(child);
      };
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
          if (beforeUpdateResult === false) {
            return;
          } else if (beforeUpdateResult instanceof HTMLElement) {
            fromEl = beforeUpdateResult;
            indexTree(fromEl);
          }
          morphAttrs2(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren(fromEl, toEl);
        } else {
          specialElHandlers.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren(fromEl, toEl) {
        var skipFrom = skipFromChildren(fromEl, toEl);
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer: while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (!skipFrom && curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                        curFromNodeKey = getNodeKey(curFromNodeChild);
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            if (!skipFrom) {
              addChild(fromEl, matchingFromEl);
            }
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              addChild(fromEl, curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE) {
          if (toNodeType === ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom = morphdomFactory(morphAttrs);
  var morphdom_esm_default = morphdom;

  // src/util.js
  var matches = (element, query) => {
    const matches2 = (element.document || element.ownerDocument).querySelectorAll(query);
    let i = matches2.length;
    while (--i >= 0 && matches2.item(i) !== element) {
    }
    return i > -1;
  };
  var selector = (selector2) => document.querySelector(selector2);
  var findAncestor = (element, selector2) => {
    if (typeof element.closest === "function") {
      return element.closest(selector2) || null;
    }
    while (element && element !== document) {
      if (matches(element, selector2)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  };
  var listenerList = [];
  var on = (element, query, eventNames, fn, capture = false) => {
    const events = eventNames.split(" ");
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
  var off = (element, query, eventNames) => {
    const events = eventNames.split(" ");
    events.forEach((event) => {
      listenerList.forEach((item, index) => {
        if (item.element === element && item.query === query && item.event === event) {
          element.removeEventListener(event, item.listener, item.capture);
          listenerList.splice(index, 1);
        }
      });
    });
  };

  // src/index.js
  var eventType = "input paste copy click change keydown keyup keypress contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend focus";
  var bindType = "input change click";
  var dataAction = `${eventType.replace(/([a-z]+)/g, "[data-action-$1],")}[data-action]`;
  var aTemplate = class {
    constructor(opt) {
      this.atemplate = [];
      this.events = [];
      if (opt) {
        Object.keys(opt).forEach((key) => {
          this[key] = opt[key];
        });
      }
      if (!this.data) {
        this.data = {};
      }
      if (!this.templates) {
        this.templates = [];
      }
      const templates = this.templates;
      const length = templates.length;
      for (let i = 0, n = length; i < n; i += 1) {
        const template = this.templates[i];
        const templateEl = selector(`#${template}`);
        const html = templateEl ? templateEl.innerHTML : "";
        this.atemplate.push({ id: template, html, binded: false });
      }
    }
    addDataBind(ele) {
      on(ele, "[data-bind]", bindType, (e) => {
        const target = e.delegateTarget;
        const data = target.getAttribute("data-bind");
        const attr = target.getAttribute("href");
        let value = target.value;
        if (attr) {
          value = value.replace("#", "");
        }
        if (target.getAttribute("type") === "checkbox") {
          const arr = [];
          const items = document.querySelectorAll(`[data-bind="${data}"]`);
          [].forEach.call(items, (item) => {
            if (item.checked) {
              arr.push(item.value);
            }
          });
        } else if (target.getAttribute("type") !== "radio") {
          this.updateDataByString(data, value);
        }
      });
      this.events.push({
        element: ele,
        selector: "[data-bind]",
        event: bindType
      });
    }
    addActionBind(ele) {
      on(ele, dataAction, eventType, (e) => {
        const target = e.delegateTarget;
        const events = eventType.split(" ");
        let action = "action";
        events.forEach((event) => {
          if (target.getAttribute(`data-action-${event}`)) {
            if (e.type === event) {
              action += `-${event}`;
            }
          }
        });
        const string = target.getAttribute(`data-${action}`);
        if (!string) {
          return;
        }
        const method = string.replace(/\(.*?\);?/, "");
        const parameter = string.replace(/(.*?)\((.*?)\);?/, "$2");
        const pts = parameter.split(",");
        this.e = e;
        if (this.method && this.method[method]) {
          this.method[method](...pts);
        } else if (this[method]) {
          this[method](...pts);
        }
      });
      this.events.push({
        element: ele,
        selector: dataAction,
        event: bindType
      });
    }
    removeTemplateEvents() {
      this.events.forEach((event) => {
        off(event.element, event.selector, event.event);
      });
    }
    addTemplate(id, html) {
      this.atemplate.push({ id, html, binded: false });
      this.templates.push(id);
    }
    // loadHtml() {
    //   const templates = this.templates;
    //   const promises = [];
    //   templates.forEach((template) => {
    //     const d = new $.Deferred();
    //     promises.push(d);
    //     const src = selector(`#${template}`).getAttribute('src');
    //     $.ajax({
    //       url: src,
    //       type: 'GET',
    //       dataType: 'text'
    //     }).success((data) => {
    //       selector(`#${template}`).innerHTML = data;
    //       d.resolve();
    //     });
    //   });
    //   return $.when(...promises);
    // }
    getData() {
      return JSON.parse(JSON.stringify(this.data));
    }
    saveData(key) {
      const data = JSON.stringify(this.data);
      localStorage.setItem(key, data);
    }
    setData(opt) {
      Object.keys(opt).forEach((key) => {
        if (typeof opt[key] !== "function") {
          this.data[key] = opt[key];
        }
      });
    }
    loadData(key) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) {
        this.setData(data);
      }
    }
    getRand(a, b) {
      return ~~(Math.random() * (b - a + 1)) + a;
    }
    getRandText(limit) {
      let ret = "";
      const strings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const length = strings.length;
      for (let i = 0; i < limit; i += 1) {
        ret += strings.charAt(Math.floor(this.getRand(0, length)));
      }
      return ret;
    }
    getDataFromObj(s, o) {
      s = s.replace(/\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\]/g, ".$1");
      s = s.replace(/^\./, "");
      const a = s.split(".");
      while (a.length) {
        const n = a.shift();
        if (o && typeof o === "object" && n in o) {
          o = o[n];
        } else {
          return null;
        }
      }
      return o;
    }
    getDataByString(s) {
      const o = this.data;
      return this.getDataFromObj(s, o);
    }
    updateDataByString(path, newValue) {
      let object = this.data;
      const stack = path.split(".");
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      object[stack.shift()] = newValue;
    }
    removeDataByString(path) {
      let object = this.data;
      const stack = path.split(".");
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      const shift = stack.shift();
      if (shift.match(/^\d+$/)) {
        object.splice(Number(shift), 1);
      } else {
        delete object[shift];
      }
    }
    resolveBlock(html, item, i) {
      const that = this;
      const touchs = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
      const touchnots = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
      const exists = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist -->/g);
      const empties = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty -->/g);
      if (touchs) {
        for (let k = 0, n = touchs.length; k < n; k += 1) {
          let start = touchs[k];
          start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, "($1):touch#($2)");
          const end = start.replace(/BEGIN/, "END");
          const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, "g");
          html = html.replace(reg, (m, key2, val, next) => {
            const itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (`${itemkey}` === val) {
              return next;
            }
            return "";
          });
        }
      }
      if (touchnots) {
        for (let k = 0, n = touchnots.length; k < n; k += 1) {
          let start = touchnots[k];
          start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, "($1):touchnot#($2)");
          const end = start.replace(/BEGIN/, "END");
          const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, "g");
          html = html.replace(reg, (m, key2, val, next) => {
            const itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (`${itemkey}` !== val) {
              return next;
            }
            return "";
          });
        }
      }
      if (exists) {
        for (let k = 0, n = exists.length; k < n; k += 1) {
          let start = exists[k];
          start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist/, "($1):exist");
          const end = start.replace(/BEGIN/, "END");
          const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, "g");
          html = html.replace(reg, (m, key2, next) => {
            const itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (itemkey || itemkey === 0) {
              return next;
            }
            return "";
          });
        }
      }
      if (empties) {
        for (let k = 0, n = empties.length; k < n; k += 1) {
          let start = empties[k];
          start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty/, "($1):empty");
          const end = start.replace(/BEGIN/, "END");
          const empty = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, "g");
          html = html.replace(empty, (m, key2, next) => {
            const itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (!itemkey && itemkey !== 0) {
              return next;
            }
            return "";
          });
        }
      }
      html = html.replace(/{([\w\-\.ぁ-んァ-ヶ亜-熙]+)}(\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\])*/g, (n, key3, key4, converter) => {
        let data;
        if (`${key3}` === "i") {
          data = i;
        } else if (item[key3] || item[key3] === 0) {
          if (typeof item[key3] === "function") {
            data = item[key3].apply(that);
          } else {
            data = item[key3];
          }
        } else {
          if (converter && that.convert && that.convert[converter]) {
            return that.convert[converter].call(that, "");
          }
          return "";
        }
        if (converter && that.convert && that.convert[converter]) {
          return that.convert[converter].call(that, data);
        }
        return data;
      });
      return html;
    }
    /* 絶対パス形式の変数を解決 */
    resolveAbsBlock(html) {
      const that = this;
      html = html.replace(/{(.*?)}/g, (n, key3) => {
        const data = that.getDataByString(key3);
        if (typeof data !== "undefined") {
          if (typeof data === "function") {
            return data.apply(that);
          }
          return data;
        }
        return n;
      });
      return html;
    }
    resolveInclude(html) {
      const include = /<!-- #include id="(.*?)" -->/g;
      html = html.replace(include, (m, key) => {
        const el = selector(`#${key}`);
        return el ? el.innerHTML : "";
      });
      return html;
    }
    resolveWith(html) {
      const width = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->/g;
      html = html.replace(width, (m, key) => {
        m = m.replace(/data\-bind=['"](.*?)['"]/g, `data-bind='${key}.$1'`);
        return m;
      });
      return html;
    }
    resolveLoop(html) {
      const loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
      const that = this;
      html = html.replace(loop, (m, key, val) => {
        const keyItem = that.getDataByString(key);
        const keys = typeof keyItem === "function" ? keyItem.apply(that) : keyItem;
        let ret = "";
        if (keys instanceof Array) {
          for (let i = 0, n = keys.length; i < n; i += 1) {
            ret += that.resolveBlock(val, keys[i], i);
          }
        }
        ret = ret.replace(/\\([^\\])/g, "$1");
        return ret;
      });
      return html;
    }
    removeData(arr) {
      const data = this.data;
      Object.keys(data).forEach((i) => {
        for (let t = 0, n = arr.length; t < n; t += 1) {
          if (i === arr[t]) {
            delete data[i];
          }
        }
      });
      return this;
    }
    hasLoop(txt) {
      const loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
      if (txt.match(loop)) {
        return true;
      }
      return false;
    }
    getHtml(query, row) {
      const template = this.atemplate.find((item) => item.id === query);
      let html = "";
      if (template && template.html) {
        html = template.html;
      }
      if (row) {
        html = query;
      }
      if (!html) {
        return "";
      }
      const data = this.data;
      html = this.resolveInclude(html);
      html = this.resolveWith(html);
      while (this.hasLoop(html)) {
        html = this.resolveLoop(html);
      }
      html = this.resolveBlock(html, data);
      html = html.replace(/\\([^\\])/g, "$1");
      html = this.resolveAbsBlock(html);
      return html.replace(/^([\t ])*\n/gm, "");
    }
    update(renderWay = "html", part) {
      const templates = this.templates;
      if (this.beforeUpdated) {
        this.beforeUpdated();
      }
      for (let i = 0, n = templates.length; i < n; i += 1) {
        const tem = templates[i];
        const query = `#${tem}`;
        const html = this.getHtml(tem);
        let target = selector(`[data-id='${tem}']`);
        if (!target) {
          const anchor = selector(query);
          if (anchor) {
            anchor.insertAdjacentHTML("afterend", `<div data-id="${tem}"></div>`);
            target = selector(`[data-id='${tem}']`);
            if (renderWay === "text") {
              target.innerText = html;
            } else {
              target.innerHTML = html;
            }
          }
        } else if (renderWay === "text") {
          target.innerText = html;
        } else if (part) {
          const doc2 = document.createElement("div");
          doc2.innerHTML = html;
          const partHtml = doc2.querySelector(part).outerHTML;
          morphdom_esm_default(target.querySelector(part), partHtml);
        } else {
          morphdom_esm_default(target, `<div data-id='${tem}'>${html}</div>`);
        }
        if (target) {
          const template = this.atemplate.find((item) => item.id === tem);
          if (!template.binded) {
            template.binded = true;
            this.addDataBind(target);
            this.addActionBind(target);
          }
        }
      }
      this.updateBindingData(part);
      if (this.onUpdated) {
        this.onUpdated(part);
      }
      return this;
    }
    updateBindingData(part) {
      const templates = this.templates;
      for (let i = 0, n = templates.length; i < n; i += 1) {
        const temp = templates[i];
        let template = selector(`[data-id='${temp}']`);
        if (template && part) {
          template = template.querySelector(part);
        }
        if (template) {
          const binds = template.querySelectorAll("[data-bind]");
          [].forEach.call(binds, (item) => {
            const data = this.getDataByString(item.getAttribute("data-bind"));
            if (item.getAttribute("type") === "checkbox" || item.getAttribute("type") === "radio") {
              if (data === item.value) {
                item.checked = true;
              }
            } else {
              item.value = data;
            }
          });
          const onewaybinds = template.querySelectorAll("[data-bind-oneway]");
          [].forEach.call(onewaybinds, (item) => {
            const data = this.getDataByString(item.getAttribute("data-bind-oneway"));
            if (item.getAttribute("type") === "checkbox" || item.getAttribute("type") === "radio") {
              if (data === item.value) {
                item.checked = true;
              }
            } else {
              item.value = data;
            }
          });
        }
      }
      return this;
    }
    applyMethod(method, ...args) {
      return this.method[method](...args);
    }
    getComputedProp(prop) {
      return this.data[prop].apply(this);
    }
    remove(path) {
      let object = this.data;
      const stack = path.split(".");
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      const shift = stack.shift();
      if (shift.match(/^\d+$/)) {
        object.splice(Number(shift), 1);
      } else {
        delete object[shift];
      }
      return this;
    }
  };
  return __toCommonJS(src_exports);
})();
aTemplate = aTemplate.default;
