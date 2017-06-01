
var Polygon 	= function()
{
	var main 		= this;
	main.viewer 	= null;
	main.points 	= [];
	main.height 	= 0;

	main.polygon 	= null;
	main.polylines 	= null;
	main.isHighLight 		= false;

	var orgColor, highlightColor, currentColor;
	var limitDistance 	= 10;

	main.init 			= function(viewer)
	{
		main.viewer 	= viewer;
	}

	main.pickPosition 	= function(click)
	{
	    var position = main.viewer.camera.pickEllipsoid(click.position);

	    var cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

	    return cartographicPosition;
	}

	main.getCartesian3 	= function(poistion)
	{
		position 	= Cesium.Cartesian3.fromRadians(poistion.longitude, poistion.latitude);
	    return position;
	}

	main.reset 				= function()
	{
		if (main.polygon != undefined)
		{
			main.viewer.scene.primitives.remove(main.polygon);
			main.polygon 	= null;
		}
		if (main.polylines != undefined)
		{
			main.viewer.scene.primitives.remove(main.polylines);
			main.polylines 	= null;
		}
		main.isHighLight 	= false;
		main.height 	= 0;
		main.points 	= [];
	}

	main.drawOutLine 		= function()
	{
		if (main.polylines == null)
		{
			main.polylines = main.viewer.scene.primitives.add(new Cesium.PolylineCollection());
		}

		main.polylines.removeAll();

		for (var index = 1; index < main.points.length / 2; index ++)
		{
			main.polylines.add({
				positions : [
		            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1]),
		            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1])
		        ],
		        width : 3.0,
		        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
		        	color : Cesium.Color.RED
		        })
			});	

			if (main.height != 0)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1], main.height),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : Cesium.Color.RED
			        })
				});	
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1]),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : Cesium.Color.RED
			        })
				});	
			}
		}

		if (main.points.length > 4)
		{
			main.polylines.add({
				positions : [
		            Cesium.Cartesian3.fromRadians(main.points[main.points.length - 2], main.points[main.points.length - 1]),
		            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1])
		        ],
		        width : 3.0,
		        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
		        	color : Cesium.Color.RED
		        })
			});

			if (main.height != 0)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[main.points.length - 2], main.points[main.points.length - 1], main.height),
		           		 Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : Cesium.Color.RED
			        })
				});
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1]),
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : Cesium.Color.RED
			        })
				});	
			}
		}
	}

	main.addPoint 		= function(point)
	{
		main.points.push(point.longitude);
		main.points.push(point.latitude);

		main.drawOutLine();

		if (main.points.length > 4)
		{
			main.setPolygon(orgColor);
		}
	}

	main.setHighLightColor 		= function(org, highlight)
	{
		orgColor 		= org;
		highlightColor 	= highlight;
	}

	main.setPolygon 	= function(color)
	{
		if (main.polygon != null)
		{
			main.viewer.scene.primitives.remove(main.polygon);
		}

		var instance 	= new Cesium.GeometryInstance({
		    geometry : Cesium.PolygonGeometry.fromPositions({
		        positions : Cesium.Cartesian3.fromRadiansArray(main.points),
		        height : 0,
		        extrudedHeight: main.height,
		        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
		    }),
		    attributes: {
		        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
		    },
		    id: 'polygon'
		});

		main.polygon 	= new Cesium.Primitive({
		    geometryInstances : [instance],
		    appearance : new Cesium.PerInstanceColorAppearance({
		        closed : true,
		        translucent : true
		    })
		});
		main.viewer.scene.primitives.add(main.polygon);
		
	}

	main.setHightLight 		= function(visible)
	{
		if (main.polygon == undefined) return;

		if (visible == true && main.isHighLight == false)
		{
			var attributes = main.polygon.getGeometryInstanceAttributes('polygon');
    		attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(highlightColor);
    		currentColor 	= highlightColor;

			main.isHighLight = true;
		}
		else if (visible == false && main.isHighLight == true)
		{
			var attributes = main.polygon.getGeometryInstanceAttributes('polygon');
    		attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(orgColor);
    		currentColor 	= orgColor;

			main.isHighLight = false;
		}
	}

	main.changeHeight 	= function(distance)
	{
		var height 	= main.height + distance;
		if (height < 0) height = 0;

		$('#height_value').val(height);

		main.setHeight(height);
	}

	main.setHeight 		= function(height)
	{
		if (height < 0) height = 0;

		main.height 	= height;
		main.drawOutLine();
		main.setPolygon(currentColor);
	}
}