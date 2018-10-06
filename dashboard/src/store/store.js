import { createStore } from 'redux';

import { apiGetRepos, apiGetRepoSettings } from './api';

const defaultState = {
  repos: [],
  gotRepos: false,
  repoSettings: {}
};

const store = createStore((state, action) => {
  if (action.type === 'setRepos') {
    return { ...state, repos: action.repos, gotRepos: true };
  } else if (action.type === 'setRepoSettings') {
    return { ...state, repoSettings: { ...state.repoSettings, [action.repo]: action.settings } };
  }

  return state;
}, defaultState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

/** Gets repository list
 * @param {store} passedStore
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

/** Gets settings for the given repository
 * @param {Object} passedStore
 * @param {String} repo
 */
export const storeGetRepoSettings = async (passedStore, repo) => {
  let st = passedStore.getState();

  if (st.repoSettings[repo]) {
    return;
  }
  let rs = await apiGetRepoSettings(repo);

  passedStore.dispatch({
    type: 'setRepoSettings',
    repo: repo,
    settings: rs
  });
};

export default store;
