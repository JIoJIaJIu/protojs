"use strict";

(function (PROTO, undefined) {

PROTO.Float = makeclass(convertFloatingPoint, writeFloat, readFloat);
PROTO.Double = makeclass(convertFloatingPoint, writeDouble, readDouble);
PROTO.Float.wiretype = PROTO.wiretypes.fixed32;
PROTO.Double.wiretype = PROTO.wiretypes.fixed64;
PROTO.bool = makeclass(function(bool) {return !!bool ? true : false;}, serializeInt32, parseUInt32);

// 32 bits
PROTO.sfixed32 = makeclass(convertS32, serializeFixed32, parseSFixed32);
PROTO.fixed32 = makeclass(convertU32, serializeFixed32, parseFixed32);
PROTO.sfixed32.wiretype = PROTO.wiretypes.fixed32;
PROTO.fixed32.wiretype = PROTO.wiretypes.fixed32;

PROTO.int32 = makeclass(convertS32, serializeInt32, parseInt32);
PROTO.sint32 = makeclass(convertS32, serializeSInt32, parseSInt32);
PROTO.uint32 = makeclass(convertU32, serializeInt32, parseUInt32);

// 64bits
PROTO.sfixed64 = makeclass(convert64, serializeSFixed64, parseSFixed64);
PROTO.fixed64 = makeclass(convert64, serializeFixed64, parseFixed64);
PROTO.sfixed64.wiretype = PROTO.wiretypes.fixed64;
PROTO.fixed64.wiretype = PROTO.wiretypes.fixed64;

PROTO.int64 = makeclass(convert64, serializeInt64, parseInt64);
PROTO.sint64 = makeclass(convert64, serializeSInt64, parseSInt64);
PROTO.uint64 = makeclass(convert64, serializeUInt64, parseUInt64);



function makeclass(converter, serializer, parser) {
	var myclass = {
		Convert: converter,
		wiretype: 0,
		SerializeToStream: serializer,
		ParseFromStream: parser,
		toString: function(val) {return "" + val}
	};
	return myclass;
};

function convertU32(n) { //unsigned
	if (n == NaN) {
		throw "not a number: "+n;
	}
	n = Math.round(n);
	if (n < 0) {
		throw "uint32/fixed32 does not allow negative: "+n;
	}
	if (n > 4294967295) {
		throw "uint32/fixed32 out of bounds: "+n;
	}
	return n;
};

function convertS32(n) { // signed
	if (n == NaN) {
		throw "not a number: "+n;
	}
	n = Math.round(n);
	if (n > 2147483647 || n < -2147483648) {
		throw "sfixed32/[s]int32 out of bounds: "+n;
	}
	return n;
};

function serializeFixed32(n, stream) {
	if (n<0) n += 4294967296;
	var arr = new Array(4);
	for (var i = 0; i < 4; i++) {
		arr[i] = n%256;
		n >>>= 8;
	}
	stream.write(arr);
};

function parseFixed32(stream) {
	var n = 0;
	var offset=1;
	for (var i = 0; i < 4; i++) {
		n += offset*stream.readByte();
		offset *= 256;
	}
	return n;
};

function parseSFixed32(stream) {
	var n = parseFixed32(stream);
	if (n > 2147483647) {
		n -= 4294967296;
	}
	return n;
};

function serializeInt32(n, stream) {
	if (n < 0) {
		serializeInt64(PROTO.I64.fromNumber(n),stream);
		return;
	}
	// Loop once regardless of whether n is 0.
	for (var i = 0; i==0 || (n && i < 5); i++) {
		var byt = n%128;
		n >>>= 7;
		if (n) {
			byt += 128;
		}
		stream.writeByte(byt);
	}
};

function serializeSInt32(n, stream) {
	if (n < 0) {
		n = -n*2-1;
	} else {
		n = n*2;
	}
	serializeInt32(n, stream);
};

function parseUInt32(stream) {
	var n = 0;
	var endloop = false;
	var offset=1;
	for (var i = 0; !endloop && i < 5; i++) {
		var byt = stream.readByte();
		if (byt === undefined) {
			PROTO.warn("read undefined byte from stream: n is "+n);
			break;
		}
		if (byt < 128) {
			endloop = true;
		}
		n += offset*(byt&(i==4?15:127));
		offset *= 128;
	}
	return n;
};

//TODO: 
var temp64num = new PROTO.I64(0,0,1);
function parseInt32(stream) {
	var n = PROTO.I64.parseLEVar128(stream,temp64num);
	var lsw=n.lsw;
	if (lsw > 2147483647) {
		lsw -= 2147483647;
		lsw -= 2147483647;
		lsw -= 2;
	}
	return lsw;
};

function parseSInt32(stream) {
	var n = parseUInt32(stream);
	if (n & 1) {
		return (n+1) / -2;
	}
	return n / 2;
};

function convert64(n) {
	if (n instanceof PROTO.I64) {
		return n;
	}
	throw "64-bit integers must be PROTO.I64 objects!";
};

function serializeInt64(n, stream) {
	stream.write(n.convertToUnsigned().serializeToLEVar128());
};

function serializeSInt64(n, stream) {
	stream.write(n.convertFromUnsigned().convertToZigzag().serializeToLEVar128());
};

function serializeUInt64(n, stream) {
	stream.write(n.convertToUnsigned().serializeToLEVar128());
};

function serializeSFixed64(n, stream) {
	stream.write(n.convertToUnsigned().serializeToLEBase256());
};

function serializeFixed64(n, stream) {
	stream.write(n.serializeToLEBase256());
};

function parseSFixed64(stream) {
	return PROTO.I64.parseLEBase256(stream,temp64num).convertFromUnsigned();
};

function parseFixed64(stream) {
	return PROTO.I64.parseLEBase256(stream);
};

function parseSInt64(stream) {
	return PROTO.I64.parseLEVar128(stream,temp64num).convertFromZigzag();
};

function parseInt64(stream) {
	return PROTO.I64.parseLEVar128(stream,temp64num).convertFromUnsigned();
};

function parseUInt64(stream) {
	return PROTO.I64.parseLEVar128(stream);
};

function convertFloatingPoint(f) {
	var n = parseFloat(f);
	if (n == NaN) {
		throw "not a number: "+f;
	}
	return n;
};

function writeFloat(flt, stream) {
	stream.write(PROTO.binaryParser.fromFloat(flt));
};

function readFloat(stream) {
	var arr = stream.read(4);
	return PROTO.binaryParser.toFloat(arr);
};

function writeDouble(flt, stream) {
	stream.write(PROTO.binaryParser.fromDouble(flt));
};

function readDouble(stream) {
	var arr = stream.read(8);
	return PROTO.binaryParser.toDouble(arr);
};

}) (PROTO);
