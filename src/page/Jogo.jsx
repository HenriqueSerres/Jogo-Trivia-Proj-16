import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import md5 from 'crypto-js/md5';
import { fetchAPItest, fetchAsks } from '../service/fetchAPI';
import { newTokenRedux, userInfos } from '../redux/actions';
import Header from '../components/Header';

const HARD = 3;
const MEDIUM = 2;
const EASY = 1;

class Jogo extends React.Component {
  constructor() {
    super();
    this.state = {
      results: [],
      correta: '',
      incorreta: '',
      timer: 30,
      isDisabled: false,
      questions: 0,
    };
  }

  componentDidMount() {
    this.validateToken();
    this.timer();
    const { name, gravatarEmail } = this.props;
    const hash = md5(gravatarEmail).toString();
    const dadosGravatar = [
      { name, score: 0, picture: `https://www.gravatar.com/avatar/${hash}` },
    ];
    localStorage.setItem('ranking', JSON.stringify(dadosGravatar));
  }

  timer = () => {
    const ONE_SECOND = 1000;
    setInterval(() => {
      const { timer } = this.state;
      if (timer > 0) {
        this.setState((prev) => ({ timer: prev.timer - 1 }));
      } else {
        this.setState({ isDisabled: timer === 0 });
      }
    }, ONE_SECOND);
  };

  validateToken = async () => {
    const token = await fetchAPItest();
    const results = await fetchAsks(token.token);
    const three = 3;
    if (results.response_code === three) {
      const newToken = localStorage.getItem('token');
      const newResults = await fetchAsks(newToken);
      return this.setState({
        results: newResults.results,
      });
    }
    this.setState({
      results: results.results,
    });
  };

  difficultLevel = () => {
    const { results } = this.state;
    const selectLevel = results[0].difficulty;
    if (selectLevel === 'hard') return HARD;
    if (selectLevel === 'medium') return MEDIUM;
    if (selectLevel === 'easy') return EASY;
  };

  upDateScore = ({ target }) => {
    this.setState({
      incorreta: 'red',
      correta: 'green',
    });

    const DEZ = 10;
    const { timer } = this.state;
    const selectAnswer = target.getAttribute('data-testid').includes('correct');
    if (selectAnswer) {
      const newScore = DEZ + timer * this.difficultLevel();
      const get = JSON.parse(localStorage.getItem('ranking'));
      get[0].score += newScore;
      localStorage.setItem('ranking', JSON.stringify(get));
      const { dispatchScore, assertions } = this.props;
      dispatchScore(null, assertions + 1, get[0].score, null);
    }
  };

  nextButton = () => {
    const { history } = this.props;
    const LAST_QUESTION = 4;
    const { questions } = this.state;
    this.setState((prevState) => ({
      questions: prevState.questions + 1,
      timer: 30,
    }));
    if (questions === LAST_QUESTION) history.push('/feedback');
  };

  // https://www.horadecodar.com.br/2021/05/10/como-embaralhar-um-array-em-javascript-shuffle/
  asksRandom = (resultsCorrect, incorrectResults) => {
    const answer = [...incorrectResults, resultsCorrect];

    for (let i = answer.length - 1; i > 0; i -= 1) {
      // Escolhendo elemento aleatório
      const j = Math.floor(Math.random() * (i + 1));
      // Reposicionando elemento
      [answer[i], answer[j]] = [answer[j], answer[i]];
    }
    // Retornando array com aleatoriedade
    return answer;
  };

  onclick = () => {
    const { history } = this.props;
    history.push('/');
  };

  goRanking = () => {
    const { history } = this.props;
    history.push('/ranking');
  }

  verificaCorreta(correctAnswer, answer, incorrectAnswers) {
    if (correctAnswer === answer) {
      return 'correct-answer';
    }
    const index = incorrectAnswers.findIndex((incAnswe) => incAnswe === answer);
    return `wrong-answer-${index}`;
  }

  render() {
    const { results, correta, incorreta, timer, isDisabled, questions } = this.state;
    const resultsLength = results.length !== 0;
    return (
      <>
        <Header />
        <h2>{timer}</h2>
        <main>
          {resultsLength && (
            <div key={ Math.random() }>
              <h4 data-testid="question-category">{results[questions].category}</h4>
              <h3 key={ results[questions].question } data-testid="question-text">
                {results[questions].question}
              </h3>
              <div>
                {this.asksRandom(
                  results[questions].correct_answer,
                  results[questions].incorrect_answers,
                ).map((answer, index) => (
                  <section key={ index } data-testid="answer-options">
                    <button
                      name={ results[questions].difficulty }
                      onClick={ this.upDateScore }
                      className={
                        answer === results[questions].correct_answer
                          ? `${correta}`
                          : `${incorreta}`
                      }
                      disabled={ isDisabled }
                      type="button"
                      data-testid={ this.verificaCorreta(
                        results[questions].correct_answer,
                        answer,
                        results[questions].incorrect_answers,
                      ) }
                    >
                      {answer}
                    </button>
                  </section>
                ))}
              </div>
            </div>
          )}
        </main>
        <div>
          {incorreta !== '' && correta !== '' ? (
            <button
              type="button"
              onClick={ this.nextButton }
              data-testid="btn-next"
            >
              Next
            </button>
          ) : null}
        </div>
        <div>
          <button
            type="button"
            onClick={ this.onclick }
            data-testid="btn-play-again"
          >
            Play Again
          </button>
          <div>
            <button
              type="button"
              onClick={ this.goRanking }
              data-testid="btn-ranking"
            >
              Ranking
            </button>
          </div>
        </div>
      </>
    );
  }
}

Jogo.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }),
}.isRequired;

const mapStateToProps = (state) => {
  const {
    token,
    player: { name, gravatarEmail, assertions },
  } = state;
  return {
    tokenRandom: token,
    name,
    gravatarEmail,
    assertions,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchToken: () => dispatch(newTokenRedux()),
  dispatchScore: (name, assertions, score, gravatarEmail) => dispatch(userInfos(
    name, assertions,
    score, gravatarEmail,
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(Jogo);
