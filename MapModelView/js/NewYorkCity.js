/**
 * Created by Almond on 12/2/2016.
 */

var NewYorkCity = function() {

    var main                =   this;

    main.city_pos           =   null;
    main.center_Entity      =   null;

    main.buildingLayer      =   null;
    main.streetLayer        =   null;

    main.prefixUrl          =   "http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/Cesium_NYC_Demo/";

    main.init = function (position){
        main.city_pos       =   position;
    }

    main.drawPos = function () {
        main.center_Entity = viewer.entities.add({
            position : Cesium.Cartesian3.fromDegrees(main.city_pos.x, main.city_pos.y),
            label : {
                text: 'New York',
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                eyeOffset: new Cesium.Cartesian3(0,0,-30),
                scale   :   5
            },
            show : false
        });
    }

    main.flyTo = function() {
        showFlying(true);

        viewer.trackedEntity = main.center_Entity;
        main.center_Entity.show = false;
        baverlyHill.center_Entity.show = false;
        isHome = false;
        isNewYork = true;
        isBaverlyHill = false;

        main.addLayer();

        // viewer.camera.flyToBoundingSphere(
        //     new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(main.city_pos.x, main.city_pos.y, 100.0), 200),
        //     {
        //     complete: function () {
        //         main.center_Entity.show = false;
        //         baverlyHill.center_Entity.show = false;
        //         isHome = false;
        //         isNewYork = true;
        //         isBaverlyHill = false;
        //         showFlying(false);

        //         main.addLayer();
        //     },
        //     maximumHeight: 10000000,
        //     orientation : {
        //         heading: Cesium.Math.toRadians(-60),
        //         pitch: Cesium.Math.toRadians(-25.0),
        //         roll: 0.0
        //     }
        // });
    }
    main.addLayer = function() 
    {
        main.addBuildingLayer();
        main.addStreetLayer();
        main.addEventListener(main.buildingLayer);
        // main.addLotLayer();
    }

    main.addBuildingLayer = function() 
    {
        main.buildingLayer = new CitydbKmlLayer({
            url : main.prefixUrl + "NYK_Building_Extruded/NYK_Building_Extruded_MasterJSON_NoJSONP.json",
            // url : "./data/Buildings/NYC_Manhattan_Buildings_extruded_MasterJSON.json",
            minLodPixels : 140,
            maxLodPixels : 1.7976931348623157e+308,
            maxSizeOfCachedTiles : 50,
            maxCountOfVisibleTiles : 200,
            thematicDataUrl : "https://www.google.com/fusiontables/DataSource?docid=1ivFBfqsnkv5OlvkQUybgfOSjIz_u9_98_mmJVUss#rows:id=1"
        });
        webMap.addLayer(main.buildingLayer);

        main.buildingLayer.registerEventHandler("FINISHLOADING", function(loadedcitydbLayer) {
            showFlying(false);
            loadedcitydbLayer.zoomToStartPosition();
        });
    }

    main.addStreetLayer = function() 
    {
        main.streetLayer = new CitydbKmlLayer({
            url : main.prefixUrl + "NYK_Street_Footprint/NYK_Street_Footprint_MasterJSON_NoJSONP.json",
            //url : "./data/Streets/NYC_Manhattan_Streets_footprint_MasterJSON.json",
            minLodPixels : 140,
            maxLodPixels : 1.7976931348623157e+308,
            maxSizeOfCachedTiles : 50,
            maxCountOfVisibleTiles : 200,
            thematicDataUrl : "https://www.google.com/fusiontables/data?docid=1qLk_S4yxma0MI1LmISc8DdLn_NdhrFb784Mwizas#rows:id=1"
        });
        webMap.addLayer(main.streetLayer);
    }

    main.removeLayers = function()
    {
        if (main.buildingLayer) {
            webMap.removeLayer(main.buildingLayer.id);
            webMap.removeLayer(main.streetLayer.id);
        }
    }

    main.addEventListener = function(citydbKmlLayer) {
        var highlightColor = new Cesium.Color(0.4, 0.4, 0.0, 1.0);
        var mouseOverhighlightColor = new Cesium.Color(0.0, 0.3, 0.0, 1.0);
        var mainMouseOverhighlightColor = new Cesium.Color(0.0, 0.4, 0.0, 1.0);
        var subMouseOverhighlightColor = new Cesium.Color(0.0, 0.5, 0.0, 1.0);

        // citydbKmlLayer.registerEventHandler("CLICK", function(object) {         
        //     var targetEntity = object.id;
        //     var primitive = object.primitive;
        //     console.log(citydbKmlLayer);
        //     console.log(primitive);

        //     var globeId = targetEntity.name; 
            
        //     if (citydbKmlLayer.isInHighlightedList(globeId))
        //         return; 
        //     // clear all other Highlighting status and just highlight the clicked object...
        //     citydbKmlLayer.unHighlightAllObjects();       

        //     var highlightThis = {};
            
        //     highlightThis[globeId] = highlightColor;
        //     citydbKmlLayer.highlight(highlightThis);                        
        // });

        citydbKmlLayer.registerEventHandler("MOUSEIN", function(object) {
            var targetEntity = object.id;

            var thematicDataUrl = citydbKmlLayer.thematicDataUrl;  
            // var promise = fetchDataFromGoogleFusionTable(targetEntity.name, thematicDataUrl);

            var primitive = object.primitive;
            
            if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
                return;
            
            if (primitive instanceof Cesium.Model) {                
                var materials = object.mesh._materials;
                for (var i = 0; i < materials.length; i++) {
                    // do mouseOver highlighting
                    materials[i].setValue('emission', Cesium.Cartesian4.fromColor(mouseOverhighlightColor));
                } 
            }
            else if (primitive instanceof Cesium.Primitive) {   
                try{
                    var parentEntity = targetEntity._parent;    
                    var childrenEntities = parentEntity._children;                      
                }
                catch(e){return;} // not valid entities
                main._doMouseoverHighlighting(childrenEntities, primitive, mouseOverhighlightColor);
            }
        });
        
        citydbKmlLayer.registerEventHandler("MOUSEOUT", function(object) {
            var primitive = object.primitive;
            var targetEntity = object.id;
            if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
                return; 
            if (primitive instanceof Cesium.Model) {                
                var materials = object.mesh._materials;
                for (var i = 0; i < materials.length; i++) {
                    // dismiss highlighting
                    materials[i].setValue('emission', new Cesium.Cartesian4(0.0, 0.0, 0.0, 1));
                } 
            }
            else if (primitive instanceof Cesium.Primitive) {               
                try{
                    var parentEntity = targetEntity._parent;    
                    var childrenEntities = parentEntity._children;      
                    
                }
                catch(e){return;} // not valid entities
                main._dismissMouseoverHighlighting(childrenEntities, primitive); 
            }
        });
        
        // citydbKmlLayer.registerEventHandler("VIEWCHANGED", function(object) {
        //     if (object == undefined) return;
        //     var primitive = object.primitive;
        //     var targetEntity = object.id;
        //     console.log(targetEntity.name);
        // });
    }

    main._dismissMouseoverHighlighting = function(_childrenEntities, _primitive) {
        for (var i = 0; i < _childrenEntities.length; i++){ 
            var childEntity = _childrenEntities[i]; 
            var originalSurfaceColor = childEntity.originalSurfaceColor;
            try{
                var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
                attributes.color = originalSurfaceColor; 
            }
            catch(e){
                console.log(e);
                /* escape the DeveloperError exception: "This object was destroyed..." */
            }
        }
    }

    main._doMouseoverHighlighting = function(_childrenEntities, _primitive, _mouseOverhighlightColor) {
        for (var i = 0; i < _childrenEntities.length; i++){ 
            var childEntity = _childrenEntities[i];                         
            var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
            if (!Cesium.defined(childEntity.originalSurfaceColor)) {
                childEntity.addProperty("originalSurfaceColor");
            }                       
            childEntity.originalSurfaceColor = attributes.color;
            attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(_mouseOverhighlightColor); 
        }
    }

    function fetchDataFromGoogleFusionTable(gmlid, thematicDataUrl) {
        var kvp = {};
        var deferred = Cesium.when.defer();
        
        var tableID = CitydbUtil.parse_query_string('docid', thematicDataUrl);      
        var sql = "sql=SELECT * FROM " + tableID + " WHERE GMLID = '" + gmlid + "'";
        var apiKey = "AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";     
        var queryLink = "https://www.googleapis.com/fusiontables/v2/query?" + sql + "&key=" + apiKey;   

        Cesium.loadJson(queryLink).then(function(data) {
            console.log(data);
            var columns = data.columns;
            var rows = data.rows;
            for (var i = 0; i < columns.length; i++) {
                var key = columns[i];
                var value = rows[0][i];
                kvp[key] = value;
            }
            console.log(kvp);
            deferred.resolve(kvp);
        }).otherwise(function(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
}