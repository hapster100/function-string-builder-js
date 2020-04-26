import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './views/App/App'

ReactDOM.render(
  <Provider store={store.store}>
    <App /> 
  </Provider>, document.getElementById('root'))