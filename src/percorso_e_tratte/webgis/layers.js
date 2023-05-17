import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import {all as allStrategy} from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Icon, RegularShape, Stroke, Style} from "ol/style";

const geoserverUrl = "http://192.168.1.239:8080" //Switch with real url.
const geoserverRequestUrl =	geoserverUrl + "/geoserver/cammino-urbinogubbio/wfs?service=WFS" +
	"&version=1.3.0" +
	"&request=GetFeature" +
	"&outputFormat=application/json" +
	"&srsname=EPSG:4326" +
	"&typename=cammino-urbinogubbio:{LAYER_NAME}" +
	"&bbox={BBOX},EPSG:4326";

const iconPath = "webgis/icons/";

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
		format: new GeoJSON({dataProjection: 'EPSG:4326'}),
		url: function (extent,)
		{
			return geoserverRequestUrl
				.replace("{LAYER_NAME}", "tracks")
				.replace("{BBOX}", extent.join(","));
		},
		strategy: allStrategy
	})

//Track layer.
export const tracksLayer = new VectorLayer(
	{
		source: trackSource,
		title: "Percorso",
		style: new Style(
			{
				stroke: new Stroke(
					{
						color: "#0A0AFFA0",
						width: 5.25,
					}),
			}),
	});

//Sections layer source from geoserver.
const sectionsSource = new VectorSource(
	{
		format: new GeoJSON({
			dataProjection: "EPSG:4326",
			extractGeometryName: true,
		}),
		url: function (extent)
		{
			return geoserverRequestUrl
				.replace("{LAYER_NAME}", "sections")
				.replace("{BBOX}", extent.join(","));
		},
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

//Food and sleep layer source from geoserver.
const foodAndSleepSource = new VectorSource(
	{
		format: new GeoJSON({
			dataProjection: "EPSG:4326",
			extractGeometryName: true,
		}),
		url: function (extent)
		{
			return geoserverRequestUrl
				.replace("{LAYER_NAME}", "food_sleep")
				.replace("{BBOX}", extent.join(","));
		},
		strategy: allStrategy
	})

//Food and sleep layer.
export const foodAndSleepLayer = new VectorLayer(
	{
		source: foodAndSleepSource,
		title: "Mangiare e dormire",
		style: function (feature, index)
		{
			const icon = feature.get("icona");

			const style =
				[
					new Style(
					{
						image: new RegularShape(
							{
								fill: new Fill({color: "rgba(0, 0 , 0, 1)"}),
								stroke: new Stroke(
									{
										color: "#ffffff"
									}),
								points: 16,
								radius: 10,
								rotation: 3.14 / 4,
								declutterMode: "obstacle"
							}),
					}),
					new Style(
					{
						image: new Icon(
							{
								src: iconPath + icon,
								color: "#ffffff",
								scale: 0.03

							})
					})
				];

			return style;
		}
	});