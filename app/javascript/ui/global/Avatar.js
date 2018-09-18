import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import MuiAvatar from '@material-ui/core/Avatar'
import styled from 'styled-components'

import { routingStore } from '~/stores'
import Tooltip from '~/ui/global/Tooltip'
import v from '~/utils/variables'

const StyledAvatar = styled(MuiAvatar)`
  &.avatar {
    width: ${props => props.size}px;
    margin-left: 5px;
    margin-right: 5px;
    height: ${props => props.size}px;
    cursor: ${props => props.cursor};

    @media only screen and (max-width: ${v.responsive.smallBreakpoint}px) {
      width: ${props => props.size * 0.8}px;
      height: ${props => props.size * 0.8}px;
    }
  }
`

@observer
class Avatar extends React.Component {
  @observable
  url = null

  constructor(props) {
    super(props)
    this.setUrl(props.url)
  }

  componentWillReceiveProps({ url }) {
    this.setUrl(url)
  }

  @action
  setUrl(url) {
    this.url = url
  }

  onError = () => {
    this.setUrl(Avatar.defaultProps.url)
  }

  handleClick = () => {
    const { linkToCollectionId } = this.props
    if (!linkToCollectionId) return false
    return routingStore.routeTo('collections', linkToCollectionId)
  }

  render() {
    const {
      className,
      displayName,
      size,
      title,
      linkToCollectionId,
    } = this.props
    const renderAvatar = (
      <StyledAvatar
        alt={title}
        size={size}
        className={`avatar ${className}`}
        src={this.url}
        imgProps={{ onError: this.onError }}
        onClick={this.handleClick}
        cursor={linkToCollectionId || displayName ? 'pointer' : 'initial'}
      />
    )
    let content = renderAvatar
    if (displayName) {
      content = (
        <Tooltip
          classes={{ tooltip: 'Tooltip' }}
          title={title}
          placement="bottom"
        >
          {renderAvatar}
        </Tooltip>
      )
    }
    return content
  }
}

Avatar.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  displayName: PropTypes.bool,
  linkToCollectionId: PropTypes.string,
}
Avatar.defaultProps = {
  url:
    'https://d3none3dlnlrde.cloudfront.net/assets/users/avatars/missing/square.jpg',
  size: 34,
  className: '',
  title: 'Avatar',
  displayName: false,
  linkToCollectionId: null,
}

export default Avatar
