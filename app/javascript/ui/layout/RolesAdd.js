import PropTypes from 'prop-types'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import { withStyles } from 'material-ui/styles'
import {
  FormButton,
  FormActionsContainer,
} from '~/ui/global/styled/forms'
import {
  RowItemRight,
} from '~/ui/global/styled/layout'
import AutoComplete from '~/ui/global/AutoComplete'
import PillList from '~/ui/global/PillList'
import Select from 'material-ui/Select'
import { MenuItem } from 'material-ui/Menu'

const materialStyles = {
  selectMenu: {
    backgroundColor: 'transparent',
    '&:focus': { backgroundColor: 'transparent' },
    '&:hover': { backgroundColor: 'transparent' },
  }
}

@observer
class RolesAdd extends React.Component {
  @action
  onUserSelected = (data) => {
    let user = data
    if (!data.id) {
      user = Object.assign({}, { name: data.custom, email: data.custom })
    }
    if (!this.selectedUsers.find((selected) => selected.email === user.email)) {
      this.selectedUsers.push(user)
    }
  }

  @action
  onUserDelete = (user) => {
    this.selectedUsers.remove(user)
  }

  onUserSearch = (searchTerm) =>
    this.props.onSearch(searchTerm).then((res) =>
      res.data.map((user) =>
        ({ value: user.email, label: user.name, data: user })))

  handleSave = (ev) => {
    const emails = this.selectedUsers
      .filter((selected) => !selected.id)
      .map((selected) => selected.email)

    const fullUsers = this.selectedUsers
      .filter((selected) => !!selected.id)

    let firstReq = Promise.resolve({ data: [] })
    if (emails.length) {
      firstReq = this.props.onCreateUsers(emails)
    }
    return firstReq.then((res) =>
      this.props.onCreateRoles(
        [...res.data, ...fullUsers], this.selectedRole
      ))
      .then((roles) => {
        this.reset()
        return roles
      })
  }

  @action
  handleRoleSelect = (ev) => {
    this.selectedRole = ev.target.value
  }

  @action
  reset() {
    this.selectedUsers = []
  }

  @observable selectedUsers = []
  @observable selectedRole = 'viewer'

  render() {
    const { classes } = this.props
    return (
      <div>
        { this.selectedUsers.length > 0 && (
          <PillList
            itemList={this.selectedUsers}
            onItemDelete={this.onUserDelete}
          />)
        }
        <RowItemRight>
          <Select
            classes={classes}
            displayEmpty
            disableUnderline
            name="role"
            onChange={this.handleRoleSelect}
            value={this.selectedRole}
          >
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        </RowItemRight>
        <AutoComplete
          onInputChange={this.onUserSearch}
          onOptionSelect={this.onUserSelected}
        />
        <FormActionsContainer>
          <FormButton onClick={this.handleSave}>Add</FormButton>
        </FormActionsContainer>
      </div>
    )
  }
}

RolesAdd.propTypes = {
  onCreateRoles: PropTypes.func.isRequired,
  onCreateUsers: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  classes: PropTypes.shape({
    selectMenu: PropTypes.string,
  }).isRequired,
}
RolesAdd.defaultProps = {
  onSearch: () => {}
}

export default withStyles(materialStyles)(RolesAdd)
