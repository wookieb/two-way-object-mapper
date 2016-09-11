'use strict';

var objectPath = require('object-path');
var is = require('predicates');

var returnProperty = function(name) {
    return function(obj) {
        return obj[name];
    }
};

var runMapping = function(mappings, objA, objB, pluckProperty) {
    return mappings.map(returnProperty(pluckProperty))
        .reduce(function(obj, mapping) {
            if (mapping) {
                return mapping(objA, obj);
            }
            return obj;
        }, objB);
};

var createPropertyMappingFunction = function(from, to, transform, defaultValue) {
    return function(source, obj) {
        var value = objectPath.get(source, from);
        if (value === void 0) {
            if (defaultValue) {
                objectPath.set(obj, to, defaultValue);
            }
            return obj;
        }

        if (transform instanceof Function) {
            objectPath.set(obj, to, transform(value));
        } else {
            objectPath.set(obj, to, value);
        }
        return obj;
    }
};

var validatePropertyMappingDescriptor = function(descriptor) {
    if (!is.plainObject(descriptor)) {
        throw new Error('Property mapping descriptor must be an object');
    }

    if (!is.defined(descriptor.from)) {
        throw new Error('"from" must be defined for property mapping descriptor');
    }
};

/**
 * Function used to map source object to target object.
 * Function MUST return an object as a result of mapping.
 *
 * @typedef {Function} MappingFunction
 * @param {Object} source
 * @param {Object} target
 * @return {Object}
 */

/**
 * @typedef {Object} PropertyMappingDescriptor
 * @property {string} from source property to get the value from.
 * @property {string} [to] target property to assign value to. If undefined "from" is used.
 * @property {Function} [transform] function used to transform value from source to target (during mapping process)
 * @property {Function} [reverseTransform] function used to transform value from target to source (during reverse mapping process)
 * @property {*} [default] default value to assign if not defined in source
 */

var ObjectMapper = function() {
    this.mappings = [];
};

ObjectMapper.prototype = {
    constructor: ObjectMapper,

    /**
     * Adds mapping and reverse mapping function
     *
     * @param {MappingFunction} mappingFunc
     * @param {MappingFunction} reverseMappingFunc
     * @return {ObjectMapper}
     */
    addBothMappings: function(mappingFunc, reverseMappingFunc) {
        this.addMapping(mappingFunc);
        this.addReverseMapping(reverseMappingFunc);
        return this;
    },

    /**
     * @param {MappingFunction} mappingFunc
     * @return {ObjectMapper}
     */
    addMapping: function(mappingFunc) {
        this.mappings.push({mapping: mappingFunc});
        return this;
    },

    /**
     * @param {MappingFunction} reverseMappingFunc
     * @return {ObjectMapper}
     */
    addReverseMapping: function(reverseMappingFunc) {
        this.mappings.push({reverseMapping: reverseMappingFunc});
        return this;
    },

    /**
     * @param {PropertyMappingDescriptor} propertyMappingDescriptor
     * @return {ObjectMapper}
     */
    addPropertyMapping: function(propertyMappingDescriptor) {
        validatePropertyMappingDescriptor(propertyMappingDescriptor);

        this.addBothMappings(
            createPropertyMappingFunction(
                propertyMappingDescriptor.from,
                propertyMappingDescriptor.to || propertyMappingDescriptor.from,
                propertyMappingDescriptor.transform,
                propertyMappingDescriptor.default
            ),
            createPropertyMappingFunction(
                propertyMappingDescriptor.to || propertyMappingDescriptor.from,
                propertyMappingDescriptor.from,
                propertyMappingDescriptor.reverseTransform
            )
        );
        return this;
    },

    /**
     * Adds simple properties assignments so all properties provided properties will be simply assigned from source to target object.
     *
     * @param {Array<string>} properties
     * @return {ObjectMapper}
     */
    addSimplePropertiesAssignments: function(properties) {
        properties.forEach(function(property) {
            this.addPropertyMapping({
                from: property,
                to: property
            })
        }, this);

        return this;
    },

    /**
     * Performs mapping process from source (objA) to target (objB)
     *
     * @param {Object} objA
     * @param {Object} [objB={}]
     */
    map: function(objA, objB) {
        if (!objB) {
            objB = {};
        }

        return runMapping(this.mappings, objA, objB, 'mapping');
    },

    /**
     * Performs reverse mapping process from target (objB) to source (objB)
     * @param objB
     * @param objA
     */
    reverseMap: function(objB, objA) {
        if (!objA) {
            objA = {};
        }

        return runMapping(this.mappings, objB, objA, 'reverseMapping');
    }
};

module.exports = ObjectMapper;