import Grid from '@material-ui/core/Grid'
import moment from 'moment-mini'
import styled from 'styled-components'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Flex } from 'reflexbox'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'

import AdminNewQueryModal from './AdminNewQueryModal'
import Box from '~shared/components/atoms/Box'
import HorizontalDivider from '~shared/components/atoms/HorizontalDivider'
import LeftButtonIcon from '~/ui/icons/LeftButtonIcon'
import LinkIcon from '~/ui/icons/LinkIcon'
import SearchIcon from '~/ui/icons/SearchIcon'
import Section from '~shared/components/molecules/Section'
import v from '~/utils/variables'
import { CircledIcon } from '~/ui/global/styled/buttons'
import { Heading1, Heading2, Heading3 } from '~/ui/global/styled/typography'
import { showOnHoverCss } from '~/ui/grid/shared'
import Tooltip from '~/ui/global/Tooltip'
import { TextField } from '~/ui/global/styled/forms'
import * as colors from '~shared/styles/constants/colors'

const Wrapper = styled.div`
  font-family: ${v.fonts.sans};
  min-width: 1316px; // allow horizontal scrolling for grid layout
`

const SubHeading = styled.div`
  color: ${v.colors.commonDark};
  font-size: 0.75rem;
  line-height: 1rem;
`

const SubHeadingRight = styled(SubHeading)`
  text-align: right;
`

const FeedbackRow = styled(Grid)`
  padding: 1rem 0;
`
FeedbackRow.displayName = 'FeedbackRow'

const LaunchState = styled.span`
  color: ${colors.confirmation};
`

const AudienceRowItem = styled(Grid)`
  padding-bottom: 0.5rem;
`
AudienceRowItem.displayName = 'AudienceRowItem'

const NewQueryRowItem = styled(AudienceRowItem)`
  background-color: ${v.colors.commonLight};
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
`
NewQueryRowItem.displayName = 'NewQueryRowItem'

const AudienceWrapper = styled(Flex)`
  ${showOnHoverCss};
  position: relative;
  top: -0.5rem;
  /*
    adjust upward, so audience name is plum with the rest of the row's
    contents. the AudienceAction buttons had the effect of pushing the
    audience name down.
  */
`

const AudienceAction = styled.div`
  margin-left: 8px;
`

const PaginationWrapper = styled.div`
  background-color: ${v.colors.commonDark};
  border-radius: 1px;
  color: ${v.colors.white};
  height: 60px;
  letter-spacing: 1.6px;
  line-height: 60px;
  margin: 0 1rem;
  width: 60px;
  text-align: center;
`
PaginationWrapper.displayName = 'PaginationWrapper'

const PaginationButton = styled.button`
  color: ${v.colors.commonDark};
  height: 35px;
  width: 35px;

  &:disabled {
    color: ${v.colors.commonLight};
  }
`
PaginationButton.displayName = 'PaginationButton'

const NextPageButton = styled(PaginationButton)`
  svg {
    transform: scale(-1, 1);
  }
`
NextPageButton.displayName = 'NextPageButton'

@inject('apiStore', 'uiStore')
@observer
class AdminFeedback extends React.Component {
  state = {
    testCollections: [],
    currentPage: 1,
    totalPages: 1,
    newQueryAudience: null,
    newQueryModalOpen: false,
    newQueryResponseCount: null,
  }

  componentDidMount() {
    this.loadTestCollections(this.state.currentPage)
  }

  async loadTestCollections(page) {
    const testCollections = await this.props.apiStore.fetchTestCollections(page)
    this.setState({
      testCollections: testCollections.data,
      currentPage: page,
      totalPages: testCollections.totalPages,
    })
  }

  loadPreviousPage() {
    this.loadTestCollections(this.state.currentPage - 1)
  }

  loadNextPage() {
    this.loadTestCollections(this.state.currentPage + 1)
  }

  handleKeyDown(ev) {
    const enter = 13
    const escape = 27

    if (ev.keyCode === enter) {
      // un-focus & submit
      ev.target.blur()
    } else if (ev.keyCode === escape) {
      // cancel
      ev.target.value = ''
      ev.target.blur()
    }
  }

  handleBlur(ev) {
    if (parseInt(ev.target.value)) {
      this.setState({
        newQueryModalOpen: true,
        newQueryResponseCount: parseInt(ev.target.value),
      })
    } else {
      this.setState({ newQueryAudience: null })
    }
  }

  handleStartNewQuery(testAudience) {
    if (this.state.newQueryAudience === testAudience) {
      // button can toggle visibility
      this.setState({ newQueryAudience: null })
    } else {
      this.setState({ newQueryAudience: testAudience })
    }
  }

  closeNewQueryModal() {
    this.setState({ newQueryModalOpen: false })
  }

  renderTestCollections() {
    return this.state.testCollections.map(testCollection => (
      <React.Fragment key={testCollection.id}>
        <FeedbackRow container>
          <Grid item xs={2}>
            {testCollection.name}
          </Grid>
          <Grid item xs={1}>
            <LaunchState>Launched</LaunchState>
          </Grid>
          <Grid item xs={2}>
            {testCollection.test_launched_at
              ? moment(testCollection.test_launched_at).format('L LT')
              : null}
          </Grid>
          <Grid item xs={2}>
            {testCollection.test_launched_at
              ? moment(testCollection.test_launched_at).fromNow(true)
              : null}
          </Grid>
          <Grid container item xs={5}>
            {testCollection.test_audiences.map(testAudience => {
              const editingQuery =
                this.state.newQueryAudience &&
                testAudience.id === this.state.newQueryAudience.id

              const audienceNameStyle = editingQuery
                ? { borderBottom: `1px solid ${v.colors.black}` }
                : undefined

              return (
                <React.Fragment key={testAudience.id}>
                  <AudienceRowItem item xs={5}>
                    <AudienceWrapper align="center">
                      <div style={audienceNameStyle}>
                        {testAudience.audience.name}
                      </div>
                      <Flex className="show-on-hover">
                        <AudienceAction>
                          <Tooltip
                            classes={{ tooltip: 'Tooltip' }}
                            title={'start new query'}
                            placement="top"
                          >
                            <CircledIcon
                              onClick={() =>
                                this.handleStartNewQuery(testAudience)
                              }
                            >
                              <SearchIcon />
                            </CircledIcon>
                          </Tooltip>
                        </AudienceAction>
                        <AudienceAction>
                          <Tooltip
                            classes={{ tooltip: 'Tooltip' }}
                            title={'copy survey link'}
                            placement="top"
                          >
                            <CopyToClipboard
                              text={`${testCollection.publicTestURL}?ta=${
                                testAudience.id
                              }`}
                              onCopy={() =>
                                this.props.uiStore.popupSnackbar({
                                  message: 'Survey link copied',
                                })
                              }
                            >
                              <CircledIcon>
                                <LinkIcon />
                              </CircledIcon>
                            </CopyToClipboard>
                          </Tooltip>
                        </AudienceAction>
                      </Flex>
                    </AudienceWrapper>
                  </AudienceRowItem>
                  <AudienceRowItem item xs={2}>
                    <Flex justify="flex-end">{testAudience.sample_size}</Flex>
                  </AudienceRowItem>
                  <AudienceRowItem item xs={3}>
                    <Flex justify="flex-end">0</Flex>
                  </AudienceRowItem>
                  <AudienceRowItem item xs={2}>
                    <Flex justify="flex-end">
                      {testAudience.num_survey_responses}
                    </Flex>
                  </AudienceRowItem>
                  {editingQuery && this.renderNewQuery()}
                </React.Fragment>
              )
            })}
          </Grid>
        </FeedbackRow>
        <Grid container>
          <Grid item xs={12}>
            <HorizontalDivider />
          </Grid>
        </Grid>
      </React.Fragment>
    ))
  }

  // refactor to separate component
  renderNewQuery() {
    return (
      <Grid container item xs={12} style={{ marginBottom: '1rem' }}>
        <NewQueryRowItem item xs={5} />
        <NewQueryRowItem item xs={2}>
          <Flex justify="flex-end">
            <TextField
              type="text"
              onKeyDown={ev => this.handleKeyDown(ev)}
              onBlur={ev => this.handleBlur(ev)}
              style={{
                textAlign: 'right',
                width: '35px',
                backgroundColor: v.colors.commonLight,
              }}
            />
          </Flex>
        </NewQueryRowItem>
        <NewQueryRowItem item xs={3}>
          <Flex justify="flex-end">-</Flex>
        </NewQueryRowItem>
        <NewQueryRowItem item xs={2}>
          <Flex justify="flex-end">0</Flex>
        </NewQueryRowItem>
      </Grid>
    )
  }

  render() {
    const {
      currentPage,
      totalPages,
      newQueryAudience,
      newQueryModalOpen,
      newQueryResponseCount,
    } = this.state
    const previousPageDisabled = currentPage === 1
    const nextPageDisabled = currentPage === totalPages

    return (
      <Wrapper>
        <Heading1>Feedback</Heading1>
        <Section>
          <Box mb={40}>
            <Heading2>All Shape Feedback</Heading2>
          </Box>
          <Grid container>
            <Grid container>
              <Grid item xs={2}>
                <Heading3>Test Name</Heading3>
              </Grid>
              <Grid item xs={1}>
                <Heading3>State</Heading3>
              </Grid>
              <Grid item xs={2}>
                <Heading3>Time Initiated</Heading3>
              </Grid>
              <Grid item xs={2}>
                <Heading3>Time Elapsed</Heading3>
              </Grid>
              <Grid item xs={5}>
                <Flex column>
                  <Heading3>Audience(s)</Heading3>
                  <Grid container>
                    <Grid item xs={5}>
                      <SubHeading>Audience Name</SubHeading>
                    </Grid>
                    <Grid item xs={2}>
                      <SubHeadingRight>n Requested</SubHeadingRight>
                    </Grid>
                    <Grid item xs={3}>
                      <SubHeadingRight>Sourced from INA</SubHeadingRight>
                    </Grid>
                    <Grid item xs={2}>
                      <SubHeadingRight>Completed</SubHeadingRight>
                    </Grid>
                  </Grid>
                </Flex>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <HorizontalDivider />
              </Grid>
            </Grid>
            {this.renderTestCollections()}
          </Grid>
          {totalPages > 1 && (
            <Grid container>
              <Grid item xs={12}>
                <Flex align="center" justify="center" mt={3}>
                  <PaginationButton
                    disabled={previousPageDisabled}
                    onClick={() => this.loadPreviousPage()}
                  >
                    <LeftButtonIcon disabled={previousPageDisabled} />
                  </PaginationButton>
                  <PaginationWrapper>
                    {currentPage}/{totalPages}
                  </PaginationWrapper>
                  <NextPageButton
                    disabled={nextPageDisabled}
                    onClick={() => this.loadNextPage()}
                  >
                    <LeftButtonIcon disabled={nextPageDisabled} />
                  </NextPageButton>
                </Flex>
              </Grid>
            </Grid>
          )}
        </Section>
        {newQueryModalOpen && (
          <AdminNewQueryModal
            open={newQueryModalOpen}
            close={() => this.closeNewQueryModal()}
            testAudience={newQueryAudience}
            requestedResponseCount={newQueryResponseCount}
          />
        )}
      </Wrapper>
    )
  }
}

AdminFeedback.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default AdminFeedback
