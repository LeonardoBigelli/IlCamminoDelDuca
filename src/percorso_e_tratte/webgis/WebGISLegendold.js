import {Control, defaults} from "ol/control";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {GeometryFunction, RenderFunction} from "ol/style/Style";
import {Collection} from "ol";

export const GroupType =
	{
		Layer: "layer",
		FeatureFilter: "feature-filter"
	}

class WebGISLegendOld extends Control
{
	constructor(opt_options)
	{
		const options = opt_options || {};

		//Define html elements of the legend.
		const legendDiv = document.createElement("div");
		legendDiv.id = "map-legend";
		legendDiv.className = "map-legend";

		const legendHeader = document.createElement("h3");
		legendHeader.className = "map-legend-header";
		legendHeader.innerText = options.name;

		const legendContainer = document.createElement("div");
		legendContainer.id = "map-legend-container";
		legendContainer.className = "map-legend-container";

		legendDiv.appendChild(legendHeader);
		legendHeader.appendChild(legendContainer)

		super({
				element: legendDiv,
				target: options.target,
			});


		this.groups = options.groups;

		this.groups.forEach(group =>
		{

		});
	}

	updateLayers()
	{
		this.groups.forEach(group =>
		{
			const layer = group.layer;
			const features = layer.getSource().getFeatures();

			features.forEach(feature =>
			{
				let visible = false;
				group.featureCategories.forEach(category =>
				{
					const input = group.inputs[category.name];

					if (input.checked === true && group.filter(feature, category))
						visible = true; //TODO: Early exit.
				});

				feature.setStyle(visible ? group.defaultStyle : []);
			});
		});
	}
}

class LegendGroup
{
	constructor(name, layer)
	{
		this.name = name;
		this.layer = layer;
		this.visible = layer.getVisible();
	}

	createElements() {}
}

class LegendGroupFeature extends LegendGroup
{
	#inputs;
	#featureCategories;
	#defaultStyle;
	#filter;
	#callback;

	constructor(name, layer, featureCategories, defaultStyle, filter)
	{
		super(name, layer);
		this.featureCategories = featureCategories;
		this.defaultStyle = defaultStyle;
		this.filter = filter;
		this.callback = callback;
	}

	createElements(legend)
	{
		const self = this;
		this.featureCategories.forEach(category =>
		{
			let input = document.createElement("input");
			input.type = "checkbox";
			input.id = "CAT" + category.name;
			input.innerHTML = "<img class=\"icon-legend\" src=\"webgis/icons/" + category.img + "\" width=\"24\" height=\"24\"> " + category.name + "<br>";
			input.checked = category.visible;
			input.onclick = () =>
				legend.updateLayers();
			self.inputs[category.name] = input;
		});
	}
}

class LegendGroupLayer extends LegendGroup
{
	constructor(name, layer)
	{
		super(name, layer);
	}
}