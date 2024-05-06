Feature: Study Card Edit

  Scenario: I can edit a card
    Given I am on a due card page
    When I tap "edit"
    Then the front edit field should be "due card front 1"
    And the back edit field should be "due card back 1"

  Scenario: I can cancel editing a card
    Given I am on a due card page
    When I tap "edit"
    And I edit the front of the card to "new front"
    And I edit the back of the card to "new back"
    And I tap "cancel"
    And I tap the card
    Then I cannot edit the front of the card
    And I cannot edit the back of the card 
    And I should see the question "due card front 1"
    And I should see the answer "due card back 1"

  Scenario: I can save changes to a card
    Given I am on a due card page
    When I tap "edit"
    And I edit the front of the card to "new front"
    And I edit the back of the card to "new back"
    And I tap "save"
    And I tap the card
    Then I should see the question "new front"
    And I should see the answer "new back"