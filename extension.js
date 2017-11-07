const { languages, Uri, DocumentLink, Range } = require('vscode');
const path = require('path');

exports.activate = function (context) {
    const disposable = languages.registerDocumentLinkProvider(['javascript', { pattern: '**/package.json' }], {
        provideDocumentLinks(document, token) {
            const pkg = JSON.parse(document.getText());
            const { 
                dependencies = {}, 
                devDependencies = {}, 
                optionalDependencies = {},
                peerDependencies = {},
            } = pkg;

            const links = [];
            let lineIndex = 0;

            function extractLink(line, package, version) {
                if (line.text.match(package, version)) {
                    const startCharacter = line.text.indexOf(package);
                    const endCaracter = startCharacter + package.length;
                    const linkRange = new Range(lineIndex, startCharacter, lineIndex, endCaracter);
                    const linkUri = Uri.parse(`https://www.npmjs.com/package/${package}`);
                    links.push(new DocumentLink(linkRange, linkUri));
                }
            }
            
            while (lineIndex < document.lineCount) {
                const line = document.lineAt(lineIndex);

                [
                    ...Object.entries(dependencies),
                    ...Object.entries(devDependencies),
                    ...Object.entries(optionalDependencies),
                    ...Object.entries(peerDependencies)
                ].forEach(([package, version]) => {
                    extractLink(line, package, version);
                });
                    
                lineIndex += 1;
            }

            return links;
        }
    });

    context.subscriptions.push(disposable)
};

exports.deactivate = function () {
};