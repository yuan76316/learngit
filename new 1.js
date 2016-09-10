app.get('/currWeather/:city', getCities);


function getCities(req, res) {
    weather.get('currentCities', { revs_info : true }, function (err, currentCities) {
		if(err){
			console.error("error obtaining current weather", err);
			res.json({error: 'Error obtaining current weather'});
		}else {
			//console.log("current weather", currentWeather[req.params.location])
			for(i=0;i<currentCities.['cities'].length;i++){
				if(currentWeather['cities'] contains req.params.city)
				array.push(currentWeather['cities']);
					
			}
			res.json(array);
		}
    });
}