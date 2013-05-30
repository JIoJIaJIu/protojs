/*  ProtoJS - Protocol buffers for Javascript.
 *  protobuf.js
 *
 *  Copyright (c) 2009-2010, Patrick Reiter Horn
 *                2013, Guro jiojiajiu Bokum
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 
 *  * Neither the name of ProtoJS nor the names of its contributors may
 *    be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

(function (PROTO, undefined) {

/**
 *
 * Message example:
 *
 * PROTO.Message('MessageName', {
 *   NestedMessage: PROTO.Message({
 *   ...
 *   }),
 *   name : {
 *     id: 1,
 *     multiplicity: PROTO.optional,
 *     options: {},
 *     type: function() { return PROTO.int64; }
 *   }
 * });
 *
 **/
PROTO.Message = function(name, properties) {

    function Message () {
        this._messageType = name;
        this._properties = properties;
        this._values = {};

        for (var prop in this._properties) {
            (function (prop, self) {
                function Message_GetProp() {
                    return self.GetField(prop);
                };
                function Message_SetProp(newval) {
                    self.SetField(prop, newval);
                };
                PROTO.DefineProperty(self, prop, Message_GetProp, Message_SetProp);
            }) (prop, this);
        };

        return this;
    };

    for (var key in properties) {
        // HACK: classes are currently included alongside properties.
        if (properties[key].isType) {
            Message[key] = properties[key];
            if (!properties[key].isGroup)
                delete properties[key];
        };
    };

    Message.prototype = MessagePrototype;

    Message.isType = true;
    Message.composite = true;
    Message.wiretype = PROTO.wiretypes.lengthdelim;

    //TODO: delete
    Message.IsInitialized = function(value) {
        return value && value.IsInitialized();
    };

    Message.Convert = function Convert(val) {
        if (val instanceof Message);
            return val;

        var obj = new Message();
        if (typeof val === "object") {
            for (var key in val) {
                obj.SetField(key, val[key]);
            };
        };
        return obj;
    };

    Message.SerializeToStream = function(value, stream) {
        var bytearr = new Array();
        var bas = new PROTO.ByteArrayStream(bytearr);
        value.SerializeToStream(bas);
        return PROTO.bytes.SerializeToStream(bytearr, stream);
    };

    Message.ParseFromStream = function(stream) {
        var bytearr = PROTO.bytes.ParseFromStream(stream);
        var bas = PROTO.CreateArrayStream(bytearr);
        var ret = new Message();
        ret.ParseFromStream(bas);
        return ret;
    };

    return Message;
};

var MessagePrototype = {
    MergeFromStream: function MessagePrototype_MergeFromStream(stream) {
        return PROTO.mergeProperties(this._properties, stream, this._values);
    },

    MergeFromArray: function MessagePrototype_MergeFromArray(array) {
        return this.MergeFromStream(PROTO.CreateArrayStream(array));
    },

    ParseFromStream: function MessagePrototype_ParseFromStream(stream) {
        this.Clear();
        return this.MergeFromStream(stream);
    },

    ParseFromArray: function MessagePrototype_ParseFromArray(array) {
        this.Clear();
        return this.MergeFromArray(array);
    },

    SerializeToStream: function MessagePrototype_SerializeToStream(outstream) {
        var hasFields = this.computeHasFields();
        for (var propname in hasFields) {
            var val = this.GetField(propname);
            PROTO.serializeProperty(this._properties[propname], outstream, val);
        };
    },

    SerializeToArray: function MessagePrototype_SerializeToArray(arr) {
        var stream = new PROTO.ByteArrayStream(arr);
        this.SerializeToStream(stream);
        return stream.getArray();
    },

    IsInitialized: function MessagePrototype_IsInitialized() {
        var checked_any = false;

        for (var key in this._properties) {
            checked_any = true;

            if (this._values[key] !== undefined) {
                var prop = this._properties[key];

                if (typeof prop.type !== "function" || !prop.type())
                    continue;

                if (prop.multiplicity === PROTO.repeated) {
                    if (PROTO.array.IsInitialized(this._values[key])) {
                        return true;
                    };
                } else {
                    //TODO: refactoring
                    if (!prop.type().IsInitialized ||
                        prop.type().IsInitialized(this._values[key]))
                    {
                        return true;
                    }
                };
            }
        };

        // As a special case, if there weren't any fields, we
        // treat it as initialized. This allows us to send
        // messages that are empty, but whose presence indicates
        // something.
        if (!checked_any) return true;
        // Otherwise, we checked at least one and it failed, so we
        // must be uninitialized.
        return false;
    },

    GetField: function MessagePrototype_GetField(propname) {
        var ret = this._values[propname];

        //TODO: legacy
        var type = this._properties[propname].type && this._properties[propname].type();
        if (ret && type && type.FromProto) {
            return type.FromProto(ret);
        };

        return ret;
    },

    SetField: function MessagePrototype_SetField(propname, value) {
        PROTO.log("SetField " + propname + " " + value);

        if (value === undefined || value === null) {
            this.ClearField(propname);
            return;
        };

        var prop = this._properties[propname];
        if (!prop)
            return;

        if (prop.multiplicity === PROTO.repeated) {
            this.ClearField(propname);

            for (var i = 0, length = value.length; i < length; i++) {
                var val = prop.type().Convert(value[i]);
                this._values[propname].push(val);
            }
        } else {
            this._values[propname] = prop.type().Convert(value);
        };
    },

    computeHasFields: function computeHasFields() {
        var hasFields = {};

        for (var key in this._properties) {
            if (this.HasField(key)) {
                hasFields[key] = true;
            };
        };

        return hasFields;
    },

    HasField: function MessagePrototype_HasField(propname) {
        if (this._values[propname] !== undefined) {
            var prop = this._properties[propname];
            if (!prop.type()) {
                return false;
            };

            if (prop.multiplicity === PROTO.repeated) {
                return PROTO.array.IsInitialized(this._values[propname]);
            } else {
                //TODO: refactoring
                if (!prop.type().IsInitialized ||
                    prop.type().IsInitialized(
                        this._values[propname]))
                {
                    return true;
                }
            };
        };

        return false;
    },

    Clear: function Clear() {
        for (var prop in this._properties) {
            this.ClearField(prop);
        };
    },

    ClearField: function ClearField(propname) {
        var prop = this._properties[propname];

        if (prop.multiplicity === PROTO.repeated) {
            this._values[propname] = new PROTO.array(prop);
        } else {
            delete this._values[propname];
        };
    },
    
    toString: function toString(level) {
        var spaces = "";
        var str = "";

        if (level) {
            str = "{\n";
            for (var i = 0 ; i < level * 2; i++) {
                spaces += " ";
            };
        } else {
            level = 0;
        };

        for (var propname in this._properties) {
            if (!this.HasField(propname))
                continue;

            var prop = this._properties[propname];

            if (typeof prop.type !== "function" || !prop.type())
                continue;

            if (prop.multiplicity === PROTO.repeated) {
                var arr = this._values[propname];
                for (var i = 0, length = arr.length; i < length; i++) {
                    str += this._formatValue(level, spaces, propname, arr[i]);
                };
            } else {
                str += this._formatValue(level, spaces, propname, this._values[propname]);
            };
        };

        if (level) {
            str += "}\n";
        };

        return str;
    },

    _formatValue: function(level, spaces, propname, val) {
        var str = spaces + propname;
        var type = this._properties[propname].type();

        if (type.composite) {
            str += " " + val.toString(level + 1);
        } else if (typeof val === 'string') {
            var myval = val;
            myval = myval.replace("\"", "\\\"")
                         .replace("\n", "\\n")
                         .replace("\r","\\r");
            str += ": \"" + myval + "\"\n";
        } else {
            if (type.FromProto) {
                val = type.FromProto(val);
            };

            if (type.toString) {
                var myval = type.toString(val);
                str += ": " + myval + "\n";
            } else {
                str += ": " + val + "\n";
            };
        };
        return str;
    }
};

PROTO.MessagePrototype = MessagePrototype;

}) (PROTO);
