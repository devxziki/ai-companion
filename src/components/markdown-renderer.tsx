import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./code-block";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          pre({ children }) {
            // children is a <code> element with props from rehype-highlight
            const el: any = Array.isArray(children) ? children[0] : children;
            const className: string = el?.props?.className ?? "";
            const langMatch = /language-([\w-]+)/.exec(className);
            const language = langMatch?.[1];
            const raw = extractText(el?.props?.children);
            return (
              <CodeBlock code={raw} language={language}>
                <code className={className}>{el?.props?.children}</code>
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function extractText(node: any): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node.props?.children) return extractText(node.props.children);
  return "";
}
