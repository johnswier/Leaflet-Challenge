// API endpoint 
var baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Function to generate earthquake layer
function createCircles(response) {
    
    // store features in a variable
    var earthquakeData = response.features;
    
    // print features for reference
    // console.log(earthquakeData);
    
    // Initialize array to hold earthquake circles
    var earthquakeCircles = [];

    // Loop through each earthquake and store as a variable
    for (let i = 0; i < earthquakeData.length; i++) {
        var earthquake = earthquakeData[i];
        
        // store lat, lon, and depth coordinates
        var lat = earthquake.geometry.coordinates[1];
        var lon = earthquake.geometry.coordinates[0];
        var depth = earthquake.geometry.coordinates[2];

        // create color variable and run conditional to determine color
        var color = "";
        if (depth > -10 && depth <=10) {
            color = "#9BFF59"
        }
        else if (depth > 10 && depth <= 30) {
            color = "#DFF96A"
        }
        else if (depth > 30 && depth <= 50) {
            color = "#FFF981"
        }
        else if (depth > 50 && depth <= 70) {
            color = "#FFBC38"
        }
        else if (depth > 70 && depth <= 90) {
            color = "#FF9E38"
        }
        else color = "#FF3838"

        // for each earthquake, create a circle and bind a popup with legend
        var circle = L.circle([lat,lon], {
            
            // adjust radius based on magnitude
            radius: earthquake.properties.mag * 20000,
            // adjust color based on depth
            fillColor: color, 
            fillOpacity: .75,
            stroke: false
        }).bindPopup("<h2>Location: " + earthquake.properties.place + "</h2> <hr> <h3>Magnitude: " + earthquake.properties.mag + "</h3> <hr> <h3>Depth: " + depth + "</h3>")
        
        // add circle to earthquake circles array
        earthquakeCircles.push(circle);
    };

    // create layer group made from earthquake circles array and pass it into the createMap function
    createMap(L.layerGroup(earthquakeCircles));
};

// Function to generate map using earthquake layer
function createMap(earthquakes) {
    
    // create streetmap and satellite layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    
    var satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
    "Street View": streetmap,
    "Satellite View": satellite
    };

    // create overlay object to hold our overlay layers
    var overlayMaps = {
        "Earthquakes": earthquakes,
        // "Tectonic Plates": plates
    };
    
    // create map, passing in streetmap and earthquake layers to display on load
    var myMap = L.map("map", {
        center: [36.17, -115.14],
        zoom: 5.5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
  
    // Create a legend 
    var legend = L.control({
        position: "bottomright"
    });
  
    // When the layer control is added, insert a div with the class of info legend
    // add depths and colors list to use when creating the legend
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), depths = [-10,10,30,50,70,90], colors = ["#9BFF59", "#DFF96A", "#FFF981", "#FFBC38", "#FF9E38", "#FF3838"]
            
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i>' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };
    
    // Add the legend to the map
    legend.addTo(myMap);
}

// Perform GET request, call createCircles function 
d3.json(baseUrl, createCircles);