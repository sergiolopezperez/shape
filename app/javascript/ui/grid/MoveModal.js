import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { observable, runInAction } from 'mobx'
import styled from 'styled-components'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import CloseIcon from '~/ui/icons/CloseIcon'
import InlineLoader from '~/ui/layout/InlineLoader'
import MoveArrowIcon from '~/ui/icons/MoveArrowIcon'
import MoveHelperModal from '~/ui/users/MoveHelperModal'
import Tooltip from '~/ui/global/Tooltip'
import v from '~/utils/variables'
import { routingStore } from '~/stores'

const StyledSnackbar = styled(Snackbar)`
  &.Snackbar {
    width: 100%;
    top: auto;
    max-width: 673px;
    margin-bottom: 35px;
    flex-grow: 1;
    color: white;
    background-color: transparent;
  }
`

const StyledSnackbarContent = styled(SnackbarContent)`
  &.SnackbarContent {
    background-color: ${v.colors.cloudy};
    max-width: none;
    padding: 15px 30px;
    width: 100%;
  }
`

// TODO share styles
const SnackbarBackground = styled.div`
  background-color: ${v.colors.cloudy};
  min-height: 36px;
  padding: 15px 30px;
  width: 100%;
`

// This text is different from other typography
const StyledMoveText = styled.span`
  text-transform: uppercase;
  font-family: ${v.fonts.sans};
  font-size: 1rem;
  font-weight: ${v.weights.book};
  letter-spacing: 0.1rem;
  color: white;
`

const IconHolder = styled.span`
  margin-left: 40px;
  margin-top: 8px;
  width: 16px;

  button {
    height: 19px;
    width: 16px;
  }
`

const CloseIconHolder = styled.span`
  margin-left: 60px;
  width: 16px;

  button {
    height: 19px;
    width: 16px;
  }
`

@inject('uiStore', 'apiStore')
@observer
class MoveModal extends React.Component {
  @observable isLoading = false

  handleClose = (ev) => {
    ev.preventDefault()
    const { uiStore } = this.props
    // Notify the user if they're on a different collection
    if (uiStore.viewingCollection &&
        uiStore.movingFromCollectionId !== uiStore.viewingCollection.id) {
      if (uiStore.cardAction === 'move') {
        uiStore.alert(
          'Your items have been returned to their original location',
          'Back'
        )
      }
    }
    uiStore.closeMoveMenu()
  }

  moveCards = async (placement) => {
    const { uiStore, apiStore } = this.props
    const { viewingCollection, cardAction } = uiStore
    // Viewing collection might not be set, such as on the search page
    if (!viewingCollection) {
      uiStore.alert('You can\'t move an item here')
      return
    }
    const collectionId = viewingCollection.id
    const movingFromCollection = apiStore.find('collections', uiStore.movingFromCollectionId)
    if (!viewingCollection.can_edit_content) {
      uiStore.alert('You don\'t have permission to move items to this collection')
      return
    } else if (
      // don't allow moving cards from templates to non-templates
      cardAction === 'move' &&
      movingFromCollection &&
      movingFromCollection.isMasterTemplate &&
      !viewingCollection.isMasterTemplate
    ) {
      uiStore.alert('You can\'t move pinned template items out of a template')
      return
    }
    let data = {
      to_id: collectionId,
      from_id: uiStore.movingFromCollectionId,
      collection_card_ids: uiStore.movingCardIds,
      placement,
    }
    try {
      runInAction(() => { this.isLoading = true })
      let successMessage
      switch (cardAction) {
      case 'move':
        await apiStore.request('collection_cards/move', 'PATCH', data)
        successMessage = 'Items successfully moved!'
        break
      case 'link':
        await apiStore.request('collection_cards/link', 'POST', data)
        successMessage = 'Items successfully linked!'
        break
      case 'duplicate':
        await apiStore.request('collection_cards/duplicate', 'POST', data)
        // have to re-fetch here because the duplicate method wasn't re-rendering
        // see note in collection_cards_controller#duplicate
        await apiStore.request(`collections/${collectionId}`)
        successMessage = 'Items successfully duplicated!'
        break
      case 'useTemplate': {
        data = {
          parent_id: data.to_id,
          template_id: data.from_id,
          placement,
        }
        await apiStore.createTemplateInstance(data)
        successMessage = 'Your template instance has been created!'
        break
      }
      default:
        return
      }
      runInAction(() => { this.isLoading = false })
      uiStore.alertOk(successMessage)
      uiStore.resetSelectionAndBCT()
      uiStore.closeMoveMenu()
      if (placement === 'beginning') {
        uiStore.scroll.scrollToTop()
      } else {
        uiStore.scroll.scrollToBottom()
      }
    } catch (e) {
      runInAction(() => { this.isLoading = false })
      uiStore.alert('You cannot move a collection within itself')
    }
  }

  handleMoveToBeginning = () => {
    this.moveCards('beginning')
  }

  handleMoveToEnd = () => {
    this.moveCards('end')
  }

  get moveMessage() {
    const { uiStore } = this.props
    const { cardAction, templateName } = uiStore
    const amount = uiStore.movingCardIds.length
    let message = ''
    if (cardAction === 'move') {
      message = `${amount} in transit`
    } else if (cardAction === 'useTemplate') {
      message = `${templateName} in transit`
    } else {
      message = `${amount} selected to ${cardAction}`
    }
    return message
  }

  get moveHelper() {
    const { uiStore, apiStore } = this.props
    const { cardAction, templateName } = uiStore
    const helperProps = {
      type: 'move',
    }
    if (cardAction === 'useTemplate') {
      if (!apiStore.currentUser.show_template_helper) {
        return null
      }
      helperProps.recordName = templateName
      helperProps.type = 'template'
    } else if (!apiStore.currentUser.show_move_helper) {
      return null
    }
    return (
      <MoveHelperModal
        currentUser={apiStore.currentUser}
        {...helperProps}
      />
    )
  }

  render() {
    const { uiStore } = this.props

    return (
      <div>
        { uiStore.movingCardIds.length > 0 && (
          <div>
            <StyledSnackbar
              classes={{ root: 'Snackbar', }}
              open
            >
              {this.isLoading ? <SnackbarBackground><InlineLoader /></SnackbarBackground> : (
                <StyledSnackbarContent
                  classes={{ root: 'SnackbarContent', }}
                  message={
                    <StyledMoveText id="message-id">{this.moveMessage}</StyledMoveText>
                  }
                  action={[
                    <IconHolder key="moveup">
                      <Tooltip
                        classes={{ tooltip: 'Tooltip' }}
                        title="Place at top"
                        placement="top"
                      >
                        <button onClick={this.handleMoveToBeginning}>
                          <MoveArrowIcon direction="up" />
                        </button>
                      </Tooltip>
                    </IconHolder>,
                    <IconHolder key="movedown">
                      <Tooltip
                        classes={{ tooltip: 'Tooltip' }}
                        title="Place at bottom"
                        placement="top"
                      >
                        <button onClick={this.handleMoveToEnd}>
                          <MoveArrowIcon direction="down" />
                        </button>
                      </Tooltip>
                    </IconHolder>,
                    <CloseIconHolder key="close">
                      <Tooltip
                        classes={{ tooltip: 'Tooltip' }}
                        title="Cancel"
                        placement="top"
                      >
                        <button onClick={this.handleClose}>
                          <CloseIcon />
                        </button>
                      </Tooltip>
                    </CloseIconHolder>,
                  ]}
                />
              )}
            </StyledSnackbar>
            { this.moveHelper }
          </div>
        )}
      </div>
    )
  }
}

MoveModal.propTypes = {
}
MoveModal.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}
MoveModal.defaultProps = {
}

export default MoveModal
