import _ from 'lodash'
import { Fragment } from 'react'
import pluralize from 'pluralize'
import ReactRouterPropTypes from 'react-router-prop-types'
import { action, observable } from 'mobx'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'

import ClickWrapper from '~/ui/layout/ClickWrapper'
import ChannelManager from '~/utils/ChannelManager'
import CollectionGrid from '~/ui/grid/CollectionGrid'
import FloatingActionButton from '~/ui/global/FloatingActionButton'
import Loader from '~/ui/layout/Loader'
import MoveModal from '~/ui/grid/MoveModal'
import PageContainer from '~/ui/layout/PageContainer'
import PageError from '~/ui/global/PageError'
import PageHeader from '~/ui/pages/shared/PageHeader'
import PageSeparator from '~/ui/global/PageSeparator'
import PageWithApi from '~/ui/pages/PageWithApi'
import PlusIcon from '~/ui/icons/PlusIcon'
import SubmissionBoxSettingsModal from '~/ui/submission_box/SubmissionBoxSettingsModal'
import EditorPill from '~/ui/items/EditorPill'
import TestDesigner from '~/ui/test_collections/TestDesigner'
import v from '~/utils/variables'
import Collection from '~/stores/jsonApi/Collection'

// more global way to do this?
pluralize.addPluralRule(/canvas$/i, 'canvases')

const isHomepage = ({ params }) => params.org && !params.id

@inject('apiStore', 'uiStore', 'routingStore')
@observer
class CollectionPage extends PageWithApi {
  @observable
  loadingSubmissions = false
  @observable
  currentEditor = {}

  editorTimeout = null
  channelName = 'CollectionViewingChannel'

  constructor(props) {
    super(props)
    this.reloadData = _.debounce(this._reloadData, 1500)
  }

  componentWillMount() {
    this.subscribeToChannel(this.props.match.params.id)
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps)
    // when navigating between collections, close BCT
    const previousId = this.props.match.params.id
    const currentId = nextProps.match.params.id
    if (currentId !== previousId) {
      ChannelManager.unsubscribeAllFromChannel(this.channelName)
      this.subscribeToChannel(currentId)
      this.props.uiStore.closeBlankContentTool()
      this.setLoadedSubmissions(false)
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    ChannelManager.unsubscribeAllFromChannel(this.channelName)
  }

  subscribeToChannel(id) {
    ChannelManager.subscribe(this.channelName, id, {
      channelReceivedData: this.receivedChannelData,
    })
  }

  @action
  setEditor = editor => {
    this.currentEditor = editor
    if (this.editorTimeout) clearTimeout(this.editorTimeout)
    // this.unmounted comes from PageWithApi
    if (this.unmounted || _.isEmpty(editor)) return
    this.editorTimeout = setTimeout(() => this.setEditor({}), 4000)
  }

  handleAllClick = ev => {
    const { uiStore } = this.props
    ev.preventDefault()
    uiStore.closeCardMenu()
  }

  receivedChannelData = async data => {
    const { apiStore } = this.props
    const { collection } = this
    // catch if receivedData happens after reload
    if (!collection) return
    const currentId = collection.id
    const submissions = collection.submissions_collection
    const submissionsId = submissions ? submissions.id : ''
    if (_.compact([currentId, submissionsId]).indexOf(data.record_id) > -1) {
      this.setEditor(data.current_editor)
      if (
        !_.isEmpty(data.current_editor) &&
        data.current_editor.id === apiStore.currentUserId
      ) {
        // don't reload your own updates
        return
      }
      this.reloadData()
    }
  }

  async _reloadData() {
    const { apiStore } = this.props
    await apiStore.fetch('collections', this.collection.id, true)
    if (this.collection.submissions_collection) {
      this.setLoadedSubmissions(false)
      await apiStore.fetch(
        'collections',
        this.collection.submissions_collection.id,
        true
      )
      this.setLoadedSubmissions(true)
    }
  }

  @action
  setLoadedSubmissions = val => {
    const { uiStore } = this.props
    if (!this.collection) return
    const { submissions_collection } = this.collection
    if (submissions_collection && submissions_collection.cardIds.length) {
      // if submissions_collection is preloaded with some cards, no need to show loader
      uiStore.update('loadedSubmissions', true)
      return
    }
    uiStore.update('loadedSubmissions', val)
  }

  get isHomepage() {
    return isHomepage(this.props.match)
  }

  get collection() {
    const { match, apiStore } = this.props
    if (this.isHomepage) {
      return apiStore.find(
        'collections',
        apiStore.currentUser.current_user_collection_id
      )
    }
    return apiStore.find('collections', match.params.id)
  }

  get roles() {
    const { apiStore, match } = this.props
    return apiStore
      .findAll('roles')
      .filter(
        role => role.resource && role.resource.id === parseInt(match.params.id)
      )
  }

  requestPath = props => {
    const { match, apiStore } = props
    if (isHomepage(match)) {
      return `collections/${apiStore.currentUser.current_user_collection_id}`
    }
    return `collections/${match.params.id}`
  }

  onAPILoad = async response => {
    this.updateError(null)
    const collection = response.data
    const { apiStore, uiStore, routingStore, location } = this.props
    // setViewingCollection has to happen first bc we use it in openBlankContentTool
    uiStore.setViewingCollection(collection)
    if (collection.isSubmissionsCollection) {
      // NOTE: SubmissionsCollections are not meant to be viewable, so we route
      // back to the SubmissionBox instead
      routingStore.routeTo('collections', collection.submission_box_id)
      return
    }
    if (!collection.collection_cards.length) {
      uiStore.openBlankContentTool()
    }
    collection.checkCurrentOrg()
    if (collection.isNormalCollection) {
      const thread = await apiStore.findOrBuildCommentThread(collection)
      uiStore.expandThread(thread.key)
      if (location.search) {
        uiStore.openOptionalMenus(location.search)
      }
      if (collection.isSubmissionBox && collection.submissions_collection) {
        this.setLoadedSubmissions(false)
        // NOTE: if other collections get sortable features we may move this logic
        uiStore.update('collectionCardSortOrder', 'updated_at')
        await Collection.fetchSubmissionsCollection(
          collection.submissions_collection.id,
          { order: 'updated_at' }
        )
        this.setLoadedSubmissions(true)
        // Also subscribe to updates for the submission boxes
        this.subscribeToChannel(collection.submissions_collection.id)
      }
    } else {
      apiStore.clearUnpersistedThreads()
    }
    if (collection.processing_status) {
      const message = `${collection.processing_status}...`
      uiStore.popupSnackbar({ message })
    }
  }

  onAddSubmission = ev => {
    ev.preventDefault()
    const { id } = this.collection.submissions_collection
    const submissionSettings = {
      type: this.collection.submission_box_type,
      template: this.collection.submission_template,
    }
    Collection.createSubmission(id, submissionSettings)
  }

  updateCollection = ({ card, updates, undoMessage } = {}) => {
    const { collection } = this
    // this will assign the update attrs to the card and push an undo action
    collection.API_updateCards({ card, updates, undoMessage })
    const { uiStore } = this.props
    uiStore.trackEvent('update', this.collection)
  }

  get submissionsPageSeparator() {
    const { collection } = this
    const { submissionTypeName, submissions_collection } = collection
    if (!submissions_collection) return ''
    return (
      <PageSeparator
        title={
          <h3>
            {submissions_collection.collection_cards.length}{' '}
            {submissions_collection.collection_cards.length === 1
              ? submissionTypeName
              : pluralize(submissionTypeName)}
          </h3>
        }
      />
    )
  }

  get renderEditorPill() {
    const { currentEditor } = this
    const { currentUserId } = this.props.apiStore
    let hidden = ''
    if (_.isEmpty(currentEditor) || currentEditor.id === currentUserId)
      hidden = 'hidden'
    return (
      <EditorPill className={`editor-pill ${hidden}`} editor={currentEditor} />
    )
  }

  renderSubmissionsCollection() {
    const { collection } = this
    const { uiStore } = this.props
    const { blankContentToolState, gridSettings, loadedSubmissions } = uiStore
    const { submissionTypeName, submissions_collection } = collection

    return (
      <div>
        {!loadedSubmissions ? (
          <Loader />
        ) : (
          <div>
            {this.submissionsPageSeparator}
            <CollectionGrid
              {...gridSettings}
              updateCollection={this.updateCollection}
              collection={submissions_collection}
              canEditCollection={false}
              // Pass in cardProperties so grid will re-render when they change
              cardProperties={submissions_collection.cardProperties}
              // Pass in BCT state so grid will re-render when open/closed
              blankContentToolState={blankContentToolState}
              submissionSettings={{
                type: collection.submission_box_type,
                template: collection.submission_template,
              }}
              movingCardIds={[]}
              movingCards={false}
              sorting
            />
          </div>
        )}
        <FloatingActionButton
          toolTip={`Add ${submissionTypeName}`}
          onClick={this.onAddSubmission}
          icon={<PlusIcon />}
        />
      </div>
    )
  }

  renderTestDesigner() {
    return <TestDesigner collection={this.collection} />
  }

  loader = () => (
    <div style={{ marginTop: v.headerHeight }}>
      <Loader />
    </div>
  )

  render() {
    // this.error comes from PageWithApi
    if (this.error) return <PageError error={this.error} />
    const { collection } = this
    // NOTE: if we have first loaded the slimmer SerializableSimpleCollection via the CommentThread
    // then some fields like `can_edit` will be undefined.
    // So we check if the full Collection has loaded via the `can_edit` attr
    // Also, checking meta.snapshot seems to load more consistently than just collection.can_edit
    if (!collection || collection.meta.snapshot.can_edit === undefined) {
      return this.loader()
    }

    const { uiStore } = this.props
    const {
      blankContentToolState,
      submissionBoxSettingsOpen,
      gridSettings,
      isLoading,
    } = uiStore

    // submissions_collection will only exist for submission boxes
    const { isSubmissionBox, requiresTestDesigner } = collection
    const { movingCardIds, cardAction } = uiStore
    // only tell the Grid to hide "movingCards" if we're moving and not linking
    const uiMovingCardIds = cardAction === 'move' ? movingCardIds : []

    return (
      <Fragment>
        <PageHeader record={collection} isHomepage={this.isHomepage} />
        {!isLoading && (
          <PageContainer>
            {this.renderEditorPill}
            {requiresTestDesigner && this.renderTestDesigner()}
            {!requiresTestDesigner && (
              <CollectionGrid
                // pull in cols, gridW, gridH, gutter
                {...gridSettings}
                gridSettings={gridSettings}
                updateCollection={this.updateCollection}
                collection={collection}
                canEditCollection={collection.can_edit_content}
                // Pass in cardProperties so grid will re-render when they change
                cardProperties={collection.cardProperties}
                // Pass in BCT state so grid will re-render when open/closed
                blankContentToolState={blankContentToolState}
                movingCardIds={uiMovingCardIds}
                // passing length prop seems to properly trigger a re-render
                movingCards={uiStore.movingCardIds.length}
                // don't add the extra row for submission box
                addEmptyCard={!isSubmissionBox}
              />
            )}
            {(collection.requiresSubmissionBoxSettings ||
              submissionBoxSettingsOpen) && (
              <SubmissionBoxSettingsModal collection={collection} />
            )}
            <MoveModal />
            {isSubmissionBox &&
              collection.submission_box_type &&
              this.renderSubmissionsCollection()}
            {(uiStore.dragging || uiStore.cardMenuOpenAndPositioned) && (
              <ClickWrapper
                clickHandlers={[this.handleAllClick]}
                onContextMenu={this.handleAllClick}
              />
            )}
          </PageContainer>
        )}
        {isLoading && this.loader()}
      </Fragment>
    )
  }
}

CollectionPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
}
CollectionPage.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  routingStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default CollectionPage
