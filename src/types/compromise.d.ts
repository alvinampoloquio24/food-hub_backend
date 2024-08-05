declare module "compromise" {
  interface Document {
    splitAfter(delimiter: string): Document;
    out(format: string): string[];
  }

  function nlp(text: string): Document;

  export default nlp;
}
