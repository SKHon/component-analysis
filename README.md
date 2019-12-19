## 使用方法

```
1. 安装依赖
npm i

2. 执行index.js文件
node index.js --project_uri="/Users/lianjia/Desktop/my notes/node/demo/componentAnalysis/test" --lib_list="cutter-ui,button-ui,antd,ccc_ui" --output_uri="/Users/lianjia/Desktop/my notes/node/demo/componentAnalysis/result.json" --project_name="projectABc"
```

## 目录介绍

/src： 两个 babel 插件代码
/test：测试模拟项目源代码路径
.gitignore: git 提交时忽略文件或文件夹的配置文件
command: 用来记录调用命令文件（只是单纯记录，方便后续 copy）
README.md: 项目介绍
index.js: 主要实现统计组件功能
result.json: 是将统计结果输出到该文件中

## 实现思路

1. 根据命令传入的目录参数，递归遍历该目录及子目录下所有的文件和问价夹。对于文件夹不做任何操作，如果是文件（.js, .jsx, .ts, .tsx）这四类文件进行解析。

2. 对单个文件解析的时候，就需要用到插件了，一共用到三个插件，两个是我自己写的，一个是 babel 官方的。这三个插件分别是：
    - @babel/plugin-transform-destructuring （这个是官方对，主要是解构）
    - removeVD (这个是自己写的，用来删除 VariableDeclaration,变量申明)
    - analysis (这个是我自己写的，用来分析文件中特定组件库的组件使用情况)
