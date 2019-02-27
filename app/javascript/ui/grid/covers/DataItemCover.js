import pluralize from 'pluralize'
import { startCase } from 'lodash'
import { Fragment } from 'react'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { runInAction, observable, computed } from 'mobx'
import moment from 'moment-mini'
import styled from 'styled-components'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryVoronoiContainer,
} from 'victory'

import {
  DisplayText,
  SmallHelperText,
  Heading3,
  HugeNumber,
} from '~/ui/global/styled/typography'
import ChartTooltip from '~/ui/global/ChartTooltip'
import EditableButton from '~/ui/reporting/EditableButton'
import MeasureSelect from '~/ui/reporting/MeasureSelect'
import OrganicGridPng from '~/assets/organic_grid_black.png'
import OrganicGrid from '~/ui/icons/OrganicGrid'
import DataTargetButton from '~/ui/reporting/DataTargetButton'
import DataTargetSelect from '~/ui/reporting/DataTargetSelect'
import v from '~/utils/variables'
import { theme } from '~/ui/test_collections/shared'
import trackError from '~/utils/trackError'

const utcMoment = date => moment(`${date} 00+0000`).utc()
const nearMonth = (momentDate, timeframe) => {
  const mStart = momentDate.clone().startOf('month')
  const mEnd = momentDate.clone().endOf('month')
  const startAllowance = timeframe === 'day' ? 0 : 2
  const endAllowance = timeframe === 'day' ? -1 : 3
  const startDiff = Math.abs(mStart.diff(momentDate, 'days'))
  const endDiff = Math.abs(
    momentDate
      .clone()
      .endOf('month')
      .diff(momentDate, 'days')
  )
  if (startDiff <= startAllowance) {
    return mStart.subtract(1, 'month')
  } else if (endDiff <= endAllowance) {
    return mEnd
  }

  return false
}

const TickLabel = props => {
  let dx
  // We'll need to dynamically set this based on number of data points
  if (props.x === 0) dx = props.dx
  if (props.x === 450) dx = -props.dx
  const updatedStyle = Object.assign({}, props.style, {
    fontSize: props.fontSize,
  })
  return (
    <VictoryLabel {...props} dx={dx} dy={props.dy || 5} style={updatedStyle} />
  )
}

const StyledDataItemCover = styled.div`
  background-color: ${v.colors.commonLight};
  border-top: 2px solid ${v.colors.black};
  height: 100%;
  padding: 15px 0 0;
  text-align: left;

  .editableMetric {
    ${props =>
      props.editable &&
      `
    &:hover {
      background-color: ${v.colors.primaryLight};
    }
    ${props.editing &&
      `
      background-color: ${v.colors.primaryLight};
`};
`};
  }
`
StyledDataItemCover.displayName = 'StyledDataItemCover'

const AboveChartContainer = styled.div`
  position: absolute;
  z-index: ${v.zIndex.aboveVictoryChart};
`

const ChartContainer = styled.div`
  bottom: 0px;
  height: 92%;
  position: absolute;
  width: 100%;
`

const GraphKey = styled.span`
  background: url(${OrganicGridPng});
  background-size: 150%;
  display: inline-block;
  height: 16px;
  margin-right: 10px;
  vertical-align: middle;
  width: 16px;
`

// eslint-disable-next-line react/no-multi-comp
@inject('uiStore', 'apiStore')
@observer
class DataItemCover extends React.Component {
  @observable
  targetCollection = null

  componentDidMount() {
    const { collectionFilter } = this.props.item
    if (collectionFilter && collectionFilter.target) {
      this.loadTargetCollection(collectionFilter.target)
    }
  }

  async loadTargetCollection(target) {
    const { apiStore } = this.props
    try {
      const res = await apiStore.fetch('collections', target)
      runInAction(() => {
        this.targetCollection = res.data
      })
    } catch (e) {
      trackError(e)
    }
  }

  @computed
  get editing() {
    const { card, uiStore } = this.props
    return uiStore.editingCardId === card.id
  }

  toggleEditing() {
    const { card, uiStore } = this.props
    uiStore.toggleEditingCardId(card.id)
  }

  get timeframeControl() {
    const { item } = this.props
    const { timeframe } = item
    const editable = item.can_edit_content
    if (this.editing) {
      return (
        <span className="editableMetric">
          <MeasureSelect
            dataSettingsName="timeframe"
            item={item}
            onSelect={this.onSelectTimeframe}
          />
        </span>
      )
    } else if (editable) {
      return (
        <EditableButton editable={editable} onClick={this.handleEditClick}>
          <span className="editableMetric">{timeframe}</span>
        </EditableButton>
      )
    }
    return <span>{timeframe}</span>
  }

  get measureControl() {
    const { item } = this.props
    const { measure } = item
    const editable = item.can_edit_content
    if (this.editing) {
      return (
        <span className="editableMetric">
          <MeasureSelect
            className="editableMetric metric-measure"
            dataSettingsName="measure"
            item={item}
            onSelect={this.onSelectMeasure}
          />
        </span>
      )
    } else if (editable) {
      return (
        <EditableButton editable={editable} onClick={this.handleEditClick}>
          <span className="editableMetric">{measure.name}</span>
        </EditableButton>
      )
    }
    return <span>{measure.name}</span>
  }

  get targetControl() {
    const { item } = this.props
    const editable = item.can_edit_content

    if (this.editing) {
      return (
        <span className="editableMetric">
          <DataTargetSelect
            item={item}
            targetCollection={this.targetCollection}
            onSelect={this.onSelectTarget}
          />
        </span>
      )
    }
    return (
      <span className="editableMetric">
        <DataTargetButton
          targetCollection={this.targetCollection}
          editable={editable}
          onClick={this.handleEditClick}
        />
      </span>
    )
  }

  get collectionsAndItemsControls() {
    const { item } = this.props
    const { timeframe } = item
    if (timeframe === 'ever') {
      return (
        <span className="titleAndControls">
          within {!item.collectionFilter ? 'the ' : ''}
          {this.targetControl} {this.timeframeControl}
        </span>
      )
    }
    return (
      <Fragment>
        <Heading3>
          {this.measureControl} per {this.timeframeControl}
        </Heading3>
        <SmallHelperText color={v.colors.black}>
          <GraphKey />
          {this.targetControl}
        </SmallHelperText>
      </Fragment>
    )
  }

  get titleAndControls() {
    const { item } = this.props
    const { name, data_settings } = item
    if (item.isReportTypeNetworkAppMetric) {
      return startCase(data_settings.d_measure)
    } else if (item.isReportTypeCollectionsItems) {
      return this.collectionsAndItemsControls
    }
    return name
  }

  onSelectTimeframe = value => {
    this.saveSettings({
      d_timeframe: value,
    })
  }

  onSelectTarget = value => {
    let collectionId = null
    if (value && value.internalType && value.internalType === 'collections') {
      collectionId = value.id
    } else if (value && value.custom) {
      collectionId = value.custom
    }

    this.saveSettings({
      d_filters: value
        ? [{ type: 'Collection', target: Number(collectionId) }]
        : [],
    })
    if (collectionId) {
      this.loadTargetCollection(collectionId)
    } else {
      runInAction(() => {
        this.targetCollection = null
      })
    }
    this.toggleEditing()
  }

  onSelectMeasure = value => {
    // don't allow setting null measure
    if (!value) return
    this.saveSettings({
      d_measure: value,
    })
  }

  get correctGridSize() {
    const { item } = this.props
    const { timeframe } = item
    const size = timeframe === 'ever' ? 1 : 2
    return { width: size, height: size }
  }

  async saveSettings(settings) {
    const { card, item, uiStore } = this.props
    runInAction(() => {
      item.data_settings = Object.assign({}, item.data_settings, settings)
    })
    const res = await item.save()
    // If the timeframe changed we have to resize the card
    if (settings.d_timeframe) {
      const { height, width } = this.correctGridSize
      card.height = height
      card.width = width
      await card.save()
    }
    // TODO: investigate why data isn't being updated with just `save()`
    runInAction(() => {
      item.update(res.data)
      this.toggleEditing()
      uiStore.toggleEditingCardId(card.id)
    })
  }

  handleEditClick = ev => {
    const { card, item, uiStore } = this.props
    if (!item.can_edit_content) return
    uiStore.toggleEditingCardId(card.id)
  }

  get valuesFromDataItem() {
    const { item } = this.props
    if (!item.data || !item.data.values) return []

    const {
      data: { values },
    } = item

    return values
  }

  get formattedValues() {
    const mappedValues = this.valuesFromDataItem.map((value, i) => ({
      ...value,
      month: value.date,
    }))

    // check if need duplicate value, add if required
    if (mappedValues.length === 1) {
      const duplicateValue = Object.assign({}, this.valuesFromDataItem[0])
      duplicateValue.date = utcMoment(duplicateValue.date)
        .subtract('3', 'months')
        .format('YYYY-MM-DD')
      duplicateValue.month = duplicateValue.date
      duplicateValue.isDuplicate = true
      mappedValues.push(duplicateValue)
    }

    return mappedValues
  }

  renderTooltipText = (datum, isLastDataPoint) => {
    const { item } = this.props
    const { timeframe, measureTooltip } = item
    const momentDate = utcMoment(datum.date)
    let timeRange = `${momentDate
      .clone()
      .subtract(1, timeframe)
      .format('MMM D')} - ${momentDate.format('MMM D')}`

    let dayTimeframe = '7 days'
    if (timeframe === 'month') {
      timeRange = `in ${momentDate
        .clone()
        .subtract(1, 'month')
        .format('MMMM')}`
      dayTimeframe = '30 days'
    }
    if (timeframe === 'day') {
      timeRange = `on ${momentDate.format('MMM D')}`
    }
    const text = `${datum.amount} ${pluralize(measureTooltip)}\n
      ${isLastDataPoint ? `in last ${dayTimeframe}` : timeRange}`

    return text
  }

  renderSingleValue() {
    const { item } = this.props
    return (
      <Fragment>
        <Heading3>{this.measureControl}</Heading3>
        <HugeNumber className="count" data-cy="DataReport-count">
          {item.data.value}
        </HugeNumber>
        <SmallHelperText color={v.colors.black}>
          {this.titleAndControls}
        </SmallHelperText>
      </Fragment>
    )
  }

  displayMonthlyXAxisText = (d, i) => {
    const { item } = this.props
    const { timeframe } = item
    const utc = utcMoment(d)
    const near = nearMonth(utc, timeframe)
    if (near) {
      return `${near.format('MMM')}`
    }
    return ''
  }

  formatXAxisDate = (d, i) => `${utcMoment(d).format('MM/DD/YY')}`

  get fillColor() {
    if (this.props.item.data) {
      const { fill } = this.props.item.data
      if (fill) return fill
    }
    return '#000000'
  }

  get chartAreaStyle() {
    const { item } = this.props
    if (item.isReportTypeRecord) {
      return {
        data: { fill: this.fillColor },
        labels: {
          fontSize: 18,
        },
      }
    }
    return {
      data: { fill: 'url(#organicGrid)' },
      labels: {
        fill: 'black',
      },
    }
  }

  get chartAxisStyle() {
    const { item } = this.props
    if (item.isReportTypeRecord) {
      return {
        axis: {
          stroke: v.colors.commonMedium,
          strokeWidth: 30,
          transform: 'translateY(26px)',
        },
        axisLabel: {
          padding: 0,
          fontSize: '18px',
          dy: -5,
        },
      }
    }
    return {
      axis: {
        stroke: v.colors.commonMedium,
        strokeWidth: 25,
        transform: 'translateY(22px)',
      },
    }
  }

  get chartAxis() {
    const values = this.valuesFromDataItem
    const { item } = this.props

    let tickLabelStyle = {}
    if (item.isReportTypeRecord) {
      tickLabelStyle = {
        fontSize: '18px',
        dy: -5,
      }
    } else {
      tickLabelStyle = {
        fontSize: '10px',
        dy: 5,
      }
    }

    return values.length > 1 ? (
      <VictoryAxis
        tickLabelComponent={
          <TickLabel
            fontSize={tickLabelStyle.fontSize}
            dy={tickLabelStyle.dy}
            // this needs to be handled dynamically
            // 20 is fine for 2-3 data points but too crowded for 4
            dx={20 * this.formattedValues.length}
          />
        }
        tickFormat={
          item.isReportTypeRecord
            ? this.formatXAxisDate
            : this.displayMonthlyXAxisText
        }
        offsetY={13}
        style={this.chartAxisStyle}
      />
    ) : (
      <VictoryAxis
        axisLabelComponent={<TickLabel fontSize={tickLabelStyle.fontSize} />}
        style={this.chartAxisStyle}
        tickFormat={t => null}
        offsetY={13}
        label={this.formatXAxisDate(values[0].date)}
      />
    )
  }

  get maxDomain() {
    const { item } = this.props
    const amounts = this.formattedValues.map(el => el.amount)
    const highestValue = Math.max(...amounts)
    return item.isReportTypeRecord ? 100 : highestValue
  }

  renderTimeframeValues() {
    const { card } = this.props

    return (
      <Fragment>
        <AboveChartContainer>
          <DisplayText color={this.fillColor}>
            {this.titleAndControls}
          </DisplayText>
          <br />
          {this.formattedValues.length < 1 && (
            <DisplayText className="noDataMessage">
              <br />
              Not enough data yet
            </DisplayText>
          )}
        </AboveChartContainer>
        {this.formattedValues.length > 0 && (
          <ChartContainer data-cy="ChartContainer">
            <OrganicGrid />
            <VictoryChart
              theme={theme}
              domainPadding={{ y: 80 }}
              padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
              containerComponent={<VictoryVoronoiContainer />}
            >
              <VictoryArea
                labels={d => d.amount}
                labelComponent={
                  <ChartTooltip
                    textRenderer={this.renderTooltipText}
                    cardArea={card.width * card.height}
                  />
                }
                style={this.chartAreaStyle}
                data={this.formattedValues}
                // This makes the chart shape based on the values
                domain={{ x: [1, this.formattedValues.length], y: [0, this.maxDomain] }}
                y="amount"
                x="month"
              />
              {this.chartAxis}
            </VictoryChart>
          </ChartContainer>
        )}
      </Fragment>
    )
  }

  render() {
    const { item, uiStore } = this.props

    if (uiStore.isNewCard(item.id)) {
      uiStore.removeNewCard(item.id)
      this.toggleEditing()
    }
    return (
      <StyledDataItemCover
        className="cancelGridClick"
        editable={item.can_edit_content}
        editing={this.editing}
        data-cy="DataItemCover"
      >
        {item.isReportTypeCollectionsItems && item.timeframe === 'ever'
          ? this.renderSingleValue()
          : this.renderTimeframeValues()}
      </StyledDataItemCover>
    )
  }
}

DataItemCover.propTypes = {
  item: MobxPropTypes.objectOrObservableObject.isRequired,
  card: MobxPropTypes.objectOrObservableObject.isRequired,
}

DataItemCover.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default DataItemCover
