
var Forecast = require('forecast');


var currentForecast;
function getWeather() {
	return "It's " + currentForecast.currently.summary + " with a temperature of " + currentForecast.currently.temperature + " degrees!";
}

module.exports.GetCurrentWeather = function () {
    return currentForecast.currently;
}

function refreshWeather(forecast) {
    forecast.get([56.4620, -3.1069149], function (err, weather) {
        if (err) return console.dir(err);
        currentForecast = weather;
        setTimeout(refreshWeather, 3600000, forecast);
    });	 
}

module.exports.init = function () {
    
    //FORECAST
    var forecast = new Forecast({
        service: 'darksky',
    key: 'de4d2a752ffd21ca78d2394339e4a01d',
    units: 'celcius',
    cache: true,      // Cache API requests 
    ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
        minutes: 27,
        seconds: 45
    }
    })

    refreshWeather(forecast);    

    //WEATHER
    bot.dialog('weather',
        [
            function (session, args) {
                console.log(args.entities);
                if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city') != null) {
                    if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city').entity != 'dundee') {
                        session.send("Why do you want to know about that place! :'(");
                        session.endDialog();
                    } else {
                        session.send(getWeather());
                    }
                } else {
                    session.send(getWeather());
                }
            }
        ]
    );


    //UserWeather
    bot.dialog('/userWeather', [
        function (session, args) {
            session.send('The weather is lovely in Dundee today!');
        }
    ]);

    // WeatherTest
    bot.dialog('weatherTest', function (session, args) {
        console.log(args);
        var intent = args.intent;
            session.beginDialog('weather', intent);
    }).triggerAction({ matches: 'checkWeather' });
}