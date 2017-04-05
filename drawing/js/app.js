(function() {

// Inputs

	$( "#input_color" ).change(function() 
	{
		color = $( "#input_color" ).val();
	});

	$( "#fm" ).click(function() 
	{
		mode = 0;
	});

	$( "#fdm" ).click(function() 
	{
		mode = 1;
		isDrawing = 0; 
	});

	$( "#export" ).click(function() 
	{
		window.open(canvas.toDataURL("image/png"));
	});


	$( "#brushwidth" ).change(function() 
	{
		brushwidth = $( "#brushwidth" ).val();
	});
	$( "#select-mode" ).change(function() 
	{

	      if (this.value === 'hline') 
	      {
	      	  canvas.freeDrawingBrush = vLinePatternBrush;
	      }
	      else if (this.value === 'vline') 
	      {
	      	  canvas.freeDrawingBrush = hLinePatternBrush;
	      }
	      else if (this.value === 'square') 
	      {
	      	  canvas.freeDrawingBrush = squarePatternBrush;
	      }
	      else if (this.value === 'diamond') 
	      {
	      	  canvas.freeDrawingBrush = diamondPatternBrush;
	      }
	      else if (this.value === 'texture') 
	      {
	      	  canvas.freeDrawingBrush = texturePatternBrush;
	      }
	      else 
	      {
	      	  canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
	      }
	       main.canvas.freeDrawingBrush._setProperty(main.brushwidth, mail.color);

	});


	$( window ).resize(function() {

	});



	var canvas = new fabric.Canvas('c', { preserveObjectStacking: true });
	var color = '#26a69a', group = [], mode = 0, swidth, sheight, imgbackground, brushwidth = '5';

	swidth = $( window ).width();
	sheight = $( window ).width();


	canvas.calcOffset();
	canvas.renderAll();

	canvas.selection = false;

	fabric.Image.fromURL('background.png', function(oImg) 
	{
		imgbackground = oImg;
		canvas.centerObject(imgbackground);
		imgbackground.set({
			top: 0,
			left: 0
		});
		imgbackground.scaleToWidth(canvas.getWidth());
		canvas.setBackgroundImage(imgbackground, canvas.renderAll.bind(canvas), {});
	});

	  // Load SVG
	fabric.loadSVGFromURL('svg/69.svg',
		function(objects,options) 
		{

		    var loadedObjects = new fabric.Group(group);

		      //loadedObjects.scaleToWidth(canvas.getWidth());
		    loadedObjects.scale(0.5);
		    canvas.add(loadedObjects).centerObject(loadedObjects);
		    canvas.renderAll();



			// Ungrouping SVG
			var items = loadedObjects._objects;
			loadedObjects._restoreObjectsState();

			canvas.remove(loadedObjects);
			canvas.renderAll();

			for(var i = 0; i < items.length; i++) 
			{
				items[i].perPixelTargetFind  = true;
				items[i].targetFindTolerance = 4;
				items[i].hasBorders 		 = false;
				items[i].hasControls 		 = false;
				items[i].lockMovementX 		 = true;
				items[i].lockMovementY 		 = true;
				items[i].hoverCursor 		 = 'crosshair';

				if (items[i].getFill() === '#FFFFFF' ) 
				{
					items[i].setFill('rgb(255, 255, 255)');
				} 
				else 
				{
					items[i].restriction = "form";
				}

				canvas.add(items[i]);

			}

			canvas.renderAll();

		},
		function(item, object) 
		{
			object.set('id',item.getAttribute('id'));
			group.push(object);
		}
	);

	  // Drawing Brush Style
	var vLinePatternBrush = new fabric.PatternBrush(canvas);
	vLinePatternBrush.getPatternSrc = function() 
	{

		var patternCanvas   = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx 			= patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.lineTo(10, 5);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
	};

	var hLinePatternBrush = new fabric.PatternBrush(canvas);
	hLinePatternBrush.getPatternSrc = function() 
	{

		var patternCanvas 	= fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx 			= patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(5, 0);
		ctx.lineTo(5, 10);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
	};

	var squarePatternBrush = new fabric.PatternBrush(canvas);
	squarePatternBrush.getPatternSrc = function() 
	{

		var squareWidth 	= 10, squareDistance = 2;

		var patternCanvas 	= fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
		var ctx 			= patternCanvas.getContext('2d');

		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, squareWidth, squareWidth);

		return patternCanvas;
	};

	var diamondPatternBrush = new fabric.PatternBrush(canvas);
	diamondPatternBrush.getPatternSrc = function() 
	{
		var squareWidth 	= 10, squareDistance = 5;
		var patternCanvas	= fabric.document.createElement('canvas');
		var rect 			= new fabric.Rect(
		{
			 width: squareWidth,
			 height: squareWidth,
			 angle: 45,
			 fill: this.color
		});

		var canvasWidth 	= rect.getBoundingRectWidth();
		patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
		rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

		var ctx = patternCanvas.getContext('2d');
		rect.render(ctx);

		return patternCanvas;
	};

	var img = new Image();
	img.src = 'sponge.jpg';

	var texturePatternBrush = new fabric.PatternBrush(canvas);
	texturePatternBrush.source = img;

	var isDrawing = 0;

	// Events
	canvas.on('mouse:down', function(options) 
	{
		if (options.target) 
		{
			
			if (options.target.restriction == "form") 
			{
			    console.log("You can't color this element!");
			   
			} 
			else if ( mode == 0) 
			{

			  options.target.setFill(color);

			} 
			else 
			{
				options.target.setFill('rgba(255, 255, 255, 0.1)');
				isDrawing =1;
				canvas.isDrawingMode 		  = true;
				canvas.freeDrawingBrush.color = color;
				canvas.freeDrawingBrush.width = brushwidth;
				
				


				canvas.on('path:created', function(e)
				{
					var your_path 						= e.path;
					canvas.isDrawingMode 				= false;					
										
					your_path.globalCompositeOperation  = 'destination-over';
					canvas.renderAll();
					isDrawing = 0;
				});
				canvas.renderAll();
				canvas.calcOffset();
			}
		}
	});
	
	canvas.on('mouse:move', function(options) 
	{
		if (options.target) 
		{
			if (options.target.restriction == "form") 
			{
			    console.log("You can't color this element!");
			  
			} 
			else if ( mode != 0 && isDrawing ==1) 			
			{
				canvas.isDrawingMode 		  = true;
				canvas.freeDrawingBrush.color = color;
				canvas.freeDrawingBrush.width = brushwidth;


				
				canvas.renderAll();
				canvas.calcOffset();
			}
		}
	});
})();
