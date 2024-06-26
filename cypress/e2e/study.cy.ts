/// <reference types="cypress" />
import StudyMenu from '../pages/StudyMenu.page';
import StudyCard from '../pages/StudyCard.page';
import EditComponent from './components/Edit.component';
import ChatModal from './components/ChatModal.component';
import { newCard, learnCard } from '../../test/builders/cards';

describe('Study', () => {
  let studyMenuPage: StudyMenu;
  beforeEach(() => {
    studyMenuPage = new StudyMenu();
    studyMenuPage.visit();
  });

  describe('Deck List', () => {
    it('should display a list of decks', () => {
      studyMenuPage.getDeckRows().should('have.length', 3);
    });

    it('should display the deck name', () => {
      studyMenuPage.getDeckRows().eq(0).contains('deck1');
      studyMenuPage.getDeckRows().eq(1).contains('deck2');
      studyMenuPage.getDeckRows().eq(2).contains('deck3');
    });

    it('should display the number of cards ', () => {
      studyMenuPage.getDeckRows().eq(0).contains('1 2 3');
      studyMenuPage.getDeckRows().eq(1).contains('2 4 6');
      studyMenuPage.getDeckRows().eq(2).contains('3 6 9');
    });
  });

  describe('Card Review', () => {
    let studyCardPage: StudyCard;
    beforeEach(() => {
      studyCardPage = new StudyCard();
      studyMenuPage.tapDeck('deck1');
    });

    it('should display the first due card in the deck when deck is launched', () => {
      studyCardPage.getCardFront().contains('due card');
    });

    it('should display the menu again when back is clicked', () => {
      studyCardPage.tapBack();
      studyMenuPage.getDeckRows().should('have.length', 3);
    });

    it('should display the back of the card when the card is clicked', () => {
      studyCardPage.tapCard();
      studyCardPage.getCardBack().contains('due card back');
    });

    it('should display the new card when learn card is answered', () => {
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.getCardFront().contains('new card');
    });

    it('should display the learn card when the new card is answered ', () => {
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.getCardFront().contains('learn card');
    });

    it('should display a message when all cards are answered when all cards are answered', () => {
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.tapCard();
      studyCardPage.tapAnswerEasy();
      studyCardPage.getCard().contains('No cards in deck');
    });

    describe('Edit', () => {
      let frontEditComponent: EditComponent;
      let backEditComponent: EditComponent;
      beforeEach(() => {
        frontEditComponent = studyCardPage.getCardFrontEditComponent();
        backEditComponent = studyCardPage.getCardBackEditComponent();
      });

      it('should display inputs when edit is clicked', () => {
        studyCardPage.tapEdit();
        frontEditComponent.getInput().should('have.value', 'due card');
        backEditComponent.getInput().should('have.value', 'due card back');
      });

      it('should undo the changes and go back to the card when cancel is clicked', () => {
        studyCardPage.tapEdit();
        frontEditComponent.addToInput(' edited');
        backEditComponent.addToInput(' edited');
        studyCardPage.tapCancel();
        studyCardPage.getCardFront().contains('due card');
        studyCardPage.getCardBack().contains('due card back');
      });

      it('should save the card when save is clicked', () => {
        studyCardPage.tapEdit();
        frontEditComponent.addToInput(' edited');
        backEditComponent.addToInput(' edited');
        studyCardPage.tapSave();
        studyCardPage.getCardFront().contains('due card edited');
        studyCardPage.tapCard();
        studyCardPage.getCardBack().contains('due card back edited');
      });

      describe('Formatting', () => {
        it('should bold text when bold button is clicked', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapBoldButton();
          frontEditComponent.getInput().should('have.value', '<b>due card</b>');
        });

        it('should remove bold text when bold button is clicked on bold text', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapBoldButton();
          frontEditComponent.getInput().should('have.value', '<b>due card</b>');
          frontEditComponent.selectAll();
          frontEditComponent.tapBoldButton();
          frontEditComponent.getInput().should('have.value', 'due card');
        });

        it('should italicize text when italic button is clicked', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapItalicButton();
          frontEditComponent.getInput().should('have.value', '<i>due card</i>');
        });

        it('should remove italic text when italic button is clicked on italic text', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapItalicButton();
          frontEditComponent.getInput().should('have.value', '<i>due card</i>');
          frontEditComponent.selectAll();
          frontEditComponent.tapItalicButton();
          frontEditComponent.getInput().should('have.value', 'due card');
        });

        it('should underline text when underline button is clicked', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapUnderlineButton();
          frontEditComponent.getInput().should('have.value', '<u>due card</u>');
        });

        it('should remove underline text when underline button is clicked on underline text', () => {
          studyCardPage.tapEdit();
          frontEditComponent.selectAll();
          frontEditComponent.tapUnderlineButton();
          frontEditComponent.getInput().should('have.value', '<u>due card</u>');
          frontEditComponent.selectAll();
          frontEditComponent.tapUnderlineButton();
          frontEditComponent.getInput().should('have.value', 'due card');
        });
      });
    });

    describe.only('Delete', () => {
      it('should display a confirmation modal when delete is clicked', () => {
        cy.on('window:confirm', (text) => {
          expect(text).to.equal('Are you sure you want to delete this card?');
          return false;
        });
        studyCardPage.tapDelete();
      });

      it('should do nothing when cancel is clicked', () => {
        cy.on('window:confirm', () => false);
        studyCardPage.tapDelete();
        studyCardPage.getCardFront().contains('due card');
        studyMenuPage.getDeckRows().should('have.length', 0);
      })

      it('should send a request to delete the card when ok is clicked', () => {
        cy.on('window:confirm', () => true);
        studyCardPage.tapDelete();
        studyCardPage.getDeleteIntercept().then((interception) => {
          expect(interception.request.url).to.contain('delete');
          expect(interception.request.body).to.contain({ cardId: 4 }); //due card in cardInfo.json
        });
      });

      it('should return to the menu when response is received', () => {
        cy.on('window:confirm', () => true);
        studyCardPage.tapDelete();
        studyMenuPage.getDeckRows().should('have.length', 3);
      });
    });

    describe('Chat Modal', () => {
      let chatModal: ChatModal;
      beforeEach(() => {
        chatModal = new ChatModal();
      });

      it('should display the chat modal with the back of the card when chat is clicked', () => {
        studyCardPage.tapCard();
        studyCardPage.tapModalButton();
        chatModal.getChatInput().should('have.value', 'due card back');
      });

      it('should request the difference between the original and the user input when the request is sent', () => {
        studyCardPage.tapCard();
        studyCardPage.tapModalButton();
        chatModal.addToChatInput(' change');
        chatModal.tapSend().then(() => {
          chatModal.respondToChat('response');
        });
        chatModal.getChatRequest().then((interception) => {
          expect(interception.request.url).to.contain(
            encodeURIComponent('due card back change')
          );
        });
      });

      it('should display the response when the response is sent', () => {
        studyCardPage.tapCard();
        studyCardPage.tapModalButton();
        chatModal.addToChatInput(' change');
        chatModal.tapSend().then(() => {
          chatModal.respondToChat('response');
        });
        chatModal.getChatMessage(2).contains('response');
      });
    });
  });



  describe('Disable new cards', () => {
    let studyCardPage: StudyCard;
    beforeEach(() => {});
    it('should not display new cards when new cards are disabled', () => {
      studyCardPage = new StudyCard({
        new: [newCard],
        due: [],
        learn: [],
      });
      studyMenuPage.tapDeck('deck1');
      studyCardPage.getCardFront().contains('front new');
      studyCardPage.tapNewCardSwitch();
      studyCardPage.getCard().contains('No cards in deck');
    });

    it('should display new cards when new cards are enabled', () => {
      studyCardPage = new StudyCard({
        new: [newCard],
        due: [],
        learn: [],
      });
      studyMenuPage.tapDeck('deck1');
      studyCardPage.getCardFront().contains('front new');
      studyCardPage.tapNewCardSwitch();
      studyCardPage.getCard().contains('No cards in deck');
      studyCardPage.tapNewCardSwitch();
      studyCardPage.getCardFront().contains('front new');
    });

    it('should display the next card when new card is disabled and show new card again when reenabled', () => {
      studyCardPage = new StudyCard({
        new: [newCard],
        due: [],
        learn: [learnCard],
      });
      studyMenuPage.tapDeck('deck1');
      studyCardPage.getCardFront().contains('front learn');
      studyCardPage.tapCard();
      studyCardPage.tapAnswerAgain();
      studyCardPage.getCardFront().contains('front new');
      studyCardPage.tapNewCardSwitch();
      studyCardPage.getCardFront().contains('front learn');
      studyCardPage.tapNewCardSwitch();
      studyCardPage.getCardFront().contains('front new');
    });
  });
});
