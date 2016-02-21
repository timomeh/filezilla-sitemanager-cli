#!/usr/bin/env node

var os = require("os");
var fs = require("fs");
var path = require("path");
var printErrorAndExit = require("./helper").printErrorAndExit;
var notifyAndExit = require("./helper").notifyAndExit;
var decodeBase64 = require("./helper").decodeBase64;

// yargs config
var argv = require("yargs")
  .usage("Usage: $0 <name> [options]")
  .boolean("p")
  .alias("p", "pass")
  .default("p", true)
  .describe("p", "Copy password")
  .boolean("u")
  .alias("u", "user")
  .describe("u", "Copy username")
  .boolean("e")
  .alias("e", "echo")
  .describe("e", "Print result")
  .version(function() {
    return require('../package.json').version;
  })
  .alias("v", "version")
  .help("h")
  .alias("h", "help")
  .argv;
var xml2js = require("xml2js");
var traverse = require("traverse");
var inquirer = require("inquirer");
var ncp = require("copy-paste");

// Path to Sitemanager XML file
switch (os.platform()) {
  case "darwin":
  case "linux":
    var SITEMNG_PATH = path.resolve(process.env.HOME, ".filezilla/sitemanager.xml");
    break;
  case "win32":
    var SITEMNG_PATH = path.resolve(process.env.APPDATA, "FileZilla/sitemanager.xml");
    break;
  default:
    printErrorAndExit("Unsupported Platform");
}

// Set --pass to false if user is requested
argv.p = !argv.u;
var search = argv._[0];

// Finish him!!1
function finish(data) {
  if (argv.e) {
    console.log(data)
  } else {
    ncp.copy(data);
  }

  process.exit(0);
}


// Callback after finding/selecting the server object
function proceed(obj) {
  var xml = obj.xml;
  var get = obj.path;

  // all ftp data
  var ftp = traverse(xml).get(get);

  // copy user
  if (argv.u) {
    finish(ftp.User[0]);
  }

  // copy pass
  else {
    var pass = ftp.Pass[0]._;
    if (ftp.Pass[0].$.encoding === "base64") {
      pass = decodeBase64(pass);
    }

    finish(pass);
  }
}

// START:
// - Read file
// - Parse file
// - Filter all results
// - Select the current one
//  -> pass to `proceed()`
fs.readFile(SITEMNG_PATH, function (err, data) {
  if (err && err.code === "ENOENT") {
    printErrorAndExit("Error: Couldn't find filezillas sitemanager xml file");
  } else if (err) {
    printErrorAndExit(err.toString())
  }

  var parser = new xml2js.Parser();
  parser.parseString(data, function (err, result) {
    if (err) {
      printErrorAndExit(err.toString())
    }

    var hits = [];
    traverse(result).forEach(function (x) {
      if (search && this.key === "Name" && x[0].toLowerCase().indexOf(search.toLowerCase()) > -1) {
        hits.push(this.parent.path);
      }
      else if (!search && this.key === "Name") {
        hits.push(this.parent.path);
      }
    });

    if (hits.length === 0) {
      notifyAndExit("No results found for: " + search);
    }

    else if (hits.length > 1) {
      inquirer.prompt({
        type: "list",
        name: "choose",
        choices: function () {
          return hits.map(function (val, key) {
            var obj = traverse(result).get(val);
            return { value: key, name: obj.Name + " (" +  obj.User + ")" }
          });
        },
        message: "Multiple sites found. Select one to continue:"
      }, function (ans) {
        return proceed({ xml: result, path: hits[ans.choose] })
      });
    }

    else {
      proceed({ xml: result, path: hits[0] });
    }
  });
});
