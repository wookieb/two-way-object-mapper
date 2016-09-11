'use strict';

var assert = require('chai').assert;
var ObjectMapper = require('.');
var sinon = require('sinon');

var USER = {
    firstName: 'Tommy',
    lastName: 'Lee Jones'
};

describe('property mapping', function() {
    var mapper;

    beforeEach(function() {
        mapper = new ObjectMapper();
    });

    it('simple assignment', function() {
        mapper.addPropertyMapping({
            from: 'firstName',
            to: 'name'
        });

        var target = mapper.map(USER, {});
        assert.deepEqual(target, {
            name: 'Tommy'
        });

        assert.deepEqual(mapper.reverseMap(target, {}), {
            firstName: 'Tommy'
        });
    });

    it('default value', function() {
        mapper.addPropertyMapping({
            from: 'age',
            to: 'age',
            default: 18
        });

        var target = mapper.map(USER, {});
        assert.deepEqual(target, {
            age: 18
        });

        assert.deepEqual(mapper.reverseMap(target, {}), {
            age: 18
        })
    });

    it('default value instead undefined', function() {
        mapper.addPropertyMapping({
            from: 'age',
            to: 'age',
            default: 18
        });

        assert.deepEqual(mapper.map({age: undefined}, {}), {
            age: 18
        });
    });

    it('transforming', function() {
        mapper.addPropertyMapping({
            from: 'lastName',
            to: 'surname',
            transform: function(val) {
                return val + ' (surname)';
            },
            reverseTransform: function(val) {
                return (val + '').replace(/ \(surname\)$/, '');
            }
        });

        var target = mapper.map(USER, {});
        assert.deepEqual(target, {
            surname: 'Lee Jones (surname)'
        });

        assert.deepEqual(mapper.reverseMap(target, {}), {
            lastName: 'Lee Jones'
        });
    });

    it('transform not applied on undefined values', function() {
        mapper.addPropertyMapping({
            from: 'lastName',
            to: 'surname',
            transform: function() {
                assert.fail('Transform should not be called');
            },
            reverseTransform: function(val) {
                assert.fail('Reverse transform should not be called');
            }
        });

        var target = mapper.map({}, {});
        assert.deepEqual(target, {});
        assert.deepEqual(mapper.reverseMap(target, {}), {});
    });

    it('simple properties assignments', function() {
        mapper.addSimplePropertiesAssignments(['firstName', 'lastName'])
    });

    it('"to" property undefined', function() {
        mapper.addPropertyMapping({
            from: 'firstName'
        });

        assert.deepEqual(mapper.map(USER), {
            firstName: USER.firstName
        });
        assert.deepEqual(mapper.reverseMap({firstName: 'Andree'}), {
            firstName: 'Andree'
        });
    });
});

describe('deep property mapping', function() {
    var mapper = new ObjectMapper();
    var SOURCE = {
        author: {
            name: 'Lukasz',
            surname: 'Kuzynski'
        },
        articles: [
            {
                title: 'Why you should consider using RPC over REST for internal API',
                url: 'http://wookieb.pl/why-you-should-consider-rpc-for-internal-api/'
            },
            {
                title: 'Reset.css or normalize.css',
                url: 'http://wookieb.pl/reset-css-or-normalize-css/'
            }
        ]
    };

    mapper
        .addPropertyMapping({
            from: 'author.name',
            to: 'authorName'
        })
        .addPropertyMapping({
            from: 'articles.0',
            to: 'lastArticle'
        })
        .addPropertyMapping({
            from: 'articles.0.title',
            to: 'bestArticleTitle'
        });

    it('deep mapping', function() {
        assert.deepEqual(mapper.map(SOURCE), {
            authorName: 'Lukasz',
            lastArticle: {
                title: 'Why you should consider using RPC over REST for internal API',
                url: 'http://wookieb.pl/why-you-should-consider-rpc-for-internal-api/'
            },
            bestArticleTitle: 'Why you should consider using RPC over REST for internal API'
        });
    });
});

describe('chaining', function() {
    var mapper = new ObjectMapper();
    var func = function() {};

    it('addBothMappings', function() {
        assert.strictEqual(mapper.addBothMappings(func, func), mapper);
    });

    it('addMapping', function() {
        assert.strictEqual(mapper.addMapping(func), mapper);
    });

    it('addReverseMapping', function() {
        assert.strictEqual(mapper.addReverseMapping(func), mapper);
    });

    it('addPropertyMapping', function() {
        assert.strictEqual(mapper.addPropertyMapping({from: 'test'}), mapper);
    });

    it('addSimplePropertiesAssignments', function() {
        assert.strictEqual(mapper.addSimplePropertiesAssignments(['test']), mapper);
    });

    it('descriptor must be an object', function() {
        assert.throw(function() {
            mapper.addPropertyMapping('str');
        }, Error, /Property mapping descriptor must be an object/);
    });

    it('descriptor requires "from" property', function() {
        assert.throws(function() {
            mapper.addPropertyMapping({});
        }, Error, /"from" must be defined for property mapping descriptor/);
    });
});

describe('function mapping', function() {
    var mapper;
    var mapping;
    var reverseMapping;

    beforeEach(function() {
        mapper = new ObjectMapper;
        mapping = sinon.spy(function(source, target) {
            target.test = 1;
            return target;
        });
        reverseMapping = sinon.spy(function(source, target) {
            target.test = 2;
            return target;
        });
    });

    it('both mappers', function() {
        mapper.addBothMappings(mapping, reverseMapping);

        assert.deepEqual(mapper.map({}), {
            test: 1
        });
        assert.ok(mapping.calledOnce, 'Mapper has not been called');

        assert.deepEqual(mapper.reverseMap({}), {
            test: 2
        });
        assert.ok(reverseMapping.calledOnce, 'Reverse mapping has not been called');
    });

    it('mapping function', function() {
        mapper.addMapping(mapping);

        assert.deepEqual(mapper.map({}), {
            test: 1
        });
        assert.ok(mapping.calledOnce, 'Mapped has not been called');

        assert.deepEqual(mapper.reverseMap({}), {});
    });

    it('reverse mapping function', function() {
        mapper.addReverseMapping(reverseMapping);

        assert.deepEqual(mapper.map({}), {});

        assert.deepEqual(mapper.reverseMap({}), {
            test: 2
        });
        assert.ok(reverseMapping.calledOnce, 'Reverse mapping has not been called');
    });
});