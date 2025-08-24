import * as Y from "yjs";

const extractPlainText = (fragment: Y.XmlFragment) => {
  let text = "";

  fragment.toArray().forEach((node: any) => {
    if (node instanceof Y.XmlText) {
      text += node.toString();
    } else if (node instanceof Y.XmlElement || node instanceof Y.XmlFragment) {
      text += extractPlainText(node);
    }

    text += " ";
  });

  return text.trim();
};

export const byteaToText = (byteaBuffer: Uint8Array<ArrayBufferLike>) => {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, byteaBuffer);

  const title = doc.getText("title").toString();
  const content = doc.getXmlFragment("document-info");

  const plainText = extractPlainText(content);

  return `${title}\n\n${plainText}`;
};
