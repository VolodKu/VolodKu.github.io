
Cesium.BingMapsApi.defaultKey       = 'KfV8wdPtnDWQhBokvFQu~XZLc5YQAVAZ9fPUgPdXJPg~At-c_UY2pdQYIGTUDYUL8ynhX4LXwO4TamJi-LhAny8yTUne6oPIjzttr1enFUez';

var longitude   = 135;
var latitude    = 35.012;
var altitude    = 400;
var head        = 0;
var pitch       = - 90;
var roll        = 0;

var polygon     = null;
var isClicked   = false;

var editMode    = 0;

var loader      = null;

var folderMapEntities   = new Map();

var screenOverlay   = "";

var isFlight = false;

var viewer  = new Cesium.Viewer('cesiumContainer', {
            homeButton : false,
            creditContainer : null,
            navigationHelpButton : false,
            navigationInstructionsInitiallyVisible: false,
            selectionIndicator:true,
            fullscreenElement: 'previewContent',
            baseLayerPicker: false,
            terrainProvider : new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/v1/tilesets/PAMAP/tiles',
                requestWaterMask : true,
                requestVertexNormals : true
            }),
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
    
    result = viewer.scene.globe.pick(rayScratch, viewer.scene);

    return result;
}

function getGroundHeight(position, process) {
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 11, [position]);

    Cesium.when(promise, function (cartoPosition) {
        process(cartoPosition);
    });
}

function getHeading(position1, position2)
{
    var X = Math.cos(position2.latitude) * Math.sin(position2.longitude - position1.longitude)
    var Y = Math.cos(position1.latitude) * Math.sin(position2.latitude) - Math.sin(position1.latitude) * Math.cos(position2.latitude) * Math.cos(position2.longitude - position1.longitude);
    return Math.atan2(X, Y);
}

function setScreenOverlay(name, url)
{
    screenOverlay = name;
    // $("#screenoverlay").attr("src",url);
}

function fly(position)
{
    viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude),
        orientation : {
            heading : Cesium.Math.toRadians(head),
            pitch : Cesium.Math.toRadians(pitch),
            roll : roll
        },
        complete    : function()
        {
            
        }
    });
}

function resetControl()
{
    $('.tool').removeClass('sel');
}

function main()
{
    // fly({
    //     longitude : longitude,
    //     latitude  : latitude,
    //     altitude : altitude,
    //     heading : head,
    //     pitch   : pitch,
    //     roll    : roll
    // });

    $('#screen_overlay').on('change', function(){
        if(this.checked) 
        {
            $('#screenoverlay').fadeIn(500);
        }
        else
        {
            $('#screenoverlay').fadeOut(500);
        }   
    });

    $('#replay').on('click', function(event) 
    {
        if (loader == null) return;

        resetControl();
        if (isFlight == false)
        {
            isFlight = true;

            showFlightRegion(true);

            $(this).addClass('sel');
        }
        else
        {
            isFlight = false;
            showFlightRegion(false);
        }
    });

    initLoaderKMZ();
}

function showFlightRegion(visible)
{
    loader.showFlightRegion(visible);
}

function initLoaderKMZ()
{
    loader = new KMZLoader();
    loader.init(viewer);

    loader.loadKMZ("./kmz/Chengdu-Flight1.GE.kmz");
}