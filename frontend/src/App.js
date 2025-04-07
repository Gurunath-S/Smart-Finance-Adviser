import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './App.css';

const Homelog = () => {
  const [isSignUpMode, setSignUpMode] = useState(false);

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <Login />
          <Signup />
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis, ex ratione. Aliquid!</p>
            <button className="btn transparent" onClick={() => setSignUpMode(true)}>
              Sign up
            </button>
          </div>
          <img src="/img/log.svg" className="image" alt="Sign In Illustration" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum laboriosam ad deleniti.</p>
            <button className="btn transparent" onClick={() => setSignUpMode(false)}>
              Sign in
            </button>
          </div>
          <img src="/img/register.svg" className="image" alt="Sign Up Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Homelog;
