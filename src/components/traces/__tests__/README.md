# Traces Component Tests

This directory contains unit tests for the Traces component and its utility functions.

## Running Tests

To run the tests in this directory, you can use the following command from the project root:

```bash
npm run test:unit
```

To run tests with watch mode (automatically re-run when files change):

```bash
npm run test:unit -- --watch
```

To run just one specific test file:

```bash
npm run test:unit -- src/components/traces/__tests__/buildSpanTree.test.tsx
```

## Debugging Tests in VSCode

To debug tests directly in VSCode:

1. Install the [Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension for VSCode
2. Open the test file you want to debug
3. You can now:
   - Click the debug icon next to any test or test suite to debug that specific test
   - Use the "Run Test" icon to run without debugging
   - Place breakpoints in your test or source code

You can also use the Debug panel in VSCode:

1. Open the Debug panel (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Debug Current Vitest Test" from the dropdown
3. Open the test file you want to debug
4. Press F5 or click the green play button

For debugging all tests, select "Debug All Vitest Tests" instead.

### Troubleshooting

If your breakpoints aren't being hit:

- Make sure source maps are enabled (they are by default)
- Try adding the `debugger;` statement in your code where you want to pause
- Check that you're not skipping files in the launch configuration
- Ensure that the test file has the `/**@vitest-environment jsdom */` annotation at the top

## Test Organization

The tests are organized by functionality:

- `buildSpanTree.test.tsx`: Tests for the span tree building functionality

## Adding New Tests

When adding new tests:

1. Create a new test file with the `.test.tsx` extension
2. Import the necessary test utilities from Vitest
3. Define your test cases using the `describe` and `it` functions
4. Run the tests to verify they pass

## Mocking Dependencies

If you need to mock dependencies in your tests, you can use Vitest's mocking utilities:

```typescript
import { vi } from "vitest";

// Mock a module
vi.mock("path/to/module", () => ({
  moduleFunction: vi.fn(),
}));
```
