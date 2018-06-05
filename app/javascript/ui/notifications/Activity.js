import _ from 'lodash'
import PropTypes from 'prop-types'
import pluralize from 'pluralize'
import styled from 'styled-components'

import Link from '~/ui/global/Link'
import { apiStore, uiStore, routingStore } from '~/stores'
import v from '~/utils/variables'

function insertCommas(subjectUsers, subjectGroups) {
  return (subjectUsers.map(u => u.name).concat(subjectGroups.map(g => g.name))).join(', ')
}

function commentPreview(content) {
  if (!content) return ''
  return content.length > 200 ? `${content.substr(0, 200)} \u2026` : content
}

function roleArticle(nextWord) {
  if (nextWord === 'editor' || nextWord === 'admin') return 'an'
  return 'a'
}

const MAX_ACTORS = 3

const ActivityText = styled.p`
  color: ${v.colors.cararra};
  font-family: ${v.fonts.sans};
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 0;
`

class Activity extends React.PureComponent {
  actorText() {
    const { actors, actorCount } = this.props
    if (actors.length > MAX_ACTORS || actorCount > MAX_ACTORS) {
      return `${actorCount} people`
    }
    return _.uniq(actors).map(actor => actor.name).join(', ')
  }

  renameYourself() {
    const { subjectUsers } = this.props
    return subjectUsers.map(user => (user.id === apiStore.currentUserId
      ? { name: 'you' } : user))
  }

  targetLink(targetName) {
    const { target } = this.props
    const { id, internalType } = target
    if (!target.name) return ''
    if (internalType === 'groups') {
      return <button className="target" onClick={() => uiStore.openGroup(id)}>{targetName}</button>
    }
    const link = routingStore.pathTo(internalType, id)
    return <Link className="target" to={link}>{targetName}</Link>
  }

  getDataText() {
    const { action, subjectGroups, target, content } = this.props
    return {
      actorNames: this.actorText(),
      targetName: target.name,
      subjects: insertCommas(this.renameYourself(), subjectGroups),
      targetType: pluralize.singular(target.internalType),
      roleName: this.isRoleAction() && action.split('_')[1],
      message: action === 'commented' && commentPreview(content)
    }
  }

  isRoleAction() {
    return ['added_editor', 'added_member', 'added_admin'].includes(
      this.props.action
    )
  }

  getMessageText() {
    const { action } = this.props
    const {
      actorNames,
      targetName,
      roleName,
      subjects,
      message
    } = this.getDataText()

    switch (action) {
    case 'archived':
      return (
        <ActivityText>
          <strong className="actor">{actorNames}</strong>{` `}
          has archived <strong className="target">{targetName}</strong>
        </ActivityText>)
    case 'added_editor':
    case 'added_member':
    case 'added_admin':
      return (
        <ActivityText>
          <strong className="actor">{actorNames}</strong> has made{` `}
          <strong className="subjects">{subjects}</strong>{` `}
          {roleArticle(roleName)} <strong className="roleName">{roleName}</strong>{` `}
        of the {this.targetLink(targetName)}
        </ActivityText>)
    case 'commented':
      return (
        <ActivityText>
          <strong className="actor">{actorNames}</strong> commented on{` `}
          {this.targetLink(targetName)}:{` `}
          <span className="message">{message}</span>
        </ActivityText>)

    default:
      return ''
    }
  }

  render() {
    return (
      <div>
        { this.getMessageText() }
      </div>
    )
  }
}

Activity.propTypes = {
  action: PropTypes.string.isRequired,
  actors: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })).isRequired,
  target: PropTypes.shape({
    name: PropTypes.string,
    internalType: PropTypes.string,
  }).isRequired,
  subjectUsers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })),
  subjectGroups: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })),
  actorCount: PropTypes.number,
  content: PropTypes.string,
}

Activity.defaultProps = {
  subjectUsers: [],
  subjectGroups: [],
  actorCount: 0,
  content: null,
}

export default Activity
