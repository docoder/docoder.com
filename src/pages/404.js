/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from 'react'
import Head from '../components/head'
import styles from './404.module.scss'

const NotFound = () => {
    return (
        <div className={styles.container}>
            <Head title="404"/>
            <div><span className={styles.status}>404</span><span className={styles.info}>Page not found</span></div>
        </div>
    )
}

export default NotFound