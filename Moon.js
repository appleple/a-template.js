/*
    Moon.js(MVC)
    updateの際に何に関する変更かを引き数にいれればwhile文もうまく制御できそう
*/
(function(){
    String.prototype.replaceAll = function (org, dest){  
        return this.split(org).join(dest);  
    }  
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
    Moon.find = function(id){
        var objs = this.objs;
        for(var i = 0,n = objs.length; i < n; i++){
            if(objs[i].getId() == id){
                return objs[i];
            }
        }
    };
    /*value binding*/
    $(document).on("input","[value-binding]",function(){
        var id = $(this).data("id");
        var splits = id.split(".");
        var parentId = splits[0];
        var obj = Moon.find(parentId);
        var path = obj.getPathFromId(id);
        obj.updateDataByString(path,$(this).val());
        obj.update("value-binding");
    });
    /*action binding*/
    $(document).on("click","[action-binding]",function(){
        var id = $(this).data("action-id");
        var parentId = id.split(".")[0];
        id = id.replace(parentId+".","");
        var match = id.match(/\((.+)\)/);
        if(match)
            var data = match[1];
        else
            data = null;
        var obj = Moon.find(parentId);
        var func = id.split("(")[0];
        if(data){/*引き数があれば*/
            obj.getDataByString(func).call(obj,data);
        }else{/*引き数がなければ*/
            obj.getDataByString(func).call(obj);
        }
    });
    Moon.ObjectController = Moon.createClass({
        initialize:function(id,obj){
            /*このコントローラーを適応するセレクタを指定*/
            this.$ = $("[data-id="+id+"]");
            /*テンプレートに使用する変数をdataオブジェクトに保存*/
            this.data = {};
            this.whileHtml = [];
            for(var key in obj){
                this.data[key] = obj[key];
            };
            this.$.each(function(){
                var html = $(this).html();
                html = html.replaceAll("{{/unless}}","</span>");
                html = html.replaceAll("{{/if}}","</span>");
                html = html.replaceAll('{{#if','<span data-if="'+id+'.');
                html = html.replaceAll('{{#unless','<span data-unless="'+id+'.');
                html = html.replaceAll('{{','<span data-id="'+id+'.');
                html = html.replaceAll('}}','"></span>');
                $(this).html(html);
            });
            this.$.find("[value-binding]").each(function(){
                var childId = $(this).attr("value-binding");
                if(childId.substring(0,1) == "@"){
                    childId = childId.replace("@","");
                    $(this).attr("data-id",id+'[].'+childId);
                }else{
                    $(this).attr("data-id",id+'.'+childId);
                }
            });
            this.$.find("[action-binding]").each(function(){
                var childID = $(this).attr("action-binding");
                $(this).attr("data-action-id",id+"."+childID);
            });
            var i = 0;
            var that = this;
            this.$.find("[data-while]").each(function(){
                $(this).attr("data-index",i);
                var key = $(this).data("while");
                $(this).attr("data-id",id+"."+key);
                that.whileHtml.push({id:i,html:$(this).html()});
                i++;
            });
            this.update();
            Moon.objs.push(this);
        },
        getHtmlFromIndex:function(i){
            i = Number(i);
            return this.whileHtml[i].html;
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
        remove:function(data){
            this.removeDataByString(data);
            this.update();
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
        getId:function(){
            return this.$.data("id");
        },
        getPathFromId:function(path){
            var id = this.$.data("id");
            return path.replace(id+".","");
        },
        getValue:function(value){
            /*関数なら計算結果をvalueに格納*/
            var data = value;
            if(typeof value =="function"){
                data = value.apply(this);
            }
            return data;
        },
        update:function(kind){
            var parentID = this.getId();
            var data = this.data;
            var that = this;
            this.$.find("[data-id]").each(function(){
                if(!$(this).data("while") && !$(this).data("action-id")){
                    var id = $(this).data("id");
                    id = id.replace(parentID+".","");
                    var data = that.getDataByString(id);
                    var value = that.getValue(data);
                    $(this).html(value);
                }
            });
            this.$.find("[data-if]").each(function(){
                var id = $(this).data("if");
                id = id.replace(parentID+".");
                var data = that.getDataByString(id);
                var value = that.getValue(data);
                if(value){
                    $(this).show();
                }else{
                    $(this).hide();
                }
            });
            this.$.find("[data-unless]").each(function(){
                var id = $(this).data("unless");
                id = id.remove(parentID+".","");
                var data = that.getDataByString(id);
                var value = that.getValue(data);
                if(value){
                    $(this).hide();
                }else{
                    $(this).show();
                }
            });
            if(kind != "value-binding"){
                this.$.find("[data-while]").each(function(){
                    var id = $(this).data("while");
                    id = id.replace(parentID+".","");
                    var contents = data[id];
                    var length = contents.length;
                    var index = $(this).data("index");
                    var html = that.getHtmlFromIndex(index);
                    var render = "";
                    for(var i = 0; i < length; i++){
                        var temp = html.replaceAll("@",i);
                        //temp = temp.replaceAll("data-action-id","data-id='"+parentID+"."+id+"."+i+"' data-action-id");
                        render += temp;
                    }
                    $(this).html(render);
                    for(var i = 0; i < length; i++){
                        var content = contents[i];
                        for(var key in content){
                            var $item = $(this).find("[data-id='"+parentID+"."+id+"."+i+"."+key+"']");
                            $item.html(that.getValue(content[key]));
                        }
                    }
                });
            }
            this.$.find("[option-binding]").each(function(){
                var id = $(this).attr("option-binding");
                var ids = id.split("@");
                var content = data[ids[0]];
                var key = ids[1];
                $(this).empty();
                for(var i = 0,n = content.length; i < n; i++){
                    $(this).append("<option>"+content[i][key]+"</option>");
                }
            });
            this.$.find("[src-binding]").each(function(){
                var id = $(this).attr("src-binding");
                id = id.replace(parentID+".","");
                var data = that.getDataByString(id);
                var value = that.getValue(data);
                $(this).attr("src",value);
            });
            /*属性のBinding*/
            if(kind != "value-binding"){
                this.$.find("[value-binding]").each(function(){
                    var id = $(this).data("id");
                    id = id.replace(parentID+".","");
                    var data = that.getDataByString(id);
                    var value = that.getValue(data);
                    $(this).val(value);
                });
            }
        },
        set:function(key,value){
            this.updateDataByString(key,value);
            this.update();
        },
        add:function(key,value){/*ここを考えないと*/
            var array = this.data[key];
            array.push(value);
            this.update();
        },
        get:function(key){
            return this.data[key];
        },
        getJson:function(){
            return this.data;
        }
    });
})();