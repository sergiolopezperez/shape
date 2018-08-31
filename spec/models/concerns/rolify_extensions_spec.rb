require 'rails_helper'

describe RolifyExtensions, type: :concern do
  let(:organization) { create(:organization) }
  let(:collection) { create(:collection, organization: organization) }
  let(:user) { create(:user) }

  before do
    organization.setup_user_membership(user)
  end

  it 'should have concern included' do
    expect(User.ancestors).to include(RolifyExtensions)
  end

  describe 'callbacks' do
    describe '#clear_cached_roles' do
      it 'should reset has_role_by_identifier? after add_role' do
        expect {
          user.add_role(Role::EDITOR, collection)
        }.to change {
          user.reload.has_role_by_identifier?(Role::EDITOR, collection.resource_identifier)
        }.from(false).to(true)
      end

      it 'should reset has_role_by_identifier? after remove_role' do
        user.add_role(Role::EDITOR, collection)
        expect {
          user.remove_role(Role::EDITOR, collection)
        }.to change {
          user.reload.has_role_by_identifier?(Role::EDITOR, collection.resource_identifier)
        }.from(true).to(false)
      end
    end
  end

  describe '#has_role_by_identifier?' do
    let(:has_editor_role) do
      user.has_role_by_identifier?(Role::EDITOR, collection.resource_identifier)
    end
    let(:has_viewer_role) do
      user.has_role_by_identifier?(Role::VIEWER, collection.resource_identifier)
    end

    it 'returns true if user has role' do
      user.add_role(Role::EDITOR, collection)
      expect(has_editor_role).to be true
    end

    it 'returns false if user does not have role' do
      expect(has_editor_role).to be false
    end

    context 'with group' do
      let!(:group) { create(:group, organization: organization) }

      before do
        user.add_role(Role::MEMBER, group)
      end

      it 'returns false if group does not have role' do
        expect(has_editor_role).to be false
        expect(has_viewer_role).to be false
      end

      it 'returns true if user has role through group' do
        group.add_role(Role::VIEWER, collection)
        expect(has_viewer_role).to be true
        expect(has_editor_role).to be false
      end

      it 'returns true if user has role through group' do
        group.add_role(Role::EDITOR, collection)
        expect(has_editor_role).to be true
        expect(has_viewer_role).to be false
      end
    end
  end

  describe '#precache_roles_for' do
    let(:collection_cards) { create_list(:collection_card_text, 3, parent: collection) }
    let(:user) { create(:user, add_to_org: organization) }
    let(:group) { create(:group, add_members: [user], organization: organization) }

    before do
      user.add_role(Role::EDITOR, collection)
      collection_cards.each do |cc|
        group.add_role(Role::VIEWER, cc.item)
      end
      user.reset_cached_roles!
    end

    it 'returns nil unless `has_role_by_identifier?` has been called' do
      has_roles = user.precache_roles_for([Role::VIEWER], collection)
      expect(has_roles).to be nil
    end

    it 'precaches role relationships into @has_role_by_identifier' do
      # perform one query to prime the @has_role_by_identifier hash
      # (e.g. this may happen during load_and_authorize_resource)
      user.has_role_by_identifier? Role::EDITOR, collection.resource_identifier
      has_roles = user.precache_roles_for(
        [Role::VIEWER, Role::CONTENT_EDITOR, Role::EDITOR],
        collection.children_and_linked_children,
      )
      expect(has_roles).to include(
        ['editor', collection.resource_identifier] => true,
        ['viewer', collection_cards.first.record.resource_identifier] => true,
        ['viewer', collection_cards.second.record.resource_identifier] => true,
      )
    end
  end

  describe '#add_role' do
    # test special case for only being admin/member of group
    let(:group) { create(:group, organization: organization) }

    it 'does not add admin role if already a member' do
      # initial role should add
      expect {
        user.add_role(Role::MEMBER, group)
      }.to change(user.users_roles, :count)

      # further additions should not change the count
      expect {
        user.add_role(Role::MEMBER, group)
      }.to not_change(user.users_roles, :count)

      # further additions should not change the count
      expect {
        user.add_role(Role::ADMIN, group)
      }.to not_change(user.users_roles, :count)
    end

    it 'does not add viewer role if already an editor' do
      # initial role should add
      expect {
        user.add_role(Role::EDITOR, collection)
      }.to change(user.users_roles, :count)

      # further additions should not change the count
      expect {
        user.add_role(Role::EDITOR, collection)
      }.to not_change(user.users_roles, :count)

      # further additions should not change the count
      expect {
        user.add_role(Role::VIEWER, collection)
      }.to not_change(user.users_roles, :count)
    end

    it 'upgrades to editor role if already an viewer' do
      # initial role should add
      expect {
        user.add_role(Role::VIEWER, collection)
      }.to change(user.users_roles, :count)
      expect(collection.can_edit?(user)).to be false

      # further additions should not change the count
      expect {
        user.add_role(Role::EDITOR, collection)
      }.to not_change(user.users_roles, :count)
      user.reload
      expect(collection.can_edit?(user)).to be true
    end
  end

  describe '#upgrade_to_edit_role' do
    before do
      user.add_role(Role::CONTENT_EDITOR, collection)
    end

    it 'should remove content editor role and upgrade to editor' do
      user.upgrade_to_edit_role(collection)
      user.reload
      expect(collection.can_edit?(user)).to be true
    end
  end
end