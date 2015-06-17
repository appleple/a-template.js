#Moon.js

Simple Template Engine


##example

```javascript
var Moon = require("./Moon.js");
var hoge = new Moon({
	id:"hoge",
	data:{
		name:"steelydylan",
		url:"http://horicdesign.com"
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
</script>
<div data-id="hoge"></div>
```