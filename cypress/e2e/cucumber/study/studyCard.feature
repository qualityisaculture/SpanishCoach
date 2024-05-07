Feature: Study Card

  Scenario: If there are no cards in the deck, user should see a message
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 0   | 0   | 0     |
    Then I should see "No cards in deck"

  Scenario: Show question
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 0   | 1   | 0     |
    Then I should see the question "due card front 1"

  Scenario: Show answer
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 0   | 1   | 0     |
    And I tap the card
    Then I should see the answer "due card back 1"


  Scenario: User can mark the card as correct and it will disappear
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 0  | 1   | 0     |
    And I tap the card
    And I tap "easy"
    Then I should see "No cards in deck"


  Scenario: Due cards are displayed first
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 1   | 1   | 1     |
    Then I should see the question "due card front 1"
  
  Scenario: New cards are displayed if no due cards
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 1   | 0   | 1     |
    Then I should see the question "new card front 1"
      
  Scenario: Learn cards are displayed if no due or new cards
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 0   | 0   | 1     |
    Then I should see the question "learn card front 1"

          
  Scenario: New cards are displayed once due cards are completed
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 1   | 1   | 0     |
    Then I should see the question "due card front 1"
    When I tap the card
    And I tap "easy"
    Then I should see the question "new card front 1"

  Scenario: Learn cards are displayed once new cards are completed
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 1   | 0   | 1     |
    Then I should see the question "new card front 1"
    When I tap the card
    And I tap "easy"
    Then I should see the question "learn card front 1"

  Scenario: New cards must be answered twice to be completed
    Given I am on the study menu
    When I tap a deck with the following cards:
      | new | due | learn |
      | 1   | 0   | 0     |
    Then I should see the question "new card front 1"
    When I tap the card
    And I tap "easy"
    Then I should see the question "new card front 1"
    When I tap the card
    And I tap "easy"
    Then I should see "No cards in deck"
  