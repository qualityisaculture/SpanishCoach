import {
  When,
  Then,
  Given,
  Before,
  DataTable,
} from '@badeball/cypress-cucumber-preprocessor';
import StudyMenu from '../../pages/StudyMenu.page';
import StudyCard, { getMockCards } from '../../pages/StudyCard.page';
import ChatModal from '../../e2e/components/ChatModal.component';
let studyMenuPage: StudyMenu;
let studyCardPage: StudyCard;
let chatModal: ChatModal;

function asObjects(data: DataTable) {
  let returnArray: any[] = [];
  let headers = data.raw()[0];
  let rows = data.raw().slice(1);
  rows.forEach((row) => {
    let obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    returnArray.push(obj);
  });
  return returnArray;
}

Before(() => {
  studyMenuPage = new StudyMenu();
  chatModal = new ChatModal();
});

Given('I am on the study menu', () => {
  studyMenuPage.visit();
});

Given('I am on a due card page', () => {
  let cards = getMockCards(0, 0, 1);
  studyCardPage = new StudyCard(cards);
  studyMenuPage.visit();
  studyMenuPage.tapDeck('deck1');
})

When('I tap a deck with the following cards:', (cardsTable: DataTable) => {
  let cardsCount = asObjects(cardsTable);
  let cards = getMockCards(
    parseInt(cardsCount[0].new),
    parseInt(cardsCount[0].learn),
    parseInt(cardsCount[0].due)
  );
  studyCardPage = new StudyCard(cards);
  studyMenuPage.tapDeck('deck1');
});

When('I tap the card', () => {
  studyCardPage.tapCard();
});

When('I tap {string}', (buttonString) => {
  if (buttonString === 'deck1') {
    studyCardPage = new StudyCard(getMockCards(0, 0, 1));
    studyMenuPage.tapDeck('deck1');
  } else if (buttonString === 'back') {
    studyCardPage.tapBack();
  } else if (buttonString === 'cancel') {
    studyCardPage.tapCancel();
  } else if (buttonString === 'edit') {
    studyCardPage.tapEdit();
  } else if (buttonString === 'save') {
    studyCardPage.tapSave();
  } else if (buttonString === 'chat') {
    studyCardPage.tapModalButton();
  } else if (buttonString === 'request') {
    chatModal.tapSend();
  } else if (buttonString === 'close') {
    chatModal.tapClose();
  } else if (buttonString === 'new cards') {
    console.log('tap new cards');
    studyCardPage.tapNewCardSwitch();
  } else if (buttonString === 'easy') {
    studyCardPage.tapAnswerEasy();
  } else {
    throw new Error('Unknown button: ' + buttonString);
  }
});

When('I edit the front of the card to {string}', (newFront: string) => {
  studyCardPage.getCardFrontEditComponent().getInput().type('{selectAll}'+newFront);
});

When('I select all the front text and tap {string}', (formatting: string) => {
  let frontEditComponent = studyCardPage.getCardFrontEditComponent();
  frontEditComponent.selectAll();
  if (formatting === 'B') {
    frontEditComponent.tapBoldButton();
  } else if (formatting === 'I') {
    frontEditComponent.tapItalicButton();
  } else if (formatting === 'U') {
    frontEditComponent.tapUnderlineButton();
  } else {
    throw new Error('Unknown formatting: ' + formatting);
  }
});

When('I edit the back of the card to {string}', (newBack: string) => {
  studyCardPage.getCardBackEditComponent().getInput().type('{selectAll}'+newBack);
});


When('I select all the back text and tap {string}', (formatting: string) => {
  let backEditComponent = studyCardPage.getCardBackEditComponent();
  backEditComponent.selectAll();
  if (formatting === 'B') {
    backEditComponent.tapBoldButton();
  } else if (formatting === 'I') {
    backEditComponent.tapItalicButton();
  } else if (formatting === 'U') {
    backEditComponent.tapUnderlineButton();
  } else {
    throw new Error('Unknown formatting: ' + formatting);
  }
});

When('the chat system responds with {string}', (response: string) => {
  chatModal.respondToChat(response);
});


Then('I should see the following decks:', (decks: DataTable) => {
  let expectedDecks = asObjects(decks);
  studyMenuPage.getDeckRows().should('have.length', expectedDecks.length);
  expectedDecks.forEach((deck, index) => {
    studyMenuPage.getDeckRows().eq(index).contains(deck.deckName);
    studyMenuPage
      .getDeckRows()
      .eq(index)
      .contains(deck.newCards + ' ' + deck.learnCards + ' ' + deck.dueCards);
  });
});

Then('I should see {string}', (message: string) => {
  studyCardPage.getCard().contains(message);
});

Then('I should see the study menu', () => {
  studyMenuPage.getDeckRows().should('have.length', 3);
});

Then('I should see the first {string} card in deck1', (cardCategory) => {
  if (cardCategory === 'due') {
    studyCardPage.getCardFront().contains('due card');
  } else if (cardCategory === 'new') {
    studyCardPage.getCardFront().contains('new card');
  } else if (cardCategory === 'learn') {
    studyCardPage.getCardFront().contains('learn card');
  }
});

Then('I should see the question {string}', (answer: string) => {
  studyCardPage.getCardFront().contains(answer);
});

Then('the front edit field should be {string}', (value: string) => {
  studyCardPage.getCardFrontEditComponent().getInput().should('have.value', value);
});

Then('I cannot edit the front of the card', () => {
  studyCardPage.getCardFrontEditComponent().getInput().should('not.exist');
});

Then('I should see the answer {string}', (answer: string) => {
  studyCardPage.getCardBack().contains(answer);
});

Then('the back edit field should be {string}', (value: string) => {
  studyCardPage.getCardBackEditComponent().getInput().should('have.value', value);
});

Then('I cannot edit the back of the card', () => {
  studyCardPage.getCardBackEditComponent().getInput().should('not.exist');
});

Then('I should see the chat modal button', () => {
  studyCardPage.getModalButton().should('exist');
});

Then('I should not see the chat modal', () => {
  studyCardPage.getChatModal().should('not.be.visible');
})

Then('the chat modal request field should be {string}', (request: string) => {
    chatModal.getChatInput().should('have.value', request);
});

Then('I should see the following chat messages:', (messagesTable: DataTable) => {
  let messages = asObjects(messagesTable);
  messages.forEach((message, index) => {
    chatModal.getChatMessage(index + 1).contains(message.message);
  });
});
