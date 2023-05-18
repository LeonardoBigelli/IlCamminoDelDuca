import './webgis.css';
import "ol/ol.css"
import 'ol-popup/src/ol-popup.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css"
import {Map, Overlay, View} from 'ol';
import {Select} from "ol/interaction";
import {click} from "ol/events/condition";
import {
    foodAndSleepLayer,
    iconBackground,
    iconColor, iconPath,
    infoAndSafetyLayer,
    mapLayer,
    sectionsLayer,
    tracksLayer
} from "./layers";
import {Popover} from "bootstrap";
import LayerSwitcher from "ol-layerswitcher";
import LayerGroup from "ol/layer/Group";
import {Icon, Stroke, Style} from "ol/style";
import {Control, defaults} from "ol/control";
import {legendData} from "./legend";

const viewStartingPos = [1409646.026322705, 5394869.494452778]; //Starting position of the view.

//Function use to change the style of the selected section feature.
function onSelectSectionStyle(feature)
{
    const color = "rgba(227, 31, 31, 0.63)";
    const style = sectionsLayer.getStyle().clone();
    style.getStroke().setColor(color);
    return style;
}

//TODO: Set correct style.
//Function use to change the style of the selected poi feature.
function onSelectPOInStyle(feature)
{
    const icon = feature.get("icona");
    const color = "#ff0000";

    const style =
        [
            new Style(
                {
                    image: iconBackground
                }),
            new Style(
                {
                    image: new Icon(
                        {
                            src: iconPath + icon,
                            color: color,
                            scale: 0.03,
                        })
                })
        ];
    return style;
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

//Legend init.
const legend = new Control(
    {
        element: document.getElementById("map-legend"),
    });

var legendHTML = "";
const legendContainer = document.getElementById("map-legend-container");
legendData.forEach((entry, index) =>
{
    legendContainer.innerHTML += "<img class=\"icon-legend\" src=\"webgis/icons/" + entry.img + "\" width=\"24\" height=\"24\"> " + entry.name + "<br>"
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

map.addControl(legend)

//TODO: Reimplement better layer switcher.
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

    //Set the image of the popup.
    let imgElement = document.getElementById("section-img");
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
    phoneElement.href = "tel:" + poiPhone;

    typeElement.hidden = !poiType;
    siteElement.hidden = !poiSite;
    phoneElement.hidden = !poiPhone;

});