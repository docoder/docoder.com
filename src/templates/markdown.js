/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from 'react'
import { graphql, navigate } from 'gatsby'
import { StickyContainer, Sticky } from 'react-sticky';
import styles from './markdown.module.scss'
import Head from '../components/head'
import Header from '../components/header'
import Footer from '../components/footer'

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date
      }
      html
      tableOfContents
    }
  }
`

const Markdown = (props) => {
    return (
        <div className={styles.container}>
            <Head title={props.data.markdownRemark.frontmatter.title} />
            <div className={styles.content}>
                <Header handleKeys={['backspace']} onInput={() => {
                    navigate('/')
                }}/>
                <div className={styles.header}>
                    <h2>{props.data.markdownRemark.frontmatter.title}</h2>
                    <p>{props.data.markdownRemark.frontmatter.date}</p>
                </div>
                <StickyContainer className={styles.markdownContainer}>
                    <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: props.data.markdownRemark.html }}></div>
                        <div className={styles.tocContainer}>
                            <Sticky>{({ style }) => (
                                <div style={style} className={styles.toc} dangerouslySetInnerHTML={{ __html: props.data.markdownRemark.tableOfContents }}></div>
                            )}</Sticky>
                        </div>
                </StickyContainer>
            </div>
            <Footer />
        </div>
    )
}

export default Markdown
