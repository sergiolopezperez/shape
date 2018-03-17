class Api::V1::RolesController < Api::V1::BaseController
  load_resource :collection, except: :destroy
  load_resource :item, except: :destroy
  before_action :authorize_manage_resource, except: :destroy
  load_and_authorize_resource :user, only: :destroy
  load_resource only: %i[destroy]

  # All roles that exist on this resource (collection or item)

  def index
    @roles = resource.roles.includes(:users, :resource)
    render jsonapi: @roles, include: %i[users resource]
  end

  # Create role(s) on this resource (collection or item)
  # Params:
  # - role: { name: 'editor' }
  # - user_ids: array of of users that you want to assign
  # Returns:
  # - array of roles successfully created, including users with that role
  def create
    users = User.where(id: json_api_params[:user_ids]).to_a
    assigner = Roles::AssignToUsers.new(
      object: resource,
      role_name: role_params[:name],
      users: users,
    )
    if assigner.call
      render jsonapi: assigner.roles, include: %i[users resource]
    else
      render_api_errors assigner.errors
    end
  end

  # Remove a role on a specific user
  def destroy
    # We want to call remove_role instead of deleting the UserRole
    # So that role lifecycle methods are called
    if @user.present? && @user.remove_role(@role.name, @role.resource)
      render jsonapi: @role
    else
      render_api_errors @user.errors
    end
  end

  private

  def json_api_params
    params[:_jsonapi]
  end

  def role_params
    json_api_params.require(:role).permit(
      :name,
    )
  end

  def authorize_manage_resource
    authorize! :manage, resource
  end

  def resource
    @collection || @item
  end
end
