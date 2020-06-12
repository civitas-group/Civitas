import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { CookiesProvider } from 'react-cookie';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const initialState = {
  count: 42,
  logged_in: false
};
function reducer(state = initialState, action) {
  switch(action.type){
    case "LOGIN":
      return {
        logged_in: true
      };
    case "LOGOUT":
      return {
        logged_in: false
      };
    default:
      return state;
  }
  
}
const store = createStore(reducer);

const AppPackage = () => (
  <CookiesProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </CookiesProvider>
);

ReactDOM.render(
  <AppPackage />,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
