// @ts-check
import { createStore } from 'redux';

import { apiGetRepos, apiGetRepoSettings } from './api';

/** @typedef {import('redux').Store<{repos:Array<string>,gotRepos:boolean,repoSettings:import('../config').Config}>} passedStore */

const defaultState = {
  repos: [],
  gotRepos: false,
  repoSettings: {},
  gotRepoSettings: false
};

/** @type {passedStore} */
const store = createStore((state, action) => {
  if (action.type === 'setRepos') {
    return { ...state, repos: action.repos, gotRepos: true };
  } else if (action.type === 'setRepoSettings') {
    return { ...state, repoSettings: { ...state.repoSettings, [action.repo]: action.settings }, gotRepoSettings: true };
  }

  return state;
}, defaultState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

/** Gets repository list
 * @param {passedStore} passedStore
 */
export const storeGetRepos = async passedStore => {
  let st = passedStore.getState();

  if (st.gotRepos) {
    return;
  }
  let repos = await apiGetRepos('wolfy1339'); // Todo: Replace this with a variable that changes when the user logs in

  passedStore.dispatch({
    type: 'setRepos',
    repos: repos
  });
};

/** Gets settings for the given repository
 * @param {passedStore} passedStore
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
