// Mock the service before tests run
jest.mock('@core/base/base.service', () => ({
  BaseService: class {
    constructor() {}
  }
}));