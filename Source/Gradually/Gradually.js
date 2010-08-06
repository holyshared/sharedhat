/*
---
description: Gallery API using the canvas element is offered.

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
  more/1.2.4.2:
  - Assets
  imagedrawer/1.0:
  - ImageDrawer/ImageDrawer
  - ImageDrawer/ImageDrawer.Grid
  - ImageDrawer/ImageDrawer.Expand

provides: [Gradually, Gradually.Slideshow, Gradually.Gallery]

...
*/

var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'drawer': null,
		'images': null,
		'zIndex': 9000,
		'defaultIndex': 0
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	/**
	 * Constructor
	 */
	initialize: function (container, options) {
		this.setOptions(options);
		this.container = container;
		this.current = this.options.defaultIndex;
		this.drawer = null;
		this.panels = [];
		this.setDefaultValues();
	},

	/**
	 * Gradually Internal Events
	 */
	onPreload: function() {
		var options = this.options;
		var images = options.images;
		images.each(function(image, key) {
			this.addPanel(image);
		}.bind(this));

		this.drawDefaultImage();
		this.fireEvent("preload");
	},

	onDrawStart: function(drawer) {
		this.fireEvent("drawStart", [this.getCurrent(), drawer]);
	},

	onDrawComplete: function(drawer) {
		this.orderToBack();
		this.fireEvent("drawComplete", [this.getCurrent(), drawer]);
	},

	setDefaultValues: function() {
		var drawer = this.options.drawer;
		drawer.addEvent("onDrawStart", this.onDrawStart.bind(this));
		drawer.addEvent("onDrawComplete", this.onDrawComplete.bind(this));
		this.setDrawer(drawer);
	},

	drawDefaultImage: function() {
		var current = this.getCurrent();
		var canvas = current.canvas;
		var image = current.image;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image,
		0, 0, image.width, image.height,
		0, 0, image.width, image.height);
	},

	/**
	 * Setter/Getter Methods
	 */
	setDrawer: function(drawer) { this.drawer = drawer; },
	getDrawer: function() { return this.drawer; },

	set: function(index) {
		if (this.current != index) {
			this.current = index;
			this.fireEvent("select", [this.current, this.getCurrent()]);
			if (this.drawer.isDrawing()) {
				this.drawer.cancel();
				this.drawer.fireEvent("drawComplete", [this.drawer]);
			}

			var current = this.getCurrent();
			this.orderToNext();
			this.drawer.setCanvas(current.canvas);
			this.drawer.setImage(current.image);
			this.draw();
		}
	},

	draw: function() {
		(this.current % 2)
		? this.drawer.drawRight()
		: this.drawer.drawLeft();
	},

	orderToNext: function() {
		var current = this.getCurrent();
		var canvas = current.canvas;
		var image = current.image;
		canvas.setStyle("zIndex", this.options.zIndex + 2);
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, image.width, image.height);
	},

	orderToBack: function() {
		var current = this.getCurrent();
		var canvas = current.canvas;
		canvas.setStyle("zIndex", this.options.zIndex + 1);
		this.panels.each(function(panel) {
			var pcanvas = panel.canvas;
			if (canvas != pcanvas) {
				pcanvas.setStyle("zIndex", this.options.zIndex);
			}
		}, this);
	},

	setDrawer: function(drawer) {
		this.drawer = drawer;
	},

	getDrawer: function() {
		return this.drawer;
	},

	getPanel: function(index) {
		return this.panels[index];
	},

	getCurrent: function() {
		return this.getPanel(this.current);
	},

	/**
	 * Private Methods
	 */
	addPanel: function(image) {
		var props = image.getProperties("width", "height", "title", "alt", "src");
		var canvas = new Element("canvas", {
			"width": props.width,
			"height": props.height,
			"class": "source",
			"styles": { "zIndex": this.options.zIndex }
		});
		this.panels.push($merge({'canvas': canvas, 'image': image}, props));

		image.setStyle("display", "none");
		canvas.inject(image.parentNode);
		return canvas;
	},

	start: function() {
		if (!this.drawer) throw new TypeError("Drawer is not set. Please set ImageDrawer.");

		var images = this.options.images;
		var preloadImages = [];
		images.each(function(e,k) {
			preloadImages.push(e.getProperty("src"));
			e.setStyle("display", "none");
		});
		new Asset.images(preloadImages, {"onComplete": this.onPreload.bind(this)});
	}

});