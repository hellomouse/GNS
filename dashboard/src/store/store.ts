// @ts-check
import Redux, { createStore } from 'redux';

import { apiGetRepos, apiGetRepoSettings } from './api';
import { Config } from '../config';

// tslint:disable-next-line:max-line-length
/** @typedef {import('redux').Store<{repos:Array<string>,gotRepos:boolean,repoSettings:import('../config').Config}>} passedStore */
// tslint:disable-next-line:max-line-length
export type PassedStore = Redux.Store<{repos: Array<string>, gotRepos: boolean, repoSettings: Config['repos']}>;
interface DefaultState {
  repos: string[];
  gotRepos: boolean;
  repoSettings: any;
  gotRepoSettings: boolean;
}
const defaultState: DefaultState = {
  repos: [],
  gotRepos: false,
  repoSettings: {},
  gotRepoSettings: false
};

const store = createStore<DefaultState, any, any, any>((state: any, action: Redux.AnyAction) => {
  if (action.type === 'setRepos') {
    return { ...state, repos: action.repos, gotRepos: true };
  } else if (action.type === 'setRepoSettings') {
    // tslint:disable-next-line:max-line-length
    return { ...state, repoSettings: { ...state!.repoSettings, [action.repo!]: action.settings }, gotRepoSettings: true };
  }

  return state;
}, defaultState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

/** Gets repository list
 * @param {passedStore} passedStore
 */
export const storeGetRepos = async (passedStore: PassedStore) => {
  let st = passedStore.getState();

  if (st.gotRepos) {
    return;
  }
  let repos = await apiGetRepos('wolfy1339'); // Todo: Replace this with a variable that changes when the user logs in

  passedStore.dispatch({
    type: 'setRepos',
    repos
  });
};

/** Gets settings for the given repository
 * @param {passedStore} passedStore
 * @param {String} repo
 */
export const storeGetRepoSettings = async (passedStore: PassedStore, repo: string) => {
  let st = passedStore.getState();

  if (st.repoSettings[repo]) {
    return;
  }
  let rs = await apiGetRepoSettings(repo);

  passedStore.dispatch({
    type: 'setRepoSettings',
    repo,
    settings: rs
  });
};

export default store;
