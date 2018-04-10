import BaseRecord from './BaseRecord'

class Group extends BaseRecord {
  API_archive() {
    return this.apiStore.request(`groups/${this.id}/archive`, 'PATCH')
  }

  attributesForAPI = ['name', 'handle', 'filestack_file_attributes']
}

Group.type = 'groups'

export default Group
