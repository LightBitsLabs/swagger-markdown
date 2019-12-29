'use strict';

var dataTypeTransformer = require('./dataTypes');
var inArray = require('../lib/inArray');
var Schema = require('../models/schema');

/**
 * If Enum field is present parse it.
 * @param name of the definition
 * @param definition definition object
 */
const parseEnum = (name, definition) => {
  const required = 'required' in definition ? definition.required : [];
  const res = [];
  for(var i = 0; i < definition.enum.length; i++) {
    var descriptionCell = 'none';
    // remove new lines so the table wont break
    descriptionCell = descriptionCell.replace(/\n/g, "")
    var requiredCell = inArray(definition, required) ? 'Yes' : 'No';
    res.push(`| ${definition.enum[i]} | ${definition.type} | ${descriptionCell} | ${requiredCell} |`);
  }
  return res;
};



/**
 * If Property field is present parse them.
 * @param name of the definition
 * @param definition definition object
 */
const parseProperties = (name, definition) => {
  const required = 'required' in definition ? definition.required : [];
  const res = [];
  Object.keys(definition.properties).map(propName => {
    const prop = definition.properties[propName];
    const typeCell = dataTypeTransformer(new Schema(prop));
    var descriptionCell = 'description' in prop ? prop.description : 'none';
    // remove new lines so the table wont break
    descriptionCell = descriptionCell.replace(/\n/g, "")
    var requiredCell = inArray(propName, required) ? 'Yes' : 'No';
    res.push(`| ${propName} | ${typeCell} | ${descriptionCell} | ${requiredCell} |`);
  });
  return res;
};

/**
 * Parse allOf definition
 * @param name of the definition
 * @param definition definition object
 */
const parsePrimitive = (name, definition) => {
  const res = [];
  const typeCell = 'type' in definition ? definition.type : 'none';
  var descriptionCell = 'description' in definition ? definition.description : 'none';
  // remove new lines so the table wont break
  descriptionCell = descriptionCell.replace(/\n/g, " ")

  // the title is shorter the the desc so we want to se it as a desc in the table for enums.
  // enum is a special case cause it has a string type so we treat it as a primitive
  // but it realy is a compound value documentation wise
  var title = 'title' in definition ? definition.title : 'none';
  // remove new lines so the table wont break
  title = title.replace(/\n/g, " ")

  if(name.indexOf("Enum") > -1) {
	descriptionCell = title
  }

  var requiredCell = 'No';
  res.push(`| ${name} | ${typeCell} | ${descriptionCell} | ${requiredCell} |`);
  return res;
};

/**
 * @param {type} name
 * @param {type} definition
 * @return {type} Description
 */
const processDefinition = (name, definition) => {
  let res = [];
  let parsedDef = [];
  res.push('');
  res.push(`### ${name}`);
  res.push('');
  if (definition.description) {
    res.push(definition.description);
    res.push('');
  }
  res.push('| Name | Type | Description | Required |');
  res.push('| ---- | ---- | ----------- | -------- |');

  if ('properties' in definition) {
    parsedDef = parseProperties(name, definition);
  } else if ('enum' in definition) {
    parsedDef = parseEnum(name, definition);	 
  } else {
    parsedDef = parsePrimitive(name, definition);
  }
  res = res.concat(parsedDef);

  return res.length ? res.join('\n') : null;
};
module.exports.processDefinition = processDefinition;

/**
 * @param {type} definitions
 * @return {type} Description
 */
module.exports = function (definitions) {
  var res = [];
  Object.keys(definitions).map(function (definitionName) {
    const normailzedName = definitionName.replace("management", "")
    return res.push(processDefinition(normailzedName, definitions[definitionName]));
  });
  if (res.length > 0) {
    res.unshift('### Models - REST API Schema Definitions\n');
    res.unshift('---');
    return res.join('\n');
  }
  return null;
};
