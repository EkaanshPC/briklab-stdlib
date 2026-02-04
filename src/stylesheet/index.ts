/**
 * # @briklab/lib/stylesheet
 * Create inline styles in JS/TS
 */

import JSTC from "../jstc/index";
import { CSSStyleDeclaration as UUIII } from "cssom";
/**
 * # InlineStyle
 * @classdesc Create a CSS Inline style.
 * @class
 */
export default class InlineStyle {
  /**
   * ## constructor
   * construct a InlineStyle
   */
  constructor(styleObject: { [key: string]: string }) {
    if (!JSTC.for([styleObject]).check(["object|undefined"])) {
      console.warn(`[InlineStyle class] @briklab/lib/stylesheet: Invalid first argument!
            Hint: The first argument must be a valid style object or not be given!
            Using {"imeMode":givenValue} as fallback`);
      styleObject = { imeMode: `${styleObject}` };
    }
    this.#styleObject = styleObject;
    this.#cssStyleDec = new UUIII();
  }
  #cssStyleDec: UUIII;
  generate() {
    let a = this.#cssStyleDec;
    let b = this.#styleObject;
    let c = Object.keys(b);
    let d = Object.values(b);
    for (let i = 0; i < c.length; i++) {
      let e = c[i];
      let f = d[i];
      a.setProperty(e, f);
    }
    return a.cssText;
  }
  get text() {
    return this.generate();
  }
  addStyleWithObject(styleObject: object) {
    if (!JSTC.for([styleObject]).check(["object"])) {
      console.warn(`[InlineStyle.addStyleWithObject] @briklab/lib/stylesheet: Invalid first argument!
            Hint: The first argument must be a valid style object or not be given!
            Using {"imeMode":givenValue} as fallback`);
      styleObject = { imeMode: styleObject };
    }
    this.#styleObject = { ...this.#styleObject, ...styleObject };
    this.generate();
    return this;
  }
  addStyleWithInlineCSS(inlineCSS: string) {
    if (!JSTC.for([inlineCSS]).check(["string"])) {
      console.warn(`[InlineStyle.addStyleWithInlineCSS] @briklab/lib/stylesheet: Invalid first argument!
        Hint: The first argument must be a valid inline css string!
        Returned with no operations.`);
      return this;
    }
    let s = new UUIII();
    s.cssText = this.#convertKeysToValidCSS(inlineCSS);
    let o: { [key: string]: string } = {};
    for (let i: number = 0; i < s.length; i++) {
      const a = s[i];
      const v = s.getPropertyValue(a);
      o[a] = v;
    }
    this.addStyleWithObject(o);
    return this;
  }
  #convertFieldToHyphenCase(string: string) {
    return string.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
  }
  #convertKeysToValidCSS(string: string) {
    let a = string.split(";");
    let c = "";
    for (let i = 0; i < a.length; i++) {
      let b = a[i];
      let [k, v] = b.split(":");
      k = k.trim();
      v = v.trim();
      c += `${this.#convertFieldToHyphenCase(k)}:${v};`;
    }
    return c;
  }
  removeStyle(styles: string[] | string) {
    if (!JSTC.for([styles]).check(["string[]|string"])) {
      console.warn(`[InlineStyle.removeStyle] @briklab/lib/stylesheet: Invalid first argument!
        Hint: The first argument must be a array of valid css properties or a single valid css property [accepts any string though]
        Returned with no operations.`);
      return this;
    }
    if (typeof styles === "string") {
      styles = [styles];
    }
    for (let i: number = 0; i < styles.length; i++) {
      let a = styles[i];
      delete this.#styleObject[a];
    }
  }
  applyTo(element: HTMLElement) {
    element.style.cssText = this.generate();
    return this;
  }

  #styleObject: { [key: string]: string };
}

export class StyleSheet {
  constructor() {
    this.#styles = {};
  }
#styles: { [key: string]: InlineStyle } 

  /**
   * Add or update a rule in the stylesheet.
   * @param name The rule name or selector (string).
   * @param style An InlineStyle instance.
   */
  set(name: string, style: InlineStyle) {
    if (!JSTC.for([name, style]).check(["string", "object"])) {
      console.warn(
        `[StyleSheet.set] @briklab/lib/stylesheet: Invalid arguments! ` +
        `Name must be string, style must be InlineStyle instance. Received: name=${name}, style=${style}`
      );
      return this;
    }
    if (!(style instanceof InlineStyle)) {
      console.warn(
        `[StyleSheet.set] @briklab/lib/stylesheet: Provided style is not an InlineStyle instance! ` +
        `Received: ${style}`
      );
      return this;
    }

    this.#styles[name] = style;
    return this;
  }

  /**
   * Get a rule by name.
   */
  get(name: string) {
    if (!JSTC.for([name]).check(["string"])) {
      console.warn(
        `[StyleSheet.get] @briklab/lib/stylesheet: Invalid argument! Name must be a string. Received: ${name}`
      );
      return undefined;
    }
    return this.#styles[name];
  }

  /**
   * Remove a rule by name.
   */
  remove(name: string) {
    if (!JSTC.for([name]).check(["string"])) {
      console.warn(
        `[StyleSheet.remove] @briklab/lib/stylesheet: Invalid argument! Name must be a string. Received: ${name}`
      );
      return this;
    }
    delete this.#styles[name];
    return this;
  }

  /**
   * Generate CSS text for the whole stylesheet.
   */
  generate(): string {
    let css = "";
    for (const key in this.#styles) {
      const style = this.#styles[key];
      if (style) {
        css += `${key} { ${style.text} }\n`;
      }
    }
    return css.trim();
  }

  /**
   * Export as a string for inline style usage or injection.
   */
  toString(): string {
    return this.generate();
  }
}