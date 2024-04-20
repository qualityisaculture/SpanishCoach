import { test, expect, Page } from '@playwright/test';
import StudyMenu from '../pages/StudyMenu.page';
import StudyCard from '../pages/StudyCard.page';
import EditComponent from '../components/Edit.component';
import ChatModal from '../components/ChatModal.component';

let studyMenu: StudyMenu;
let studyCard: StudyCard;
test.beforeEach(async ({ page }) => {
  studyMenu = new StudyMenu(page);
  studyCard = new StudyCard(page);
  await studyMenu.visit();
});

test.describe('Deck List', () => {
  test('should display a list of decks', async () => {
    const deckRows = await studyMenu.getDeckRows();
    await expect(deckRows).toHaveCount(3);
  });

  test('should display the deck name', async () => {
    const deckRows = await studyMenu.getDeckRows();
    await expect(deckRows.nth(0)).toContainText('deck1');
    await expect(deckRows.nth(1)).toContainText('deck2');
    await expect(deckRows.nth(2)).toContainText('deck3');
  });
  
  test('should display the number of cards ', async () => {
    const deckRows = await studyMenu.getDeckRows();
    await expect(deckRows.nth(0)).toContainText('1 2 3');
    await expect(deckRows.nth(1)).toContainText('2 4 6');
    await expect(deckRows.nth(2)).toContainText('3 6 9');
  });
});

test.describe('Card Review', () => {
  test.beforeEach(async ({ page }) => {
    await studyMenu.tapDeck(0);
  });

  test('should display the first due card in the deck when deck is launched', async () => {
    const cardFront = await studyCard.getCardFront();
    await expect(cardFront).toContainText('due card');
  });

  test('should display the menu again when back is tapped', async () => {
    await studyCard.tapBack();
    const deckRows = await studyMenu.getDeckRows();
    await expect(deckRows).toHaveCount(3);
  });

  test('should display the back of the card when the card is tapped', async () => {
    await studyCard.tapCard();
    const cardBack = await studyCard.getCardBack();
    await expect(cardBack).toContainText('due card back');
  });

  test('should display the new card when learn card is answered', async () => {
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    const cardFront = await studyCard.getCardFront();
    await expect(cardFront).toContainText('new card');
  });

  test('should display the learn card when the new card is answered ', async () => {
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    const cardFront = await studyCard.getCardFront();
    await expect(cardFront).toContainText('learn card');
  });

  test('should display a message when all cards are answered when all cards are answered', async () => {
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    await studyCard.tapCard();
    await studyCard.tapAnswerEasy();
    await expect(await studyCard.getCard()).toContainText('No cards in deck');
  });
});

test.describe('Edit', () => {
  let frontEditComponent: EditComponent;
  let backEditComponent: EditComponent;

  test.beforeEach(async ({ page }) => {
    await studyMenu.tapDeck(0);
    await studyCard.tapEdit();
    frontEditComponent = studyCard.getCardFrontEditComponent();
    backEditComponent = studyCard.getCardBackEditComponent();
  });

  test('should display inputs when edit is clicked', async () => {
    const cardFrontInput = await frontEditComponent.getInput();
    const cardBackInput = await backEditComponent.getInput();
    await expect(cardFrontInput).toHaveValue('due card');
    await expect(cardBackInput).toHaveValue('due card back');
  });

  test('should undo the changes and go back to the card when cancel is clicked', async () => {
    await frontEditComponent.fillInput('due card edited');
    await backEditComponent.fillInput('due card back edited');
    await studyCard.tapCancel();
    await studyCard.tapCard();
    await expect(await studyCard.getCardFront()).toContainText('due card');
    await expect(await studyCard.getCardBack()).toContainText('due card back');
  });

  test('should save the card when save is clicked', async () => {
    await frontEditComponent.fillInput('due card edited');
    await backEditComponent.fillInput('due card back edited');
    await studyCard.tapSave();
    await studyCard.tapCard();
    await expect(await studyCard.getCardFront()).toContainText(
      'due card edited'
    );
    await studyCard.tapCard();
    await expect(await studyCard.getCardBack()).toContainText(
      'due card back edited'
    );
  });

  test.describe('Formatting', () => {
    test('should bold text when bold button is clicked', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapBold();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<b>due card</b>'
      );
    });

    test('should remove bold text when bold button is clicked on bold text', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapBold();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<b>due card</b>'
      );

      await frontEditComponent.selectAll();
      await frontEditComponent.tapBold();
      await expect(await frontEditComponent.getInput()).toHaveValue('due card');
    });

    test('should italicize text when italic button is clicked', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapItalic();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<i>due card</i>'
      );
    });

    test('should remove italic text when italic button is clicked on italic text', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapItalic();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<i>due card</i>'
      );

      await frontEditComponent.selectAll();
      await frontEditComponent.tapItalic();
      await expect(await frontEditComponent.getInput()).toHaveValue('due card');
    });

    test('should underline text when underline button is clicked', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapUnderline();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<u>due card</u>'
      );
    });

    test('should remove underline text when underline button is clicked on underline text', async () => {
      await frontEditComponent.selectAll();
      await frontEditComponent.tapUnderline();
      await expect(await frontEditComponent.getInput()).toHaveValue(
        '<u>due card</u>'
      );

      await frontEditComponent.selectAll();
      await frontEditComponent.tapUnderline();
      await expect(await frontEditComponent.getInput()).toHaveValue('due card');
    });
  });
});

test.describe('Modal', () => {
  let chatModal: ChatModal;

  test.beforeEach(async ({ page }) => {
    await studyMenu.tapDeck(0);
    await studyCard.tapCard();
    chatModal = new ChatModal(page);
  });

  test('should display the chat modal with the back of the card when chat is clicked', async () => {
    await studyCard.tapModalButton();
    await expect(await chatModal.getChatInput()).toHaveValue('due card back');
  });

  test('should request the difference between the original and the user input when the request is sent', async () => {
    await studyCard.tapModalButton();
    await chatModal.fillChatInput('due card back change');
    await chatModal.tapSend();
    const requestUrl = await chatModal.getChatRequestUrl();
    expect(requestUrl).toContain('due card back change');

  });

  test('should display the response when the response is sent', async () => {
    await studyCard.tapModalButton();
    await chatModal.fillChatInput('due card back change');
    await chatModal.tapSend();
    await expect(await chatModal.getChatMessage(1)).toContainText('response');
  });
});
