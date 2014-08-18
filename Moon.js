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
    $(document).on("input","input[value-binding]",function(){
        var id = $(this).attr("value-binding");
        var ids = id.split("_");
        var obj = Moon.find(ids[0]);
        obj.set(ids[1],$(this).val(),true);
    });
    $(document).on("click","[action-binding]",function(){
        var id = $(this).attr("action-binding");
        var ids = id.split("_");
        var obj = Moon.find(ids[0]);
        obj.data.actions[ids[1]].apply(obj);
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
                    html = html.replaceAll("{{"+key+"}}","<span data-id='"+id+"_"+key+"'></span>");
                    html = html.replaceAll("{{@"+key+"}}","<span data-id='_"+id+"_"+key+"'></span>");
                    /*ifブロックをdomに変換*/
                    html = html.replaceAll("{{#if "+key+"}}","<span data-if='"+id+"_"+key+"'>");
                    html = html.replaceAll("{{#unless "+key+"}}","<span data-unless='"+id+"_"+key+"'>");
                }
                $(this).html(html);
            });
            this.$.find("[value-binding]").each(function(){
                var attr = $(this).attr("value-binding");
                $(this).attr("value-binding",id+"_"+attr);
            });
            this.$.find("[src-binding]").each(function(){
                var attr = $(this).attr("src-binding");
                $(this).attr("src-binding",id+"_"+attr);
            });
            this.$.find("[option-binding]").each(function(){
                var attr = $(this).attr("option-binding");
                $(this).attr("option-binding",id+"_"+attr);
            });
            this.$.find("[action-binding]").each(function(){
                var attr = $(this).attr("action-binding");
                $(this).attr("action-binding",id+"_"+attr)
            });
            this.$.find("[data-while]").each(function(){
                var attr = $(this).attr("data-while");
                $(this).attr("data-while",id+"_"+attr);
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
            for(var key in data){
                var value = this.getValue(data[key]);
                /*変数domにdataをinsert*/
                $("[data-id="+id+"_"+key+"]").html(value);
                /*ifブロックdomのdisplay*/
                var $ifdom = $("[data-if="+id+"_"+key+"]");
                if($ifdom.length > 0){
                    if(value){
                        $ifdom.css("display","block");
                    }else{
                        $ifdom.css("display","none");
                    }
                }
                /*unlessブロックdomのdisplay*/
                var $unless = $("[data-unless="+id+"_"+key+"]");
                if($unless.length > 0){
                    if(value){
                        $unless.css("display","none");
                    }else{
                        $unless.css("display","block");
                    }
                }
                /*whileブロックの中の配列表示*/
                var $while = $("[data-while="+id+"_"+key+"]");
                if($while.length > 0){
                    var that = this;
                    $while.each(function(){
                        var contents = data[key];
                        var length = contents.length;
                        var index = $(this).data("index");
                        var html = that.getHtmlFromIndex(index);
                        for(var i = 0; i < length; i++){
                            if(i < length - 1){
                                html += html;
                            }
                        }
                        $(this).html(html);
                        for(var i = 0; i < length; i++){
                            var content = contents[i];
                            for(var key2 in content){
                                $("[data-index="+index+"] [data-id=_"+id+"_"+key2+"]").eq(i).html(that.getValue(content[key2]));
                            }
                        }
                    });
                }
                /*optionバインディングの配列格納*/
                var $option = $("[option-binding="+id+"_"+key+"]");
                var val = $option.attr("value-binding");
                var contents = data[key];
                for(var i = 0,n = contents.length; i < n; i++){
                    $option.append("<option>"+contents[i][val]+"</option>");
                }
                /*属性のBinding*/
                if(!input){
                    $("[value-binding="+id+"_"+key+"]").val(value);
                }
                $("[src-binding="+id+"_"+key+"]").attr("src",value);
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