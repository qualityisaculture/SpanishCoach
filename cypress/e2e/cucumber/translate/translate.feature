Feature: Basic Translation

  Scenario: Should return "Hello" when "Hola" is searched
    Given I am on the search page
    When I type "Hola" in the search box
    Then I should see "Hello" in the response

  Scenario: Should return "Hola" when "Hello" is searched and the translation direction is reversed
    Given I am on the search page
    When I switch the translation direction
    And I type "Hello" in the search box
    Then I should see "Hola" in the response
