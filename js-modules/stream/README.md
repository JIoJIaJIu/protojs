## Streams

### Usage

When you want to encode Proto struct in some view as binary view or base64, at first you should create stream.
For example let looks at arraybuffer stream:

`var stream = new PROTO.ArrayBufferStream()`

Each message should have method `SerializeToStream` that serialize message data to stream view

`msg.SerializeToStream(stream)`

After that stream contains encoded data of message

### Interface
