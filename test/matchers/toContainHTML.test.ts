export const toContainHTML = (received: {innerHTML: string}, expected: string) => {
  return {
      pass: received !== null && received !== undefined && received.innerHTML.includes(expected), 
      message: () => `expected "${expected}" but received "${received.innerHTML}"`,
  };
};

describe('toContainHTML', () => {
  it('should pass when the element contains the text', () => {
      const element = {innerHTML: '<div>expected text</div>'};
      const result = toContainHTML(element, '<div>expected text</div>');
      expect(result.pass).toBe(true);
  });
  it('should fail when the element does not contain the text', () => {
      const element = {innerHTML: '<div>expected text</div>'};
      const result = toContainHTML(element, '<span>expected text</span>');
      expect(result.pass).toBe(false);
  });

  it('should return a message when the element does not contain the text', () => {
      const element = {innerHTML: '<div>actual text</div>'};
      const result = toContainHTML(element, '<span>expected text</span>');
      expect(result.message()).toBe('expected "<span>expected text</span>" but received "<div>actual text</div>"');
  });
});