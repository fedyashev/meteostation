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

var pressureDataArray = [
  {x: 1, y: 740},
  {x: 2, y: 742},
  {x: 3, y: 743},
  {x: 4, y: 742},
  {x: 5, y: 745},
  {x: 6, y: 746},
  {x: 7, y: 746},
  {x: 8, y: 746},
  {x: 9, y: 747},
  {x: 10, y: 746},
  {x: 11, y: 745},
  {x: 12, y: 744}
];

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
      .sort({data: -1})
      .limit(12)
      .exec(function(err, weatherDataArray) {
        if (err) {
          console.log(err);
          return;
        }
        var pressureDataString = JSON.stringify(weatherDataArray.map((weatherData) => {
          return {
            x: weatherData.date.getTime(),
            y: weatherData.pressure
          };
        }));
        console.log(pressureDataString);
        res.render("pressure", {pressureData: pressureDataString});
      });
  } catch (err) {
    console.log(err);
    res.render("pressure", {pressureData: JSON.stringify([{}])});
  }
});

router.post("/set_parameters", (req, res) => {
  try {
    obj = req.body;
    WeatherData.create({
      temperature: findParameterValue(obj.parameters, "dht22_tempetature"),
      humidity: findParameterValue(obj.parameters, "dht22_humidity"),
      pressure: findParameterValue(obj.parameters, "bmp180_pressure")
    });
    // WeatherData.find()
    //   .sort({data: -1})
    //   .exec((err, weatherDataArray) => {
    //     if (err) {
    //       console.log(err);
    //       return;
    //     }
        
    //     // if ((weatherDataArray.length > 0 && (weatherDataArray[0].data - Date.now() > 5 * 60 * 1000)) || weatherDataArray.length === 0) {}
    //   });
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