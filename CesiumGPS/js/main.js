
Cesium.BingMapsApi.defaultKey       = 'KfV8wdPtnDWQhBokvFQu~XZLc5YQAVAZ9fPUgPdXJPg~At-c_UY2pdQYIGTUDYUL8ynhX4LXwO4TamJi-LhAny8yTUne6oPIjzttr1enFUez';

var heading     = 0;
var pitch       = -45;
var roll        = 0.0;

var enable_flight   = false;
var flightList  = [];

var minTime     = null;
var maxTime     = null;

// var logList     = ["20140930214305.log", "20141109094351.log", "20150314112349.log", "20150322101155.log", 
//                     "20150503212013.log", "20150503233046.log", "20150613072200.log", "20150629121809.log"];

// var logList     = ["20141109094351", "20150629121809", "20170213152002"];

var logList     = ["20170213152002"];

var viewer  = new Cesium.Viewer('cesiumContainer', {
            homeButton : false,
            creditContainer : null,
            navigationHelpButton : false,
            navigationInstructionsInitiallyVisible: false,
            selectionIndicator:true,
            fullscreenElement: 'previewContent',
            baseLayerPicker: false,
            terrainProvider : new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
                requestWaterMask : true,
                requestVertexNormals : true
            }),
            infoBox : false,
            sceneModePicker : false,
        });

viewer.scene.globe.depthTestAgainstTerrain = true;
var selectIndex = -1;

var prevTime = -1;
var prevPos  = null;

function calcVeolocity(current, time)
{
    var distance = Cesium.Cartesian3.distance(prevPos, current);
    var deltaTime = Cesium.JulianDate.secondsDifference(time, prevTime);

    if (deltaTime == 0) return 0;
    return distance / deltaTime;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

viewer.scene.postRender.addEventListener(function(scene, time) {
    if (viewer.trackedEntity == undefined)
    {
        return;
    }

    var cartographic = Cesium.Cartographic.fromCartesian(viewer.trackedEntity.position.getValue(time));
    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
    var altitudeString = Math.abs(cartographic.height.toFixed(2));

    var speedString = 0;

    if (prevTime == -1 || selectIndex == -1)
    {
        speedString = 0;
    }
    else
    {
        speedString = flightList[selectIndex].getSpeedValue(time);
        // speedString = calcVeolocity(viewer.trackedEntity.position.getValue(time), time).toFixed(2);
    }
    prevTime = time;
    prevPos = viewer.trackedEntity.position.getValue(time);

    altitudeString = (altitudeString / 0.3048).toFixed(2);
    // speedString     = (speedString * 2.23694).toFixed(2);
    speedString     = (speedString * 1.15078).toFixed(2);

    viewer.trackedEntity.label.text =
                'Altitude: ' + ('   ' + altitudeString).slice(-7) + ' Ft' +
                '\nSpeed: ' + ('   ' + speedString).slice(-7) + ' MPH';

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
    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude + 50), 200), {
        maximumHeight: position.altitude + 200,
        orientation : {
            heading : Cesium.Math.toRadians(heading),
            pitch : Cesium.Math.toRadians(pitch),
            roll : roll
        }
    });

}

function main()
{
    for (var i = 0; i < logList.length; i ++)
    {
        if (i < logList.length - 1)
            initFlightData(i, "./data/" + logList[i] + ".log", logList[i]);
        else
        {
            initFlightData(i, "./data/" + logList[i] + ".log", logList[i], function(longitude, latitude, altitude) {
                fly({
                    longitude : longitude,
                    latitude  : latitude,
                    altitude : altitude,
                    heading : heading,
                    pitch   : pitch,
                    roll    : roll
                });
            });
        }
        addToggleUI(document.getElementById('toolbox'), 'toolbox_' + i, logList[i], i);
    }

    initEvent();
}

function initFlightData(index, url, name, complete)
{
    var flight = new Flight();
    flightList.push(flight);

    flight.init(index, name);
    flight.load(url, complete);
}

function loadFlightData(index, content, name, complete)
{
    var flight = new Flight();
    flightList.push(flight);

    flight.init(index, name);
    flight.loadLocalFile(content, complete);
}

function resetControl()
{
    $('.tool').removeClass('sel');
}

function initEvent()
{
    $('#replay').on('click', function(event) 
    {
        resetControl();
        if (enable_flight == false)
        {
            if (startFlight())
            {
                enable_flight = true;
                $('#replay').addClass('sel');
            }
        }
        else
        {
            enable_flight = false;

            stopFlight();
        }
    });

    $('#save').on('click', function(event) 
    {
        for (var i = 0; i < flightList.length; i ++)
        {
            var filename = flightList[i].logName + ".czml";
            var blob = new Blob([JSON.stringify(flightList[i].localCzml, null, '\t')], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename);
        }

        var filename = "all.czml"
        var blob = new Blob([JSON.stringify(allCZML, null, '\t')], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    });

    $('#open').on('click', function(event) 
    {
        event.preventDefault();
        $("#load").trigger('click');
    });

    document.getElementById('load').addEventListener('change', readSingleFile, false);
}

function readSingleFile(event) {
    var file = event.target.files[0];
    if (!file || !file.name.includes(".log")) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        loadFlightData(flightList.length, event.target.result, file.name.replace(".log", ""), function(longitude, latitude, altitude) {
            fly({
                longitude : longitude,
                latitude  : latitude,
                altitude : altitude,
                heading : heading,
                pitch   : pitch,
                roll    : roll
            });
        });
        addToggleUI(document.getElementById('toolbox'), 'toolbox_' + flightList.length - 1, file.name.replace(".log", ""), flightList.length - 1);
    };

    reader.readAsText(file);
}

function startFlight()
{
    viewer.clock.shouldAnimate = false;
    selectIndex = -1;
    for (var i = 0; i < flightList.length; i ++)
    {
        if (flightList[i].pathVisible == true) {
            selectIndex = i;
            break;
        }
    }

    if (flightList[selectIndex].pathEntity == null)
    {
        viewer.dataSources.add(Cesium.CzmlDataSource.load(flightList[selectIndex].localCzml)).then(function(data) {
            flightList[selectIndex].pathEntity = data.entities.getById('path_' + flightList[selectIndex].flight_id);
            flightList[selectIndex].pathEntity.orientation = new Cesium.VelocityOrientationProperty(flightList[selectIndex].pathEntity.position);

        }); 
    }

    return setTrackEntity();
}

function setTrackEntity()
{
    if (selectIndex == -1)
    {
        window.alert("select one tracking Flight Data.");
        return false;
    }
    else
    {
        viewer.clock.startTime = Cesium.JulianDate.fromDate(flightList[selectIndex].startTime, viewer.clock.startTime);
        viewer.clock.endTime = Cesium.JulianDate.fromDate(flightList[selectIndex].endTime, viewer.clock.endTime);
        viewer.clock.currentTime = viewer.clock.startTime;

        viewer.trackedEntity    = flightList[selectIndex].pathEntity;
        viewer.trackedEntity.label = new Cesium.LabelGraphics({
            show : true,
            showBackground : true,
            font : '14px monospace',
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(40, 0)
        });
        viewer.clock.shouldAnimate = true;
    }

    return true;
}

function stopFlight()
{
    viewer.trackedEntity.label = undefined;
    viewer.trackedEntity    = undefined;
    viewer.clock.shouldAnimate = false;
}

function addToggleUI(parent, id, title, index)
    {
        var centre  = document.createElement('div');
        centre.className = "centre";

        var checkDiv = document.createElement('div');
        checkDiv.className = "checkbox";

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "check";
        checkbox.value = "check";
        checkbox.id = id;
        checkbox.checked = true;

        var label = document.createElement('label');
        label.htmlFor = id;
        label.innerHTML = title;

        checkDiv.appendChild(checkbox);
        checkDiv.appendChild(label);

        centre.appendChild(checkDiv);
        centre.style.marginTop = (index * 35) + "px";

        parent.appendChild(centre);

        $('#' + id).on('change', function(){
            if(this.checked) 
            {
                flightList[index].showPath(true);
            }
            else
            {
                flightList[index].showPath(false);
            }   
        })
    }


