import {Control} from "ol/control";

/**
 * Control component used to display a legend inside the map.
 */
export class WebGISLegend extends Control
{
	constructor(opt_options)
	{
		const options = opt_options || {};

		//Container of the legend.
		const legendDiv = document.createElement("div");

		super({
			element: legendDiv,
			target: options.target,
		});

		const self = this;

		legendDiv.id = "map-legend";
		legendDiv.className = "map-legend";

		if (checkMobile())
			legendDiv.classList.add("mobile");

		this.legendDiv = legendDiv;

		//Title of the legend.
		this.legendHeader = document.createElement("h3");
		this.legendHeader.className = "map-legend-header";
		this.legendHeader.innerText = options.title;

		//Main list of the legend.
		this.legendContainer = document.createElement("ul");
		this.legendContainer.id = "map-legend-container";
		this.legendContainer.className = "map-legend-container";

		if (checkMobile())
		{
			this.legendContainer.classList.add("mobile");
			this.legendHeader.classList.add("mobile");
			this.legendHeader.classList.add("mobile");

			this.legendHeader.onclick = ev =>
			{
				const containerStyle = self.legendContainer.style;
				containerStyle.display = containerStyle.display === "block" ? "none" : "block";
			}
		}

		this.legendDiv.appendChild(this.legendHeader);
		this.legendDiv.appendChild(this.legendContainer)

		this.entries = options.entries;

		//Insert all the entries in the options.
		this.entries.forEach(entry =>
			self.addEntry(entry));
	}

	/**
	 * Insert the given entry into the legend.
	 * @param legendEntry
	 */
	addEntry(legendEntry)
	{
		//Create list item.
		const listEntryElement = document.createElement("li");
		listEntryElement.className = "map-legend-main-entry";

		//Add the elements of the entry.
		legendEntry.createElements().forEach(element =>
			listEntryElement.appendChild(element))

		this.legendContainer.appendChild(listEntryElement);
	}
}

/**
 * Represent an entry inside the legend.
 */
export class LegendEntry
{
	constructor(layer)
	{
		this.layer = layer;
	}

	/**
	 * Returns the array of element that make up the entry.
	 * @returns {(HTMLInputElement|HTMLLabelElement)[]}
	 */
	createElements()
	{
		const self = this;

		//Add the checkbox.
		this.input = document.createElement("input");
		this.input.type = "checkbox";
		this.input.checked = this.layer.getVisible();
		this.input.className = "map-legend-checkbox";
		this.input.onclick = ev =>
			self.layer.setVisible(ev.target.checked);

		//Add the label.
		this.label = document.createElement("label");
		this.label.innerText = this.layer.get("title");
		this.label.className = "map-legend-label";

		if (checkMobile())
			this.label.classList.add("mobile");

		return [this.input, this.label];
	}
}

/**
 * Represent an entry that owns other child entries inside the legend.
 */
export class LegendEntryCategorized extends LegendEntry
{
	constructor(layer, categories, filter)
	{
		super(layer);
		this.filter = filter;

		this.collectFeatures(categories);
	}

	/**
	 * Collect all the feature of the layer based on the entry filter.
	 * @param categories
	 */
	collectFeatures(categories)
	{
		this.categories = [];

		//Populate the list of category of the entry.
		const self = this;
		categories.forEach((category, index) =>
		{
			self.categories[index] = {};
			self.categories[index].name = category.name;
			self.categories[index].img = category.img;
			self.categories[index].color = category.color;
			self.categories[index].title = category.title;
			self.categories[index].features = [];

			//Add to the list all the features that match the filter.
			self.layer.getSource().getFeatures().forEach(feature =>
			{
				if (self.filter(category, feature))
					self.categories[index].features.push(feature);
			});
		});
	}

	createElements()
	{
		//Get the base class elements.
		const baseElements = super.createElements();

		//Label will be inserted inside a new element.
		const label = baseElements.pop();

		//Add the arrow to indicate a collapsible component.
		const arrow = document.createElement("label");
		arrow.innerHTML = "+"
		arrow.className = "map-legend-collapsible-arrow";

		//List of the sub elements.
		const listElement = document.createElement("ul");
		listElement.className = "map-legend-collapsible";

		//Create the container of the label.
		const container = document.createElement("span");
		container.className = "hoverable";

		//Open/close functionality.
		container.onclick = ev =>
		{
			const collapsibleList = listElement;

			if (collapsibleList.style.maxHeight)
			{
				collapsibleList.style.maxHeight = null;
				arrow.innerHTML = "+";
				return;
			}

			collapsibleList.style.maxHeight = collapsibleList.scrollHeight + "px";
			arrow.innerHTML = "-";
		}

		container.appendChild(label);
		container.appendChild(arrow);
		baseElements.push(container);

		//Add all sub entries to the list.
		const self = this;
		this.categories.forEach(category =>
		{
			//Main element of the sub entry.
			const listEntryElement = document.createElement("li");
			listEntryElement.className = "map-legend-sub-entry";

			//Add the checkbox.
			const input = document.createElement("input");
			input.className = "map-legend-checkbox";
			input.type = "checkbox";
			input.checked = this.layer.getVisible();
			input.onclick = ev =>
				category.features.forEach(feature =>
					feature.setStyle(ev.target.checked ? null : []));
			listEntryElement.appendChild(input);

			//Add the icon.
			const img = document.createElement("span");
			img.className = "map-legend-icon";
			img.style.backgroundColor = "red"

			if (checkMobile())
				img.classList.add("mobile");

			if (category.img || category.color)
			{
				if (category.img)
					img.style.maskImage = "url(webgis/icons/" + category.img + ")";
				img.style.backgroundColor = category.color ? category.color : "#000";
			}
			else
				img.style.width = "0px";

			listEntryElement.appendChild(img);

			//Add the label.
			const label = document.createElement("label");
			label.innerText = category.title;
			label.className = "map-legend-label";
			if (checkMobile())
				label.classList.add("mobile");
			listEntryElement.appendChild(label);

			listElement.appendChild(listEntryElement);
		});

		baseElements.push(listElement);
		return baseElements;
	}
}

function checkMobile()
{
	return !!(navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i));
}