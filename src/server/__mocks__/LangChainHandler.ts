let mockResponse = 'Lol';
const setMockResponse = (response) => {
  mockTranslate.mockResolvedValue(response);
  complexMockTranslate.mockResolvedValue(response);
  mockGenerateExample.mockResolvedValue(response);
};
const mockTranslate = jest.fn().mockResolvedValue(mockResponse);
const complexMockTranslate = jest.fn().mockResolvedValue(mockResponse);
const mockGenerateExample = jest.fn().mockResolvedValue(mockResponse);

const chat = jest.fn().mockImplementation((messages) => {
  const mockStream = require('stream').Readable.from([
    {content: 'Hola,'},
    {content: ' que'},
    {content: ' tal'},
  ])
  return mockStream;
});

const mock = jest.fn().mockImplementation(() => {
  return {
      translate: mockTranslate,
      translateComplex: complexMockTranslate,
      chat,
      generateExample: mockGenerateExample
    };
});

module.exports = mock;

enum translationDirections {
  SpanishToEnglish = 'spanishToEnglish',
  EnglishToSpanish = 'englishToSpanish',
}
module.exports.translationDirections = translationDirections;
module.exports.setMockResponse = setMockResponse;
module.exports.mockTranslate = mockTranslate;
module.exports.complexMockTranslate = complexMockTranslate;
module.exports.mockGenerateExample = mockGenerateExample;
module.exports.chat = chat;
