var express = require("express");
var router = express.Router();
var api_controller = require("../controllers/api");

router.post('/:id', api_controller.post_id);

module.exports = router;