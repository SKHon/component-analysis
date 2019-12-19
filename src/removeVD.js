module.exports = function(api) {
    return {
        visitor: {
            VariableDeclaration(path) {
                if (
                    path.node.kind === "let" ||
                    path.node.kind === "const" ||
                    path.node.kind === "var"
                ) {
                    path.node.kind = "";
                }
            }
        }
    };
};
