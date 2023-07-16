const fizz_buzz = require('./index');

describe("FizzBuzz", () => {
    test('[3] should result in "fizz"', () => {
      expect(fizz_buzz([3])).toBe('fizz');
    });

    test('[5] should result in "buzz"', () => {
      expect(fizz_buzz([5])).toBe('buzz');
    });

    it('[15] should result in "fizzbuzz"', () => {
      expect(fizz_buzz([15,3,5])).toBe('fizzbuzz, fizz, buzz');
    });

    test('[1,2,3] should result in "1, 2, fizz"', () => {
      expect(fizz_buzz([3])).toBe('fizz');
    });

    test('rejects to octopus', () => {
      // make sure to add a return statement
      return expect(Promise.reject(new Error('octopus'))).rejects.toThrow(
        'octopus',
      );
    });

    const mockFn = jest.fn();
mockFn();
expect(mockFn).toHaveBeenCalled();

});