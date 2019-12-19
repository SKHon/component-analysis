module.exports = function(opts) {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                if (state.opts.input.indexOf(path.node.source.value) !== -1) {
                    // 根据传入的uiLib，收集该文件用了哪些uiLib
                    path.node.specifiers.forEach(element => {
                        let obj = {};
                        obj.uiLib = path.node.source.value;

                        obj.useComponent = {
                            before: element.imported
                                ? element.imported.name
                                : null,
                            after: element.local.name
                        };

                        // obj.filePath = state.opts.filePath;
                        obj.count = 0;
                        state.opts.output.push(obj);
                        // console.log(`yinyong: ${element.local.name}`);
                    });
                }
                //console.log(`import: ${path.node.source.value}`);
            },
            CallExpression(path, state) {
                if (state.opts.output.length) {
                    state.opts.output.map(element => {
                        if (
                            path.node.callee &&
                            path.node.callee.object.name === "React" &&
                            path.node.callee.property.name === "createElement"
                        ) {
                            if (
                                path.node.arguments[0].name ===
                                element.useComponent.after
                            ) {
                                element.count++;
                            }
                        }
                        return element;
                        // if (
                        //     path.node.name.name === element.useComponent.after
                        // ) {
                        //     element.count++;
                        // }
                        // return element;
                    });
                }
            },
            // 处理赋值语句
            AssignmentExpression(path, state) {
                let newNode = [];
                if (state.opts.output.length) {
                    state.opts.output.map(element => {
                        if (
                            path.node.right &&
                            path.node.right.name &&
                            path.node.right.name === element.useComponent.after
                        ) {
                            element.useComponent.after = path.node.left.name;
                        }
                        if (
                            !element.useComponent.before &&
                            path.node.right &&
                            path.node.right.object &&
                            path.node.right.property &&
                            element.useComponent.after ===
                                path.node.right.object.name
                        ) {
                            let newObj = {};
                            newObj.uiLib = element.uiLib;
                            //newObj.filePath = element.filePath;
                            newObj.count = 0;
                            newObj.useComponent = {
                                before: path.node.right.property.name,
                                after: path.node.left.name
                            };
                            newNode.push(newObj);
                        }
                        return element;
                    });
                    // console.log(`component: ${path.node.name.name}`);
                }
                state.opts.output = state.opts.output.concat(newNode);
                //console.log(`exp: ${path.node.left.name}`);
            }
            // Identifier(path, state) {
            //     if (path.parent.type === "AssignmentExpression") {
            //         console.log(path.node.name);
            //     }
            // }
        }
    };
};
