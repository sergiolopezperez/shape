module ColabImport
  class CreateMediaItem
    attr_reader :item

    def initialize(data:)
      @data = data
      @item = nil
    end

    # Creates a new item for a given collection card
    def call
      if type == 'image'
        create_image_item
      elsif type == 'video'
        create_video_item
      else
        raise "Unsupported CreateMediaItem item type: #{type}"
      end

      return false if @item.blank?
      @item.persisted?
    end

    def errors
      @item.errors
    end

    def url
      @data['source']
    end

    private

    def create_image_item
      return if url.blank?
      return unless UrlExists.new(url).call

      begin
        @item = Item::FileItem.create(
          name: name,
          filestack_file: FilestackFile.create_from_url(url)
        )
      rescue
        @item = nil
      end
    end

    def create_video_item
      # No video items from media had a thumbnail
      # some were youtube, some on drive
      @item = Item::VideoItem.create(
        name: name,
        url: url,
        thumbnail_url: url,
      )
    end

    # All 'types' seemed to be image or video
    def type
      @data['type']
    end

    def name
      @data['desc']
    end
  end
end