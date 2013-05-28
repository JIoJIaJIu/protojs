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

/**
 * NOTICE:
 * this file should be included only after message.js
 *
 * Group example:
 *
 * PROTO.Group('GroupName', 1, {
 *   name: { 
 *     id: 1,
 *     multiplictity: PROTO.optional,
 *     options: {},
 *     type: function() { return PROTO.int64; }
 *   }
 * });
 *
 **/
(function (PROTO, undefined) {

PROTO.Group = function (name, id, properties) {

	function Group () {
		this._groupType = name;
        this._properties = properties;
        this._values = {};

        for (var prop in this._properties) {
            (function (prop, self) {
                function Group_GetProp() {
                    return self.GetField(prop);
                };
                function Group_SetProp(newval) {
                    self.SetField(prop, newval);
                };
                PROTO.DefineProperty(self, prop, Group_GetProp, Group_SetProp);
            }) (prop, this);
        };

		return this;
	};

    for (var key in properties) {
        // HACK: classes are currently included alongside properties.
        if (properties[key].isType) {
            Group[key] = properties[key];
            if (!properties[key].isGroup)
                delete properties[key];
        };
    };

    Group.type = function () { return Group; };
    Group.id = id;

	Group.prototype = GroupPrototype;

	Group.wiretype = PROTO.wiretypes.startgroup;
	Group.isType = true;
	Group.isGroup = true;

	Group.SerializeToStream = function Group_SerializeToStream(str, stream) {
		var arr = PROTO.encodeUTF8(str);
		return PROTO.bytes.SerializeToStream(arr, stream);
	};

	Group.ParseFromStream = function Group_ParseFromStream(stream) {
        var ret = new Group();
        ret.ParseFromStream(stream);
        return ret;
	};

	Group.Convert = function Group_Convert(val) {
        var obj = new Group();
        if (typeof val === "object") {
            for (var key in val) {
                obj.SetField(key, val[key]);
            };
        };
        return obj;
	};

	Group.toString = function Group_toString() {
        return "Group " + name;
    };

    return Group;
};

// include message.js first
var GroupPrototype = PROTO.MessagePrototype;

}) (PROTO);
