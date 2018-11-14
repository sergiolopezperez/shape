# With replace, we are keeping the card and item record, but changing the item data
class CollectionCardReplacer
  attr_reader :replacing_card, :errors

  def initialize(replacing_card:, params:)
    @replacing_card = replacing_card
    @item = @replacing_card.item
    @attrs = params[:item_attributes]
    @errors = nil
  end

  def replace
    if @item.blank? || @attrs.blank?
      @replacing_card.errors.add(:item, "can't be blank")
      # initially use card errors
      @errors = @replacing_card.errors
      return false
    end
    # now capture errors on the item
    @errors = @item.errors
    assign_item_attributes
    @item.save
  end

  private

  def assign_item_attributes
    # clear item's existing attrs, keeping the original id / created_at
    # NOTE: is there a more proper way to do this?
    @item.attributes = Item.new(
      id: @item.id,
      created_at: @item.created_at,
      updated_at: Time.now,
    ).attributes
    # set the passed in attrs
    @item.attributes = @attrs
    # the class type may have changed
    @item = @item.becomes(@attrs[:type].constantize)
    # this needs to happen after the @item.becomes
    return unless @attrs[:filestack_file_attributes].present?
    @item.filestack_file_attributes = @attrs[:filestack_file_attributes]
  end
end