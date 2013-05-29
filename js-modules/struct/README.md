## Structs

### Message

Protobuf declaration:

```protobuf
package AddressBook;

message Person {
  required string name = 1;
  required int32 id = 2;
  optional string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    required string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phone = 4;
}
```

Javascript Protobuf declaration:

```javascript
var AddressBook;
if (typeof AddressBook === "undefined")
    AddressBook = {};

AddressBook.Person = PROTO.message("AddressBook.Person", {
    name: {
        id: 1,
        options: {},
        multiplicity: PROTO.required,
        type: function() { return PROTO.string; }
    },

    id: {
        id: 2,
        options: {},
        multiplicity: PROTO.required,
        type: function() { return PROTO.int32; }
    },

    email: {
        id: 3,
        options: {},
        multiplicity: PROTO.optional,
        type: function() { return PROTO.string; }
    },

    PhoneType: PROTO.Enum("AddressBook.Person.PhoneType",{
        MOBILE :0,
        HOME :1,
        WORK :2
    }),

    PhoneNumber: PROTO.Message("AddressBook.PhoneNumber", {
        number: {
            options: {},
            multiplicity: PROTO.required,
            type: function() { return PROTO.string; },
            id: 1
        },
        type: {
            options: {
                get default_value() {
                    return AddressBook.Person.PhoneType.HOME;
                }
            },
            multiplicity: PROTO.optional,
            type: function() { return AddressBook.Person.PhoneType; },
            id: 2
        }})
    }),

    phone: {
        id: 4,
        options: {},
        multiplicity: PROTO.repeated,
        type: function() { return AddressBook.Person.PhoneNumber; }
    }
});
```

There is 1 constraints in javascript implementation:
  1.  field name could not be same as name of inner Message or inner Enum:


### Groups (deprecated)

### Serializing
There is 2 types of serializing:
  * [to Steam](/js-modules/stream/README.md)
  * to Array
