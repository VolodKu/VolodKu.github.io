
// Cesium.BingMapsApi.defaultKey       = 'AsarFiDvISunWhi137V7l5Bu80baB73npU98oTyjqKOb7NbrkiuBPZfDxgXTrGtQ';

var longitude   = -80.215099;
var latitude    = 25.795948;
var altitude    = 400;
var heading     = 0;
var pitch       = -45;
var roll        = 0.0;

$(document).keyup(function(event) {

});


var viewer  = new Cesium.Viewer('cesiumContainer', {
            animation : false,
            homeButton : false,
            creditContainer : null,
            navigationHelpButton : false,
            navigationInstructionsInitiallyVisible: false,
            timeline : false,
            clock : null,
            selectionIndicator:false,
            fullscreenElement: 'previewContent',
            baseLayerPicker: false,
            imageryProvider : new Cesium.MapboxImageryProvider({
                mapId: 'mapbox.satellite'
            }),
            // terrainProvider : new Cesium.CesiumTerrainProvider({
            //     url : 'https://assets.agi.com/stk-terrain/v1/tilesets/PAMAP/tiles',
            //     requestWaterMask : true,
            //     requestVertexNormals : true
            // }),
            infoBox : false,
            sceneModePicker : false,
        });

function getCameraFocusPosition(camera) {
    return getRayFocusPosition(camera.positionWC, camera.directionWC);
}

function getRayFocusPosition(origin, direction)
{
    var rayScratch = new Cesium.Ray();
    rayScratch.origin = origin;
    rayScratch.direction = direction;
    var result = new Cesium.Cartesian3();
    result = viewer.scene.globe.pick(rayScratch, viewer.scene, result);

    return result;
}

function fly(position)
{
    viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude),
        orientation : {
            heading : Cesium.Math.toRadians(heading),
            pitch : Cesium.Math.toRadians(pitch),
            roll : roll
        },
        complete    : function()
        {
            loadModel();
        }
    });
}

function main()
{
    fly({
        longitude : longitude,
        latitude  : latitude,
        altitude : altitude,
        heading : heading,
        pitch   : pitch,
        roll    : roll
    });
}

function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function loadModel()
{
    var position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    var hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    var entity = viewer.entities.add({
        name : 'test',
        position : position,
        orientation : orientation,
        model : {
            uri : './obj/BLD3.gltf',
            minimumPixelSize : 1,
            maximumScale : 1,
            color : getColor('White', 0.5)
        }
    });
    console.log(entity);
    viewer.trackedEntity = entity;
}

