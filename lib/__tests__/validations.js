import { isValidTypes, isValidCallAPI } from '../validations';

describe('validations', () => {
  test('isValidTypes', () => {
    expect(isValidTypes('string')).toBeFalsy();
    expect(isValidTypes([])).toBeFalsy();
    expect(isValidTypes(['request', 'success', 'failure'])).toBeTruthy();
  });

  test('isValidCallAPI', () => {
    expect(isValidCallAPI({})).toBeFalsy();
    expect(isValidCallAPI({ url: 'url' })).toBeTruthy();
  });
});
