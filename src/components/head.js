/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
import '../styles/index.scss'

const Head = ({ title }) => {
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    return (
        <Helmet>
            <title>{`${title} | ${data.site.siteMetadata.title}`}</title>
        </Helmet>
    )
}

export default Head