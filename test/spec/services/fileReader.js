'use strict';

describe('Service: fileReader', function () {

  // load the service's module
  beforeEach(module('frameworthyApp'));

  // instantiate service
  var fileReader;
  beforeEach(inject(function (_fileReader_) {
    fileReader = _fileReader_;
  }));

  it('should do something', function () {
    expect(!!fileReader).toBe(true);
  });

});
