require 'rails_helper'

describe Templateable, type: :concern do
  describe '#profile_template?' do
    let(:organization) { create(:organization) }
    let(:profile_template) { organization.profile_template }

    before do
      organization.create_profile_master_template(
        name: 'profile template',
      )
    end

    it 'should be a MasterTemplate' do
      expect(profile_template.master_template?).to be true
    end

    it 'should return true if it\'s the org\'s profile template' do
      expect(profile_template.profile_template?).to be true
    end
  end

  context 'callbacks' do
    describe '#add_template_tag' do
      let(:collection) { create(:collection, master_template: true) }

      it 'should give the #template tag if it is a master_template' do
        expect(collection.reload.cached_owned_tag_list).to match_array(['template'])
      end
    end
  end

  describe '#setup_templated_collection' do
    let(:user) { create(:user) }
    let(:template) { create(:collection, master_template: true, num_cards: 3, add_editors: [user]) }
    let(:collection) { create(:collection) }

    before do
      template.setup_templated_collection(
        for_user: user,
        collection: collection,
      )
    end

    it 'should copy the templated cards into the new collection' do
      expect(collection.collection_cards.count).to eq 3
    end

    it 'should set itself as the collection\'s template' do
      expect(collection.template).to eq template
    end
  end

  describe '#update_template_instances' do
    let(:user) { create(:user) }
    let!(:template) { create(:collection, master_template: true, num_cards: 3, pin_cards: true) }
    let!(:template_instance) { create(:collection, template: template, created_by: user) }

    context 'with new collections' do
      it 'should copy the template\'s pinned cards into the templated collections' do
        template.update_template_instances
        expect(template_instance.collection_cards.count).to eq(3)
        expect(template_instance.collection_cards.map(&:templated_from_id)).to match_array(
          template.collection_cards.map(&:id),
        )
      end
    end

    context 'with existing template instance' do
      let!(:template_beginning_card_ids) { template.collection_cards.map(&:id) }
      before do
        template.setup_templated_collection(
          for_user: user,
          collection: template_instance,
        )
      end
      let!(:deleted_card) do
        card = template.collection_cards.first
        card.destroy
        card
      end
      let!(:added_cards) do
        cards = create_list(:collection_card_text, 2, pinned: true)
        template.collection_cards << cards[0]
        template.collection_cards << cards[1]
        cards
      end
      before do
        # Add a new card directly to the instance
        template_instance.collection_cards << create(:collection_card_text)
        template_instance.reload
      end

      it 'should update all pinned cards to match any template updates' do
        expect(template_instance.collection_cards.count).to eq(4)
        expect(template_instance.collection_cards.pinned.count).to eq(3)
        template.update_template_instances
        template_instance.reload
        # Added 2 cards from master + created Deleted From Template collection
        expect(template_instance.collection_cards.count).to eq(6)
        expect(template_instance.collection_cards.pinned.count).to eq(4)
        # unpinned card should get reordered to the end
        expect(template_instance.collection_cards.last.pinned?).to eq false
      end

      it 'should add new cards into instance' do
        expect(template_instance.collection_cards.size).to eq(4)
        template.update_template_instances
        template_instance.collection_cards.reload
        expect(template_instance.collection_cards.size).to eq(6)
        # Two nils - one for card added directly, one for 'Deleted From' collection
        expect(template_instance.collection_cards.map(&:templated_from_id)).to match_array(
          added_cards.map(&:id) +
          template_beginning_card_ids +
          [nil, nil] - [deleted_card.id],
        )
      end

      it 'should move deleted cards into Deleted From Template collection' do
        template.update_template_instances
        deleted_from_collection = template_instance.find_or_create_deleted_cards_collection
        expect(deleted_from_collection.children.size).to eq(1)
        expect(
          deleted_from_collection.collection_cards.first.templated_from_id,
        ).to eq(deleted_card.id)
      end
    end
  end
end
