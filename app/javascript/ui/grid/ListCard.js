import { Fragment } from 'react'
import { Flex } from 'reflexbox'
import { computed } from 'mobx'
import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'

import ActionMenu from '~/ui/grid/ActionMenu'
import CollectionIconXs from '~/ui/icons/CollectionIconXs'
import CollectionTypeIcon from '~/ui/global/CollectionTypeIcon'
import FileIcon from '~/ui/grid/covers/FileIcon'
import LinkIcon from '~/ui/icons/LinkIcon'
import ListCoverRenderer from '~/ui/grid/ListCoverRenderer'
import RolesSummary from '~/ui/roles/RolesSummary'
import SelectionCircle from '~/ui/grid/SelectionCircle'
import TextIconXs from '~/ui/icons/TextIconXs'
import VideoIcon from '~/ui/icons/VideoIcon'
import { defaultTimeFormat } from '~/utils/time'
import { DisplayTextCss } from '~/ui/global/styled/typography'
import { routingStore, uiStore } from '~/stores'
import v, { ITEM_TYPES } from '~/utils/variables'

export const Column = styled.div`
  ${DisplayTextCss}
  align-items: center;
  display: flex;
  margin-left: ${props => props.marginLeft};
  width: ${props => props.width};
`

Column.defaultProps = {
  marginLeft: '0',
  width: 'auto',
}

const Row = styled(Flex)`
  align-items: center;
  height: 50px;
  margin-bottom: 8px;

  ${Column} > .show-on-hover {
    display: none;
  }

  &:hover {
    ${Column} > .show-on-hover {
      display: flex;
    }
  }

  *::selection {
    background: transparent;
  }
`

const ColumnLink = styled.button`
  align-items: center;
  cursor: pointer;
  display: flex;
`

const IconHolder = styled.div`
  color: ${v.colors.commonDark};
  display: flex;
  height: 16px;
  margin-left: 8px;
  width: 16px;
`

class ListCard extends React.Component {
  @computed
  get menuOpen() {
    return uiStore.actionMenuOpenForCard(this.props.card.id)
  }

  handleRecordClick = ev => {
    const { card } = this.props
    ev.preventDefault()
    ev.stopPropagation()
    routingStore.routeTo('items', card.record.id)
  }

  handleRowClick = ev => {
    const { card } = this.props
    if (uiStore.captureKeyboardGridClick(ev, card.id)) {
      return
    }
    uiStore.toggleSelectedCardId(card.id)
  }

  handleActionMenuClick = ev => {
    const { card } = this.props
    ev.stopPropagation()

    uiStore.openContextMenu(ev, {
      card,
    })
  }

  handleCloseMenu = () => {
    // this happens when you mouse off the ActionMenu
    if (this.menuOpen) {
      // if we right-clicked, keep the menu open
      if (!uiStore.cardMenuOpenAndPositioned) {
        uiStore.closeCardMenu()
      }
    }
  }

  handleRolesClick = ev => {
    const {
      card: { record },
    } = this.props
    ev.stopPropagation()
    uiStore.update('rolesMenuOpen', record)
  }

  get renderIcons() {
    const { card } = this.props
    if (card.record.isCollection) {
      return (
        <Fragment>
          <IconHolder>
            <CollectionIconXs />
          </IconHolder>
          <IconHolder>
            <CollectionTypeIcon record={card.record} />
          </IconHolder>
        </Fragment>
      )
    }
    let icon = null
    switch (card.record.type) {
      case ITEM_TYPES.TEXT:
        icon = <TextIconXs />
        break
      case ITEM_TYPES.FILE:
        icon = <FileIcon mimeType={card.record.filestack_file.mimetype} />
        break
      case ITEM_TYPES.VIDEO:
        icon = <VideoIcon />
        break
      case ITEM_TYPES.LINK:
        icon = <LinkIcon />
        break
    }
    return <IconHolder>{icon}</IconHolder>
  }

  render() {
    const { card } = this.props
    return (
      <Row onClick={this.handleRowClick}>
        <Column width="50px">
          <div className="show-on-hover">
            <SelectionCircle cardId={card.id} />
          </div>
        </Column>
        <Column width="500px">
          <ColumnLink onClick={this.handleRecordClick}>
            <ListCoverRenderer
              card={card}
              cardType={card.record.internalType}
              record={card.record}
              height={1}
              handleClick={this.handleRecordClick}
            />
            {card.record.name}
            {this.renderIcons}
          </ColumnLink>
        </Column>
        <Column width="400px">{defaultTimeFormat(card.updated_at)}</Column>
        <Column>
          <RolesSummary
            key="roles"
            handleClick={this.handleRolesClick}
            roles={[...card.record.roles]}
            canEdit={card.record.can_edit}
            // convert observable to normal array to trigger render changes
            collaborators={[...card.record.collaborators]}
            rolesMenuOpen={!!uiStore.rolesMenuOpen}
          />
        </Column>
        <Column marginLeft="auto">
          <ActionMenu
            location="GridCard"
            card={card}
            canView={card.record.can_view}
            canEdit={card.record.can_edit}
            canReplace={card.record.canReplace && !card.link}
            menuOpen={this.menuOpen}
            onOpen={this.handleActionMenuClick}
            onLeave={this.handleCloseMenu}
          />
        </Column>
      </Row>
    )
  }
}
ListCard.propTypes = {
  card: MobxPropTypes.objectOrObservableObject.isRequired,
  insideChallenge: PropTypes.bool,
}
ListCard.defaultProps = {
  insideChallenge: false,
}

export default ListCard
