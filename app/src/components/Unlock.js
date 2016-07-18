import React from 'react';

const style = {
  root: {
    background: 'linear-gradient(to top, #16222A, #3A6073)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '80px'
  },
  password: {
    border: 0,
    fontSize: '24px',
    marginTop: 60,
    padding: 10
  }
};

class Unlock extends React.Component {
  componentDidMount() {
    this._input.focus();
  }

  warnUnlockFailed() {
    this._circle.classList.add('unlock-error');
    this._circle.addEventListener('animationend', () => {
      this._circle.classList.remove('unlock-error')
    });
  }

  render() {
    return (
      <div style={{...this.props.style, ...style.root}}>
        <div style={style.circle} ref={(node) => this._circle = node}>
          <i className="fa fa-lock" style={style.icon}/>
        </div>
        <input
          style={style.password}
          type='password'
          placeholder='Master Password'
          ref={(node) => this._input = node}
          onKeyUp={(e) =>
            e.keyCode === 13 && this.props.onSubmit && this.props.onSubmit(e.target.value)
          }
        />
      </div>
    );
  }
}

export default Unlock;