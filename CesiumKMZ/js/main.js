
Cesium.BingMapsApi.defaultKey       = 'AsarFiDvISunWhi137V7l5Bu80baB73npU98oTyjqKOb7NbrkiuBPZfDxgXTrGtQ';

var longitude   = 135;
var latitude    = 35.012;
var altitude    = 400;
var heading     = 0;
var pitch       = -45;
var roll        = 0.0;

var polygon     = null;
var isClicked   = false;

var editMode    = 0;

var loader      = null;

var viewer  = new Cesium.Viewer('cesiumContainer', {
            homeButton : false,
            creditContainer : null,
            navigationHelpButton : false,
            navigationInstructionsInitiallyVisible: false,
            selectionIndicator:false,
            fullscreenElement: 'previewContent',
            baseLayerPicker: true,
            // terrainProvider : new Cesium.CesiumTerrainProvider({
            //     url : 'https://assets.agi.com/stk-terrain/v1/tilesets/PAMAP/tiles',
            //     requestWaterMask : true,
            //     requestVertexNormals : true
            // }),
            infoBox : true,
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
            
        }
    });
}

function main()
{
    // fly({
    //     longitude : longitude,
    //     latitude  : latitude,
    //     altitude : altitude,
    //     heading : heading,
    //     pitch   : pitch,
    //     roll    : roll
    // });

    initLoaderKMZ();
}

function initLoaderKMZ()
{
    loader = new KMZLoader();
    loader.init(viewer);

    loader.loadKMZ("./kmz/Chengdu-Flight1.GE.kmz");
}