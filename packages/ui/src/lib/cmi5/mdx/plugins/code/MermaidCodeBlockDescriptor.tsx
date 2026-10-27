import {
  CodeBlockEditorDescriptor,
  CodeBlockEditorProps,
} from '@mdxeditor/editor';
import { MermaidDiagram } from './MermaidDiagram';

/**
 * Renders ```mermaid fenced code blocks as diagrams (editor + player).
 * Display only for now — source is edited via source mode.
 * Priority must beat the codeMirrorPlugin descriptor (priority 1), which also
 * matches 'mermaid' since it is in the codemirror language list.
 */
export const MermaidCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  priority: 2,
  match(language: string | null | undefined) {
    return language === 'mermaid';
  },
  Editor: (props: CodeBlockEditorProps) => {
    return <MermaidDiagram code={props.code} />;
  },
};
