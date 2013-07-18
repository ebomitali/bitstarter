#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";
var URLHTMLFILE_DEFAULT = "url-default.html";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        // http://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1); 
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};



var checkHtmlFromUrl = function(url) {
    restler.get(url).on('complete', function(result) {
    if (result instanceof Error) {
	console.log("%s returned error. Exiting.", url);
	process.exit(1);
    } else {
	fs.writeFileSync(URLHTMLFILE_DEFAULT,result);
	checkJson = checkHtmlFile(URLHTMLFILE_DEFAULT, program.checks);
    }
    });
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
    return outJson;
};
 
var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var checkJson = '';

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file [html_file]', 'Path to index.html')
        .option('-u, --url [external_url]', 'External Url')
        .parse(process.argv);
    if (program.file) {
	console.log("checking file");
	checkJson = checkHtmlFile(program.file, program.checks);
    } else if (program.url) {
	console.log("checking url");
        checkJson = checkHtmlFromUrl(program.url, program.checks);
    } else {
	console.log("No file or url. Exiting.");
	process.exit(1);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
