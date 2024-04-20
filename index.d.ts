import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainText(expected: any): CustomMatcherResult;
      toContainHTML(expected: any): CustomMatcherResult;
    }
  }
}