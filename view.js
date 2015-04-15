(function(){
    window.Moon = function(){
        for(var key in Moon){
            window[key] = Moon[key];
        }
    };
    Moon.createClass = function (superClass, obj) {
        var newClass = function () {
            this.initialize.apply(this, arguments);
        };
        if (typeof superClass == "function" && typeof obj == "object") {
            newClass.prototype = Object.create(superClass.prototype);
            newClass.prototype.inherit = function () {                
                this.initialize = this.superClass.prototype.initialize;
                this.superClass = this.superClass.prototype.superClass;
                if(this.initialize)
                    this.initialize.apply(this, arguments);
            };
        } else if (typeof superClass == "object" && obj == void 0) {
            obj = superClass;
        }
        for (var key in obj) {
            newClass.prototype[key] = obj[key];
        }
        newClass.prototype.superClass = superClass;
        return newClass;
    };
    Moon.extendClass = function (targetclass,obj){
        for(var key in obj){
            targetclass.prototype[key] = obj[key];
        }
    };
    Moon.objs = [];
    Moon.getObjectById = function(id){
        var objs = this.objs;
        for(var i = 0,n = objs.length; i < n; i++){
            if(objs[i].id == id){
                return objs[i];
            }
        }
        return null;
    }
    $(document).on("input change","[data-bind]",function(){
        var data = $(this).data("bind");
        var val = $(this).val();
        var id = $(this).parents("[data-id]").data("id");
        var obj = Moon.getObjectById(id);
        obj.updateDataByString(data,val);
    });
    $(document).on("change","[data-check-bind]",function(){
        var data = $(this).data("check-bind");
        var val = $(this).val();
        var id = $(this).parents("[data-id]").data("id");
        var obj = Moon.getObjectById(id);
        if($(this).is(":checked")){
            obj.updateDataByString(data,val);
        }else{
            obj.updateDataByString(data,'');
        }
    });
    $(document).on("input click change","[data-action]",function(e){
        if(e.type == "click" && $(e.target).is("select")){
            return;
        }
        var string = $(this).data("action");
        var action = string.replace(/\(.*?\);?/,"");
        var parameter = string.replace(/(.*?)\((.*?)\);?/,"$2");
        var pts = parameter.split(",");//引き数
        var id = $(this).parents("[data-id]").data("id");
        var obj = Moon.getObjectById(id);
        if(obj.method[action]){
            obj.method[action].apply(obj,pts);
        }
    });
    Moon.ObjectController = Moon.createClass({
        initialize:function(opt){
            if(typeof opt !== "undefined"){
                for(var i in opt){
                    this[i] = opt[i];
                }
                if(opt.method){
                    var method = opt.method;
                    for(var i in method){
                        this.prototype[i] = method[i];
                    }
                }
            }
        },
        findProperties:function(name,opt){
            var properties = [];
            var items = this[name];
            for(var i = 0,n = items.length; i < n; i++){
                var flag = true;
                var item = items[i];
                var data = item.data;
                for(var t in opt){
                    if(data[t] !== opt[t]){
                        flag = false;
                    }
                }
                if(flag === true){
                    properties.push(item)
                }
            }
            return properties;
        },
        findProperty:function(name,opt){
            var items = this.findProperties(name,opt);
            return items[0];
        },
        removeProperties:function(name,opt){
            var items = this[name];
            for(var i = 0,n = items.length; i < n; i++){
                var flag = true;
                var item = items[i];
                var data = item.data;
                for(var t in opt){
                    if(data[t] !== opt[t]){
                        flag = false;
                    }
                }
                if(flag === true){
                    items.splice(i,1);
                    i--;
                    n--;
                }
            }
        },
        sortProperties:function(name,opt){
        }
    });
    Moon.View = Moon.createClass({
        initialize:function(opt){
            Moon.objs.push(this);
            for(var i in opt){
                this[i] = opt[i];
            }
            this.setId();
        },
        getData:function(){
            return JSON.parse(JSON.stringify(this.data));
        },
        saveData:function(key){
            var data = JSON.stringify(this.data);
            localStorage.setItem(key,data);
        },
        loadData:function(key){
            var data = JSON.parse(localStorage.getItem(key));
            if(data){
                console.log(data);
                this.data = data;
            }
        },
        getRand: function (a, b) {
            return ~~(Math.random() * (b - a + 1)) + a;
        },
        getRandText : function(limit){
            var ret = "";
            var strings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var length = strings.length;
            for(var i = 0; i < limit; i++){
                ret += strings.charAt(Math.floor(this.getRand(0,length)));
            }
            return ret;
        },
        setId:function(){
            var text;
            var ids = Moon.ids;
            var flag = false;
            while(1){
                text = this.getRandText(10);
                for(var i = 0,n = Moon.ids; i < n; i++){
                    if(Moon.ids[i] === text){
                        flag = true;
                    }
                }
                if(flag === false){
                    break;
                }
            }
            this.data.moon_id = text;
        },
        getDataByString:function(s){
            var o = this.data;
            s = s.replace(/\[(\w+)\]/g, '.$1');  // convert indexes to properties
            s = s.replace(/^\./, ''); // strip leading dot
            var a = s.split('.');
            while (a.length) {
                var n = a.shift();
                if (n in o) {
                    o = o[n];
                } else {
                    return;
                }
            }
            return o;
        },
        updateDataByString:function(path,newValue){
            var object = this.data;
            var stack = path.split('.');
            while(stack.length>1){
                object = object[stack.shift()];
            }
            object[stack.shift()] = newValue;
        },
        removeDataByString:function(path){
            var object = this.data;
            var stack = path.split('.');
            while(stack.length>1){
                object = object[stack.shift()];
            }
            var shift = stack.shift();
            if(shift.match(/^\d+$/)){
                object.splice(Number(shift),1);
            }else{
                delete object[shift];
            }
        },
        resolveBlock:function(html,item,i){
            var touch = /<!-- BEGIN (\w+):touch#(\w+) -->(([\n\r\t]|.)*?)<!-- END (\w+):touch#(\w+) -->/g;
            var touchnot = /<!-- BEGIN (\w+):touchnot#(\w+) -->(([\n\r\t]|.)*?)<!-- END (\w+):touchnot#(\w+) -->/g;
            var veil = /<!-- BEGIN (\w+):veil -->(([\n\r\t]|.)*?)<!-- END (\w+):veil -->/g;
            var empty = /<!-- BEGIN (\w+):empty -->(([\n\r\t]|.)*?)<!-- END (\w+):empty -->/g;
            /*タッチブロック解決*/
            var html = html.replace(touch,function(m,key2,val,next){
                if(item[key2] == val){
                    return next;
                }else{
                    return "";
                }
            });
            /*タッチノットブロック解決*/
            html = html.replace(touchnot,function(m,key2,val,next){
                if(item[key2] != val){
                    return next;
                }else{
                    return "";
                }
            });
            /*ベイルブロック解決*/
            html = html.replace(veil,function(m,key2,next){
                if(item[key2]){
                    return next;
                }else{
                    return "";
                }
            });
            /*エンプティプロック解決*/
            html = html.replace(empty,function(m,key2,next){
                if(!item[key2]){
                    return next;
                }else{
                    return "";
                }
            });
            /*変数解決*/
            html = html.replace(/{(\w+)}/g,function(n,key3){
                if(key3 == "i"){
                    return i;
                }else{
                    if(item[key3]){
                        return item[key3];
                    }else{
                        return n;
                    }
                }
            });
            return html;
        },
        resolveInclude:function(html){
            var include = /<!-- #include id="(.*?)" -->/g;
            html = html.replace(include,function(m,key){
                return $("#"+key).html();
            });
            return html;
        },
        resolveWith:function(html){
            var width = /<!-- BEGIN (\w+):with -->(([\n\r\t]|.)*?)<!-- END (\w+):with -->/g;
            html = html.replace(width,function(m,key,val){
                m = m.replace(/data\-bind=['"](.*?)['"]/g,"data-bind='"+key+".$1'");
                return m;
            });
            return html;
        },
        resolveLoop:function(html){
            var loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
            var that = this;
            /*ループ文解決*/
            html = html.replace(loop,function(m,key,val){
                var keys = that.getDataByString(key);
                var ret = "";
                if(keys instanceof Array){
                    for(var i = 0,n = keys.length; i < n; i++){
                        ret += that.resolveBlock(val,keys[i],i);
                    }
                }
                /*エスケープ削除*/
                ret = ret.replace(/\\([^\\])/g,"$1");
                return ret;
            });
            return html;
        },
        removeData: function(arr){
            var data = this.data;
            for(var i in data){
                for(var t = 0,n = arr.length; t < n; t++){
                    if(i === arr[t]){
                        delete data[i];
                    }
                }
            }
        },
        hasLoop:function(txt){
            var loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
            if(txt.match(loop)){
                return true;
            }else{
                return false;
            }
        },
        getHtml:function(){
            var $template = $("#"+this.id);
            var html = $template.html();
            var data = this.data;
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
            /*空行削除*/
           return html.replace(/^([\t ])*\n/gm,"");
        },
        update:function(txt){
            var html = this.getHtml();
            if(txt == "text"){
                $("[data-id='"+this.id+"']").text(html);
            }else{
                $("[data-id='"+this.id+"']").html(html);
            }
            this.updateBindingData();
        },
        updateBindingData:function(){
            var that = this;
            var $template = $("[data-id="+this.id+"]");
            $template.find("[data-bind]").each(function(){
                var data = that.getDataByString($(this).data("bind"));
                $(this).val(data);
            });
        },
        remove:function(path){
            var object = this.data;
            var stack = path.split('.');
            while(stack.length>1){
                object = object[stack.shift()];
            }
            var shift = stack.shift();
            if(shift.match(/^\d+$/)){
                object.splice(Number(shift),1);
            }else{
                delete object[shift];
            }
        }
    });
})();