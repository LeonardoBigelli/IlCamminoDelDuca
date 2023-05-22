import './webgis.css';
import "ol/ol.css"
import 'ol-popup/src/ol-popup.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css"
import {Map, Overlay, View} from 'ol';
import {Select} from "ol/interaction";
import {click} from "ol/events/condition";
import {
    foodAndSleepLayer,
    iconPath, iconStyle,
    infoAndSafetyLayer,
    mapLayer,
    sectionsLayer,
    tracksLayer
} from "./layers";
import LayerGroup from "ol/layer/Group";
import {Fill, Icon, RegularShape, Stroke, Style} from "ol/style";
import {foodAndDrinkCategories, infoAndSafetyCategories, sectionsCategories, tracksCategories} from "./legend";
import {LegendEntryIcons, WebGISLegend} from "./WebGisLegend";

const viewStartingPos = [1409646.026322705, 5394869.494452778]; //Starting position of the view.

//Function that listens for loading events of the sources.
async function waitSourcesLoading()
{
    const tracksPromise = new Promise(resolve =>
        tracksLayer.getSource().on("featuresloadend", resolve))
    const sectionsPromise = new Promise(resolve =>
        sectionsLayer.getSource().on("featuresloadend", resolve))
    const foodPromise = new Promise(resolve =>
        foodAndSleepLayer.getSource().on("featuresloadend", resolve))
    const infoPromise = new Promise(resolve =>
        infoAndSafetyLayer.getSource().once("featuresloadend", resolve));

    return Promise.all([tracksPromise, sectionsPromise, foodPromise, infoPromise]);
}

//Function use to change the style of the selected section feature.
function onSelectSectionStyle(feature)
{
    const color = "rgba(227, 31, 31, 0.63)";
    const style = sectionsLayer.getStyle().clone();
    style.getStroke().setColor(color);
    return style;
}

//Function use to change the style of the selected poi feature.
function onSelectPOInStyle(feature)
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
                            fill: new Fill({color: "#fffa85"}),
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

function setFeatureVisible(feature, show)
{
    feature.setStyle(show ? iconStyle : []);
}


//Extent:
//[1397142.4969995867, 5362888.233718974, 1421189.678525492, 5425968.900521599]
//Create starting view.
const mapView = new View(
    {
        center: viewStartingPos,
        zoom: 10,
    })

//Point of interest layer group.
const pointOfInterestLayerGroup = new LayerGroup(
    {
       title: "Punti di interesse",
       layers: [foodAndSleepLayer, infoAndSafetyLayer]
    });


//Create map with the layers.
const map = new Map(
    {
        target: 'webgis',
        layers: [new LayerGroup(
            {
                title: "Livelli",
                layers: [mapLayer, tracksLayer, sectionsLayer, pointOfInterestLayerGroup]
            })],
        view: mapView,
    });

//Legend init.
const legend = new WebGISLegend(
    {
        title: "Legenda",
        entries: []
    });
map.addControl(legend)

//Set the extent of the view based on trackLayer extent.
tracksLayer.getSource().on("featuresloadend", params =>
{
    const source = params.target;
    const border = 3000;

    //Get the extent from the source and expand it.
    let expandedExtent = source.getExtent();
    expandedExtent[0] -= border;
    expandedExtent[1] -= border;
    expandedExtent[2] += border;
    expandedExtent[3] += border;

    //Set the extent of the view to the newly calculated extent.
    map.setView(new View(
        {
            center: viewStartingPos,
            zoom: 10,
            //extent: expandedExtent,
        }));
});

//Section popup init.
const sectionsImgPath = "webgis/sections/{PATH}";
let closer = document.getElementById('popup-sections-closer');

const popupSections = new Overlay(
    {
        element: document.getElementById("popup-sections"),
        autoPan: {
            animation: {
                duration: 250,
            },
        },
        positioning: "top-center"
    });
map.addOverlay(popupSections);

closer.onclick = function ()
{
    popupSections.setPosition(undefined);
    closer.blur();
    return false;
};

//Select interaction
const selectSectionsInteraction = new Select(
    {
        condition: click,
        style: onSelectSectionStyle,
        filter: (feature, layer) =>
            layer === sectionsLayer
    });
map.addInteraction(selectSectionsInteraction);

//Section selection callback.
selectSectionsInteraction.on("select", event =>
{
    //If no feature is select remove the popup.
    if (event.selected.length === 0)
    {
        popupSections.setPosition(undefined);
        return;
    }

    //Set the position of the popup.
    popupSections.setPosition(event.mapBrowserEvent.coordinate);

    //Get the feature data.
    const feature = event.selected[0];
    const pngPath = feature.get("path_img");

    let imgElement = document.getElementById("section-img");
    let titleElement = document.getElementById("section-title");

    //Set the image and title of the popup.
    titleElement.innerText = feature.get("nome");
    imgElement.setAttribute("src", sectionsImgPath.replace("{PATH}", pngPath));
});

//POI popup init.
closer = document.getElementById('popup-poi-closer');

const popupPOI = new Overlay(
    {
        element: document.getElementById("popup-poi"),
        autoPan: {
            animation: {
                duration: 250,
            },
        },
        positioning: "top-center",
        offset: [0, -10]
    });
map.addOverlay(popupPOI);

closer.onclick = function ()
{
    popupPOI.setPosition(undefined);
    closer.blur();
    return false;
};

//Select interaction
const selectPOIInteraction = new Select(
    {
        condition: click,
        style: onSelectPOInStyle,
        filter: (feature, layer) =>
            pointOfInterestLayerGroup.getLayersArray().includes(layer),
    });
map.addInteraction(selectPOIInteraction);

//Selection callback.
selectPOIInteraction.on("select", event =>
{
    //If no feature is select remove the popup.
    if (event.selected.length === 0)
    {
        popupPOI.setPosition(undefined);
        return;
    }

    //Set the position of the popup.
    popupPOI.setPosition(event.mapBrowserEvent.coordinate);

    //Get the feature data.
    const feature = event.selected[0];
    const poiName = feature.get("nome");
    const poiType = feature.get("tipo");
    const poiSite = feature.get("sito_web");
    const poiPhone = feature.get("telefono");

    //Elements of the popup.
    const nameElement = document.getElementById("poi-name");
    const typeElement = document.getElementById("poi-type");
    const siteElement = document.getElementById("poi-site");
    const siteContentElement = document.getElementById("poi-site-element");
    const phoneElement = document.getElementById("poi-phone");
    const phoneContentElement = document.getElementById("poi-phone-element");

    console.log(feature.getProperties());

    nameElement.innerText = poiName;
    typeElement.innerText = poiType;
    siteContentElement.href = poiSite;
    phoneContentElement.innerText = poiPhone;
    phoneContentElement.href = "tel:" + poiPhone;

    typeElement.hidden = !poiType;
    siteElement.hidden = !poiSite;
    phoneElement.hidden = !poiPhone;
});

//Add the layers to the legend when they are all loaded.
waitSourcesLoading().then(() =>
{
    const iconFilter = (category, feature) =>
        category.id === feature.get("tipo");

    const tracksFilter = (category, feature) =>
        category.id === feature.get("id");

    const tracksLegendEntry = new LegendEntryIcons(tracksLayer, tracksCategories, tracksFilter);
    const sectionsLegendEntry = new LegendEntryIcons(sectionsLayer, sectionsCategories, tracksFilter);
    const foodAndSleepLegendEntry = new LegendEntryIcons(foodAndSleepLayer, foodAndDrinkCategories, iconFilter);
    const infoAndSafetyLegendEntry = new LegendEntryIcons(infoAndSafetyLayer, infoAndSafetyCategories, iconFilter);

    legend.addEntry(tracksLegendEntry);
    legend.addEntry(sectionsLegendEntry);
    legend.addEntry(foodAndSleepLegendEntry);
    legend.addEntry(infoAndSafetyLegendEntry);

    console.log("Legenda caricata!");
});