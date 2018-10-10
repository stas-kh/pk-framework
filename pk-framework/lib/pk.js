(function () {
    'use strict';

    const PK = (obj) => {
        if (!obj.ctrl) {
            throw new Error('Please ensure that controller is passed to the PK framework');
        }

        const rootNode = document.querySelector(`[pk-ctrl='${obj.ctrl}']`);
        const PKIntance = {
            ...obj.methods,
            ...obj.hooks
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

                    reflectValuesOnView(prop, value, false);
                    bindControlsToModel(prop);
                }
            }
        };

        const bindControlsToModel = (prop) => {
            iterate(`[pk-model='${prop}']`, (node) => {
                if (isInputElement(node)) {
                    node.addEventListener('input', ($event) => PKIntance[prop] = $event.target.value);
                } else {
                    throw new Error(`The 'pk-model' attribute can be used only on inputs and textareas`);
                }
            });
        };

        const reflectValuesOnView = (prop, value, forceUpdate = true) => {
            iterate(`[pk-model='${prop}']`, (node) => {
                node.value = value;
            });

            iterate(`[pk-bind='${prop}']`, (node) => {
                node.innerHTML = value;
            });

            if (forceUpdate) {
                update();
            }
        };

        const isInputElement = ({type}) => {
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
                    const name = getFunctionNameFromAttribute(node, 'pk-oncheck');
                    PKIntance[name].call(PKIntance, node.checked);
                    update();
                };
            });

            iterate(`[pk-onclick]`, (node) => {
                node.onclick = () => {
                    const { name, args } = parseFunctionString(node, 'pk-onclick');
                    PKIntance[name].apply(PKIntance, args);
                    update();
                };
            });

            iterate(`[pk-onsubmit]`, (node) => {
                node.onsubmit = (e) => {
                    const { name, args } = parseFunctionString(node, 'pk-onsubmit');
                    PKIntance[name].apply(PKIntance, args);
                    e.preventDefault();
                    update();
                };
            });
        };

        const parseFunctionString = (node, attr) => ({
            name: getFunctionNameFromAttribute(node, attr),
            args: getArguments(node, attr)
        });

        const getFunctionNameFromAttribute = (node, attr) => {
            return node.getAttribute(attr).match(/^[^(]*/g)[0];
        };

        const getArguments = (node, attr) => {
            const attrVal = node.getAttribute(attr);
            const parsedArgs = attrVal.match(/\(\s*([^)]+?)\s*\)/);

            return parsedArgs ? parsedArgs[1].split(',') : undefined;
        };

        const handleLoops = () => {
            iterate(`[pk-for]`, (node) => {
                const {loopThrough, item} = getLoopDetails(node.getAttribute('pk-for'));
                const parent = node.parentNode;

                iterate('[pk-iterator]', (node) => parent.removeChild(node));

                if (Array.isArray(PKIntance[loopThrough])) {
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
                }

                node.setAttribute('pk-hidden', '');
            });
        };

        const isObject = (item) => {
            return (typeof item === "object" && !Array.isArray(item) && item !== null);
        };

        const getLoopDetails = (loopAttr) => {
            const [item, loopThrough] = loopAttr.split(' in ');
            return { item, loopThrough };
        };

        const iterate = (selector, fn) => {
            rootNode.querySelectorAll(selector).forEach(e => fn.call(this, e));
        };

        const callHook = (hook) => {
            if (PKIntance.hasOwnProperty(hook) && typeof PKIntance[hook] === 'function') {
                PKIntance[hook].call(PKIntance);
            }
        };

        const init = () => {
            decorateProperties();
            callHook('onCreated');
            update();
            callHook('onMounted');
        };

        const update = () => {
            handleLoops();
            handleActions();
            handleStatements();
            callHook('onUpdate');
        };

        init();

        return PKIntance;
    };

    if (window.PK) {
        throw new Error('Seems you have already included the PK library. Please check your scripts section');
    } else {
        window.PK = PK;
    }

    const appendStyles = () => {
        const style = document.createElement('style');

        style.type = 'text/css';
        style.appendChild(document.createTextNode`
        [pk-hidden], [pk-for] { 
            display: none !important; 
        }
    `);

        document.head.appendChild(style);
    };

    appendStyles();

}());