/*
* @Author: docoder
* @Email:  docoder@163.com
*/
import React from "react"
import { navigate } from 'gatsby'
import styles from './header.module.scss'
import { findMatchedKey } from '../utils/keyEvents';
import isURL from '../utils/isURL';

export default ({ handleKeys, onInput }) => {
    const ref = React.useRef();
    const [key, setKey] = React.useState('')
    const [blink, setBlink] = React.useState(true)
    const onKeyDown = React.useCallback((event) => {
        const k = findMatchedKey(event, handleKeys)
        if(!k) return;
        setBlink(false)
        if(ref.current){
            clearTimeout(ref.current)
        }
        ref.current = setTimeout(() => {
            setBlink(true)
            clearTimeout(ref.current)
            ref.current = null
        }, 1000)
        let result = key
        switch (k) {
            case 'backspace': 
            result = key.slice(0, key.length - 1)
            setKey(result)
            break;
            case 'enter':
            if (key.startsWith('/')) {
                navigate(key+'/')
            }else if (isURL(key)) {
                setKey('')
                result=''
                window.open('http://' + key, '_blank')
            }else {
                result += '>>'
            }
            break;
            case 'up':
            result += '^'
            break;
            case 'down':
            result += '*'
            break;
            default:
            result = key + k
            setKey(result)
            break;
        }
        if (onInput) onInput(result)
    }, [onInput])
    React.useEffect(() => {
        document.addEventListener('keydown', onKeyDown, false);
        return () => {
            // clearTimeout(ref.current)
            document.removeEventListener('keydown', onKeyDown, false);
        }
    })
    return (
        <header className={styles.header}>
            <div className={styles.brand}>$ do</div>
            <div className={styles.input}>{key}</div>
            <div className={blink ? styles.blink : styles.noblink}></div>
            <nav>
                <ul>
                </ul>
            </nav>
        </header>
    )
}