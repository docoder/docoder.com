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
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const enter = () => {
        const item = items[selectedIndex]
        navigate(`/${item.node.fields.slug}/`)
    }
    //TODO: up or down to scroll
    const up = () => {
        const preIndex = selectedIndex - 1
        const index = preIndex < 0 ? items.length - 1 : preIndex
        setSelectedIndex(index)
    }
    const down = () => {
        const preIndex = selectedIndex + 1
        const index = preIndex >  items.length - 1 ? 0 : preIndex
        setSelectedIndex(index)
    }
    const search = (key) => {
       const newItems = data.allMarkdownRemark.edges.filter(item => ~item.node.frontmatter.title.toLowerCase().indexOf(key.toLowerCase()))
       setItems(newItems)
       setSelectedIndex(0)
    }
    const onInput = (key) => {
        if (key.endsWith('>>') && items.length > 0) {
            enter()
        }else if(key.endsWith('^') && items.length > 0){
            up()
        }else if(key.endsWith('*') && items.length > 0){
            down()
        }else {
            search(key)
        }
    }
    return (
        <div className={styles.container}>
            <Head title="Home" />
            <div className={styles.content}>
                <Header handleKeys={['alphanumeric', 'backspace', 'enter', '.', '/', 'up', 'down']} onInput={(key) => {
                    onInput(key)
                }}/>
                {items.length > 0 && <ol className={styles.itemContainer}>
                    {items.map((edge, index) => {
                        return (
                            <li className={styles.item} key={edge.node.frontmatter.title}>
                                <Link className={index === selectedIndex ? styles.itemHighlight : styles.itemNormal}  to={`/${edge.node.fields.slug}/`}>
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
