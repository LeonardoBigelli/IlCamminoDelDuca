import './webgis.css';
import "ol/ol.css"
import 'ol-popup/src/ol-popup.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css"
import {Map, Overlay, View} from 'ol';
import {Select} from "ol/interaction";
import {click} from "ol/events/condition";
import {foodAndSleepLayer, mapLayer, sectionsLayer, tracksLayer} from "./layers";
import {Popover} from "bootstrap";
import LayerSwitcher from "ol-layerswitcher";
import LayerGroup from "ol/layer/Group";

const viewStartingPos = [1409646.026322705, 5394869.494452778]; //Starting position of the view.

//Function use to change the style of the selected section feature.
function onSelectSectionStyle(feature)
{
    const style = sectionsLayer.getStyle().clone();
    style.getStroke().setColor("rgba(227,31,31,0.63)");
    return style;
}

//TODO: Set correct style.
//Function use to change the style of the selected poi feature.
function onSelectPOInStyle(feature)
{
    const style = sectionsLayer.getStyle().clone();
    style.getStroke().setColor("rgba(227,31,31,0.63)");
    return style;
}

//Extent:
//[ 1397142.4969995867, 5362888.233718974, 1421189.678525492, 5425968.900521599 ]
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
       layers: [foodAndSleepLayer]
    });

//Create map with the layers.
const map = new Map(
    {
        target: 'webGIS',
        layers: [new LayerGroup(
            {
                title: "Livelli",
                layers: [mapLayer, tracksLayer, sectionsLayer, pointOfInterestLayerGroup]
            })],
        view: mapView
    });

//Add the layer switcher to the map.
const layerSwitcher = new LayerSwitcher(
    {
        reverse: false,
        groupSelectStyle: 'group'
    });
map.addControl(layerSwitcher);

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

//Debug
map.on("click", event =>
{
    console.log(map.getView().getCenter());
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

//Selection callback.
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

    //Set the image of the popup.
    let imgElement = document.getElementById("section-img");
    imgElement.setAttribute("src", sectionsImgPath.replace("{PATH}", pngPath));
});

//Section popup init.
closer = document.getElementById('popup-poi-closer');

const popupPOI = new Overlay(
    {
        element: document.getElementById("popup-poi"),
        autoPan: {
            animation: {
                duration: 250,
            },
        },
        positioning: "top-center"
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
        style: onSelectSectionStyle,
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

    console.log(feature.getProperties());
});