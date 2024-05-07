Feature: Study Menu

  Scenario: User can view a list of all decks
    Given I am on the study menu
    Then I should see the following decks:
      | deckName | newCards | learnCards | dueCards |
      | deck1    | 1        | 2          | 3        |
      | deck2    | 2        | 4          | 6        |
      | deck3    | 3        | 6          | 9        |

  Scenario: User can go back to the menu
    Given I am on the study menu
    When I tap "deck1"
    And I tap "back" 
    Then I should see the study menu
  