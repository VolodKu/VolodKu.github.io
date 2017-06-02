
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
            baseLayerPicker: true,
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

    initToolBar();
    initEvent();
}

function resetControl()
{
    $('.tool').removeClass('sel');
    $('#inputHeight').hide();
}

function initToolBar()
{
    document.body.style.cursor  = 'crosshair';
    editMode                    = 0;

    $('#area').on('click', function(event) 
    {
        if (polygon != undefined && polygon.height != 0) return;

        editMode    = 0;
        document.body.style.cursor  = 'crosshair';

        resetControl();
        $('#area').addClass('sel');
    });

    $('#height').on('click', function(event) 
    {
        if (polygon == undefined || polygon.points.length <= 4) return;

        editMode    = 1;
        document.body.style.cursor  = 'pointer';

        resetControl();
        $('#height').addClass('sel');
        $('#inputHeight').show();
    });

    $('#delete').on('click', function(event) 
    {
        editMode    = 0;
        document.body.style.cursor  = 'crosshair';

        if (polygon != undefined)
        {
            polygon.reset();
            
            //savetest
            // polygon.savePolygon();

            //loadtest
            // $.getJSON("./obj/demo.json", function (json) 
            // {
            //     polygon.loadPolygon(json);
            // });
        }

        resetControl();
        $('#area').addClass('sel');
    });

    $('#height_value').on('input', function() 
    {
        var height  = parseInt(document.getElementById('height_value').value);
        if (height == undefined || isNaN(height)) height = 0;
        
        if (polygon != undefined) polygon.setHeight(height);
    });

    $('#color_value').on('input', function() 
    {
        var color  = parseInt(document.getElementById('color_value').value, 16);
        if (color == undefined || isNaN(color)) color = 0;
        if (polygon != undefined) polygon.setColor(color);
    });

    $('#opacity_value').on('input', function() 
    {
        var opacity  = parseFloat(document.getElementById('opacity_value').value);
        if (opacity == undefined || isNaN(opacity) || opacity < 0.01) opacity = 0.01;
        if (polygon != undefined) polygon.setOpacity(opacity);
    });

}

function initEvent()
{
    var handler     = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(clickAction,
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    handler.setInputAction(clickMove,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    handler.setInputAction(clickDown,
        Cesium.ScreenSpaceEventType.RIGHT_DOWN
    );
    handler.setInputAction(clickUp,
        Cesium.ScreenSpaceEventType.RIGHT_UP
    );
}

function clickDown(click)
{
    isClicked   = true;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
}

function clickUp(click)
{
    isClicked   = false;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
}

function clickAction(click)
{
    if (polygon == null)
    {
        polygon     = new Polygon();

        polygon.init(viewer);
        polygon.setHighLightColor(Cesium.Color.WHITE.withAlpha(0.01), Cesium.Color.BLUE.withAlpha(0.4));
    }
    if (editMode == 0)
    {
        polygon.addPoint(polygon.pickPosition(click));
    }
}

function clickMove(movement)
{
    if (polygon == undefined) return;

    if (isClicked == false)
    {
        var pickedFeature = viewer.scene.pick(movement.endPosition);
        if (pickedFeature != undefined)
        {
            if (pickedFeature.primitive == polygon.polygon)
            {
                polygon.setHightLight(true);
            }
        }
        else
        {
            polygon.setHightLight(false);
        }
    }
    else
    {
        if (polygon.isHighLight == true && editMode == 1)
        {
            var distance    = movement.startPosition.y - movement.endPosition.y;
            polygon.changeHeight(distance);
        }
    }
    
}



