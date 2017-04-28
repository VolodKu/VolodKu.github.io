
Cesium.BingMapsApi.defaultKey       = 'AsarFiDvISunWhi137V7l5Bu80baB73npU98oTyjqKOb7NbrkiuBPZfDxgXTrGtQ';

var region  = null;

var beforePosition  = null;

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
            terrainProvider : new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/v1/tilesets/PAMAP/tiles',
                requestWaterMask : true,
                requestVertexNormals : true
            }),
            infoBox : false,
            sceneModePicker : false,
        });

function getCameraFocusPosition() {
    var rayScratch = new Cesium.Ray();
    rayScratch.origin = viewer.camera.positionWC;
    rayScratch.direction = viewer.camera.directionWC;
    var result = new Cesium.Cartesian3();
    result = viewer.scene.globe.pick(rayScratch, viewer.scene, result);
    return result;
}

// viewer.camera.moveEnd.addEventListener(function() 
// {
//     showCameraViewRegion();
// });

function showCameraViewRegion()
{
    var center = getCameraFocusPosition();

    if (center == undefined) return;

    if (region != null)
    {
        viewer.scene.primitives.remove(region);
        // viewer.entities.remove(region);
    }

    var circleInstance = new Cesium.GeometryInstance({
        geometry : new Cesium.EllipseGeometry({
            center : center,
            semiMinorAxis : 1500.0,
            semiMajorAxis : 1500.0,
            rotation : Cesium.Math.PI_OVER_FOUR,
            vertexFormat : Cesium.VertexFormat.POSITION_AND_ST
        }),
        id : 'region_camera',
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0, 0, 1, 0.7))
        }
    });

    region = new Cesium.Primitive({
        geometryInstances : circleInstance,
        appearance : new Cesium.EllipsoidSurfaceAppearance({
            material : new Cesium.Material({
                fabric : {
                    type : 'Color',
                    uniforms : {
                        color : new Cesium.Color(0, 0, 1, 0.7)
                    }
                }
            })
        })
    });

    // region = new Cesium.Entity(
    // {
    //     position : center,
    //     id: 'man',
    //     ellipse : {
    //         semiMajorAxis : 1000.0,
    //         semiMinorAxis : 1000.0,
    //         material : Cesium.Color.AQUA,
    //     },
    // });

    viewer.scene.primitives.add(region);
    // viewer.entities.add(region);

}

function fly(position)
{
    viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, 5000.0),
        orientation : {
            heading : Cesium.Math.toRadians(175.0),
            pitch : Cesium.Math.toRadians(-35.0),
            roll : 0.0
        },
        complete    : function()
        {
            viewer.clock.onTick.addEventListener(function(clock) {
                if (beforePosition != null)
                {
                    if (Cesium.Cartesian3.distance(viewer.camera.positionWC, beforePosition) < 1000)
                    {
                        return;
                    }
                }

                beforePosition = viewer.camera.positionWC.clone();
                showCameraViewRegion();
            });
        }
    });
}

function main()
{
    jQuery.ajax
    ({
        url: "https://freegeoip.net/json",

        jsonp: "callback",
     
        dataType: "jsonp",
     
        success: function( response ) 
        {
            fly(response);
        },
        error: function(error)
        {
            isLocationEnabled = false
        }
    });
}

