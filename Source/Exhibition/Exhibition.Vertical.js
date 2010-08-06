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

Exhibition.Vertical = new Class({

	Extends: Exhibition,

	options: {
		"defaultIndex": 0,
		"duration": 300,
		"transition": "expo:out",
		"blank": 50
/*
		onPreload: $empty
		onNext: $empty
		onPrev: $empty
		onSelect: $empty
		onActive: $empty
*/
	},

	initialize: function (container,sources,options) {
		this.parent(container,sources,options);
		delete this.createMatrix;
		delete this.matrix;
	},

	setSize: function() {
		this.container.setStyle("width", this.getMaxWidth(this.elements));
	},

	setDefalutPositions: function() {
		var positions = this.calculation();
		positions.each(function(p,k){
			var e = this.elements[k];
			var styles = {
				"margin-top": 0, "margin-left": 0,
				"top": p.y, "left": p.x
			};
			e.setStyles(styles);
		}, this);
		this.elements.removeClass("active");
		this.elements[this.index].addClass("active");
	},

	calculation: function() {
		this.calculationPositions();
		this.calculationWidth(this.elements);
		this.calculationCenter();
		return this.positions;
	},

	calculationPositions: function() {
		var size = this.container.getSize();
		var t = size.y/2, x = size.x/2;
		this.positions = new Array();
		this.elements.each(function(e,k) {
			var size = e.getSize();
			this.positions.push({x: x, y: t});
			t = t + size.y + this.options.blank;
		}, this);
	},

	calculationCenter: function() {
		var size = this.container.getSize();
		var y = size.y/2, x = size.x/2;
		var e = this.elements[this.index];
		var my = this.positions[this.index].y - y + (e.getSize().y/2);
		var mx = this.positions[this.index].x - x + (e.getSize().x/2);
		this.elements.each(function(e,k) {
			this.positions[k].y = this.positions[k].y - my;
			this.positions[k].x = this.positions[k].x - mx;
		}, this);
	},

	render: function() {
		var positions = this.calculation();
		if (this.animate) {
			positions.each(function(p,k) {
				var e = this.elements[k];
				var y = e.getPosition().y;
				var fx = e.get("tween", this.fx);
				fx.start("top", [y, p.y]);
			}, this);
		}
	}

});