//this is the sever side
var http = require('http');
var express = require('express');
var json = require('express-json');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');


//Secure HTTP from https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/

var options = {
    key: fs.readFileSync('ssl/private.pem'),
    cert: fs.readFileSync('ssl/certificate.pem')
};

//replace with valid credentials
//var dbUrl = 'http://ecb10:h6ajFx42@trenco.cs.st-andrews.ac.uk:10475';
var dbUrl = 'http://localhost:5984';


var nano = require('nano')(dbUrl);

var weather = nano.db.use('weather'); 

var app = express()
var request = require('request');
app.use(json());
app.use(express.query());
app.use(bodyParser.text()); 

app.use(express.static('content'));


app.listen(8083, function () {
    console.log('Server running at http://127.0.0.1:8083/');
});


//start HTTPS server
https.createServer(options, app).listen(8082, function () {
    console.log('Secure HTTP server running through 8082');
});


app.get('/currWeather/:location', getCurrWeather);
app.get('/forecastWeather/:location', getForecastWeather);
app.post('/locationSearch/:location', makeCallAndStore);
app.post('/coordSearch/:locationCoord', currLocationCall);

app.get('/allCurrWeather', getAllCurrWeather);
app.get('/allForeWeather', getAllForeWeather);
app.get('/deleteData/:location', deleteData);

//get current weather data based on location id
function getCurrWeather(req, res) {
    weather.get('currentWeather', { revs_info : true }, function (err, currentWeather) {
		if(err){
			console.error("error obtaining current weather", err);
			res.json({error: 'Error obtaining current weather'});
		}else {
			//console.log("current weather", currentWeather[req.params.location])
			res.json(currentWeather[req.params.location]);
		}
    });
}

//get forecast weather data based on location id
function getForecastWeather(req, res) {
    weather.get('forecastWeather', { revs_info : true }, function (err, currentWeather) {
		if(err){
			console.error("error obtaining forecast weather", err);
			res.json({error: 'Error obtaining forecast weather'});
		}else {
			//console.log("forecast weather", currentWeather[req.params.location])
			res.json(currentWeather[req.params.location]);
		}
   });
}

//make API call based on location id and save it to database
function makeCallAndStore(req,res){
	var locationID = req.params.location;
	//make current weather call
	var currWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?id=' + locationID + '&appid=10db570f8ecf53a80792691a644218c6';
	request({
		url: currWeatherUrl, 
	}, function(error, response, body){
		if(error) {
			console.log(error);
		} else {

			//console.log(JSON.parse(body)); 
			var dataFromCall = JSON.parse(body)

			weather.get('currentWeather', { revs_info : true }, function (err, currWeather) {      
				if (!err) {
					currWeather[locationID] = dataFromCall;
					weather.insert(currWeather, 'currentWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
				res.end();
			});
			changeTimeCurr(locationID, dataFromCall.coord.lon, dataFromCall.coord.lat, dataFromCall.dt);

		}	
	});
	
	//make forecast weather call
	var forecastWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?id=' + locationID + '&appid=10db570f8ecf53a80792691a644218c6';
	request({
		url: forecastWeatherUrl, 
	}, function(error, response, body){
		if(error) {
			console.log(error);
		} else {
			//console.log(JSON.parse(body)); 

			dataFromCall2 = JSON.parse(body);
			weather.get('forecastWeather', { revs_info : true }, function (err, forecastWeather) {      
				if (!err) {
					forecastWeather[locationID] = dataFromCall2;
					weather.insert(forecastWeather, 'forecastWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
				res.end();
			});
			changeTimeFore(locationID, dataFromCall2.city.coord.lon, dataFromCall2.city.coord.lat, dataFromCall2.list['0']['dt']);

		}	
	});		
}

//get current weather from database
function getAllCurrWeather(req, res) {
    weather.get('currentWeather', { revs_info: true }, function (err, currWeather) {
        if (!err) {
	//update the database with the new data.
	for( var i in currWeather){
		if(i!="init"&&i!="_rev"&&i!="_id"&&i!='_revs_info'&&i!="undefined"){
			var currWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?id=' + i + '&appid=10db570f8ecf53a80792691a644218c6';
		request({
			url: currWeatherUrl, 
		}, function(error, response, body){
			if(error) {
				console.log(error);
			} else {
				var dataFromCall = JSON.parse(body);
				weather.get('currentWeather', { revs_info : true }, function (err, currrWeather) {      
					if (!err) {
						currrWeather[i] = dataFromCall;
						weather.insert(currrWeather, 'currentWeather', function(err_t, t) { 
						});
					}	
					
				})
			}	
		});
		}
	}
			 res.json(currWeather);
           
        } else {
            console.error("error obtaining current weather", err);
            res.json({ error: 'Error obtaining current weather' });
        }
    });
}


//get forecast weather from database
function getAllForeWeather(req, res) {
    weather.get('forecastWeather', { revs_info: true }, function (err, foreWeather) {
        if (!err) {
            res.json(foreWeather);
        } else {
            console.error("error obtaining forecast weather", err);
            res.json({ error: 'Error obtaining forecast weather' });
        }
    });
}

function deleteData(req, res) {
    var id = req.params.location;
   
	weather.get('currentWeather', { revs_info : true }, function (err, currrWeather) {
		delete currrWeather[id];
	
		weather.insert(currrWeather, 'currentWeather', function (err, t) {
            //console.log(currrWeather);
			res.json(currrWeather);
        });	
	
	 });
}


//make API call based on location coord and save it to database  (same as makeCallAndStore)
function currLocationCall(req,res){
	//make current weather call
	var currWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?'+ req.params.locationCoord +'&appid=10db570f8ecf53a80792691a644218c6';
	request({
		url: currWeatherUrl, 
	}, function(error, response, body){
		if(error) {
			console.log(error);
		} else {
			//console.log(JSON.parse(body)); 
			var dataFromCall = JSON.parse(body);

			weather.get('currentWeather', { revs_info : true }, function (err, currWeather) {      
				if (!err) {
					currWeather[dataFromCall.id] = dataFromCall;
					currWeather['currLocation'] = dataFromCall;
					weather.insert(currWeather, 'currentWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
				res.end();
			});
			changeTimeCurr(dataFromCall.id, dataFromCall.coord.lon, dataFromCall.coord.lat, dataFromCall.dt);
			changeTimeCurr('currLocation', dataFromCall.coord.lon, dataFromCall.coord.lat, dataFromCall.dt);
		}	
	});
	
	//make forecast weather call
	var forecastWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?'+req.params.locationCoord +'&appid=10db570f8ecf53a80792691a644218c6';
	request({
		url: forecastWeatherUrl, 
	}, function(error, response, body){
		if(error) {
			console.log(error);
		} else {
			//console.log(JSON.parse(body)); 
			dataFromCall2 = JSON.parse(body);
			weather.get('forecastWeather', { revs_info : true }, function (err, forecastWeather) {      
				if (!err) {
					forecastWeather[dataFromCall2.city.id] = dataFromCall2;
					forecastWeather['currLocation'] = dataFromCall2;
					weather.insert(forecastWeather, 'forecastWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
				res.end();
			});
			changeTimeFore(dataFromCall2.city.id, dataFromCall2.city.coord.lon, dataFromCall2.city.coord.lat, dataFromCall2.list['0']['dt']);
			changeTimeFore('currLocation', dataFromCall2.city.coord.lon, dataFromCall2.city.coord.lat, dataFromCall2.list['0']['dt']);
		}	
	});		
}


//add local time data for currentWeather
function changeTimeCurr(locationID, lon, lat, timestamp) {
    var timeZoneUrl = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + lat + ',' + lon + '&timestamp=' + timestamp + '&key=AIzaSyDLGQmDQl83nJRSfakUxCux7zaR13ae4gM'
    request({
        url: timeZoneUrl,
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            //console.log(JSON.parse(body)); 
            weather.get('currentWeather', { revs_info: true }, function (err, currWeather) {
                if (!err) {
                    currWeather[locationID]['localTime'] = currWeather[locationID]['dt'] + JSON.parse(body).dstOffset + JSON.parse(body).rawOffset- 3600;
                    currWeather[locationID]['localSunrise'] = currWeather[locationID]['sys']['sunrise'] + JSON.parse(body).dstOffset + JSON.parse(body).rawOffset- 3600;
                    currWeather[locationID]['localSunset'] = currWeather[locationID]['sys']['sunset'] + JSON.parse(body).dstOffset + JSON.parse(body).rawOffset - 3600;
                    weather.insert(currWeather, 'currentWeather', function (err_t, t) {
                        //console.log(req.body);
                    });
                }
            })
        }
    });
}

//add local time data for forecastWeather
function changeTimeFore(locationID, lon, lat, timestamp) {
    var timeZoneUrl = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + lat + ',' + lon + '&timestamp=' + timestamp + '&key=AIzaSyDLGQmDQl83nJRSfakUxCux7zaR13ae4gM'
    request({
        url: timeZoneUrl,
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            //console.log(JSON.parse(body));
            weather.get('forecastWeather', { revs_info: true }, function (err, forecastWeather) {
                if (!err) {
                    for (i = 0; i < (forecastWeather[locationID].list.length) ; i++) {
                        forecastWeather[locationID]['list'][i]['localTime'] = forecastWeather[locationID]['list'][i]['dt'] + JSON.parse(body).dstOffset + JSON.parse(body).rawOffset - 3600;
                    }
                    weather.insert(forecastWeather, 'forecastWeather', function (err_t, t) {
						//console.log(req.body);
                    });
                }
            })
        }
    });
}


