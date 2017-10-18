
Cesium.BingMapsApi.defaultKey       = 'KfV8wdPtnDWQhBokvFQu~XZLc5YQAVAZ9fPUgPdXJPg~At-c_UY2pdQYIGTUDYUL8ynhX4LXwO4TamJi-LhAny8yTUne6oPIjzttr1enFUez';

var region  = null;

var beforePosition  = null;

var longitude   = -118.17793476415743;
var latitude    = 34.346315465360576;
var altitude    = 3000;
var heading     = 175;
var pitch       = -35;
var roll        = 0.0
var len_horizontal  = 20;
var len_vertical    = 30;


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

var camera  = new Cesium.Camera(viewer.scene);

function getCameraFocusPosition() {
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

function getCameraVisibilityRegionPositions()
{
    var center  = getCameraFocusPosition();

    if (center == undefined) return undefined;

    var positions = [];

    //left-down
    camera.lookLeft(Cesium.Math.toRadians(len_horizontal / 2));
    camera.lookDown(Cesium.Math.toRadians(len_vertical / 2));
    positions.push(getCameraFocusPosition());

    //left-up
    camera.lookUp(Cesium.Math.toRadians(len_vertical));
    positions.push(getCameraFocusPosition());

    //right-up
    camera.lookRight(Cesium.Math.toRadians(len_horizontal));
    positions.push(getCameraFocusPosition());

    //right-down
    camera.lookDown(Cesium.Math.toRadians(len_vertical));
    positions.push(getCameraFocusPosition());

    return positions;
}


function showCameraViewRegion()
{
    var positions   = getCameraVisibilityRegionPositions();

    if (positions == undefined) return;

    if (region != null)
    {
        viewer.scene.groundPrimitives.remove(region);
        // viewer.entities.remove(region);
    }



    var polygonHierarchy = { positions : positions };
    var color = Cesium.Color.RED;

    color = color.withAlpha(0.5);

    region  = new Cesium.GroundPrimitive({
        geometryInstances : new Cesium.GeometryInstance({
            geometry : new Cesium.PolygonGeometry({
                polygonHierarchy : polygonHierarchy
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            },
            id : 'region'
        })
    });
    
    viewer.scene.groundPrimitives.add(region);

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
            camera.position = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude);
            camera.setView({
                orientation: {
                    heading : Cesium.Math.toRadians(heading),
                    pitch : Cesium.Math.toRadians(pitch),
                    roll : 0.0
                }
            });

            showCameraViewRegion();
        }
    });
}

function main()
{
    fly({
        longitude : longitude,
        latitude  : latitude,
        altitude : altitude
    })
}

