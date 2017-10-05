
Cesium.BingMapsApi.defaultKey       = 'KfV8wdPtnDWQhBokvFQu~XZLc5YQAVAZ9fPUgPdXJPg~At-c_UY2pdQYIGTUDYUL8ynhX4LXwO4TamJi-LhAny8yTUne6oPIjzttr1enFUez';

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
            sceneModePicker : true
        });

function getCesiumPosition(windowPosition)
{
    var position = viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);

    if (position == undefined)
        return new Cesium.Cartographic(0, 0, 0);

    var cartographicPosition    = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

    return cartographicPosition;
}

var windEntity  = null;
var canvas      = null;

function getHeight(west, south, east, north, width)
{
    var worldMapRadius = width / (east - west) * 360 / (2 * Math.PI);

    y1 = worldMapRadius * Math.log( Math.tan( (north * Math.PI / 180 + Math.PI / 2) / 2 ) );
    y2 = worldMapRadius * Math.log( Math.tan( (south * Math.PI / 180 + Math.PI / 2) / 2 ) );

    return Math.abs(y1 - y2);
}

function setCanvasSize(width, height)
{
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    if (oldWidth !== width || oldHeight !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }
}

function main()
{
    viewer.scene.screenSpaceCameraController.enableTilt = false;

    canvas = document.getElementById('test_wind');

    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';

    var width = $('#test_wind').width();
    var height = $('#test_wind').height();

    setCanvasSize(width, height);

    var videoElement = document.getElementById('trailer');

    windEntity = viewer.entities.add({
    rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(-180,-89.9,180, 89.9),
        material: canvas
    }});

    const windMap = new WindMap({
        canvas: canvas,
        extent: () => {
            var rect = viewer.camera.computeViewRectangle();

            var south = Cesium.Math.toDegrees(rect.south);
            var north = Cesium.Math.toDegrees(rect.north);
            var west = Cesium.Math.toDegrees(rect.west);
            var east = Cesium.Math.toDegrees(rect.east);

            var fullex = false;

            if (north == 90 && south == -90)
            {
                fullex = true;
            }

            if (south == -90)
            {
                south = -89;
            }

            if (north == 90)
            {
                north = 89;
            }

            var est = east;
            var wst = west;

            if (east < west)
            {
                est = east + 360;
                wst = west;
            }

            if (getHeight(wst, south, est, north, canvas.width) > 4096) return;

            viewer.entities.remove(windEntity);

            windEntity = viewer.entities.add({
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
                material: canvas
            }});

            setCanvasSize(canvas.width, getHeight(wst, south, est, north, canvas.width));

            return {
                width: canvas.width,
                height: getHeight(wst, south, est, north, canvas.width),
                latlng:[
                    // [Cesium.Math.toDegrees(rect.west) , Cesium.Math.toDegrees(rect.south) ],
                    // [Cesium.Math.toDegrees(rect.east) , Cesium.Math.toDegrees(rect.north) ]
                    [wst, south],
                    [est, north]
                    // [-575.859375, -88.66804351747277],
                    // [440.859375, 89.93650055085104]
                ], 
                full : fullex
            };
        }
    });

    viewer.camera.percentageChanged  = 0.001;

    viewer.camera.changed.addEventListener(function() {
        windMap.update();
    });

    const mapDataUrl = 'https://raw.githubusercontent.com/dannycochran/windable/master/data/2016040900_700.json'
    d3.json(mapDataUrl, (err, windData) => {
        windMap.update({data: windData});
    });
}

