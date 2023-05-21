import {Control} from "ol/control";

export class WebGISLegend extends Control
{
	constructor(opt_options)
	{
		const options = opt_options || {};

		//Define html elements of the legend.
		const legendDiv = document.createElement("div");

		super({
			element: legendDiv,
			target: options.target,
		});

		legendDiv.id = "map-legend";
		legendDiv.className = "map-legend";
		this.legendDiv = legendDiv;

		this.legendHeader = document.createElement("h3");
		this.legendHeader.className = "map-legend-header";
		this.legendHeader.innerText = options.title;

		this.legendContainer = document.createElement("ul");
		this.legendContainer.id = "map-legend-container";
		this.legendContainer.className = "map-legend-container";

		this.legendDiv.appendChild(this.legendHeader);
		this.legendDiv.appendChild(this.legendContainer)

		this.entries = options.entries;

		const self = this;
		this.entries.forEach(entry =>
		{
			self.addEntry(entry)

		});
	}

	addEntry(legendEntry)
	{
		const listEntryElement = document.createElement("li");
		listEntryElement.className = "map-legend-main-entry";

		legendEntry.createElements().forEach(element =>
			listEntryElement.appendChild(element))

		this.legendContainer.appendChild(listEntryElement);
	}
}

export class LegendEntry
{
	constructor(layer)
	{
		this.layer = layer;
	}

	createElements()
	{
		const self = this;

		//Add the checkbox.
		this.input = document.createElement("input");
		this.input.type = "checkbox";
		this.input.checked = this.layer.getVisible();
		this.input.onclick = ev =>
			self.layer.setVisible(ev.target.checked);

		//Add the label.
		this.label = document.createElement("label");
		this.label.innerText = this.layer.get("title");
		this.label.className = "map-legend-label";

		return [this.input, this.label];
	}
}

export class LegendEntryIcons extends LegendEntry
{
	constructor(layer, categories, defaultStyle, filter)
	{
		super(layer);
		//this.categories = categories;
		this.defaultStyle = defaultStyle;
		this.filter = filter;

		this.collectFeatures(categories);
	}

	collectFeatures(categories)
	{
		this.categories = [];

		const self = this;
		categories.forEach((category, index) =>
		{
			self.categories[index] = {};
			self.categories[index].name = category.name;
			self.categories[index].img = category.img;
			self.categories[index].title = category.title;
			self.categories[index].features = [];

			self.layer.getSource().getFeatures().forEach(feature =>
			{
				if (self.filter(category, feature))
					self.categories[index].features.push(feature);
			});
		});
	}

	createElements()
	{
		const baseElements = super.createElements();
		const listElement = document.createElement("ul");

		const self = this;
		this.categories.forEach(category =>
		{
			const listEntryElement = document.createElement("li");
			listEntryElement.className = "map-legend-sub-entry";

			//Add the checkbox.
			const input = document.createElement("input");
			input.type = "checkbox";
			input.checked = this.layer.getVisible();
			input.onclick = ev =>
				category.features.forEach(feature =>
					feature.setStyle(ev.target.checked ? self.defaultStyle : []));

			//Add the icon.
			//<img className=\"icon-legend\" src=\"webgis/icons/" + entry.img + "\" width=\"24\" height=\"24\"> " + entry.name + "<br>
			const img = document.createElement("img");
			img.className = "icon-legend";
			img.width = 24;
			img.height = 24;
			img.src = "webgis/icons/" + category.img;

			//Add the label.
			const label = document.createElement("label");
			label.innerText = category.title;
			label.className = "map-legend-label";

			listEntryElement.appendChild(input);
			listEntryElement.appendChild(img);
			listEntryElement.appendChild(label);

			listElement.appendChild(listEntryElement);
		});

		baseElements.push(listElement);
		return baseElements;
	}
}

