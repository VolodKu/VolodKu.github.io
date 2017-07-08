
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

    initPolygon();
}

function initPolygon()
{
    if (polygon == null)
    {
        polygon     = new Polygon();

        polygon.init(viewer);
        polygon.setHighLightColor(Cesium.Color.BLUE.withAlpha(0.4));
    }
}

function resetControl()
{
    $('.tool').removeClass('sel');
    $('#inputHeight').hide();
    $('#levelPanel').hide();
    $('#colorPanel').hide();
}

function initToolBar()
{
    document.body.style.cursor  = 'crosshair';
    editMode                    = 0;

    $('#view').on('click', function(event) 
    {
        editMode    = -1;
        document.body.style.cursor  = 'default';

        resetControl();
        $('#view').addClass('sel');
    });

    $('#color').on('click', function(event) 
    {
        editMode    = -1;
        document.body.style.cursor  = 'default';

        resetControl();
        $('#colorPanel').show();
        $('#color').addClass('sel');
    });

    $('#annotation').on('click', function(event) 
    {
        editMode    = 3;
        if (polygon == undefined || polygon.points.length <= 4) return;

        document.body.style.cursor  = 'default';

        resetControl();
        $('#annotation').addClass('sel');
    });

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
        document.body.style.cursor  = 'default';

        resetControl();
        $('#height').addClass('sel');
        $('#inputHeight').show();
    });

    $('#delete').on('click', function(event) 
    {
        if (polygon != undefined && editMode != 3)
        {
            polygon.reset();

            editMode    = 0;
            document.body.style.cursor  = 'crosshair';
            
            //savetest
            // polygon.savePolygon();

            // $.getJSON("./obj/demo.json", function (json) 
            // {
            //     polygon.loadPolygon(json);
            // });
            resetControl();
            $('#area').addClass('sel');
        }
    });

    $('#reset_level').on('click', function(event) 
    {
        if (polygon != undefined)
        {
            polygon.resetLevel();
            $('#base_value').val("");
            $('#ceiling_value').val("");
            $('#level_value').val("");
        }
    });

    $('#level').on('click', function(event) 
    {
        editMode    = 2;
        document.body.style.cursor  = 'default';

        if (polygon == undefined || polygon.height == 0) return;

        resetControl();
        $("#levelPanel").show();
        $('#level').addClass('sel');
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

    $('#base_value').on('input', function() 
    {
        var baseHeight  = parseFloat(document.getElementById('base_value').value);

        if (isNaN(baseHeight) || baseHeight > polygon.height) baseHeight = 0;

        polygon.setBaseHeight(baseHeight);
    });

    $('#ceiling_value').on('input', function() 
    {
        var ceilHeight  = parseFloat(document.getElementById('ceiling_value').value);

        if (isNaN(ceilHeight) || ceilHeight > polygon.height) ceilHeight = polygon.baseHeight;

        polygon.setCeilHeight(ceilHeight);
    });

    $('#level_value').on('input', function() 
    {
        var level_value  = parseFloat(document.getElementById('level_value').value);

        if (isNaN(level_value) || level_value < 0 || polygon.baseHeight == 0 || polygon.ceilHeight == 0) level_value = 1;

        polygon.setLevelCount(level_value);
    });
    
    $('#cancel_button').on('click', function() 
    {
        polygon.changeIndex = -1;
        $('#text_create').hide();
    });

    $('#save_button').on('click', function() 
    {
        if (polygon.changeIndex != -1)
        {
            var text  = document.getElementById('text_create_value').value;

            if (text != "")
            {
                polygon.updateText(polygon.changeIndex, text);
            }
            polygon.changeIndex = -1;
            $('#text_create').hide();
        }
    });

    $('#update_button').on('click', function() 
    {
        if (polygon.changeIndex != -1)
        {
            var text  = document.getElementById('text_value').value;

            if (text != "")
            {
                polygon.updateText(polygon.changeIndex, text);
            }
            polygon.changeIndex = -1;
            $('#text_change').hide();
        }
    });

    $('#delete_button').on('click', function() 
    {
        if (polygon.changeIndex != -1)
        {
            polygon.removePoint(polygon.textPoints[polygon.changeIndex].id);

            polygon.changeIndex = -1;
            $('#text_change').hide();
        }
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
    if (editMode == 3)
    {
        var pickedFeature = viewer.scene.pick(click.position);

        if (pickedFeature != undefined)
        {
            if (pickedFeature.id instanceof Cesium.Entity && pickedFeature.id._id.includes('point'))
            {
                polygon.removePoint(pickedFeature.id._id);
            }
        }  
        return;
    }
    isClicked   = true;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
}

function clickUp(click)
{
    isClicked   = false;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
}

var labelEntity = viewer.entities.add({
        label : {
            show : false,
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT
        }
    });

function clickAction(click)
{
    if (editMode == 0)
    {
        polygon.addPoint(polygon.pickPosition(click));
    }
    else if (editMode == 3)
    {
        var pickedFeature = viewer.scene.pick(click.position);

        if (pickedFeature != undefined)
        {
            if (pickedFeature.id instanceof Cesium.Entity && pickedFeature.id._id.includes('point'))
            {
                polygon.showUpdateText(pickedFeature.id._id, click.position);
            }
            else if (pickedFeature.id != undefined && pickedFeature.id.includes("polygon"))
            {
                var pickedPosition = viewer.scene.pickPosition(click.position);

                polygon.addTextPoint(pickedPosition, click.position);
            }
        }   
    }
}

function clickMove(movement)
{
    if (polygon == undefined) return;

    if (isClicked == false)
    {
        var pickedFeature = viewer.scene.pick(movement.endPosition);

        polygon.showPointText("", false);

        if (pickedFeature != undefined)
        {
            if (pickedFeature.id instanceof Cesium.Entity)
            {
                if (pickedFeature.id._id.includes('point'))
                {
                    document.body.style.cursor  = 'pointer';
                    polygon.showPointText(pickedFeature.id._id, true);
                    polygon.setHighLight(false);
                }
            }
            else if (pickedFeature.id != undefined && pickedFeature.id.includes("polygon"))
            {
                if (editMode == 1)
                {
                    document.body.style.cursor  = 'ns-resize';
                }
                else if (editMode == 3)
                {
                    document.body.style.cursor  = 'crosshair';   
                }
                polygon.setHighLight(true, pickedFeature.id)
            }
        }
        else
        {
            if (editMode == 1)
            {
                document.body.style.cursor  = 'default';
            }
            else if (editMode == 3)
            {
                document.body.style.cursor  = 'default';   
            }
            polygon.setHighLight(false);
        }
    }
    else
    {
        if (polygon.highlightId == "polygon" && editMode == 1)
        {
            var distance    = movement.startPosition.y - movement.endPosition.y;
            polygon.changeHeight(distance);
        }
    }
    
}



