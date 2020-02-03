'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('ie-array-find-polyfill');

var _morphdom = require('morphdom');

var _morphdom2 = _interopRequireDefault(_morphdom);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventType = 'input paste copy click change keydown keyup keypress contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend focus';
var bindType = 'input change click';
var dataAction = eventType.replace(/([a-z]+)/g, '[data-action-$1],') + '[data-action]';

var aTemplate = function () {
  function aTemplate(opt) {
    var _this = this;

    _classCallCheck(this, aTemplate);

    this.atemplate = [];
    this.events = [];
    if (opt) {
      Object.keys(opt).forEach(function (key) {
        _this[key] = opt[key];
      });
    }
    if (!this.data) {
      this.data = {};
    }
    if (!this.templates) {
      this.templates = [];
    }
    var templates = this.templates;
    var length = templates.length;
    for (var i = 0, n = length; i < n; i += 1) {
      var template = this.templates[i];
      var html = (0, _util.selector)('#' + template).innerHTML;
      this.atemplate.push({ id: template, html: html, binded: false });
    }
  }

  _createClass(aTemplate, [{
    key: 'addDataBind',
    value: function addDataBind(ele) {
      var _this2 = this;

      (0, _util.on)(ele, '[data-bind]', bindType, function (e) {
        var target = e.delegateTarget;
        var data = target.getAttribute('data-bind');
        var attr = target.getAttribute('href');
        var value = target.value;
        if (attr) {
          value = value.replace('#', '');
        }
        if (target.getAttribute('type') === 'checkbox') {
          (function () {
            var arr = [];
            var items = document.querySelectorAll('[data-bind="' + data + '"]');
            [].forEach.call(items, function (item) {
              if (item.checked) {
                arr.push(item.value);
              }
            });
          })();
        } else if (target.getAttribute('type') !== 'radio') {
          _this2.updateDataByString(data, value);
        }
      });
      this.events.push({
        element: ele,
        selector: '[data-bind]',
        event: bindType
      });
    }
  }, {
    key: 'addActionBind',
    value: function addActionBind(ele) {
      var _this3 = this;

      (0, _util.on)(ele, dataAction, eventType, function (e) {
        var target = e.delegateTarget;
        var events = eventType.split(' ');
        var action = 'action';
        events.forEach(function (event) {
          if (target.getAttribute('data-action-' + event)) {
            if (e.type === event) {
              action += '-' + event;
            }
          }
        });
        var string = target.getAttribute('data-' + action);
        if (!string) {
          return;
        }
        var method = string.replace(/\(.*?\);?/, '');
        var parameter = string.replace(/(.*?)\((.*?)\);?/, '$2');
        var pts = parameter.split(','); // 引き数
        _this3.e = e;
        if (_this3.method && _this3.method[method]) {
          var _method;

          (_method = _this3.method)[method].apply(_method, _toConsumableArray(pts));
        } else if (_this3[method]) {
          _this3[method].apply(_this3, _toConsumableArray(pts));
        }
      });
      this.events.push({
        element: ele,
        selector: dataAction,
        event: bindType
      });
    }
  }, {
    key: 'removeTemplateEvents',
    value: function removeTemplateEvents() {
      this.events.forEach(function (event) {
        (0, _util.off)(event.element, event.selector, event.event);
      });
    }
  }, {
    key: 'addTemplate',
    value: function addTemplate(id, html) {
      this.atemplate.push({ id: id, html: html, binded: false });
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

  }, {
    key: 'getData',
    value: function getData() {
      return JSON.parse(JSON.stringify(this.data));
    }
  }, {
    key: 'saveData',
    value: function saveData(key) {
      var data = JSON.stringify(this.data);
      localStorage.setItem(key, data);
    }
  }, {
    key: 'setData',
    value: function setData(opt) {
      var _this4 = this;

      Object.keys(opt).forEach(function (key) {
        if (typeof opt[key] !== 'function') {
          _this4.data[key] = opt[key];
        }
      });
    }
  }, {
    key: 'loadData',
    value: function loadData(key) {
      var data = JSON.parse(localStorage.getItem(key));
      if (data) {
        this.setData(data);
      }
    }
  }, {
    key: 'getRand',
    value: function getRand(a, b) {
      return ~~(Math.random() * (b - a + 1)) + a;
    }
  }, {
    key: 'getRandText',
    value: function getRandText(limit) {
      var ret = '';
      var strings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var length = strings.length;
      for (var i = 0; i < limit; i += 1) {
        ret += strings.charAt(Math.floor(this.getRand(0, length)));
      }
      return ret;
    }
  }, {
    key: 'getDataFromObj',
    value: function getDataFromObj(s, o) {
      s = s.replace(/\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, ''); // strip leading dot
      var a = s.split('.');
      while (a.length) {
        var n = a.shift();
        if (n in o) {
          o = o[n];
        } else {
          return null;
        }
      }
      return o;
    }
  }, {
    key: 'getDataByString',
    value: function getDataByString(s) {
      var o = this.data;
      return this.getDataFromObj(s, o);
    }
  }, {
    key: 'updateDataByString',
    value: function updateDataByString(path, newValue) {
      var object = this.data;
      var stack = path.split('.');
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      object[stack.shift()] = newValue;
    }
  }, {
    key: 'removeDataByString',
    value: function removeDataByString(path) {
      var object = this.data;
      var stack = path.split('.');
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      var shift = stack.shift();
      if (shift.match(/^\d+$/)) {
        object.splice(Number(shift), 1);
      } else {
        delete object[shift];
      }
    }
  }, {
    key: 'resolveBlock',
    value: function resolveBlock(html, item, i) {
      var that = this;
      var touchs = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
      var touchnots = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
      var exists = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist -->/g);
      var empties = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty -->/g);
      /* タッチブロック解決*/
      if (touchs) {
        for (var k = 0, n = touchs.length; k < n; k += 1) {
          var start = touchs[k];
          start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, '($1):touch#($2)');
          var end = start.replace(/BEGIN/, 'END');
          var reg = new RegExp(start + '(([\\n\\r\\t]|.)*?)' + end, 'g');
          html = html.replace(reg, function (m, key2, val, next) {
            var itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if ('' + itemkey === val) {
              return next;
            }
            return '';
          });
        }
      }
      /* タッチノットブロック解決*/
      if (touchnots) {
        for (var _k = 0, _n = touchnots.length; _k < _n; _k += 1) {
          var _start = touchnots[_k];
          _start = _start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, '($1):touchnot#($2)');
          var _end = _start.replace(/BEGIN/, 'END');
          var _reg = new RegExp(_start + '(([\\n\\r\\t]|.)*?)' + _end, 'g');
          html = html.replace(_reg, function (m, key2, val, next) {
            var itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if ('' + itemkey !== val) {
              return next;
            }
            return '';
          });
        }
      }
      /* existブロックを解決*/
      if (exists) {
        for (var _k2 = 0, _n2 = exists.length; _k2 < _n2; _k2 += 1) {
          var _start2 = exists[_k2];
          _start2 = _start2.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist/, '($1):exist');
          var _end2 = _start2.replace(/BEGIN/, 'END');
          var _reg2 = new RegExp(_start2 + '(([\\n\\r\\t]|.)*?)' + _end2, 'g');
          html = html.replace(_reg2, function (m, key2, next) {
            var itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (itemkey || itemkey === 0) {
              return next;
            }
            return '';
          });
        }
      }
      /* emptyブロックを解決*/
      if (empties) {
        for (var _k3 = 0, _n3 = empties.length; _k3 < _n3; _k3 += 1) {
          var _start3 = empties[_k3];
          _start3 = _start3.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty/, '($1):empty');
          var _end3 = _start3.replace(/BEGIN/, 'END');
          var empty = new RegExp(_start3 + '(([\\n\\r\\t]|.)*?)' + _end3, 'g');
          html = html.replace(empty, function (m, key2, next) {
            var itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
            if (!itemkey && itemkey !== 0) {
              return next;
            }
            return '';
          });
        }
      }
      /* 変数解決*/
      html = html.replace(/{([\w\-\.ぁ-んァ-ヶ亜-熙]+)}(\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\])*/g, function (n, key3, key4, converter) {
        var data = void 0;
        if ('' + key3 === 'i') {
          data = i;
        } else if (item[key3] || item[key3] === 0) {
          if (typeof item[key3] === 'function') {
            data = item[key3].apply(that);
          } else {
            data = item[key3];
          }
        } else {
          if (converter && that.convert && that.convert[converter]) {
            return that.convert[converter].call(that, '');
          }
          return '';
        }
        if (converter && that.convert && that.convert[converter]) {
          return that.convert[converter].call(that, data);
        }
        return data;
      });
      return html;
    }
    /* 絶対パス形式の変数を解決*/

  }, {
    key: 'resolveAbsBlock',
    value: function resolveAbsBlock(html) {
      var that = this;
      html = html.replace(/{(.*?)}/g, function (n, key3) {
        var data = that.getDataByString(key3);
        if (typeof data !== 'undefined') {
          if (typeof data === 'function') {
            return data.apply(that);
          }
          return data;
        }
        return n;
      });
      return html;
    }
  }, {
    key: 'resolveInclude',
    value: function resolveInclude(html) {
      var include = /<!-- #include id="(.*?)" -->/g;
      html = html.replace(include, function (m, key) {
        return (0, _util.selector)('#' + key).innerHTML;
      });
      return html;
    }
  }, {
    key: 'resolveWith',
    value: function resolveWith(html) {
      var width = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->/g;
      html = html.replace(width, function (m, key) {
        m = m.replace(/data\-bind=['"](.*?)['"]/g, 'data-bind=\'' + key + '.$1\'');
        return m;
      });
      return html;
    }
  }, {
    key: 'resolveLoop',
    value: function resolveLoop(html) {
      var loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
      var that = this;
      /* ループ文解決*/
      html = html.replace(loop, function (m, key, val) {
        var keyItem = that.getDataByString(key);
        var keys = [];
        if (typeof keyItem === 'function') {
          keys = keyItem.apply(that);
        } else {
          keys = keyItem;
        }
        var ret = '';
        if (keys instanceof Array) {
          for (var i = 0, n = keys.length; i < n; i += 1) {
            ret += that.resolveBlock(val, keys[i], i);
          }
        }
        /* エスケープ削除*/
        ret = ret.replace(/\\([^\\])/g, '$1');
        return ret;
      });
      return html;
    }
  }, {
    key: 'removeData',
    value: function removeData(arr) {
      var data = this.data;
      Object.keys(data).forEach(function (i) {
        for (var t = 0, n = arr.length; t < n; t += 1) {
          if (i === arr[t]) {
            delete data[i];
          }
        }
      });
      return this;
    }
  }, {
    key: 'hasLoop',
    value: function hasLoop(txt) {
      var loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
      if (txt.match(loop)) {
        return true;
      }
      return false;
    }
  }, {
    key: 'getHtml',
    value: function getHtml(query, row) {
      var template = this.atemplate.find(function (item) {
        return item.id === query;
      });
      var html = '';
      if (template && template.html) {
        html = template.html;
      }
      if (row) {
        html = query;
      }
      if (!html) {
        return '';
      }
      var data = this.data;
      /* インクルード解決*/
      html = this.resolveInclude(html);
      /* with解決*/
      html = this.resolveWith(html);
      /* ループ解決*/
      while (this.hasLoop(html)) {
        html = this.resolveLoop(html);
      }
      /* 変数解決*/
      html = this.resolveBlock(html, data);
      /* エスケープ削除*/
      html = html.replace(/\\([^\\])/g, '$1');
      /* 絶対パスで指定された変数を解決*/
      html = this.resolveAbsBlock(html);
      /* 空行削除*/
      return html.replace(/^([\t ])*\n/gm, '');
    }
  }, {
    key: 'update',
    value: function update() {
      var _this5 = this;

      var renderWay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'html';
      var part = arguments[1];

      var templates = this.templates;
      if (this.beforeUpdated) {
        this.beforeUpdated();
      }

      var _loop = function _loop(i, n) {
        var tem = templates[i];
        var query = '#' + tem;
        var html = _this5.getHtml(tem);
        var target = (0, _util.selector)('[data-id=\'' + tem + '\']');
        if (!target) {
          (0, _util.selector)(query).insertAdjacentHTML('afterend', '<div data-id="' + tem + '"></div>');
          if (renderWay === 'text') {
            (0, _util.selector)('[data-id=\'' + tem + '\']').innerText = html;
          } else {
            (0, _util.selector)('[data-id=\'' + tem + '\']').innerHTML = html;
          }
        } else if (renderWay === 'text') {
          target.innerText = html;
        } else if (part) {
          var doc = document.createElement('div');
          doc.innerHTML = html;
          var partHtml = doc.querySelector(part).outerHTML;
          (0, _morphdom2.default)(target.querySelector(part), partHtml);
        } else {
          (0, _morphdom2.default)(target, '<div data-id=\'' + tem + '\'>' + html + '</div>');
        }
        var template = _this5.atemplate.find(function (item) {
          return item.id === tem;
        });
        if (!template.binded) {
          template.binded = true;
          _this5.addDataBind((0, _util.selector)('[data-id=\'' + tem + '\']'));
          _this5.addActionBind((0, _util.selector)('[data-id=\'' + tem + '\']'));
        }
      };

      for (var i = 0, n = templates.length; i < n; i += 1) {
        _loop(i, n);
      }
      this.updateBindingData(part);
      if (this.onUpdated) {
        this.onUpdated(part);
      }
      return this;
    }
  }, {
    key: 'updateBindingData',
    value: function updateBindingData(part) {
      var _this6 = this;

      var templates = this.templates;
      for (var i = 0, n = templates.length; i < n; i += 1) {
        var temp = templates[i];
        var _template = (0, _util.selector)('[data-id=\'' + temp + '\']');
        if (part) {
          _template = _template.querySelector(part);
        }
        var binds = _template.querySelectorAll('[data-bind]');
        [].forEach.call(binds, function (item) {
          var data = _this6.getDataByString(item.getAttribute('data-bind'));
          if (item.getAttribute('type') === 'checkbox' || item.getAttribute('type') === 'radio') {
            if (data === item.value) {
              item.checked = true;
            }
          } else {
            // if(item !== document.activeElement) {
            item.value = data;
            // }
          }
        });
        var onewaybinds = _template.querySelectorAll('[data-bind-oneway]');
        [].forEach.call(onewaybinds, function (item) {
          var data = _this6.getDataByString(item.getAttribute('data-bind-oneway'));
          if (item.getAttribute('type') === 'checkbox' || item.getAttribute('type') === 'radio') {
            if (data === item.value) {
              item.checked = true;
            }
          } else {
            // if(item !== document.activeElement) {
            item.value = data;
            // }
          }
        });
      }
      return this;
    }
  }, {
    key: 'applyMethod',
    value: function applyMethod(method) {
      var _method2;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_method2 = this.method)[method].apply(_method2, args);
    }
  }, {
    key: 'getComputedProp',
    value: function getComputedProp(prop) {
      return this.data[prop].apply(this);
    }
  }, {
    key: 'remove',
    value: function remove(path) {
      var object = this.data;
      var stack = path.split('.');
      while (stack.length > 1) {
        object = object[stack.shift()];
      }
      var shift = stack.shift();
      if (shift.match(/^\d+$/)) {
        object.splice(Number(shift), 1);
      } else {
        delete object[shift];
      }
      return this;
    }
  }]);

  return aTemplate;
}();

exports.default = aTemplate;
module.exports = exports['default'];