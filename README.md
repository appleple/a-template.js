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

## Security notes

### XSS

a-template.js はテンプレートの描画に `innerHTML` / `insertAdjacentHTML` を使用しています。
`{key}` に展開される値や `data` に渡す値は HTML としてそのまま挿入されるため、
ユーザー入力など信頼できない文字列を **エスケープせずに** `data` へ渡すと XSS
(クロスサイトスクリプティング) の原因になります。

信頼できない値をテンプレートに渡す場合は、あらかじめ HTML エスケープするか、
[DOMPurify](https://github.com/cure53/DOMPurify) 等のサニタイズライブラリを通してから
`data` にセットしてください。

### data-action で呼び出せるメソッド

`data-action` から呼び出せるのは、`method` オプションに登録した関数、サブクラスで定義した独自メソッド、`update` のみです。
`updateDataByString` / `destroy` など aTemplate 組み込みの内部メソッドや、`constructor` / `__proto__` などの名前は呼べません。

### プロトタイプ汚染対策

`data-bind` などのパスに `__proto__` / `constructor` / `prototype` が含まれる場合は無視されます。
