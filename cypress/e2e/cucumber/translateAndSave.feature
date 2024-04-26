Feature: Translate and Save

  Scenario: Should show a list of decks
    Given I am on the search page
    When I open the deck dropdown
    Then I should see a list of the following decks:
    | default | deck2 | deck3 |

    Scenario: should save the translation to /addCard when the save button is clicked
    Given I am on the search page
    When I type "Hola" in the search box
    Then I should see "Hello" in the response
    When I click the save button
    Then I should see a POST request to /addCard with the following body:
    | deckName | front | back |
    | default | Hola | Hello |