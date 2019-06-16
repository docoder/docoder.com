---
title: "Webpack"
date: "2019-06-12"
---

# Webpack

## Basic

```js
  ...
  const path = require('path');
  module.exports = {
    ...
    mode:'development',	// 模式：development 或 production（代码是否会压缩）
    entry:'./src/index.js',	// 入口
    output:{
      filename:'bundle.[hash:8].js', //打包后文件名，8位 hash
      path: path.resolve(__dirname,'build'),	//路径必须是一个绝对路径
    },
    plugins:[], // webpack 插件
    module: {		// 模块
      rules: [] // 规则
    },
    ...
  }
```



### resolve

```js
  ...
  const path = require('path');
  module.exports = {
    ...
    resolve:{
      modules: [path.resolve('node_modules')], // 配置包加载时的搜索路径
      // 配置 import 或 require 文件缺省后缀时, 自动添加后缀
      extensions:['.js','.css','.json','.vue'],
      // 加载包时先加载其 package.json 中 style 字段对应的文件，在加载 main 字段对应的文件
      mainFields:['style','main'],
      mainFiles:['index.js'], // 入口文件的名字
      alias:{ // 别名
        bootstrap: 'bootstrap/dist/css/bootstrap.css'
      }
    },
    ...
  }
```



### devServer

- 内置了一个 express

```js
  ...
  module.exports = {
  	...
    devServer: { // 开发服务器的配置
      port: 3000,	//端口
      progress: true, //显示进度条
      contentBase: './build',
      compress: true,	//压缩
      open: true,	//自动打开浏览器
      proxy:{ // 代理配置, 把请求代理到其他服务器上
        '/api':{
          target:'http://localhost:3000',
          // 请求路径重写, (如: http://localhost:8080/api/user -> http://localhost:3000/user)
          pathRewrite:{'/api':''}
        }
      },
      before(app){ // 请求发送之前的 hook, app 是 express 的实例
        app.get('/user',(req, res)=>{
          res.json({name:'docoder'})
        })
      }
    },
    ...
  }
```



### devtool

- source-map:  会单独生成一个sourcemap文件, 会映射源码的列和行，大而全
- eval-source-map: 不会产生单独的文件, 但是可以映射源码的列和行
- cheap-module-source-map: 不会映射源码的列, 但是会生成一个单独的映射文件, 可以单独保存此文件
- cheap-module-eval-source-map: 不会映射源码的列, 也不会产生单独的文件

```js
  ...
  module.exports = {
  	...
    devtool:'source-map',
    ...
  }
```



### watch

```js
  ...
  const path = require('path');
  module.exports = {
    ...
    watch:true,
    watchOptions:{ // 监控的选项
      poll:1000, // 每秒 1000次
      aggregateTimeout:500, // 防抖
      ignored:/node_modules/ // 不需要监控的文件
    },
    ...
  }
```



### 多入口

```js
  ...
  const path = require('path');
  module.exports = {
    ...
    entry: {
      home: './src/index.js',
      other: './src/other.js'
    },
    output: {
      filename: '[name].js', // [name] -> home/other
      path: path.resolve(__dirname, 'dist')
    },
    ...
  }
```



## Plugins

### html-webpack-plugin

将打包的  js  文件引入 html

```js
  ...
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  module.exports = {
    ...
    plugins:[
      ...
      new HtmlWebpackPlugin({
        template: './src/index.html', //html 模板, 入口
        filename: 'index.html',	//打包后文件名, 出口
        minify: {
          removeAttributeQuotes: true, //去除 html 属性的值的双引号
          collapseWhitespace: true,//去除多余空格
        },
        hash: true	//用 hash 方式 引入 js 文件  (bundle.js?13b846a2eb16842e76cf)
      }),
      ...
    ],
    //引用一个库, 不让webpack打包，并且又不影响在程序中以 CMD、AMD 或者 window/global 全局等方式进行使用
    externals: { 	
        jquery: "$"
    },
    ...
  }
```

### uglifyjs-webpack-plugin, optimize-css-assets-webpack-plugin, mini-css-extract-plugin

```js
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const OptimizeCss = require('optimize-css-assets-webpack-plugin');
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
  module.exports = {
    optimization:{ // 优化项
      minimizer:[
        new UglifyJsPlugin({
          cache: true,     //缓存 (node_modules/.cache/uglifyjs-webpack-plugin)
          parallel: true,  //并行 uglify
          sourceMap: true  //sourceMap
        }),
        new OptimizeCss()
      ]
    },
    mode: 'production', 
    entry: './src/index.js',
    output: {
      filename: 'bundle.js', 
      path: path.resolve(__dirname, 'build'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new MiniCssExtractPlugin({ //把 css 处理打包成一个文件
        filename:'main.css' //打包后的文件名
      })
    ],
    module: { 
      rules: [ 
        {
          test: /\.css$/,
          use: [
            //不用 style-loader
            //而用 MiniCssExtractPlugin 的 loader 将打包后的css文件 link 方式插入 html
            MiniCssExtractPlugin.loader,  
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader', 
            'postcss-loader',
            'less-loader'
          ]
        }
      ]
    }
  }
```

### webpack.ProvidePlugin

```js
  ...
  module.exports = {
    ...
    plugins:[
      ...
      new webpack.ProvidePlugin({ // 在每个模块中都注入$
         $:'jquery'
      }),
      ...
    ],
    ...
  }
```



### clean-webpack-plugin, copy-webpack-plugin, webpack.BannerPlugin

```js
  ...
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  const webpack = require('webpack');
  module.exports = {
    ...
    plugins:[
      ...
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
        {from:'doc',to:'./'}
      ]),
      new webpack.BannerPlugin('@license 2019 docoder')
      ...
    ],
    ...
  }
```



## Loader

- 单一性，一个 loader 只处理一个事情
- loader 的执行顺序, 默认是从右向左, 从下到上
- 对象方式可以设置 options
- pre: 前置 loader
- normal: 普通 loader
- 内联 loader
- post: 后置 loader



### style-loader css-loader less-loader

```js
  ...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          // 可以处理less文件
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader', // style-loader 他是把css 插入到head的标签中
              options:{
                //将处理后的包含 css 的 <style> 标签插入 html 所有其他自定义的<style>上面
                insertAt:'top' 
              }
            },
            // css-loader 处理 @import 解析路径, 导入 css, 
            // 以及将 url('./image.png') 处理为 url(require('./image.png'))
            'css-loader' 
          ]
        },
        {
          // 可以处理less文件  sass stylus  node-sass sass-loader
          // stylus stylus-loader
          test: /\.less$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                insertAt: 'top'
              }
            },
            'css-loader',
            'less-loader' // (需要同时按照 less 包) 调用 less， 把less -> css
          ]
        },
        ...
      ]
    },
    ...
  }
```



### postcss-loader

```js
  ...
  module.exports = {
    ...
    module: { 
      rules: [
        ...
        {
          test: /\.css$/,
          use: [
           	...  
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
           	...
            'css-loader', 
            'postcss-loader',
            'less-loader'
          ]
        },
        ...
      ]
    }
  }
```

```js
  // postcss.config.js
  module.exports = {
    plugins:[require('autoprefixer')]
  }
```



### eslint-loader

```js
  ...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test:/\.js$/,
          use:{
            loader:'eslint-loader',
            options:{
               enforce:'pre' //前置 loader
            }
          }
        },
        ...
      ]
    },
    ...
  }
```


### babel-loader

```js
  ...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test:/\.js$/,
          use:{
            loader:'babel-loader',
            options:{ // 用 babel-loader 需要把 es6 -> es5
              presets:[
                '@babel/preset-env' // es6
              ],
              plugins:[
                //支持注解 (草案)
                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                //支持类属性 (草案)
                ["@babel/plugin-proposal-class-properties", { "loose": true }],
                "@babel/plugin-transform-runtime" //TODO:
              ]
            }
          },
          include:path.resolve(__dirname,'src'),
          exclude:/node_modules/
        },
        ...
      ]
    },
    ...
  }
```



### file-loader

- 默认会在 build 目录下生成一张新的图片
- 并将新的图片地址返回

```js
  import logo from './logo.png'; 
  let image = new Image();
  image.src = logo; // logo 其实就是一个新的图片地址字符串
  document.body.appendChild(image);
  ```

  ```js
  ...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test:/\.(png|jpg|gif)$/,
          use: 'file-loader'
        },
        ...
      ]
    },
    ...
  }
```



### url-loader

- 可以限制图片小于多少 byte 的时候，用 base64 URI
- 否则采用 fallback 的 loader (默认用 file-loader 产生真实的图片)

```js
  ...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test:/\.(png|jpg|gif)$/,
          use:{
            loader: 'url-loader',
            options:{
              limit: 8192,
              fallback: 'responsive-loader', //可将默认的 file-loader 改为 responsive-loader
              outputPath:'/img/', //真实图片输出目录
              publicPath:'http://docoder.com' //自定义域名
            }
          }
        },
        ...
      ]
    },
    ...
  }
```



### html-withimg-loader

- 打包 html 中用 img 的 src 加载的图片

- 支持 html 的 include 子页面功能

  ```html
    <!DOCTYPE html>
    <html>
    <head>
    #include("./templates/layout.html")
    <title>示例页面</title>
    </head>
    <body>
    <img id="logo" src="./images/logo.jpg" />
    #include("./templates/scripts.html")
    </body>
    </html>
  ```

```js
...
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test:/\.html$/,
          use:'html-withimg-loader'
        },
        ...
      ]
    },
    ...
  }
```



## Cases

### 在每个模块中注入第三方库的对象 (如, jQuery)

- expose-loader 暴露到 window 上

  ```js
    ...
    module.exports = {
      ...
      module: {
        rules: [
          ...
          {
             test:require.resolve('jquery'),
             use:'expose-loader?$'
          },
          ...
        ]
      },
      ...
    }
  ```

- webpack.ProvidePlugin 给每个模块注入，但不在 window 上

  ```js
    ...
    module.exports = {
      ...
      plugins:[
        ...
        new webpack.ProvidePlugin({ // 在每个模块中都注入$
           $:'jquery'
        }),
        ...
      ],
      ...
    }
  ```

  

- 引入不打包

  ```html
    <!DOCTYPE html>
    <html lang="en">
    ...
     <script src="http://code.jquery.com/jquery-3.4.1.min.js"></script>
    </head>
    <body>
    ...
    </body>
    </html>
  ```

  ```js
    ...
    module.exports = {
      ...
      externals: { 	
          jquery: "$"
      },
      ...
    }
  ```




### 打包图片

- 在 javascript 中引入: file-loader, url-loader ...

  ```js
    import logo from './logo.png'; 
  ```

- 在 css 中引入: css-loader

  ```css
    div {
    	background: url('./image.png')
    }
  ```

- 在 html 中引入: html-withimg-loader

  ```html
    <img id="logo" src="./images/logo.jpg" />
  ```

### 模拟数据或与服务端配合

- 代理

  ```js
    ...
    module.exports = {
      ...
      devServer:{
        proxy:{
          '/api':{
            target:'http://localhost:3000'
          }
        }
      },
      ...
    }
  ```

- 使用 devServer 内置 express

  ```js
    ...
    module.exports = {
      ...
      before(app){
        app.get('/user',(req,res)=>{
          res.json({name:'docoder'})
        })
      },
      ...
    }
  ```

- 在服务端中启动webpack, 端口用服务端端口

  ```js
    let express = require('express');
    let app = express();
    let webpack = require('webpack');
    
    // 中间件
    let middle = require('webpack-dev-middleware');
    
    let config = require('./webpack.config.js');
    
    let compiler = webpack(config);
    
    app.use(middle(compiler));
    
    app.get('/user',(req,res)=>{
      res.json({name: 'docoder'})
    })
    
    app.listen(3000);
  ```

  