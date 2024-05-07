Feature: Study Card Chat Modal

  Scenario: I can launch a chat modal from the answer screen
    Given I am on a due card page
    When I tap the card
    Then I should see the chat modal button

  Scenario: The modal is filled with the answer field
    Given I am on a due card page
    When I tap the card
    When I tap "chat"
    Then the chat modal request field should be "due card back 1"

  Scenario: I can close the chat modal
    Given I am on a due card page
    When I tap the card
    When I tap "chat"
    When I tap "close"
    Then I should not see the chat modal

  Scenario: Display message as soon as I tap request
    Given I am on a due card page
    When I tap the card
    When I tap "chat"
    When I tap "request"
    Then I should see the following chat messages:
      | user | message |
      | user | what is the difference between "due card back 1" and "due card back 1"? |

  Scenario: Display message as soon server responds
    Given I am on a due card page
    When I tap the card
    When I tap "chat"
    When I tap "request"
    And the chat system responds with "Example response"
    Then I should see the following chat messages:
      | user | message |
      | user | what is the difference between "due card back 1" and "due card back 1"? |
      | bot | Example response |
