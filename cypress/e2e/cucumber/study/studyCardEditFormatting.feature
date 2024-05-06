Feature: Study Card Edit Formatting

  Scenario: Add and remove bold formatting from front edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the front text and tap "B"
    Then the front edit field should be "<b>due card front 1</b>"
    When I select all the front text and tap "B"
    Then the front edit field should be "due card front 1"

  Scenario: Add and remove italics formatting from front edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the front text and tap "I"
    Then the front edit field should be "<i>due card front 1</i>"
    When I select all the front text and tap "I"
    Then the front edit field should be "due card front 1"

  Scenario: Add and remove underline formatting from front edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the front text and tap "U"
    Then the front edit field should be "<u>due card front 1</u>"
    When I select all the front text and tap "U"
    Then the front edit field should be "due card front 1"

  Scenario: Add and remove bold formatting from back edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the back text and tap "B"
    Then the back edit field should be "<b>due card back 1</b>"
    When I select all the back text and tap "B"
    Then the back edit field should be "due card back 1"

  Scenario: Add and remove italics formatting from back edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the back text and tap "I"
    Then the back edit field should be "<i>due card back 1</i>"
    When I select all the back text and tap "I"
    Then the back edit field should be "due card back 1"

  Scenario: Add and remove underline formatting from back edit field
    Given I am on a due card page
    When I tap "edit"
    When I select all the back text and tap "U"
    Then the back edit field should be "<u>due card back 1</u>"
    When I select all the back text and tap "U"
    Then the back edit field should be "due card back 1"

