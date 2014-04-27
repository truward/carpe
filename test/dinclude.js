var fs = require('fs');
var vm = require('vm');

function includeFile(path) {
  var code = fs.readFileSync(path);
  eval.call(global, code.toString());//vm.runInThisContext(code, path);
};

module.exports.includeFile = includeFile;

