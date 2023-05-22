import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import {all as allStrategy} from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Icon, RegularShape, Stroke, Style} from "ol/style";

//Request url for geoserver layers.
const geoJSONFolder = "webgis/data/";

//Init GeoJson format.
const geoJson = new GeoJSON(
	{
		dataProjection: "EPSG:4326",
		extractGeometryName: true,
	});

export const iconPath = "webgis/icons/";

//Tile layer source.
const mapLayerParam =
	{
		source: new OSM(
			{
				url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
			})
	};

//Tile layer.
export const mapLayer = new TileLayer(mapLayerParam);

//Track layer source from geoserver.
const trackSource = new VectorSource(
	{
		format: geoJson,
		url: geoJSONFolder + "tracks.geojson",
		strategy: allStrategy
	})

//Track layer.
export const tracksColors = ["#448aff", "#1565c0", "#009688", "#8bc34a", "#ffc107", "#ff9800", "#f44336", "#ad1457"];
export const tracksLayer = new VectorLayer(
	{
		source: trackSource,
		title: "Tratte",
		style: (feature) =>
			[
				new Style(
				{
					stroke: new Stroke(
						{
							color: "black",
							width: 5.25,
						}),
				}),
				new Style(
					{
						stroke: new Stroke(
							{
								color: tracksColors[feature.get("id")],
								width: 4,
							}),
					})
			]
	});

//Sections layer source from geoserver.
const sectionsSource = new VectorSource(
	{
		format: geoJson,
		url: geoJSONFolder + "sezioni_geologiche.geojson",
		strategy: allStrategy
	})

//Sections layer.
export const sectionsLayer = new VectorLayer(
	{
		source: sectionsSource,
		title: "Sezioni geologiche",
		style: new Style(
			{
				stroke: new Stroke(
					{
						color: "rgba(10,10,10,0.75)",
						width: 5.25,
						lineDash: [4, 10],
					}),
			}),
	});

//Icon colors.
export const iconColor = "#000000";
export const backgroundColor = "#ffffff";
export const iconBackground = new RegularShape(
	{
		fill: new Fill({color: backgroundColor}),
		stroke: new Stroke(
			{
				color: iconColor,
				width: 2
			}),
		points: 16,
		radius: 13,
		rotation: 3.14 / 4,
		declutterMode: "obstacle"
	});

//Style used by layers.
export function iconStyle(feature)
{
	const icon = feature.get("icona");
	const featureColor = feature.get("colore")
	const iconColor = featureColor ? "#" + featureColor : "#000";

	const style =
		[
			new Style(
				{
					image: new RegularShape(
						{
							fill: new Fill({color: backgroundColor}),
							stroke: new Stroke(
								{
									color: iconColor,
									width: 2
								}),
							points: 16,
							radius: 13,
							rotation: 3.14 / 4,
							declutterMode: "obstacle"
						}),
				}),
			new Style(
				{
					image: new Icon(
						{
							src: iconPath + icon,
							color: iconColor,
							scale: 0.03,
						})
				})
		];

	return style;
}

//Food and sleep layer source from geoserver.
const foodAndSleepSource = new VectorSource(
	{
		format: geoJson,
		url: geoJSONFolder + "mangiare_e_dormire.geojson",
		strategy: allStrategy
	})

//Food and sleep layer.
export const foodAndSleepLayer = new VectorLayer(
	{
		source: foodAndSleepSource,
		title: "Mangiare e dormire",
		style: iconStyle
	});

//Info and safety layer source from geoserver.
const infoAndSafetySource = new VectorSource(
	{
		format: geoJson,
		url: geoJSONFolder + "info_e_sicurezza.geojson",
		strategy: allStrategy
	})

//Info and safety layer.
export const infoAndSafetyLayer = new VectorLayer(
	{
		source: infoAndSafetySource,
		title: "Info e sicurezza",
		style: iconStyle
	});