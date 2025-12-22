/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ExtraProps } from 'react-markdown';
import ReactPlayer from 'react-player';
import Button from '@mui/material/Button';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

//this is syntax theme
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism'; //jest doesnt support esm

import { getCleanAttributes } from './ImagePlugin';
import CollapsibleThing from './CollapsibleThing';
import CollapsibleTOC, { TOC_LINK_CLICK } from './CollapsibleTOC';
import MDMuiAlert from './components/MDMuiAlert';

import { AuContextProps } from '@rapid-cmi5/cmi5-build-common';

import EmbeddedQuiz from './EmbeddedQuiz';
import MarkdownImage from './MarkdownImage';
import { SlideEvent } from './constants/SlideEvents';
import MDTextEffects from './components/MDTextEffects';
import MDAnimation from './components/MDAnimation';

/**
 * Take an html-like tag and extract its attributes into a record of key-value
 * pairs.
 * Example:  <my-tag foo="bar" tick="tack">
 *   becomes
 *   {
 *     foo: "bar",
 *     tick: "tack",
 *   }
 * @param node
 */
const extractAttributes = (node: any) => {
  const attributes: Record<string, string> = {};
  if (node?.properties) {
    for (const [key, value] of Object.entries(node.properties)) {
      if (typeof value === 'string') {
        attributes[key] = value;
      }
    }
  }
  return attributes;
};

/**
 * Convert an inline style string into a JS object.
 * @param style
 */
const parseStyleString = (style: string): React.CSSProperties => {
  return Object.fromEntries(
    style
      .split(';')
      .filter(Boolean)
      .map((rule) => {
        const [key, value] = rule.split(':');
        const camelCaseKey = key
          .trim()
          .replace(/-([a-z])/g, (_, char) => char.toUpperCase());

        return [camelCaseKey, value ? value.trim() : ''];
      }),
  );
};

const parseYoutubeLinks = (
  props: React.ClassAttributes<HTMLAnchorElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> &
    ExtraProps,
) => {
  //REF obsolete
  //   if (props.children === 'RangeOS Scenario Deployment') {
  //     return <ScenarioConsoles {...props} />;
  //   }
  if (props.href?.includes('youtube')) {
    return (
      <ReactPlayer
        controls={true}
        muted={true}
        width="100%"
        className="mx-auto hover:brightness-105 relative"
        url={props.href}
      ></ReactPlayer>
    );
  }

  // if TOC link, don't set target to _blank
  if (props.className === 'toc-link') {
    return (
      <a
        {...props}
        className="toc-link"
        style={{ textDecoration: 'none' }}
        onClick={() => {
          window.dispatchEvent(new Event(TOC_LINK_CLICK));
        }}
      />
    );
  }

  // Base case return normal link
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return (
    <a
      {...props}
      target="_blank"
      className="slide-link"
      style={{ textDecoration: 'none' }}
    />
  );
};

/**
 * Converts html and custom tags to React Components
 * uses remark for markdown
 * uses rehype for html
 * uses react-mark which follows CommonMark standardization
 * Make sure to use blank lines around block-level HTML that again contains markdown!
 * keys in filter below are HTML equivalents
 * https://github.com/remarkjs/react-markdown
 * based on filters comfiguration
 *
 * NOTE: inline style attributes are pass through for any tag not specifically
 * handled below. For any tag below, styles MUST be handled manually.
 *
 * @returns
 */
export const customMarkdownParser = (
  auProps?: AuContextProps,
  lookupState?: any,
) => {
  const filter = {
    div: (props: any) => {
      const { node, className, children } = props;

      if (className && className.includes('quizdown')) {
        if (!auProps) return;
        const { quizNumber } = props;

        return (
          <EmbeddedQuiz auProps={auProps} quizNumber={quizNumber}>
            {children}
          </EmbeddedQuiz>
        );
      }

      if (className && className.includes('admonition')) {
        const admonitionType = className.replace('admonition', '').trim();
        return (
          <MDMuiAlert admonitionType={admonitionType}>{children}</MDMuiAlert>
        );
      }
      if (className?.includes('collapsible')) {
        const defaultOpen = className.includes('defaultOpen');
        const admonitionType = className
          .replace('collapsible', '')
          .replace('defaultOpen', '')
          .trim();
        return (
          <CollapsibleThing
            keyPrefix="accordion"
            lookupState={lookupState}
            admonitionType={admonitionType}
            defaultOpen={defaultOpen}
          >
            {children}
          </CollapsibleThing>
        );
      }
      if (className?.includes('toc-container')) {
        return (
          <CollapsibleTOC
            slideNumber={auProps?.activeTab || 0}
            lookupState={lookupState}
          >
            {children}
          </CollapsibleTOC>
        );
      }

      // handle inline styles
      const styleAttr = node.properties?.style as string;
      const styleObj = styleAttr ? parseStyleString(styleAttr) : {};

      return (
        <div className={className} style={styleObj}>
          {children}
        </div>
      );
    },

    fx: (props: any) => {
      const { children, node } = props;
      const attributes = extractAttributes(node);
      return <MDTextEffects {...attributes}>{children}</MDTextEffects>;
    },

    animate: (props: any) => {
      const { children, node } = props;
      const attributes = extractAttributes(node);
      return <MDAnimation {...attributes}>{children}</MDAnimation>;
    },

    button: (props: any) => {
      const { children, node } = props;
      const attributes = extractAttributes(node);
      return (
        <Button
          variant="outlined"
          {...attributes}
          onClick={(e: any) => {
            e.stopPropagation();
            // console.log('click', attributes);
            window.dispatchEvent(
              new CustomEvent(SlideEvent.ButtonClick, { detail: attributes }),
            );
          }}
        >
          {children}
        </Button>
      );
    },

    code: (props: any) => {
      const { children, className, node, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');

      const isMultiLine =
        children && children.indexOf('\n') >= 0 ? true : false;

      return isMultiLine ? (
        <SyntaxHighlighter
          language={match ? match[1] : 'en'}
          PreTag="div"
          //REF children={String(children).replace(/\n$/, "")}
          children={children}
          {...props}
          showLineNumbers={true}
          style={okaidia}
        />
      ) : (
        <code {...props} style={okaidia} className="inline-code">
          {children}
        </code>
      );
    },

    img: (props: any) => {
      const { node, src, alt, moreAttributes } = props;

      return (
        <MarkdownImage
          node={node}
          src={src}
          alt={alt}
          moreAttributes={moreAttributes}
          auProps={auProps}
          parseStyleString={parseStyleString}
        />
      );
    },
    // span(props) {
    //   console.log("Found span")
    //   return parseImageGroups(props);
    // },

    a: (props: any) => {
      return parseYoutubeLinks(props);
    },

    table: (props: any) => {
      const { children, node } = props;
      // console.log('table props', props);

      let slideW = 'auto';

      if (
        lookupState &&
        Object.prototype.hasOwnProperty.call(lookupState, 'slideWidth')
      ) {
        slideW = lookupState.current['slideWidth'];
      }

      const cleanProperties = getCleanAttributes(node.properties);
      return (
        <div style={{ width: slideW, overflow: 'auto' }}>
          <table {...cleanProperties}>{children}</table>
        </div>
      );
    },

    col: (props: any) => {
      const { children, node } = props;
      const cleanProperties = getCleanAttributes(node.properties);
      return <col {...cleanProperties}>{children}</col>;
    },
  };

  return filter;
};
