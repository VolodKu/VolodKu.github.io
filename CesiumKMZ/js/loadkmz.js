
var KMZLoader 	= function()
{
	var main 		= this;
	main.options 	= null;

	var load 	= false;
	
	var kmlDataSrc 	= null;
	var polyline 	= null;
	var polygons 	= [];

	var camera 		= null;

	var angle 		= 10;

	main.init 			= function(viewer)
	{
		main.options = {
		    camera : viewer.scene.camera,
		    canvas : viewer.scene.canvas
		};

		camera  = new Cesium.Camera(viewer.scene);
	}

	main.loadKMZ 		= function(path)
	{
		kmlDataSrc  = new Cesium.KmlDataSource(main.options);

	    kmlDataSrc.load(path);
	    // dataSource._clampToGround = true;
	    viewer.clock.shouldAnimate = false;
	    viewer.dataSources.add(kmlDataSrc).then(function(dataSource) 
	    {
	        viewer.flyTo(dataSource, { 
	        	duration: 4.0, 
	        	offset: { 
	        		heading: 0, 
	        		pitch: pitch, 
	        		range: 1000 
	        	} 
	        }).then (function () 
	        {
	        	viewer.scene.globe.tileLoadProgressEvent.addEventListener(function(progress)
	            {
	                if (progress == 0 && load == false)
	                {
	                    main.processEntities();
			        	$('#title').text(dataSource._name);
			        	viewer.clock.multiplier = 250;
		                viewer.clock.shouldAnimate = true;
	                    load = true;
	                }
	            });
	        	
	        });
	    });
	}

	main.processEntities	= function()
	{
		var entity 	= folderMapEntities.get("Base Stations");
		var cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(entity[0].position._value);
		var height = cartographicPosition.height;

		getGroundHeight(cartographicPosition, function(cartoPosition) 
	    {
	        var deltaHeight = height - cartoPosition[0].height;

	        var index = 1;
			for ([key, value] of folderMapEntities)
			{
				main.addToggleUI(document.getElementById('toolbox'), 'toolbox_' + index, key, index);
				index ++;
				for (var i = 0; i < value.length; i ++)
				{
					entity = value[i];
					cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(entity.position._value);
					entity.position._value = Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, cartographicPosition.height - deltaHeight);
				}
			}

			$('#toolbox').fadeIn(500);
			$('#scenereenoverlay').fadeIn(500);
	    });
	}

	main.showEntity 		= function(title, visible)
	{
		var value = folderMapEntities.get(title);
		for (var i = 0; i < value.length; i ++)
		{
			value[i].show = visible;
		}
	}

	main.addToggleUI 		= function(parent, id, title, index)
	{
		var centre 	= document.createElement('div');
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
				main.showEntity(title, true);
			}
			else
			{
				main.showEntity(title, false);
			}	
		})
	}

	main.showFlightRegion 		= function(visible)
	{
		if (load == false) return;

		if (visible)
		{
			$('#toolbox').hide();
			kmlDataSrc.show = false;

			if (polyline != undefined)
			{
				for (var i = 0; i < polyline.length; i ++)
				{
					polyline.get(i).show = true;
				}

				for (var i = 0; i < polygons.length; i ++)
				{
					polygons[i].show = true;
				}

			}

			var entities = folderMapEntities.get('Features');
			// for (var i = 0; i < 200; i ++)
			// {
			// 	var position1 = entities[i].position._value;
			// 	var position2 = entities[i + 1].position._value;

			// 	if (position1.x == position2.x && position1.y == position2.y && position1.z == position2.z)
			// 	{
			// 		continue;
			// 	}

			// 	drawFlightLine(position1, position2);
			// }

			drawLidarInfo();
		}
		else
		{
			$('#toolbox').show();
			kmlDataSrc.show = true;

			if (polyline != undefined)
			{
				for (var i = 0; i < polyline.length; i ++)
				{
					polyline.get(i).show = false;
				}

				for (var i = 0; i < polygons.length; i ++)
				{
					polygons[i].show = false;
				}

			}
		}
	}

	function drawFlightLine(position1, position2)
	{
		if (polyline == undefined)
		{
			polyline       = viewer.scene.primitives.add(new Cesium.PolylineCollection());
		}

		polyline.add({
            positions : [
                position1,
                position2
            ],
            width : 10.0,
            material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
                color   : Cesium.Color.YELLOW
            })
        });

        var carto1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
        var carto2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position2);
        
        var heading = getHeading(carto1, carto2) + Math.PI / 2;
        var rectangles = [];

        camera.position = position1;
	    camera.setView({
	        orientation: {
	            heading : heading,
	            pitch : Cesium.Math.toRadians(-90 + angle),
	            roll : 0
	        }
	    });

	    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

	    camera.position = position1;
	    camera.setView({
	        orientation: {
	            heading : heading,
	            pitch : Cesium.Math.toRadians(-90 - angle),
	            roll : 0
	        }
	    });

	    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

	    camera.position = position2;
	    camera.setView({
	        orientation: {
	            heading : heading,
	            pitch : Cesium.Math.toRadians(-90 - angle),
	            roll : 0
	        }
	    });

	    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

	    camera.position = position2;
	    camera.setView({
	        orientation: {
	            heading : heading,
	            pitch : Cesium.Math.toRadians(-90 + angle),
	            roll : 0
	        }
	    });

	    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

	    var color = Cesium.Color.YELLOW;

	    color = color.withAlpha(0.5);

	    for (var i = 0; i < rectangles.length; i ++)
	    {
	    	if (rectangles[i] == undefined) return;
	    }

	    // polyline.add({
     //        positions : [
     //            position1,
     //            rectangles[0]
     //        ],
     //        width : 10.0,
     //        material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
     //            color   : Cesium.Color.RED
     //        })
     //    });

     //    polyline.add({
     //        positions : [
     //            position1,
     //            rectangles[1]
     //        ],
     //        width : 10.0,
     //        material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
     //            color   : Cesium.Color.RED
     //        })
     //    });

	    // polyline.add({
     //        positions : [
     //            position2,
     //            rectangles[2]
     //        ],
     //        width : 10.0,
     //        material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
     //            color   : Cesium.Color.RED
     //        })
     //    });

     //    polyline.add({
     //        positions : [
     //            position2,
     //            rectangles[3]
     //        ],
     //        width : 10.0,
     //        material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
     //            color   : Cesium.Color.RED
     //        })
     //    });

	    var region  = new Cesium.GroundPrimitive({
	        geometryInstances : new Cesium.GeometryInstance({
	            geometry : new Cesium.PolygonGeometry({
	                polygonHierarchy : { positions : rectangles}
	            }),
	            attributes: {
	                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
	            }
	        })
	    });
	    
	    viewer.scene.groundPrimitives.add(region);

	    polygons.push(region);
	}

	var arrFlight = [
		493, 522,
		525, 553,
		557, 585,
		589, 617,
		621, 648,
		652, 680
	];

	function drawLidarInfo()
	{
		if (polyline == undefined)
		{
			polyline       = viewer.scene.primitives.add(new Cesium.PolylineCollection());
		}

		var entities = folderMapEntities.get('Features');

		for (var j = 0; j < arrFlight.length; j = j + 2)
		{
			var position1 = entities[arrFlight[j]].position._value;
			var position2 = entities[arrFlight[j + 1]].position._value;

			polyline.add({
	            positions : [
	                position1,
	                position2
	            ],
	            width : 10.0,
	            material : Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
	                color   : Cesium.Color.GREEN
	            })
	        });

	        var carto1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
	        var carto2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position2);
	        
	        var heading = getHeading(carto1, carto2) + Math.PI / 2;
	        var rectangles = [];

	        camera.position = position1;
		    camera.setView({
		        orientation: {
		            heading : heading,
		            pitch : Cesium.Math.toRadians(-90 + angle),
		            roll : 0
		        }
		    });

		    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

		    camera.position = position1;
		    camera.setView({
		        orientation: {
		            heading : heading,
		            pitch : Cesium.Math.toRadians(-90 - angle),
		            roll : 0
		        }
		    });

		    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

		    camera.position = position2;
		    camera.setView({
		        orientation: {
		            heading : heading,
		            pitch : Cesium.Math.toRadians(-90 - angle),
		            roll : 0
		        }
		    });

		    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

		    camera.position = position2;
		    camera.setView({
		        orientation: {
		            heading : heading,
		            pitch : Cesium.Math.toRadians(-90 + angle),
		            roll : 0
		        }
		    });

		    rectangles.push(getRayFocusPosition(camera.positionWC, camera.directionWC));

		    var color = Cesium.Color.MEDIUMSPRINGGREEN  ;

		    color = color.withAlpha(0.5);

		    for (var i = 0; i < rectangles.length; i ++)
		    {
		    	if (rectangles[i] == undefined) return;
		    }

		    var region = viewer.entities.add({
			    polygon : {
			        hierarchy : rectangles,
			        material : color,
			        closeTop : true,
			        closeBottom : true
			    }
			});

			drawTerrainLine(rectangles[0], rectangles[1]);
			drawTerrainLine(rectangles[1], rectangles[2]);
			drawTerrainLine(rectangles[2], rectangles[3]);
			drawTerrainLine(rectangles[3], rectangles[0]);

		    // var region  = new Cesium.GroundPrimitive({
		    //     geometryInstances : new Cesium.GeometryInstance({
		    //         geometry : new Cesium.PolygonGeometry({
		    //             polygonHierarchy : { positions : rectangles}
		    //         }),
		    //         attributes: {
		    //             color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
		    //         }
		    //     })
		    // });

		    // viewer.scene.groundPrimitives.add(region);

		    polygons.push(region);
		}
	}

	function drawTerrainLine(position1, position2)
	{
		var carto1 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
		var carto2 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(position2);
		
		var length = 1000;

		var terrainSamplePositions = [];
        for (var i = 0; i < length; ++i) {
            var lon = Cesium.Math.lerp(carto1.longitude, carto2.longitude, i / (length - 1));
            var lat = Cesium.Math.lerp(carto1.latitude, carto2.latitude, i / (length - 1));
            var position = new Cesium.Cartographic(lon, lat);
            terrainSamplePositions.push(position);
        }

        Cesium.when(Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, terrainSamplePositions), function(samples) {
            polygons.push(viewer.entities.add({
                polyline : {
                    positions : Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(samples),
                    followSurface : false,
                    width : 3,
                    material : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        outlineColor : Cesium.Color.WHITE
                    }),
                    depthFailMaterial : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        outlineColor : Cesium.Color.WHITE
                    })
                }
            }));
        });
	}
}