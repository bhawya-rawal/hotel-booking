import React from 'react';
import ReactDOM from 'react-dom';
import './bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import axios from 'axios';

if (process.env.REACT_APP_API_URL) {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);