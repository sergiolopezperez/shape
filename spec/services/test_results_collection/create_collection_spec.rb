require 'rails_helper'

RSpec.describe TestResultsCollection::CreateCollection, type: :service do
  let(:test_collection) { create(:test_collection) }
  subject do
    TestResultsCollection::CreateCollection.call(
      test_collection: test_collection,
    )
  end

  context 'with more scaled questions' do
    let!(:test_collection) { create(:test_collection, :completed) }
    let(:test_results_collection) { test_collection.test_results_collection }
    let!(:scale_questions) { create_list(:question_item, 2, parent_collection: test_collection) }
    let(:legend_item) { test_results_collection.legend_item }

    it 'should create a LegendItem at the 3rd spot (order == 2)' do
      subject
      expect(legend_item.parent_collection_card.order).to eq 2
      expect(
        test_results_collection
        .collection_cards
        .reload
        .map { |card| card.record.class.name },
      ).to eq(
        [
          'Item::VideoItem',
          'Item::DataItem',
          'Item::LegendItem',
          'Collection',
          'Item::DataItem',
          'Item::DataItem',
          'Item::DataItem',
          'Collection::TestOpenResponses',
          'Collection::TestOpenResponses',
          'Item::DataItem',
          'Item::DataItem',
          'Collection::TestCollection',
        ],
      )
      expect(
        test_results_collection
        .collection_cards
        .map(&:order),
      ).to eq(0.upto(11).to_a)
    end
  end
end
