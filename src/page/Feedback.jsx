import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from '../components/Header';

class Feedback extends Component {
  goRanking = () => {
    const { history } = this.props;
    history.push('/ranking');
  }

  onclick = () => {
    const { history } = this.props;
    history.push('/');
  };

  feedBackMessagem() {
    const { aksAssertions } = this.props;
    const THREE = 3;
    if (aksAssertions < THREE) {
      return (<span data-testid="feedback-text">Could be better...</span>);
    }
    return (<span data-testid="feedback-text">Well Done!</span>);
  }

  render() {
    return (
      <div>
        <Header />
        <h1 data-testid="feedback-text">Parabéns !!!</h1>
        <div>{this.feedBackMessagem()}</div>
        <button
          type="button"
          onClick={ this.onclick }
          data-testid="btn-play-again"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={ this.goRanking }
          data-testid="btn-ranking"
        >
          Ranking
        </button>

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { player: { assertions } } = state;
  return {
    aksAssertions: assertions,
  };
};

export default connect(mapStateToProps)(Feedback);

Feedback.propTypes = {
  aksAssertions: PropTypes.number.isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }),
}.isRequired;

// Istvan e Yang
