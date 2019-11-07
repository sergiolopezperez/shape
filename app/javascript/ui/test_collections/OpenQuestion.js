import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled, { css } from 'styled-components'

import ArrowIcon from '~/ui/icons/ArrowIcon'
import QuestionContentEditor from '~/ui/test_collections/QuestionContentEditor'
import {
  TextResponseHolder,
  TextInput,
  TextEnterButton,
} from '~/ui/test_collections/shared'

const QuestionSpacing = css`
  border-bottom-color: ${props =>
    props.editing ? props.theme.borderColorEditing : props.theme.borderColor};
  border-bottom-style: solid;
  border-bottom-width: 4px;
`

export const QuestionSpacingContainer = styled.div`
  ${QuestionSpacing};
`

@observer
class OpenQuestion extends React.Component {
  constructor(props) {
    super(props)
    const { questionAnswer } = props
    this.save = _.debounce(this._save, 1000)
    this.state = {
      response: questionAnswer ? questionAnswer.answer_text : '',
      focused: false,
    }
  }

  _save = () => {
    const { item } = this.props
    item.save()
  }

  handleResponse = ev => {
    this.setState({
      response: ev.target.value,
    })
  }

  handleSubmit = ev => {
    const { editing, onAnswer } = this.props
    ev.preventDefault()
    if (editing) return
    onAnswer({ text: this.state.response })
  }

  renderQuestion() {
    const { editing, item, canEdit } = this.props

    return (
      <QuestionSpacingContainer editing={editing}>
        <QuestionContentEditor
          item={item}
          maxLength={100}
          placeholder="please enter question here"
          canEdit={canEdit}
          optional
        />
      </QuestionSpacingContainer>
    )
  }

  render() {
    const { editing } = this.props
    return (
      <div style={{ width: '100%' }}>
        {this.renderQuestion()}
        <form onSubmit={this.handleSubmit}>
          <TextResponseHolder>
            <TextInput
              onFocus={() => this.setState({ focused: true })}
              onChange={this.handleResponse}
              onBlur={() => this.setState({ focused: false })}
              value={this.state.response}
              type="questionText"
              placeholder="please enter your response"
              disabled={editing}
              data-cy="OpenQuestionTextInput"
            />
            <TextEnterButton
              focused={this.state.focused}
              data-cy="OpenQuestionTextButton"
            >
              <ArrowIcon />
            </TextEnterButton>
          </TextResponseHolder>
        </form>
      </div>
    )
  }
}

OpenQuestion.propTypes = {
  item: MobxPropTypes.objectOrObservableObject.isRequired,
  questionAnswer: MobxPropTypes.objectOrObservableObject,
  editing: PropTypes.bool,
  onAnswer: PropTypes.func,
  canEdit: PropTypes.bool,
}
OpenQuestion.defaultProps = {
  questionAnswer: null,
  editing: false,
  onAnswer: () => null,
  canEdit: false,
}

export default OpenQuestion
