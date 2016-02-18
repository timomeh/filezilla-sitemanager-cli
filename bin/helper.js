var chalk = require("chalk");

exports.printErrorAndExit = function(msg) {
  console.log(chalk.red(msg));
  process.exit(1);
}

exports.notifyAndExit = function(msg) {
  console.log(chalk.yellow(msg));
  process.exit(0);
}

exports.decodeBase64 = function(str) {
  return new Buffer(str, "base64").toString("utf-8");
}
