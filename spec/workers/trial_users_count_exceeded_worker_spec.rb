require 'rails_helper'

RSpec.describe TrialUsersCountExceededWorker, type: :worker do
  describe '#perform' do
    let(:over_trial_user_count) { Organization::DEFAULT_TRIAL_USERS_COUNT + 5 }
    let(:under_trial_user_count) { Organization::DEFAULT_TRIAL_USERS_COUNT - 5 }
    let!(:already_sent) do
      create(:organization,
             trial_users_count_exceeded_email_sent: true,
             in_app_billing: true,
             trial_ends_at: 1.day.ago,
             active_users_count: over_trial_user_count,
             billable: true,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:in_app_billing_disabled) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: false,
             trial_ends_at: 1.day.ago,
             active_users_count: over_trial_user_count,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:deactivated) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: true,
             deactivated: true,
             trial_ends_at: 1.day.ago,
             active_users_count: over_trial_user_count,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:trial_has_not_ended) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: true,
             trial_ends_at: 1.day.from_now,
             active_users_count: over_trial_user_count,
             billable: true,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:trial_users_count_not_exceeding) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: true,
             trial_ends_at: 1.day.ago,
             active_users_count: under_trial_user_count,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:should_process_a) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: true,
             trial_ends_at: 1.day.ago,
             active_users_count: over_trial_user_count,
             billable: true,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end
    let!(:should_process_b) do
      create(:organization,
             trial_users_count_exceeded_email_sent: false,
             in_app_billing: true,
             trial_ends_at: 1.day.ago,
             active_users_count: over_trial_user_count,
             billable: true,
             trial_users_count: Organization::DEFAULT_TRIAL_USERS_COUNT)
    end

    it 'sends notices to organizations that meet the criteria' do
      mailer = double
      allow(mailer).to receive(:deliver_later)
      allow(TrialUsersCountExceededMailer).to receive(:notify).and_return(mailer)
      expect(mailer).to receive(:deliver_later).twice

      expect(TrialUsersCountExceededMailer).to receive(:notify).with(should_process_a)
      expect(TrialUsersCountExceededMailer).to receive(:notify).with(should_process_b)
      expect(TrialUsersCountExceededMailer).not_to receive(:notify).with(already_sent)
      expect(TrialUsersCountExceededMailer).not_to receive(:notify).with(in_app_billing_disabled)
      expect(TrialUsersCountExceededMailer).not_to receive(:notify).with(deactivated)
      expect(TrialUsersCountExceededMailer).not_to receive(:notify).with(trial_has_not_ended)
      expect(TrialUsersCountExceededMailer).not_to receive(:notify).with(trial_users_count_not_exceeding)
      TrialUsersCountExceededWorker.new.perform
    end

    it 'updates the organizations to indicate the email has been sent' do
      allow(TrialUsersCountExceededMailer).to receive_message_chain(:notify, :deliver_later)
      TrialUsersCountExceededWorker.new.perform
      expect(should_process_a.reload.trial_users_count_exceeded_email_sent).to be true
      expect(should_process_b.reload.trial_users_count_exceeded_email_sent).to be true
    end
  end
end
