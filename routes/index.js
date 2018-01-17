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
          return (new Date(weatherData.date.toLocaleString("ru-Ru", {timeZone: "Europe/Minsk"}))).getHours();
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

function renderHomePage(res) {
  var result = {
    dataX: "",
    temperatureChart: {
      data: "",
      scaleName: "",
      curveName: ""
    },
    humidityChart: {
      data: "",
      scaleName: "",
      curveName: ""
    },
    pressureChart: {
      data: "",
      scaleName: "",
      curveName: ""
    }
  };
  try {
    WeatherData.find()
      .sort({date: -1})
      .limit(12)
      .exec(function(err, weatherDataArray) {
        if (err) {
          console.log(err);
          return null;
        }
        var dataX = [];
        var temperatureData = [];
        var humidityData = [];
        var pressureData = [];
        for (var i = weatherDataArray.length - 1; i >= 0; i--) {
          dataX.push((new Date(weatherDataArray[i].date.toLocaleString("ru-Ru", {timeZone: "Europe/Minsk"}))).getHours());
          temperatureData.push(weatherDataArray[i].temperature);
          humidityData.push(weatherDataArray[i].humidity);
          pressureData.push(weatherDataArray[i].pressure);
        }
        result.dataX = JSON.stringify(dataX);
        result.temperatureChart.data = JSON.stringify(temperatureData);
        result.humidityChart.data = JSON.stringify(humidityData);
        result.pressureChart.data = JSON.stringify(pressureData);
        result.mutliChartHeader = "Графики показаний";
        result.temperatureChart.scaleName = "градусы, *С";
        result.temperatureChart.curveName = "Температура";
        result.humidityChart.scaleName = "влажность, %";
        result.humidityChart.curveName = "Влажность";
        result.pressureChart.scaleName = "давление, мм рт.ст.";
        result.pressureChart.curveName = "Давление";
        //console.log(result);
        res.render("home", {parameters: obj.parameters, multiChart: result});
      });
  } catch (err) {
    console.log(err);
    return null;
  }
}

router.get("/", (req, res) => {
  renderHomePage(res);
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
        temperature: findParameterValue(obj.parameters, "temperature"),
        humidity: findParameterValue(obj.parameters, "humidity"),
        pressure: findParameterValue(obj.parameters, "pressure")
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