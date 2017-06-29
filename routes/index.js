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

var count = 0;
var maxCounts = 12 * 30;  // wifi module post data to server 12 times per minute
var lastPostDate = new Date();

var findParameterValue = function(parameters, parameterName) {
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
          return weatherData.date.toLocaleTimeString("en-Us", {hour12: false});
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
    count++;
    var currentDate = new Date();
    if ((currentDate.getMinutes() % 5 == 0) && (currentDate.getMinutes() !== lastPostDate.getMinutes())) {
      WeatherData.create({
        temperature: findParameterValue(obj.parameters, "dht22_tempetature"),
        humidity: findParameterValue(obj.parameters, "dht22_humidity"),
        pressure: findParameterValue(obj.parameters, "bmp180_pressure")
      });
      lastPostDate = currentDate;
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