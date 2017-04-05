var Building = function()
{
    var main = this;

    main.pos = null;

    main.building = null;

    main.image = null;

    main.line = null;

    main.height = 0;

    main.scene = null;

    main.heightArray = [
        18,
        30,
        18,
        30
    ];

    main.line_heightArray = [
        10,
        10,
        10,
        30
    ];

    main.entrance_path_pos_array_x = [
        -0.000012867400769778214 / 2,
        0.00006001677793676663 / 2,
        0.000006250388182138522 / 2,
    ];

    main.entrance_path_pos_array_y = [
        -0.0014109504749804103 / 2,
        -0.002098573698830819 / 2 ,
        -0.0013200220494162807 / 2
    ];

    main.entrance_pos_array_x = [
        0.00030431056424617965 / 9,
        0.000148711148185043385 / 9,
        -0.00004707060763564641 / 9,
    ];

    main.entrance_pos_array_y = [
        -0.0007382109912050793 / 9,
        -0.0008567573994788802 / 9,
        -0.0008671437243563673 / 9,
    ];

    main.uri_obj = [
        './3dobject/house1/exterior-p0b.gltf',
        './3dobject/house2/exterior-p0a.gltf',
        './3dobject/house3/exterior-p0c.gltf'
    ];

    main.img_start_positions_x = [
        -0.000021055249476376048 / 2,
        0.00020071241219454805 / 2,
        0.000003590850738532936 / 2
    ];

    main.img_start_positions_y = [
        -0.00001962771442620692 / 2,
        -0.00020030826985717454 / 2,
        -0.00025333546893615335 / 2
    ];

    main.img_end_positions_x = [
        0.0003314129036482427 / 2,
        0.00036660239381092197 / 2,
        0.00028431785312932334 / 2
    ];

    main.img_end_positions_y = [
        -0.00019877837249637764 / 2,
        -0.00020935788758436047 / 2,
        -0.0002611650705404145 / 2
    ];


    main.entrance = null;

    main.entrance_pos = null;

    main.entrance_path = null;

    main.entrance_path_pos = null;

    main.entrance_height = 0;

    main.direction = 0;

    main.index = 0;

    main.image_position = null;

    main.init = function (scene) {
        main.scene = viewer.scene;
    }

    main.setPosition = function (position) {
        main.pos = position;
    }

    main.setHeight = function (height) {
        main.height = height;
    }

    main.scale = 2;

    main.gotoEntrance = function () {
        var heading = main.direction;

        viewer.trackedEntity = main.entrance;

        viewer.camera.flyTo({
            destination : main.entrance_path_pos,
            orientation : {
                heading : Cesium.Math.toRadians(heading),
                pitch : Cesium.Math.toRadians(0.0),
                roll : 0.0
            },
            maximumHeight: 1000,
            complete: function() {
                // main.image.position = main.entrance_pos;
                isBuildingZoom = true;
                showFlying(false);
            }
        });

    }

    main.gotoStreetView = function () {
        viewer.trackedEntity = main.image;
    }

    main.setBuilding = function (number, id) {
        main.direction = 0;

        main.index = number;
        main.height = main.heightArray[number] / 3 * main.scale;

        var positions = new Cesium.Cartographic(Cesium.Math.toRadians(main.pos.x), Cesium.Math.toRadians(main.pos.y));

        getGroundHeight([positions], function(cartoPosition) {
            var ellipsoid = Cesium.Ellipsoid.WGS84;
            var height = Cesium.Math.toRadians(cartoPosition[0].height);
            var entity = new Cesium.Entity({
                position : Cesium.Cartesian3.fromDegrees(main.pos.x, main.pos.y, height),
                id: id,
                model: {
                    uri: main.uri_obj[number],
                    scale: main.scale,
                    shadows : Cesium.ShadowMode.DISABLED, 
                    // heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
                },
                orientation: Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(main.pos.x, main.pos.y, height),
                    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(main.direction), 0, 0))
            });
            main.building = entity;

            var dx = main.entrance_pos_array_x[number] * main.scale;
            var dy = main.entrance_pos_array_y[number] * main.scale;
            var length = Math.sqrt(dx * dx + dy * dy);
            var dy1 = Math.sin(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length;
            var dx1 = Math.cos(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length;
            dx1 = dx;
            dy1 = dy;

            var position = Cesium.Cartesian3.fromDegrees(main.pos.x + dx1, main.pos.y + dy1, 3 * main.scale + height);
            main.entrance_pos = position;
            main.entrance_height = 2;
            main.entrance = new Cesium.Entity({
                position: position,
                point : {
                    show : false, // default
                    color : Cesium.Color.SKYBLUE, // default: WHITE
                    pixelSize : 4, // default: 1
                    outlineColor : Cesium.Color.YELLOW, // default: BLACK
                    outlineWidth : 4, // default: 0

                }
            });

            var dx = main.entrance_path_pos_array_x[number] * main.scale;
            var dy = main.entrance_path_pos_array_y[number] * main.scale;
            var length = Math.sqrt(dx * dx + dy * dy);
            var dy1 = Math.sin(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length;
            var dx1 = Math.cos(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length;
            dx1 = dx;
            dy1 = dy;

            position = Cesium.Cartesian3.fromDegrees(main.pos.x + dx1, main.pos.y + dy1, 3 * main.scale + height);
            main.entrance_path_pos = position;
            main.entrance_path = new Cesium.Entity({
                position: position,
                point : {
                    show : true, // default
                    color : Cesium.Color.SKYBLUE, // default: WHITE
                    pixelSize : 4, // default: 1
                    outlineColor : Cesium.Color.YELLOW, // default: BLACK
                    outlineWidth : 4, // default: 0
                }
            });            

            viewer.entities.add(main.building);
            viewer.entities.add(main.entrance);
        });
    }

    main.setImage = function(number, id, photo_id) {
        var name = "./images/photo_" + photo_id + ".png";

        var positions = new Cesium.Cartographic(Cesium.Math.toRadians(main.pos.x), Cesium.Math.toRadians(main.pos.y));

        getGroundHeight([positions], function(cartoPosition) {
            var height = Cesium.Math.toRadians(cartoPosition[0].height);
            var dx = main.img_end_positions_x[number] * main.scale;
            var dy = main.img_end_positions_y[number]* main.scale;
            var length = Math.sqrt(dx * dx + dy * dy);
            var dy1 = Math.sin(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length
            var dx1 = Math.cos(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length

            var position = Cesium.Cartesian3.fromDegrees(main.pos.x + dx1, main.pos.y + dy1, main.height * main.scale + height);
            main.image_position = position;
            var entity = new Cesium.Entity( {
                position : position,
                id:id,
                billboard : {
                    image   : name, // default: undefined
                    width   : 50,
                    height  : 50, 
                }
            });

            main.image = entity;

            dx = main.img_start_positions_x[number] * main.scale;
            dy = main.img_start_positions_y[number]* main.scale;
            length = Math.sqrt(dx * dx + dy * dy);
            dy1 = Math.sin(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length
            dx1 = Math.cos(- Cesium.Math.toRadians(main.direction) + Math.atan(dy / dx)) * length

            position = Cesium.Cartesian3.fromDegrees(main.pos.x + dx1, main.pos.y + dy1, main.line_heightArray[number] * main.scale + height);
            main.line = new Cesium.Entity({
                position : position,
                polyline : {
                    positions : [
                        main.image_position,
                        position
                    ],
                    width : new Cesium.ConstantProperty(2),
                    material : Cesium.Color.SKYBLUE,
                    followSurface : new Cesium.ConstantProperty(false)
                }
            });
            viewer.entities.add(main.line);
            viewer.entities.add(main.image);
        });
    }

    main.draw = function() {
        // viewer.entities.add(main.building);
        // viewer.entities.add(main.line);
        // viewer.entities.add(main.image);
        // viewer.entities.add(main.entrance);
    }

    main.imageMoveOriginal = function() {
        main.image.position = main.image_position;
    }
}
