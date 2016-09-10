//get current weather data from database of one location
function getCurrentDatabaseData(location) {
    var req = new XMLHttpRequest();
    req.open("GET", 'currWeather/' + location);
    req.setRequestHeader("Content-Type", "text/plain");
    req.onreadystatechange = function () {
        displayCurrentWeather(JSON.parse(req.responseText));
			
			var reqd = new XMLHttpRequest();
			reqd.open("GET", "deleteData/currLocation");
			reqd.setRequestHeader("Content-Type", "text/plain");
			reqd.onreadystatechange = function() {
				getAllCurrentDatabaseData() ;
			}
			reqd.send(null);
        
		req.onreadystatechange = null;
    };
    req.send(null);
}


//display current weather data on page
function displayCurrentWeather(currWeather) {   
	$('#currSummTable').remove();
    $('#metersvg').remove();
	
	//create widget	
    $('#locationCountry').text(currWeather.name + ',' + currWeather.sys.country).css({ 'font-size': 30 });
    $('#coord').text('['+ currWeather.coord.lat +'\xB0 ,' + currWeather.coord.lon + '\xB0]').css({ 'font-size': 10 });
    $('#temperature').text(KtoCelsius(currWeather.main.temp) + '\xB0C' ).css({ 'font-size': 30 });
    $('#maxminTemp').text('min temp: '+KtoCelsius(currWeather.main.temp_min) + '\xB0C ; ' + 'max temp: '+ KtoCelsius(currWeather.main.temp_max) + '\xB0C').css({ 'font-size': 12 });
    $('#weatherTitle').text(currWeather.weather['0']['main'] ).css({ 'font-size': 30 });
	$('#weatherDescrip').text(currWeather.weather['0']['description'] ).css({ 'font-size': 15 });
    $('#retrievedAt').text('retrieved at: ' + new Date (currWeather.dt * 1000)).css({ 'font-size': 10 });	
    $('#weatherTitle').append('<img id="weatherIcon" src="icons/'+ currWeather.weather['0']['icon'] +'.png" />')
    makeThermometer(currWeather);

	//create summary table
    var table = d3.select('#currSummary').append('table').attr('id', 'currSummTable').attr('class', 'w3-table-all');
    var tr = table.selectAll('tr')
				.data(createTableData(currWeather))
				.enter()
				.append('tr');
    tr.append('td')
		.attr('class', 'title')
		.html(function (m) { return m.field; });
    tr.append('td')
		.html(function (m) { return m.data; });
    $('.title').css("font-weight", "Bold");

}



function makeThermometer(currWeather){
	var width = 100, height = 200;
    var svg = d3.select("#thermometer").append("svg").attr('id','metersvg').attr("width", width).attr("height",
					height).append("g")	
	
	svg.append("circle")
	  .attr("r", 10)
	  .attr("cx",50)
	  .attr("cy", 10)
	  .style("fill", "white")
	  .style("stroke", 'black')
	svg.append("rect")
	  .attr("width", 20)
	  .attr("height", 150)
	  .attr("x",40)
	  .attr("y", 12)
	  .style("fill", "none")
	  .style("stroke", 'black')
	svg.append("circle")
	  .attr("r", 20)
	  .attr("cx",50)
	  .attr("cy", 160)
	  .style("fill", "white")
	  .style("stroke", 'black')
	svg.append("rect")
	  .attr("width", 18)
	  .attr("height", 150)
	  .attr("x",41)
	  .attr("y", 10)
	  .style("fill", "white")
	  .style("stroke", 'none')
	svg.append("circle")
	  .attr("r", 10)
	  .attr("cx",50)
	  .attr("cy", 160)
	  .style("fill", "red")
	  .style("stroke", 'none')
	svg.append("rect")
	  .attr("width", 5)
	  .attr("height", (KtoCelsius(currWeather.main.temp+50)*1.5))
	  .attr("x",46)
	  .attr("y", 12 + 150 - (KtoCelsius(currWeather.main.temp+50)*1.5)) 
	  .style("fill", "red")
	  .style("stroke", 'none')	
	
    var y_scale = d3.scale.linear().range([10,160]).domain([50,-50]);
	var yAxis = d3.svg.axis().scale(y_scale).orient("left");
	
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(48,0)")
		.call(yAxis)

}



//make data into a list for table 
function createTableData(currWeather) {
    var dataList = [];
    
	dataList.push({ 'field': 'Clouds', 'data': currWeather.clouds.all + ' %' });
    dataList.push({ 'field': 'Wind Speed', 'data': currWeather.wind.speed + ' m/s' });
    (function () {
        var winddir = currWeather.wind.deg;
        if (winddir > 337.5 || winddir <= 22.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'North ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 22.5 && winddir <= 67.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'North East ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 67.5 && winddir <= 112.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'East ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 112.5 && winddir <= 157.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'South East ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 157.5 && winddir <= 202.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'South ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 202.5 && winddir <= 247.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'South West ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 247.5 && winddir <= 292.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'West ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else if (winddir > 292.5 && winddir <= 337.5) {
            dataList.push({ 'field': 'Wind Direction', 'data': 'North West ' + currWeather.wind.deg + '&deg (meteorological)' });
        } else {

            dataList.push({ 'field': 'Wind Direction', 'data': currWeather.wind.deg + '&deg (meteorological)' });
        }
    })();

	dataList.push({'field': 'Humidity', 'data': currWeather.main.humidity+' %'});
	dataList.push({'field': 'Pressure', 'data': currWeather.main.pressure+ ' hPa'});
	var sunriseTime = new Date (currWeather.localSunrise * 1000);  
	dataList.push({'field': 'Sunrise Time', 'data': ('0' + sunriseTime.getHours()).slice(-2) + ':' +  ('0' + sunriseTime.getMinutes()).slice(-2)});
	var sunsetTime =new Date (currWeather.localSunset * 1000); 
	dataList.push({'field': 'Sunset Time', 'data': ('0' + sunsetTime.getHours()).slice(-2) + ':' +  ('0' + sunsetTime.getMinutes()).slice(-2)});		

	return dataList;

}

//make api call by current coordinate
function callCurrentLocation(lat, lon) {
    var locationCoord = 'lat=' + lat + '&lon=' + lon
    var req = new XMLHttpRequest();
    req.open("POST", 'coordSearch/' + locationCoord);
    req.setRequestHeader("Content-Type", "text/plain");
    req.onreadystatechange = function () {
        showCurrLocationWeather();
        req.onreadystatechange = null;
    };
    req.send(null);

}

//show weather data for current location
function showCurrLocationWeather() {
    registerTabs();
    $('#tabs').show();
    $('#content').show();
    setTimeout(
	  function () {
	      getCurrentDatabaseData('currLocation');
	      getForecastDatabaseData('currLocation');
	  }, 500);
    showInfo();
    $('#currSummTable').empty();
    $('#weatherIcon').remove();
	var req = new XMLHttpRequest();
}
