var router = require("express").Router();

var WeatherData = require("../models/weatherdata.js");

var obj = {
    parameters: [
      {
        name: "Temperature",
        value: "25.5"
      },
      {
        name: "Humidity",
        value: "60.6"
      },
      {
        name: "Pressure",
        value: "745.8"
      }
    ]
};

var count = 0;

var findParameterValue = function(parameters, parameterName) {
  for (var i = 0; i < parameters.length; i++) {
    if (parameters[i].name === parameterName) return parameters[i].value;
  }
  return null;
};

router.get("/", (req, res) => {
  res.render("home", obj);
});

router.get("/pressure", (req, res) => {
  try {
    WeatherData.find()
      //.sort({data: 1})
      .limit(12)
      .exec(function(err, weatherDataArray) {
        if (err) {
          console.log(err);
          return;
        }
        var dataX = JSON.stringify(weatherDataArray.map(function(weatherData) {
          return weatherData.date.toLocaleTimeString("en-Us", {hour12: false});
        }));
        var dataY = JSON.stringify(weatherDataArray.map(function(weatherData) {
          return weatherData.pressure;
        }));
        res.render("pressure", {pressureDataX: dataX, pressureDataY: dataY});
      });
  } catch (err) {
    console.log(err);
    res.render("pressure", {pressureData: JSON.stringify([{}])});
  }
});

router.post("/set_parameters", (req, res) => {
  try {
    obj = req.body;
    count++;
    if (count > 60) {
      WeatherData.create({
        temperature: findParameterValue(obj.parameters, "dht22_tempetature"),
        humidity: findParameterValue(obj.parameters, "dht22_humidity"),
        pressure: findParameterValue(obj.parameters, "bmp180_pressure")
      });
      count = 0;
    }
  } catch (err) {
    console.log(err);
  }
  res.end();
});

router.use((req, res, next) => {
  res.status(404).render("404");
});

router.use((err, req, res, next) => {
  if (err) console.log(err);
  res.status(500).render("500");
});

module.exports = router;