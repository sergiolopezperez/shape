# == Schema Information
#
# Table name: filestack_files
#
#  id         :bigint(8)        not null, primary key
#  docinfo    :jsonb
#  filename   :string
#  handle     :string
#  mimetype   :string
#  size       :integer
#  url        :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class FilestackFile < ApplicationRecord
  has_one :item
  has_one :group
  has_one :organization

  validates :url, :handle, :mimetype, presence: true

  after_create :process_image, if: :image?
  after_destroy :delete_on_filestack, unless: :url_being_used?

  TOKEN_EXPIRATION = 1.hour

  amoeba do
    enable
    recognize []
  end

  # TODO: change this so it actually duplicates the file - needs background worker
  #       Instead of duplicating the object, it would call:
  #       FilestackFile.create_from_url(url)

  def duplicate!
    ff = amoeba_dup
    ff.save
    ff
  end

  def filename_without_extension
    return if filename.blank?

    filename.sub(/\.\w+$/, '')
  end

  def image?
    mimetype.include?('image')
  end

  # Create a new filestack file from an external asset
  def self.create_from_url(external_url)
    filelink = api_client.upload(external_url: external_url)
    metadata = filelink.metadata
    create(
      url: filelink.url,
      handle: filelink.handle,
      filename: metadata['filename'],
      mimetype: metadata['mimetype'],
      size: metadata['size'],
    )
  end

  # private

  # Docs: https://www.filestack.com/docs/sdks?ruby
  def self.api_client
    @api_client ||= FilestackClient.new(ENV['FILESTACK_API_KEY'], security: filestack_security)
  end

  def self.filestack_security(read_only: true)
    raise 'FilestackSecurity needs FILESTACK_API_SECRET to be set' if ENV['FILESTACK_API_SECRET'].blank?

    permissions = %w[read convert stat exif]
    permissions += %w[store pick] unless read_only
    FilestackSecurity.new(
      ENV['FILESTACK_API_SECRET'],
      options: {
        expiry: TOKEN_EXPIRATION.to_i,
        call: permissions,
      },
    )
  end

  def self.security_token(read_only: true)
    security = filestack_security(read_only: read_only)
    {
      policy: security.policy,
      signature: security.signature,
    }
  end

  def self.signed_url(handle, type:)
    token = security_token
    %(https://process.filestackapi.com/#{ENV['FILESTACK_API_KEY']}
      /security=policy:#{token[:policy]},signature:#{token[:signature]}
      /#{type == :video ? 'video_convert=preset:h264' : 'rotate=deg:exif'}
      /#{handle}
    ).gsub(/\s+/, '')
  end

  def signed_url
    FilestackFile.signed_url(handle, type: :image)
  end

  def video_conversion_url
    FilestackFile.signed_url(handle, type: :video)
  end

  def filestack_filelink
    FilestackFilelink.new(
      handle,
      apikey: ENV['FILESTACK_API_KEY'],
      security: FilestackFile.filestack_security,
    )
  end

  def secure_url
    # Allow other opts other than default rotate=deg:exif?
    filestack_filelink.transform.rotate(deg: 'exif').url
  end

  def process_image
    # TODO: We will want do decide what kind of post-processing to do on uploaded files
    # docs: https://www.filestack.com/docs/image-transformations
  end

  def url_being_used?
    FilestackFile
      .where(url: url)
      .where.not(id: id)
      .count
      .positive?
  end

  def delete_on_filestack
    filestack_filelink.delete
  end
end
