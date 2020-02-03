import 'ie-array-find-polyfill';
import morphdom from 'morphdom';
import { selector, on, off } from './util';

const eventType = 'input paste copy click change keydown keyup keypress contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend focus';
const bindType = 'input change click';
const dataAction = `${eventType.replace(/([a-z]+)/g, '[data-action-$1],')}[data-action]`;

export default class aTemplate {

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
      const html = selector(`#${template}`).innerHTML;
      this.atemplate.push({ id: template, html, binded: false });
    }
  }

  addDataBind(ele) {
    on(ele, '[data-bind]', bindType, (e) => {
      const target = e.delegateTarget;
      const data = target.getAttribute('data-bind');
      const attr = target.getAttribute('href');
      let value = target.value;
      if (attr) {
        value = value.replace('#', '');
      }
      if (target.getAttribute('type') === 'checkbox') {
        const arr = [];
        const items = document.querySelectorAll(`[data-bind="${data}"]`);
        [].forEach.call(items, (item) => {
          if (item.checked) {
            arr.push(item.value);
          }
        });
      } else if (target.getAttribute('type') !== 'radio') {
        this.updateDataByString(data, value);
      }
    });
    this.events.push({
      element: ele,
      selector: '[data-bind]',
      event: bindType
    });
  }

  addActionBind(ele) {
    on(ele, dataAction, eventType, (e) => {
      const target = e.delegateTarget;
      const events = eventType.split(' ');
      let action = 'action';
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
      const method = string.replace(/\(.*?\);?/, '');
      const parameter = string.replace(/(.*?)\((.*?)\);?/, '$2');
      const pts = parameter.split(',');// 引き数
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
      if (typeof opt[key] !== 'function') {
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
    let ret = '';
    const strings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = strings.length;
    for (let i = 0; i < limit; i += 1) {
      ret += strings.charAt(Math.floor(this.getRand(0, length)));
    }
    return ret;
  }

  getDataFromObj(s, o) {
    s = s.replace(/\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\]/g, '.$1');  // convert indexes to properties
    s = s.replace(/^\./, ''); // strip leading dot
    const a = s.split('.');
    while (a.length) {
      const n = a.shift();
      if (n in o) {
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
    const stack = path.split('.');
    while (stack.length > 1) {
      object = object[stack.shift()];
    }
    object[stack.shift()] = newValue;
  }

  removeDataByString(path) {
    let object = this.data;
    const stack = path.split('.');
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
    /* タッチブロック解決*/
    if (touchs) {
      for (let k = 0, n = touchs.length; k < n; k += 1) {
        let start = touchs[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, '($1):touch#($2)');
        const end = start.replace(/BEGIN/, 'END');
        const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, 'g');
        html = html.replace(reg, (m, key2, val, next) => {
          const itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
          if (`${itemkey}` === val) {
            return next;
          }
          return '';
        });
      }
    }
    /* タッチノットブロック解決*/
    if (touchnots) {
      for (let k = 0, n = touchnots.length; k < n; k += 1) {
        let start = touchnots[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/, '($1):touchnot#($2)');
        const end = start.replace(/BEGIN/, 'END');
        const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, 'g');
        html = html.replace(reg, (m, key2, val, next) => {
          const itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
          if (`${itemkey}` !== val) {
            return next;
          }
          return '';
        });
      }
    }
    /* existブロックを解決*/
    if (exists) {
      for (let k = 0, n = exists.length; k < n; k += 1) {
        let start = exists[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist/, '($1):exist');
        const end = start.replace(/BEGIN/, 'END');
        const reg = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, 'g');
        html = html.replace(reg, (m, key2, next) => {
          const itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
          if (itemkey || itemkey === 0) {
            return next;
          }
          return '';
        });
      }
    }
    /* emptyブロックを解決*/
    if (empties) {
      for (let k = 0, n = empties.length; k < n; k += 1) {
        let start = empties[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty/, '($1):empty');
        const end = start.replace(/BEGIN/, 'END');
        const empty = new RegExp(`${start}(([\\n\\r\\t]|.)*?)${end}`, 'g');
        html = html.replace(empty, (m, key2, next) => {
          const itemkey = typeof item[key2] === 'function' ? item[key2].apply(that) : that.getDataFromObj(key2, item);
          if (!itemkey && itemkey !== 0) {
            return next;
          }
          return '';
        });
      }
    }
    /* 変数解決*/
    html = html.replace(/{([\w\-\.ぁ-んァ-ヶ亜-熙]+)}(\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\])*/g, (n, key3, key4, converter) => {
      let data;
      if (`${key3}` === 'i') {
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
  resolveAbsBlock(html) {
    const that = this;
    html = html.replace(/{(.*?)}/g, (n, key3) => {
      const data = that.getDataByString(key3);
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

  resolveInclude(html) {
    const include = /<!-- #include id="(.*?)" -->/g;
    html = html.replace(include, (m, key) => selector(`#${key}`).innerHTML);
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
    /* ループ文解決*/
    html = html.replace(loop, (m, key, val) => {
      const keyItem = that.getDataByString(key);
      let keys = [];
      if (typeof keyItem === 'function') {
        keys = keyItem.apply(that);
      } else {
        keys = keyItem;
      }
      let ret = '';
      if (keys instanceof Array) {
        for (let i = 0, n = keys.length; i < n; i += 1) {
          ret += that.resolveBlock(val, keys[i], i);
        }
      }
      /* エスケープ削除*/
      ret = ret.replace(/\\([^\\])/g, '$1');
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
    const template = this.atemplate.find(item => item.id === query);
    let html = '';
    if (template && template.html) {
      html = template.html;
    }
    if (row) {
      html = query;
    }
    if (!html) {
      return '';
    }
    const data = this.data;
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

  update(renderWay = 'html', part) {
    const templates = this.templates;
    if (this.beforeUpdated) {
      this.beforeUpdated();
    }
    for (let i = 0, n = templates.length; i < n; i += 1) {
      const tem = templates[i];
      const query = `#${tem}`;
      const html = this.getHtml(tem);
      const target = selector(`[data-id='${tem}']`);
      if (!target) {
        selector(query).insertAdjacentHTML('afterend', `<div data-id="${tem}"></div>`);
        if (renderWay === 'text') {
          selector(`[data-id='${tem}']`).innerText = html;
        } else {
          selector(`[data-id='${tem}']`).innerHTML = html;
        }
      } else if (renderWay === 'text') {
        target.innerText = html;
      } else if (part) {
        const doc = document.createElement('div');
        doc.innerHTML = html;
        const partHtml = doc.querySelector(part).outerHTML;
        morphdom(target.querySelector(part), partHtml);
      } else {
        morphdom(target, `<div data-id='${tem}'>${html}</div>`);
      }
      const template = this.atemplate.find(item => item.id === tem);
      if (!template.binded) {
        template.binded = true;
        this.addDataBind(selector(`[data-id='${tem}']`));
        this.addActionBind(selector(`[data-id='${tem}']`));
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
      if (part) {
        template = template.querySelector(part);
      }
      const binds = template.querySelectorAll('[data-bind]');
      [].forEach.call(binds, (item) => {
        const data = this.getDataByString(item.getAttribute('data-bind'));
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
      const onewaybinds = template.querySelectorAll('[data-bind-oneway]');
      [].forEach.call(onewaybinds, (item) => {
        const data = this.getDataByString(item.getAttribute('data-bind-oneway'));
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

  applyMethod(method, ...args) {
    return this.method[method](...args);
  }

  getComputedProp(prop) {
    return this.data[prop].apply(this);
  }

  remove(path) {
    let object = this.data;
    const stack = path.split('.');
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
}
