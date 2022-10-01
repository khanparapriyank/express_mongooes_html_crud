var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var axios = require('axios')
const cors = require('cors');
require('dotenv/config');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    if (err) {
		console.log("Error!" + err);
	}
	console.log('Connected!!')
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors({ origin: '*' }));
app.set("view engine", "ejs");

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });
var productModel = require('./model');
var itemList = [];

app.get('/', (req, res) => {
	productModel.find().sort({pid: 1}).exec((err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			console.log('Data Found!');
            res.status(200).send(items);
		}
	});
});

app.get('/:id', (req, res) => {
	let id = req.params.id;
    if (!id) {
      return res.status(400).send();
    }
    productModel.find({pid : id}, (err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
            console.log('Data Found of id : ', id);
            res.status(200).send(items[0]);
		}
	});
});

app.post('/', (req, res) => {
	var obj = {
        pid: req.body.pid,
		name: req.body.name,
		price: req.body.price,
	}
	productModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
            res.status(500).send('An error occurred', err);
		}
		else {
            console.log("Data Inserted!");
            res.status(200).send("Data Inserted!");
		}
	});
});

app.get('/update/:id', (req, res) => {
    var id = req.params.id;
    if (!id) {
      return res.status(400).send();
    }
    productModel.findOneAndUpdate({ pid: id } , { name: req.query.name, price: req.query.price}, function(err, product) {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            console.log('Data Updated!');
            res.status(200).send('Data Updated!');
        }
    });
});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    if (!id) {
      return res.status(400).send();
    }
    productModel.findOneAndRemove({ pid: id }, function(err) {
        if (err) {
			console.log(err);
            res.status(500).send('An error occurred', err);
		}
		else {
            console.log('Data Deleted!');
            res.status(200).send('Data Deleted!');
        }
    });
});

app.get('/flickr/image', (req, res) => {
    var _search = req.query.search;
    _search = _search.toString().replace(/(\s*,?\s*)*$/, "")

    var urlData = "https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&tags="+ _search
    axios.get(urlData).then(response => {
        console.log("Flickr Data Found!");
        res.status(200).send(response.data.items);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error occurred', err);
    });
});

var port = process.env.PORT || '3000';
app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})
