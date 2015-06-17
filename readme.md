#Moon.js

Simple Template Engine
used for [gulp-generator](https://github.com/steelydylan/gulp-generator)


##example

```javascript
var Moon = require("./Moon.js");
var hoge = new Moon.View({
	id:"hoge",
	data:{
		name:"steelydylan",
		url:"http://horicdesign.com"
		subject:[
			{name:"Japanese",score:20},
			{name:"English",score:90},
			{name:"Mathmatics",score:100},
		]
	}
});
hoge.update();
```

```html
<script id="hoge">
<h1>{name}</h1>
<!-- BEGIN url:veil -->
<p>{url}</p>
<!-- END url:veil -->
<p>score</p>
<ul>
<!-- BEGIN subject:loop -->
<li>{name}:{score}</li>
<!-- END subject:loop -->
</ul>
</script>
<div data-id="hoge"></div>
```