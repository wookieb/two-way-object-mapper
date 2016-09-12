# Two way object mapper

Mapper that allows you transform one object to another (and back) using defined rules.

## Install
```
npm install two-way-object-mapper
```

## Simple usage

```js
var ObjectMapper = require('two-way-object-mapper');

var mapper = new ObjectMapper();
mapper
    .addPropertyMapping({
        from: 'firstName',
        to: 'name'
    })
    .addPropertyMapping({
        from: 'lastName',
        to: 'surname'
    });
    
var result = mapper.map({
    firstName: 'Tommy',
    lastName: 'Lee Jones'
}); // {name: 'Tommy', surname: 'Lee Jones'}


mapper.reverseMap(result); // {firstName: 'Tommy', lastName: 'Lee Jones' }

```
## Mapping properties

For very simple mapping properties of the same name use "addSimplePropertiesAssignments". 
```js
var mapper = new ObjectMapper();
mapper.addSimplePropertiesAssignments(['name', 'surname']);

mapper.map({
    name: 'Tommy', 
    surname: 'Lee Jones', 
    age: 18
}); // {name: 'Tommy', surname: 'Lee Jones'}

```

For renaming use "addPropertyMapping".
```js
var mapper = new ObjectMapper();
mapper.addPropertyMapping({
    from: 'name',
    to: 'firstName'
});

mapper.map({
    name: 'Tommy', 
    surname: 'Lee Jones', 
    age: 18
}); // {firstName: 'Tommy'}
```

You can also transform mapped value.
```js

var mapper = new ObjectMapper();
mapper.addPropertyMapping({
    from: 'name',
    to: 'firstName',
    transform: function(value) {
        return value.toUpperCase();
    }
});

mapper.addPropertyMapping({
    from: 'surname',
    to: 'lastName',
    reverseTransform: function(value) {
        return value.toLowerCase();
    }
})

var result = mapper.map({
    name: 'Tommy',
    surname: 'Lee Jones',
    age: 18
}); // {firstName: 'TOMMY', lastName: 'Lee Jones'}

mapper.reverseMap(result); // {name: 'TOMMY', surname: 'lee jones'}

```

Default values are also supported.


```js
var mapper = new ObjectMapper();
mapper.addPropertyMapping({
    from: 'name',
    to: 'firstName',
    default: 'Anonymous'
});

mapper.map({}); // {firstName: 'Anonymous'}
```

## Custom function mapping

You can extend mapping process by applying additional functions.
```js
var mapper = new ObjectMapper();
// for reverse mapping function use "addReverseMapping"
mapper.addMapping(function(source, target) {
    target.fullName = source.firstName + ' ' + source.lastName;
    return target; 
});

mapper.map({
    firstName: 'Tommy', 
    lastName: 'Lee Jones'
}); // {fullName: 'Tommy Lee Jones'}
```

## Deep properties mapping

The tool uses [object-path](https://www.npmjs.com/package/object-path) for accessing properties.

```js
var mapper = new ObjectMapper();
mapper
    .addPropertyMapping({
        from: 'author.name',
        to: 'authorName'
    })
    .addPropertyMapping({
        from: 'tags.0',
        to: 'lastTag'
    });

mapper.map({
    author: {
        name: 'Lukasz',
        surname: 'Kuzynski'
    },
    
    tags: ['rpc', 'http', 'api']
}); // { authorName: 'Lukasz', lastTag: 'rpc' }

```

    
## Reference
[Just read JSDoc](index.js) 

## Changelog

__1.1.0__
* Ability to read inherited properties
