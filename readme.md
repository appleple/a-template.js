# a-template.js

Simple Template Engine
used for [gulp-generator](https://github.com/steelydylan/gulp-generator)


## example

```html
<script id="search" type="text/template">
   <input type="text" data-bind="search" data-action-input="update">
   <ul>
       <!-- BEGIN result:loop -->
       <li>{name}-{id}</li>
       <!-- END result:loop -->
   </ul>
</script>
<script>
var list = new aTemplate({
templates:["search"],
data:{
   search:"",
   list:[
       {name:"tomomi",id:0},
       {name:"daigo",id:1112},
       {name:"taro",id:11113},
       {name:"koike",id:1114},
       {name:"aboki",id:1115},
       {name:"tetsuro",id:1116},
       {name:"takahashi",id:1117},
       {name:"suzuki",id:1118},
       {name:"okazaki",id:1119},
       {name:"aoi",id:1120},
   ],
   result:function(){
       var search = this.data.search;
       var list = this.data.list;
       return list.filter(function(str){
	   var id = str.id+"";
	   return str.name.indexOf(search) >= 0 || id.indexOf(search) >= 0;
       });
   }
},
}).update();
</script>
```
