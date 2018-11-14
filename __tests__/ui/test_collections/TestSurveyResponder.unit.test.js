import TestSurveyResponder from '~/ui/test_collections/TestSurveyResponder'
import {
  fakeCollection,
  fakeQuestionItemCard,
  fakeQuestionItem,
  fakeSurveyResponse,
  fakeQuestionAnswer,
} from '#/mocks/data'

jest.mock('../../../app/javascript/stores/jsonApi/SurveyResponse')

let wrapper, props
const cardTypes = [
  'question_media',
  'question_context',
  'question_useful',
  'question_different',
  'question_clarity',
  'question_excitement',
  'question_open',
  'question_finish',
]

describe('TestSurveyResponder', () => {
  beforeEach(() => {
    // setup the appropriate card type
    props = {
      collection: fakeCollection,
      createSurveyResponse: jest.fn(),
    }
    // very basic way to turn fakeCollection into a "test collection"
    props.collection.question_cards = []
    cardTypes.forEach((type, i) => {
      props.collection.question_cards.push({
        ...fakeQuestionItemCard,
        card_question_type: type,
        record: {
          ...fakeQuestionItem,
          id: `${i}`,
        },
      })
    })
    wrapper = shallow(<TestSurveyResponder {...props} />)
  })

  it('renders TestQuestions for each visible card', () => {
    // Should render media and context question
    expect(wrapper.find('TestQuestion').length).toEqual(2)
  })

  describe('after creating SurveyResponse', () => {
    beforeEach(() => {
      props = {
        collection: fakeCollection,
        createSurveyResponse: jest.fn(),
        surveyResponse: fakeSurveyResponse,
      }
      // Mock for answering the first context question
      props.surveyResponse.question_answers = [
        Object.assign({}, fakeQuestionAnswer, {
          question_id: props.collection.collection_cards[1].record.id,
        }),
      ]
      wrapper = shallow(<TestSurveyResponder {...props} />)
    })

    it('renders additional question', () => {
      expect(wrapper.find('TestQuestion').length).toEqual(3)
    })
  })
})