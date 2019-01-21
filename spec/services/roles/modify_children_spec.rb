require 'rails_helper'

RSpec.describe Roles::ModifyChildren, type: :service do
  let!(:collection) { create(:collection, num_cards: 5) }
  let!(:subcollection_card) do
    create(:collection_card_collection, parent: collection)
  end
  let(:subcollection) { subcollection_card.collection }
  let(:group) { create(:group) }
  let(:users) { [user] }
  let(:groups) { [group] }
  let(:method) { 'add' }
  let(:add_to_children) do
    # NOTE: Groups have shared collections so there will be existing group
    # roles when creating a group that will spoil the tests.
    GroupsRole.delete_all
    Roles::ModifyChildren.new(
      role_name: role_name,
      parent: collection,
      subject_users: users,
      subject_groups: groups,
      method: method,
    )
  end

  describe '#call' do
    let(:user) { create(:user) }
    let(:role_name) { Role::EDITOR }

    before do
      # unanchor everything so that they actually have their own roles
      Collection.in_collection(collection).each(&:unanchor_and_inherit_roles_from_anchor!)
      Item.in_collection(collection).each(&:unanchor_and_inherit_roles_from_anchor!)
    end

    it 'should create new roles for each user/item' do
      expect { add_to_children.call }.to change(UsersRole, :count).by(6)
    end

    it 'should create new roles for each group/item' do
      expect { add_to_children.call }.to change(GroupsRole, :count).by(6)
    end

    it 'should add editor role to all card items' do
      expect(add_to_children.call).to be true
      user.reload
      expect(collection.items.all? { |i| user.has_role?(:editor, i) }).to be true
    end

    it 'should add editor role to all card items' do
      expect(add_to_children.call).to be true
      group.reload
      expect(collection.items.all? { |i| user.has_role?(:editor, i) }).to be true
    end

    context 'with sub-collection' do
      let!(:subcollection_card) do
        create(:collection_card_collection, parent: collection)
      end
      let(:subcollection) { subcollection_card.collection }

      it 'should add editor role to sub-collection' do
        expect(collection.children).to include(subcollection)
        expect(add_to_children.call).to be true
        expect(user.has_role?(:editor, subcollection)).to be true
      end
    end

    context 'with multiple users' do
      let!(:new_users) { create_list(:user, 3) }
      let(:users) { new_users + [user] }

      before do
        users.each { |u| u.add_role(Role::EDITOR, collection) }
      end

      it 'should include all users from parent' do
        expect(add_to_children.call).to be true
        expect(collection.items.first.editors[:users]).to match_array(users)
      end
    end

    context 'with child items' do
      let(:child) { collection.children.first }
      let(:params) do
        {
          object: child,
          role_name: role_name,
          users: users,
          groups: groups,
          propagate_to_children: false,
        }
      end

      it 'should call MassAssign to save roles on the child item' do
        # 1 subcollection and 5 items should all get modified
        expect(Roles::MassAssign).to receive(:call).exactly(6).times
        expect(add_to_children.call).to be true
      end
    end

    context 'with private child' do
      let(:other_user) { create(:user) }
      let!(:collection) { create(:collection, add_editors: [other_user]) }

      before do
        subcollection.unanchor_and_inherit_roles_from_anchor!
        other_user.remove_role(Role::EDITOR, subcollection)
      end

      it 'should not add the parent roles to the child' do
        expect(Roles::MassAssign).not_to receive(:call)
        add_to_children.call
      end
    end
  end
end
