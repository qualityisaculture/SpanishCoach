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

    Scenario: should save the translation with the english and spanish reversed when the translation direction is reversed
    Given I am on the search page
    When I type "Hola" in the search box
    Then I should see "Hello" in the response
    When I open the deck dropdown
    And I switch the save direction
    When I click the save button
    Then I should see a POST request to /addCard with the following body:
    | deckName | front | back |
    | default | Hello | Hola |

    Scenario: should save to the selected deck when a deck is selected
    Given I am on the search page
    When I type "Hola" in the search box
    Then I should see "Hello" in the response
    When I open the deck dropdown
    And I select "deck2"
    When I click the save button
    Then I should see a POST request to /addCard with the following body:
    | deckName | front | back |
    | deck2 | Hola | Hello |

    Scenario Outline: save to selected deck
    Given I am on the search page
    When I set the translation direction to "<translation-direction>"
    When I type "<spanish>" in the search box
    Then I should see "<english>" in the response
    When I open the deck dropdown
    And I set the save direction to "<save-direction>"
    And I select "<deck>"
    When I click the save button
    Then I should see a POST request to /addCard with the following body:
    | deckName | front | back |
    | <deck> | <front> | <back> |
    Examples:saveToSelectedDeck.examples
    