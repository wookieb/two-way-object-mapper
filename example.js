var ObjectMapper = require('./');

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

var r = mapper.map({
    author: {
        name: 'Lukasz',
        surname: 'Kuzynski'
    },

    tags: ['rpc', 'http', 'api']
});

console.log(r);