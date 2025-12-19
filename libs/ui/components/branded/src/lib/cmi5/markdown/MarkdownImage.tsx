import { AuContextProps } from '@rapid-cmi5/cmi5-build/common';
import { useEffect, useState } from 'react';
import { parseAttributeList } from './ImagePlugin';

export default function MarkdownImage({
  src,
  node,
  alt,
  auProps,
  moreAttributes,
  parseStyleString,
}: {
  node: any;
  src: any;
  alt: any;
  auProps?: AuContextProps;
  moreAttributes: any;
  parseStyleString: (style: string) => object;
}) {
  const [url, setUrl] = useState(src);

  useEffect(() => {
    // Deal with local images in rapid cmi5
    if (
      typeof src !== 'string' ||
      (!src.startsWith('./') && !src.startsWith('../'))
    ) {
      return;
    }

    const loadImage = async () => {
      if (auProps && auProps?.au?.dirPath) {
        const blobUrl =
          (await auProps.getLocalImage?.(src, auProps.au?.dirPath)) ?? null;
        setUrl(blobUrl);
      }
    };

    loadImage();
  }, []);

  // handle tag styles, like
  // {: style="width:200px;height:300px;"}
  let theAttributes = {};
  if (moreAttributes) {
    theAttributes = parseAttributeList(moreAttributes);
    const theProps = getPropsNoAttributes(node.properties);
    return <img alt={alt} {...theProps} {...theAttributes} src={url} />;
  }

  // handle inline styles
  const styleAttr = node.properties?.style as string;
  const styleObj = styleAttr ? parseStyleString(styleAttr) : {};
  return <img alt={alt} {...node.properties} style={styleObj} src={url} />;
}

const getPropsNoAttributes = (props: any) => {
  const { moreAttributes, ...rest } = props;
  return rest;
};
