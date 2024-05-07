import myEsbuildPluginPlugin from "../../src/utils/DynamicScenarioOutlinePlugin";

import fs from "fs";
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn()
  },
}));
const mockFs = fs.promises as jest.Mocked<typeof fs.promises>;
mockFs.readFile.mockResolvedValue('example line');


describe('myEsbuildPlugin plugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.readFile.mockClear();
  });

  it('should return the original content if no examples line', async () => {
    const content = 'Feature: test\n\nScenario: test\nGiven I do something';
    const result = await myEsbuildPluginPlugin(content);
    expect(result).toEqual(content);
  });

  it('should load the file requested by the examples line', async () => {
    const content = 'Feature: test\n\nScenario: test\nGiven I do something\nExamples:saveToSelectedDeck.examples';
    await myEsbuildPluginPlugin(content);
    expect(mockFs.readFile).toHaveBeenCalledWith('./cypress/fixtures/saveToSelectedDeck.examples');

    const content2 = 'Feature: test\n\nScenario: test\nGiven I do something\nExamples:saveToSelectedDeck2.examples';
    await myEsbuildPluginPlugin(content2);
    expect(mockFs.readFile).toHaveBeenCalledWith('./cypress/fixtures/saveToSelectedDeck2.examples');
  });

  it('should be able to load multiple files', async () => {
    const content = 'Feature: test\n\nScenario: test\nGiven I do something\nExamples:saveToSelectedDeck.examples\nExamples:saveToSelectedDeck2.examples';
    await myEsbuildPluginPlugin(content);
    expect(mockFs.readFile).toHaveBeenCalledWith('./cypress/fixtures/saveToSelectedDeck.examples');
    expect(mockFs.readFile).toHaveBeenCalledWith('./cypress/fixtures/saveToSelectedDeck2.examples');
  });

  it('should replace the examples line with the file content', async () => {
    const content = 'Feature: test\n\nScenario: test\nGiven I do something\nExamples:saveToSelectedDeck.examples';
    const result = await myEsbuildPluginPlugin(content);
    expect(result).toEqual('Feature: test\n\nScenario: test\nGiven I do something\nExamples:\nexample line');
  });

  it('should replace the examples multiple line with the file content', async () => {
    const content = 'Feature: test\n\nScenario: test\nGiven I do something\nExamples:saveToSelectedDeck.examples\nExamples:saveToSelectedDeck2.examples';
    const result = await myEsbuildPluginPlugin(content);
    expect(result).toEqual('Feature: test\n\nScenario: test\nGiven I do something\nExamples:\nexample line\nExamples:\nexample line');
  });
});