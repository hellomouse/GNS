/* eslint-disable @typescript-eslint/no-non-null-assertion */
// @ts-check
import Redux, { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

import { apiGetRepos, apiGetRepoSettings } from './api';
import { Config } from '../config';

// tslint:disable:max-line-length
/** @typedef {import('redux').Store<{repos:Array<string>;gotRepos;boolean;repoSettings:import('../config').Config}>} PassedStore */
export type PassedStore = Redux.Store<{repos: string[]; gotRepos: boolean; repoSettings: Config['repos']}>;
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

// eslint-disable-next-line max-len
const store: Redux.Store<DefaultState> = createStore<DefaultState, any, any, any>((state: any, action: Redux.AnyAction) => {
  if (action.type === 'setRepos') {
    return { ...state, repos: action.repos, gotRepos: true };
  } else if (action.type === 'setRepoSettings') {
    // eslint-disable-next-line max-len
    return { ...state, repoSettings: { ...state.repoSettings, [action.repo!]: action.settings }, gotRepoSettings: true };
  }

  return state;
}, defaultState, devToolsEnhancer({}));

/** Gets repository list
 * @param {passedStore} passedStore
 */
export const storeGetRepos = async (passedStore: PassedStore) => {
  const st = passedStore.getState();

  if (st.gotRepos) {
    return;
  }
  const repos = await apiGetRepos('wolfy1339'); // Todo: Replace this with a variable that changes when the user logs in

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
  const st = passedStore.getState();

  if (st.repoSettings[repo]) {
    return;
  }
  const rs = await apiGetRepoSettings(repo);

  passedStore.dispatch({
    type: 'setRepoSettings',
    repo,
    settings: rs
  });
};

export default store;
