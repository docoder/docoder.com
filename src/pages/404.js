/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from 'react'
import { navigate } from 'gatsby'
import Header from '../components/header'
import Head from '../components/head'
import styles from './404.module.scss'

const NotFound = () => {
    return (
        <div>
            <Head title="404"/>
            <Header handleKeys={['backspace']} onInput={() => {
                navigate('/')
            }}/>
            <div className={styles.container}>
                <div><span className={styles.status}>404</span><span className={styles.info}>Page not found</span></div>
            </div>
        </div>
    )
}

export default NotFound