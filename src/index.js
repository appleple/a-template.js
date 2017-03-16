let $ = require("zepto-browserify").$;
const morphdom = require('morphdom');
const objs = [];
const eventType = "input paste copy click change keydown keyup contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend";
const dataAction = eventType.replace(/([a-z]+)/g,"[data-action-$1],") + "[data-action]";
const getObjectById = (id) => {
	for (let i = 0, n = objs.length; i < n; i++) {
		let obj = objs[i];
		let templates = obj.templates;
		for (let t = 0, m = templates.length; t < m; t++) {
			if (templates[t] == id) {
				return obj;
			}
		}
	}
	return null;
}

if (typeof jQuery !=="undefined"){
	// for IE
	$ = jQuery;
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    let list = Object(this);
    let length = list.length >>> 0;
    let thisArg = arguments[1];
    let value;

    for (let i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

if(typeof document !== "undefined"){
  //data binding
  $(document).on("input change click", "[data-bind]", function(e) {
    let data = $(this).attr("data-bind");
    let val = $(this).val();
    let attr = $(this).attr("href");
    if (attr) {
      val = attr.replace("#", "");
    }
    let id = $(this).parents("[data-id]").attr("data-id");
    if (id) {
      let obj = getObjectById(id);
      if ($(e.target).attr("type") == "radio") {
        if ($(this).is(":checked")) {
          obj.updateDataByString(data, val);
        } else {
          obj.updateDataByString(data, '');
        }
      } else if ($(e.target).attr("type") == "checkbox") {
        let arr = [];
        $("[data-bind=\"" + data + "\"]").each(function () {
          if ($(this).is(":checked")) {
            arr.push($(this).val());
          }
        });
        obj.updateDataByString(data, arr);
      } else {
        obj.updateDataByString(data, val);
      }
    }
  });
  //action
  $(document).on(eventType,dataAction,function(e){
    if(e.type == "click" && $(e.target).is("select")){
      return;
    }
    if(e.type == "input" && $(e.target).attr("type") == "button"){
      return;
    }
    let events = eventType.split(" ");
    let $self = $(this);
    let action = "action";
    events.forEach(function(event){
      if ($self.attr("data-action-"+event)) {
        if(e.type === event){
          action += "-"+event;
        }
      }
    });
    let string = $self.attr(`data-${action}`);
    if(!string){
      return;
    }
    let method = string.replace(/\(.*?\);?/,"");
    let parameter = string.replace(/(.*?)\((.*?)\);?/,"$2");
    let pts = parameter.split(",");//引き数
    let id = $self.parents("[data-id]").attr("data-id");
    if(id){
      let obj = getObjectById(id);
      obj.e = e;
      if(obj.method && obj.method[method]){
        obj.method[method].apply(obj,pts);
      }else if(obj[method]){
        obj[method].apply(obj,pts);
      }
    }
  });
}


class aTemplate {
	constructor(opt) {
		this.atemplate = [];
		objs.push(this);
		for(let i in opt){
			this[i] = opt[i];
		}
		if(!this.data){
			this.data = {};
		}
		if(!this.templates){
			this.templates = [];
		}
		const templates = this.templates;
		for(let i = 0,n = this.templates.length; i < n; i++) {
			let template = this.templates[i];
			this.atemplate.push({id:template,html:$(`#${template}`).html()});
		}
		this.setId();
	}

	addTemplate(id,html) {
		this.atemplate.push({id:id,html:html})
		this.templates.push(id);
	}

  loadHtml() {
    let templates = this.templates;
    let promises = [];
    templates.forEach((template) => {
      let d = new $.Deferred();
      promises.push(d);
      let src = $("#" + template).attr("src");
      $.ajax({
        url: src,
        type: 'GET',
        dataType: 'text'
      }).success(function(data) {
        $("#" + template).html(data);
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

  setId () {
    let text;
    let ids = aTemplate.ids;
    let flag = false;
    while (1) {
      text = this.getRandText(10);
      for (let i = 0, n = aTemplate.ids; i < n; i++) {
        if (aTemplate.ids[i] === text) {
          flag = true;
        }
      }
      if (flag === false) {
        break;
      }
    }
    this.data.aTemplate_id = text;
  }

  getDataFromObj(s,o){
    s = s.replace(/\[([a-zA-Z0-9._-]+)\]/g, '.$1');  // convert indexes to properties
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
    let touchs = html.match(/<!-- BEGIN ([a-zA-Z0-9._-]+):touch#([a-zA-Z0-9._-]+) -->/g);
    let touchnots = html.match(/<!-- BEGIN ([a-zA-Z0-9._-]+):touchnot#([a-zA-Z0-9._-]+) -->/g);
    let exists = html.match(/<!-- BEGIN ([a-zA-Z0-9._-]+):exist -->/g);
    let empties = html.match(/<!-- BEGIN ([a-zA-Z0-9._-]+):empty -->/g);
    /*タッチブロック解決*/
    if(touchs){
      for(let k = 0,n = touchs.length; k < n; k++){
        let start = touchs[k];
        start = start.replace(/([a-zA-Z0-9._-]+):touch#([a-zA-Z0-9._-]+)/,"($1):touch#($2)");
        let end = start.replace(/BEGIN/,"END");
        let reg = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(reg,function(m,key2,val,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(itemkey === val){
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
        start = start.replace(/([a-zA-Z0-9._-]+):touchnot#([a-zA-Z0-9._-]+)/,"($1):touchnot#($2)");
        let end = start.replace(/BEGIN/,"END");
        let reg = new RegExp(start+"(([\\n\\r\\t]|.)*?)"+end,"g");
        html = html.replace(reg,function(m,key2,val,next){
          let itemkey = typeof item[key2] === "function" ? item[key2].apply(that) : that.getDataFromObj(key2,item);
          if(itemkey !== val){
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
        start = start.replace(/([a-zA-Z0-9._-]+):exist/,"($1):exist");
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
        start = start.replace(/([a-zA-Z0-9._-]+):empty/,"($1):empty");
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
    html = html.replace(/{([a-zA-Z0-9._-]+)}(\[([a-zA-Z0-9._-]+)\])*/g,function(n,key3,key4,converter){
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
      return $("#"+key).html();
    });
    return html;
  }

  resolveWith(html){
    let width = /<!-- BEGIN ([a-zA-Z0-9._-]+):with -->(([\n\r\t]|.)*?)<!-- END ([a-zA-Z0-9._-]+):with -->/g;
    html = html.replace(width,function(m,key,val){
      m = m.replace(/data\-bind=['"](.*?)['"]/g,"data-bind='"+key+".$1'");
      return m;
    });
    return html;
  }

  resolveLoop(html){
    let loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
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
    let loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
    if(txt.match(loop)){
      return true;
    }else{
      return false;
    }
  }

	getHtml(selector,row){
		let template = this.atemplate.find((item) => item.id === selector);
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

	update(txt,part){
		let html = this.getHtml();
		let templates = this.templates;
		let renderWay = txt || "html";
		if(this.beforeUpdated){
			this.beforeUpdated();
		}
		for(let i = 0,n = templates.length; i < n; i++){
			let tem = templates[i];
			let selector = "#"+tem;
			let html = this.getHtml(tem);
			let $target = $("[data-id='"+tem+"']");
			if(!part || part == tem){
				if($target.length == 0){
					let $newitem = $("<div data-id='"+tem+"'></div>");
					$newitem[renderWay](html);
					$(selector).after($newitem);
				}else{
					if(renderWay === 'text'){
						$target.text(html);
					}else{
						morphdom($target.get(0),`<div data-id='${tem}'>${html}</div>`);
					}
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
    let that = this;
    let templates = that.templates;
    for(let i = 0,n = templates.length; i < n; i++){
      let temp = templates[i];
      if(!part || part == temp){
        let $template = $("[data-id='"+temp+"']");
        $template.find("[data-bind]").each(function(){
          let data = that.getDataByString($(this).attr("data-bind"));
          if($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio"){
            if(data == $(this).val()){
              $(this).prop("checked",true);
            }
          }else{
            $(this).val(data);
          }
        });
        if(part){
          break;
        }
      }
    }
    return this;
  }

  copyToClipBoard () {
    let copyArea = $("<textarea/>");
    $("body").append(copyArea);
    copyArea.text(this.getHtml());
    copyArea.select();
    document.execCommand("copy");
    copyArea.remove();
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

module.exports = aTemplate;
