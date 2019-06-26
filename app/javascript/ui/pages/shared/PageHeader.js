import { Fragment } from 'react'
import { observable, action } from 'mobx'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { Flex } from 'reflexbox'
import styled from 'styled-components'
import CopyToClipboard from 'react-copy-to-clipboard'

import EditableName from '~/ui/pages/shared/EditableName'
import RolesModal from '~/ui/roles/RolesModal'
import FilledProfileIcon from '~/ui/icons/FilledProfileIcon'
import ProfileIcon from '~/ui/icons/ProfileIcon'
import HiddenIconButton from '~/ui/icons/HiddenIconButton'
import TemplateIcon from '~/ui/icons/TemplateIcon'
import SystemIcon from '~/ui/icons/SystemIcon'
import LinkIconSm from '~/ui/icons/LinkIconSm'
import TrashIconXl from '~/ui/icons/TrashIconXl'
import TestCollectionIcon from '~/ui/icons/TestCollectionIcon'
import SubmissionBoxIconLg from '~/ui/icons/SubmissionBoxIconLg'
import TagEditorModal from '~/ui/pages/shared/TagEditorModal'
import { StyledHeader, MaxWidthContainer } from '~/ui/global/styled/layout'
import { SubduedHeading1 } from '~/ui/global/styled/typography'
import { StyledTitleAndRoles } from '~/ui/pages/shared/styled'
import { FormButton } from '~/ui/global/styled/forms'
import FoamcoreBoardIcon from '~/ui/icons/FoamcoreBoardIcon'
import v from '~/utils/variables'
import routeToLogin from '~/utils/routeToLogin'
/* global IdeoSSO */

const IconHolder = styled.span`
  color: ${v.colors.commonDark};
  display: block;
  height: 32px;
  ${props =>
    props.align === 'left'
      ? 'margin-right: 12px;'
      : 'margin-left: 6px;'} margin-top: 12px;
  overflow: hidden;
  width: 32px;

  @media only screen and (max-width: ${v.responsive.smallBreakpoint}px) {
    height: 36px;
    margin-top: 8px;
    width: 20px;
  }
`

const HeaderFormButton = FormButton.extend`
  margin-top: 10px;
  font-size: 0.825rem;
`
HeaderFormButton.displayName = 'HeaderFormButton'
HeaderFormButton.defaultProps = {
  'data-cy': 'HeaderFormButton',
  color: v.colors.black,
}

const LiveTestIndicator = styled.span`
  display: inline-block;
  color: ${v.colors.alert};
  font-weight: 500;
  font-size: 1rem;
  font-family: ${v.fonts.sans};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 0.25rem;
  padding-top: 1.33rem;
`

@inject('uiStore')
@observer
class PageHeader extends React.Component {
  @observable
  iconAndTagsWidth = 0

  get canEdit() {
    const { record } = this.props
    return record.can_edit_content && !record.system_required
  }

  @action
  updateIconAndTagsWidth(ref) {
    const { record } = this.props
    if (!ref) return
    let width = ref.offsetWidth
    // account for header button (NOTE: what about others e.g. launch test?)
    if (record.isUsableTemplate) width += 165
    // account for profile/master icon at front
    if (record.isProfileTemplate || record.isMasterTemplate) width += 40
    this.iconAndTagsWidth = width
  }

  updateRecordName = name => {
    const { record } = this.props
    // method exists on Item and Collection
    record.API_updateName(name)
  }

  handleTitleClick = () => {
    const { record } = this.props
    if (record.isCurrentUserProfile) {
      window.open(IdeoSSO.profileUrl, '_blank')
    }
  }

  handleRestore = ev => {
    ev.preventDefault()
    const { record } = this.props
    record.restore()
  }

  openMoveMenuForTemplate = () => {
    const { record, uiStore } = this.props
    uiStore.openMoveMenu({
      from: record.id,
      cardAction: 'useTemplate',
    })
  }

  get collectionIcon() {
    const { record } = this.props
    if (record.isProfileTemplate) {
      return (
        <IconHolder align="left">
          <FilledProfileIcon />
        </IconHolder>
      )
    } else if (record.isMasterTemplate) {
      return (
        <IconHolder align="left">
          <TemplateIcon circled filled />
        </IconHolder>
      )
    }
    return null
  }

  get hiddenIcon() {
    const { record } = this.props
    if (!record.can_view) return null
    if (record.is_private || this.isCurrentlyHiddenSubmission) {
      return (
        <HiddenIconButton
          clickable
          size="lg"
          record={record}
          IconWrapper={({ children }) => (
            <IconHolder align="right">{children}</IconHolder>
          )}
        />
      )
    }
    return null
  }

  get trashIcon() {
    const { record } = this.props
    if (!record.archived) return null
    return (
      <IconHolder align="left">
        <TrashIconXl />
      </IconHolder>
    )
  }

  get collectionTypeOrInheritedTags() {
    const { record, uiStore } = this.props
    // not enough room to show in the header of a live Test
    if (record.isLiveTest) return null
    if (uiStore.windowWidth < v.responsive.medBreakpoint) return null
    if (record.inherited_tag_list && record.inherited_tag_list.length) {
      let tagList = record.inherited_tag_list.map(tag => `#${tag}`).join(',')
      if (tagList.length > 22) {
        tagList = (
          <span>
            {tagList.slice(0, 19)}
            <span style={{ fontSize: '1rem' }}>…</span>
          </span>
        )
      }
      return <SubduedHeading1>{tagList}</SubduedHeading1>
    }
    return null
  }

  get collectionTypeIcon() {
    const { record } = this.props
    let icon = ''
    if (record.isUserProfile) {
      icon = <ProfileIcon />
    } else if (record.isProfileCollection) {
      icon = <SystemIcon />
    } else if (record.isTemplated) {
      icon = <TemplateIcon circled />
    } else if (record.isSubmissionBox) {
      icon = <SubmissionBoxIconLg />
    } else if (record.launchableTestId) {
      icon = <TestCollectionIcon />
    } else if (record.isBoard) {
      icon = <FoamcoreBoardIcon large />
    }
    if (icon) {
      return <IconHolder align="right">{icon}</IconHolder>
    }
    return null
  }

  get isCurrentlyHiddenSubmission() {
    const { record } = this.props
    return record.isHiddenSubmission
  }

  get renderTestUi() {
    const { record, uiStore } = this.props
    if (
      (record.isLiveTest && record.has_link_sharing) ||
      record.collection_to_test_id
    ) {
      return (
        <Fragment>
          <CopyToClipboard text={record.publicTestURL} onCopy={() => null}>
            <HeaderFormButton
              width="140"
              color={v.colors.transparent}
              onClick={() =>
                uiStore.popupSnackbar({
                  message: 'Test link copied',
                })
              }
            >
              <span
                style={{
                  display: 'inline-block',
                  height: 24,
                  width: 27,
                  verticalAlign: 'middle',
                }}
              >
                <LinkIconSm />
              </span>
              <span
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
              >
                Get Link
              </span>
            </HeaderFormButton>
          </CopyToClipboard>
          {this.renderStopFeebackButton}
        </Fragment>
      )
    }
  }

  get renderLaunchTestButton() {
    const { record, uiStore } = this.props
    if (record.can_edit_content && record.isClosedTest) {
      return (
        <HeaderFormButton
          onClick={record.reopenTest}
          color={v.colors.transparent}
          width="200"
          disabled={uiStore.launchButtonLoading}
        >
          Re-open Feedback
        </HeaderFormButton>
      )
    }
    if (this.isCurrentlyHiddenSubmission) {
      return (
        <HeaderFormButton
          color={v.colors.alert}
          onClick={record.API_submitSubmission}
          disabled={uiStore.launchButtonLoading}
        >
          Submit
        </HeaderFormButton>
      )
    }
    return null
  }

  get renderJoinCollectionButton() {
    const { record } = this.props
    if (!record.isPublicJoinable) return null
    return (
      <HeaderFormButton
        style={{ marginLeft: '1rem' }}
        color={v.colors.primaryDarkest}
        onClick={() => routeToLogin({ redirect: record.frontend_url })}
      >
        Join
      </HeaderFormButton>
    )
  }

  get renderRestoreButton() {
    const { record } = this.props
    if (!record.can_edit) return null
    if (!record.is_restorable) return null
    return (
      <HeaderFormButton
        style={{ marginLeft: '1rem' }}
        color={v.colors.primaryDarkest}
        onClick={this.handleRestore}
      >
        Restore
      </HeaderFormButton>
    )
  }

  get renderTemplateButton() {
    const { record } = this.props
    if (!record.isUsableTemplate) return null
    return (
      <HeaderFormButton
        width="160"
        color={v.colors.primaryDark}
        onClick={this.openMoveMenuForTemplate}
      >
        Use Template
      </HeaderFormButton>
    )
  }

  get renderStopFeebackButton() {
    const { record, uiStore } = this.props
    if (record.can_edit_content && !record.is_test_locked) {
      return (
        <HeaderFormButton
          width="170"
          color={v.colors.transparent}
          onClick={record.closeTest}
          disabled={uiStore.launchButtonLoading}
        >
          Stop Feedback
        </HeaderFormButton>
      )
    }
    return null
  }

  render() {
    const { record, uiStore } = this.props
    const tagEditorOpen =
      record.parent_collection_card &&
      uiStore.tagsModalOpenId === record.parent_collection_card.id

    const rolesRecord = uiStore.rolesMenuOpen ? uiStore.rolesMenuOpen : record

    return (
      <StyledHeader pageHeader data-empty-space-click>
        <MaxWidthContainer>
          <RolesModal record={rolesRecord} open={!!uiStore.rolesMenuOpen} />
          <div>
            <StyledTitleAndRoles
              data-empty-space-click
              className={record.isCurrentUserProfile ? 'user-profile' : ''}
              justify="space-between"
            >
              <Flex
                wrap
                align="center"
                className="title"
                onClick={this.handleTitleClick}
              >
                {this.trashIcon}
                {this.collectionIcon}
                <EditableName
                  name={record.name}
                  updateNameHandler={this.updateRecordName}
                  canEdit={this.canEdit}
                  extraWidth={this.iconAndTagsWidth}
                />
                {/* Can't use <Flex> if we want to attach refs... */}
                <div
                  style={{ display: 'flex' }}
                  ref={ref => {
                    this.updateIconAndTagsWidth(ref)
                  }}
                >
                  {this.collectionTypeIcon}
                  {this.hiddenIcon}
                  {record.isLiveTest && (
                    <LiveTestIndicator>Live</LiveTestIndicator>
                  )}
                  {this.collectionTypeOrInheritedTags}
                </div>
                {this.renderTemplateButton}
                {this.renderRestoreButton}
                {this.renderLaunchTestButton}
                {this.renderJoinCollectionButton}
                {this.renderTestUi}
              </Flex>
            </StyledTitleAndRoles>
          </div>
        </MaxWidthContainer>
        <TagEditorModal
          canEdit={this.canEdit}
          record={record}
          open={tagEditorOpen}
        />
      </StyledHeader>
    )
  }
}

PageHeader.propTypes = {
  record: MobxPropTypes.objectOrObservableObject.isRequired,
}

PageHeader.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default PageHeader
