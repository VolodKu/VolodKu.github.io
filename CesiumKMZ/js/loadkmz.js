
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
	        	viewer.clock.multiplier = 250;
                viewer.clock.shouldAnimate = true;
	        });
	    });
	}
}