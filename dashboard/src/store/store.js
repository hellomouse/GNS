import { createStore } from 'redux';

import { apiGetRepos } from './api';

const defaultState = {
  repos: [],
  gotRepos: false,
  repoSettings: {}
};

const store = createStore((state, action) => {
  if (action.type === 'setRepos') {
    return { ...state, repos: action.repos, gotRepos: true };
  }

  return state;
}, defaultState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

/** Gets repository list
 * @param {Object} passedStore
 */
export const storeGetRepos = passedStore => {
  let st = passedStore.getState();

  if (st.gotRepos) {
    return;
  }
  let repos = apiGetRepos();

  passedStore.dispatch({
    type: 'setRepos',
    repos: repos
  });
};

export default store;
