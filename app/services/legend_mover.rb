class LegendMover < SimpleService
  attr_reader :errors, :new_legend_item_cards

  def initialize(to_collection:, cards:, action:)
    @to_collection = to_collection
    @cards = cards
    @action = action
    @errors = []
    @legend_items_to_duplicate_or_link = []
    @new_legend_item_cards = []
  end

  def call
    include_legends_in_to_collection_cards
    duplicate_or_link_legend_items
    @errors.blank?
  end

  private

  # If they are moving a data item that has a legend,
  # but haven't selected the legend, move it as well
  def include_legends_in_to_collection_cards
    all_data_item_legends = to_collection_data_items.map(&:legend_item).compact
    legends_missing = all_data_item_legends - to_collection_legend_items

    # Return because all linked legends are included in the `to_collection`
    return if legends_missing.blank?

    to_collection_data_item_ids = to_collection_data_items.map(&:id)

    # Include any legends that are missing
    legends_missing.each do |legend_item|
      # If the legend is only linked to data items in `to_collection`, move it
      if (legend_item.data_item_ids - to_collection_data_item_ids).size.zero?
        @new_legend_item_cards.push(legend_item.parent_collection_card)
      else
        # Otherwise we need to create a new legend
        @legend_items_to_duplicate_or_link.push(legend_item)
      end
    end
  end

  def duplicate_or_link_legend_items
    @legend_items_to_duplicate_or_link.each do |legend_item|
      if move? || duplicate?
        duplicate = duplicate_legend_item(legend_item)
        if duplicate.persisted? && add_duplicate_legend_item_to_data_items(legend_item, duplicate)
          @new_legend_item_cards.push(duplicate.parent_collection_card)
        else
          @errors << "Could not copy legend: #{duplicate.errors.full_messages.join('. ')}"
        end
      elsif link?
        linked_card = legend_item.parent_collection_card.copy_into_new_link_card
        @new_legend_item_cards.push(linked_card)
      end
    end
  end

  def duplicate_legend_item(legend_item)
    legend_item.duplicate!(
      for_user: nil,
      copy_parent_card: true,
      parent: @to_collection,
      system_collection: false,
      synchronous: true,
    )
  end

  def add_duplicate_legend_item_to_data_items(original_legend_item, duplicate_legend_item)
    # Connect to all data items it was connected to
    # Only including data items now in the `to_collection`
    add_to_data_items = to_collection_data_items & original_legend_item.data_items

    add_to_data_items.all? do |data_item|
      if data_item.update(legend_item: duplicate_legend_item)
        true
      else
        @errors << "Could not link legend to data item: #{data_item.errors.full_messages.join('. ')}"
        false
      end
    end
  end

  def to_collection_data_items
    @cards.select do |card|
      card.item&.is_a?(Item::DataItem)
    end.map(&:item)
  end

  def to_collection_legend_items
    @cards.select do |card|
      card.item.is_a?(Item::LegendItem)
    end.map(&:item)
  end

  def link?
    @action == 'link'
  end

  def move?
    @action == 'move'
  end

  def duplicate?
    @duplicate == 'duplicate'
  end
end
