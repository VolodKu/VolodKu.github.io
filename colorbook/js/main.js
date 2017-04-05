/* -----------------------------------------------------
*
*   Author 	    : USLEE
*   Created     : 2016/11/07
*   Description : Main Java Script
*
--------------------------------------------------------*/
$(document).ready(function()
{
	var classMain 	= new main();
});

var main 	= function()
{
	var main 	     	  = this;
	main.canvas			  = null;
	main.context		  = null;
	main.tool  			  = null;
	main.color  		  = null;
	main.mousepressed	  = false;
	main.lastpt			  = null;	
	main.curColor 		  = null;
	main.colorLayerData   = null;
	main.outlineLayerData = null;
	main.outlineImage 	  = null;
	main.pencilBrushImage = null;
	main.starBrushIamge   = null;

	main.clickX = new Array();
	main.clickY = new Array();
	main.clickColor = new Array();
	main.clickTool = new Array();
	main.clickSize = new Array();
	main.clickDrag = new Array();

	main.init	= function()
	{
		main.canvas			= document.getElementById("canvas");
		main.context		= main.canvas.getContext("2d");
		main.canvas.width   = $('#canvas').width();
		main.canvas.height  = $('#canvas').height();

		
		main.color  		= {
								r: 203,
								g: 53,
								b: 148
		 					  };

		main.outlineImage 	= new Image();

		main.outlineImage.onload  = function(evt)
		{
			main.context.drawImage(main.outlineImage, 0,0, main.canvas.width, main.canvas.height);
			main.outlineLayerData = main.context.getImageData(0, 0, main.canvas.width, main.canvas.height);
			
			main.clearCanvas();
			//main.context.putImageData(main.outlineLayerData, 0, 0);						
			main.colorLayerData = main.context.getImageData(0, 0, main.canvas.width, main.canvas.height);
			main.redraw();
		}
	
		main.outlineImage.src 	= "img/work_window_smart_object1.png";


		main.event();
		
	}

	main.clearCanvas = function () 
	{
		main.context.clearRect(0, 0, main.context.canvas.width, main.context.canvas.height);
	}

	//private
	componentToHex = function(c) 
	{
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	rgbToHex = function(r, g, b) 
	{
	    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	main.getMousePos = function(evt) 
	{
	  var rect 	 = main.canvas.getBoundingClientRect(), 
	      scaleX = main.canvas.width / rect.width,    
	      scaleY = main.canvas.height / rect.height;

	  return {
	    x: (evt.clientX - rect.left) * scaleX,   
	    y: (evt.clientY - rect.top) * scaleY     
	  }
	}

	main.event = function()
	{		

		$("#pencil").mousedown(function(evt)
		{			
			main.mousepressed = false;
        	main.tool		  = "pencil";
        	

		});
		$("#star").mousedown(function(evt)
		{			
			main.mousepressed = false;
        	main.tool		  = "star";
        	

		});

		$("#color_box").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.tool		  = "color_box";
		});

		$("#eraser").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.tool		  = "eraser";
        	
		});


		$("#blue_button").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 0,
									g: 0,
									b: 255
								};
		});
		$("#rgb_255_0_255").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 255,
									g: 0,
									b: 255
								};
		});		
		$("#green").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 0,
									g: 255,
									b: 0
								};
		});		
		$("#rgb_30_163_57").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 30,
									g: 163,
									b: 57
								};
		});		
		$("#rgb_0_150_100").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 0,
									g: 150,
									b: 100
								};
		});		
		$("#rgb_30_106_203").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 30,
									g: 106,
									b: 203
								};
		});	
		$("#rgb_100_150_200").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 100,
									g: 150,
									b: 200
								};
		});		
		$("#white").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 255,
									g: 255,
									b: 255
								};
		});		
		$("#rgb_100_50_200").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 100,
									g: 50,
									b: 200
								};
		});			
		$("#rgb_214_114_41").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 214,
									g: 114,
									b: 41
								};
		});		
		$("#yellow").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 255,
									g: 255,
									b: 0
								};
		});	
		$("#red").mousedown(function(evt)
		{
			main.mousepressed = false;
        	main.color 		  =
	        					{
									r: 255,
									g: 0,
									b: 0
								};
		});			
		
		$("#canvas").mousedown(function(evt)
		{			
			main.mousepressed = true;
        	main.lastpt 	  = main.getMousePos(evt);
			if (main.tool == "color_box")
			{				
				main.paintAt(main.lastpt.x, main.lastpt.y);
			}
			else if(main.tool == "pencil")
			{
				var mouseX = main.lastpt.x;
				var mouseY = main.lastpt.y;				
				main.addClick(mouseX, mouseY, false);
				main.redraw();
			}
			else if(main.tool == "star")
			{
				var mouseX = main.lastpt.x;
				var mouseY = main.lastpt.y;				
				main.addClick(mouseX, mouseY, false);
				main.redraw();
			}
			else if(main.tool == "eraser")
			{
				var mouseX = main.lastpt.x;
				var mouseY = main.lastpt.y;				
				main.addClick(mouseX, mouseY, false);
				main.redraw();
			}					 
		});

		$("#canvas").mousemove(function(evt)
		{		
			main.lastpt 	  = main.getMousePos(evt);	
			if (main.mousepressed && main.tool=="pencil")
			{				
				main.addClick(main.lastpt.x, main.lastpt.y, true);
				main.redraw();
			}
			else if (main.mousepressed && main.tool=="star")
			{				
				main.addClick(main.lastpt.x, main.lastpt.y, true);
				main.redraw();
			}
			else if (main.mousepressed && main.tool=="eraser")
			{				
				main.addClick(main.lastpt.x, main.lastpt.y, true);
				main.redraw();
			}				

		});


		$("#canvas").mouseup(function(evt)
		{
			main.mousepressed = false;
			main.redraw();
			main.clickX = new Array();
			main.clickY = new Array();
		});

	}
	main.addClick = function(x, y, dragging)
	{

		main.clickX.push(x);
		main.clickY.push(y);
		main.clickTool.push(main.tool);
		main.clickColor.push("#ff0000");
		main.clickSize.push("30");
		main.clickDrag.push(dragging);
	}

	main.matchOutlineColor = function (r, g, b, a) 
	{			
		return (r+g+b!=0 && a!=255 );
	}

	main.matchStartColor = function (pixelPos, startR, startG, startB) 
	{
		var r = main.outlineLayerData.data[pixelPos],
			g = main.outlineLayerData.data[pixelPos + 1],
			b = main.outlineLayerData.data[pixelPos + 2],
			a = main.outlineLayerData.data[pixelPos + 3];
	
		// If current pixel of the outline image is black
		if (main.matchOutlineColor(r, g, b, a)) 
		{
			if(r+g+b>90)
				{
					return false;
				}

		}

		r = main.colorLayerData.data[pixelPos];
		g = main.colorLayerData.data[pixelPos + 1];
		b = main.colorLayerData.data[pixelPos + 2];

		// If the current pixel matches the clicked color
		if (r === startR && g === startG && b === startB) 
		{
			return true;
		}

		// If current pixel matches the new color
		if (r === main.color.r && g === main.color.g && b === main.color.b) 
		{
			return false;
		}

		return true;
	}

	main.colorPixel = function (pixelPos, r, g, b, a) 
	{
		var colorLayerData = main.colorLayerData;
		colorLayerData.data[pixelPos]     = r;
		colorLayerData.data[pixelPos + 1] = g;
		colorLayerData.data[pixelPos + 2] = b;
		colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
	}

	main.floodFill = function (startX, startY, startR, startG, startB) 
	{

		var newPos,
			x,
			y,
			pixelPos,
			reachLeft,
			reachRight,
			curColor				= main.color,
			canvasWidth				= main.canvas.width,
			drawingBoundLeft 		= 0,
			drawingBoundTop 		= 0,
			drawingBoundRight 		= main.canvas.width - 1,
			drawingBoundBottom 		= main.canvas.height - 1,
			pixelStack 				= [[startX, startY]];
			
		while (pixelStack.length) 
		{

			newPos = pixelStack.pop();

			x = newPos[0];
			y = newPos[1];

			pixelPos = (y * canvasWidth + x) * 4;

			while (y >= drawingBoundTop && main.matchStartColor(pixelPos, startR, startG, startB)) 
			{
				y -= 1;
				pixelPos -= canvasWidth * 4;

			}

			pixelPos += canvasWidth * 4;
			y += 1;
			reachLeft  = false;
			reachRight = false;

			while (y <= drawingBoundBottom && main.matchStartColor(pixelPos, startR, startG, startB)) 
			{
				y += 1;

				main.colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);

				if (x > drawingBoundLeft) {
					if (main.matchStartColor(pixelPos - 4, startR, startG, startB)) 
					{
						if (!reachLeft) 
						{
							// Add pixel to stack
							pixelStack.push([x - 1, y]);
							reachLeft = true;
						}
					} else if (reachLeft) 
					{
						reachLeft = false;
					}
				}

				if (x < drawingBoundRight) {
					if (main.matchStartColor(pixelPos + 4, startR, startG, startB)) 
					{
						if (!reachRight) 
						{
							pixelStack.push([x + 1, y]);
							reachRight = true;
						}
					} else if (reachRight) 
					{
						reachRight = false;
					}
				}

				pixelPos += canvasWidth * 4;
			}
		}
	}

	main.redraw = function () 
	{
		main.clearCanvas();
		var locX;
		var locY;

		main.context.putImageData(main.colorLayerData, 0, 0);
		if(main.tool == "color_box")
		{
			
		}
		else if(main.tool == "pencil")
		{

            var i = 0;            
            for(; i < main.clickX.length; i++)
            {          
                var img=document.createElement('img');				
				img.src = "img/pen_brush.png";
					
				var canvas = document.createElement("canvas");
			    canvas.width = img.width;
			    canvas.height = img.height;

			    var ctx = canvas.getContext("2d");
			    ctx.drawImage(img,0,0);

			    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

			    var data = imageData.data;

			    // convert image to grayscale			    

			    for(var p = 0, len = data.length; p < len; p+=4) {
			        if(data[p+3] == 0)
			           continue;
			        data[p + 0] = main.color.r;
			        data[p + 1] = main.color.g;
			        data[p + 2] = main.color.b;
			        data[p + 3] = 255;
			    }
			    ctx.putImageData(imageData, 0, 0);

			    // replace image source with canvas data
			    img.src = canvas.toDataURL();	
							
				main.context.drawImage(img,main.clickX[i],main.clickY[i],30,30);
							   
			}
            
            main.colorLayerData = main.context.getImageData(0, 0, main.canvas.width, main.canvas.height);
		}
		else if(main.tool == "star")
		{			
            var i = 0;            
            for(; i < main.clickX.length; i++)
            {          
                var img=document.createElement('img');				
                var tmp=1;
				img.src = "img/star_brush.png";
				
				var canvas = document.createElement("canvas");
			    canvas.width = img.width;
			    canvas.height = img.height;

			    var ctx = canvas.getContext("2d");
			    ctx.drawImage(img,0,0);

			    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

			    var data = imageData.data;

			    // convert image to grayscale			    

			    for(var p = 0, len = data.length; p < len; p+=4) {
			        if(data[p+3] == 0)
			           continue;
			        data[p + 0] = main.color.r;
			        data[p + 1] = main.color.g;
			        data[p + 2] = main.color.b;
			        data[p + 3] = 255;
			    }
			    ctx.putImageData(imageData, 0, 0);

			    // replace image source with canvas data
			    img.src = canvas.toDataURL();	
				main.context.drawImage(img,main.clickX[i],main.clickY[i],50,50);
				while(tmp+i<main.clickX.length &&
					(main.clickX[i]-main.clickX[i+tmp])*(main.clickX[i]-main.clickX[i+tmp])
					+(main.clickY[i]-main.clickY[i+tmp])*(main.clickY[i]-main.clickY[i+tmp])<1500)
				{
					console.log((main.clickX[i]-main.clickX[i+tmp])*(main.clickX[i]-main.clickX[i+tmp])
					+(main.clickY[i]-main.clickY[i+tmp])*(main.clickY[i]-main.clickY[i+tmp]));
					tmp++;
				}				
				
				i=i+tmp;

			}			
            
			main.colorLayerData = main.context.getImageData(0, 0, main.canvas.width, main.canvas.height);
		
		}
		else if(main.tool == "eraser")
		{
			 var i = 0;            
            for(; i < main.clickX.length; i++)
            {          
                var img=document.createElement('img');				
				img.src = "img/eraser_brush.png";							
				main.context.drawImage(img,main.clickX[i],main.clickY[i],30,30);
							   
			}
            
            main.colorLayerData = main.context.getImageData(0, 0, main.canvas.width, main.canvas.height);
		}
		main.context.drawImage(main.outlineImage, 0, 0,main.canvas.width, main.canvas.height);
		
		
	}	

	main.paintAt = function (startX, startY) 
	{
		startX = Math.round(startX);
		startY = Math.round(startY);
		var pixelPos 		= (startY * main.canvas.width + startX) * 4,
			colorLayerData 	= main.colorLayerData,
			r 				= colorLayerData.data[pixelPos],
			g 				= colorLayerData.data[pixelPos + 1],
			b 				= colorLayerData.data[pixelPos + 2],
			a 				= colorLayerData.data[pixelPos + 3];

		if (r === main.color.r && g === main.color.g && b === main.color.b) 
		{	// Return because trying to fill with the same color
			return;
		}

		if (main.matchOutlineColor(r, g, b, a)) 
		{
			// Return because clicked outline
			return
				
		}

		main.floodFill(startX, startY, r, g, b);

		main.redraw();
	}

	main.init();
}