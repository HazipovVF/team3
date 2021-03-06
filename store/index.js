'use strict';

import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import chats from './chats';
import activeChat from './activeChat';
import user from './user';
import modal from './modal';

const reducer = combineReducers({
    chats,
    activeChat,
    user,
    modal
});

export default function makeStore(initialState) {
    return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunk)));
}
