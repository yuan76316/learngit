//get forecast weather data from database of one location
function getForecastDatabaseData(location) {
    var req = new XMLHttpRequest();
    req.open("GET", 'forecastWeather/' + location);
    req.setRequestHeader("Content-Type", "text/plain");
    req.onreadystatechange = function () {
        displayForecastWeather(JSON.parse(req.responseText));
        req.onreadystatechange = null;
    };
    req.send(null);
}

//get forecastWeather document from database
function getAllForecastDatabaseData() {
    $.ajax({
        dataType: "json",
        url: '/allForeWeather',
        data: null,
        success: function (response) {
            var allForeArray = $.map(response, function (value, index) {
                if (value.city != undefined) {
                    return [value];
                }
            });
        }
    });
}

//display forecast information on page
function displayForecastWeather(forecastWeather) {
    clearAllCharts();
    //create relevant datum
	var tempData = makeTempData(forecastWeather);
    var pressureData = makePressureData(forecastWeather);
    var humidityData = makeHumidityData(forecastWeather);
    var windData = makeWindData(forecastWeather);
    var cloudData = makeCloudData(forecastWeather);
    var prepData = makePrepData(forecastWeather);
    var snowData = makeSnowData(forecastWeather);
    var cloudLineData = makeCloudLineData(forecastWeather);
	//draw line charts 
	drawPlot(tempData, 'tempChart', '\xB0C');
    drawPlot(pressureData, 'pressureChart', 'hPa');
    drawPlot(humidityData, 'humidityChart', '%');
    drawPlot(windData, 'windChart', 'm/s');
    drawPlot(cloudData, 'cloudChart', '%');
    //draw bar charts
	drawChart(prepData, 'prepChart', 'mm');
    drawChart(snowData, 'snowChart', 'cm');    
    //draw summary chart
    drawSummary(tempData, pressureData, prepData, windData, cloudLineData);
    //show selected chart
	hideAllCharts();
    $('#' + $('#dataSelection').val()).show();
    $('#dataSelection').change(function () {
        hideAllCharts()
        $('#' + $('#dataSelection').val()).show();
    });
    displayForecastData(forecastWeather);
}

//clear all previously drawn chart (other location)
function clearAllCharts() {
    $('#tempChart').remove();
    $('#pressureChart').remove();
    $('#humidityChart').remove();
    $('#windChart').remove();
    $('#cloudChart').remove();
    $('#prepChart').remove();
    $('#snowChart').remove();
    $('#summaryChart').remove();
}

//hide all charts from page
function hideAllCharts() {
    $('#tempChart').hide();
    $('#pressureChart').hide();
    $('#humidityChart').hide();
    $('#windChart').hide();
    $('#cloudChart').hide();
    $('#prepChart').hide();
    $('#snowChart').hide();
    $('#summaryChart').hide();
}

//making data for temperature - includes weather and icon for summary chart
function makeTempData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i]
        dataList.push({ 'time': new Date (obj.localTime * 1000),
            'val' : KtoCelsius(obj.main.temp),
			'max' : KtoCelsius(obj.main.temp_max) , 
			'min' : KtoCelsius(obj.main.temp_min) ,
			'icon': obj.weather['0']['icon'],
			'weather': obj.weather['0']['main']
        });
    }
    return dataList;
}

function makePressureData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i]
        dataList.push({ 'time': new Date (obj.localTime * 1000),
            'val' : obj.main.pressure
        });
    }
    return dataList;
}

function makeHumidityData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i]
        dataList.push({ 'time': new Date (obj.localTime * 1000),
            'val' : obj.main.humidity
        });
    }
    return dataList;
}

function makeWindData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i];
        dataList.push({ 'time': new Date (obj.localTime * 1000),
            'val' : obj.wind.speed,
			'direction' : obj.wind.deg
        });
    }
    return dataList;
}

function makeCloudData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i]
        dataList.push({ 'time': new Date (obj.localTime * 1000),
            'val' : obj.clouds.all
        });
    }
    return dataList;
}

//make data for cloud illusion line chart (top of summary chart)
function makeCloudLineData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length - 1) ; i++) {
        var obj = forecastWeather.list[i]
		var nextObj = forecastWeather.list[i+1]
		for (j=0;j<10;j++){
			var rescaledTime = obj.localTime + j*(1080);
			var rescaledVal = obj.clouds.all + (((nextObj.clouds.all - obj.clouds.all)*j)/10.0)
			dataList.push({ 'time': new Date (rescaledTime * 1000),
				'val' : rescaledVal
			});
				dataList.push({ 'time': new Date ((rescaledTime+540) * 1000),
				'val' : -rescaledVal
			});
		}	
    }
    return dataList;
}

function makePrepData(forecastWeather) {
    var dataList = [];
    for (i = 0; i < (forecastWeather.list.length) ; i++) {
        var obj = forecastWeather.list[i]
        if ( obj['rain'] ){
			if(obj['rain']['3h']){
				dataList.push({ 'time': new Date ((obj.localTime - 10800)  * 1000),  //change so that it starts 3 hours before
					'val' : obj['rain']['3h']
				});		
			} else{
				dataList.push({ 'time': new Date (obj.localTime * 1000),
					'val' : 0
				});
			}
		}else{
			dataList.push({ 'time': new Date (obj.localTime * 1000),
				'val' : 0
			});	
		}				
    }
    return dataList;
}

function makeSnowData(forecastWeather){
    var dataList =[];
    for ( i = 0; i < (forecastWeather.list.length); i++) {
        var obj = forecastWeather.list[i]
        if ( obj['snow'] ){
			if(obj['snow']['3h']){
				dataList.push({ 'time': new Date ((obj.localTime - 10800)  * 1000),
					'val' : obj['snow']['3h']
				});		
			} else{
				dataList.push({ 'time': new Date (obj.localTime * 1000),
					'val' : 0
				});
			}
		}else{
			dataList.push({ 'time': new Date (obj.localTime * 1000),
				'val' : 0
			});	
		}					
    }
    return dataList;
}

//display forecast data in table
function displayForecastData(forecastWeather) {
    $('#forecastTable > tbody').empty();//empty the table
    var weatherList = forecastWeather.list;
    for (var i in weatherList) {
        var w = weatherList[i];
        $('#forecastTable > tbody').append(
            '<tr>' +
            '<td>' + $.format.date(new Date (w.localTime * 1000), tableDateFormat)  +
            '<img src="http://openweathermap.org/img/w/' + w.weather[0].icon + '.png"> ' +
            '</td>' +
            '<td>' +
            '<span class="label label-warning">' + KtoCelsius(w.main.temp_max) + '&deg;C </span>&nbsp;<span class="label label-default">' + KtoCelsius(w.main.temp_min) + '&deg;C </span>' +
            '&nbsp;&nbsp;<i>' + w.weather[0].description + '</i>' +
            '<p> ' + w.wind.speed + 'm/s <br>clouds: ' + w.clouds.all + '%, ' + w.main.pressure + ' hPa</p>' +
            '</td>' +
            '</tr>"');
    }
}



//draw line charts
function drawPlot(d, id, yAxisLabel) {
    var width = 1000, height = 400, margin = 60;
    var tempChartSvg = d3.select("#chartSpace").append("svg").attr("id", id).attr("width", width).attr("height",
					height).append("g")

    var x_extent = d3.extent(d, function (d) { return d["time"] });
    var y_extent = d3.extent(d, function (d) { return d["val"] });

    var x_scale = d3.time.scale().range([margin, width - margin]).domain(x_extent);
    var y_scale = d3.scale.linear().range([height - margin, margin]).domain(y_extent);

    var xAxis = d3.svg.axis().scale(x_scale).orient("bottom");
    var yAxis = d3.svg.axis().scale(y_scale).orient("left");

    var line = d3.svg.line().x(function(d) { return x_scale(d.time); }).y(function(d) { return y_scale(d.val); });

    //draw points
    if (id == 'windChart') { //for wind chart, we draw triangles instead
        tempChartSvg.selectAll("polygon")
			.data(d)
			.enter().append("polygon")
			.style("stroke", "none")
			.style("opacity", .5)
			.style("fill", function (d) { return getColour(d['time']); })
			.attr("points", "-4,8, 4,8, 0,-8")
			.attr("transform", function (d) { return "translate(" + x_scale(d.time) + "," + y_scale(d.val) + "), rotate(" + d.direction + ")"; }) //direction of triangles depends on direction of wind
			.on("mouseover", mouseOverTriangle)
			.on("mouseout", mouseOffTriangle);//register mouse over and off events for triangles
    } else if (id == 'tempChart'){
        //draw data points as circle
        tempChartSvg.selectAll("circle").data(d).enter().append("circle")
			.attr("cx", function (d) { return x_scale(d["time"]); })
			.attr("cy", function (d) { return y_scale(d["val"]); })
			.attr("r", 5).style("opacity", .5).style("fill", function (d) { return getColour(d['time']); })
			.on("mouseover", mouseOver)
			.on("mouseout", mouseOff) 	
		//draw min data points as triangle-down
		tempChartSvg.selectAll(".pointMin").data(d).enter().append("path")
		  .attr("class", "pointMin")
		  .attr("d", d3.svg.symbol().type("triangle-down").size(30))
			.attr("transform", function(d) { if (d.min == d.val) {return "translate(" + x_scale(d.time) + "," +  (y_scale(d.min)+7.5) + ")";} else{return "translate(" + x_scale(d.time) + "," +  y_scale(d.min) + ")";} })
			.style("opacity", .5).style("fill", function (d) { return getColour(d['time']); })
			.on("mouseover", mouseOverMin)
			.on("mouseout", mouseOffMin) 	
		//draw max data points as triangle-up
		tempChartSvg.selectAll(".pointMax").data(d).enter().append("path")
		  .attr("class", "pointMax")
		  .attr("d", d3.svg.symbol().type("triangle-up").size(30))
			.attr("transform", function(d) { if (d.max == d.val) {return "translate(" + x_scale(d.time) + "," +  (y_scale(d.max)-7.5) + ")";} else{return "translate(" + x_scale(d.time) + "," +  y_scale(d.max) + ")";} })
			.style("opacity", .5).style("fill", function (d) { return getColour(d['time']); })
			.on("mouseover", mouseOverMax)
			.on("mouseout", mouseOffMax) 	
	}else {
        //draw data points as circle
        tempChartSvg.selectAll("circle").data(d).enter().append("circle");
        tempChartSvg.selectAll("circle")
			.attr("cx", function (d) { return x_scale(d["time"]); })
			.attr("cy", function (d) { return y_scale(d["val"]); })
			.attr("r", 5).style("opacity", .5).style("fill", function (d) { return getColour(d['time']); })
			.on("mouseover", mouseOver)
			.on("mouseout", mouseOff) //register mouse over and off events for circles
    }

    //make x axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (height - margin) + ")")
		.call(xAxis);
    
	//make y axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin + ",0)")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("dy", "1em")

			.attr("x", 0 - height / 6)

			.style("text-anchor", "middle")
			.text(yAxisLabel);
    
	//draw data line
    tempChartSvg.append("path")
      .datum(d)
      .attr("class", "line")
      .attr("d", line);

}

//returns a colour for a point based on the date (one colour for one day)
function getColour(time) {
    var now = new Date();
    if (time.getDate() == now.getDate()) {
        return 'red'
    } else if (time.getDate() == now.getDate() + 1) {
        return 'purple'
    } else if (time.getDate() == now.getDate() + 2) {
        return 'blue'
    } else if (time.getDate() == now.getDate() + 3) {
        return 'green'
    } else if (time.getDate() == now.getDate() + 4) {
        return '#663300'
    } else {
        return '#ff5500'
    }
}

//mouse over event function for circles
function mouseOver(d) {
    //make point bigger
    d3.select(this)
		.transition()
		.duration(800).style("opacity", 1)
		.attr("r", 10).ease("elastic")
    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltip")
		.html(formatDateTime(d.time) + "<br/>" + $('#dataSelection option:selected').html() + ': ' + d.val)
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250 ) + "px");

}

//mouse off event function for circles
function mouseOff(svg) {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .5)
		.attr("r", 5).ease("elastic")
    d3.select('.tooltip').remove();
}

//mouse over event function for min
function mouseOverMin(d) {
    d3.select(this)
		.transition()
		.duration(800).style("opacity", 1).attr("d", d3.svg.symbol().type('triangle-down').size(60)).ease("elastic")
    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltip")
		.html(formatDateTime(d.time) + "<br/>Min " + $('#dataSelection option:selected').html() + ': ' + d.min)
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250 ) + "px");
}

//mouse over event function for max
function mouseOverMax(d) {
    d3.select(this)
		.transition()
		.duration(800).style("opacity", 1).attr("d", d3.svg.symbol().type('triangle-up').size(60)).ease("elastic")
    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltip")
		.html(formatDateTime(d.time) + "<br/>Max " + $('#dataSelection option:selected').html() + ': ' + d.max)
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250 ) + "px");
}

//mouse off event function for max
function mouseOffMax(svg) {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .5).attr("d", d3.svg.symbol().type('triangle-up').size(30)).ease("elastic")
    d3.select('.tooltip').remove();
}

//mouse off event function for min
function mouseOffMin(svg) {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .5).attr("d", d3.svg.symbol().type('triangle-down').size(30)).ease("elastic")
    d3.select('.tooltip').remove();
}

//draw bar charts
function drawChart(d, id, yAxisLabel) {
    var width = 1000, height = 400, margin = 60;

    var tempChartSvg = d3.select("#chartSpace").append("svg").attr("id", id).attr("width", width).attr("height",
					height).append("g")

    var x_extent = d3.extent(d, function (d) { return d["time"] });
    var y_extent = d3.extent(d, function (d) { return d["val"] });

    var x_scale = d3.time.scale().range([margin, width - margin]).domain(x_extent);
    var y_scale = d3.scale.linear().range([height - margin, margin]).domain(y_extent);

    var xAxis = d3.svg.axis().scale(x_scale).orient("bottom");
    var yAxis = d3.svg.axis().scale(y_scale).orient("left");

    //make x axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (height - margin) + ")")
		.call(xAxis);
    //make y axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin + ",0)")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("dy", "1em")
			.attr("x", 0 - height / 6)
			.text(yAxisLabel);

    //draw data bars
    tempChartSvg.selectAll("rect")
	   .data(d)
	   .enter()
	   .append("rect")
	   .attr("x", function (d) { return x_scale(d.time); })
	   .attr("y", function (d) { return y_scale(d.val); })
	   .attr("width", width / d.length - 2)
	   .attr("height", function (d) { return height - margin - y_scale(d.val); })
	   .style("fill", function (d) { return getColour(d['time']); })
	   .style("opacity", .5)
		.on("mouseover", mouseOverBar)
		.on("mouseout", mouseOffBar); 

}

//mouse over event function for bars
function mouseOverBar(d) {
    //change opacity
	d3.select(this)
		.transition()
		.duration(800).style("opacity", 1)

    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltip")
		.html(formatDateTime(d.time) + "<br/>" + $('#dataSelection option:selected').html() + ': ' + d.val)
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250) + "px");

}

//mouse off event function for bars
function mouseOffBar(svg) {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .5)

    d3.select('.tooltip').remove();
}


//draw summary chart for forecast weather
function drawSummary(tempData, pressureData, prepData, windData, cloudLineData) {

    var width = 1000, height = 400, margin = 60, totalHeight = 600, topHeight = 100, bottomHeight = 100;
    var tempChartSvg = d3.select("#chartSpace").append("svg").attr("id", 'summaryChart').attr("width", width).attr("height",
					totalHeight).append("g");

    var x_extent = d3.extent(tempData, function (d) { return d["time"] });
    var y_extentTemp = d3.extent(tempData, function (d) { return d["val"] });
    var y_extentPressure = d3.extent(pressureData, function (d) { return d["val"] });
    var y_extentPrep = d3.extent(prepData, function (d) { return d["val"] });

    var x_scale = d3.time.scale().range([margin, width - margin]).domain(x_extent);
    var y_scaleTemp = d3.scale.linear().range([height - margin, margin]).domain(y_extentTemp);
    var y_scalePressure = d3.scale.linear().range([height - margin, margin]).domain(y_extentPressure);
    var y_scalePrep = d3.scale.linear().range([height - margin, margin]).domain(y_extentPrep);
    var y_scaleCloud = d3.scale.linear().range([topHeight, margin]).domain([-100, 100]);

    var xAxis = d3.svg.axis().scale(x_scale).orient("bottom");
    var yAxisLeft = d3.svg.axis().scale(y_scaleTemp).orient("left");
    var yAxisRight = d3.svg.axis().scale(y_scalePressure).orient("right");
    var yAxisTop = d3.svg.axis().scale(y_scaleCloud).orient("left");

    var lineTemp = d3.svg.line().x(function (d) { return x_scale(d.time); }).y(function (d) { return y_scaleTemp(d.val) + topHeight; });
    var linePressure = d3.svg.line().x(function (d) { return x_scale(d.time); }).y(function (d) { return y_scalePressure(d.val) + topHeight; });
    var lineCloud = d3.svg.line().x(function (d) { return x_scale(d.time); }).y(function (d) { return y_scaleCloud(d.val); });

    //make x axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (height - margin + topHeight) + ")")
		.call(xAxis);

    //make left y axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin + "," + (topHeight) + ")")
		.call(yAxisLeft)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("dy", "1em")
			.attr("x", 0 - height / 6)
			.style("text-anchor", "left")
			.text('Temperature')
			.style("fill", "red");

    //make right y axis
    tempChartSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + (width - margin) + "," + (topHeight) + ")")
		.call(yAxisRight)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("dy", "1em")
			.attr("x", 0 - height / 10)
			.style("text-anchor", "middle")
			.text('Pressure')
			.style("fill", "green");

    //draw temp data line
    tempChartSvg.append("path")
      .datum(tempData)
      .attr("stroke", "red")
      .attr("fill", "none")
	  .attr("d", lineTemp);

    //draw pressure data line
    tempChartSvg.append("path")
      .datum(pressureData)
      .attr("stroke", "green")
	  .attr("fill", "none")
      .attr("d", linePressure);

    //draw precipitation bars  
    tempChartSvg.selectAll("rect")
	   .data(prepData)
	   .enter()
	   .append("rect")
	   .attr("x", function (d) { return x_scale(d.time); })
	   .attr("y", function (d) { return y_scalePrep(d.val); })

	   .attr("width", width / prepData.length - 2)
	   .attr("height", function(d) { return height - margin - y_scalePrep(d.val); })
	   .style("fill", 'blue')  

	   .style("opacity", .2)
	   .attr("transform", "translate(0,"+ topHeight +")")
		.on("mouseover", mouseOverBarSumm)	
		.on("mouseout", mouseOffBarSumm);	


	//add weather icons
    tempChartSvg.selectAll("image").data(tempData).enter().append("image")
        .attr("x", function (d) {
            var x = x_scale(d["time"])
            return x;
        })
        .attr("y", function (d) {
            var y = y_scaleTemp(d["val"])
            return y;
        })
		.attr('width', 30)
	   .attr('height', 30)
	   .attr("xlink:href",function(d){
            return "icons/"+ d["icon"] +".png"

        })

		.attr("transform", "translate(-15,75)")
		.on("mouseover", mouseOverIcon)
		.on("mouseout", mouseOffIcon);
	

	//draw cloud data line
    tempChartSvg.append("path")
      .datum(cloudLineData)
      .attr("stroke", "grey")
      .attr("fill", "none")
	  .attr("d", lineCloud)
	//label for clouds
    tempChartSvg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("dy", "1em")
		.attr("x", 0 - (topHeight + margin) / 2)
		.style("text-anchor", "middle")
		.text('Clouds')
		.style("fill", "grey");

    //add wind information
    tempChartSvg.selectAll("polygon")
		.data(windData)
		.enter().append("polygon")
		.style("stroke", "none")
		.style("opacity", .5)
		.style("fill", function (d) { return getColour(d['time']); })
		.attr("points", function (d) { return "-4," + d.val * 6 + ", 4," + d.val * 6 + ", 0,-" + d.val * 6 + "" })  //length of triangle depends on wind speed
		.attr("y", 0)
		.attr("transform", function (d) { return "translate(" + x_scale(d.time) + "," + 550 + "), rotate(" + d.direction + ")"; })
		.on("mouseover", mouseOverTriangle)
		.on("mouseout", mouseOffTriangle);

}

//mouse over event function for weather icons
function mouseOverIcon(d) {
    //make icon bigger
    d3.select(this)
		.transition()
		.duration(800)
		.attr('width', 50)
	   .attr('height', 50).ease("elastic")
    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltipSummary")
		.html(formatDateTime(d.time) + '<br/>Temperature: ' + d.val + '\xB0C <br/>Weather: ' + d.weather)
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250) + "px");

}

//mouse off event function for icons
function mouseOffIcon() {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).attr('width', 30)
	   .attr('height', 30).ease("elastic")

    d3.select('.tooltipSummary').remove();
}

//mouse over event function for bars in summary chart
function mouseOverBarSumm(d) {
    d3.select(this)
		.transition()
		.duration(800).style("opacity", 1)

    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltipSummary")
		.html(formatDateTime(d.time) + "<br/>" + 'Precipitation: ' + d.val + 'mm')
		.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX -200 ) + "px")
        .style("top", (d3.event.pageY - 250) + "px");

}

//mouse off event function for bars in summary chart
function mouseOffBarSumm(svg) {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .2)

    d3.select('.tooltipSummary').remove();
}

//mouse over event function for triangles
function mouseOverTriangle(d) {
    //make point bigger
    d3.select(this)
		.transition()
		.duration(800)
		.style("opacity", 1).ease("elastic")
    //show label
    d3.select('#chartSpace').append("div")
		.attr("class", "tooltipSummary")	
		.html(formatDateTime(d.time) + '<br/>Wind speed: ' + d.val + 'm/s <br/>Direction: ' + Math.round(d.direction) + '\xB0')
		.transition()		
		.duration(200)		

		.style("opacity", .9)
		.style("left", (d3.event.pageX -200) + "px")
        .style("top", (d3.event.pageY - 250) + "px");

}

//mouse off event function for triangles
function mouseOffTriangle() {
    //revert changes by mouse over
    d3.select(this)
		.transition()
		.duration(800).style("opacity", .5)
    d3.select('.tooltipSummary').remove();
}
