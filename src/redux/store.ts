import { createStore, combineReducers, Store } from 'redux'
import { connect } from 'react-redux'
import ReduxModule from './modules/ReduxModule'

function createDisActions(actions, dispatch) {
  const dispatchActions = {}
  for(const actionKey in actions) {
    if (actions.hasOwnProperty(actionKey)) {
      const action = actions[actionKey];
      dispatchActions[actionKey] = (...args) => dispatch(action(...args))
    }
  }
  return dispatchActions
}

class StoreConnector {
  public store : Store
  private actions

  constructor(modules : ReduxModule[]) {
    this.store = createStore(combineReducers(
      modules.reduce((root, module) => ({[module.name]: module.reducer, ...root}), {})
    ))
    
      this.actions = modules.reduce((actionPaths, module) => ({
      [module.name]: createDisActions(module.actions, this.store.dispatch)
    }), {})
  }

  connect(modules : string[], component) {
    
    
    const mapStateToProps = state => {

      const moduleStates = modules.map(moduleName => ({
        content: state[moduleName],
        name: moduleName
      }))
     
      return moduleStates.reduce((props, state) => ({
        ...props, 
        [state.name]: {
          state: state.content,
          actions: this.actions[state.name]
        }
      }), {})
    }

    return connect(mapStateToProps)(component)
  }

}

const store = new StoreConnector([])

export default store