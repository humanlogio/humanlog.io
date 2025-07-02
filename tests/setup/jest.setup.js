// This file exists to make VSCode recognize test files in the codebase
// It adds the Jest annotations that VSCode's Test Explorer looks for

global.jest = {
  describe,
  test,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
};

// This file doesn't need to be imported, it just needs to exist
