import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { CookiesProvider } from 'react-cookie';
import './css/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

function listReplace(list, index, value) {
  list[index] = value
  return list;
}

const initialState = {
  logged_in: false,
  user_info: {
  },
  loading: true,
  group_users_map: {},
  group_users_loading: true
};
function reducer(state = initialState, action) {
  switch(action.type){
    case "LOGIN":
      return {
        ...state,
        logged_in: true,
        loading: false
      };
    case "LOGOUT":
      return {
        user_info: {},
        logged_in: false,
        loading: false
      };
    case "HOMEPAGE_ACCESS":
      return {
        ...state,
        user_info: action.payload,
        logged_in: true,
        loading: false
      }
    case "GROUP_ACCESS":
      return {
        ...state,
        user_info: action.payload,
        logged_in: true,
        loading: false
      }
    case "GROUP_USERS_MAP_ADD":
      return {
        ...state,
        group_users_map: action.payload,
        group_users_loading: false
      }
    case "NOTIFICATIONS_MARK_RELOAD":
      return {
        ...state,
        user_info: {
          ...state.user_info,
          notifications: listReplace(state.user_info.notifications, 
            action.index, action.value),
          unread_notifications_count: 
          state.user_info.unread_notifications_count + action.increment
        }
      }
    case "INFO_RELOAD":
      return {
        ...state,
        user_info: action.payload
      }
    case "LOADING":
      return {
        ...state,
        loading: true,
        group_users_loading: true
      };
    case "STOP_LOADING":
      return {
        ...state,
        loading: false
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
