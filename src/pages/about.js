/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from 'react'
import { graphql, useStaticQuery, navigate } from 'gatsby'
import Header from '../components/header'
import Head from '../components/head'
import styles from './about.module.scss'

const About = () => {
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    author
                    email
                }
            }
        }
    `)
    return (
        <div >
            <Head title="About"/>
            <Header handleKeys={['backspace']} onInput={() => {
                navigate('/')
            }}/>
            <div className={styles.container}>
                <div><span className={styles.author}>AUTHOR</span><span className={styles.authorInfo}>{data.site.siteMetadata.author}</span></div>
                <div><span className={styles.email}>EMAIL</span><span className={styles.emailInfo}>{data.site.siteMetadata.email}</span></div>
            </div>
        </div>
    )
}

export default About