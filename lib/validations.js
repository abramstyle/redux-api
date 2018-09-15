import { objectUtils, stringUtils } from 'fanas';

export function isValidTypes(types) {
  return Array.isArray(types) && (types.length === 3) && types.every(type => stringUtils.isString(type));
}

export function isValidCallAPI(callAPI) {
  return objectUtils.isObject(callAPI) && callAPI.url;
}
