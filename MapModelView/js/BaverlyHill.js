/**
 * Created by Almond on 12/2/2016.
 */

var BaverlyHill = function() {

    var main                =   this;
    main.city_pos            =   null;
    main.center_Entity       =   null;

    main.init = function (position){
        main.city_pos       =   position;
    }

    main.drawPos = function () {
        main.center_Entity = viewer.entities.add({
            position : Cesium.Cartesian3.fromDegrees(main.city_pos.x, main.city_pos.y),
            // label : {
            //     text: 'Baverly Hills',
            //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            //     eyeOffset: new Cesium.Cartesian3(0,0,-30),
            //     scale   :   5

            // },
            model: {
                uri: "./3dobject/BeverlyHills_beforeTS/BeverlyHills_beforeTS.gltf",
                shadows : Cesium.ShadowMode.RECEIVE_ONLY,
                heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,
                scale: 0.2
            },
            show : false
        });
    }

    main.flyTo = function() {
        viewer.trackedEntity = main.center_Entity;
        // viewer.trackedEntity = undefined;

        showFlying(true);
        viewer.camera.flyToBoundingSphere(
            new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(main.city_pos.x, main.city_pos.y, 400.0), 300),
            {
                complete: function () {
                    newyork.center_Entity.show = false;
                    baverlyHill.center_Entity.show = true;
                    isHome = false;
                    isBaverlyHill = true;
                    isNewYork = false;
                    showFlying(false);
                },
                maximumHeight: 10000000,
                orientation : {
                    heading: Cesium.Math.toRadians(-60),
                    pitch: Cesium.Math.toRadians(-25.0),
                    roll: 0.0
                }
            });
    }
}
