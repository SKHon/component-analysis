/**
 * 描述一下实现思路：1. 读取源代码文件
 *                2. 利用两个babel插件@babel/plugin-transform-destructuring 和 removeVD（自己写的）进行一次代码编译，去掉解构和let const var，方便后续查找AST
 *                3. 遍历语法树，然后再用一个插件analysis来统计用到指定组件库的组件个数
 *                4. 返回结果
 *
 */

require("@babel/polyfill");
// let parser = require("@babel/parser");
let fs = require("fs");
const path = require("path");
// let analysis = require("./src/analysis");
let babel = require("@babel/core");
// let generator = require("@babel/generator");
// let traverse = require("@babel/traverse");

// 只解析这4个类型的文件
let fileType = ["js", "jsx", "ts", "tsx"];

//设置根目录
let root = process.argv[2].split("=")[1];

let libArray = process.argv[3].split("=")[1].split(",");

let outpath = process.argv[4].split("=")[1];

let projectName = process.argv[5].split("=")[1];

/**
 *
 *
 */

let outputJson = {
    project: projectName,
    countDateAt: 0,
    detail: []
};

if (!root) {
    console.log("请输入遍历目录的路径");
    return;
}

//let libArray = ["antd", "cutter", "lodash"];
// 用来记录一下遍历的路径

//调用函数遍历根目录，同时传递 文件夹路径和对应的数组
//请使用同步读取

fileDisplay(root);
//读取完毕则写入到txt文件中

function fileDisplay(dirPath) {
    var filesList = fs.readdirSync(dirPath);

    for (var i = 0; i < filesList.length; i++) {
        //描述此文件/文件夹的对象
        var fileObj = {};
        fileObj.name = filesList[i];
        //拼接当前文件的路径(上一层路径+当前file的名字)
        var filePath = path.join(dirPath, filesList[i]);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        var stats = fs.statSync(filePath);

        // if (
        //     i === filesList.length - 1 &&
        //     dirPath === root &&
        //     !stats.isDirectory()
        // ) {
        //     console.log(filesList[i]);
        //     console.log("第一层最后一个是文件夹，则结束");
        // }
        if (stats.isDirectory() && filesList[i] !== "node_modules") {
            //如果是文件夹
            fileObj.type = "dir";
            fileObj.child = [];
            // arr.push(fileObj);
            //递归调用
            fileDisplay(filePath);
        } else {
            //不是文件夹,则添加type属性为文件后缀名
            fileObj.type = path.extname(filesList[i]).substring(1);
            //console.log(fileObj.type);
            if (fileType.indexOf(fileObj.type) !== -1) {
                new Promise(function(resolve, reject) {
                    fileParser(filePath, libArray, resolve);
                }).then(function(res) {
                    // res = { antd:[{component:'Button',count: 3},{component:'Input',count: 4}] }

                    if (Object.keys(res).length) {
                        for (let key in res) {
                            if (checkInclude(outputJson.detail, key)) {
                                update(key, res[key]);
                            } else {
                                add(key, res[key]);
                            }
                        }
                    }
                    fs.writeFileSync(outpath, JSON.stringify(outputJson));
                });
            }
        }
    }
}

/**
 *
 * @param filePath:string              文件路径
 * @param uiLibArray:Array<string>     要统计的ui-lib
 *
 *   */
function fileParser(filePath, uiLibArray, resolve) {
    const code = fs.readFileSync(filePath, { encoding: "utf8" });

    let newcode = babel.transform(code, {
        presets: ["@babel/preset-react", "@babel/preset-flow"],
        plugins: ["@babel/plugin-transform-destructuring", "./src/removeVD.js"]
    }).code;

    babel.transform(
        newcode,
        {
            plugins: [
                [
                    "./src/analysis.js",
                    {
                        input: uiLibArray,
                        output: []
                    }
                ]
            ]
        },
        function(err, result) {
            if (!err) {
                let res = {};

                //console.log(result.options.plugins[0].options.output);
                result.options.plugins[0].options.output.forEach(element => {
                    res[element.uiLib] = res[element.uiLib] || [];
                    let obj = {};
                    obj.componentName = element.useComponent.before;
                    obj.totalCount = element.count;
                    if (obj.componentName) {
                        res[element.uiLib].push(obj);
                    }
                });
                resolve(res);
                //console.log("==>", JSON.stringify(res));
                // for (let key in res) {
                //     detail.push({ uiLibName: key, comUseDetail: res[key] });
                //     console.log("=======>", JSON.stringify(detail));
                // }
                // if (Object.keys(res).length) {
                //     fs.appendFileSync(
                //         outpath,
                //         JSON.stringify({ path: filePath, info: res }) + "\n",
                //         err => {
                //             if (err) {
                //                 throw err;
                //             }
                //         }
                //     );
                // }
            }
        }
    );
}

/**
 * source: Array      [{uiLibName: 'cutter-ui',totalCount: 20,comUseDetail: [{componentName: 'Button',totalCount: 20},{}]}]
 * item: Object       {uiLibName: [{component: 'Button',count: 10},{component: 'Input',count: 20}]}
 *  */
function checkInclude(source, key) {
    if (source.length) {
        for (let i = 0; i < source.length; i++) {
            if (source[i].uiLibName === key) {
                return true;
            }
        }
    }
    return false;
}

function update(key, componentList) {
    let newComponentList = [];
    for (let i = 0; i < outputJson.detail.length; i++) {
        if (key === outputJson.detail[i].uiLibName) {
            let components = delRepeat(componentList);
            // componentList  outputJson.detail[i]
            components.forEach(function(item) {
                outputJson.detail[i].totalCount += item.totalCount;
                newComponentList.push({
                    componentName: item.componentName,
                    totalCount: item.totalCount
                });
            });

            outputJson.detail[i].comUseDetail = delRepeat(
                newComponentList.concat(outputJson.detail[i].comUseDetail)
            );
        }
    }
}

/**
 * source: Array      [{uiLibName: 'cutter-ui',totalCount: 20,comUseDetail: [{componentName: 'Button',totalCount: 20},{}]}]
 * item: Object       {uiLibName: [{component: 'Button',count: 10},{component: 'Input',count: 20}]}
 *  */
function add(key, componentList) {
    let item = {};
    let uiLibName = key;
    let totalCount = 0;
    let comUseDetail = [];

    let components = delRepeat(componentList);
    components.forEach(function(element) {
        comUseDetail.push({
            componentName: element.componentName,
            totalCount: element.totalCount
        });
        totalCount += element.totalCount;
    });

    item.uiLibName = uiLibName;
    item.totalCount = totalCount;
    item.comUseDetail = comUseDetail;
    outputJson.detail.push(item);
}

//去重，防止一个文件统计出来有相同的组件
// [{ "component": "Button", "count":3},{ "component": "Button", "count":4}]
// ==>[{ "component": "Button", "count":7}]

function delRepeat(comList) {
    let names = [];
    let container = [];
    comList.forEach(function(item) {
        if (names.indexOf(item.componentName) === -1) {
            names.push(item.componentName);
            container.push(item);
        } else {
            for (let key in container) {
                if (container[key].componentName === item.componentName) {
                    container[key].totalCount += item.totalCount;
                }
            }
        }
    });
    return container;
}
