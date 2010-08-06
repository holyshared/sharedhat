/*
---
description: It draws in the image in each small grid.

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
  - Fx/Fx.Transitions

provides: [ImageDrawer, ImageDrawer.Grid, ImageDrawer.Expand]

...
*/


ImageDrawer.Grid = new Class({

	Extends: ImageDrawer,

	options: {
		'canvas': null,
		'source': null,
		'gridHeight': 50,
		'gridWidth': 50,
		'interval': 70,
		'transition': 'expo:in:out',
		'duration': 600
	},

	initialize: function(options) {
		this.parent(options);
	},

	onMotion: function(props) {
		var height = (props.height > 0) ? props.height : 0.01;
		var width  = (props.width > 0) ? props.width : 0.01;
		var left = (props.left > 0) ? props.left : 0.01;
		var top = (props.top > 0) ? props.top : 0.01;

		this.context.clearRect(this.drawX, this.drawY, this.drawWidth, this.drawHeight);
		this.context.drawImage(this.source,
			left, top, width, height,
			left, top, width, height);
	},

	setupDrawer: function() {
		if (this.size) {
			this.cols = this.size.x / this.options.gridWidth;
			this.rows = this.size.y / this.options.gridHeight;
			this.total = this.cols * this.rows;
		}
	},

	getContext: function(x, y) {
		var options = this.options;
		return {
			"context": this.context,
			"source": this.source,
			"drawX": x, "drawY": y,
			"drawWidth": options.gridWidth,
			"drawHeight": options.gridHeight
		};		
	},

	draw: function(porps) {
		this.parent();

		var op = this.options;
		var duration = op.duration;

		this.drawing = true;
		this.drawers = [];		

		porps.each(function(p, k) {
			var fx = new Fx.ImageDrawer({
				"transition": op.transition,
				"duration": duration,
				"link": "cancel",
				"fps": 30,
				"onMotion":	this.onMotion.bind(p),
				"onComplete": this.onProgress.bind(this)
			});

			fx.start({
				"height": [0, op.gridHeight],
				"width": [0, op.gridWidth],
				"top": [p.drawY + op.gridHeight / 2, p.drawY],
				"left": [p.drawX + op.gridWidth / 2, p.drawX]
			});
			duration = duration + op.interval;
			this.drawers.push(fx);
		}, this);
	},

	drawLeft: function() {
		var contexts = [];
		var options = this.options;
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},

	drawRight: function() {
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			for (var y = 0; y < this.rows; y++) {
				var left = (x - 1) * options.gridWidth;
				var top = y * options.gridHeight;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},


	drawTop: function() {
		var contexts = [];
		var options = this.options;
		for (var y = 0; y < this.rows; y++) {
			for (var x = 0; x < this.cols; x++) {
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},

	drawBottom: function() {
		var contexts = [];
		var options = this.options;
		for (var y = this.rows; y >= 0; y--) {
			for (var x = 0; x < this.cols; x++) {
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	}

});
