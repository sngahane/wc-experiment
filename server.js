// Libraries
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

// Constants
var domain = 'localhost';
var port = process.argv[2] || 1234;

// Create app
var app = module.exports = express();

// Protect thyself:
process.on('uncaughtException', function(error) {
	console.log(error.stack);
});

app.get('/squads', function(req, res){
	console.log('Parsing in progress...');
	var hashCode = function(s) {

		var hash = 0;

		if (s.length === 0) return hash;
		for (i = 0; i < s.length; i++) {
			char = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		return hash;
	};

	var squads_url = 'http://en.wikipedia.org/wiki/2014_FIFA_World_Cup_squads';
	request(squads_url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);

			var squads = {};
			var $group_root;
			var countries = {};
			var groups = ['A','B','C','D','E','F','G', 'H'];

			var $h2 = $('h2');
			for(var i = 0; i < $h2.length; i++) {
				// is group?
				if($($h2[i]).text().match(/Group.+/i) !== null) {
					$group_root = $($h2[i]);
					break;
				}
			}

			$group_root.nextAll('h3').map(function(i, elem) {
				var country = {};
				country.name = $(this).text();
				country.group = groups[Math.floor(i/4)];
				country._id = hashCode(country.name);
				countries[country._id] = country;
				// Try for Brazil
				if(country._id === 1997815692) {
					var $table = $(this).next('table').length;
					console.log('server.js:log', $table);
				}
			});
			console.log('server.js:countries', countries);
			res.send('<h1>' + Object.keys(countries).length + ' squads parsed with success!</h1>');
		}
	});
});

// Startup!
app.listen(port, domain);
console.log('Magic happens at %s:%s!', domain, port);



/*
// To write to the system we will use the built in 'fs' library.
// In this example we will pass 3 parameters to the writeFile function
// Parameter 1 :  output.json - this is what the created filename will be called
// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// Parameter 3 :  callback function - a callback function to let us know the status of our function

fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

	console.log('File successfully written! - Check your project directory for the output.json file');

})
*/