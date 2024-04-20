export const toContainText = (received: {textContent: string}, expected: string) => {
    let cleanedContent = received.textContent?.replace(/\s+/g, ' ').trim();
    return {
        pass: cleanedContent !== null && cleanedContent !== undefined && cleanedContent.includes(expected), 
        message: () => `expected "${expected}" but received "${received.textContent}"`,
    };
};

describe('toContainText', () => {
    it('should pass when the element contains the text', () => {
        const element = {textContent: 'expected text'};
        const result = toContainText(element, 'expected text');
        expect(result.pass).toBe(true);
    });
    it('should fail when the element does not contain the text', () => {
        const element = {textContent: 'expected text'};
        const result = toContainText(element, 'unexpected text');
        expect(result.pass).toBe(false);
    });

    it('should return a message when the element does not contain the text', () => {
        const element = {textContent: 'unexpected text'};
        const result = toContainText(element, 'expected text');
        expect(result.message()).toBe('expected "expected text" but received "unexpected text"');
    });
});