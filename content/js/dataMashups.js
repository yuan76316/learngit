var module = new Module();
$(init);
var currOrForecast = 'curr'; //value of the tab to be displayed
var tableDateFormat = "dd MMM, hh:mm a";
var position;


function Module() { }
module.common = {
    //awesome read: https://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
    eliminateDuplicates: function (arr) {
        var i, len = arr.length, out = [], obj = {};
        for (i = 0; i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    },
    prettyLog: function (jsonObject) {
        //console.log(JSON.stringify(jsonObject, null, '\t'));
    },
    getCityNames: function () {
        var nameList = [];
        for (i in cities) {
            nameList.push(cities[i][1] + ", " + cities[i][2])
        }
        return nameList;
    },
    getCityDetails: function (cityName) {
        //filter city details by name, country code
        return cities.filter(function (city) {
            return cityName == city[1] + ", " + city[2]
        });
    },
};
module.ui = {
    initCityAutoComplete: function () {
        $(function () {
            $("#cityListAC").autocomplete({
                source: module.common.getCityNames
            });
        });
    },
};
var cityNames = module.common.eliminateDuplicates(module.common.getCityNames());

function init() {	
    $('#content').hide();
    $('#tabs').hide();
    module.ui.initCityAutoComplete();
    registerLocationSelectButton();
	getAllCurrentDatabaseData();
    getLocation();
    $(function() {
        $( "#cityList" ).autocomplete({
            source: cityNames
        });
    });
}

//specifies on click function for select location button
function registerLocationSelectButton() {
    var userInput;
    //$('#cityList').focus(function () {
    //    console.log('ON FOCUS');
    //    $(this).keydown(function () {
    //        if (event.keyCode == 13) {
    //            userInput = $('#cityList').val();
    //            search(userInput);
    //            //alert('PRESSED ENTER')
    //        }
    //    });
    //});
    $('#selectLocationButton').click(function () {
        userInput = $('#cityList').val();
        search(userInput);
    });
    function search(userInput) {
        if (userInput == "") {
            $('body').prepend('<div class="alert alert-danger" role="alert" id="emptyinput"><span><strong>Please type in a city name</strong></span><div>');
            $('#cityList').focus(function () {
                $('#emptyinput').fadeOut(500);
                setTimeout(function () {
                    $('#emptyinput').remove();
                }, 6000);
            });
            return;
        } else {

            var cityCode = module.common.getCityDetails($('#cityList').val())[0][0];
            makeCall(cityCode);
			getAllCurrentDatabaseData();
            registerTabs();
            $('#tabs').show();
            $('#content').show();
            setTimeout(
              function () {
                  getCurrentDatabaseData(cityCode);
                  getForecastDatabaseData(cityCode);
				  getAllCurrentDatabaseData();

              }, 600);
            showInfo();
            $('#currSummTable').empty();
            $('#weatherIcon').remove();
        }//if
    }//search
}



//delete the the city in the front end
function DeleteRowFunction(value){
	var location=value.id;
	var req = new XMLHttpRequest();
    req.open("GET", "deleteData/"+location);
    req.setRequestHeader("Content-Type", "text/plain");
    req.onreadystatechange = function() {
        getAllCurrentDatabaseData() ;
    }
    req.send(null);

}
//register tabs button to allow selective display of info
function registerTabs() {
    $('.tab').click(function () {
        currOrForecast = $(this).attr("value");
        showInfo();
    })
}

//hide or show info based on the tab selected
function showInfo() {
    if (currOrForecast == 'curr') {
        $('#currSummary').show();
        $('#forecastDiv').hide();
        $('#map').hide();
        $('#pageTitle').text('Current Weather');
    } else if (currOrForecast == 'forecast') {
        $('#currSummary').hide();
        $('#forecastDiv').show();
        $('#map').hide();
        $('#pageTitle').text('Weather Forecast');
    } else {
        $('#currSummary').hide();
        $('#forecastDiv').hide();
        $('#map').show();
        $('#pageTitle').text('Weather Map');
    }
}

//make API calls based on location ID and save to database
function makeCall(locationID) {
    var req = new XMLHttpRequest();
    req.open("POST", 'locationSearch/' + locationID);
    req.setRequestHeader("Content-Type", "text/plain");
    req.onreadystatechange = function () {
        req.onreadystatechange = null;
    };
    req.send(null);
}


//convert temperature units
function KtoCelsius(num) {
    return Math.round(num - 273.15);
}


function formatDateTime(dateTime) {
    month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var hour = '0' + dateTime.getHours();
    return dateTime.getDate() + ' ' + month[dateTime.getMonth()] + ' , ' + hour.slice(-2) + ':00'
}


//get user location
function getLocation() {
    $('title').text('Accept location request to display your local weather');
    $('body').prepend('<div class="alert alert-info" role="alert" id="requestlocation"><span><strong>Please accept location request to display your local weather</strong></span><div>');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
            position = pos;
            callCurrentLocation(pos.coords.latitude, pos.coords.longitude);
            $('title').text('Data Mashup');
            $('#requestlocation').fadeOut(600);
            setTimeout(function () {
                $('#requestlocation').remove();
            }, 1000);
        }, function () {
            $('title').text('Data Mashup');
            $('#requestlocation').remove();
            $('body').prepend('<div class="alert alert-warning" role="alert" id="nolocation"><span><strong>Location Access Denied</strong></span><div>');
            $('#nolocation').delay(5000).fadeOut(500);
            setTimeout(function () {
                $('#nolocation').remove();
            }, 6000);
        });
    } else {
        $('title').text('Data Mashup');
        $('#requestlocation').remove();
        $('body').prepend('<div class="alert alert-warning" role="alert" id="unsupportedlocation"><span><strong>Location Service not supported</strong></span><div>');
        $('#unsupportedlocation').delay(5000).fadeOut(500);
        setTimeout(function () {
            $('#unsupportedlocation').detach();
        }, 6000);

    }
}












