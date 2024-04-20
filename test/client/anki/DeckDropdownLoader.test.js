/**
 * @jest-environment jsdom
 */
import React from 'react';
import DeckDropdownLoader from '../../../src/client/anki/DeckDropdownLoader';
import {
  initialiseDOM,
  render,
  renderAndWait,
  element,
} from '../../reactTestExtensions';

import DeckDropdown from '../../../src/client/anki/DeckDropdown';
jest.mock('../../../src/client/anki/DeckDropdown', () => (jest.fn(() => {
    return <div id="deckSelector" />;
  })
));

describe('DeckSelectorLoader', () => {
  beforeEach(() => {
    initialiseDOM();
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => {
        return { result: [] };
      },
    });
    DeckDropdown.mockClear();
  });
  it('loads the DeckSelector', async () => {
    await renderAndWait(<DeckDropdownLoader />);
    expect(element('#deckSelector')).not.toBeNull();
  });

  it('passes an empty array of decks to the DeckSelector', async () => {
    await renderAndWait(<DeckDropdownLoader />);
    expect(DeckDropdown).toHaveBeenCalled();
    expect(DeckDropdown).toHaveBeenCalledWith(
      expect.objectContaining({ decks: [] }),
      expect.any(Object)
    );
  });

  // it('passes saving to the DeckSelector', async () => {
  //   await renderAndWait(<DeckSelectorLoader saving={false}/>);
  //   expect(DeckSelector).toHaveBeenCalled();
  //   expect(DeckSelector).toHaveBeenCalledWith(
  //     expect.objectContaining({ saving: false }),
  //     expect.any(Object)
  //   );
  // });

  it('requests the list of decks from the server', async () => {
    await renderAndWait(<DeckDropdownLoader />);
    expect(global.fetch).toHaveBeenCalledWith('/decks');
  });

  it('passes the decks to DeckSelector when received', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => {
        return { result: ['deck1', 'deck2'] };
      },
    });
    await renderAndWait(<DeckDropdownLoader />);
    expect(DeckDropdown).toHaveBeenCalledTimes(2);
    expect(DeckDropdown).toHaveBeenCalledWith(
        { decks: ['deck1', 'deck2'] },
        expect.any(Object)
    );
  });

  it('callsback the selected deck when DeckSelector callsback', async () => {
    const onSaveToDeck = jest.fn();
    await renderAndWait(
      <DeckDropdownLoader onSaveToDeck={onSaveToDeck} />
    );
    const DeckSelectorInstance = DeckDropdown.mock.calls[0];
    const DeckSelectorCall = DeckSelectorInstance[0]
    DeckSelectorCall.onSaveToDeck('deck2');
    expect(onSaveToDeck).toHaveBeenCalledWith('deck2');
  });
});
