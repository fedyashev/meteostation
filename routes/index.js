var router = require("express").Router();

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

router.get("/", (req, res) => {
  res.render("home", obj);
});

router.use((req, res, next) => {
  res.status(404).render("404");
});

router.use((err, req, res, next) => {
  if (err) console.log(err);
  res.status(500).render("500");
});

module.exports = router;