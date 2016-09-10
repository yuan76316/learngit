//get currentWeather documents from database
function getAllCurrentDatabaseData() {
    $.ajax({
        dataType: "json",
        url: '/allCurrWeather',
        data: null,
        success: function (response) {
            var allCurrArray = $.map(response, function (value, index) {
                if (value.id != undefined) {
                    return [value];
                }
            });
			var center=[[28, 0],[70, 40]];
			mapIni(allCurrArray,center);
            listPreviousCities(allCurrArray);
        }
    });
}
//creating accordion list  
function listPreviousCities(cities) {

    $('#previousSearches').remove();
	$('#forecastDiv').after('<div id="previousSearches" class="ui-accordion"></div>');
	var cityName;
    var cityId;
    var temperature;
    var description;
    var iconUrl;
    var i;
    var ll;
    if (position != undefined) {
        var startPoint = position.coords.latitude + ", " + position.coords.longitude;
    } else {
        var startPoint = "University of St Andrews";
    }

    for (i in cities) {
        cityName = cities[i].name + ", " + cities[i].sys.country;
        cityId = cities[i].id;
        temperature = KtoCelsius(cities[i].main.temp) + "&#8451;";
        description = cities[i].weather[0].description;
        iconUrl = "icons/" + cities[i].weather[0].icon + ".png";
        ll = cities[i].coord.lat + ", " + cities[i].coord.lon;

        $('#previousSearches').append('<h3 class="ui-accordion-header" id="--'+cityId+'" data-coord="'+i+'">' + cityName + '</h3><div class="ui-accordion-content" id="'+cityId+'"><strong>' + temperature + '</strong><img src="' + iconUrl + '"></img><span>' + description + '</span><input type="button" class="btn btn-danger pull-right" value="Delete" id="'+cityId+'" onclick="DeleteRowFunction(this)"></input></div>');
        $('#' + cityId).append('<p><a href="http://maps.apple.com/?saddr='+startPoint+'&daddr=' + ll + '&t=k&z=12" target="_blank"> Route to </a></p>');
		$('#--'+cityId).click(function(){
		var coord = $(this).attr("data-coord");
		//window.alert(coord);
			 var center=[[cities[coord].coord.lat+5, cities[coord].coord.lon+5],[cities[coord].coord.lat-5, cities[coord].coord.lon-5]];
			 mapIni(cities,center);
		});
    }

    $(function () {
        $('#previousSearches').accordion({
            collapsible: true,
            heightStyle: "content"
        });
    });
}


function mapIni(dataset,center){
	//give map initial zoom and centre
	$('#map').remove();
	var div = document.createElement("div");
	div.id='map';
	$('body').append('<div id="map"></div>');
	
	var map = L.map('map').setView([51.51, -0.13], 11);
	map.fitBounds(center);
	
	//give map style 
	var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 1,
		maxZoom: 16,
		ext: 'png'
		});
	Stamen_Watercolor.addTo(map);
	//add point and popup to the map
	drawMap(dataset,map);
	showInfo();
}

function drawMap(dataset,map){			
	//draw it on the leaflet map	
	dataset.forEach(function(d){
	
		var iconn='icons/'+d.weather['0']['icon']+'.png';

		var markerIcon= L.icon({
			iconUrl: iconn,
			iconSize: [40,55],
			})	
		
		var marker = L.marker([d.coord.lat,d.coord.lon],{icon: markerIcon});
		marker.addTo(map);
		
		var winddir = d.wind.deg;
		var direction;
		if (winddir > 337.5 || winddir <= 22.5) {
		    direction = 'North ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 22.5 && winddir <= 67.5) {
		    direction = 'North East ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 67.5 && winddir <= 112.5) {
		    direction = 'East ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 112.5 && winddir <= 157.5) {
		    direction = 'South East ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 157.5 && winddir <= 202.5) {
		    direction = 'South ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 202.5 && winddir <= 247.5) {
		    direction = 'South West ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 247.5 && winddir <= 292.5) {
		    direction = 'West ' + d.wind.deg + '&deg (meteorological)';
		} else if (winddir > 292.5 && winddir <= 337.5) {
		    direction = 'North West ' + d.wind.deg + '&deg (meteorological)';
		} else {
		    direction = d.wind.deg + '&deg (meteorological)';
		}

		var popup =L.popup();
		//add popup information
		marker.on("mouseover",function(e){
		var Name="<b>"+d.name+"</b><br>";
		var Country="Country: <b>"+d.sys.country+"</b><br>";
		var Tem="Temp: <b>"+KtoCelsius(d.main.temp)+ "</b>\xB0C <br>";
		var Clouds="Clouds: <b>"+d.clouds.all+" %</b> <br>";
		var Humidity="Humidity: <b>"+d.main.humidity+" %</b> <br>";
		var Pressure="Pressure: <b>"+d.main.pressure+ " hPa</b><br>";
		var WindDirection="Wind Direction: <b>"+direction+' </b><br>';
		var WindSpeed="Wind Speed: <b>"+d.wind.speed+ ' m/s</b><br>';
		var sunriseTime =new Date (d.localSunrise * 1000);  
		var Sunrise="Sunrise: <b>"+('0' + sunriseTime.getHours()).slice(-2) + ':' +  ('0' + sunriseTime.getMinutes()).slice(-2)+ '</b> <br>';
		var sunsetTime =new Date (d.localSunset * 1000); 
		var Sunset="Sunset: <b>"+('0' + sunsetTime.getHours()).slice(-2) + ':' +  ('0' + sunsetTime.getMinutes()).slice(-2)+ '</b> <br>';
		
		url=Name+Country+Tem+Clouds+Humidity+Pressure+WindDirection+WindSpeed+Sunrise+Sunset;
		
		marker.bindPopup(url, {'offset': L.point(0,-10)}).openPopup();
		
		})
		 marker.on('mouseout', function(){marker.closePopup();});
	
	});
		
}
