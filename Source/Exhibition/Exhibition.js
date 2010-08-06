/*
---
description: The image lines up beautifully and is displayed.

license: MIT-style

authors:
- Noritaka Horio

requires:
  core/1.2.4:
  - Core/Core
  - Core/Browser
  - Native/Array
  - Native/Function
  - Native/Number
  - Native/String
  - Native/Hash
  - Native/Event
  - Class/Class
  - Class/Class.Extras
  - Element/Element
  - Element/Element.Event
  - Element/Element.Style
  - Element/Element.Dimensions
  - Utilities/Selecter
  - Utilities/DomReady
  - Fx/Fx
  - Fx/Fx.CSS
  - Fx/Fx.Tween
  - Fx/Fx.Morph
  - Fx/Fx.Transitions
more/1.2.4.2:
  - Assets

provides: [Exhibition,Exhibition.Horizontal,Exhibition.Vertical]
...
*/

var Exhibition = new Class({
	
	Implements: [Events, Options],

	options: {
		"defaultIndex": 0,
		"duration": 300,
		"transition": "expo:out",
		"blank": 50,
		"columns": 5
/*
		onPreload: $empty
		onNext: $empty
		onPrev: $empty
		onSelect: $empty
		onActive: $empty
*/
	},

	animate: true,
	
	initialize: function (container,sources,options) {
		this.setOptions(options);
		this.container = container;
		this.elements = sources;
		this.index = this.options.defaultIndex;
		this.properties = [];
		this.counter = 0;
		this.fx = {
			"duration": this.options.duration,
			"transition": this.options.transition,
			"onComplete": this.onComplete.bind(this)
		};
		this.createMatrix();
		this.setSize();
		this.setEvents();
		this.setDefalutPositions();
		this.preload();
	},

	//This method does override with horizontal and vertical.
	//TODO: It optimizes it.
	setSize: function() {},

	setDefalutPositions: function() {
		var positions = this.calculation();
		positions.each(function(p,k){
			var e = this.elements[k];
			e.setStyle("left", p.x);
			e.setStyle("top", p.y);
		}, this);
		this.elements.removeClass("active");
		this.elements[this.index].addClass("active");
	},

	calculation: function() {
		this.calculationPositions();
		this.adjustmentHeight();
		this.adjustmentWidth();
		this.calculationCenter();
		return this.positions;
	},

	createMatrix: function(){
		this.matrix = [];
		var cols = [];
		this.elements.each(function(e,k) {
			if (k > 1 && (k % this.options.columns) == 0) {
				this.matrix.push(cols);
				cols = [];
			}
			cols.push(e);
		}, this);
		(cols.length > 0) ? this.matrix.push(cols) : false;
		return this.matrix;
	},

	calculationPositions: function() {
		var size = this.container.getSize();
		var left = size.x/2, top = size.y/2;
		this.positions = new Array();
		for (var i = 0; l = this.elements.length, i < l; i++) {
			this.positions.push({x: left, y: top});
		}
	},

	adjustmentHeight: function() {
		var height = 0, maxHeight = 0, index = 0;
		for (var row = 0; rl = this.matrix.length, row < rl; row++) {
			var cols = this.matrix[row];
			for (var col = 0; cl = cols.length, col < cl; col++) {
				var p = this.positions[index];
				this.positions[index].y = p.y + height;
				index++;
			}
			height = height + this.getMaxHeight(cols) + this.options.blank;
			this.calculationHeight(cols);
		}
	},

	adjustmentWidth: function() {
		var width = 0, maxWidth = 0;
		for (var col = 0; col < this.options.columns; col++) {
			var rows = [];
			for (var row = 0; rl = this.matrix.length, row < rl; row++) {
				if (this.matrix[row][col]) {
					rows.push(this.matrix[row][col]);
					var index = row * this.options.columns + col;
					var p = this.positions[index];
					this.positions[index].x = p.x + width;
				}
			}
			width = width + this.getMaxWidth(rows) + this.options.blank;
			this.calculationWidth(rows);
		}
	},

	calculationHeight: function(targets) {
		var height = 0;
		targets.each(function(e,k) { height = Math.max(e.getSize().y, height); })
		targets.each(function(e,k) {
			var index = this.elements.indexOf(e);
			var position = this.positions[index];
			var size = e.getSize();
			var margin = (height - size.y) / 2;
			this.positions[index].y = position.y + margin;
		}, this);
		return height;
	},

	calculationWidth: function(targets) {
		var width = 0;
		targets.each(function(e,k) { width = Math.max(e.getSize().x, width); })
		targets.each(function(e,k) {
			var index = this.elements.indexOf(e);
			var position = this.positions[index];
			var size = e.getSize();
			var margin = (width - size.x) / 2;
			this.positions[index].x = position.x + margin;
		}, this);
		return width;
	},

	calculationCenter: function() {
		var size = this.container.getSize();
		var x = size.x/2, y = size.y/2;
		var e = this.elements[this.index];
		var p = this.positions[this.index];
		var ml = p.x - x + (e.getSize().x/2);
		var mt = p.y - y + (e.getSize().y/2);
		this.elements.each(function(e,k) {
			p = this.positions[k];
			this.positions[k].x = p.x - ml;
			this.positions[k].y = p.y - mt;
		}, this);
	},

	getMaxWidth: function(targets) {
		var width = 0;
		targets.each(function(e,k) { width = Math.max(e.getSize().x, width); });
		return width;
	},

	getMaxHeight: function(targets) {
		var height = 0;
		targets.each(function(e,k) {height = Math.max(e.getSize().y, height); });
		return height;
	},

	render:  function() {
		var positions = this.calculation();
		if (this.animate) {
			positions.each(function(end,k) {
				var e = this.elements[k];
				var start = e.getPosition();
				var fx = e.get("morph", this.fx);
				fx.start({"left": [start.x, end.x], "top": [start.y, end.y]});
			}, this);
		}
	},

	stopAnimate: function() {
		this.animate = false;
	},

	startAnimate: function() {
		this.animate = true;
		this.render();
	},
	
	setEvents: function() {
		this.elements.each(function(e,k) {
			var a = $(e).getElement("a");
			var h = function(event) {
				event.stop();
				var index = this.elements.indexOf(a.parentNode);
				this.activate(index);
			}.bind(this);
			a.addEvent("click", h);
		}, this);
		this.addEvent("onImagePreload", this.onImagePreload.bind(this));
	},

	onImagePreload: function() {
		this.elements.each(function(e,k) {
			var img = e.getElement("img");
			var p = img.getProperties("width", "height", "title", "alt", "src");
			this.properties.push(p);
		}.bind(this));
		this.fireEvent("preload", [this.elements,this.properties]);
		this.activate(this.index);
	},

	onComplete: function() {
		this.counter++;
		if (this.counter >= this.elements.length) {
			var acitve = this.elements[this.index];
			this.fireEvent("active", [this.index, acitve.getElement("a")]);
			this.counter = 0;
		}
	},

	preload: function(){
		var preloadImages = [];
		this.elements.each(function(e,k) {
			var img = e.getElement("img");
			var src = img.getProperty("src");
			preloadImages.push(src);
		});
		var images = new Asset.images(preloadImages, {"onComplete": this.fireEvent.bind(this, "onImagePreload")});
	},

	next: function(){
		var nextIndex = this.index + 1;
		if (nextIndex < this.elements.length) {
			this.index++;
			this.fireEvent("next", [this.index, this.elements[this.index]]);
			this.activate(nextIndex);
		}
	},

	prev: function() {
		var prevIndex = this.index - 1;
		if (prevIndex >= 0) {
			this.index--;
			this.fireEvent("prev", [this.index, this.elements[this.index]]);
			this.activate(prevIndex);
		}
	},

	activate: function(index) {
		this.index = index;
		var active = this.elements[this.index];
		var elements = this.elements;
		elements.removeClass("active");
		active.addClass("active");
		this.render();
		this.fireEvent("select", [index,active.getElement("a")]);
	}

});