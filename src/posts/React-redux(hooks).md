---
title: "React-redux(hooks)"
date: "2019-06-14"
---

## useSelector()

```js
  const result : any = useSelector(selector : Function, equalityFn? : Function)
```

- 概念上与带 mapStateToProps 参数的 connect 近似相等

- 订阅 Redux store，dispatch action 时 selector 会运行

  ```jsx
    import React from 'react'
    import { useSelector } from 'react-redux'
    
    export const CounterComponent = () => {
      const counter = useSelector(state => state.counter)
      return <div>{counter}</div>
    }
  ```

- 返回任何类型的值，不仅仅只是一个对象，因此，`useSelector()` 默认用 `===` 做比较，而不是浅比较

- action dispatch 后，进行浅比较，不同时组件会 re-render，相同时不 re-render

- selector 没有 ownProps 参数，会在其闭包作用域中访问到组件的 props

  ```jsx
    import React from 'react'
    import { useSelector } from 'react-redux'
    
    export const TodoListItem = props => {
      const todo = useSelector(state => state.todos[props.id])
      return <div>{todo.text}</div>
    }
  ```

- 用 memoizing selectors 时，需要格外注意

- 在一个组件中可以多次使用 `useSelector()` ，每次都会产生一个独立的对于 Redux store 的订阅

- React Redux 会 batch behavior，action dispatch 在一个组件中引起的多次 `useSelector()` 仅会造成一次新的渲染

### 需要从 store 获取多个值

- 多次调用 `useSelector()`，每次只返回一个值

- 用 reselect 创建一个带缓存的 selector，返回一个带多个值的对象，并且仅当其中一个值改变时才返回新对象

  ```jsx
    import React from 'react'
    import { useSelector } from 'react-redux'
    import { createSelector } from 'reselect'
    
    // selector 依赖 state, 需要确保其在组件之外声明，从而确保组件每次 render 时使用的是同一个实例
    const selectNumOfDoneTodos = createSelector(
      state => state.todos,
      todos => todos.filter(todo => todo.isDone).length
    )
    
    export const DoneTodosCounter = () => {
      const NumOfDoneTodos = useSelector(selectNumOfDoneTodos)
      return <div>{NumOfDoneTodos}</div>
    }
    
    export const App = () => {
      return (
        <>
          <span>Number of done todos:</span>
          <DoneTodosCounter />
        </>
      )
    }
  ```

  ```jsx
    import React from 'react'
    import { useSelector } from 'react-redux'
    import { createSelector } from 'reselect'
    
    const selectNumOfTodosWithIsDoneValue = createSelector(
      state => state.todos,
      (_, isDone) => isDone,
      (todos, isDone) => todos.filter(todo => todo.isDone === isDone).length
    )
    
    export const TodoCounterForIsDoneValue = ({ isDone }) => {
      const NumOfTodosWithIsDoneValue = useSelector(state =>
        selectNumOfTodosWithIsDoneValue(state, isDone)  // 依赖了 props
      )
      return <div>{NumOfTodosWithIsDoneValue}</div>
    }
    
    export const App = () => {
      return (
        <>
          <span>Number of done todos:</span>
          <TodoCounterForIsDoneValue isDone={true} />
        </>
      )
    }
  ```

  ```jsx
    import React, { useMemo } from 'react'
    import { useSelector } from 'react-redux'
    import { createSelector } from 'reselect'
    
    const makeNumOfTodosWithIsDoneSelector = () => createSelector(
      state => state.todos,
      (_, isDone) => isDone,
      (todos, isDone) => todos.filter(todo => todo.isDone === isDone).length
    )
    // TodoCounterForIsDoneValue 组件
    export const TodoCounterForIsDoneValue = ({ isDone }) => {
      //确保相同组件不同实例返回相同的缓存的 selector, 而不同的实例返回不同的 selector
      const selectNumOfTodosWithIsDone = useMemo(
        makeNumOfTodosWithIsDoneSelector,
        []
      )
      
      const numOfTodosWithIsDoneValue = useSelector(state =>
        selectNumOfTodosWithIsDoneValue(state, isDone)  // 依赖了 props
      )
    
      return <div>{numOfTodosWithIsDoneValue}</div>
    }
    
    // 多个相同组件 (TodoCounterForIsDoneValue) 的不同实例，需要有自己的不同 selector 实例
    export const App = () => {
      return (
        <>
          <span>Number of done todos:</span>
          <TodoCounterForIsDoneValue isDone={true} />
          <span>Number of unfinished todos:</span>
          <TodoCounterForIsDoneValue isDone={false} />
        </>
      )
    }
  ```

  

- 使用 `shallowEqual` 作为 `useSelector()` 的 `equalityFn` 参数，也可以使用  Lodash's `_.isEqual()` 或 Immutable.js

  ```js
    import { shallowEqual, useSelector } from 'react-redux'
    
    // later
    const selectedData = useSelector(selectorReturningObject, shallowEqual)
  ```

## useDispatch()

- 返回 Redux store 的 `dispatch`  , 可以用于 dispatch action

  ```jsx
    import React from 'react'
    import { useDispatch } from 'react-redux'
    
    export const CounterComponent = ({ value }) => {
      const dispatch = useDispatch()
    
      return (
        <div>
          <span>{value}</span>
          <button onClick={() => dispatch({ type: 'increment-counter' })}>
            Increment counter
          </button>
        </div>
      )
    }
  ```

- 当需要把使用了 dispatch 的回调函数传给子组件时，需要用 `useCallback` 将回调函数缓存，这些可以避免子组件因回调函数实例不同而造成不必要的渲染

  ```jsx
    import React, { useCallback } from 'react'
    import { useDispatch } from 'react-redux'
    
    export const CounterComponent = ({ value }) => {
      const dispatch = useDispatch()
      const incrementCounter = useCallback(
        () => dispatch({ type: 'increment-counter' }),
        [dispatch]
      )
    
      return (
        <div>
          <span>{value}</span>
          <MyIncrementButton onIncrement={incrementCounter} />
        </div>
      )
    }
    // React.memo 类似 class 组件的 React.PureComponent, 但用于函数组件，当函数组件的 props (参数) 不变时(浅比较), 将返回缓存的结果，React 将跳过 render。对于那些 props 相同返回相同结果的函数组件可以提升性能。
    export const MyIncrementButton = React.memo(({ onIncrement }) => (
      <button onClick={onIncrement}>Increment counter</button>
    ))
  ```

  

## useStore()

- 返回与传递给 `<Provider>` 组件相同的 Redux store 引用

  ```jsx
    import React from 'react'
    import { useStore } from 'react-redux'
    
    export const CounterComponent = ({ value }) => {
      const store = useStore()
    
      // EXAMPLE ONLY! Do not do this in a real app.
      // The component will not automatically update if the store state changes
      return <div>{store.getState()}</div>
    }
  ```



