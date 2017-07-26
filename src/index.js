import { selector, on } from './util';
const morphdom = require('morphdom');
const eventType = 'input paste copy click change keydown keyup contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend';
const bindType = 'input change click';
const dataAction = eventType.replace(/([a-z]+)/g,"[data-action-$1],") + "[data-action]";
const find = require('array.prototype.find');

export default class aTemplate {

	constructor(opt) {
		this.atemplate = [];
		for(let i in opt){
			this[i] = opt[i];
		}
		if(!this.data){
			this.data = {};
		}
		if(!this.templates) {
			this.templates = [];
		}
		const templates = this.templates;
    const length = templates.length;
		for(let i = 0,n = length; i < n; i++) {
			let template = this.templates[i];
      let html = selector(`#${template}`).innerHTML;
			this.atemplate.push({id:template,html:html,binded:false});
		}
	}

  addDataBind(ele) {
    on(ele,'[data-bind]', bindType,(e) => {
      const target = e.delegateTarget;
      const data = target.getAttribute('data-bind');
      const attr = target.getAttribute('href');
      let value = target.value;
      if (attr) {
        value = value.replace('#','');
      }
      if (target.getAttribute('type') === 'checkbox') {
        const arr = [];
        const items = document.querySelectorAll(`[data-bind="${data}"]`);
        [].forEach.call(items, (item) => {
          if(item.checked) {
            arr.push(item.value);
          }
        });
      } else if (target.getAttribute('type') !== 'radio') {
        this.updateDataByString(data, value);
      }
    });
  }

  addActionBind(ele) {
    on(ele, dataAction, eventType,(e) => {
      const target = e.delegateTarget;
      let events = eventType.split(" ");
      let action = "action";
      events.forEach((event) => {
        if (target.getAttribute("data-action-"+event)) {
          if(e.type === event){
            action += "-"+event;
          }
        }
      });
      const string = target.getAttribute(`data-${action}`);
      if(!string){
        return;
      }
      let method = string.replace(/\(.*?\);?/,"");
      let parameter = string.replace(/(.*?)\((.*?)\);?/,"$2");
      let pts = parameter.split(",");//引き数
      this.e = e;
      if(this.method && this.method[method]){
        this.method[method].apply(this,pts);
      }else if(this[method]){
        this[method].apply(this,pts);
      }
    });    
  }

	addTemplate(id,html) {
		this.atemplate.push({id:id,html:html,binded:false})
		this.templates.push(id);
	}

  loadHtml() {
    let templates = this.templates;
    let promises = [];
    templates.forEach((template) => {
      let d = new $.Deferred();
      promises.push(d);
      let src = selector(`#${template}`).getAttribute('src');
      $.ajax({
        url: src,
        type: 'GET',
        dataType: 'text'
      }).success(function(data) {
        selector(`#${template}`).innerHTML = data;
        d.resolve();
      });
    });
    return $.when.apply($, promises);
  }

  getData () {
    return JSON.parse(JSON.stringify(this.data));
  }

  saveData (key) {
    let data = JSON.stringify(this.data);
    localStorage.setItem(key, data);
  }

  setData (val) {
    for (let i in val) {
      if (typeof val[i] !== "function") {
        this.data[i] = val[i];
      }
    }
  }

  loadData (key) {
    let data = JSON.parse(localStorage.getItem(key));
    if (data) {
      for (let i in data) {
        if (typeof data[i] !== "function") {
          this.data[i] = data[i];
        }
      }
    }
  }

  getRand (a, b) {
    return ~~(Math.random() * (b - a + 1)) + a;
  }

  getRandText (limit) {
    let ret = "";
    let strings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let length = strings.length;
    for (let i = 0; i < limit; i++) {
      ret += strings.charAt(Math.floor(this.getRand(0, length)));
    }
    return ret;
  }

  getDataFromObj(s,o){
    s = s.replace(/\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\]/g, '.$1');  // convert indexes to properties
    s = s.replace(/^\./, ''); // strip leading dot
    let a = s.split('.');
    while (a.length) {
      let n = a.shift();
      if (n in o) {
        o = o[n];
      } else {
        return;
      }
    }
    return o;
  }

  getDataByString(s){
    let o = this.data;
    return this.getDataFromObj(s,o);
  }

  updateDataByString (path, newValue) {
    let object = this.data;
    let stack = path.split('.');
    while (stack.length > 1) {
      object = object[stack.shift()];
    }
    object[stack.shift()] = newValue;
  }

  removeDataByString (path) {
    let object = this.data;
    let stack = path.split('.');
    while (stack.length > 1) {
      object = object[stack.shift()];
    }
    let shift = stack.shift();
    if (shift.match(/^\d+$/)) {
      object.splice(Number(shift), 1);
    } else {
      delete object[shift];
    }
  }

  resolveBlock(html,item,i){
    let that = this;
    let touchs = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
    let touchnots = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g);
    let exists = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist -->/g);
    let empties = html.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty -->/g);
    /*タッチブロック解決*/
    if(touchs){
      for(let k = 0,n = touchs.length; k < n; k++){
        let start = touchs[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/,"($1):touch#($2)");
        let end = start.replace(/BEGIN/,"END");
        let reg = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(reg,function(m,key2,val,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(itemkey == val){
            return next;
          }else{
            return "";
          }
        })
      }
    }
    /*タッチノットブロック解決*/
    if(touchnots){
      for(let k = 0,n = touchnots.length; k < n; k++){
        let start = touchnots[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/,"($1):touchnot#($2)");
        let end = start.replace(/BEGIN/,"END");
        let reg = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(reg,function(m,key2,val,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(itemkey != val){
            return next;
          }else{
            return "";
          }
        });
      }
    }
    /*existブロックを解決*/
    if(exists){
      for(let k = 0,n = exists.length; k < n; k++){
        let start = exists[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist/,"($1):exist");
        let end = start.replace(/BEGIN/,"END");
        let reg = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(reg,function(m,key2,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(itemkey || itemkey === 0){
            return next;
          }else{
            return "";
          }
        });
      }
    }
    /*emptyブロックを解決*/
    if(empties){
      for(let k = 0,n = empties.length; k < n; k++){
        let start = empties[k];
        start = start.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty/,"($1):empty");
        let end = start.replace(/BEGIN/,"END");
        let empty = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(empty,function(m,key2,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(!itemkey　&& itemkey !== 0){
            return next;
          }else{
            return "";
          }
        });
      }
    }
    /*変数解決*/
    html = html.replace(/{([\w\-\.ぁ-んァ-ヶ亜-熙]+)}(\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\])*/g,function(n,key3,key4,converter){
      let data;
      if(key3 == "i"){
        data = i;
      }else{
        if(item[key3] || item[key3] === 0){
          if (typeof item[key3] === "function"){
            data = item[key3].apply(that);
          }else{
            data = item[key3];
          }
        }else{
          if(converter && that.convert && that.convert[converter]){
            return that.convert[converter].call(that,"");
          }else{
            return "";
          }
        }
      }
      if(converter && that.convert && that.convert[converter]){
        return that.convert[converter].call(that,data);
      }else{
        return data;
      }
    });
    return html;
  }
  /*絶対パス形式の変数を解決*/
  resolveAbsBlock(html){
    let that = this;
    html = html.replace(/{(.*?)}/g,function(n,key3){
      let data = that.getDataByString(key3);
      if(typeof data !== "undefined"){
        if (typeof data === "function"){
          return data.apply(that);
        }else{
          return data;
        }
      }else{
        return n;
      }
    });
    return html;
  }

  resolveInclude(html){
    let include = /<!-- #include id="(.*?)" -->/g;
    html = html.replace(include,function(m,key){
      return selector(`#${key}`).innerHTML;
    });
    return html;
  }

  resolveWith(html){
    let width = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->/g;
    html = html.replace(width,function(m,key,val){
      m = m.replace(/data\-bind=['"](.*?)['"]/g,"data-bind='"+key+".$1'");
      return m;
    });
    return html;
  }

  resolveLoop(html){
    let loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
    let that = this;
    /*ループ文解決*/
    html = html.replace(loop,function(m,key,val){
      let keyItem = that.getDataByString(key);
      let keys = [];
      if(typeof keyItem === "function"){
        keys = keyItem.apply(that);
      }else{
        keys = keyItem;
      }
      let ret = "";
      if(keys instanceof Array){
        for(let i = 0,n = keys.length; i < n; i++){
          ret += that.resolveBlock(val,keys[i],i);
        }
      }
      /*エスケープ削除*/
      ret = ret.replace(/\\([^\\])/g,"$1");
      return ret;
    });
    return html;
  }

  removeData(arr){
    let data = this.data;
    for(let i in data){
      for(let t = 0,n = arr.length; t < n; t++){
        if(i === arr[t]){
          delete data[i];
        }
      }
    }
    return this;
  }

  hasLoop(txt){
    let loop = /<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;
    if(txt.match(loop)){
      return true;
    }else{
      return false;
    }
  }

	getHtml(selector,row){
		let template = find(this.atemplate, (item) => item.id === selector);
    let html = "";
		if(template && template.html){
			html = template.html;
		}
		if(row){
			html = selector;
		}
		if(!html){
			return "";
		}
		let data = this.data;
		/*インクルード解決*/
		html = this.resolveInclude(html);
		/*with解決*/
		html = this.resolveWith(html);
		/*ループ解決*/
		while(this.hasLoop(html)){
			html = this.resolveLoop(html);
		}
		/*変数解決*/
		html = this.resolveBlock(html,data);
		/*エスケープ削除*/
		html = html.replace(/\\([^\\])/g,"$1");
		/*絶対パスで指定された変数を解決*/
		html = this.resolveAbsBlock(html);
		/*空行削除*/
		return html.replace(/^([\t ])*\n/gm,"");
	}

	update(renderWay = 'html', part){
		let html = this.getHtml();
		let templates = this.templates;
		if(this.beforeUpdated){
			this.beforeUpdated();
		}
		for(let i = 0, n = templates.length; i < n; i++){
			let tem = templates[i];
			let query = "#"+tem;
			let html = this.getHtml(tem);
			const target = selector(`[data-id='${tem}']`);
			if(!part || part == tem){
				if(!target){
          selector(query).insertAdjacentHTML('afterend',`<div data-id="${tem}"></div>`);
          if(renderWay === 'text') {
            selector(`[data-id='${tem}']`).innerText = html;
          } else {
            selector(`[data-id='${tem}']`).innerHTML = html;
          }
				}else{
					if(renderWay === 'text'){
						target.innerText = html;
					}else{
						morphdom(target,`<div data-id='${tem}'>${html}</div>`);
					}
				}
        const template = find(this.atemplate, (item) => {
          return item.id === tem;
        });
        if (!template.binded) {
          template.binded = true;
          this.addDataBind(selector(`[data-id='${tem}']`));
          this.addActionBind(selector(`[data-id='${tem}']`));
        }
				if(part){
					break;
				}
			}
		}
		this.updateBindingData(part);
		if(this.onUpdated){
			this.onUpdated(part);
		}
		return this;
	}

  updateBindingData(part){
    let templates = this.templates;
    for(let i = 0,n = templates.length; i < n; i++){
      let temp = templates[i];
      if(!part || part == temp){
        const template = selector(`[data-id='${temp}']`);
        const binds = template.querySelectorAll('[data-bind]');
        [].forEach.call(binds,(item) => {
          let data = this.getDataByString(item.getAttribute("data-bind"));
          if(item.getAttribute("type") === "checkbox" || item.getAttribute("type") === "radio"){
            if(data == item.value){
              item.checked = true;
            }
          }else{
            // if(item !== document.activeElement) {
              item.value = data;
            // }
          }
        });
        if(part){
          break;
        }
      }
    }
    return this;
  }

  applyMethod (method) {
    let args = [].splice.call(arguments, 0);
    args.shift();
    return this.method[method].apply(this, args);
  }

  getComputedProp (prop) {
    return this.data[prop].apply(this);
  }

  remove (path) {
    let object = this.data;
    let stack = path.split('.');
    while (stack.length > 1) {
      object = object[stack.shift()];
    }
    let shift = stack.shift();
    if (shift.match(/^\d+$/)) {
      object.splice(Number(shift), 1);
    } else {
      delete object[shift];
    }
    return this;
  }
}