import { JSDOM } from "jsdom";

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="root"></div></body></html>',
  {
    url: "http://localhost",
  },
);

Object.defineProperty(global, "window", {
  value: dom.window,
  configurable: true,
  writable: true,
});
Object.defineProperty(global, "document", {
  value: dom.window.document,
  configurable: true,
  writable: true,
});
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
global.localStorage = {
  store: {},
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: any) {
    this.store[key] = value.toString();
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
} as any;
