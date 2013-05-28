var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var path = require('path');

var files = [
    'core.js',
    'config.js',
    'i64.js'
];

files.forEach(function (file) {
    var filePath = path.resolve(__dirname, '../js-modules/', file)
    vm.runInThisContext(fs.readFileSync(filePath));
    if (file === 'core.js')
        PROTO.log = console.log.bind(PROTO);
});

describe('Structures', function () {

	describe('I64', function () {
		it('should toNumber() return right result', function () {
			assert.equal(new PROTO.I64(0, 0, 1).toNumber(), 0);
			assert.equal(new PROTO.I64(0, 0, -1).toNumber(), 0);
			//assert.equal(new PROTO.I64(1, 2, 1).toNumber(), 0);
			//assert.equal(new PROTO.I64(100, 2000, 1).toNumber(), 0);
		});

		it('should toString() return right result', function () {
			assert.equal(new PROTO.I64(0, 0, 1).toString(), '0x0000000000000000');
			assert.equal(new PROTO.I64(0, 0, -1).toString(), '-0x0000000000000000');
		//	assert(new PROTO.I64(1, 2, 1).toString(), 0);
		//	assert(new PROTO.I64(100, 2000, 1).toString(), 0);
		});
	});

});
