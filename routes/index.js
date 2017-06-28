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
        res.render("pressure", {pressureData: JSON.stringify(weatherDataArray.map((weatherData) => {
          return {
            x: weatherData.date.toLocaleTimeString(),
            y: weatherData.pressure
          };
        }))});
      });
  } catch (err) {
    console.log(err);
    res.render("pressure", {pressureData: JSON.stringify([{}])});
  }
});

router.post("/set_parameters", (req, res) => {
  try {
    obj = req.body;
    WeatherData.find()
      .sort({data: -1})
      .exec((err, weatherDataArray) => {
        if (err) {
          console.log(err);
          return;
        }
        if ((weatherDataArray.length > 0 && (weatherDataArray[0].data - Date.now() > 5 * 60 * 1000)) || weatherDataArray.length === 0) {
          var weatherData = new WeatherData({
            temperature: obj.dht22_temperature,
            humidity: obj.dht22_humidity,
            pressure: obj.bmp180_pressure
          });
        }
      });
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