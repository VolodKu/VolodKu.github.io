/*
    HTML5 3D Engine for manage various 3D objects.
                -------
    Created by Sergey Kuznetov
                -------
    Versioin 1.0    Date:2016.09.30
*/

var ClassPanorama   = function(data)
{
    var main        = this;

    /* main variables for set up env */

    main.container  = null;
    main.scene      = null;
    main.camera     = null;
    main.renderer   = null;
    main.controls   = null;

    main.canvID     = "";
    main.sWidth     = 0;
    main.sHeight    = 0;

    main.progress   = null;
    main.ptnPath    = "images/sphere/";
    
    main.objList    = [];
    main.ptsList    = [];
    main.objRoom    = null;
    main.dist       = 5;
    main.objects    = [];
    main.objArr     = [];

    main.anim_start = 0;
    main.start_time = 0;
    main.anim_obj   = null;

    main.duration   = 800;
    main.interval   = 200;
    main.work_speed = 30;

    main.move_x     = 0;
    main.move_z     = 0;

    main.start_x    = 0;
    main.start_z    = 0;

    main.target     = new THREE.Vector3();

    main.fWidth     = $(document).width();
    main.fHeight    = $(document).height();

    main.isUserInteracting      = false,
    main.onPointerDownPointerX  = 0;
    main.onPointerDownPointerY  = 0;
    main.onMouseDownLon         = 0;
    main.onMouseDownLat         = 0;

    main.room_size              = 1200;
    main.room_w_ptl             = 50;
    main.room_h_ptl             = 50;

    main.ctrl_radius            = 20;
    main.ctrl_curr_index        = 0;
    main.num_balloons           = 10;

    main.arr_balloons           = [];
    main.arr_house              = [];
    main.arr_pos                = [];
    main.sPos                   = {x : 0, y : 0};
    main.isDrag                 = 0;

    main.lat                    = 0;
    main.lng                    = 0;

    main.minPolarAngle          = -Math.PI / 2;
    main.maxPolarAngle          = Math.PI / 2;

    main.init       = function()
    {
        main.canvID     = "ThreeJS";

        main.sWidth     = main.fWidth;
        main.sHeight    = main.fHeight;
        
        // main.progress   = new classProgress();

        main.init3DEnv();
        main.initEvent();
        main.initGround();
        // main.dispObjects(main.objArr);
        main.setBackground(0, 0, 0);
    }

    main.initGround     = function()
    {
        var init_g_w    = 60;
        var init_g_h    = 60; 

        var groundGeo   = new THREE.PlaneBufferGeometry( init_g_w, init_g_h);
        var texture     = new THREE.ImageUtils.loadTexture($("#output img").attr("src"));
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        var groundMat = new THREE.MeshLambertMaterial( { overdraw: true, side:THREE.FrontSide, map : texture} );

        var ground = new THREE.Mesh( groundGeo, groundMat );

        ground.position.y = -2;
        ground.rotation.x = Math.PI / -2;

        // main.ground = ground;
        main.scene.add( ground );    
    }

    main.dispObjects   = function(obj_arr)
    {
        main.progress = new classProgress();
        main.progress.showProgress();

        main.objList    = obj_arr;            
        main.render_id  = 0;

        main.addObject(main.objList[main.render_id]);
    }

    main.addObject      = function(param)
    {
        var mtlLoader   = new THREE.MTLLoader();
        var objLoader   = new THREE.OBJLoader();

        var onProgress  = function ( xhr ) {};
        var onError     = function ( xhr ) {};

        mtlLoader.setPath( "obj/" );
        mtlLoader.load( param.mtl, function( materials ) 
        {
            materials.preload();
          
            objLoader.setMaterials( materials );
            objLoader.setPath( 'obj/' );
            objLoader.load( param.obj, function ( object ) 
            {
                var material = null;

                main.render_id ++;

                if(!main.objList[main.render_id] || main.render_id >= main.objList.length)
                {
                    main.progress.hideProgress();

                    var tween = new TWEEN.Tween( main.camera.position )
                    .to( {
                        x: main.l_camra_x,
                        y: main.l_camra_y,
                        z: main.l_camra_z
                    }, 2500 )
                    .easing( TWEEN.Easing.Exponential.InOut )
                    .start();

                    $("#blocker").css("display", "block");
                }
                else
                {
                    main.progress.updateProgress(main.render_id / main.objList.length * 100);

                    setTimeout(function()
                    {
                        main.addObject(main.objList[main.render_id]);
                    }, 20);
                }

                var direction = 1;

                object.scale.set(0.05, 0.05, 0.05);
                object.position.x = 0;
                object.position.y = -2;
                object.position.z = 0;

                main.scene.add( object );

                if(param.obj == "Bambo_House.obj")
                {
                    for(var i = 0; i < main.num_balloons; i ++)
                    {
                        var obj = object.clone();

                        obj.position.x = Math.random() * 20 * direction;
                        obj.position.z = Math.random() * 20 * direction;

                        obj.lat  = Math.round((main.lat + obj.position.x / 180 * 30) * 10000) / 10000;
                        obj.lng  = Math.round((main.lng + obj.position.z / 180 * 30) * 10000) / 10000;
                        
                        direction = direction * (-1);

                        main.scene.add(obj);
                        main.arr_pos.push({x : obj.position.x, z : obj.position.z})
                        main.arr_house.push(obj.children[27]);
                        main.arr_house.push(obj.children[3]);
                    }    
                }
                else if(param.obj == "cmn_obj_balloonR_SD.obj")
                {
                    object.position.y = -1;
                    main.arr_balloons.push(object.children[0]);

                    for(var i = 0; i < main.num_balloons; i ++)
                    {
                        var obj = object.clone();

                        obj.position.x = main.arr_pos[i].x;
                        obj.position.y = -1;
                        obj.position.z = main.arr_pos[i].z;

                        obj.scale.x = 0.05;
                        obj.scale.y = 0.05;
                        obj.scale.z = 0.05;
                        
                        direction = direction * (-1);

                        main.scene.add(obj);
                        main.arr_balloons.push(obj.children[0]);
                    }
                }

            }, onProgress, onError );

        });
    }

    main.initHouses = function()
    {
        return;
        var texture = null;
        var loader  = new THREE.TextureLoader();

         $("#img_loading").css("display", "block");

        loader.load(main.ptnPath + main.objList[load_index].name, function(texture)
        {
            texture.wrapS    = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = -1;

            var material    = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, depthWrite : false, opacity : 0.0 } );
            var geometry    = new THREE.SphereGeometry( main.room_size, main.room_w_ptl, main.room_h_ptl );
            var newRoom     = new THREE.Mesh( geometry, material );

            main.scene.add(newRoom);

            newRoom.position.x = main.objList[load_index].p_x * 1;
            newRoom.position.y = main.objList[load_index].p_y * 1;
            newRoom.position.z = main.objList[load_index].p_z * 1;

            main.objList[load_index].obj = newRoom;

            // newRoom.rotation = newRoom.rotation.y + 0.00001;

            if(load_mode == "initial")
            {
                main.setBackground(main.objList[0].p_x, main.objList[0].p_y, main.objList[0].p_z, main.objList[0].name);
                main.showControl();
            }
            else if(load_mode == "click")
            {
                setTimeout(function()
                {
                    main.doTransition(main.objList[load_index]);
                }, 50);
            }

            $("#img_loading").css("display", "none");
        })
    }

    main.loadImages = function(load_mode, load_index)
    {
        return;
        var texture = null;

        $("#img_loading").css("display", "block");

        var loader = new THREE.TextureLoader();

        loader.load(main.ptnPath + main.objList[load_index].name, function(texture)
        {
            texture.wrapS    = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = -1;

            var material    = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, depthWrite : false, opacity : 0.0 } );
            var geometry    = new THREE.SphereGeometry( main.room_size, main.room_w_ptl, main.room_h_ptl );
            var newRoom     = new THREE.Mesh( geometry, material );

            main.scene.add(newRoom);

            newRoom.position.x = main.objList[load_index].p_x * 1;
            newRoom.position.y = main.objList[load_index].p_y * 1;
            newRoom.position.z = main.objList[load_index].p_z * 1;

            main.objList[load_index].obj = newRoom;



            $("#img_loading").css("display", "none");
        })
    }


    main.initMoveCtrl = function()
    {
        var geometry        = null;
        var circleShape     = new THREE.Shape();
        var extrudeSettings = { amount: 1, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 1, bevelThickness: 1 };
        var material        = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5, DepthWrite : false});
        var holePath        = new THREE.Path();

        holePath.absellipse( 0, 0, main.ctrl_radius - 4, main.ctrl_radius - 4, 0, Math.PI*2, true );

        circleShape.moveTo( main.ctrl_radius, 0 );
        circleShape.absarc( 0, 0, main.ctrl_radius, 0, 2 * Math.PI, false );
        circleShape.holes.push( holePath );

        geometry            = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
        main.ctrl_obj       = new THREE.Mesh( geometry, material);
        main.ctrl_obj.rotation.x = Math.PI / 2;

        main.scene.add(main.ctrl_obj);
    }

    main.showControl = function()
    {
        var geometry    = null;
        var point       = null;
        var circleShape     = new THREE.Shape();
        var extrudeSettings = { amount: 1, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 1, bevelThickness: 1 };
        var material    = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.5, DepthWrite : false});
        var holePath = new THREE.Path();

        holePath.absellipse( 0, 0, main.ctrl_radius - 8, main.ctrl_radius - 8, 0, Math.PI*2, true );

        circleShape.moveTo( main.ctrl_radius, 0 );
        circleShape.absarc( 0, 0, main.ctrl_radius, 0, 2 * Math.PI, false );
        circleShape.holes.push( holePath );

        for(var i = 0; i < main.objList.length; i ++)
        {
            geometry  = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
            point     = new THREE.Mesh( geometry, material);

            point.index      = i;
            point.rotation.x = Math.PI / 2;
            point.position.x = main.objList[i].p_x * 1;
            point.position.y = 0
            point.position.z = main.objList[i].p_z * 1;

            main.ptsList.push(point);
            main.objects.push(point);
            main.scene.add(point);
        }

        main.initMoveCtrl();
        main.initGround();
    }

    main.hideControl = function()
    {
        while(main.ptsList.length)
        {
            main.scene.remove(main.ptsList[0]);
            main.ptsList.splice(0, 1);
        }
    }

    main.init3DEnv  = function()
    {
        main.scene  = new THREE.Scene();

        main.initCamera();
        main.initLights();
        main.initRenderer();
        main.initControls();
        main.initEvent();
        main.animate();
    }

    main.animate    = function(time)
    {
        var opacity = 0.5;

        main.renderer.render( main.scene, main.camera );
        
        // main.controls.update();
        // TWEEN.update( time );

        requestAnimationFrame( main.animate );

        if(main.anim_start)
        {
            if(Date.now() - main.start_time > main.duration)
            {
                main.anim_start = 0;
            }
            else
            {
                main.camera.position.x = main.start_x + (Date.now() - main.start_time) / main.interval * main.move_x;
                main.camera.position.z = main.start_z + (Date.now() - main.start_time) / main.interval * main.move_z;
            }
        }
    }

    main.initCamera = function()
    {
        var angle   = 45;
        var near    = 0.1;
        var far     = 3000;
        var aspect  = main.sWidth / main.sHeight;

        main.camera = new THREE.PerspectiveCamera( angle, aspect, near, far);
        main.scene.add(main.camera);

        main.camera.position.set(0,0,0);
    }

    main.initEvent      = function()
    {
        document.addEventListener( 'click', main.onDocumentMouseClick, false );
        document.addEventListener( 'mousedown', main.onMouseDown, false );
        document.addEventListener( 'mouseup', main.onMouseUp, false );
        document.addEventListener( 'mousemove', main.onMouseMove, false );

        document.addEventListener( 'touchstart', main.onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', main.onDocumentTouchMove, false );
    }

    main.initRenderer   = function()
    {
        if ( !Detector.webgl )
        {
            alert("Your browser doesn't support webgl!");
        }
        // {
        //     alert("Your browser doesn't support webgl!");
        //     return;
        // }
        if ( Detector.webgl )
        {
            main.renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer : true});
        }
        else
            main.renderer = new THREE.CanvasRenderer({antialias:true, preserveDrawingBuffer : true}); 

        main.renderer.setSize(main.sWidth, main.sHeight);

        main.renderer.gammaInput = true;
        main.renderer.gammaOutput = true;
        main.renderer.shadowMapEnabled = true;
        main.renderer.shadowMapCascade = true;
        main.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        main.renderer.setClearColor( 0xFFFFFF, 1 );

        main.container = document.getElementById(main.canvID);
        main.container.appendChild(main.renderer.domElement);
    }

    main.setBackground  = function(x, y ,z)
    {
        var geometry    = new THREE.SphereGeometry( main.room_size, main.room_w_ptl, main.room_h_ptl );
        var texture     = new THREE.ImageUtils.loadTexture("images/sky_midafternoon.jpg");
        var material    = null;

        texture.wrapS   = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x= -1;
        texture.repeat.y= -1;

        material        = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest : 0.5, depthWrite : false, opacity : 1.0 } );
        main.objRoom    = new THREE.Mesh( geometry, material );
        
        main.objRoom.position.x = x * 1;
        main.objRoom.position.y = y * 1;
        main.objRoom.position.z = z * 1;

        main.camera.position.set(x * 1, y, z - main.dist);
        // main.controls.center.set(x * 1, y * 1, z * 1);
        main.scene.add( main.objRoom );
    }

    main.initControls   = function()
    {
        return;
        main.controls   = new THREE.OrbitControls( main.camera );
        main.controls.update();
    }

    main.initLights     = function()
    {
        var light       = new THREE.DirectionalLight( 0x999999 );
        var hemiLight   = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );

        hemiLight.color.setHSL( 0.58, 0.16, 0.88 );
        hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
        hemiLight.position.set( 0, main.sWidth / 2, 0 );

        light.position.set( 0, 500, 0 );
        light.target.position.copy( main.scene.position );
        light.castShadow = true;

        main.scene.add( hemiLight );
        main.scene.add( light );
    }

    main.doTransition   = function(data)
    {
        var move_ex     = data.p_x * 1;
        var move_ey     = data.p_y * 1;
        var move_ez     = data.p_z * 1;
        var duration    = 500;

        data.obj.renderOrder = 0.2;
        main.objRoom.renderOrder = 0.1;

        var x = 0;
        var y = 0;
        var z = 0;

        main.move_x = (move_ex - main.camera.position.x) / main.duration * main.interval;
        main.move_z = (move_ez - main.camera.position.z) / main.duration * main.interval;

        main.start_x = main.camera.position.x;
        main.start_z = main.camera.position.z;

        main.anim_start = 1;
        main.anim_obj   = data.obj;
        main.start_time = Date.now();
    }

    main.onMouseDown  = function(event)
    {
        main.isDrag = 1;
        main.sPos   = {x : event.screenX, y : event.screenY};
    }

    main.onMouseUp  = function(event)
    {
        main.isDrag = 0;
    }

    main.onMouseMove = function(event)
    {
        if(!main.isDrag)
            return;

        var angle_y = (event.screenX - main.sPos.x) / document.body.clientWidth  * Math.PI;
        var angle_x = (event.screenY - main.sPos.y) / document.body.clientHeight * Math.PI;
        var raycaster   = new THREE.Raycaster();
        var mouse   = {x : 0, y : 0};

        mouse.x     =  ((event.clientX - main.renderer.domElement.offsetLeft) / main.renderer.domElement.width) * 2 - 1;
        mouse.y     = -((event.clientY - main.renderer.domElement.offsetTop) / main.renderer.domElement.height) * 2 + 1;

        main.camera.rotation.order = 'YXZ';
        main.camera.rotation.x = Math.max(main.minPolarAngle, Math.min(main.maxPolarAngle, angle_x + main.camera.rotation.x));
        main.camera.rotation.y += angle_y;

        main.sPos = {x : event.screenX, y : event.screenY};
    }

    main.onDocumentMouseClick   = function(event)
    {
        var mouse       = new THREE.Vector2();
        var vector      = new THREE.Vector3();
        var raycaster   = new THREE.Raycaster();
        var intersects  = null;
        var new_color   = null;

        $("#popup").css("display", "none");

        mouse.x     =  ((event.clientX - main.renderer.domElement.offsetLeft) / main.renderer.domElement.width) * 2 - 1;
        mouse.y     = -((event.clientY - main.renderer.domElement.offsetTop) / main.renderer.domElement.height) * 2 + 1;

        raycaster.setFromCamera( mouse, main.camera );
        intersects  = raycaster.intersectObjects(main.arr_house);

        if(intersects.length)
        {
            $("#pos_info").html("Lat:" + intersects[0].object.parent.lat + ", Lng:" + intersects[0].object.parent.lng);
            $("#popup").css("left", event.clientX + "px");
            $("#popup").css("top", event.clientY + "px");
            $("#popup").fadeIn();
        }
        else
        {
            intersects  = raycaster.intersectObjects(main.arr_balloons);

            if(intersects.length)
            {
                console.log(intersects[0]);
                var move_ex     = intersects[0].object.parent.position.x * 1;
                var move_ey     = intersects[0].object.parent.position.y * 1;
                var move_ez     = intersects[0].object.parent.position.z * 1;
                var duration    = 500;
                var x = 0;
                var y = 0;
                var z = 0;

                main.move_x = (move_ex - main.camera.position.x) / main.duration * main.interval;
                main.move_z = (move_ez - main.camera.position.z) / main.duration * main.interval;

                main.start_x = main.camera.position.x;
                main.start_z = main.camera.position.z;

                main.anim_start = 1;
                main.start_time = Date.now();
            }
        }
    }

    function onDocumentMouseWheel( event ) 
    {
        // return;
        camera.fov -= event.wheelDeltaY * 0.05;
        camera.updateProjectionMatrix();
    }

    main.onDocumentTouchStart = function( event ) 
    {
        var mouse       = new THREE.Vector2();
        var vector      = new THREE.Vector3();
        var raycaster   = new THREE.Raycaster();
        var intersects  = null;
        var inter_list  = [];

        main.ctrl_obj.visible = false;

        if ( event.touches.length == 1 ) 
        {
            event.preventDefault();
            main.sPos   = {x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY};

            mouse.x     =  ((event.touches[ 0 ].pageX - main.renderer.domElement.offsetLeft) / main.renderer.domElement.width) * 2 - 1;
            mouse.y     = -((event.touches[ 0 ].pageY - main.renderer.domElement.offsetTop) / main.renderer.domElement.height) * 2 + 1;

            raycaster.setFromCamera( mouse, main.camera );
            intersects  = raycaster.intersectObjects(main.ptsList);

            if(intersects.length)
            {
                if(main.objList[intersects[0].object.index].obj)
                {
                    main.doTransition(main.objList[intersects[0].object.index]);
                }
                else
                {
                    main.loadImages("click", intersects[0].object.index);
                }
            }
        }
    }

    main.onDocumentTouchMove  = function( event ) 
    {
        if ( event.touches.length == 1 ) 
        {
            event.preventDefault();

            var angle_y = (event.touches[ 0 ].pageX - main.sPos.x) / document.body.clientWidth  * Math.PI;
            var angle_x = (event.touches[ 0 ].pageY - main.sPos.y) / document.body.clientHeight * Math.PI;
            var raycaster   = new THREE.Raycaster();

            main.camera.rotation.order = 'YXZ';
            main.camera.rotation.x = Math.max(main.minPolarAngle, Math.min(main.maxPolarAngle, angle_x + main.camera.rotation.x));
            main.camera.rotation.y += angle_y;

            main.sPos = {x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY};
        }
    }
    
    main.init();
}
