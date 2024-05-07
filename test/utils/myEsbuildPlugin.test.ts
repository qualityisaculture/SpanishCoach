import myEsbuildPlugin from '../../src/utils/myEsbuildPlugin';

import { compile } from '../../node_modules/@badeball/cypress-cucumber-preprocessor/dist/template';
jest.mock(
  '../../node_modules/@badeball/cypress-cucumber-preprocessor/dist/template',
  () => ({
    compile: jest.fn(),
  })
);
const mockCompileFn = compile as jest.Mock;
mockCompileFn.mockResolvedValue('compiled content');

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn().mockResolvedValue('original content'),
  },
}));

const mockConfiguration = {
  testingType: 'e2e',
  projectRoot: '',
  reporter: '',
  specPattern: '',
  excludeSpecPattern: '',
  env: {},
};

function getOnLoadCallback(plugins?: ((content: string) => Promise<string>)[]) {
  //@ts-ignore
  const myEsbuildPluginInstance = myEsbuildPlugin(mockConfiguration, plugins);
  let mockOnLoad = jest.fn();
  //@ts-ignore
  myEsbuildPluginInstance.setup({
    onLoad: mockOnLoad,
  });
  let onLoadCallback = mockOnLoad.mock.calls[0][1];
  return onLoadCallback;
}

describe('myEsbuildPlugin plugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompileFn.mockClear();
  });
  it('should call compile with original content when no plugins passed', async () => {
    const onLoadCallback = getOnLoadCallback();
    await onLoadCallback({ path: 'path/to/feature.feature' });
    expect(mockCompileFn).toHaveBeenCalledWith(
      mockConfiguration,
      'original content',
      'path/to/feature.feature'
    );
  });

  it('should call call plugin when plugin passsed', async () => {
    let plugin = jest.fn().mockResolvedValue('plugin content');
    const onLoadCallback = getOnLoadCallback([plugin]);
    await onLoadCallback({ path: 'path/to/feature.feature' });
    expect(plugin).toHaveBeenCalledWith('original content');
    expect(mockCompileFn).toHaveBeenCalledWith(
      mockConfiguration,
      'plugin content',
      'path/to/feature.feature'
    );
  });

  it('should chain to a second plugin', async () => {
    let plugin = jest.fn().mockResolvedValue('plugin content');
    let plugin2 = jest.fn().mockResolvedValue('plugin2 content');
    const onLoadCallback = getOnLoadCallback([plugin, plugin2]);
    await onLoadCallback({ path: 'path/to/feature.feature' });
    expect(plugin).toHaveBeenCalledWith('original content');
    expect(plugin2).toHaveBeenCalledWith('plugin content');
    expect(mockCompileFn).toHaveBeenCalledWith(
      mockConfiguration,
      'plugin2 content',
      'path/to/feature.feature'
    );
  });
});
