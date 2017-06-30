var router = require("express").Router();

var WeatherData = require("../models/weatherdata.js");

var obj = {
    parameters: [
      {
        name: "Temperature",
        value: "test"
      },
      {
        name: "Humidity",
        value: "test"
      },
      {
        name: "Pressure",
        value: "test"
      }
    ]
};

var saveEveryMinutes = 30;
var lastPostDate = new Date();
var hourDifference = 3 * 60 * 1000;

function findParameterValue(parameters, parameterName) {
  for (var i = 0; i < parameters.length; i++) {
    if (parameters[i].name === parameterName) return parameters[i].value;
  }
  return null;
};

function renderChart(res, parameterName, chartDescriptionObject) {
  try {
    WeatherData.find()
      .sort({date: -1})
      .limit(12)
      .exec(function(err, weatherDataArray) {
        if (err) {
          console.log(err);
          return;
        }
        var dataX = JSON.stringify(weatherDataArray.map(function(weatherData) {
          //return weatherData.date.toLocaleTimeString("ru-Ru", {hour12: false});
          // return weatherData.date.getHours() + deltaHours;
          return (new Date(weatherData.date + hourDifference)).getHours();
        }).reverse());
        var dataY = JSON.stringify(weatherDataArray.map(function(weatherData) {
          return weatherData[parameterName];
        }).reverse());
        res.render("chart", {
          chartHeader: chartDescriptionObject.chartHeader,
          scaleXDescription: chartDescriptionObject.scaleXDescription,
          curveName: chartDescriptionObject.curveName,
          dataX: dataX,
          dataY: dataY
        });
      });
  } catch (err) {
    console.log(err);
    res.render("chart", {
      chartHeader: chartDescriptionObject.chartHeader,
      scaleXDescription: chartDescriptionObject.scaleXDescription,
      curveName: chartDescriptionObject.curveName,
      dataX: [],
      dataY: []
    });
  }
}

router.get("/", (req, res) => {
  res.render("home", obj);
});

router.get("/pressure", (req, res) => {
  return renderChart(res, "pressure", {
    chartHeader: "Датчик давления BMP180",
    scaleXDescription: "давление, мм рт.ст.",
    curveName: "Давление"
  });
});

router.get("/temperature", (req, res) => {
  return renderChart(res, "temperature", {
    chartHeader: "Датчик температуры DHT22",
    scaleXDescription: "градусы, *С",
    curveName: "Температура"
  });
});

router.get("/humidity", (req, res) => {
  return renderChart(res, "humidity", {
    chartHeader: "Датчик влажности DHT22",
    scaleXDescription: "влажность, %",
    curveName: "Влажность"
  });
});

router.post("/set_parameters", (req, res) => {
  try {
    obj = req.body;
    var currentDate = new Date();
    if (currentDate.getHours() !== lastPostDate.getHours()) {
      WeatherData.create({
        temperature: findParameterValue(obj.parameters, "dht22_tempetature"),
        humidity: findParameterValue(obj.parameters, "dht22_humidity"),
        pressure: findParameterValue(obj.parameters, "bmp180_pressure")
      });
      lastPostDate = currentDate;
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