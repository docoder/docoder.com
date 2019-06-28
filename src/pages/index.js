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
            allSitePage( filter: { isCreatedByStatefulCreatePages: { eq: true }, path: { regex: "/^((?!404).)*$/" } } ) {
                nodes {
                  path
                }
            }
        }
    `)
    const [items, setItems] = React.useState(data.allMarkdownRemark.edges)
    const [pages, setPages] = React.useState(data.allSitePage.nodes)

    const [itemSelectedIndex, setItemSelectedIndex] = React.useState(0)
    const [pageSelectedIndex, setPageSelectedIndex] = React.useState(0)
    const [pagesShow, setPagesShow] = React.useState(false)
    const enter = () => {
        if (pagesShow && pages.length > 0) {
            const page = pages[pageSelectedIndex]
            navigate(page.path)
        }
        if (!pagesShow && items.length > 0){
            const item = items[itemSelectedIndex]
            navigate(`/${item.node.fields.slug}/`)
        }
    }
    //TODO: up or down to scroll
    const up = (showPages) => {
        if (showPages) {
            setItemSelectedIndex(0)
            const preIndex = pageSelectedIndex - 1
            const index = preIndex < 0 ? pages.length - 1 : preIndex
            setPageSelectedIndex(index)
        }else {
            setPageSelectedIndex(0)
            const preIndex = itemSelectedIndex - 1
            const index = preIndex < 0 ? items.length - 1 : preIndex
            setItemSelectedIndex(index)
        }
    }
    const down = (showPages) => {
        if (showPages) {
            setItemSelectedIndex(0)
            const preIndex = pageSelectedIndex + 1
            const index = preIndex >  pages.length - 1 ? 0 : preIndex
            setPageSelectedIndex(index)
        }else {
            setPageSelectedIndex(0)
            const preIndex = itemSelectedIndex + 1
            const index = preIndex >  items.length - 1 ? 0 : preIndex
            setItemSelectedIndex(index)
        }
    }
    const search = (key, showPages) => {
        if (showPages) {
            const newPages = data.allSitePage.nodes.filter(node => ~node.path.toLowerCase().indexOf(key.toLowerCase()))
            setPages(newPages)
        }else {
            const newItems = data.allMarkdownRemark.edges.filter(item => ~item.node.frontmatter.title.toLowerCase().indexOf(key.toLowerCase()))
            setItems(newItems)
        }
        setItemSelectedIndex(0)
        setPageSelectedIndex(0)
    }
    const onInput = (key) => {
        const ps = key.startsWith('/') ? true : false;
        setPagesShow(ps)
        if (key.endsWith('>>')) {
            enter(ps)
        }else if(key.endsWith('^')){
            up(ps)
        }else if(key.endsWith('*')){
            down(ps)
        }else {
            search(key,ps)
        }
    }
    return (
        <div className={styles.container}>
            <Head title="Home" />
            <div className={styles.content}>
                <Header handleKeys={['alphanumeric', 'backspace', 'enter', '.', '/', 'up', 'down']} onInput={(key) => {
                    onInput(key)
                }}/>
                {items.length > 0 && !pagesShow && <ol className={styles.itemContainer}>
                    {items.map((edge, index) => {
                        return (
                            <li className={styles.item} key={edge.node.frontmatter.title}>
                                <Link className={index === itemSelectedIndex ? styles.itemHighlight : styles.itemNormal}  to={`/${edge.node.fields.slug}/`}>
                                    <h2>{edge.node.frontmatter.title}</h2>
                                    <p>{edge.node.frontmatter.date}</p>
                                </Link>
                            </li>
                        )
                    })}
                </ol>}
                {pages.length > 0 && pagesShow && <ol className={styles.itemContainer}>
                    {pages.map((node, index) => {
                        return (
                            <li className={styles.item} key={node.path}>
                                <Link className={index === pageSelectedIndex ? styles.itemHighlight : styles.itemNormal}  to={node.path}>
                                    <h2>{node.path}</h2>
                                </Link>
                            </li>
                        )
                    })}
                </ol>}
                {((items.length <= 0 && !pagesShow) || (pages.length <= 0 && pagesShow)) && <div className={styles.blank}>JUST DO IT coder</div>}
            </div>
            <Footer />
        </div>
    )
}
