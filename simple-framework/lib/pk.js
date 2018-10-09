(function () {
    'use strict';

    const PK = (obj) => {
        if (!obj.ctrl) {
            throw new Error('Please ensure that controller is passed to the PK framework');
        }

        const root = document.querySelector(`[pk-ctrl='${obj.ctrl}']`);
        const PKIntance = {
            ...obj.methods
        };

        const decorateProperties = () => {
            for (let prop in obj.data) {
                if (obj.data.hasOwnProperty(prop)) {
                    let value = obj.data[prop];

                    Object.defineProperty(PKIntance, prop, {
                        get() {
                            return value;
                        },
                        set(newValue) {
                            value = newValue;
                            reflectValuesOnView(prop, newValue);
                        }
                    });

                    reflectValuesOnView(prop, value);
                    bindControlsToModel(prop);
                }
            }
        };

        const bindControlsToModel = (prop) => {
            iterate(`[pk-model='${prop}']`, (node) => {
                if (isInputElement(node)) {
                    node.addEventListener('input', ($event) => PKIntance[prop] = $event.target.value);
                }
            });
        };

        const reflectValuesOnView = (prop, value) => {
            iterate(`[pk-model='${prop}']`, (node) => {
                node.value = value;
            });

            iterate(`[pk-bind='${prop}']`, (node) => {
                node.innerHTML = value;
            });
        };

        const isInputElement = ({ type }) => {
            return type && type === 'text' || type === 'textarea';
        };

        const handleStatements = () => {
            iterate(`[pk-if]`, (node) => {
                const attrVal = node.getAttribute('pk-if');
                if (attrVal === 'true' || attrVal === 'false') {
                    node.style.display = (attrVal === 'true') ? 'initial' : 'none';
                } else if (PKIntance[attrVal] !== undefined) {
                    node.style.display = !!(PKIntance[attrVal]) ? 'initial' : 'none';
                } else {
                    node.style.display = 'none';
                }
            });
        };

        const handleActions = () => {
            iterate(`[pk-oncheck]`, (node) => {
                node.onchange = () => {
                    PKIntance[getFunctionNameFromAttribute(node, 'pk-oncheck')].call(PKIntance, node.checked);
                    update();
                };
            });

            iterate(`[pk-onclick]`, (node) => {
                node.onclick = () => {
                    const attrVal = node.getAttribute('pk-onclick');
                    const functionName = attrVal.match(/^[^(]*/g)[0];

                    const parsedArgs = attrVal.match(/\(\s*([^)]+?)\s*\)/);
                    const args = parsedArgs ? parsedArgs[1].split(',') : undefined;

                    PKIntance[functionName].apply(PKIntance, args);
                    update();
                };
            });

            iterate(`[pk-onsubmit]`, (node) => {
                node.onsubmit = (e) => {
                    PKIntance[getFunctionNameFromAttribute(node, 'pk-onsubmit')].call(PKIntance);
                    e.preventDefault();
                    update();
                };
            });
        };

        const getFunctionNameFromAttribute = (node, attr) => {
            return node.getAttribute(attr).match(/^[^(]*/g)[0];
        };

        const handleLoops = () => {
            iterate(`[pk-for]`, (node) => {
                const { loopThrough, item } = getLoopDetails(node.getAttribute('pk-for'));
                const parent = node.parentNode;

                iterate('[pk-iterator]', (node) => parent.removeChild(node));

                PKIntance[loopThrough].forEach((element) => {
                    const nodeClone = node.cloneNode(true);

                    nodeClone.removeAttribute('pk-for');
                    nodeClone.removeAttribute('pk-hidden');
                    nodeClone.setAttribute('pk-iterator', '');

                    if (isObject(element)) {
                        nodeClone.innerHTML = nodeClone.innerHTML.replace(/{{ (.*?) }}/g, (...args) => {
                            const matcher = args[1].split('.')[1];
                            return element[matcher];
                        });
                    } else {
                        nodeClone.innerHTML = nodeClone.innerHTML.replace(`{{ ${item} }}`, element);
                    }
                    parent.appendChild(nodeClone);
                });

                node.setAttribute('pk-hidden', '');
            });

            handleActions();
        };

        const isObject = (item) => {
            return (typeof item === "object" && !Array.isArray(item) && item !== null);
        };

        const getLoopDetails = (loopAttr) => {
            const [item, loopThrough] = loopAttr.split(' in ');
            return { item, loopThrough };
        };

        const iterate = (selector, fn) => {
            root.querySelectorAll(selector).forEach(e => fn.call(this, e));
        };

        const appendStyles = () => {
            const style = document.createElement('style');

            style.type = 'text/css';
            style.appendChild(document.createTextNode`
                [pk-hidden] { 
                    display: none !important; 
                }
            `);

            document.head.appendChild(style);
        };

        const init = () => {
            appendStyles();
            decorateProperties();
            handleActions();
            update();
        };

        const update = () => {
            handleStatements();
            handleLoops();
            reflectValuesOnView();
        };

        init();

        return PKIntance;
    };

    if (window.PK) {
        throw new Error('Seems you have already included the PK library. Please check your scripts section');
    } else {
        window.PK = PK;
    }

}());