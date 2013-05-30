"use strict";

(function (PROTO, undefined) {

PROTO.array = (function() {
	/** @constructor */
	function ProtoArray(prop, input) {
		this._datatype = prop.type();
		this.length = 0;

		if (PROTO.IsArray(input)) {
			for (var i = 0; i < input.length; ++i) {
				this.push(input[i]);
			};
		};
	};

	ProtoArray.IsInitialized = function IsInitialized(val) {
		return val.length > 0;
	};

	ProtoArray.prototype.push = function (var_args) {
		if (arguments.length === 0) {
			if (this._datatype.composite) {
				var newval = new this._datatype;
				this[this.length++] = newval;
				return newval;
			} else {
				throw "Called add(undefined) for a non-composite";
			};
		} else {
			for (var i = 0; i < arguments.length; i++) {
				var newval = this._datatype.Convert(arguments[i]);
				if (this._datatype.FromProto) {
					newval = this._datatype.FromProto(newval);
				}
				this[this.length++] = newval;
			};
		};

		return arguments[0];
	};

	ProtoArray.prototype.set = function (index, newval) {
		newval = this._datatype.Convert(newval);
		if (this._datatype.FromProto) {
			newval = this._datatype.FromProto(newval);
		}
		if (index < this.length && index >= 0) {
			this[index] = newval;
		} else if (index == this.length) {
			this[this.length++] = newval;
		} else {
			throw "Called ProtoArray.set with index "+index+" higher than length "+this.length;
		}
		return newval;
	};

	ProtoArray.prototype.clear = function (index, newval) {
		this.length = 0;
	};

	return ProtoArray;
})();

PROTO.string = {
    Convert: function(str) {
        return '' + str;
    },

    wiretype: PROTO.wiretypes.lengthdelim,

    SerializeToStream: function(str, stream) {
        var arr = PROTO.encodeUTF8(str);
        return PROTO.bytes.SerializeToStream(arr, stream);
    },

    ParseFromStream: function(stream) {
        var arr = PROTO.bytes.ParseFromStream(stream);
        return PROTO.decodeUTF8(arr);
    },

    toString: function(str) {
		return str;
	}
};

PROTO.bytes = {
    Convert: function(arr) {
        if (PROTO.IsArray(arr)) {
            return arr;
        } else if (arr instanceof PROTO.ByteArrayStream) {
            return arr.getArray();
        } else if (arr.SerializeToStream) {
            /* This is useful for messages (e.g. RPC calls) that embed
             * other messages inside them using the bytes type.
             */
            // FIXME: should we always allow this? Can this cause mistakes?
            var tempStream = new PROTO.ByteArrayStream;
            arr.SerializeToStream(tempStream);
            return tempStream.getArray();
        } else {
            throw "Not a Byte Array: "+arr;
        }
    },

    wiretype: PROTO.wiretypes.lengthdelim,

    SerializeToStream: function(arr, stream) {
        PROTO.int32.SerializeToStream(arr.length, stream);
        stream.write(arr);
    },

    ParseFromStream: function(stream) {
        var len = PROTO.int32.ParseFromStream(stream);
        return stream.read(len);
    },

    toString: function(bytes) {
		return '[' + bytes + ']';
	}
};

})(PROTO);
