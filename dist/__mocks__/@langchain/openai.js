const langchain_openai = jest.createMockFromModule('@langchain/openai');

const mockInvoke = jest.fn().mockImplementation(() => {
  return Promise.resolve(langchain_openai.ChatOpenAI.returnValue);
});

const mockPipe = jest.fn().mockImplementation(() => {
  return {
    invoke: mockInvoke
  };
});

const mockBind = jest.fn().mockImplementation(() => {
  return {
    pipe: mockPipe
  };
});

const mockStream = jest.fn().mockImplementation(() => {
  return "mock stream";
});

const mockChatOpenAI = jest.fn().mockImplementation(() => {
  return {
    bind: mockBind,
    stream: mockStream
  };
});

langchain_openai.ChatOpenAI = mockChatOpenAI;
langchain_openai.ChatOpenAI.bind = mockBind;
langchain_openai.ChatOpenAI.stream = mockStream;
langchain_openai.ChatOpenAI.mockPipe = mockPipe;
langchain_openai.ChatOpenAI.invoke = mockInvoke;
langchain_openai.ChatOpenAI.returnValue =  "mocked value";

module.exports = langchain_openai;
