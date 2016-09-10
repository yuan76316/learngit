// Run this first, to initialise the data in CouchDB

//replace with valid credentials
//var nano = require('nano')('http://ecb10:h6ajFx42@trenco.cs.st-andrews.ac.uk:10475')

var nano = require('nano')('http://localhost:5984');
var currWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?q=London,uk&appid=10db570f8ecf53a80792691a644218c6';
var forecastWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=London,uk&appid=10db570f8ecf53a80792691a644218c6';

//destroy all database called weather					 
nano.db.destroy('weather', function (err, body) {
	if(err)
   		console.log(err);
	else
		console.log("Successfully deleted database");
});


var request = require('request');

//create a database called weather			
nano.db.create('weather', function (err, body) {        
    weather = nano.db.use('weather');   
    if (!err) { 
		//initialise current weather document
		request({
			url: currWeatherUrl, 
		}, function(error, response, body){
			if(error) {
				console.log(error);
			} else {
				//console.log(body);
				var initCurrWeather = {'2643743' : JSON.parse(body)};	
				initCurrWeather['2643743']['localTime'] = initCurrWeather['2643743']['dt'] ;
				initCurrWeather['2643743']['localSunrise'] = initCurrWeather['2643743']['sys']['sunrise'] ;
				initCurrWeather['2643743']['localSunset'] = initCurrWeather['2643743']['sys']['sunset'] ;
				weather.insert(initCurrWeather, "currentWeather", function (err, body) { 
					if (!err) {
						console.log('Success in initialising current weather');	
						console.log(body);
					}
				});   	
			}	
		});
		//initialise forecast weather document
		request({
			url: forecastWeatherUrl, 
			//method: 'POST',
		}, function(error, response, body){
			if(error) {
				console.log(error);
			} else {
				var initForecastWeather = {'2643743' : JSON.parse(body)};	
				weather.insert(initForecastWeather, "forecastWeather", function (err, body) { 
					if (!err) {
						console.log('Success in initialising forecast weather');	
						console.log(body);
						populate();						
					}
				});   	
			}	
		});
		
    }else{
		console.log("Error when initialising weather.");
	};

});

function populate(){
	makeCallAndStore('1816670');
	setTimeout(function() {
	    makeCallAndStore('5128581');
	}, 500);	
}

function makeCallAndStore(locationID){
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
					if (locationID == '1816670'){
						currWeather['1816670']['localTime'] = currWeather['1816670']['dt'] ;
						currWeather['1816670']['localSunrise'] = currWeather['1816670']['sys']['sunrise'] + (3600*7) ;
						currWeather['1816670']['localSunset'] = currWeather['1816670']['sys']['sunset']  + (3600*7);
					} else {
						currWeather['5128581']['localTime'] = currWeather['5128581']['dt'] ;
						currWeather['5128581']['localSunrise'] = currWeather['5128581']['sys']['sunrise'] -  (3600*5);
						currWeather['5128581']['localSunset'] = currWeather['5128581']['sys']['sunset'] -  (3600*5);					
					}	
					weather.insert(currWeather, 'currentWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
			});
			
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
					for (i = 0; i < (forecastWeather[locationID].list.length) ; i++) {
						if (locationID == '1816670'){
								forecastWeather[locationID]['list'][i]['localTime'] = forecastWeather[locationID]['list'][i]['dt'] + (3600*7);
							} else {
								forecastWeather[locationID]['list'][i]['localTime'] = forecastWeather[locationID]['list'][i]['dt'] -  (3600*5);				
							}		
					}
					weather.insert(forecastWeather, 'forecastWeather', function(err_t, t) { 
						//console.log(req.body);
					});
				}	
			});
			
		}	
	});		
}





