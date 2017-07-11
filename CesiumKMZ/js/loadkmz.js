
var KMZLoader 	= function()
{
	var main 		= this;
	main.options 	= null;
	

	main.init 			= function(viewer)
	{
		main.options = {
		    camera : viewer.scene.camera,
		    canvas : viewer.scene.canvas
		};
	}

	main.loadKMZ 		= function(path)
	{
		var dataSource  = new Cesium.KmlDataSource(main.options);

	    dataSource.load(path);
	    // dataSource._clampToGround = true;
	    viewer.clock.shouldAnimate = false;
	    viewer.dataSources.add(dataSource).then(function(dataSource) 
	    {
	        viewer.flyTo(dataSource, { 
	        	duration: 4.0, 
	        	offset: { 
	        		heading: 0, 
	        		pitch: Cesium.Math.toRadians(-90), 
	        		range: 2000 
	        	} 
	        }).then (function () 
	        {
	        	main.processEntities();
	        	viewer.clock.multiplier = 250;
                viewer.clock.shouldAnimate = true;
	        });
	    });
	}

	main.processEntities	= function()
	{
		var entity 	= folderMapEntities.get("Base Stations");
		var cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(entity[0].position._value);
		var height = cartographicPosition.height;
		
		for ([key, value] of folderMapEntities)
		{
			for (var i = 0; i < value.length; i ++)
			{
				entity = value[i];
				cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(entity.position._value);
				entity.position._value = Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, cartographicPosition.height - height);
			}
		}
	}
}