import PropTypes from 'prop-types'
import { VictoryArea, VictoryLabel } from 'victory'

import TickLabelWithTooltip from '~/ui/global/charts/TickLabelWithTooltip'
import {
  darkenColor,
  datasetPropType,
  dateTooltipText,
  tierTooltipLabel,
  advancedTooltipText,
  domainProps,
  formatValuesForVictory,
  themeLabelStyles,
} from '~/ui/global/charts/ChartUtils'

const chartStyle = (style, order) => {
  if (style.fill) {
    const darkFill = darkenColor(style.fill, order)
    const opacity = 0.8
    return {
      data: { fill: darkFill, opacity },
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

const AreaChart = ({
  dataset,
  order,
  colorOrder,
  simpleDateTooltip,
  domain,
  cardArea = 1,
}) => {
  const { measure, timeframe, dataWithDates, tiers } = dataset
  // Add dates to data if there are none
  const values = formatValuesForVictory({
    values: dataWithDates || [],
    addStartDate: dataWithDates[0].date ? null : domain.x[0],
    addEndDate: dataWithDates[0].date ? null : domain.x[1],
  })
  let tooltipFn
  let tooltipLabelComponent = <VictoryLabel />
  if (dataset.tiers.length > 0) {
    const baseStyle = Object.assign({}, themeLabelStyles, {
      fill: 'white',
      fontSize: 16,
      textTransform: 'none',
    })
    const style = [
      Object.assign({}, baseStyle, {
        fontSize: 26,
        fontWeight: 'bold',
      }),
    ]
    // Have to assign the base style for each subsequent line as Victory will
    // otherwise think that the first style is the default style
    Array(5)
      .fill()
      .forEach((_, i) => style.push(baseStyle))

    tooltipLabelComponent = (
      <VictoryLabel style={style} lineHeight={1.3} dy={10} />
    )
  }

  if (dataset.tiers.length > 0) {
    tooltipFn = datum => tierTooltipLabel({ tiers, dataset, datum })
  } else if (simpleDateTooltip) {
    tooltipFn = datum => dateTooltipText(datum, dataset.name)
  } else {
    tooltipFn = (datum, isLastDataPoint) =>
      advancedTooltipText({
        datum,
        isLastDataPoint,
        timeframe,
        measure,
      })
  }
  return (
    <VictoryArea
      style={chartStyle(dataset.style || {}, colorOrder)}
      labels={d => d.value}
      labelComponent={
        <TickLabelWithTooltip
          tooltipTextRenderer={tooltipFn}
          labelTextRenderer={datum => `${datum.value}`}
          cardArea={cardArea}
          fontSize={cardArea === 1 ? 18 : 9}
          tooltipLabelComponent={tooltipLabelComponent}
          neverShowLabels
        />
      }
      domain={domain}
      data={values}
      y="value"
      x="date"
      key={`dataset-${order}`}
    />
  )
}

AreaChart.propTypes = {
  dataset: datasetPropType.isRequired,
  order: PropTypes.number.isRequired,
  colorOrder: PropTypes.number.isRequired,
  simpleDateTooltip: PropTypes.bool,
  cardArea: PropTypes.number,
  domain: domainProps.isRequired,
}

AreaChart.defaultProps = {
  cardArea: 1,
  simpleDateTooltip: false,
}

export default AreaChart
