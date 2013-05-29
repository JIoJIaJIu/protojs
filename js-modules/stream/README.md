## Streams

### Usage

When you want to encode Proto struct in some view as binary view or base64, at first you should create stream.
For example let looks at arraybuffer stream:

`var stream = new PROTO.ArrayBufferStream()`

Each message should have method `SerializeToStream` that serialize message data to stream view

`msg.SerializeToStream(stream)`

After that stream contains encoded data of message

NOTICE:
If you use ArrayBufferStream before sending to server check the length of data.
Some servers could parse blob with protobuf message only when data's length is fixed and no bigger than real ({0} at the and could be error)
Default length of ArrayBuffer is 1024, but when your stream.length is lower you should recreate ArrayBuffer the same length.
But when you use `stream.getUint8Array()` you allways get array with real length.
Use it, not `stream.getArrayBuffer()`

### Interface
```javascript
write: function (Array arr) {},
read: function () {}
```

### Explanation
For each property is called `PROTO.serializeProperty(prop, stream, val)` 
After that `PROTO.int32.SerializeToStream(wireId, stream)` involved where wireId is `0 0002[fid] 002[wiretype]` (example)
It's need for store fid + wiretype at stream
After that `struct.SerailzeToStream(val, stream)` is called  and go on
