import * as Ajv from 'ajv';

const schema = {
  "properties": {
    "name": { "type": "string", "minLength": 3 },
    "points": { "enum": [15, 20, 40, 80, 150] },
    "elevation": { "type": "integer", "minimum": 0 },
    "distance": { "type": "integer", "minimum": 0 },
    "participants": {
      "type": "array",
      "items": {
        "title": "Participant",
        "description": "Participant connection schema",
        "type": "object",
        "oneOf": [
          {
            "properties": {
              "id": { "type": "string", "format": "uuid" }
            },
            "required": ["id"],
            "additionalProperties": false
          },
          {
            "properties": {
              "firstName": { "type": "string", "minLength": 3, "maxLength": 128 },
              "lastName": { "type": "string", "minLength": 3, "maxLength": 128 },
              "email": { "type": "string", "format": "email" },
            },
            "required": ["firstName", "lastName", "email"],
            "additionalProperties": false
          }
        ],
      }
    }
  },
  "required": ["name", "points"],
  "additionalProperties": false
};

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validator = ajv.compile(schema);

export const validate = (obj: any): obj is TTour => {
  var valid = validator(obj);
  if (!valid) {
    console.log(validator.errors);

    return false;
  }


  return true;
}
