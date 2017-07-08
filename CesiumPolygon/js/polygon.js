
var Polygon 	= function()
{
	var main 		= this;
	main.viewer 	= null;
	main.highlightId = "";
	main.changeIndex = -1;

	
	main.polygon 	= null;
	main.polylines 	= null;
	main.levelPoly 	= [];

	//Polygon infos
	main.points 	= [];
	main.height 	= 0;
	main.color 		= 0xCE2533;
	main.opacity 	= 0.01;
	main.textPoints = [];

	main.baseHeight = 0;
	main.ceilHeight = 0;
	main.levelCount = 0;

	var orgColor, highlightColor, currentColor, outlineColor;
	var limitDistance 	= 10;

	var firstPoint 	= null;
	var fontSize 	= '30px sans-serif';
	var pointSize 	= 20;

	main.init 			= function(viewer)
	{
		main.viewer 	= viewer;

		var rgb 	= main.color;

		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;
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


	//reset All Polygon info
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

		for (var i = 0; i < main.levelPoly.length; i ++)
		{
			main.viewer.scene.primitives.remove(main.levelPoly[i]);
		}

		for (var i = 0; i < main.textPoints.length; i ++)
		{
			main.viewer.entities.remove(main.textPoints[i]);
		}

		main.textPoints = [];

		main.levelPoly 	= [];

		main.height 	= 0;
		main.ceilHeight = 0;
		main.baseHeight = 0;
		main.points 	= [];
		main.highlightId = "";
		main.levelCount = 0;
	}


	//drawing Polygon outline
	main.drawOutLine 		= function()
	{
		if (main.polylines == null)
		{
			main.polylines = main.viewer.scene.primitives.add(new Cesium.PolylineCollection());
		}
		if (firstPoint != null)
		{
			main.viewer.entities.remove(firstPoint);
			firstPoint = null;
		}
		
		main.polylines.removeAll();

		if (main.points.length == 2)
		{
			firstPoint 	= main.viewer.entities.add({
				id 	: "first",
	            position: Cesium.Cartesian3.fromRadians(main.points[0], main.points[1]),
	            point: {
	                pixelSize: 10,
	                color: outlineColor
	            }
	        })
		}

		for (var index = 1; index < main.points.length / 2; index ++)
		{
			main.polylines.add({
				positions : [
		            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1]),
		            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1])
		        ],
		        width : 3.0,
		        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
		        	color : outlineColor
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
			        	color : outlineColor
			        })
				});	
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1]),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
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
		        	color : outlineColor
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
			        	color : outlineColor
			        })
				});
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1]),
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.height)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});	
			}
		}
		main.drawLevelOutLine();
	}

	//drawing Level OutLine
	main.drawLevelOutLine 	= function()
	{
		for (var index = 1; index < main.points.length / 2; index ++)
		{
			if (main.baseHeight > 0)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1], main.baseHeight),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.baseHeight)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}
			if (main.ceilHeight < main.height && main.ceilHeight > main.baseHeight)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1], main.ceilHeight),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.ceilHeight)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}

			for (var i = 1; i < main.levelCount; i ++)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[2 * index - 2], main.points[2 * index - 1], main.baseHeight + i * (main.ceilHeight - main.baseHeight) / main.levelCount),
			            Cesium.Cartesian3.fromRadians(main.points[2 * index], main.points[2 * index + 1], main.baseHeight + i * (main.ceilHeight - main.baseHeight) / main.levelCount)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}
		}

		if (main.points.length > 4)
		{
			if (main.baseHeight > 0)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[main.points.length - 2], main.points[main.points.length - 1], main.baseHeight),
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.baseHeight)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}
			if (main.ceilHeight < main.height && main.ceilHeight > main.baseHeight)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[main.points.length - 2], main.points[main.points.length - 1], main.ceilHeight),
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.ceilHeight)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}

			for (var i = 1; i < main.levelCount; i ++)
			{
				main.polylines.add({
					positions : [
			            Cesium.Cartesian3.fromRadians(main.points[main.points.length - 2], main.points[main.points.length - 1], main.baseHeight + i * (main.ceilHeight - main.baseHeight) / main.levelCount),
			            Cesium.Cartesian3.fromRadians(main.points[0], main.points[1], main.baseHeight + i * (main.ceilHeight - main.baseHeight) / main.levelCount)
			        ],
			        width : 3.0,
			        material : Cesium.Material.fromType(Cesium.Material.ColorType, {
			        	color : outlineColor
			        })
				});
			}
			
		}
	}

	//add Polygon points
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

	main.setHighLightColor 		= function(highlight)
	{
		highlightColor 	= highlight;
	}

	//drawing main polygon and level polygon function
	main.setPolygon 	= function(color)
	{
		if (main.levelCount == 0)
		{
			if (main.polygon != null)
			{
				main.viewer.scene.primitives.remove(main.polygon);
				main.polygon = null;
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
		else
		{
			if (main.polygon != null)
			{
				main.viewer.scene.primitives.remove(main.polygon);
				main.polygon = null;
			}

			for (var i = 0; i < main.levelPoly.length; i ++)
			{
				main.viewer.scene.primitives.remove(main.levelPoly[i]);
			}

			main.levelPoly 	= [];
			var diffHeight 	= (main.ceilHeight - main.baseHeight) / main.levelCount;

			for (var i = 0; i < main.levelCount; i ++)
			{
				var instance 	= new Cesium.GeometryInstance({
				    geometry : Cesium.PolygonGeometry.fromPositions({
				        positions : Cesium.Cartesian3.fromRadiansArray(main.points),
				        height : main.baseHeight + diffHeight * i,
				        extrudedHeight: main.baseHeight + diffHeight * i + diffHeight,
				        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
				    }),
				    attributes: {
				        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
				    },
				    id: 'polygon_' + i
				});

				main.levelPoly.push(new Cesium.Primitive({
				    geometryInstances : [instance],
				    appearance : new Cesium.PerInstanceColorAppearance({
				        closed : true,
				        translucent : true
				    })
				}));

				main.viewer.scene.primitives.add(main.levelPoly[main.levelPoly.length - 1]);	
				
			}
		}
	}

	//highlight set
	main.setHighLight 		= function(visible, instanceId)
	{
		if (main.highlightId == "polygon")
		{
			if (editMode == 3)
			{
				main.polygon.appearance = new Cesium.PerInstanceColorAppearance({
			        closed : true,
			        translucent : true
			    });	
			}

			var attributes = main.polygon.getGeometryInstanceAttributes(main.highlightId);	
			attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(orgColor);
			currentColor 	= orgColor;
		}
		else
		{
			var index = parseInt(main.highlightId.replace("polygon_", ""));

			if (!isNaN(index))
			{
				if (editMode == 3)
				{
					main.levelPoly[index].appearance = new Cesium.PerInstanceColorAppearance({
				        closed : true,
				        translucent : true
				    });	
				}

				var attributes = main.levelPoly[index].getGeometryInstanceAttributes(main.highlightId);
				attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(orgColor);
			}
		}

		main.highlightId = "";

		if (visible == true)
		{

			if (instanceId == "polygon")
			{
				if (editMode == 3)
				{
					main.polygon.appearance = new Cesium.PerInstanceColorAppearance({
				        closed : true,
				        translucent : false
				    });	
				}

				var attributes = main.polygon.getGeometryInstanceAttributes(instanceId);
	    		attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(highlightColor);
	    		currentColor 	= highlightColor;
			}
			else
			{
				var index = parseInt(instanceId.replace("polygon_", ""));
				if (!isNaN(index))
				{
					if (editMode == 3)
					{
						main.levelPoly[index].appearance = new Cesium.PerInstanceColorAppearance({
					        closed : true,
					        translucent : false
					    });	
					}
					var attributes = main.levelPoly[index].getGeometryInstanceAttributes(instanceId);
					attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(highlightColor);
				}
			}
			main.highlightId = instanceId;
		}
	}

	//change height of main polygon by mouse move
	main.changeHeight 	= function(distance)
	{
		var height 	= main.height + distance;
		if (height < 0) height = 0;

		$('#height_value').val(height);

		main.setHeight(height);
	}

	//set Hightligh set
	main.setHeight 		= function(height)
	{
		if (height < 0) height = 0;

		main.height 	= height;
		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//set Polygon color
	main.setColor 		= function(color)
	{
		main.color 	= color;

		var rgb 	= main.color;
		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;

		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//set Polygon Opacity
	main.setOpacity		= function(opacity)
	{
		main.opacity 	= opacity;

		var rgb 	= main.color;

		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;	
		
		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//save main polygon
	main.savePolygon 	= function()
	{
		var arr 	= new Array();
		arr["locations"] = main.points;
		arr["height"] 	= main.height;
		arr["color"] = main.color;
		arr["opacity"] = main.opacity;

		var json 	= JSON.stringify(Object.assign({}, arr));
		return json;
	}

	//load main polygon
	main.loadPolygon 	= function(json)
	{
		main.reset();
		var points 	= json['locations'];
		for (var i = 0; i < points.length; i ++)
		{
			main.points.push(points[i]);
		}
		main.height 	= json['height'];
		main.color 		= json['color'];
		main.opacity 	= json['opacity'];

		var rgb 	= main.color;

		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;

		main.drawOutLine();
		main.setPolygon(currentColor);

	}

	//set BaseHeight
	main.setBaseHeight		= function(baseHeight)
	{
		main.baseHeight = baseHeight;

		if (main.ceilHeight < main.baseHeight) main.ceilHeight = main.height;

		if (main.levelCount == 0) main.levelCount = 1;

		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//set Ceiling Height
	main.setCeilHeight		= function(ceilHeight)
	{
		main.ceilHeight = ceilHeight

		if (main.ceilHeight < main.baseHeight) main.ceilHeight = main.height;
		if (main.levelCount == 0) main.levelCount = 1;
		
		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//set Level Count set
	main.setLevelCount 		= function(levelCount)
	{
		main.levelCount = levelCount;

		main.drawOutLine();
		main.setPolygon(currentColor);	
	}

	//save levelpolygons
	main.saveLevelPolygon 	= function()
	{
		var arr 	= new Array();
		arr["locations"] = main.points;
		arr["height"] 	= main.height;
		arr["color"] = main.color;
		arr["opacity"] = main.opacity;
		arr["baseHeight"] = main.baseHeight;
		arr["ceilHeight"] = main.ceilHeight;
		arr["levelCount"] = main.levelCount;

		var json 	= JSON.stringify(Object.assign({}, arr));
		return json;
	}

	//load level polygons
	main.loadLevelPolygon 	= function(json)
	{
		main.reset();
		var points 	= json['locations'];
		for (var i = 0; i < points.length; i ++)
		{
			main.points.push(points[i]);
		}
		main.height 	= json['height'];
		main.color 		= json['color'];
		main.opacity 	= json['opacity'];
		main.baseHeight = json['baseHeight'];
		main.ceilHeight = json['ceilHeight'];
		main.levelCount = json['levelCount'];

		var rgb 	= main.color;

		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;

		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//reset Level polygons
	main.resetLevel		= function()
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

		for (var i = 0; i < main.levelPoly.length; i ++)
		{
			main.viewer.scene.primitives.remove(main.levelPoly[i]);
		}

		for (var i = 0; i < main.textPoints.length; i ++)
		{
			main.viewer.entities.remove(main.textPoints[i]);
		}

		main.textPoints = [];
		main.levelPoly 	= [];

		main.ceilHeight = main.height;
		main.baseHeight = 0;
		main.levelCount = 0;
		main.highlightId = "";

		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	//get Pick Surface Position
	main.getPickSurfacePosition 	= function(click)
	{
		var pickedFeature = viewer.scene.pick(click.position);

        if (pickedFeature != undefined)
        {
            if (pickedFeature.id != undefined && pickedFeature.id.includes("polygon"))
            {
                var pickedPosition = main.viewer.scene.pickPosition(click.position);
                
                return {
                	"role" : "add",

                };
            }
        }	
	}

	//add Annotation point
	main.addTextPoint		= function(pickPosition, clickPosition)
	{
		main.textPoints.push(main.viewer.entities.add({
			id 	: "point_" + main.textPoints.length,
            position: pickPosition,
            point: {
                pixelSize: pointSize,
                color: Cesium.Color.YELLOW
            },
            label: {
                text: "",
                fillColor : Cesium.Color.RED,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                font : fontSize,
                show : false
            }
        }));

		main.changeIndex = main.textPoints.length - 1;

		main.setHighLight(false);

		$('#text_create').css('left', clickPosition.x - 80);
		$('#text_create').css('top', clickPosition.y - 85);
        $('#text_create').show();
	}

	//show Annotation point text
	main.showUpdateText 	= function(id, clickPosition)
	{
		main.changeIndex = -1;
		for (var i = 0; i < main.textPoints.length; i ++)
		{
			if (main.textPoints[i].id == id) 
			{
				main.changeIndex = i;
				break;
			}
		}

		if (main.changeIndex == -1) return;
		
		$('#text_change').css('left', clickPosition.x - 80);
		$('#text_change').css('top', clickPosition.y - 85);
		$('#text_value').val(main.textPoints[main.changeIndex]._label._text._value);
		$('#text_change').show();
	}

	//update Annotation point text
	main.updateText 		= function(index, text)
	{
		main.textPoints[index]._label._text._value = text;
	}

	var visibleIndex 		= -1;

	main.showPointText 		= function(id, visible)
	{
		var index = -1;

		if (visibleIndex != -1)
		{
			main.textPoints[visibleIndex]._label.show = false;
			visibleIndex 	= -1;
		}

		for (var i = 0; i < main.textPoints.length; i ++)
		{
			if (main.textPoints[i].id == id) 
			{
				index = i;
				break;
			}
		}

		if (index != -1)
		{
			main.textPoints[index]._label.show = visible;
			if (visible == true)
			{
				visibleIndex = index;
			}
		}
	}

	//remove points
	main.removePoint 		= function(id)
	{
		var index = -1;
		for (var i = 0; i < main.textPoints.length; i ++)
		{
			if (main.textPoints[i].id == id) 
			{
				index = i;
				break;
			}
		}

		if (index != -1)
		{
			main.viewer.entities.remove(main.textPoints[index]);
			main.textPoints.splice(index, 1);
			main.changeIndex = -1;
			$('#text_change').hide();
		}
	}

	//save pointPolygons
	main.savePointPolygon 	= function()
	{
		var arr 	= new Array();
		arr["locations"] = main.points;
		arr["height"] 	= main.height;
		arr["color"] = main.color;
		arr["opacity"] = main.opacity;
		arr["baseHeight"] = main.baseHeight;
		arr["ceilHeight"] = main.ceilHeight;
		arr["levelCount"] = main.levelCount;

		var pointList 	= new Array();
		for (var i = 0; i < main.textPoints.length; i ++)
		{
			var onePoint = new Array();
			onePoint['x'] = main.textPoints[i].position._value.x;
			onePoint['y'] = main.textPoints[i].position._value.y;
			onePoint['z'] = main.textPoints[i].position._value.z;
			onePoint['text'] = main.textPoints[i]._label._text._value;
			pointList.push(JSON.stringify(Object.assign({}, onePoint)));
		}
		arr["points"] = JSON.stringify(Object.assign({}, pointList));

		var json 	= JSON.stringify(Object.assign({}, arr));
		return json;
	}

	//load PoingPolygons
	main.loadPointPolygon 	= function(json)
	{
		main.reset();
		var points 	= json['locations'];
		for (var i = 0; i < points.length; i ++)
		{
			main.points.push(points[i]);
		}
		main.height 	= json['height'];
		main.color 		= json['color'];
		main.opacity 	= json['opacity'];
		main.baseHeight = json['baseHeight'];
		main.ceilHeight = json['ceilHeight'];
		main.levelCount = json['levelCount'];

		var pointList 	= json['points'];
		for (var i = 0; i < main.pointList; i ++)
		{
			main.addTextPointByLocation(i, pointList[i]['x'], pointList[i]['y'], 
				pointList[i]['z'], pointList[i]['text']);
		}

		var rgb 	= main.color;

		orgColor 	= Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), Math.floor(main.opacity * 0xFF));
		outlineColor = Cesium.Color.fromBytes(Math.floor(rgb / 0x10000), Math.floor((rgb % 0x10000) / 0x100), Math.floor((rgb % 0x10000) % 0x100), 0xFF);
		currentColor = orgColor;

		main.drawOutLine();
		main.setPolygon(currentColor);
	}

	main.addTextPointByLocation	= function(index, x, y, z, text)
	{
		main.textPoints.push(main.viewer.entities.add({
			id 	: 'point_' + index,
            position: Cesium.Cartesian3(x, y, z),
            point: {
                pixelSize: 20,
                material: Cesium.Color.TRANSPARENT,
                outlineColor: Cesium.Color.YELLOW,
            },
            label: {
                text: text,
                fillColor : Cesium.Color.RED,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
            }
        }));
	}
}