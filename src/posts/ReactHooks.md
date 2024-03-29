---
title: "React Hooks"
date: "2019-05-09"
---

## Introduce

### Example

```jsx
  function Example() {
    const [count, setCount] = useState(0);
    useEffect(() => {
      document.title = `点击了 ${count} 次`;
    });
    return (
      <div>
        <p>点击了 {count} 次</p>
        <button onClick={() => setCount(count + 1)}>
          点击
        </button>
      </div>
    );
  }
```

### Notes

 - React 16.8

- No Breaking Changes
  - 可选的
  - 100% 向后兼容
  - 立即可用

- Class 不会被移除

- Hook 被 React 团队 期望成为未来写 React 的主要方式

- 除了不常用的 getDerivedStateFromError 和 componentDidCatch 在 hook 中还没有被等价实现（很快会添加），其他几乎可以覆盖所有使用 Class 的情况

- 不影响对React的理解

- 未来 Redux connect() 和 React Router 也会使用类似 useRedux() 或 useRouter() 的自定义 Hooks，当然现在的 API 用法也是兼容的

- 对静态类型支持更好，如 TypeScript

#### 性能更好

  - 避免了 Class 的开销
  - 重用逻辑无需高阶组件，减少层级

#### 逻辑重用

- ~~render props~~
- ~~高阶组件~~
- 重构，抽取通用逻辑，不用重写层级结构

#### 拥抱 function, 无 Class

- class 缺陷
- this
- [syntax proposals](https://babeljs.io/docs/en/babel-plugin-transform-class-properties/)
- function or  class compnents
- AOT
- minify
- **Thinking in Hooks**
- 不能在 Class 中使用

#### 创建自己的 Hooks

- 每一次调用都会得到一个完全孤立的状态
- 可以在同一个组件中使用两次相同的自定义 Hook
- 约定大于特性
  - 以 "use" 开头
    - 只用于 linter plugin
    - react 并没有依赖此来搜索 hook 或完成其他功能特性 

#### 根据代码作用进行拆分

- 多次使用
- 粒度更小

#### 只能在**顶层**调用

- 不能在循环，条件语句，嵌套函数中调用

- 保证其顺序性和正确性

  - 保证每次 render 都按同样的顺序执行

  - 在多个 useState 和 useEffect 调用过程中保证 state 的正确性

  - React 依赖 Hooks 的调用顺序来确保 state 和 useState 的对应

    - 通过类似数组的方式实现，每次 render 是按数组 index 进行对应

    ```js
      // ------------
      // First render
      // ------------
      useState('Mary')           // 1. Initialize the name state variable with 'Mary'
      useEffect(persistForm)     // 2. Add an effect for persisting the form
      useState('Poppins')        // 3. Initialize the surname state variable with 'Poppins'
      useEffect(updateTitle)     // 4. Add an effect for updating the title
      
      // -------------
      // Second render
      // -------------
      useState('Mary')           // 1. Read the name state variable (argument is ignored)
      useEffect(persistForm)     // 2. Replace the effect for persisting the form
      useState('Poppins')        // 3. Read the surname state variable (argument is ignored)
      useEffect(updateTitle)     // 4. Replace the effect for updating the title
      
      // ...
    ```

- linter plugin 会进行验证

#### 只能在 React functions 中调用

- 不能在普通的 JavaScript 函数中调用

-  React 的函数式组件
-  自定义的 Hook 

#### linter plugin

- [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- Create React App 

#### shouldComponentUpdate

- React .memo wrap 一个 function component 会浅比较 props

  - 仅比较属性，因为不存在 single state object to compare
  - 第二个参数接收一个自定义的 comparison function
  - 返回 true，update 将被跳过

  ```jsx
    const Button = React.memo((props) => {
      // your component
    });
  ```

- useMemo

#### getDerivedStateFromProps

```js
  function ScrollView({row}) {
    let [isScrollingDown, setIsScrollingDown] = useState(false);
    let [prevRow, setPrevRow] = useState(null);
  
    if (row !== prevRow) {
      // Row changed since last render. Update isScrollingDown.
      setIsScrollingDown(prevRow !== null && row > prevRow);
      setPrevRow(row);
    }
  
    return `Scrolling down: ${isScrollingDown}`;
  }
```

## Hooks

### useState

```js
  const [state, setState] = useState(initialState);
```

#### 使用

- 多个State，多次使用useState

  - 数组解构，赋予状态变量不同的名字

  - 在每一次渲染中以相同的顺序被调用

  - initialState 不必须是对象，实际上不鼓励是对象，根据实际数据相关性，进行分组和分离。这样也更利于之后代码重构，抽取相关逻辑成一个自定义 Hook

    ```jsx
      //👎
      const [state, setState] = useState({ left: 0, top: 0, width: 100, height: 100 });
      
      //👍改为如下：
      const [position, setPosition] = useState({ left: 0, top: 0 });
      const [size, setSize] = useState({ width: 100, height: 100 });
      
      //重构，自定义 Hook:
      function Box() {
        const position = useWindowPosition();
        const [size, setSize] = useState({ width: 100, height: 100 });
        // ...
      }
      
      function useWindowPosition() {
        const [position, setPosition] = useState({ left: 0, top: 0 });
        useEffect(() => {
          // ...
        }, []);
        return position;
      }
    ```

- state 仅在第一次 render 时被创建，之后只是修改使我们得到最新的 state

- 无需像 useEffect 或 useCallback 那样指定依赖列表，由 React 来保证

  - 未来，React也会移除 useEffect 和 useCallback 的依赖列表，因为这完全可以通过算法自动解决

#### 更新

- 函数式更新 (Functional updates)

  - 新值是通过之前的值计算而来

  - setCount 可以接受一个函数，接受之前的 state， 返回新的 state

    ```jsx
      function Counter({initialCount}) {
        const [count, setCount] = useState(initialCount);
        return (
          <>
            Count: {count}
            <button onClick={() => setCount(initialCount)}>Reset</button>
            <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
            <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
          </>
        );
      }
    ```

- state 更新了相同的值，不会进行 render 或 触发 effect

  - Object.is() 算法，进行比较

  - useMemo

  - forceUpdate ?

    - 避免使用

    - hack

      ```js
        const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
        
        function handleClick() {
          forceUpdate();
        }
      ```

#### 懒初始化

  - useState 接受一个函数，返回 initialState，仅当初始 render 时被调用进行初始化，只调用一次

    ```jsx
      const [state, setState] = useState(() => {
        const initialState = someExpensiveComputation(props);
        return initialState;
      });
    ```

### useEffect

```js
  useEffect(
    () => {
      // side effects (获取数据、设置订阅和手动更改 React 组件中的 DOM 等)
      return () => { // 可选
        // clean up
      }
    }
   	,
    [state, ...] // 可选，仅当 state (或 ...) 改变时，effect 才重新运行
  );
```

#### 不同

  - 将类组件中的 `componentDidMount` ，`componentDidUpdate`和 `componentWillUnmount` 统一为一个 API
- 避免逻辑分散和重复书写
      - 生命周期函数常常包含不相关的逻辑，同时相关的逻辑被拆分进不同的方法
  - 在每一次 render 后运行 effects ( 包括第一次 render )

    - React 保证每次运行 effects 之前 DOM 已经更新了
    - 在每次 render 的时候，都是新创建了一个函数传递给了 `useEffect` 
      - 每次都是创建了新的 effect 替换之前的。
      - 每个 effect 属于一个特定的 render
      - 不用担心 effect 里 state 过期的问题
  - 拥抱闭包，在函数作用域中，可方便访问 state

#### 清理

  - 通过返回一个函数来 clean up

- 添加和清理的逻辑可以彼此靠近

- 在下次运行 effect 之前清理上一次 render 中的 effect

- 清理不在 unmount 调用一次，而是在每次 re-render 后调用

  - 避免在缺失 `componentDidUpdate` 时会产生的 bugs

    ```js
      
      //当 friend 的属性改变时，会产生依旧显示之前 friend 的在线状态的bug，尤其当 unmounting 的时候，由于 unsubscribe 一个错误的 friend id 会产生内存泄露甚至 crash
      componentDidMount() {
        ChatAPI.subscribeToFriendStatus(
          this.props.friend.id,
          this.handleStatusChange
        );
      }

      componentWillUnmount() {
        ChatAPI.unsubscribeFromFriendStatus(
          this.props.friend.id,
          this.handleStatusChange
        );
      }
    ```

    ```js
      //需要使用 componentDidUpdate
      componentDidMount() {
        ChatAPI.subscribeToFriendStatus(
          this.props.friend.id,
          this.handleStatusChange
        );
      }
    
      componentDidUpdate(prevProps) {
        // Unsubscribe 之前的 friend.id
        ChatAPI.unsubscribeFromFriendStatus(
          prevProps.friend.id,
          this.handleStatusChange
        );
        // Subscribe 新的 friend.id
        ChatAPI.subscribeToFriendStatus(
          this.props.friend.id,
          this.handleStatusChange
        );
      }
    
      componentWillUnmount() {
        ChatAPI.unsubscribeFromFriendStatus(
          this.props.friend.id,
          this.handleStatusChange
        );
      }
    
    ```

#### 有选择的运行 effect

- 避免性能问题

- useEffect 的第二个参数

  ```js
    useEffect(() => {
      function handleStatusChange(status) {
        setIsOnline(status.isOnline);
      }
    
      ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
      };
    }, [props.friend.id]); // 仅当 props.friend.id 改变时 effect 才运行
  ```

- 仅在 mount 和 unmount 才运行 effect

  - 第二个参数传空数组 `[]`

- 错误的指定第二个参数(经常是指过少配置), 会造成得不到最新的 props 或 state 的 bug

#### 需把函数放到 useEffect 里

```jsx
  function Example({ someProp }) {
    function doSomething() {
      console.log(someProp);
    }
  
    useEffect(() => {
      doSomething();
    }, []); // 🔴 This is not safe (it calls `doSomething` which uses `someProp`)
  }
```

```jsx
  function Example({ someProp }) {
    useEffect(() => {
      function doSomething() {
        console.log(someProp);
      }
  
      doSomething();
    }, [someProp]); // ✅ OK (our effect only uses `someProp`)
  }
  
  function Example({ someProp }) {
    useEffect(() => {
      function doSomething() {
        console.log('hello');
      }
  
      doSomething();
    }, []); // ✅ OK in this example because we don't use *any* values from component scope
  }
```

#### 不能将函数放到 effect 里

- 确保函数中没有引用 props 或 state

- 纯计算函数，将该函数返回结果作为 effect 的依赖

- 用 useCallback wrap 函数 (确保函数在依赖不变的情况下，本身不变)，再作为 effect 依赖

  ```jsx
    function ProductPage({ productId }) {
      // ✅ Wrap with useCallback to avoid change on every render
      const fetchProduct = useCallback(() => {
        // ... Does something with productId ...
      }, [productId]); // ✅ All useCallback dependencies are specified
    
      return <ProductDetails fetchProduct={fetchProduct} />;
    }
    
    function ProductDetails({ fetchProduct })
      useEffect(() => {
        fetchProduct();
      }, [fetchProduct]); // ✅ All useEffect dependencies are specified
      // ...
    }
  ```

#### effect 依赖变动太频繁

- 函数式更新 (Functional updates)

```jsx
  function Counter() {
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      const id = setInterval(() => {
        setCount(count + 1); // This effect depends on the `count` state
      }, 1000);
      return () => clearInterval(id);
    }, []); // 🔴 Bug: `count` is not specified as a dependency
  
    return <h1>{count}</h1>;
  }
```

```jsx
  function Counter() {
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      const id = setInterval(() => {
        setCount(c => c + 1); // ✅ This doesn't depend on `count` variable outside. The identity of the setCount function is guaranteed to be stable so it’s safe to omit.
      }, 1000);
      return () => clearInterval(id);
    }, []); // ✅ Our effect doesn't use any variables in the component scope
  
    return <h1>{count}</h1>;
  }
```

#### [使用 useReducer 简化 state 管理](https://adamrackis.dev/state-and-use-reducer/)

```jsx
  const BookEntryList = props => {
    const [pending, setPending] = useState(0);
    const [booksJustSaved, setBooksJustSaved] = useState([]);
  
    useEffect(() => {
      const ws = new WebSocket(webSocketAddress("/bookEntryWS"));
  
      ws.onmessage = ({ data }) => {
        let packet = JSON.parse(data);
        if (packet._messageType == "initial") {
          setPending(packet.pending);
        } else if (packet._messageType == "bookAdded") {
          setPending(pending - 1 || 0);
          setBooksJustSaved([packet, ...booksJustSaved]);
        } else if (packet._messageType == "pendingBookAdded") {
          setPending(+pending + 1 || 0);
        } else if (packet._messageType == "bookLookupFailed") {
          setPending(pending - 1 || 0);
          setBooksJustSaved([
            {
              _id: "" + new Date(),
              title: `Failed lookup for ${packet.isbn}`,
              success: false
            },
            ...booksJustSaved
          ]);
        }
      };
      return () => {
        try {
          ws.close();
        } catch (e) {}
      };
    }, []);
  
    //...
  };
```

```jsx
  function scanReducer(state, [type, payload]) {
    switch (type) {
      case "initial":
        return { ...state, pending: payload.pending };
      case "pendingBookAdded":
        return { ...state, pending: state.pending + 1 };
      case "bookAdded":
        return {
          ...state,
          pending: state.pending - 1,
          booksSaved: [payload, ...state.booksSaved]
        };
      case "bookLookupFailed":
        return {
          ...state,
          pending: state.pending - 1,
          booksSaved: [
            {
              _id: "" + new Date(),
              title: `Failed lookup for ${payload.isbn}`,
              success: false
            },
            ...state.booksSaved
          ]
        };
    }
    return state;
  }
  const initialState = { pending: 0, booksSaved: [] };
  
  const BookEntryList = props => {
    const [state, dispatch] = useReducer(scanReducer, initialState);
  
    useEffect(() => {
      const ws = new WebSocket(webSocketAddress("/bookEntryWS"));
  
      ws.onmessage = ({ data }) => {
        let packet = JSON.parse(data);
        dispatch([packet._messageType, packet]); // The identity of the dispatch function from useReducer is always stable
      };
      return () => {
        try {
          ws.close();
        } catch (e) {}
      };
    }, []);
  
    //...
  };
```

####[exhaustive-deps](https://github.com/facebook/react/issues/14920) ESLint

- [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) 中的一部分
- 用来验证对于第二个参数进行不正确的设置

####[异步请求数据](https://www.robinwieruch.de/react-hooks-fetch-data/) 

```jsx
  function SearchResults() {
    const [data, setData] = useState({ hits: [] });
    const [query, setQuery] = useState('react');
  
    useEffect(() => { // 在 useEffect 里直接使用 async function 是不被允许的，因为 useEffect function 必须要返回一个清理 function 或 nothing。
      let ignore = false;
  
      async function fetchData() { //需要在 useEffect function 里使用 async function
        const result = await axios('https://hn.algolia.com/api/v1/search?query=' + query);
        if (!ignore) setData(result.data); //当组件 unmount 时，阻止其设置 state
      }
  
      fetchData();
      return () => { ignore = true; }
    }, [query]); // [query] 阻止造成循环，仅当 query 改变时，effect 才执行
  
    return (
      <>
        <input value={query} onChange={e => setQuery(e.target.value)} />
        <ul>
          {data.hits.map(item => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      </>
    );
  }
```

#### 关注点分离

- 多次使用 useEffect

- 根据代码的作用拆分成多个 effect

#### 不会阻塞浏览器渲染

- useEffect 不会阻塞浏览器渲染
- `componentDidMount` 或`componentDidUpdate ` 会阻塞
- 提供阻塞版本 useLayoutEffect ，来满足同步调用计算元素尺寸等问题

### useReducer

- 只是对 local state 进行 redux 化，没有形成 store 和 公用的 state 树

```jsx
  const [state, dispatch] = useReducer(reducer, initialArg, init);
```

```jsx
  const initialState = {count: 0};
  
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count - 1};
      default:
        throw new Error();
    }
  }
  
  function Counter({initialState}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
      <>
        Count: {state.count}
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      </>
    );
  }
```
- Pass down a dispatch function
```jsx
  const TodosDispatch = React.createContext(null);

  function TodosApp() {
    // Note: `dispatch` won't change between re-renders
      const [todos, dispatch] = useReducer(todosReducer);

      return (
          <TodosDispatch.Provider value={dispatch}>
              <DeepTree todos={todos} />
          </TodosDispatch.Provider>
      );
  }
```
```jsx

  function DeepChild(props) {
    // If we want to perform an action, we can get dispatch from context.
      const dispatch = useContext(TodosDispatch);

      function handleClick() {
          dispatch({ type: 'add', text: 'hello' });
      }

      return (
          <button onClick={handleClick}>Add todo</button>
      );
  }
```

### useContext

- 用 useContext 和 useReduce 来 redux

```jsx
const initialState = {
    formData: {}
}
function reducer (state, action) {
    switch (action.type) {
        case types.FORM_SUBMIT:
            return {...state, formData: action.payload}
        default: 
            return state
    }
}
export const types = {
    FORM_SUBMIT: 'FORM/SUBMIT',
}

export const Store = React.createContext(initialState)
export function StoreProvider({ children }) {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    const actions = useMemo(() => ({
        submitForm: (values) => {
            dispatch({type: types.FORM_SUBMIT, payload: values})
        }
    }), [])
    return <Store.Provider value={{ state, actions }}>{children}</Store.Provider>
}
```

### useRef

#### 类似实例变量

```jsx
  function Timer() {
    const intervalRef = useRef();
  
    useEffect(() => {
      const id = setInterval(() => {
        // ...
      });
      intervalRef.current = id; // current 可以被赋任何值，类似类中的实例变量
      return () => {
        clearInterval(intervalRef.current);
      };
    });
  
    // ...
    function handleCancelClick() {
      clearInterval(intervalRef.current);
    }
    // ...
  }
```

#### 获取 previous state

```jsx
  function Counter() {
    const [count, setCount] = useState(0);
    const prevCountRef = useRef();
    useEffect(() => {
      prevCountRef.current = count;
    });
    const prevCount = prevCountRef.current;
  
    return <h1>Now: {count}, before: {prevCount}</h1>;
  }
```

#### usePrevious

- 自定义 Hook

- 可能之后会提供开箱即用的官方实现

```jsx
  function Counter() {
    const [count, setCount] = useState(0);
    const prevCount = usePrevious(count); // 使用自定义的 Hook
    return <h1>Now: {count}, before: {prevCount}</h1>;
  }
  // 自定义 Hook
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
```

#### 读取最新 state 

- 在一些异步回调中，读取最新 state 

```jsx
  // 首先点击 Show alert, 然后点击 Click me
  function Example() {
    const [count, setCount] = useState(0);
  
    function handleAlertClick() {
      setTimeout(() => {
        alert('You clicked on: ' + count); //读取的是点击 Show alert 时的 count，不是最新值
      }, 3000);
    }
  
    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
        <button onClick={handleAlertClick}>
          Show alert
        </button>
      </div>
    );
  }
```

```jsx
  // 用 useRef 修改:
  function Example() {
    const [count, setCount] = useState(0);
    
    //使用 useRef
    const countRef = useRef();
    countRef.current = count;
    
    function handleAlertClick() {
      setTimeout(() => {
        alert('You clicked on: ' + countRef.current); //通过 ref 访问 count，读取的是最新值
      }, 3000);
    }
  
    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
        <button onClick={handleAlertClick}>
          Show alert
        </button>
      </div>
    );
  }
```

#### 懒加载

- useRef 不像 useState 那样接收函数

  ```jsx
    function Image(props) {
      // ⚠️ IntersectionObserver is created on every render
      const ref = useRef(new IntersectionObserver(onIntersect));
      // ...
    }
  ```

    ```jsx
    function Image(props) {
      const ref = useRef(null);
    
      // ✅ IntersectionObserver is created lazily once
      function getObserver() {
        let observer = ref.current;
        if (observer !== null) {
          return observer;
        }
        let newObserver = new IntersectionObserver(onIntersect);
        ref.current = newObserver;
        return newObserver;
      }
    
      // When you need it, call getObserver()
      // ...
    }
    ```

### useCallback(fn, deps)

- 返回一个带缓存的 callback

- 仅当所需依赖 deps (数组) 中元素改变时，才执行，否则返回缓存的值

- 等价于 `useMemo(() => fn, deps)`

- [`exhaustive-deps`](https://github.com/facebook/react/issues/14920) ESLint

  ```jsx
    // 使用 Callback Refs, 而不用 useRef，这样当 ref 改变时，可以获知
    function MeasureExample() {
      const [height, setHeight] = useState(0);
    
      const measuredRef = useCallback(node => {
        if (node !== null) {
          setHeight(node.getBoundingClientRect().height);
        }
      }, []); // [] 确保 ref callback 不会改变，re-renders 时，不会被重复调用执行
    
      return (
        <>
          <h1 ref={measuredRef}>Hello, world</h1>
          <h2>The above header is {Math.round(height)}px tall</h2>
        </>
      );
    }
  ```

  ```jsx
    // 抽取自定义 Hook
    function MeasureExample() {
      const [rect, ref] = useClientRect();
      return (
        <>
          <h1 ref={ref}>Hello, world</h1>
          {rect !== null &&
            <h2>The above header is {Math.round(rect.height)}px tall</h2>
          }
        </>
      );
    }
    
    function useClientRect() {
      const [rect, setRect] = useState(null);
      const ref = useCallback(node => {
        if (node !== null) {
          setRect(node.getBoundingClientRect());
        }
      }, []);
      return [rect, ref];
    }
  ```

### useMemo(() => fn, deps)

- 返回一个带缓存的值，避免消耗性能的计算重复执行

  ```jsx
    const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  ```

  - 仅当 a，b 改变时，才会重新调用 computeExpensiveValue
  - 每次 render 时，传给 useMemo 的函数会执行，不要把一些副作用放到里面

- 性能优化

  ```jsx
    function Parent({ a, b }) {
      // Only re-rendered if `a` changes:
      const child1 = useMemo(() => <Child1 a={a} />, [a]);
      // Only re-rendered if `b` changes:
      const child2 = useMemo(() => <Child2 b={b} />, [b]);
      return (
        <>
          {child1}
          {child2}
        </>
      )
    }
  ```

- **keeping variables in-sync**

  ```jsx
  const Chart = ({ dateRange }) => {
    const [data, setData] = useState()
    useEffect(() => {
      const newData = getDataWithinRange(dateRange)
      setData(newData)
    }, [dateRange]) // 当 dateRange 改变时，需要重新计算 data
    return (
      <svg className="Chart" />
    )
  }
  ```

  可使用 `useMemo` :

  ```jsx
  const Chart = ({ dateRange }) => {
    const data = useMemo(() => (
      getDataWithinRange(dateRange)
    ), [dateRange]) // 当 dateRange 改变时，需要重新计算 data
    return (
      <svg className="Chart" />
    )
  }
  ```

  ```jsx
  const Chart = ({ dateRange, margins }) => {
    const data = useMemo(() => (
      getDataWithinRange(dateRange)
    ), [dateRange]) // 当 dateRange 改变时，需要重新计算 data
    
    // 当 margins 改变时，需要重新计算 dimensions
    const dimensions = useMemo(getDimensions, [margins])
    // 当 data 或 dimensions 改变时，需要重新计算 scals
    const xScale = useMemo(getXScale, [data, dimensions]) 
    const yScale = useMemo(getYScale, [data, dimensions])
    return (
      <svg className="Chart" />
    )
  }
  ```

  

### useImperativeHandle(ref, createHandle, [deps])

- 当使用 ref 来给父组件提供实例时，用来提供自定义的方法属性

- 尽量避免使用

- 应该与 forwardRef 一起使用

  ```jsx
    function FancyInput(props, ref) {
      const inputRef = useRef();
      useImperativeHandle(ref, () => ({
        focus: () => {
          inputRef.current.focus();
        }
      }));
      return <input ref={inputRef} />;
    }
    FancyInput = forwardRef(FancyInput);
  ```

  ```jsx
    function Parent() {
      const fancyInputRef = useRef();
      return (
        <>
          <FancyInput ref={fancyInputRef} />
          <button onClick={()=>{
              fancyInputRef.current.focus()
          }}>Focus</button>
        </>
      )
    }

  ```

## Custom Hooks

### useIsMounted

```js
export const useIsMounted = () => {
  const isMounted = useRef(false)
  useEffect(() => {
      isMounted.current = true
      return () => isMounted.current = false
  }, [])
  return isMounted
}
```

### useIsInView

```js
const useIsInView = (margin="0px") => {
  const [isIntersecting, setIntersecting] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const observer = new IntersectionObserver(([ entry ]) => {
      setIntersecting(entry.isIntersecting)
    }, { rootMargin: margin })
    if (ref.current) observer.observe(ref.current)
    return () => {
      observer.unobserve(ref.current)
    }
  }, [])
  return [ref, isIntersecting]
}
```

### useHash

```js
const useHash = (initialValue=null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.location.hash
      return item ? item.slice(1) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })
  const setValue = value => {
    try {
      setStoredValue(value)
      history.pushState(null, null, `#${value}`)
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
```

### useOnKeyPress

```js
const useOnKeyPress = (targetKey, onKeyDown, onKeyUp, isDebugging=false) => {
  const [isKeyDown, setIsKeyDown] = useState(false)
  const onKeyDownLocal = useCallback(e => {
    if (isDebugging) console.log("key down", e.key, e.key != targetKey ? "- isn't triggered" : "- is triggered")
    if (e.key != targetKey) return
    setIsKeyDown(true)
    if (typeof onKeyDown != "function") return
    onKeyDown(e)
  })
  const onKeyUpLocal = useCallback(e => {
    if (isDebugging) console.log("key up", e.key, e.key != targetKey ? "- isn't triggered" : "- is triggered")
    if (e.key != targetKey) return
    setIsKeyDown(false)
    if (typeof onKeyUp != "function") return
    onKeyUp(e)
  })
  useEffect(() => {
    addEventListener('keydown', onKeyDownLocal)
    addEventListener('keyup', onKeyUpLocal)
    return () => {
      removeEventListener('keydown', onKeyDownLocal)
      removeEventListener('keyup', onKeyUpLocal)
    }
  }, [])
  return isKeyDown
}
```

### useChartDimensions

```js
const combineChartDimensions = dimensions => {
  let parsedDimensions = {
      marginTop: 40,
      marginRight: 30,
      marginBottom: 40,
      marginLeft: 75,
      ...dimensions,
  }
  return {
      ...parsedDimensions,
      boundedHeight: Math.max(parsedDimensions.height - parsedDimensions.marginTop - parsedDimensions.marginBottom, 0),
      boundedWidth: Math.max(parsedDimensions.width - parsedDimensions.marginLeft - parsedDimensions.marginRight, 0),
  }
}
export const useChartDimensions = passedSettings => {
  const ref = useRef()
  const dimensions = combineChartDimensions(passedSettings)
  const [width, changeWidth] = useState(0)
  const [height, changeHeight] = useState(0)
  useEffect(() => {
    if (dimensions.width && dimensions.height) return
    const element = ref.current
    const resizeObserver = new ResizeObserver(entries => {
      if (!Array.isArray(entries)) return
      if (!entries.length) return
      const entry = entries[0]
      if (width != entry.contentRect.width) changeWidth(entry.contentRect.width)
      if (height != entry.contentRect.height) changeHeight(entry.contentRect.height)
    })
    resizeObserver.observe(element)
    return () => resizeObserver.unobserve(element)
  }, [])
  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  })
  return [ref, newSettings]
}
```

### useCookie

https://github.com/reactivestack/cookies/tree/master/packages/react-cookie/

### useInterval

https://overreacted.io/making-setinterval-declarative-with-react-hooks/

```js
import React, { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```

### useLocalStorage

https://usehooks.com/useLocalStorage/

```jsx
import { useState } from 'react';

// Usage
function App() {
  // Similar to useState but first arg is key to the value in local storage.
  const [name, setName] = useLocalStorage('name', 'Bob');

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
    </div>
  );
}

// Hook
function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
```

### use-persisted-state

https://github.com/donavon/use-persisted-state

