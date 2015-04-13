$(function(){
    Moon();
    var main = new Moon.View({
        id:"main",
        data:{item:[]},
    });
    var group = new Moon.View({
        id:"group",
        data:{
            kind:"group",
            type:"",
            title:"",
            path:"path",
            option:[{value:"",label:""}],
        },
        method:{
            refresh:function(){
                this.data.title = "";
                this.data.name = "";
                this.data.path = "";
                this.data.option = [{value:"",label:""}];
                this.update();
            },
            clear:function(){
                this.removeDataExcept(["kind","type","title","path","option"]);
            },
            addOption:function(){
                this.data.option.push({value:"",label:""});
                this.update();
            },
        }
    });
    var generator = new Moon.View({
        id:"generator",
        data:{
            kind:"generator",
            type:"",
            title:"",
            path:"path",
            option:[{value:"",label:""}],
            group:[]
        },
        method:{
            submit:function(){
                main.data.item.push(this.getData());
                main.update("text");
                prettyPrint();
            },
            refresh:function(){
                this.data.title = "";
                this.data.name = "";
                this.data.path = "";
                this.data.option = [{value:"",label:""}];
                this.data.group = [];
                this.update();
                if(this.data.type == "group"){
                    group.update();
                }
            },
            addOption:group.method.addOption,
            addItem:function(){
                this.data.group.push(group.getData());
                main.data.item.pop();
                main.data.item.push(this.getData());
                console.log(main.data.item);
                main.update("text");
            },
            clearItems:function(){
                this.data.group = [];
                main.data.item.pop();
                main.data.item.push(this.getData());
                main.update("text");
            }
        }
    });
    generator.update();
    main.update("text");
    prettyPrint(); 
});