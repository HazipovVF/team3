'use strict';

import React, { Component } from 'react';

import Button from '../common-components/Button';

import './LoginPage.css';

export default class LoginPage extends Component {
    render() {
        const logIn = {
            link: '/login',
            text: 'Войти через GitHub',
            class: 'log-in__github-link',
            size: {
                width: '150px',
                height: '50px'
            }
        };

        return (
            <React.Fragment>
                <head>
                    <title>K1logram</title>
                </head>
                <main className="log-in">
                    <img className="log-in__logo" src="static/logoKilogram.svg" alt="Логотип" />
                    <Button btnParams={logIn} />
                    <p className="log-in__creators creators_first">DarkwingDuck</p>
                    <p className="log-in__creators creators_second">spt30</p>
                    <p className="log-in__creators creators_third">ArtyMgn</p>
                    <p className="log-in__creators creators_fourth">qpaul</p>
                    <p className="log-in__creators creators_fifth">Griboedoff</p>
                    <p className="log-in__creators creators_sixth">LazzyM1nd</p>
                </main>
            </React.Fragment>
        );
    }
}
