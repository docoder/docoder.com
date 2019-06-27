/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from "react"
import { Link, graphql, useStaticQuery, navigate } from 'gatsby'
import Header from '../components/header'
import Footer from '../components/footer'
import Head from '../components/head'
import styles from './index.module.scss'

export default () => {
    const data = useStaticQuery(graphql`
        query {
            allMarkdownRemark ( sort: { fields: frontmatter___date, order: DESC } )  {
                edges {
                    node {
                        frontmatter {
                            title
                            date
                        }
                        fields {
                            slug
                        }
                    }
                }
            }
        }
    `)
    const [items, setItems] = React.useState(data.allMarkdownRemark.edges)
    return (
        <div className={styles.container}>
            <Head title="Home" />
            <div className={styles.content}>
                <Header handleKeys={['alphanumeric', 'backspace', 'enter', '.', '/']} onInput={(key) => {
                    if (key.endsWith('>>') && items.length > 0) {
                        const item = items[0]
                        navigate(`/${item.node.fields.slug}`)
                    }else {
                       const newItems = data.allMarkdownRemark.edges.filter(item => ~item.node.frontmatter.title.toLowerCase().indexOf(key.toLowerCase()))
                       setItems(newItems)
                    }
                }}/>
                {items.length > 0 && <ol className={styles.itemContainer}>
                    {items.map((edge, index) => {
                        return (
                            <li className={styles.item} key={edge.node.frontmatter.title}>
                                <Link className={index === 0 ? styles.itemHighlight : styles.itemNormal}  to={`/${edge.node.fields.slug}`}>
                                    <h2>{edge.node.frontmatter.title}</h2>
                                    <p>{edge.node.frontmatter.date}</p>
                                </Link>
                            </li>
                        )
                    })}
                </ol>}
                {items.length <= 0 && <div className={styles.blank}>JUST DO IT coder</div>}
            </div>
            <Footer />
        </div>
    )
}
