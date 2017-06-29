var mongoose = require("mongoose");
var mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

var WeatherDataSchema = mongoose.Schema({
  date: {type: Date, default: Date.now},
  temperature: Number,
  humidity: Number,
  pressure: Number
});

WeatherDataSchema.plugin(mongooseAutoIncrement.plugin, "WeaterData");

var WeaterData = mongoose.model("WeatherData", WeatherDataSchema);

module.exports = WeaterData;