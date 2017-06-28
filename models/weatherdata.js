var mongoose = require("mongoose");
var mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

var WeatherDataSchema = mongoose.Schema({
  date: {type: Date, default: Date.now},
  temperature: {type: Number, default: 0},
  humidity: {type: Number, defualt: 0},
  pressure: {type: Number, defualt: 0}
});

WeatherDataSchema.plugin(mongooseAutoIncrement.plugin, "WeaterData");

var WeaterData = mongoose.model("WeatherData", WeatherDataSchema);

module.exports = WeaterData;