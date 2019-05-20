class TestCollectionMailer < ApplicationMailer
  def notify_launch(collection_id)
    @collection = Collection::TestCollection.find(collection_id)
    @test_url = "#{root_url}/tests/#{@collection.id}"
    @launched_at = @collection.test_launched_at.strftime('%-m/%-d/%Y %I:%M%p')
    @feedback_collection_url = get_feedback_collection_url(@collection)
    @feedback_design_collection_url = frontend_url_for(@collection)

    mail to: Shape::ZENDESK_EMAIL,
      subject: "Shape Feedback: #{@collection.name} launched | ID: #{@collection.id}"
  end

  private

  def get_feedback_collection_url(collection)
    return nil if collection.collection_to_test_id.nil?

    frontend_url_for(collection.collection_to_test)
  end
end