var global_czml = {
    "id" : "path",
    "name" : "path with GPS flight data",
    "description" : "<p>GPS NMEA Flight Data</p>",
    "availability" : "2012-08-04T10:00:00Z/2012-08-04T15:00:00Z",
    "path" : {
        "material" : {
            "polylineOutline" : {
                "color" : {
                    "rgba" : [255, 0, 255, 255]
                },
                "outlineColor" : {
                    "rgba" : [0, 255, 255, 255]
                },
                "outlineWidth" : 5
            }
        },
        "width" : 8,
        "leadTime" : 10,
        "trailTime" : 1000,
        "resolution" : 5
    },
    "model": {
        "gltf" : "./models/CesiumAir/airplane.gltf",
        "scale" : 0.01,
        "minimumPixelSize": 32
    },
    "position" : {
        "epoch" : "2012-08-04T10:00:00Z",
        "cartographicDegrees" : [
        ]
    }
};

var allCZML = [{
    "id" : "document",
    "name" : "CZML Path",
    "version" : "1.0",
    "clock": {
        "interval": "2012-08-04T10:00:00Z/2012-08-04T15:00:00Z",
        "currentTime": "2012-08-04T10:00:00Z",
        "multiplier": 1
    }
}];

var headerCZML = [{
    "id" : "document",
    "name" : "CZML Path",
    "version" : "1.0",
    "clock": {
        "interval": "2012-08-04T10:00:00Z/2012-08-04T15:00:00Z",
        "currentTime": "2012-08-04T10:00:00Z",
        "multiplier": 1
    }
}];