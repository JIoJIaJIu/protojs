var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var path = require('path');

var files = [
    'core.js',
    'config.js'
];

files.forEach(function (file) {
    var filePath = path.resolve(__dirname, '../js-modules/', file)
    vm.runInThisContext(fs.readFileSync(filePath));
    if (file === 'core.js')
        PROTO.log = console.log.bind(PROTO);
});

describe('Core', function () {
});
