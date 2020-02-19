/* eslint-disable @typescript-eslint/no-non-null-assertion */
// @ts-check
import Redux, { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

import { apiGetRepos, apiGetRepoSettings, RepoSettings } from './api';
import { Config } from '../config';

// tslint:disable:max-line-length
/** @typedef {import('redux').Store<{repos:Array<string>;gotRepos;boolean;repoSettings:import('../config').Config}>} PassedStore */
export type PassedStore = Redux.Store<DefaultState, Action>;
export interface DefaultState {
  repos: string[];
  gotRepos: boolean;
  repoSettings: Config['repos'];
  gotRepoSettings: boolean;
}
const defaultState: DefaultState = {
  repos: [],
  gotRepos: false,
  repoSettings: {},
  gotRepoSettings: false
};


interface Action extends Redux.Action<'setRepos' | 'setRepoSettings' | undefined> {
  repo?: string;
  repos?: string[];
  settings?: RepoSettings;
}

/**
 *
 * @param {DefaultState|undefined} state
 * @param {Action} action
 * @return {DefaultState}
 */
function reducer(state: DefaultState | undefined, action: Action) {
  if (action.type === 'setRepos') {
    return { ...state!, repos: action.repos!, gotRepos: true };
  } else if (action.type === 'setRepoSettings') {
    // eslint-disable-next-line max-len
    return { ...state!, repoSettings: { ...state!.repoSettings, [action.repo!]: action.settings! }, gotRepoSettings: true };
  }

  return state!;
}
// eslint-disable-next-line max-len
const store: Redux.Store<DefaultState, Action> = createStore(reducer, defaultState, devToolsEnhancer({}));

/** Gets repository list
 * @param {passedStore} passedStore
 * @param {string} [user="wolfy1339"]
 */
export const storeGetRepos = async (passedStore: PassedStore, user = 'wolfy1339') => {
  const st = passedStore.getState();

  if (st.gotRepos) {
    return;
  }
  const repos = await apiGetRepos(user); // Todo: Replace this with a variable that changes when the user logs in

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
