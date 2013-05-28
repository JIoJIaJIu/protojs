var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var path = require('path');

var files = [
    'core.js',
    'config.js',
    'i64.js',
    'struct/base_types.js',
    'struct/number.js',
    'struct/message.js',
    'struct/group.js'
];

files.forEach(function (file) {
    var filePath = path.resolve(__dirname, '../js-modules/', file)
    vm.runInThisContext(fs.readFileSync(filePath));
    if (file === 'core.js')
        PROTO.log = console.log.bind(PROTO);
});

describe('Message', function () {

    var testMessage1 = PROTO.Message('Test_Message1', {
       'field1': {
           id: 1,
           options: {},
           multiplicity: PROTO.optional,
           type: function () { return PROTO.string; }
       },
       'field2': {
           id: 2,
           options: {},
           multiplicity: PROTO.required,
           type: function () { return PROTO.int64; }
       }
    });

    var testMessage2 = PROTO.Message('Test_Message2', {
        NestedMessage: PROTO.Message('Test_NestedMessage', {
            'field1': {
                id: 101,
                options: {},
                multiplicity: PROTO.required,
                type: function() { return PROTO.int64; }
            }
        }),
        'field1': {
            id: 1,
            options: {},
            multiplicity: PROTO.repeated,
            type: function() { return testMessage2.NestedMessage; }
        },
        'field2': {
            id: 2,
            options: {},
            multiplicity: PROTO.optional,
            type: function() {return PROTO.bool; }
        }
    });

    var testMessage3 = PROTO.Message('Test_Message3', {
        'fieldGroup': PROTO.Group('Test_Group1', 1, {
            'field1': {
                id: 1,
                options: {},
                multiplicity: PROTO.optional,
                type: function() { return PROTO.int64; }
            }
        })
    });

    describe('SetField/GetField', function () {
        var message1 = new testMessage1();
        message1.field1 = "value one";
        message1.field2 = PROTO.I64.fromNumber(123);

        var message2 = new testMessage2();
        message2.field1 = new testMessage2.NestedMessage();
        message2.field1.field1 = PROTO.I64.fromNumber(321);
        message2.field2 = true;

        it('should return right value', function () {
            assert.equal("value one", message1.field1);
            assert.equal(123, message1.field2);
            assert.equal(321, message2.field1.field1);
            assert.equal(true, message2.field2);
        });

    });

    describe('Covert', function () {
        var message1 = {
            field1: "XYZ",
            field2: PROTO.I64.fromNumber(5)
        };

        var message2 = {
            field1: {
                field1: "ABC"
            },
            field2: false
        };

        it('should return right value', function () {
            assert.equal("XYZ", message1.field1);
            assert.equal(5, message1.field2);
            assert.equal("ABC", message2.field1.field1);
            assert.equal(false, message2.field2);
        });
    });

    describe('Group', function () {
        var message3 = new testMessage3();
        message3.fieldGroup = {};
        message3.fieldGroup.field1 = PROTO.I64.fromNumber(1);

        it('shoud return right value', function () {
            assert.equal(1, message3.fieldGroup.field1);
        });
    });

});
