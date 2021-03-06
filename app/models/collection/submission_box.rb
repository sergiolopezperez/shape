# == Schema Information
#
# Table name: collections
#
#  id                             :bigint(8)        not null, primary key
#  anyone_can_join                :boolean          default(FALSE)
#  anyone_can_view                :boolean          default(FALSE)
#  archive_batch                  :string
#  archived                       :boolean          default(FALSE)
#  archived_at                    :datetime
#  breadcrumb                     :jsonb
#  cached_attributes              :jsonb
#  cached_test_scores             :jsonb
#  collection_type                :integer          default("collection")
#  cover_type                     :integer          default("cover_type_default")
#  end_date                       :datetime
#  font_color                     :string
#  hide_submissions               :boolean          default(FALSE)
#  icon                           :string
#  master_template                :boolean          default(FALSE)
#  name                           :string
#  num_columns                    :integer          default(4)
#  processing_status              :integer
#  propagate_background_image     :boolean          default(FALSE)
#  propagate_font_color           :boolean          default(FALSE)
#  search_term                    :string
#  shared_with_organization       :boolean          default(FALSE)
#  show_icon_on_cover             :boolean
#  start_date                     :datetime
#  submission_box_type            :integer
#  submissions_enabled            :boolean          default(TRUE)
#  test_closed_at                 :datetime
#  test_launched_at               :datetime
#  test_show_media                :boolean          default(TRUE)
#  test_status                    :integer
#  type                           :string
#  unarchived_at                  :datetime
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  challenge_admin_group_id       :integer
#  challenge_participant_group_id :integer
#  challenge_reviewer_group_id    :integer
#  cloned_from_id                 :bigint(8)
#  collection_to_test_id          :bigint(8)
#  created_by_id                  :integer
#  default_group_id               :integer
#  idea_id                        :integer
#  joinable_group_id              :bigint(8)
#  organization_id                :bigint(8)
#  question_item_id               :integer
#  roles_anchor_collection_id     :bigint(8)
#  submission_box_id              :bigint(8)
#  submission_template_id         :integer
#  survey_response_id             :integer
#  template_id                    :integer
#  test_collection_id             :bigint(8)
#
# Indexes
#
#  index_collections_on_archive_batch               (archive_batch)
#  index_collections_on_breadcrumb                  (breadcrumb) USING gin
#  index_collections_on_cached_test_scores          (cached_test_scores) USING gin
#  index_collections_on_cloned_from_id              (cloned_from_id)
#  index_collections_on_created_at                  (created_at)
#  index_collections_on_idea_id                     (idea_id)
#  index_collections_on_organization_id             (organization_id)
#  index_collections_on_roles_anchor_collection_id  (roles_anchor_collection_id)
#  index_collections_on_submission_box_id           (submission_box_id)
#  index_collections_on_submission_template_id      (submission_template_id)
#  index_collections_on_template_id                 (template_id)
#  index_collections_on_test_status                 (test_status)
#  index_collections_on_type                        (type)
#
# Foreign Keys
#
#  fk_rails_...  (organization_id => organizations.id)
#

class Collection
  class SubmissionBox < Collection
    belongs_to :submission_template, class_name: 'Collection', optional: true
    has_one :submissions_collection,
            class_name: 'Collection::SubmissionsCollection',
            dependent: :destroy
    validate :submission_template_is_a_master_template
    # also archive the submissions_collection along with collection defaults
    self.archive_with += %i[submissions_collection]

    enum submission_box_type: {
      template: 0,
      text: 1,
      link: 2,
      file: 3,
    }

    # override base collection method e.g. for ModifyChildrenRolesWorker
    def children
      (items + collections + [submissions_collection]).compact
    end

    def duplicate!(**args)
      duplicate = super(args)
      return duplicate if duplicate.new_record? || duplicate.errors.present?

      duplicate.setup_submissions_collection!
      duplicate
    end

    def setup_submissions_collection
      build_submissions_collection(
        name: "#{name} Submissions",
        organization: organization,
        num_columns: num_columns,
      )
    end

    def setup_submissions_collection!
      setup_submissions_collection
      submissions_collection.save
    end

    def submit_all_submissions!
      submissions.find_each do |submission|
        next if submission.item?

        submission.submit_submission!
      end
    end

    def submissions
      return [] unless submissions_collection

      submissions_collection.submissions
    end

    def destroyable?
      # destroyable if it hasn't finished setting up
      submission_box_type.nil?
    end

    def available_submission_tests(for_user:, omit_id: nil)
      return [] unless submission_box_type == 'template' && submission_template.present?

      sub_attrs = submission_template.submission_attrs
      # none are available if the editor has not launched
      return [] if sub_attrs.blank? || sub_attrs['test_status'] != 'live'

      test_ids = []

      has_challenge_group_with_audience = false
      if inside_a_challenge?
        has_challenge_group_with_audience = challenge_test_audience_for_user(for_user).present?
      end

      submissions.each do |submission|
        next unless submission.try(:launchable_test_id).present?
        # only include reviewable submissions whose current user has not already reviewed it
        next if inside_a_challenge? && !submission.unreviewed_by?(for_user, has_challenge_group_with_audience)

        test_ids << submission.launchable_test_id
      end
      if for_user.present?
        user_responses = SurveyResponse.where(
          test_collection_id: test_ids,
          user_id: for_user.id,
          status: 'completed',
        )
        # omit any tests where the user has already completed their response
        test_ids -= user_responses.pluck(:test_collection_id)
      end
      test_ids -= [omit_id] if omit_id
      return [] if test_ids.empty?

      possible_tests = Collection::TestCollection.where(id: test_ids, test_status: 'live')
      master_test = Collection::TestCollection.find sub_attrs['launchable_test_id']
      if master_test.collection_to_test.present? && !inside_a_challenge?
        return [] unless for_user

        return possible_tests.viewable_by(for_user, organization)
      end
      possible_tests
    end

    def random_next_submission_test(for_user:, omit_id: nil)
      # will be nil if none are available
      available = available_submission_tests(for_user: for_user, omit_id: omit_id)
      return Collection.none if available.empty?

      # need to use inner query to combine `order` + `distinct`
      Collection::TestCollection
        .from(available, :collections)
        .order(Arel.sql('RANDOM()'))
    end

    private

    def submission_template_is_a_master_template
      return if submission_template.nil? || submission_template.master_template?

      errors.add(:submission_template, 'must be a Master Template')
    end
  end
end
