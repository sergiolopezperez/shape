Feature: Editing Cover for Link Card
  Scenario: Opening the CardCoverEditor to edit the title and subtitle
    Given I login and visit My Collection
    When I click the edit "link settings" icon at 0,0
    Then I should see a 'EditCoverOptions'
    # this should get the cover font color picker (since it's first)
    When I click the "QuickOption-font color"
    And I click the "#FFD6A5" font color option
    And I type "Title" in the title textarea
    And I type "Subtitle" in the subtitle textarea
    And I click the 'ModalClose'
    And I wait for "@apiUpdateCollectionCard" to finish
    Then I should see a collection card title "Title" with a subtitle "Subtitle" and color "#FFD6A5" at 0,0

    When I click the edit "link settings" icon at 0,0
    And I click the "input" located in ".checkbox-hide-subtitle"
    And I click the 'ModalClose'
    And I wait for "@apiUpdateCollectionCard" to finish
    Then I should not see a collection card with subtitle "Subtitle"
