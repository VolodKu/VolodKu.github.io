
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
	        		heading: heading, 
	        		pitch: pitch, 
	        		range: 1000 
	        	} 
	        }).then (function () 
	        {
	        	main.processEntities();
	        	$('#title').text(dataSource._name);
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
		
		var index = 1;
		for ([key, value] of folderMapEntities)
		{
			main.addToggleUI(document.getElementById('toolbox'), 'toolbox_' + index, key, index);
			index ++;
			for (var i = 0; i < value.length; i ++)
			{
				entity = value[i];
				cartographicPosition 	= Cesium.Ellipsoid.WGS84.cartesianToCartographic(entity.position._value);
				entity.position._value = Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, cartographicPosition.height - height);
			}
		}

		$('#toolbox').fadeIn(500);
		$('#screenoverlay').fadeIn(500);
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
}