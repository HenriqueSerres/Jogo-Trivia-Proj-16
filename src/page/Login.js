import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { loginName, loginEmail } from '../redux/actions';
import tokenRedux from '../redux/reducers/token';

const URL = 'https://opentdb.com/api_token.php?command=request';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      nome: '',
      email: '',
      disabled: true,
      token: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.validateButton = this.validateButton.bind(this);
  }

  fetchAPI = async () => {
    const fetchURL = await fetch(URL);
    const response = await fetchURL.json();
    const { token } = response;
    this.setState({ token });
  }

  validateButton() {
    const { nome, email } = this.state;
    if (nome && email) this.setState({ disabled: false });
  }

  handleChange({ target: { value, name } }) {
    this.setState({ [name]: value }, this.validateButton);
  }

  handleClick() {
    const { history, setTokenDispatch } = this.props;
    const { token } = this.state;
    setTokenDispatch(token);
    history.push('/jogo');
  }

  render() {
    const { nome, email, disabled } = this.state;
    return (
      <form>
        <label htmlFor="nome">
          <input
            type="text"
            name="nome"
            value={ nome }
            id="nome"
            onChange={ this.handleChange }
            data-testid="input-player-name"
          />
          Nome
        </label>
        <label htmlFor="email">
          <input
            type="text"
            name="email"
            value={ email }
            id="email"
            onChange={ this.handleChange }
            data-testid="input-gravatar-email"
          />
          Email
        </label>
        <button
          type="button"
          data-testid="btn-play"
          onClick={ this.handleClick }
          disabled={ disabled }
        >
          Play
        </button>
      </form>
    );
  }
}

Login.propTypes = {
  history: PropTypes.string,
  setTokenDispatch: PropTypes.func,
}.isRequired;

const mapDispatchToProps = (dispatch) => ({
  loginNameDispatch: (nome) => dispatch(loginName(nome)),
  loginEmailDispatch: (email) => dispatch(loginEmail(email)),
  setTokenDispatch: (token) => dispatch(tokenRedux(token)),
});
export default connect(null, mapDispatchToProps)(Login);
