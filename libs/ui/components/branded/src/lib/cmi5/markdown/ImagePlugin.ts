import { visit } from 'unist-util-visit';
import { debugLog } from '../../utility/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const h = require('hastscript');

const attributeListRegEx = /(?:{):(.+)}/g;
const debugMe = true;

export const imagePlugin = () => {
  function transformer(tree: any) {
    visit(tree, 'image', (node, position = -1, parent) => {
      const definition = [];

      //console.log('imagePlugin node', node);

      if (parent.children && parent.children.length > 0) {
        //console.log('childs', parent.children);

        //find my position
        for (let i = 0; i < parent.children.length; i++) {
          const child = parent.children[i];
          //console.log(child.position.start.offset, node.position.start.offset);
          if (child.position.start.offset === node.position.start.offset) {
            //check to see if next child is a style element

            const nextChild = i + 1;
            //console.log('check for style', nextChild);
            if (nextChild <= parent.children.length - 1) {
              const nextSibling = parent.children[nextChild];
              //console.log('check', nextSibling);
              if (
                nextSibling.type === 'text' &&
                nextSibling.value.startsWith('{:')
              ) {
                //console.log('found attribute list');
                //const moreAttributes = parseAttributeList(nextSibling.value);

                definition.push({
                  ...node,
                  type: 'attr', //was image but i cant get properties moreAttributes over
                  tagName: 'img',
                  moreAttributes: nextSibling.value,
                });
                const last = parent.children.slice(i + 2);
                parent.children = parent.children.slice(0, i);
                parent.children = parent.children.concat(definition);
                parent.children = parent.children.concat(last);
              }
            }
            break;
          }
        }
      }
    });
  }

  return transformer;
};

//REF
// const htmlDecode = (input: string) => {
//   const doc = new DOMParser().parseFromString(input, 'text/html');
//   return doc.documentElement.textContent;
// };

/**
 * probably needs to be different
 * @param input
 * @returns
 */
const unescapeHex = (input: string) => {
  return input.replace('\\#', '#');
};

/**
 * Replaces style attributes and refeeds them back into node
 * @param nodeProperties 
 * @returns 
 */
export const getCleanAttributes = (nodeProperties: any) => {
  let theAttributes = {};
  if (nodeProperties.style) {
    if (typeof nodeProperties.style === 'string') {
      const inlineAttributes = `{: style="${nodeProperties.style}"}`;
      theAttributes = parseAttributeList(inlineAttributes);
      const clean = { ...nodeProperties };
      delete clean['style'];
      return { ...clean, ...theAttributes };
    }
  }
  return undefined;
};

/**
 * Supports syntax to defining attributes on an Img Tag
 * Inspired by https://python-markdown.github.io/extensions/attr_list/
 * Working Example ![](https://picsum.photos/200){: style="height:300px;"}
 * TODO Needs hardeninging and performance tuning!
 * @param attributesStr
 * @returns
 */
export const parseAttributeList = (attributesStr: string) => {
  if (!attributesStr) {
    return {};
  }

  //console.log('parseAttributeList', attributesStr);
  const matches = [...attributesStr.matchAll(attributeListRegEx)];
  let theProps: { [key: string]: any } = {};

  if (matches && matches.length > 0) {
    for (const match of matches) {
      if (Object.prototype.hasOwnProperty.call(match, 1)) {
        let propStr: string = match[1];
        //Ex 'style="color:blue;font-size:46px;"id="something"';
        propStr = propStr.replace(' ', '');

        try {
          const propArr = propStr.split('"');
          //console.log('arr', propArr);
          let classProp = 'test';

          for (let i = 0; i < propArr.length; i++) {
            if (propArr[i]) {
              const indexEq = propArr[i].indexOf('=');
              if (indexEq > 0) {
                // root property
                classProp = propArr[i].substring(0, indexEq).replace(' ', '');
                //console.log('--classProp--', classProp);
              } else {
                // root value

                const cleanValue = propArr[i].trim();
                //console.log('potential value*' + cleanValue + '*');

                //empty

                if (!cleanValue) {
                  //console.log('skip empty');
                  continue;
                }
                //string
                if (cleanValue.indexOf(';') < 0) {
                  //dont replace nested data with string
                  if (
                    !Object.prototype.hasOwnProperty.call(theProps, classProp)
                  ) {
                    theProps[classProp] = propArr[i];
                  }

                  continue;
                }

                //nested properties
                //console.log('start obj');
                theProps[classProp] = {};
                const classPropValues = propArr[i].split(';');

                for (let j = 0; j < classPropValues.length; j++) {
                  const entry = classPropValues[j].trim();
                  if (!entry) {
                    continue;
                  }
                  //ex. color:blue
                  if (classPropValues[j]) {
                    const props = classPropValues[j].split(':');
                    if (props.length === 2) {
                      theProps[classProp][props[0]] = unescapeHex(props[1]);
                    } else if (props.length === 1) {
                      //console.log('*' + classProp + '*', '*' + props[0] + '*');
                      theProps[classProp] = unescapeHex(props[0]);
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          debugLog('error parsing properties', propStr);
        }
      }
    }
  }

  return theProps;
};
