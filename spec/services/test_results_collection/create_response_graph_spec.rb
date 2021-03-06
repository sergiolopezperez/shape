require 'rails_helper'

RSpec.describe TestResultsCollection::CreateResponseGraph, type: :service do
  let(:test_collection) { create(:test_collection) }
  let(:question_item) do
    create(
      :question_item,
      question_type: :question_useful,
      parent_collection: test_collection,
    )
  end
  let(:test_results_collection) { create(:test_results_collection, test_collection: test_collection) }
  let(:data_item) { test_results_collection.data_items.first }
  subject do
    TestResultsCollection::CreateResponseGraph.call(
      item: question_item,
      parent_collection: test_results_collection,
    )
  end

  it 'creates a chart item for the question' do
    expect {
      subject
    }.to change(
      Item::DataItem, :count
    ).by(1)
  end

  it 'links data item to dataset' do
    subject
    expect(
      data_item.datasets.without_groupings.first.data_source,
    ).to eq(question_item)
  end

  it 'links data item to org-wide dataset' do
    subject
    expect(data_item.datasets).to include(
      question_item.org_wide_question_dataset,
    )
  end

  it 'links data item to idea datasets' do
    subject
    expect(test_collection.idea_items.size).to eq(1)
    test_collection.idea_items.each do |idea|
      idea_dataset = data_item.datasets.find { |dataset| dataset.group_by_type_id('Item').to_i == idea.id }
      expect(idea_dataset).not_to be_nil
    end
  end

  context 'with test audiences' do
    let!(:test_audience) { create(:test_audience, test_collection: test_collection) }

    it 'creates test audience dataset' do
      subject

      test_audience_dataset = data_item.datasets.find do |dataset|
        next if dataset.groupings.blank?

        dataset.groupings[0]['type'] == 'TestAudience' &&
          dataset.groupings[0]['id'] == test_audience.id
      end

      expect(test_audience_dataset).not_to be_nil
    end
  end

  context 'if data item exists' do
    before do
      TestResultsCollection::CreateResponseGraph.call(
        item: question_item,
        parent_collection: test_results_collection,
      )
    end

    it 'does not create it' do
      expect {
        subject
      }.not_to change(
        Item::DataItem, :count
      )
    end
  end
end
