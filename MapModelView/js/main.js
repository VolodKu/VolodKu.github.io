
Cesium.BingMapsApi.defaultKey       = 'AsarFiDvISunWhi137V7l5Bu80baB73npU98oTyjqKOb7NbrkiuBPZfDxgXTrGtQ';

var viewer                          = new Cesium.Viewer('cesiumContainer', {
                                        homeButton : false,
                                        creditContainer : null,
                                        navigationHelpButton : false,
                                        navigationInstructionsInitiallyVisible: false,
                                        timeline : false,
                                        clock : null,
                                        selectionIndicator:false,
                                        fullscreenElement: 'previewContent',
                                        baseLayerPicker: false,
                                        imageryProvider : new Cesium.createOpenStreetMapImageryProvider({
                                            url : 'https://stamen-tiles.a.ssl.fastly.net/watercolor/',
                                            fileExtension: 'png'
                                        }),
                                        terrainProvider : new Cesium.CesiumTerrainProvider({
                                            url : 'https://assets.agi.com/stk-terrain/v1/tilesets/PAMAP/tiles',
                                            requestWaterMask : true,
                                            requestVertexNormals : true
                                        }),
                                        infoBox : false,
                                        sceneModePicker : false,
                                    });

var mousedown                       = false;

var isNewYork                       = false;

var isBaverlyHill                   = false;

var isHome                          = false;

var newyork                         = new NewYorkCity();

var baverlyHill                     = new BaverlyHill();

var street                          = null;

var man                             = null;

var current_pos                     = null;

var xDown                           = null;                                                        
var yDown                           = null;

var cesiumContainer                 = document.getElementById("cesiumContainer");

var doubleTapEntity                 = null;

window.onmousedown                      = onMouseDown;

window.onmouseup                        = onMouseUp;

var modelingObjects                     = [];

var uri_obj                             = [
                                            './3dobject/house1/exterior-p0b.gltf',
                                            './3dobject/house2/exterior-p0a.gltf',
                                            './3dobject/house3/exterior-p0c.gltf'
                                        ];

var modelingObjectCount                 = 3;

var viewDirection                       = null;

var isBuildingZoom                      = false;

var webMap                              = null;

function handleOrientation(event) 
{

    var z           = event.alpha;
    var x           = event.beta;
    var y           = event.gamma;

    if (this.mousedown == false) 
    {
        viewer.camera.rotateLeft(y / 1000);
    }

}

function gotoNewYork() 
{
    if (isNewYork == false) {
        street.moveSelectBuildingOrigin();
        newyork.flyTo();
    }
}

function gotoBeverlyHill() 
{
    if (isBaverlyHill == false) {
        newyork.removeLayers();
        street.moveSelectBuildingOrigin();
        baverlyHill.flyTo();
    }
}

function gotoHome() 
{
    if (isHome == false) {
        newyork.removeLayers();
        viewer.trackedEntity = man;
        street.moveSelectBuildingOrigin();
        showFlying(true);
        viewer.scene.camera.flyToBoundingSphere(
            new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(current_pos.coords.longitude, current_pos.coords.latitude, 400.0), 300),
            {
                maximumHeight: 10000000,
                complete: function () {
                    newyork.center_Entity.show = false;
                    baverlyHill.center_Entity.show = false;
                    isHome = true;
                    isBaverlyHill = false;
                    isNewYork = false;
                    showFlying(false);
                },
                orientation : {
                    heading: Cesium.Math.toRadians(-60),
                    pitch: Cesium.Math.toRadians(-25.0),
                    roll: 0.0
                }
            });
    }
}

function loadingObject() 
{
    for (var i = 0; i < modelingObjectCount; i ++) 
    {
        var entity = new Cesium.Entity({
            model: {
                uri: uri_obj[i],
                // shadows : Cesium.ShadowMode.DISABLED
            },
        });
        modelingObjects.push(entity);
    }
}

function onMouseDown(event) 
{
    this.mousedown = true;
}

function onMouseUp(event) 
{
    this.mousedown = false;
}

function fly(position) 
{
    webMap = new WebMap3DCityDB(viewer);

    // webMap.activateMouseClickEvents(true);
    webMap.activateMouseMoveEvents(true);
    // webMap.activateViewChangedEvent(true);

    current_pos                         = position;

    // viewer.scene.globe.enableLighting = true;

    man = new Cesium.Entity(
    {
        position : Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude),
        id: 'man',
        ellipse : {
            semiMajorAxis : 500.0,
            semiMinorAxis : 500.0,
            material : Cesium.Color.TRANSPARENT,
        },
    });

    doubleTapEntity = new Cesium.Entity(
    {
        position : Cesium.Cartesian3.fromDegrees(0, 0),
        ellipse : {
            semiMajorAxis : 10.0,
            semiMinorAxis : 10.0,
            material : Cesium.Color.TRANSPARENT,
        },
    });

    viewer.entities.add(man);
    viewer.entities.add(doubleTapEntity);

    viewer.trackedEntity = man;

    street = new StreetView();
    street.init(viewer);
    street.setLatLon(position.coords.longitude, position.coords.latitude);
    street.dispObject();
    street.enableSpaceEventHandler(viewer);
    // street.enableCameraMoveEventHandler(viewer);

    // newyork.init({x: -73.985130, y: 40.758896});
    newyork.init({x: -73.98774263868867, y: 40.74337478856652});
    newyork.drawPos();

    baverlyHill.init({x: -118.401345, y: 34.067806});
    baverlyHill.drawPos();

    newyork.center_Entity.show = false;
    baverlyHill.center_Entity.show = false;

    // street.initEvent();

    this.viewer.geocoder.viewModel.search.beforeExecute.addEventListener(function () {
        if (viewer.geocoder.viewModel.search.canExecute && viewer.geocoder.viewModel.searchText != "") {
            showFlying(true);
        }
    });

    this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    function initEventOrientation() 
    {
        // window.addEventListener("deviceorientation", handleOrientation);
        isHome = true;

        viewDirection = viewer.camera.direction;
        var controller = viewer.scene.screenSpaceCameraController;
        
        controller.enableRotate = false;
        // controller.enableZoom = false;

        var eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        eventHandler.setInputAction(function(wheelZoomAmount){
            if (viewer.camera.direction.z > 0 && wheelZoomAmount < 0) {
                var heading = -60.0;
                if (street.selectBuilding != -1) {
                    heading = street.buildings[street.selectBuilding].direction;
                    street.moveSelectBuildingOrigin();
                }
                viewer.camera.setView({
                    orientation : {
                        heading: Cesium.Math.toRadians(heading),
                        pitch: Cesium.Math.toRadians(-25.0),
                        roll: 0.0
                    }
                });
            }
            // var position = new Cesium.Cartographic(viewer.camera.positionCartographic.longitude, 
            //     viewer.camera.positionCartographic.latitude);

            // getGroundHeight([position], function(cartoPosition) {
            //     var height = viewer.camera.positionCartographic.height;
            //     var limitHeight = cartoPosition[0].height;
            //     if (height < limitHeight + 100 && wheelZoomAmount > 0) {
            //         return;
            //     }
            //     else {
            //         if (wheelZoomAmount > 0) {
            //             viewer.camera.zoomIn(200);
            //         }
            //         else {
            //             if (viewer.camera.direction.z > 0 && wheelZoomAmount < 0) {
            //                 var heading = -60.0;
            //                 if (street.selectBuilding != -1) {
            //                     heading = street.buildings[street.selectBuilding].direction;
            //                     street.moveSelectBuildingOrigin();
            //                 }
            //                 viewer.camera.setView({
            //                     orientation : {
            //                         heading: Cesium.Math.toRadians(heading),
            //                         pitch: Cesium.Math.toRadians(-25.0),
            //                         roll: 0.0
            //                     }
            //                 });
            //             }
            //             else {
            //                 viewer.camera.zoomOut(200);
            //             }
            //         }
            //     }
            // });
        }, Cesium.ScreenSpaceEventType.WHEEL);

        eventHandler.setInputAction(function(movement){
            var curDiff = movement.distance.endPosition.y - movement.distance.startPosition.y;
            if (viewer.camera.direction.z > 0 && curDiff < 0) {
                var heading = -60.0;
                if (street.selectBuilding != -1) {
                    heading = street.buildings[street.selectBuilding].direction;
                    street.moveSelectBuildingOrigin();
                }
                viewer.camera.setView({
                    orientation : {
                        heading: Cesium.Math.toRadians(heading),
                        pitch: Cesium.Math.toRadians(-25.0),
                        roll: 0.0
                    }
                });
            }
            // var position = new Cesium.Cartographic(viewer.camera.positionCartographic.longitude, 
            //     viewer.camera.positionCartographic.latitude);

            // getGroundHeight([position], function(cartoPosition) {
            //     var height = viewer.camera.positionCartographic.height;
            //     var limitHeight = cartoPosition[0].height;
            //     var curDiff = movement.distance.endPosition.y - movement.distance.startPosition.y;
            //     if (height < limitHeight + 100 && curDiff > 0) {
            //         return;
            //     }
            //     else {
            //         if (curDiff > 0) {
            //             viewer.camera.zoomIn(200);
            //         }
            //         else {
            //             if (viewer.camera.direction.z > 0 && curDiff < 0) {
            //                 var heading = -60.0;
            //                 if (street.selectBuilding != -1) {
            //                     heading = street.buildings[street.selectBuilding].direction;
            //                     street.moveSelectBuildingOrigin();
            //                 }
            //                 viewer.camera.setView({
            //                     orientation : {
            //                         heading: Cesium.Math.toRadians(heading),
            //                         pitch: Cesium.Math.toRadians(-25.0),
            //                         roll: 0.0
            //                     }
            //                 });
            //             }
            //             else {
            //                 viewer.camera.zoomOut(200);
            //             }
            //         }
            //     }
            // });
        }, Cesium.ScreenSpaceEventType.PINCH_MOVE);

        var evt = new Cesium.Event();
        evt.addEventListener(function() {
            street.moveSelectBuildingOrigin();
        
            var cartographicPosition = viewer.camera.positionCartographic;
            doubleTapEntity.position = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographicPosition.longitude), 
                Cesium.Math.toDegrees(cartographicPosition.latitude));
            viewer.trackedEntity = doubleTapEntity;

            viewer.camera.setView({
                orientation : {
                    heading: Cesium.Math.toRadians(-60.0),
                    pitch: Cesium.Math.toRadians(-25.0),
                    roll: 0.0
                }
            });
            isHome = false;
            isBaverlyHill = false;
            isNewYork = false;
            street.selectBuilding = -1;
            controller.enableRotate = false;
            showFlying(false);
        }, undefined)

        viewer.geocoder.viewModel._complete = evt;

        var touch = new Touch();
        touch.init(cesiumContainer, horizontalFunc, verticalFunc);

        Hammer(cesiumContainer).on("doubletap", onDoubleTap);

    }

    function horizontalFunc(diff) 
    {
        if (diff > 0) 
            onLeftSwipe(diff);
        else 
            onRightSwipe(diff);
    }

    function verticalFunc(diff) 
    {
        if (diff > 0) 
            onDownMove(diff);
        else 
            onUpMove(diff);
    }

    function getCameraFocusPosition() {
        var rayScratch = new Cesium.Ray();
        rayScratch.origin = viewer.camera.positionWC;
        rayScratch.direction = viewer.camera.directionWC;
        var result = new Cesium.Cartesian3();
        result = viewer.scene.globe.pick(rayScratch, viewer.scene, result);
        return result;
    }

    function onLeftSwipe(diff) 
    {
        if (street.selectBuilding != -1) {
            viewer.camera.rotateLeft(Cesium.Math.toDegrees(0.0008));
            return;
        }
        var center = getCameraFocusPosition();
        if (center == undefined) {
            viewer.camera.rotateLeft(Cesium.Math.toDegrees(0.0008));
            return;
        }
        var frame = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        var oldTransform = Cesium.Matrix4.clone(viewer.camera.transform);
        viewer.camera.lookAtTransform(frame);
        viewer.camera.rotateLeft(Cesium.Math.toDegrees(0.0008));
        viewer.camera.lookAtTransform(oldTransform);
    }

    function onRightSwipe(diff) 
    {
        if (street.selectBuilding != -1) {
            viewer.camera.rotateRight(Cesium.Math.toDegrees(0.0008));
            return;    
        }
        var center = getCameraFocusPosition();
        if (center == undefined) {
            viewer.camera.rotateLeft(Cesium.Math.toDegrees(0.0008));
            return;
        }
        var frame = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        var oldTransform = Cesium.Matrix4.clone(viewer.camera.transform);
        viewer.camera.lookAtTransform(frame);
        viewer.camera.rotateRight(Cesium.Math.toDegrees(0.0008));
        viewer.camera.lookAtTransform(oldTransform);
    }

    function onUpMove(diff) 
    {
        var cameraHeight = viewer.camera.positionCartographic.height;
        if (cameraHeight > 10)
            viewer.camera.move(new Cesium.Cartesian3(viewer.camera.direction.x, viewer.camera.direction.y, 0), cameraHeight / 20);
        else viewer.camera.move(new Cesium.Cartesian3(viewer.camera.direction.x, viewer.camera.direction.y, 0), 2);
    }

    function onDownMove(diff) 
    {
        var cameraHeight = viewer.camera.positionCartographic.height;
        if (cameraHeight > 10)
            viewer.camera.move(new Cesium.Cartesian3(viewer.camera.direction.x, viewer.camera.direction.y, 0), -cameraHeight / 20);
        else viewer.camera.move(new Cesium.Cartesian3(viewer.camera.direction.x, viewer.camera.direction.y, 0), -2);
    }

    function onDoubleTap(event) 
    {
        street.moveSelectBuildingOrigin();
        var position = viewer.camera.pickEllipsoid({x:event.pointers[0].clientX, y:event.pointers[0].clientY});
        var cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
        doubleTapEntity.position = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographicPosition.longitude), 
            Cesium.Math.toDegrees(cartographicPosition.latitude));
        viewer.trackedEntity = doubleTapEntity;

        showFlying(true);
        viewer.scene.camera.flyToBoundingSphere(
            new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographicPosition.longitude)
                , Cesium.Math.toDegrees(cartographicPosition.latitude), 100.0), 50),
            {
                complete: function () {
                    isHome = false;
                    isBaverlyHill = false;
                    isNewYork = false;
                    street.selectBuilding = -1;
                    showFlying(false);
                },
            });
    }

    showFlying(true);
    viewer.scene.camera.flyToBoundingSphere(
            new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 400.0), 300),
            {
                complete: function() {
                    showFlying(false);
                    initEventOrientation();
                },
                orientation : {
                    heading: Cesium.Math.toRadians(-60),
                    pitch: Cesium.Math.toRadians(-25.0),
                    roll: 0.0
                }
            });
}

function showFlying(enable)
{
    if (enable) 
    {
        jQuery("#logo").show(250);
    }
    else
    {
        jQuery("#logo").hide(250);
    }
}

function getGroundHeight(positions, process) {
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 11, positions);

    Cesium.when(promise, function (cartoPosition) {
        process(cartoPosition);
    });
}

function main() 
{
    // loadingObject();
    navigator.geolocation.getCurrentPosition(fly);
}
