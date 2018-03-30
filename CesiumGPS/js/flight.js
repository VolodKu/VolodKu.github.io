var Flight 	= function() 
{
	var main	 	= this;

	var gps 		= null;
	var gpsData 	= null;
	var polylines 	= null;
	var wallEntities 	= [];
	var lineWidth	= 8.0;

	var lineColor 	= null;
	var outColor 	= null;

	main.flight_id	= 0;
	main.pathEntity = null;

	main.startTime 	= null;
	main.endTime	= null;
	main.pathVisible = true;
	main.localCzml 	= null;
	main.logName 	= "";

	var red_line 	= 0;
	var green_line 	= 0;
	var blue_line 	= 0;

	var red_out 	= 0;
	var green_out 	= 0;
	var blue_out 	= 0;

	var drawWall 	= false;

	var heights 	= [];
	main.speed 		= [];

	main.init 		= function(index, name)
	{
		gps 		= new GPS();
		main.flight_id 		= index;
		main.logName 		= name;

		red_line = Math.random();
		green_line = Math.random();
		blue_line = Math.random();

		red_out = Math.random();
		green_out = Math.random();
		blue_out = Math.random();

		lineColor 	= new Cesium.Color(red_line, green_line, blue_line, 1.0);
		outColor 	= new Cesium.Color(red_out, green_out, blue_out, 1.0);

		gps.on('data', updateGPSData);
	}

	main.reset 		= function()
	{
		polylines.removeAll();
		main.pathEntity 	= null;
	}

	function updateGPSData(parsed)
	{
		gpsData.push(parsed);
	}

	main.loadLocalFile 	= function(readData, complete)
	{
		gpsData = [];
		var readLine = readData.split("\n");

		for (var i = 0; i < readLine.length; i ++)
		{
			gps.update(readLine[i]);
		}

		if (complete != undefined)
		{
			for (var i = 0; i < gpsData.length; i ++)
			{
				if (gpsData[i].type == "GGA")
				{
					complete(gpsData[i].lon, gpsData[i].lat, gpsData[i].alt);
					break;
				}
			}
			
		}

		main.generateCZML();
	}

	main.load 			= function(url, complete)
	{
		gpsData = [];
		$.get(url, function (readData) 
		{
			var readLine = readData.split("\n");

			for (var i = 0; i < readLine.length; i ++)
			{
				gps.update(readLine[i]);
			}

			if (complete != undefined)
			{
				for (var i = 0; i < gpsData.length; i ++)
				{
					if (gpsData[i].type == "GGA")
					{
						complete(gpsData[i].lon, gpsData[i].lat, gpsData[i].alt);
						break;
					}
				}
				
			}

			main.generateCZML();
		});
	}

	main.fly 			= function(longitude, latitude, altitude)
	{
		fly({
            longitude : longitude,
            latitude  : latitude,
            altitude : altitude,
            heading : heading,
            pitch   : pitch,
            roll    : roll
        });
	}

	function getGroundHeight(position, process, index) {
	    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 11, position);

	    Cesium.when(promise, function (cartoPosition) {
	        process(cartoPosition, index);
	    });
	}

	main.getSpeedValue 	= function(time, start, end)
	{
		if (start == undefined)
		{
			return main.getSpeedValue(time, 0, main.speed.length - 1);
		}

		if (start > end) return 0;

		if (start == end && start >= 0) return main.speed[start].speed;

		var mid = Math.floor((start + end) / 2);

		if (Cesium.JulianDate.lessThan(main.speed[start].time, time) && Cesium.JulianDate.greaterThan(main.speed[mid].time, time))
		{
			return main.getSpeedValue(time, start, mid);
		}
		else if (Cesium.JulianDate.lessThan(main.speed[mid + 1].time, time) && Cesium.JulianDate.greaterThan(main.speed[end].time, time))
		{
			return main.getSpeedValue(time, mid + 1, end);
		}
		else if (Cesium.JulianDate.lessThan(main.speed[mid].time, time) && Cesium.JulianDate.greaterThan(main.speed[mid + 1].time, time))
		{
			return main.speed[mid + 1].speed;
		}
		
		if (Cesium.JulianDate.equals(main.speed[start].time, time)) return main.speed[start].speed;
		if (Cesium.JulianDate.equals(main.speed[end].time, time)) return main.speed[end].speed;
		if (Cesium.JulianDate.equals(main.speed[mid].time, time)) return main.speed[mid].speed;

		return 0;
	}

	main.drawGPSPath 	= function()
	{
		if (polylines == null)
		{
			var polyCollection = new Cesium.PolylineCollection();
			polylines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
		}

		polylines.removeAll();

		var prev = null;

		var walls = [];
		var maxHeights = [];
		var minHeights = [];

		for (var i = 0; i < gpsData.length; i ++)
		{
			if (gpsData[i].type == "RMC") 
			{
				main.speed.push({
					time : Cesium.JulianDate.fromDate(gpsData[i].time),
					speed : gpsData[i].speed
				});
			}
			if (gpsData[i].type == "GGA")
			{
				if (prev == null)
				{
					prev = gpsData[i];

					if (gpsData[i].alt > 0 && gpsData[i].alt > heights[(i - 1) / 2])
					{
						walls.push(Cesium.Cartesian3.fromDegrees(gpsData[i].lon, gpsData[i].lat));
						minHeights.push((heights[i] > 0)?heights[i]:0);
						maxHeights.push(gpsData[i].alt);
					}
				}
				else
				{
					polylines.add({
						positions : [
				            Cesium.Cartesian3.fromDegrees(prev.lon, prev.lat, prev.alt),
				            Cesium.Cartesian3.fromDegrees(gpsData[i].lon, gpsData[i].lat, gpsData[i].alt)
				        ],
				        width : lineWidth,
				        material : Cesium.Material.fromType(Cesium.Material.PolylineOutlineType, {
				        	color : lineColor,
				        	outlineWidth : 5,
            				outlineColor : outColor
				        })
					});

					if (drawWall == false)
					{
						if (gpsData[i].alt > 0 && gpsData[i].alt > heights[(i - 1) / 2])
						{
							walls.push(Cesium.Cartesian3.fromDegrees(gpsData[i].lon, gpsData[i].lat));
							minHeights.push((heights[i] > 0)?heights[i]:0);
							maxHeights.push(gpsData[i].alt);
						}
						else
						{
							if (walls.length >= 2)
							{
								wallEntities.push(viewer.entities.add({
								    wall : {
								        positions : walls,
								        maximumHeights : maxHeights,
								        minimumHeights : minHeights,
								        material : new Cesium.Color(red_line, green_line, blue_line, 0.6),
								    }
								}));
							}
							walls = [];
							minHeights = [];
							maxHeights = [];
						}	
					}
					prev = gpsData[i];
				}
			}
		}

		if (drawWall == false)
		{
			if (walls.length >= 2)
			{
				wallEntities.push(viewer.entities.add({
				    wall : {
				        positions : walls,
				        maximumHeights : maxHeights,
				        minimumHeights : minHeights,
				        material : new Cesium.Color(red_line, green_line, blue_line, 0.6),
				    }
				}));
			}
			walls = [];
			minHeights = [];
			maxHeights = [];
		}
		drawWall = true;
	}

	main.generateCZML 	= function()
	{
		var czml = JSON.parse(JSON.stringify(global_czml));
		main.localCzml = JSON.parse(JSON.stringify(headerCZML));

		main.startTime 	= gpsData[0].time;
		main.endTime 	= gpsData[gpsData.length - 2].time;

		if (minTime == null || minTime.getTime() > gpsData[0].time.getTime()) 
			minTime = gpsData[0].time;

		if (maxTime == null || maxTime.getTime() < gpsData[gpsData.length - 2].time.getTime()) 
			maxTime = gpsData[gpsData.length - 2].time;

		allCZML[0].clock.currentTime = minTime.toISOString();
		allCZML[0].clock.interval = minTime.toISOString() + "/" + maxTime.toISOString();
		main.localCzml[0].clock.currentTime = minTime.toISOString();
		main.localCzml[0].clock.interval = minTime.toISOString() + "/" + maxTime.toISOString();

		czml.availability = gpsData[0].time.toISOString() + "/" + gpsData[gpsData.length - 2].time.toISOString();
		czml.position.epoch = gpsData[0].time.toISOString();

		czml.path.material.polylineOutline.color.rgba[0] = lineColor.red * 255;
		czml.path.material.polylineOutline.color.rgba[1] = lineColor.green * 255;
		czml.path.material.polylineOutline.color.rgba[2] = lineColor.blue * 255;

		czml.path.material.polylineOutline.outlineColor.rgba[0] = outColor.red * 255;
		czml.path.material.polylineOutline.outlineColor.rgba[1] = outColor.green * 255;
		czml.path.material.polylineOutline.outlineColor.rgba[2] = outColor.blue * 255;

		czml.id = "path_" + main.flight_id;

		var prev = -1;

		var pos = [];

		for (var i = 0; i < gpsData.length; i ++)
		{
			if (gpsData[i].type == "GGA")
			{
				if (prev == -1)
				{
					prev = gpsData[i - 1].time.getTime();

					czml.position.cartographicDegrees.push(0);
					czml.position.cartographicDegrees.push(gpsData[i].lon);
					czml.position.cartographicDegrees.push(gpsData[i].lat);
					czml.position.cartographicDegrees.push(gpsData[i].alt);
				}
				else
				{
					var diffTime = (gpsData[i - 1].time.getTime() - prev) / 1000;

					czml.position.cartographicDegrees.push(diffTime);
					czml.position.cartographicDegrees.push(gpsData[i].lon);
					czml.position.cartographicDegrees.push(gpsData[i].lat);
					czml.position.cartographicDegrees.push(gpsData[i].alt);
				}

				heights.push(0);
				pos.push(Cesium.Cartographic.fromDegrees(gpsData[i].lon, gpsData[i].lat));
			}
		}

		main.drawGPSPath();	

		allCZML.push(czml);
		main.localCzml.push(czml);
	}

	main.showPath 		= function(visible)
	{
		main.pathVisible = visible;
		if (visible)
		{
			main.drawGPSPath();
			if (drawWall == true)
			{
				for (var i = 0; i < wallEntities.length; i ++)
				{
					wallEntities[i].show = true;
				}	
			}
		}
		else
		{
			polylines.removeAll();
			for (var i = 0; i < wallEntities.length; i ++)
			{
				wallEntities[i].show = false;
			}
		}
	}
}