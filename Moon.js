/*
    Moon.js(MVC)
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
        var id = $(this).attr("value-binding");
        var parent = $(this).data("parent");
        var obj = Moon.find(parent);
        obj.data[id] = $(this).val();
        console.log(obj);
        obj.update();
    });
    /*action binding*/
    $(document).on("click","[action-binding]",function(){
        var id = $(this).attr("action-binding");
        var parent = $(this).data("parent");
        var obj = Moon.find(parent);
        obj.data.actions[id].apply(obj);
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
                /*変数をdomに変換*/
                for(var key in obj){
                    html = html.replaceAll("{{"+key+"}}","<span data-parent='"+id+"' data-id='"+key+"'></span>");
                    html = html.replaceAll("{{@"+key+"}}","<span data-parent='"+id+"' data-id='_"+key+"'></span>");
                    /*ifブロックをdomに変換*/
                    html = html.replaceAll("{{#if "+key+"}}","<span data-if='"+key+"'>");
                    html = html.replaceAll("{{#unless "+key+"}}","<span data-unless='"+key+"'>");
                }
                $(this).html(html);
            });
            this.$.find("[value-binding],[action-binding]").each(function(){
                $(this).attr("data-parent",id);
            });
            var i = 0;
            var that = this;
            this.$.find("[data-while]").each(function(){
                $(this).attr("data-index",i);
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
        getId:function(){
            return this.$.data("id");
        },
        getValue:function(value){
            /*関数なら計算結果をvalueに格納*/
            var data = value;
            if(typeof value =="function"){
                data = value.apply(this);
            }
            return data;
        },
        update:function(input){
            var id = this.getId();
            var data = this.data;
            var that = this;
            this.$.find("[data-id]").each(function(){
                var id = $(this).data("id");
                var value = that.getValue(data[id]);
                $(this).html(value);
            });
            this.$.find("[data-if]").each(function(){
                var id = $(this).data("if");
                var value = that.getValue(data[id]);
                if(value){
                    $(this).show();
                }else{
                    $(this).hide();
                }
            });
            this.$.find("[data-unless]").each(function(){
                var id = $(this).data("unless");
                var value = that.getValue(data[id]);
                if(value){
                    $(this).hide();
                }else{
                    $(this).show();
                }
            });
            this.$.find("[data-while]").each(function(){
                var id = $(this).data("while");
                var contents = data[id];
                var length = contents.length;
                var index = $(this).data("index");
                var html = that.getHtmlFromIndex(index);
                $(this).html(html);
                for(var i = 0; i < length; i++){
                    var content = contents[i];
                    for(var key in content){
                        $(this).find("[data-id='_"+key+"']").eq(i).html(that.getValue(content[key]));
                    }
                }
            });
            this.$.find("[option-binding]").each(function(){
                var id = $(this).attr("option-binding");
                var ids = id.split("@");
                var content = data[ids[0]];
                var key = ids[1];
                $(this).empty();
                for(var i = 0,n = content.length; i < n; i++){
                    console.log(content[i]);
                    $(this).append("<option>"+content[i][key]+"</option>");
                }
            });
            this.$.find("[src-binding]").each(function(){
                var id = $(this).attr("src-binding");
                var value = that.getValue(data[id]);
                $(this).attr("src",value);
            });
            /*属性のBinding*/
            if(!input){
                this.$.find("[value-binding]").each(function(){
                    var id = $(this).attr("value-binding");
                    var value = that.getValue(data[id]);
                    $(this).val(value);
                });
            }
        },
        set:function(key,value,input){
            this.data[key] = value;
            this.update(input);
        },
        get:function(key){
            return this.data[key];
        },
        getJson:function(){
            return this.data;
        }
    });
})();