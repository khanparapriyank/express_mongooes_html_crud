var mongoose = require('mongoose');
var imageSchema = new mongoose.Schema({
	pid: String,
    name: String,
	price: Number,
});
module.exports = new mongoose.model('Product', imageSchema);