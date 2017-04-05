/* -----------------------------------------------------
*
*   Author 	    : Sergey Kuznetov
*   Created     : 2016/07/28
*   Description : Progress Bar
*
--------------------------------------------------------*/
var classProgress 	= function()
{
	var main 			= this;

	main.init 			= function()
	{
		$("#progress_area center").html("[0%]");
		$("#progress_done").css("width", "0px");
	}

	main.updateProgress = function(percent)
	{
		var width = $("#progress_bar").width() * percent / 100;

		$("#progress_area center").html("[" + Math.ceil(percent) + "%]");
		$("#progress_done").css("width", width + "px");

		if(percent > 99)
		{
			setTimeout(main.hideProgress, 500);
		}
	}

	main.showProgress 	= function(title)
	{
		if(title && title != "")
		{
			$("#progress_area h3").html(title);
		}
		else
		{
			$("#progress_area h3").html("Image Modeling ...");
		}

		$("#progress_area").fadeIn();
		$("#overlay").css("display", "block");
	}

	main.hideProgress 	= function()
	{
		$("#progress_done").css("width", "0px");
		$("#overlay").css("display", "none");
		$("#progress_area").fadeOut();
	}

	main.init();
}