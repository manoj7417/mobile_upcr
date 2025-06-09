import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { promises, existsSync } from 'node:fs';
import { isRedirect, isNotFound, isPlainObject as isPlainObject$1, encode as encode$1 } from '@tanstack/router-core';
import U from 'tiny-invariant';
import { eventHandler as eventHandler$1, toWebRequest, getResponseStatus, getEvent, createStartHandler, defineHandlerCallback, transformReadableStreamWithRouter, transformPipeableStreamWithRouter, getHeaders } from '@tanstack/start-server-core';
import { startSerializer, createServerFn, mergeHeaders as mergeHeaders$2 } from '@tanstack/start-client-core';
import { createRouter as createRouter$2, createRootRoute, Link, createFileRoute, RouterProvider, lazyRouteComponent, redirect, useRouter, Outlet, HeadContent, Scripts, useRouteContext, useNavigate } from '@tanstack/react-router';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect, createContext as createContext$1, useRef, useContext } from 'react';
import { X, RotateCcw, Delete, Calendar, ChevronLeft, ChevronRight, DollarSign, RefreshCw, ArrowRightLeft, Globe, Clock } from 'lucide-react';
import { z } from 'zod';
import { Toaster, toast } from 'react-hot-toast';
import { pgEnum, pgTable, timestamp, text, boolean, serial, integer, decimal, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { XMarkIcon, PlusIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { PassThrough } from 'node:stream';
import { isbot } from 'isbot';
import ct from 'react-dom/server';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=g(e._destroy,t._destroy);}};function _(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function g(...n){return function(...e){for(const t of n)t(...e);}}const m=_();class A extends m{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E$1=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E$1,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function S(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const C=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(C.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function O$1(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:S(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== undefined) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== undefined) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== undefined) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, undefined, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(undefined);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== undefined) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => undefined);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== undefined) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : undefined;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : undefined;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === undefined ? undefined : await val;
      if (_body !== undefined) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, undefined);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, undefined);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, undefined)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, undefined, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, undefined, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, undefined, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === undefined && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i;
createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController: AbortController$1 });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {}
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","dir":"./public","base":"/","root":"D:\\mobile_upcr","order":0,"outDir":"D:/mobile_upcr/.vinxi/build/public"},{"name":"client","type":"client","target":"browser","handler":"app/client.tsx","base":"/_build","build":{"sourcemap":true},"root":"D:\\mobile_upcr","outDir":"D:/mobile_upcr/.vinxi/build/client","order":1},{"name":"ssr","type":"http","target":"server","handler":"app/ssr.tsx","link":{"client":"client"},"root":"D:\\mobile_upcr","base":"/","outDir":"D:/mobile_upcr/.vinxi/build/ssr","order":2},{"name":"server","type":"http","target":"server","base":"/_server","handler":"node_modules/@tanstack/start-server-functions-handler/dist/esm/index.js","root":"D:\\mobile_upcr","outDir":"D:/mobile_upcr/.vinxi/build/server","order":3}],"server":{"preset":"node-server","experimental":{"asyncContext":true}},"root":"D:\\mobile_upcr"};
				const buildManifest = {"client":{"_AnnouncementTicker.js":{"file":"assets/AnnouncementTicker.js","name":"AnnouncementTicker","imports":["_client2.js"]},"_ComingSoon.js":{"file":"assets/ComingSoon.js","name":"ComingSoon","imports":["_client2.js"]},"_DealRoom.js":{"file":"assets/DealRoom.js","name":"DealRoom","imports":["_client2.js"],"dynamicImports":["_browser.js"]},"_TenderForm.js":{"file":"assets/TenderForm.js","name":"TenderForm","imports":["_client2.js","___vite-browser-external.js"]},"___vite-browser-external.js":{"file":"assets/__vite-browser-external.js","name":"__vite-browser-external","isDynamicEntry":true},"_browser.js":{"file":"assets/browser.js","name":"browser","isDynamicEntry":true,"imports":["_client2.js"]},"_client.css":{"file":"assets/client.css","src":"_client.css"},"_client2.js":{"file":"assets/client2.js","name":"client","dynamicImports":["___vite-browser-external.js","___vite-browser-external.js","___vite-browser-external.js","___vite-browser-external.js","app/routes/time-management.tsx?tsr-split=component","app/routes/test-tender.tsx?tsr-split=component","app/routes/tenders.tsx?tsr-split=component","app/routes/suppliers.tsx?tsr-split=component","app/routes/solutions.tsx?tsr-split=component","app/routes/signup.tsx?tsr-split=component","app/routes/resource-compass.tsx?tsr-split=component","app/routes/projectandconstruction.tsx?tsr-split=component","app/routes/login.tsx?tsr-split=component","app/routes/deals.tsx?tsr-split=component","app/routes/contact.tsx?tsr-split=component","app/routes/categories.tsx?tsr-split=component","app/routes/index.tsx?tsr-split=component","app/routes/seller.$sellerId.tsx?tsr-split=component","app/routes/product.$productId.tsx?tsr-split=component"],"css":["assets/client.css"]},"app/routes/categories.tsx?tsr-split=component":{"file":"assets/categories.js","name":"categories","src":"app/routes/categories.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_ComingSoon.js"]},"app/routes/contact.tsx?tsr-split=component":{"file":"assets/contact.js","name":"contact","src":"app/routes/contact.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_ComingSoon.js"]},"app/routes/deals.tsx?tsr-split=component":{"file":"assets/deals.js","name":"deals","src":"app/routes/deals.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_DealRoom.js"]},"app/routes/index.tsx?tsr-split=component":{"file":"assets/index.js","name":"index","src":"app/routes/index.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_AnnouncementTicker.js","_DealRoom.js","_TenderForm.js","___vite-browser-external.js"]},"app/routes/login.tsx?tsr-split=component":{"file":"assets/login.js","name":"login","src":"app/routes/login.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"app/routes/product.$productId.tsx?tsr-split=component":{"file":"assets/product._productId.js","name":"product._productId","src":"app/routes/product.$productId.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"app/routes/projectandconstruction.tsx?tsr-split=component":{"file":"assets/projectandconstruction.js","name":"projectandconstruction","src":"app/routes/projectandconstruction.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"app/routes/resource-compass.tsx?tsr-split=component":{"file":"assets/resource-compass.js","name":"resource-compass","src":"app/routes/resource-compass.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_AnnouncementTicker.js","_DealRoom.js"]},"app/routes/seller.$sellerId.tsx?tsr-split=component":{"file":"assets/seller._sellerId.js","name":"seller._sellerId","src":"app/routes/seller.$sellerId.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"app/routes/signup.tsx?tsr-split=component":{"file":"assets/signup.js","name":"signup","src":"app/routes/signup.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"app/routes/solutions.tsx?tsr-split=component":{"file":"assets/solutions.js","name":"solutions","src":"app/routes/solutions.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_ComingSoon.js"]},"app/routes/suppliers.tsx?tsr-split=component":{"file":"assets/suppliers.js","name":"suppliers","src":"app/routes/suppliers.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_ComingSoon.js"]},"app/routes/tenders.tsx?tsr-split=component":{"file":"assets/tenders.js","name":"tenders","src":"app/routes/tenders.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_TenderForm.js","___vite-browser-external.js"]},"app/routes/test-tender.tsx?tsr-split=component":{"file":"assets/test-tender.js","name":"test-tender","src":"app/routes/test-tender.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js","_TenderForm.js","___vite-browser-external.js"]},"app/routes/time-management.tsx?tsr-split=component":{"file":"assets/time-management.js","name":"time-management","src":"app/routes/time-management.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_client2.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_client2.js"]}},"ssr":{"_AnnouncementTicker.js":{"file":"assets/AnnouncementTicker.js","name":"AnnouncementTicker","imports":["_ssr2.js"]},"_ComingSoon.js":{"file":"assets/ComingSoon.js","name":"ComingSoon"},"_DealRoom.js":{"file":"assets/DealRoom.js","name":"DealRoom","imports":["_ssr2.js"]},"_TenderForm.js":{"file":"assets/TenderForm.js","name":"TenderForm","imports":["_ssr2.js"]},"_ssr.css":{"file":"assets/ssr.css","src":"_ssr.css"},"_ssr2.js":{"file":"assets/ssr2.js","name":"ssr","dynamicImports":["app/routes/time-management.tsx?tsr-split=component","app/routes/test-tender.tsx?tsr-split=component","app/routes/tenders.tsx?tsr-split=component","app/routes/suppliers.tsx?tsr-split=component","app/routes/solutions.tsx?tsr-split=component","app/routes/signup.tsx?tsr-split=component","app/routes/resource-compass.tsx?tsr-split=component","app/routes/projectandconstruction.tsx?tsr-split=component","app/routes/login.tsx?tsr-split=component","app/routes/deals.tsx?tsr-split=component","app/routes/contact.tsx?tsr-split=component","app/routes/categories.tsx?tsr-split=component","app/routes/index.tsx?tsr-split=component","app/routes/seller.$sellerId.tsx?tsr-split=component","app/routes/product.$productId.tsx?tsr-split=component"],"css":["assets/ssr.css"]},"app/routes/categories.tsx?tsr-split=component":{"file":"assets/categories.js","name":"categories","src":"app/routes/categories.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ComingSoon.js"]},"app/routes/contact.tsx?tsr-split=component":{"file":"assets/contact.js","name":"contact","src":"app/routes/contact.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ComingSoon.js"]},"app/routes/deals.tsx?tsr-split=component":{"file":"assets/deals.js","name":"deals","src":"app/routes/deals.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_DealRoom.js","_ssr2.js"]},"app/routes/index.tsx?tsr-split=component":{"file":"assets/index.js","name":"index","src":"app/routes/index.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_AnnouncementTicker.js","_DealRoom.js","_ssr2.js","_TenderForm.js"]},"app/routes/login.tsx?tsr-split=component":{"file":"assets/login.js","name":"login","src":"app/routes/login.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ssr2.js"]},"app/routes/product.$productId.tsx?tsr-split=component":{"file":"assets/product._productId.js","name":"product._productId","src":"app/routes/product.$productId.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ssr2.js"]},"app/routes/projectandconstruction.tsx?tsr-split=component":{"file":"assets/projectandconstruction.js","name":"projectandconstruction","src":"app/routes/projectandconstruction.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ssr2.js"]},"app/routes/resource-compass.tsx?tsr-split=component":{"file":"assets/resource-compass.js","name":"resource-compass","src":"app/routes/resource-compass.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_AnnouncementTicker.js","_DealRoom.js","_ssr2.js"]},"app/routes/seller.$sellerId.tsx?tsr-split=component":{"file":"assets/seller._sellerId.js","name":"seller._sellerId","src":"app/routes/seller.$sellerId.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ssr2.js"]},"app/routes/signup.tsx?tsr-split=component":{"file":"assets/signup.js","name":"signup","src":"app/routes/signup.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ssr2.js"]},"app/routes/solutions.tsx?tsr-split=component":{"file":"assets/solutions.js","name":"solutions","src":"app/routes/solutions.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ComingSoon.js"]},"app/routes/suppliers.tsx?tsr-split=component":{"file":"assets/suppliers.js","name":"suppliers","src":"app/routes/suppliers.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_ComingSoon.js"]},"app/routes/tenders.tsx?tsr-split=component":{"file":"assets/tenders.js","name":"tenders","src":"app/routes/tenders.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_TenderForm.js","_ssr2.js"]},"app/routes/test-tender.tsx?tsr-split=component":{"file":"assets/test-tender.js","name":"test-tender","src":"app/routes/test-tender.tsx?tsr-split=component","isDynamicEntry":true,"imports":["_TenderForm.js","_ssr2.js"]},"app/routes/time-management.tsx?tsr-split=component":{"file":"assets/time-management.js","name":"time-management","src":"app/routes/time-management.tsx?tsr-split=component","isDynamicEntry":true},"virtual:$vinxi/handler/ssr":{"file":"assets/ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_ssr2.js"]}},"server":{"_auditLogger.js":{"file":"assets/auditLogger.js","name":"auditLogger","imports":["_index.js"]},"_auth2.js":{"file":"assets/auth2.js","name":"auth","imports":["_index.js","_index2.js"]},"_index.js":{"file":"assets/index.js","name":"index"},"_index2.js":{"file":"assets/index2.js","name":"index"},"app/routes/api/announcements.ts?tsr-directive-use-server=":{"file":"assets/announcements.js","name":"announcements","src":"app/routes/api/announcements.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_auditLogger.js","_index2.js"]},"app/routes/api/audit-logs.ts?tsr-directive-use-server=":{"file":"assets/audit-logs.js","name":"audit-logs","src":"app/routes/api/audit-logs.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_index2.js"]},"app/routes/api/auth.ts?tsr-directive-use-server=":{"file":"assets/auth.js","name":"auth","src":"app/routes/api/auth.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_index2.js"]},"app/routes/api/notifications.ts?tsr-directive-use-server=":{"file":"assets/notifications.js","name":"notifications","src":"app/routes/api/notifications.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_index2.js"]},"app/routes/api/product.ts?tsr-directive-use-server=":{"file":"assets/product.js","name":"product","src":"app/routes/api/product.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_index2.js"]},"app/routes/api/seller.ts?tsr-directive-use-server=":{"file":"assets/seller.js","name":"seller","src":"app/routes/api/seller.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_index2.js"]},"app/routes/api/storage.ts?tsr-directive-use-server=":{"file":"assets/storage.js","name":"storage","src":"app/routes/api/storage.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index2.js"]},"app/routes/api/tenders.ts?tsr-directive-use-server=":{"file":"assets/tenders.js","name":"tenders","src":"app/routes/api/tenders.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_index.js","_auth2.js","_index2.js"]},"app/routes/app.tsx?tsr-directive-use-server=":{"file":"assets/app.js","name":"app","src":"app/routes/app.tsx?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_auth2.js","_index.js","_auditLogger.js","_index2.js"]},"virtual:$vinxi/handler/server":{"file":"assets/server.js","name":"server","src":"virtual:$vinxi/handler/server","isEntry":true,"dynamicImports":["app/routes/app.tsx?tsr-directive-use-server=","app/routes/app.tsx?tsr-directive-use-server=","app/routes/app.tsx?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/auth.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/seller.ts?tsr-directive-use-server=","app/routes/api/product.ts?tsr-directive-use-server=","app/routes/api/product.ts?tsr-directive-use-server=","app/routes/api/product.ts?tsr-directive-use-server=","app/routes/api/product.ts?tsr-directive-use-server=","app/routes/api/product.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/tenders.ts?tsr-directive-use-server=","app/routes/api/announcements.ts?tsr-directive-use-server=","app/routes/api/announcements.ts?tsr-directive-use-server=","app/routes/api/announcements.ts?tsr-directive-use-server=","app/routes/api/announcements.ts?tsr-directive-use-server=","app/routes/api/announcements.ts?tsr-directive-use-server=","app/routes/api/audit-logs.ts?tsr-directive-use-server=","app/routes/api/notifications.ts?tsr-directive-use-server=","app/routes/api/notifications.ts?tsr-directive-use-server=","app/routes/api/notifications.ts?tsr-directive-use-server=","app/routes/api/notifications.ts?tsr-directive-use-server=","app/routes/api/notifications.ts?tsr-directive-use-server=","app/routes/api/storage.ts?tsr-directive-use-server=","app/routes/api/storage.ts?tsr-directive-use-server=","app/routes/api/storage.ts?tsr-directive-use-server="]}}};

				const routeManifest = {};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

const assets = {
  "/ad1.webp": {
    "type": "image/webp",
    "etag": "\"18e90c-oSHbzMs1+qK5wt8cGVEt/JMVoZE\"",
    "mtime": "2025-06-09T06:20:23.991Z",
    "size": 1632524,
    "path": "../public/ad1.webp"
  },
  "/ad2.webp": {
    "type": "image/webp",
    "etag": "\"ffac-rS31irzomQ8NJvgvSCzr7xHcIPg\"",
    "mtime": "2025-06-09T06:20:23.996Z",
    "size": 65452,
    "path": "../public/ad2.webp"
  },
  "/ads_award.jpeg": {
    "type": "image/jpeg",
    "etag": "\"213fc-aaS7GLgWnX6TPdn6HuCxxcJHdY0\"",
    "mtime": "2025-06-09T06:20:24.014Z",
    "size": 136188,
    "path": "../public/ads_award.jpeg"
  },
  "/ads_award.png": {
    "type": "image/png",
    "etag": "\"3307d-vsiCnRlC9aNQDynpVxV4YhL4PlU\"",
    "mtime": "2025-06-09T06:20:24.022Z",
    "size": 209021,
    "path": "../public/ads_award.png"
  },
  "/calculator.png": {
    "type": "image/png",
    "etag": "\"25f4-O+BDdr5nT7Rzm/TgnCEq3KMaGdM\"",
    "mtime": "2025-06-09T06:20:24.022Z",
    "size": 9716,
    "path": "../public/calculator.png"
  },
  "/calculator2.png": {
    "type": "image/png",
    "etag": "\"459a-9l95YxosNWBXfaN3Tio85mPyifY\"",
    "mtime": "2025-06-09T06:20:24.022Z",
    "size": 17818,
    "path": "../public/calculator2.png"
  },
  "/calendar.png": {
    "type": "image/png",
    "etag": "\"422e-VG+Cqt1oDZQvvkRrOiNW2ue9hlI\"",
    "mtime": "2025-06-09T06:20:24.022Z",
    "size": 16942,
    "path": "../public/calendar.png"
  },
  "/currency.png": {
    "type": "image/png",
    "etag": "\"b815-5Jpm8SiaroFq/qQq894XDSPbBu4\"",
    "mtime": "2025-06-09T06:20:24.037Z",
    "size": 47125,
    "path": "../public/currency.png"
  },
  "/ENGINEERING & INFRASTRUCTURES (1).png": {
    "type": "image/png",
    "etag": "\"13b29-o4fp/DLQe+QxXDyPuQbe2kkEfQ0\"",
    "mtime": "2025-06-09T06:20:23.959Z",
    "size": 80681,
    "path": "../public/ENGINEERING & INFRASTRUCTURES (1).png"
  },
  "/ENGINEERING & INFRASTRUCTURES.png": {
    "type": "image/png",
    "etag": "\"445d-RQ7l7JeLxlNC2R4pBYO6D+G/oB8\"",
    "mtime": "2025-06-09T06:20:23.969Z",
    "size": 17501,
    "path": "../public/ENGINEERING & INFRASTRUCTURES.png"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": "\"1f5-m9ikgGyUeH8N9v5XraZhsJRPt48\"",
    "mtime": "2025-06-09T06:20:24.037Z",
    "size": 501,
    "path": "../public/manifest.json"
  },
  "/notes.png": {
    "type": "image/png",
    "etag": "\"665e-nosrsStu9PMPFI9wRlhgpyiBCCY\"",
    "mtime": "2025-06-09T06:20:24.037Z",
    "size": 26206,
    "path": "../public/notes.png"
  },
  "/premium-golden-metallic-security-shield-badge-design.png": {
    "type": "image/png",
    "etag": "\"2129ef-Ty1+sBSt5W6EM+uRToPic/VGC5g\"",
    "mtime": "2025-06-09T06:20:24.069Z",
    "size": 2173423,
    "path": "../public/premium-golden-metallic-security-shield-badge-design.png"
  },
  "/Screenshot 2025-03-25 234717.png": {
    "type": "image/png",
    "etag": "\"1a048-hQ4JzK4+sA2nNNZvPfcJQVHOPK8\"",
    "mtime": "2025-06-09T06:20:23.975Z",
    "size": 106568,
    "path": "../public/Screenshot 2025-03-25 234717.png"
  },
  "/time-management.jpg": {
    "type": "image/jpeg",
    "etag": "\"2e765-tJLDbpKBiXSAhUhFxQKpKwYTb3U\"",
    "mtime": "2025-06-09T06:20:24.075Z",
    "size": 190309,
    "path": "../public/time-management.jpg"
  },
  "/time-management.png": {
    "type": "image/png",
    "etag": "\"e618-HrdKfvt2UM2rHtOouUOAOLVcGCw\"",
    "mtime": "2025-06-09T06:20:24.075Z",
    "size": 58904,
    "path": "../public/time-management.png"
  },
  "/timezone.png": {
    "type": "image/png",
    "etag": "\"c323-Jr7QRptqWiFrygYKTkgKfoJZcWU\"",
    "mtime": "2025-06-09T06:20:24.088Z",
    "size": 49955,
    "path": "../public/timezone.png"
  },
  "/trophy-award-laurel-wreath-composition-with-realistic-image-golden-cup-decorated-with-garland-with-reflection.png": {
    "type": "image/png",
    "etag": "\"1c8e72-8jqktmOVwThFgAs8SEU4xepkNf8\"",
    "mtime": "2025-06-09T06:20:24.107Z",
    "size": 1871474,
    "path": "../public/trophy-award-laurel-wreath-composition-with-realistic-image-golden-cup-decorated-with-garland-with-reflection.png"
  },
  "/upcr-logo.png": {
    "type": "image/png",
    "etag": "\"1bd5-oCwoHCscl3D/xByAwOPcQetlWuw\"",
    "mtime": "2025-06-09T06:20:24.114Z",
    "size": 7125,
    "path": "../public/upcr-logo.png"
  },
  "/assets/ssr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"14e9b-AQSJxsAtVG+mzmdGK1flrp3hTyw\"",
    "mtime": "2025-06-09T07:52:13.541Z",
    "size": 85659,
    "path": "../public/assets/ssr.css"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "etag": "\"19b8-j/MAPuSznvPv93oU0bytXPrQeK4\"",
    "mtime": "2025-06-09T07:52:07.007Z",
    "size": 6584,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/assets/AnnouncementTicker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c28-1iFs3CXfrrH5iqXs4aBHkqpQiqc\"",
    "mtime": "2025-06-09T07:52:07.004Z",
    "size": 23592,
    "path": "../public/_build/assets/AnnouncementTicker.js"
  },
  "/_build/assets/browser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d-ugBjxDVG//I8Whp/Yze4B1aktTk\"",
    "mtime": "2025-06-09T07:52:07.007Z",
    "size": 333,
    "path": "../public/_build/assets/browser.js"
  },
  "/_build/assets/categories.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"129-WyM4ohmpAVbv2HjX4SIpWR+1QeA\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 297,
    "path": "../public/_build/assets/categories.js"
  },
  "/_build/assets/client.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"14e9b-AQSJxsAtVG+mzmdGK1flrp3hTyw\"",
    "mtime": "2025-06-09T07:52:07.007Z",
    "size": 85659,
    "path": "../public/_build/assets/client.css"
  },
  "/_build/assets/client.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37-tU6dl1KovxrqYttR/pKdv9w4CD8\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 55,
    "path": "../public/_build/assets/client.js"
  },
  "/_build/assets/client2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"91b2a-1jV/c2OgflcsYGyqdmaqAvSaaXs\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 596778,
    "path": "../public/_build/assets/client2.js"
  },
  "/_build/assets/ComingSoon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f4-XjpT3gGrcdaW7jmbqieO4B9q3BE\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 1268,
    "path": "../public/_build/assets/ComingSoon.js"
  },
  "/_build/assets/contact.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"137-xMKjJYTCmuiF1xcceJ5OHXk9UF0\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 311,
    "path": "../public/_build/assets/contact.js"
  },
  "/_build/assets/DealRoom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21ca4-9AJIAzUOhs7qzXIP6HGiSJS1Pm4\"",
    "mtime": "2025-06-09T07:52:07.007Z",
    "size": 138404,
    "path": "../public/_build/assets/DealRoom.js"
  },
  "/_build/assets/deals.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f8-SG5EsfOSmHA1+xEauVgLepcmODw\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 248,
    "path": "../public/_build/assets/deals.js"
  },
  "/_build/assets/index.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1da1e-KPhH7SBKOR0F5VonhWBMZsdc+iU\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 121374,
    "path": "../public/_build/assets/index.js"
  },
  "/_build/assets/login.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15ed-cHzlUq50vus8nv8FAlcUZnTfTdU\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 5613,
    "path": "../public/_build/assets/login.js"
  },
  "/_build/assets/product._productId.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1228-VF65IipQMSQGa1hDKTt6rGJT/xE\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 4648,
    "path": "../public/_build/assets/product._productId.js"
  },
  "/_build/assets/projectandconstruction.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24fd-Jx+wwSpECNcWeaiULaa1J/4J8Nk\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 9469,
    "path": "../public/_build/assets/projectandconstruction.js"
  },
  "/_build/assets/resource-compass.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44e-XEcmM/uQ87nY38E8jOw2mElH4f4\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 1102,
    "path": "../public/_build/assets/resource-compass.js"
  },
  "/_build/assets/seller._sellerId.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"392b-6BL7VDjGKsmuzKzyeeyIxI6cjn8\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 14635,
    "path": "../public/_build/assets/seller._sellerId.js"
  },
  "/_build/assets/signup.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cac-MDIIoaRWNw+XQ9r8jEZiq6aePuU\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 11436,
    "path": "../public/_build/assets/signup.js"
  },
  "/_build/assets/solutions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"134-fnAhUZnIjMqx0Rd5hpYF8ithi5k\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 308,
    "path": "../public/_build/assets/solutions.js"
  },
  "/_build/assets/suppliers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"156-oEjTaQv3Z9s9tJHqFud3rHauTLI\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 342,
    "path": "../public/_build/assets/suppliers.js"
  },
  "/_build/assets/TenderForm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1741d6-mqHqYhuOlNLM267cIlC1J8AgqUc\"",
    "mtime": "2025-06-09T07:52:07.004Z",
    "size": 1524182,
    "path": "../public/_build/assets/TenderForm.js"
  },
  "/_build/assets/tenders.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bea-x3cpZaEfm4fETMPz6q23dD+UWUA\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 7146,
    "path": "../public/_build/assets/tenders.js"
  },
  "/_build/assets/test-tender.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dc5-IprHYdA6A6Yl9oh2p0drAo+WX+Q\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 3525,
    "path": "../public/_build/assets/test-tender.js"
  },
  "/_build/assets/time-management.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"49f9-lJZlxYUlpQ2taJnrosSEneGqaBk\"",
    "mtime": "2025-06-09T07:52:06.979Z",
    "size": 18937,
    "path": "../public/_build/assets/time-management.js"
  },
  "/_build/assets/__vite-browser-external.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"82-WB0X4PLOuAQ605qR4fglHkIvhc4\"",
    "mtime": "2025-06-09T07:52:07.002Z",
    "size": 130,
    "path": "../public/_build/assets/__vite-browser-external.js"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _zV42FD = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const M = { "app_routes_app_tsx--updateProductStatus_createServerFn_handler": { functionName: "updateProductStatus_createServerFn_handler", importer: () => import('../build/app.mjs') }, "app_routes_app_tsx--updateSellerCompleteProfile_createServerFn_handler": { functionName: "updateSellerCompleteProfile_createServerFn_handler", importer: () => import('../build/app.mjs') }, "app_routes_app_tsx--uploadProfileImage_createServerFn_handler": { functionName: "uploadProfileImage_createServerFn_handler", importer: () => import('../build/app.mjs') }, "app_routes_api_auth_ts--loginUser_createServerFn_handler": { functionName: "loginUser_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_auth_ts--refreshToken_createServerFn_handler": { functionName: "refreshToken_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_auth_ts--validateAccessToken_createServerFn_handler": { functionName: "validateAccessToken_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_auth_ts--createUser_createServerFn_handler": { functionName: "createUser_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_auth_ts--updateUserProfile_createServerFn_handler": { functionName: "updateUserProfile_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_auth_ts--logoutUser_createServerFn_handler": { functionName: "logoutUser_createServerFn_handler", importer: () => import('../build/auth.mjs') }, "app_routes_api_seller_ts--createSellerProfile_createServerFn_handler": { functionName: "createSellerProfile_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_seller_ts--getSellerStatus_createServerFn_handler": { functionName: "getSellerStatus_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_seller_ts--getSellerById_createServerFn_handler": { functionName: "getSellerById_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_seller_ts--updateSellerProfile_createServerFn_handler": { functionName: "updateSellerProfile_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_seller_ts--getSellerPortfolio_createServerFn_handler": { functionName: "getSellerPortfolio_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_seller_ts--getSellerGigs_createServerFn_handler": { functionName: "getSellerGigs_createServerFn_handler", importer: () => import('../build/seller.mjs') }, "app_routes_api_product_ts--getProducts_createServerFn_handler": { functionName: "getProducts_createServerFn_handler", importer: () => import('../build/product.mjs') }, "app_routes_api_product_ts--getProduct_createServerFn_handler": { functionName: "getProduct_createServerFn_handler", importer: () => import('../build/product.mjs') }, "app_routes_api_product_ts--getSellerProducts_createServerFn_handler": { functionName: "getSellerProducts_createServerFn_handler", importer: () => import('../build/product.mjs') }, "app_routes_api_product_ts--createProduct_createServerFn_handler": { functionName: "createProduct_createServerFn_handler", importer: () => import('../build/product.mjs') }, "app_routes_api_product_ts--updateProduct_createServerFn_handler": { functionName: "updateProduct_createServerFn_handler", importer: () => import('../build/product.mjs') }, "app_routes_api_tenders_ts--getTenders_createServerFn_handler": { functionName: "getTenders_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--getTender_createServerFn_handler": { functionName: "getTender_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--getTenderByUPC_createServerFn_handler": { functionName: "getTenderByUPC_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--getUserTenders_createServerFn_handler": { functionName: "getUserTenders_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--createTender_createServerFn_handler": { functionName: "createTender_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--updateTender_createServerFn_handler": { functionName: "updateTender_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--deleteTender_createServerFn_handler": { functionName: "deleteTender_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_tenders_ts--generateNewUPCRef_createServerFn_handler": { functionName: "generateNewUPCRef_createServerFn_handler", importer: () => import('../build/tenders.mjs') }, "app_routes_api_announcements_ts--createAnnouncement_createServerFn_handler": { functionName: "createAnnouncement_createServerFn_handler", importer: () => import('../build/announcements.mjs') }, "app_routes_api_announcements_ts--getSellerAnnouncements_createServerFn_handler": { functionName: "getSellerAnnouncements_createServerFn_handler", importer: () => import('../build/announcements.mjs') }, "app_routes_api_announcements_ts--updateAnnouncement_createServerFn_handler": { functionName: "updateAnnouncement_createServerFn_handler", importer: () => import('../build/announcements.mjs') }, "app_routes_api_announcements_ts--deactivateAnnouncement_createServerFn_handler": { functionName: "deactivateAnnouncement_createServerFn_handler", importer: () => import('../build/announcements.mjs') }, "app_routes_api_announcements_ts--getAllSellerAnnouncements_createServerFn_handler": { functionName: "getAllSellerAnnouncements_createServerFn_handler", importer: () => import('../build/announcements.mjs') }, "app_routes_api_audit-logs_ts--getAuditLogs_createServerFn_handler": { functionName: "getAuditLogs_createServerFn_handler", importer: () => import('../build/audit-logs.mjs') }, "app_routes_api_notifications_ts--getUnreadNotificationCount_createServerFn_handler": { functionName: "getUnreadNotificationCount_createServerFn_handler", importer: () => import('../build/notifications.mjs') }, "app_routes_api_notifications_ts--getUserNotifications_createServerFn_handler": { functionName: "getUserNotifications_createServerFn_handler", importer: () => import('../build/notifications.mjs') }, "app_routes_api_notifications_ts--markNotificationAsRead_createServerFn_handler": { functionName: "markNotificationAsRead_createServerFn_handler", importer: () => import('../build/notifications.mjs') }, "app_routes_api_notifications_ts--getTenderForNotification_createServerFn_handler": { functionName: "getTenderForNotification_createServerFn_handler", importer: () => import('../build/notifications.mjs') }, "app_routes_api_notifications_ts--createTenderNotifications_createServerFn_handler": { functionName: "createTenderNotifications_createServerFn_handler", importer: () => import('../build/notifications.mjs') }, "app_routes_api_storage_ts--uploadProfileImage_createServerFn_handler": { functionName: "uploadProfileImage_createServerFn_handler", importer: () => import('../build/storage.mjs') }, "app_routes_api_storage_ts--deleteProfileImage_createServerFn_handler": { functionName: "deleteProfileImage_createServerFn_handler", importer: () => import('../build/storage.mjs') }, "app_routes_api_storage_ts--uploadAnnouncementImage_createServerFn_handler": { functionName: "uploadAnnouncementImage_createServerFn_handler", importer: () => import('../build/storage.mjs') } }, G = eventHandler$1(j), u = M;
async function j(r) {
  const n = toWebRequest(r);
  return await L({ request: n, event: r });
}
function k(r) {
  return r.replace(/^\/|\/$/g, "");
}
async function L({ request: r, event: n }) {
  const o = new AbortController(), _ = o.signal, S = () => o.abort();
  n.node.req.on("close", S);
  const h = r.method, v = new URL(r.url, "http://localhost:3000"), y = new RegExp(`${k("/_server")}/([^/?#]+)`), F = v.pathname.match(y), a = F ? F[1] : null, s = Object.fromEntries(v.searchParams.entries()), m = "createServerFn" in s, A = "raw" in s;
  if (typeof a != "string") throw new Error("Invalid server action param for serverFnId: " + a);
  const f = u[a];
  if (!f) throw console.log("serverFnManifest", u), new Error("Server function info not found for " + a);
  let p;
  if (p = await f.importer(), !p) throw console.log("serverFnManifest", u), new Error("Server function module not resolved for " + a);
  const i = p[f.functionName];
  if (!i) throw console.log("serverFnManifest", u), console.log("fnModule", p), new Error(`Server function module export not resolved for serverFn ID: ${a}`);
  const C = ["multipart/form-data", "application/x-www-form-urlencoded"], c = await (async () => {
    try {
      let e = await (async () => {
        if (r.headers.get("Content-Type") && C.some((t) => {
          var N;
          return (N = r.headers.get("Content-Type")) == null ? void 0 : N.includes(t);
        })) return U(h.toLowerCase() !== "get", "GET requests with FormData payloads are not supported"), await i(await r.formData(), _);
        if (h.toLowerCase() === "get") {
          let t = s;
          return m && (t = s.payload), t = t && startSerializer.parse(t), await i(t, _);
        }
        const l = await r.text(), g = startSerializer.parse(l);
        return m ? await i(g, _) : await i(...g, _);
      })();
      return e.result instanceof Response ? e.result : !m && (e = e.result, e instanceof Response) ? e : isRedirect(e) || isNotFound(e) ? T(e) : new Response(e !== void 0 ? startSerializer.stringify(e) : void 0, { status: getResponseStatus(getEvent()), headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return e instanceof Response ? e : isRedirect(e) || isNotFound(e) ? T(e) : (console.info(), console.info("Server Fn Error!"), console.info(), console.error(e), console.info(), new Response(startSerializer.stringify(e), { status: 500, headers: { "Content-Type": "application/json" } }));
    }
  })();
  if (n.node.req.removeListener("close", S), A) return c;
  if (c.headers.get("Content-Type") === "application/json") {
    const l = await c.clone().text();
    l && JSON.stringify(JSON.parse(l));
  }
  return c;
}
function T(r) {
  const { headers: n, ...o } = r;
  return new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json", ...n || {} } });
}

function Ot(r) {
  return jsx(RouterProvider, { router: r.router });
}
const Ra = defineHandlerCallback(async ({ request: r, router: p, responseHeaders: d }) => {
  if (typeof ct.renderToReadableStream == "function") {
    const h = await ct.renderToReadableStream(jsx(Ot, { router: p }), { signal: r.signal });
    isbot(r.headers.get("User-Agent")) && await h.allReady;
    const o = transformReadableStreamWithRouter(p, h);
    return new Response(o, { status: p.state.statusCode, headers: d });
  }
  if (typeof ct.renderToPipeableStream == "function") {
    const h = new PassThrough();
    try {
      const x = ct.renderToPipeableStream(jsx(Ot, { router: p }), { ...isbot(r.headers.get("User-Agent")) ? { onAllReady() {
        x.pipe(h);
      } } : { onShellReady() {
        x.pipe(h);
      } }, onError: (_, k) => {
        console.error("Error in renderToPipeableStream:", _, k);
      } });
    } catch (x) {
      console.error("Error in renderToPipeableStream:", x);
    }
    const o = transformPipeableStreamWithRouter(p, h);
    return new Response(o, { status: p.state.statusCode, headers: d });
  }
  throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
}), Aa = () => ({ routes: { __root__: { filePath: "__root.tsx", children: ["/", "/app", "/categories", "/contact", "/deals", "/login", "/projectandconstruction", "/resource-compass", "/signup", "/solutions", "/suppliers", "/tenders", "/test-tender", "/time-management", "/product/$productId", "/seller/$sellerId"], preloads: ["\\_build\\assets\\client.js", "\\_build\\assets\\client2.js"] }, "/": { filePath: "index.tsx" }, "/app": { filePath: "app.tsx" }, "/categories": { filePath: "categories.tsx" }, "/contact": { filePath: "contact.tsx" }, "/deals": { filePath: "deals.tsx" }, "/login": { filePath: "login.tsx" }, "/projectandconstruction": { filePath: "projectandconstruction.tsx" }, "/resource-compass": { filePath: "resource-compass.tsx" }, "/signup": { filePath: "signup.tsx" }, "/solutions": { filePath: "solutions.tsx" }, "/suppliers": { filePath: "suppliers.tsx" }, "/tenders": { filePath: "tenders.tsx" }, "/test-tender": { filePath: "test-tender.tsx" }, "/time-management": { filePath: "time-management.tsx" }, "/product/$productId": { filePath: "product.$productId.tsx" }, "/seller/$sellerId": { filePath: "seller.$sellerId.tsx" } } });
function Fa(r) {
  return globalThis.MANIFEST[r];
}
function Ia() {
  var _a2;
  const r = Aa(), p = r.routes.__root__ = r.routes.__root__ || {};
  p.assets = p.assets || [];
  let d = "";
  const h = Fa("client"), o = (_a2 = h.inputs[h.handler]) == null ? void 0 : _a2.output.path;
  return o || U(o, "Could not find client entry in vinxi manifest"), p.assets.push({ tag: "script", attrs: { type: "module", suppressHydrationWarning: true, async: true }, children: `${d}import("${o}")` }), r;
}
function Ea() {
  const r = Ia();
  return { ...r, routes: Object.fromEntries(Object.entries(r.routes).map(([p, d]) => {
    const { preloads: h, assets: o } = d;
    return [p, { preloads: h, assets: o }];
  })) };
}
function La({ isOpen: r, onClose: p }) {
  const [d, h] = useState("0"), [o, x] = useState(""), [_, k] = useState(""), [I, S] = useState(false), [f, T] = useState(0), [P, C] = useState(false);
  useEffect(() => {
    const i = (l) => {
      if (!r) return;
      const { key: y } = l;
      /[0-9]/.test(y) ? N(y) : ["+", "-", "*", "/"].includes(y) ? M(y) : y === "Enter" || y === "=" ? ae() : y === "Escape" ? U() : y === "Backspace" ? A() : y === "." && w();
    };
    return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
  }, [r, d, _, o, I]);
  const N = (i) => {
    I ? (h(i), S(false)) : h(d === "0" ? i : d + i);
  }, M = (i) => {
    const l = parseFloat(d);
    if (o === "") x(d);
    else if (_) {
      const y = parseFloat(o), L = Z(y, l, _);
      h(String(L)), x(String(L));
    }
    S(true), k(i);
  }, w = () => {
    I ? (h("0."), S(false)) : d.indexOf(".") === -1 && h(d + ".");
  }, U = () => {
    h("0"), x(""), k(""), S(false);
  }, A = () => {
    d.length > 1 ? h(d.slice(0, -1)) : h("0");
  }, ae = () => {
    const i = parseFloat(d);
    if (o !== "" && _) {
      const l = parseFloat(o), y = Z(l, i, _);
      h(String(y)), x(""), k(""), S(true);
    }
  }, Z = (i, l, y) => {
    switch (y) {
      case "+":
        return i + l;
      case "-":
        return i - l;
      case "*":
        return i * l;
      case "/":
        return i / l;
      case "^":
        return Math.pow(i, l);
      default:
        return l;
    }
  }, K = (i) => {
    const l = parseFloat(d);
    let y;
    switch (i) {
      case "sin":
        y = Math.sin(l * Math.PI / 180);
        break;
      case "cos":
        y = Math.cos(l * Math.PI / 180);
        break;
      case "tan":
        y = Math.tan(l * Math.PI / 180);
        break;
      case "log":
        y = Math.log10(l);
        break;
      case "ln":
        y = Math.log(l);
        break;
      case "sqrt":
        y = Math.sqrt(l);
        break;
      case "1/x":
        y = 1 / l;
        break;
      case "x\xB2":
        y = l * l;
        break;
      case "x\xB3":
        y = l * l * l;
        break;
      case "\xB1":
        y = -l;
        break;
      case "%":
        y = l / 100;
        break;
      default:
        return;
    }
    h(String(y)), S(true);
  }, Q = (i) => {
    const l = parseFloat(d);
    switch (i) {
      case "MC":
        T(0);
        break;
      case "MR":
        h(String(f)), S(true);
        break;
      case "M+":
        T(f + l);
        break;
      case "M-":
        T(f - l);
        break;
      case "MS":
        T(l);
        break;
    }
  }, V = (i) => {
    switch (i) {
      case "\u03C0":
        h(String(Math.PI));
        break;
      case "e":
        h(String(Math.E));
        break;
    }
    S(true);
  };
  return r ? jsx("div", { className: "fixed inset-0 z-[99] overflow-y-auto", children: jsxs("div", { className: "flex min-h-screen items-center justify-center p-2 sm:p-4", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsxs("div", { className: "relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full mx-auto transition-all duration-300 max-w-sm sm:max-w-md lg:max-w-lg", children: [jsx("div", { className: "bg-gray-800 px-6 py-4 rounded-t-2xl", children: jsxs("div", { className: "flex items-center justify-between", children: [jsx("h2", { className: "text-lg font-medium text-white", children: "Calculator" }), jsx("button", { onClick: p, className: "text-gray-300 hover:text-white transition-colors", "aria-label": "Close calculator", children: jsx(X, { className: "w-5 h-5" }) })] }) }), jsx("div", { className: "px-6 py-3 bg-gray-50 border-b border-gray-200", children: jsx("div", { className: "flex items-center justify-center", children: jsxs("div", { className: "flex bg-gray-200 rounded-lg p-1", children: [jsx("button", { onClick: () => C(false), className: `px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${P ? "text-gray-600 hover:text-gray-900" : "bg-white text-gray-900 shadow-sm"}`, children: "Standard" }), jsx("button", { onClick: () => C(true), className: `px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${P ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`, children: "Scientific" })] }) }) }), jsx("div", { className: "p-4 bg-gray-900", children: jsxs("div", { className: "bg-black rounded-lg p-4 text-right", children: [jsxs("div", { className: "text-gray-400 text-sm min-h-[20px]", children: [o, " ", _] }), jsx("div", { className: "text-white text-3xl font-mono overflow-hidden text-ellipsis", children: d })] }) }), jsxs("div", { className: "p-4 bg-white rounded-b-2xl", children: [P ? jsxs("div", { className: "grid grid-cols-6 gap-2", children: [jsx("button", { onClick: () => Q("MC"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "MC" }), jsx("button", { onClick: () => Q("MR"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "MR" }), jsx("button", { onClick: () => Q("M+"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "M+" }), jsx("button", { onClick: () => Q("M-"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "M-" }), jsx("button", { onClick: () => Q("MS"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "MS" }), jsx("button", { onClick: U, className: "col-span-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center", children: jsx(RotateCcw, { className: "w-3 h-3" }) }), jsx("button", { onClick: () => K("sin"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "sin" }), jsx("button", { onClick: () => K("cos"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "cos" }), jsx("button", { onClick: () => K("tan"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "tan" }), jsx("button", { onClick: () => K("log"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "log" }), jsx("button", { onClick: () => K("ln"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "ln" }), jsx("button", { onClick: () => M("^"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "x^y" }), jsx("button", { onClick: () => V("\u03C0"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors", children: "\u03C0" }), jsx("button", { onClick: () => V("e"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors", children: "e" }), jsx("button", { onClick: () => K("sqrt"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "\u221Ax" }), jsx("button", { onClick: () => K("x\xB2"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "x\xB2" }), jsx("button", { onClick: () => K("x\xB3"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "x\xB3" }), jsx("button", { onClick: () => K("1/x"), className: "col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors", children: "1/x" }), jsx("button", { onClick: () => K("\xB1"), className: "col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors", children: "\xB1" }), jsx("button", { onClick: () => K("%"), className: "col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors", children: "%" }), jsx("button", { onClick: A, className: "col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center", children: jsx(Delete, { className: "w-4 h-4" }) }), jsx("button", { onClick: () => M("/"), className: "col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\xF7" }), jsx("button", { onClick: () => M("*"), className: "col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\xD7" }), jsx("button", { onClick: () => M("-"), className: "col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\u2212" }), jsx("button", { onClick: () => N("7"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "7" }), jsx("button", { onClick: () => N("8"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "8" }), jsx("button", { onClick: () => N("9"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "9" }), jsx("button", { onClick: () => N("4"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "4" }), jsx("button", { onClick: () => N("5"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "5" }), jsx("button", { onClick: () => N("6"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "6" }), jsx("button", { onClick: () => N("1"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "1" }), jsx("button", { onClick: () => N("2"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "2" }), jsx("button", { onClick: () => N("3"), className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "3" }), jsx("button", { onClick: () => N("0"), className: "col-span-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "0" }), jsx("button", { onClick: w, className: "col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "." }), jsx("button", { onClick: () => M("+"), className: "col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center", children: "+" }), jsx("button", { onClick: ae, className: "col-span-1 p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors", children: "=" })] }) : jsxs("div", { className: "grid grid-cols-4 gap-3", children: [jsx("button", { onClick: U, className: "col-span-2 p-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors", children: "Clear" }), jsx("button", { onClick: A, className: "col-span-1 p-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center", children: jsx(Delete, { className: "w-4 h-4" }) }), jsx("button", { onClick: () => M("/"), className: "col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\xF7" }), jsx("button", { onClick: () => N("7"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "7" }), jsx("button", { onClick: () => N("8"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "8" }), jsx("button", { onClick: () => N("9"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "9" }), jsx("button", { onClick: () => M("*"), className: "col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\xD7" }), jsx("button", { onClick: () => N("4"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "4" }), jsx("button", { onClick: () => N("5"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "5" }), jsx("button", { onClick: () => N("6"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "6" }), jsx("button", { onClick: () => M("-"), className: "col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors", children: "\u2212" }), jsx("button", { onClick: () => N("1"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "1" }), jsx("button", { onClick: () => N("2"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "2" }), jsx("button", { onClick: () => N("3"), className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "3" }), jsx("button", { onClick: () => M("+"), className: "col-span-1 row-span-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center", children: "+" }), jsx("button", { onClick: () => N("0"), className: "col-span-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "0" }), jsx("button", { onClick: w, className: "col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200", children: "." }), jsx("button", { onClick: ae, className: "col-span-4 p-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors mt-2", children: "=" })] }), f !== 0 && jsxs("div", { className: "mt-3 text-center text-xs text-gray-500", children: ["Memory: ", f] })] })] })] }) }) : null;
}
function Da({ isOpen: r, onClose: p }) {
  const [d, h] = useState(/* @__PURE__ */ new Date()), [o, x] = useState(null), _ = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], k = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], I = /* @__PURE__ */ new Date(), S = d.getFullYear(), f = d.getMonth(), T = (/* @__PURE__ */ new Date()).getFullYear(), P = [];
  for (let l = T - 50; l <= T + 50; l++) P.push(l);
  const C = new Date(S, f, 1), M = new Date(S, f + 1, 0).getDate(), w = C.getDay(), U = [];
  for (let l = 0; l < w; l++) U.push(null);
  for (let l = 1; l <= M; l++) U.push(new Date(S, f, l));
  const A = (l) => {
    h((y) => {
      const L = new Date(y);
      return l === "prev" ? L.setMonth(L.getMonth() - 1) : L.setMonth(L.getMonth() + 1), L;
    });
  }, ae = (l) => {
    h((y) => new Date(y.getFullYear(), l, 1));
  }, Z = (l) => {
    h((y) => new Date(l, y.getMonth(), 1));
  }, K = (l) => {
    x(l);
  }, Q = (l) => l.toDateString() === I.toDateString(), V = (l) => o && l.toDateString() === o.toDateString(), i = (l) => l.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return useEffect(() => {
    const l = (y) => {
      r && y.key === "Escape" && p();
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [r, p]), r ? jsx("div", { className: "fixed inset-0 z-[99] overflow-y-auto", children: jsxs("div", { className: "flex min-h-screen items-center justify-center p-2 sm:p-4", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsxs("div", { className: "relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto", children: [jsx("div", { className: "bg-gray-800 px-6 py-4 rounded-t-2xl", children: jsxs("div", { className: "flex items-center justify-between", children: [jsxs("div", { className: "flex items-center gap-2", children: [jsx(Calendar, { className: "w-5 h-5 text-white" }), jsx("h2", { className: "text-lg font-medium text-white", children: "Calendar" })] }), jsx("button", { onClick: p, className: "text-gray-300 hover:text-white transition-colors", "aria-label": "Close calendar", children: jsx(X, { className: "w-5 h-5" }) })] }) }), jsxs("div", { className: "px-6 py-4 bg-gray-50 border-b border-gray-200", children: [jsxs("div", { className: "flex items-center justify-between mb-3", children: [jsx("button", { onClick: () => A("prev"), className: "p-2 hover:bg-gray-200 rounded-lg transition-colors", "aria-label": "Previous month", children: jsx(ChevronLeft, { className: "w-4 h-4" }) }), jsxs("h3", { className: "text-lg font-medium text-gray-900", children: [_[f], " ", S] }), jsx("button", { onClick: () => A("next"), className: "p-2 hover:bg-gray-200 rounded-lg transition-colors", "aria-label": "Next month", children: jsx(ChevronRight, { className: "w-4 h-4" }) })] }), jsxs("div", { className: "grid grid-cols-2 gap-3", children: [jsxs("div", { children: [jsx("label", { htmlFor: "month-select", className: "block text-xs font-medium text-gray-700 mb-1", children: "Month" }), jsx("select", { id: "month-select", value: f, onChange: (l) => ae(parseInt(l.target.value)), className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: _.map((l, y) => jsx("option", { value: y, children: l }, y)) })] }), jsxs("div", { children: [jsx("label", { htmlFor: "year-select", className: "block text-xs font-medium text-gray-700 mb-1", children: "Year" }), jsx("select", { id: "year-select", value: S, onChange: (l) => Z(parseInt(l.target.value)), className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: P.map((l) => jsx("option", { value: l, children: l }, l)) })] })] })] }), jsxs("div", { className: "p-4", children: [jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: k.map((l) => jsx("div", { className: "p-2 text-center text-xs font-medium text-gray-500 uppercase", children: l }, l)) }), jsx("div", { className: "grid grid-cols-7 gap-1", children: U.map((l, y) => jsx("div", { className: "aspect-square", children: l ? jsx("button", { onClick: () => K(l), className: `
                        w-full h-full rounded-lg text-sm font-medium transition-colors
                        ${Q(l) ? "bg-blue-500 text-white hover:bg-blue-600" : V(l) ? "bg-blue-100 text-blue-900 border-2 border-blue-500" : "hover:bg-gray-100 text-gray-900"}
                      `, children: l.getDate() }) : jsx("div", { className: "w-full h-full" }) }, y)) }), jsx("div", { className: "mt-4 p-3 bg-gray-50 rounded-lg", children: jsxs("p", { className: "text-sm text-gray-600 text-center", children: ["Today: ", i(I)] }) }), o && jsx("div", { className: "mt-2 p-3 bg-blue-50 rounded-lg", children: jsxs("p", { className: "text-sm text-blue-700 text-center", children: ["Selected: ", i(o)] }) })] })] })] }) }) : null;
}
function ja({ isOpen: r, onClose: p }) {
  var _a2, _b;
  const [d, h] = useState("1"), [o, x] = useState("USD"), [_, k] = useState("INR"), [I, S] = useState("0"), [f, T] = useState(false), [P, C] = useState(""), [N, M] = useState(false), w = [{ code: "USD", name: "US Dollar", symbol: "$", rate: 1 }, { code: "EUR", name: "Euro", symbol: "\u20AC", rate: 0.961 }, { code: "GBP", name: "British Pound", symbol: "\xA3", rate: 0.797 }, { code: "INR", name: "Indian Rupee", symbol: "\u20B9", rate: 85.38 }, { code: "JPY", name: "Japanese Yen", symbol: "\xA5", rate: 156.85 }, { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.438 }, { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.612 }, { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.905 }, { code: "CNY", name: "Chinese Yuan", symbol: "\xA5", rate: 7.299 }, { code: "SEK", name: "Swedish Krona", symbol: "kr", rate: 11.006 }, { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", rate: 1.781 }, { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 20.704 }, { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 1.363 }, { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", rate: 7.766 }, { code: "NOK", name: "Norwegian Krone", symbol: "kr", rate: 11.322 }, { code: "DKK", name: "Danish Krone", symbol: "kr", rate: 7.17 }, { code: "PLN", name: "Polish Zloty", symbol: "z\u0142", rate: 4.108 }, { code: "CZK", name: "Czech Koruna", symbol: "K\u010D", rate: 23.538 }, { code: "HUF", name: "Hungarian Forint", symbol: "Ft", rate: 395.32 }, { code: "RUB", name: "Russian Ruble", symbol: "\u20BD", rate: 108 }, { code: "BRL", name: "Brazilian Real", symbol: "R$", rate: 6.184 }, { code: "ZAR", name: "South African Rand", symbol: "R", rate: 18.85 }, { code: "KRW", name: "South Korean Won", symbol: "\u20A9", rate: 1473.27 }, { code: "THB", name: "Thai Baht", symbol: "\u0E3F", rate: 34.33 }, { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", rate: 4.468 }, { code: "PHP", name: "Philippine Peso", symbol: "\u20B1", rate: 58.025 }, { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", rate: 16067.13 }, { code: "TRY", name: "Turkish Lira", symbol: "\u20BA", rate: 35.365 }, { code: "ILS", name: "Israeli Shekel", symbol: "\u20AA", rate: 3.647 }, { code: "AED", name: "UAE Dirham", symbol: "\u062F.\u0625", rate: 3.673 }], [U, A] = useState(w), ae = async () => {
    T(true);
    try {
      const l = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!l.ok) throw new Error("Failed to fetch exchange rates");
      const y = await l.json();
      if (y.result === "success" || y.rates) {
        const L = w.map((de) => {
          const xe = y.rates[de.code];
          return { ...de, rate: xe || de.rate };
        });
        A(L), M(true), C((/* @__PURE__ */ new Date()).toLocaleString()), console.log("\u2705 Live exchange rates updated successfully");
      } else throw new Error("Invalid API response");
    } catch (l) {
      console.warn("\u26A0\uFE0F Failed to fetch live rates, using fallback rates:", l), A(w), M(false);
    } finally {
      T(false);
    }
  };
  useEffect(() => {
    r && U === w && ae();
  }, [r]);
  const Z = (l) => U.find((y) => y.code === l), K = () => {
    var _a3, _b2;
    const l = ((_a3 = Z(o)) == null ? void 0 : _a3.rate) || 1, y = ((_b2 = Z(_)) == null ? void 0 : _b2.rate) || 1, xe = (parseFloat(d) || 0) / l * y;
    S(xe.toFixed(2));
  }, Q = () => {
    const l = o;
    x(_), k(l);
  }, V = (l, y) => {
    const L = Z(l);
    return L ? `${L.symbol} ${y}` : y;
  };
  useEffect(() => {
    K();
  }, [d, o, _, U]);
  const i = ["1", "10", "100", "1000", "10000"];
  return useEffect(() => {
    const l = (y) => {
      r && y.key === "Escape" && p();
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [r, p]), r ? jsx("div", { className: "fixed inset-0 z-[99] overflow-y-auto", children: jsxs("div", { className: "flex min-h-screen items-start justify-center p-2 sm:p-4 py-4 sm:py-8", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsxs("div", { className: "relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto mt-8 sm:mt-16", children: [jsx("div", { className: "bg-gray-800 px-6 py-4 rounded-t-2xl", children: jsxs("div", { className: "flex items-center justify-between", children: [jsxs("div", { className: "flex items-center gap-2", children: [jsx(DollarSign, { className: "w-5 h-5 text-white" }), jsx("h2", { className: "text-lg font-medium text-white", children: "Currency Converter" }), N && jsx("span", { className: "text-xs bg-green-500 text-white px-2 py-1 rounded-full", children: "Live" })] }), jsxs("div", { className: "flex items-center gap-2", children: [jsx("button", { onClick: ae, disabled: f, className: "text-gray-300 hover:text-white transition-colors disabled:opacity-50", "aria-label": "Refresh exchange rates", title: "Refresh rates", children: jsx(RefreshCw, { className: `w-4 h-4 ${f ? "animate-spin" : ""}` }) }), jsx("button", { onClick: p, className: "text-gray-300 hover:text-white transition-colors", "aria-label": "Close currency converter", children: jsx(X, { className: "w-5 h-5" }) })] })] }) }), jsxs("div", { className: "p-6", children: [jsx("div", { className: "mb-4 text-xs text-center", children: f ? jsx("span", { className: "text-blue-500", children: "\u{1F504} Updating exchange rates..." }) : N ? jsxs("span", { className: "text-green-600", children: ["\u2705 Live rates ", P && `(Updated: ${P})`] }) : jsx("span", { className: "text-amber-600", children: "\u26A0\uFE0F Using fallback rates (Dec 31, 2024)" }) }), jsxs("div", { className: "mb-6", children: [jsx("label", { htmlFor: "amount", className: "block text-sm font-medium text-gray-700 mb-2", children: "Amount" }), jsx("input", { type: "number", id: "amount", value: d, onChange: (l) => h(l.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter amount", min: "0", step: "any" }), jsx("div", { className: "flex gap-2 mt-3", children: i.map((l) => jsx("button", { onClick: () => h(l), className: "px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors", children: l }, l)) })] }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end", children: [jsxs("div", { className: "relative", children: [jsx("label", { htmlFor: "from-currency", className: "block text-sm font-medium text-gray-700 mb-2", children: "From" }), jsx("select", { id: "from-currency", value: o, onChange: (l) => x(l.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white", style: { backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e")`, backgroundPosition: "right 12px center", backgroundRepeat: "no-repeat", backgroundSize: "16px" }, children: U.map((l) => jsxs("option", { value: l.code, children: [l.code, " - ", l.name] }, l.code)) })] }), jsx("div", { className: "flex justify-center", children: jsx("button", { onClick: Q, className: "p-3 hover:bg-gray-100 rounded-lg transition-colors", "aria-label": "Swap currencies", children: jsx(ArrowRightLeft, { className: "w-5 h-5 text-gray-600" }) }) }), jsxs("div", { className: "relative", children: [jsx("label", { htmlFor: "to-currency", className: "block text-sm font-medium text-gray-700 mb-2", children: "To" }), jsx("select", { id: "to-currency", value: _, onChange: (l) => k(l.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white", style: { backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e")`, backgroundPosition: "right 12px center", backgroundRepeat: "no-repeat", backgroundSize: "16px" }, children: U.map((l) => jsxs("option", { value: l.code, children: [l.code, " - ", l.name] }, l.code)) })] })] }), jsx("div", { className: "bg-blue-50 rounded-lg p-4 mb-4", children: jsxs("div", { className: "text-center", children: [jsx("div", { className: "text-sm text-gray-600 mb-1", children: V(o, d) }), jsx("div", { className: "text-sm text-gray-400 mb-2", children: "=" }), jsx("div", { className: "text-2xl font-bold text-blue-600", children: V(_, I) })] }) }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [jsxs("div", { className: "text-center text-xs text-gray-500", children: [jsxs("p", { children: ["1 ", o, " = ", (((_a2 = Z(_)) == null ? void 0 : _a2.rate) / ((_b = Z(o)) == null ? void 0 : _b.rate)).toFixed(4), " ", _] }), jsx("p", { className: "mt-1", children: N ? "Live exchange rates from exchangerate-api.com" : "Fallback rates for reference only" })] }), jsxs("div", { children: [jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "Popular Conversions" }), jsx("div", { className: "grid grid-cols-2 gap-2", children: [{ from: "USD", to: "INR" }, { from: "EUR", to: "USD" }, { from: "GBP", to: "USD" }, { from: "USD", to: "JPY" }].map((l, y) => jsxs("button", { onClick: () => {
    x(l.from), k(l.to);
  }, className: "px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left", children: [l.from, " \u2192 ", l.to] }, y)) })] })] })] })] })] }) }) : null;
}
const De = [{ name: "India Standard Time", code: "Asia/Kolkata", offset: "+05:30", city: "Mumbai", country: "India", flag: "\u{1F1EE}\u{1F1F3}" }, { name: "Eastern Standard Time", code: "America/New_York", offset: "-05:00", city: "New York", country: "United States", flag: "\u{1F1FA}\u{1F1F8}" }, { name: "Pacific Standard Time", code: "America/Los_Angeles", offset: "-08:00", city: "Los Angeles", country: "United States", flag: "\u{1F1FA}\u{1F1F8}" }, { name: "Greenwich Mean Time", code: "Europe/London", offset: "+00:00", city: "London", country: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" }, { name: "Central European Time", code: "Europe/Paris", offset: "+01:00", city: "Paris", country: "France", flag: "\u{1F1EB}\u{1F1F7}" }, { name: "Japan Standard Time", code: "Asia/Tokyo", offset: "+09:00", city: "Tokyo", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}" }, { name: "China Standard Time", code: "Asia/Shanghai", offset: "+08:00", city: "Shanghai", country: "China", flag: "\u{1F1E8}\u{1F1F3}" }, { name: "Australian Eastern Time", code: "Australia/Sydney", offset: "+11:00", city: "Sydney", country: "Australia", flag: "\u{1F1E6}\u{1F1FA}" }, { name: "Dubai Standard Time", code: "Asia/Dubai", offset: "+04:00", city: "Dubai", country: "UAE", flag: "\u{1F1E6}\u{1F1EA}" }, { name: "Singapore Standard Time", code: "Asia/Singapore", offset: "+08:00", city: "Singapore", country: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" }, { name: "Central Standard Time", code: "America/Chicago", offset: "-06:00", city: "Chicago", country: "United States", flag: "\u{1F1FA}\u{1F1F8}" }, { name: "Mountain Standard Time", code: "America/Denver", offset: "-07:00", city: "Denver", country: "United States", flag: "\u{1F1FA}\u{1F1F8}" }, { name: "Brazil Time", code: "America/Sao_Paulo", offset: "-03:00", city: "S\xE3o Paulo", country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" }, { name: "Argentina Time", code: "America/Buenos_Aires", offset: "-03:00", city: "Buenos Aires", country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" }, { name: "South Africa Time", code: "Africa/Johannesburg", offset: "+02:00", city: "Johannesburg", country: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" }, { name: "Moscow Time", code: "Europe/Moscow", offset: "+03:00", city: "Moscow", country: "Russia", flag: "\u{1F1F7}\u{1F1FA}" }, { name: "Korea Standard Time", code: "Asia/Seoul", offset: "+09:00", city: "Seoul", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" }, { name: "Thailand Time", code: "Asia/Bangkok", offset: "+07:00", city: "Bangkok", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" }, { name: "Indonesia Time", code: "Asia/Jakarta", offset: "+07:00", city: "Jakarta", country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" }, { name: "Turkey Time", code: "Europe/Istanbul", offset: "+03:00", city: "Istanbul", country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" }];
function Ma({ isOpen: r, onClose: p }) {
  var _a2, _b, _c, _d, _e2;
  const [d, h] = useState({}), [o, x] = useState("Asia/Kolkata"), [_, k] = useState("world-clock"), [I, S] = useState(""), [f, T] = useState("Asia/Kolkata"), [P, C] = useState({}), [N, M] = useState(null), [w, U] = useState(""), A = () => {
    const i = {};
    De.forEach((l) => {
      const y = /* @__PURE__ */ new Date(), L = new Intl.DateTimeFormat("en-US", { timeZone: l.code, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, weekday: "short", month: "short", day: "numeric" });
      i[l.code] = L.format(y);
    }), h(i);
  };
  useEffect(() => {
    if (r) {
      A();
      const i = setInterval(A, 1e3);
      return () => clearInterval(i);
    }
  }, [r]), useEffect(() => {
    const i = (l) => {
      r && l.key === "Escape" && p();
    };
    return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
  }, [r, p]);
  const ae = (i) => {
    const l = /* @__PURE__ */ new Date(), y = new Intl.DateTimeFormat("en-US", { timeZone: i, weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(l), L = new Intl.DateTimeFormat("en-US", { timeZone: i, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(l);
    return { date: y, time: L };
  }, Z = (i) => {
    if (!I) return "No time selected";
    try {
      const [l, y] = I.split(":").map(Number), L = /* @__PURE__ */ new Date(), de = L.getFullYear(), xe = L.getMonth() + 1, Me = L.getDate(), Ce = `${de}-${String(xe).padStart(2, "0")}-${String(Me).padStart(2, "0")}`, Se = `${String(l).padStart(2, "0")}:${String(y).padStart(2, "0")}:00`, Ee = /* @__PURE__ */ new Date(), se = new Intl.DateTimeFormat("sv-SE", { timeZone: f, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(Ee), ie = new Intl.DateTimeFormat("sv-SE", { timeZone: i, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(Ee), ye = new Date(se), Te = new Date(ie).getTime() - ye.getTime(), qe = /* @__PURE__ */ new Date(`${Ce}T${Se}`), B = new Date(qe.getTime() + Te);
      return new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(B);
    } catch (l) {
      return console.error("Timezone conversion error:", l), "Unable to convert time";
    }
  }, K = (i) => {
    if (!I) {
      alert("Please select a time first!");
      return;
    }
    const l = Z(i.code);
    U(l), M(i);
  };
  if (useEffect(() => {
    const i = setInterval(A, 1e3);
    return () => clearInterval(i);
  }, []), useEffect(() => {
    if (!I) {
      const l = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5);
      S(l);
    }
  }, [_]), !r) return null;
  const Q = De.find((i) => i.code === o), V = Q ? ae(Q.code) : null;
  return jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: [jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden", children: [jsxs("div", { className: "bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex items-center justify-between", children: [jsxs("div", { className: "flex items-center space-x-3", children: [jsx(Globe, { className: "w-6 h-6 text-white" }), jsx("h2", { className: "text-xl font-bold text-white", children: "Time Zone Converter" })] }), jsx("button", { onClick: p, className: "text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10", children: jsx(X, { className: "w-6 h-6" }) })] }), jsx("div", { className: "border-b border-gray-200 bg-white", children: jsxs("div", { className: "flex", children: [jsxs("button", { onClick: () => k("world-clock"), className: `flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${_ === "world-clock" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`, children: [jsx(Clock, { className: "w-4 h-4" }), "World Clock"] }), jsxs("button", { onClick: () => k("custom-converter"), className: `flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${_ === "custom-converter" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`, children: [jsx(Calendar, { className: "w-4 h-4" }), "Custom Converter"] })] }) }), jsxs("div", { className: "p-6 max-h-[calc(90vh-180px)] overflow-y-auto", children: [_ === "world-clock" && jsxs(Fragment, { children: [V && Q && jsx("div", { className: "mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200", children: jsxs("div", { className: "text-center", children: [jsx("div", { className: "text-3xl mb-2", children: Q.flag }), jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: Q.name }), jsxs("p", { className: "text-sm text-gray-600 mb-3", children: [Q.city, ", ", Q.country, " (", Q.offset, ")"] }), jsx("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: V.time }), jsx("div", { className: "text-sm text-gray-700", children: V.date })] }) }), jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: De.map((i) => {
    var _a3, _b2, _c2;
    return jsx("button", { onClick: () => x(i.code), className: `
                      p-4 rounded-xl border-2 transition-all text-left hover:shadow-md
                      ${o === i.code ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"}
                    `, children: jsxs("div", { className: "space-y-2", children: [jsxs("div", { className: "flex justify-between items-start", children: [jsxs("div", { className: "flex items-center gap-2 flex-1", children: [jsx("span", { className: "text-lg", children: i.flag }), jsxs("div", { children: [jsx("h4", { className: "font-semibold text-gray-800 text-sm leading-tight", children: i.city }), jsx("p", { className: "text-xs text-gray-500", children: i.country })] })] }), jsx("div", { className: "text-xs text-gray-500", children: i.offset })] }), jsxs("div", { className: "text-right", children: [jsx("div", { className: "text-lg font-bold text-gray-900", children: ((_b2 = (_a3 = d[i.code]) == null ? void 0 : _a3.split(",")[1]) == null ? void 0 : _b2.split(" ").slice(1, 3).join(" ")) || "--:--" }), jsx("div", { className: "text-xs text-gray-600", children: ((_c2 = d[i.code]) == null ? void 0 : _c2.split(",")[0]) || "---" })] })] }) }, i.code);
  }) }), jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [jsxs("h4", { className: "font-semibold text-gray-800 mb-2 flex items-center", children: [jsx(Clock, { className: "w-4 h-4 mr-2" }), "World Clock Information"] }), jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [jsx("p", { children: "\u2022 Times are updated every second in real-time" }), jsx("p", { children: "\u2022 Click on any time zone to view detailed information" }), jsx("p", { children: "\u2022 All times account for Daylight Saving Time automatically" })] })] })] }), _ === "custom-converter" && jsxs(Fragment, { children: [jsxs("div", { className: "mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200", children: [jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center", children: [jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Custom Time Converter"] }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Enter Time (24-hour format)" }), jsx("input", { type: "time", value: I, onChange: (i) => S(i.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Source Time Zone" }), jsx("select", { value: f, onChange: (i) => T(i.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none", children: De.map((i) => jsxs("option", { value: i.code, children: [i.flag, " ", i.city, ", ", i.country, " (", i.offset, ")"] }, i.code)) })] })] }), jsxs("div", { className: "mt-4 p-3 bg-white rounded-lg border", children: [jsxs("p", { className: "text-sm text-gray-600", children: [jsx("strong", { children: "Converting:" }), " ", I, " in ", (_a2 = De.find((i) => i.code === f)) == null ? void 0 : _a2.city, ", ", (_b = De.find((i) => i.code === f)) == null ? void 0 : _b.country] }), jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Example: If it's ", I, " in ", (_c = De.find((i) => i.code === f)) == null ? void 0 : _c.city, ", what time is it around the world?"] })] })] }), jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: De.map((i) => jsx("button", { onClick: () => K(i), className: "p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:shadow-lg transition-all text-left group", disabled: !I, children: jsxs("div", { className: "space-y-2", children: [jsxs("div", { className: "flex items-center gap-2", children: [jsx("span", { className: "text-lg", children: i.flag }), jsxs("div", { children: [jsx("h4", { className: "font-semibold text-gray-800 text-sm", children: i.city }), jsx("p", { className: "text-xs text-gray-500", children: i.country })] })] }), jsxs("div", { className: "text-right", children: [jsx("div", { className: "text-xs text-gray-500", children: i.offset }), jsx("div", { className: "text-xs text-purple-600 group-hover:text-purple-700 mt-1", children: I ? "Click to convert" : "Select time first" })] })] }) }, i.code)) }), jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [jsxs("h4", { className: "font-semibold text-gray-800 mb-2 flex items-center", children: [jsx(Globe, { className: "w-4 h-4 mr-2" }), "How to Use Custom Converter"] }), jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [jsx("p", { children: "\u2022 1. Enter the time and select source timezone above" }), jsx("p", { children: "\u2022 2. Click on any country card to see the converted time" }), jsx("p", { children: "\u2022 3. Perfect for scheduling international meetings and calls" }), jsx("p", { children: "\u2022 4. All conversions account for Daylight Saving Time automatically" })] })] })] })] })] }), N && jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]", children: jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-md", children: [jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl", children: [jsxs("div", { className: "flex items-center space-x-3", children: [jsx("span", { className: "text-2xl", children: N.flag }), jsxs("div", { children: [jsx("h3", { className: "text-lg font-bold text-white", children: N.city }), jsx("p", { className: "text-sm text-purple-100", children: N.country })] })] }), jsx("button", { onClick: () => M(null), className: "text-white hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-white/10", children: jsx(X, { className: "w-6 h-6" }) })] }), jsx("div", { className: "p-6", children: jsxs("div", { className: "text-center space-y-4", children: [jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [jsx("h4", { className: "text-sm font-medium text-gray-600 mb-1", children: "Original Time" }), jsxs("div", { className: "text-lg font-semibold text-gray-800", children: [I, " in ", (_d = De.find((i) => i.code === f)) == null ? void 0 : _d.city] }), jsx("div", { className: "text-xs text-gray-500", children: (_e2 = De.find((i) => i.code === f)) == null ? void 0 : _e2.country })] }), jsx("div", { className: "flex justify-center", children: jsx("div", { className: "w-6 h-6 text-purple-600", children: jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) }) }) }), jsxs("div", { className: "p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200", children: [jsx("h4", { className: "text-sm font-medium text-purple-700 mb-2", children: "Converted Time" }), jsx("div", { className: "text-2xl font-bold text-purple-800 mb-2", children: w.includes(" on ") ? w.split(" on ")[0] : w }), jsx("div", { className: "text-sm text-purple-600", children: w.includes(" on ") ? w.split(" on ")[1] : "" }), jsxs("div", { className: "text-xs text-gray-500 mt-2", children: [N.offset, " UTC"] })] }), jsx("button", { onClick: () => M(null), className: "w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors", children: "Close" })] }) })] }) })] });
}
function Ua() {
  var _a2, _b, _c, _d, _e2, _f, _g, _h;
  const [r, p] = useState(false), [d, h] = useState(false), [o, x] = useState(false), [_, k] = useState(false), [I, S] = useState(false), { user: f } = useRouteContext({ from: "__root__" }), T = useNavigate(), P = (A) => {
    A.preventDefault(), h(true);
  }, C = (A) => {
    A.preventDefault(), x(true);
  }, N = (A) => {
    A.preventDefault(), k(true);
  }, M = (A) => {
    A.preventDefault(), S(true);
  }, w = (A) => {
    A.preventDefault(), T({ to: "/time-management" });
  }, U = (A) => {
    A.preventDefault(), T({ to: "/app", search: { tab: "profile" } });
  };
  return jsxs(Fragment, { children: [jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm", children: jsxs("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8", children: [jsxs("div", { className: "flex items-center justify-between h-16 sm:h-18", children: [jsx("div", { className: "flex items-center", children: jsx(Link, { to: "/", className: "flex-shrink-0", children: jsx("img", { src: "/upcr-logo.png", alt: "UPC Resources Logo", className: "h-8 sm:h-10 w-auto object-contain", loading: "eager" }) }) }), jsxs("div", { className: "flex items-center gap-2 sm:gap-4 lg:gap-6", children: [jsx("div", { className: "hidden lg:block", children: jsx("input", { type: "search", placeholder: "Search for products...", className: "w-[30rem] px-4 py-2.5 border-2 border-gray-200 rounded-full text-sm sm:text-base outline-none transition-colors focus:border-blue-400 bg-gray-50 focus:bg-white", autoComplete: "off", "aria-label": "Search products" }) }), jsxs("div", { className: "hidden lg:flex items-center gap-4 xl:gap-6", children: [jsx("button", { onClick: P, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Calculator", "aria-label": "Calculator", children: jsx("img", { src: "/calculator.png", alt: "Calculator", className: "w-10 h-10 object-contain" }) }), jsx("button", { onClick: C, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Calendar", "aria-label": "Calendar", children: jsx("img", { src: "/calendar.png", alt: "Calendar", className: "w-10 h-10 object-contain" }) }), jsx("button", { onClick: N, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Currency Converter", "aria-label": "Currency Converter", children: jsx("img", { src: "/currency.png", alt: "Currency Converter", className: "w-10 h-10 object-contain" }) }), jsx("button", { onClick: M, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Time Zone Converter", "aria-label": "Time Zone Converter", children: jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: jsxs("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("polyline", { points: "12,6 12,12 16,14" })] }) }) }), jsx("button", { onClick: w, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Time Management", "aria-label": "Time Management", children: jsx("img", { src: "/time-management.png", alt: "Time Management", className: "w-10 h-10 object-contain" }) })] }), jsxs("div", { className: "hidden md:flex lg:hidden items-center gap-2", children: [jsx("button", { onClick: P, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Calculator", "aria-label": "Calculator", children: jsx("img", { src: "/calculator.png", alt: "Calculator", className: "w-8 h-8 object-contain" }) }), jsx("button", { onClick: C, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Calendar", "aria-label": "Calendar", children: jsx("img", { src: "/calendar.png", alt: "Calendar", className: "w-8 h-8 object-contain" }) }), jsx("button", { onClick: N, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Currency Converter", "aria-label": "Currency Converter", children: jsx("img", { src: "/currency.png", alt: "Currency Converter", className: "w-8 h-8 object-contain" }) }), jsx("button", { onClick: M, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Time Zone Converter", "aria-label": "Time Zone Converter", children: jsx("div", { className: "w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: jsxs("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("polyline", { points: "12,6 12,12 16,14" })] }) }) }), jsx("button", { onClick: w, className: "transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg", title: "Time Management", "aria-label": "Time Management", children: jsx("img", { src: "/time-management.png", alt: "Time Management", className: "w-8 h-8 object-contain" }) })] }), f ? jsx("button", { onClick: U, className: "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0", title: f.name || f.email, "aria-label": "Profile", children: f.profile_image_url ? jsx("img", { src: f.profile_image_url, alt: "Profile", className: "w-5 h-5 sm:w-6 sm:h-6 rounded-full" }) : jsx("span", { className: "text-blue-600 font-medium text-xs sm:text-sm", children: ((_b = (_a2 = f.name) == null ? void 0 : _a2[0]) == null ? void 0 : _b.toUpperCase()) || ((_d = (_c = f.email) == null ? void 0 : _c[0]) == null ? void 0 : _d.toUpperCase()) || "P" }) }) : jsxs(Link, { to: "/login", search: { redirect: "/" }, className: "bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors", "aria-label": "Login", children: [jsx("span", { className: "hidden sm:inline", children: "Login" }), jsx("span", { className: "sm:hidden", children: "In" })] }), jsx("button", { onClick: () => p(!r), className: "md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": r ? "Close menu" : "Open menu", "aria-expanded": r, "aria-controls": "mobile-menu", children: jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: r ? jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) : jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) })] })] }), jsx("div", { id: "mobile-menu", className: `
              md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100
              ${r ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `, "aria-hidden": !r, children: jsxs("div", { className: "py-4 space-y-3", children: [jsx("div", { className: "px-1", children: jsx("input", { type: "search", placeholder: "Search for products...", className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-blue-400 bg-gray-50 focus:bg-white", autoComplete: "off", "aria-label": "Search products" }) }), jsxs("div", { className: "grid grid-cols-2 gap-3 px-1", children: [jsxs("button", { onClick: P, className: "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all", children: [jsx("img", { src: "/calculator.png", alt: "Calculator", className: "w-10 h-10 object-contain" }), jsx("span", { className: "text-blue-700 font-medium", children: "Calculator" })] }), jsxs("button", { onClick: C, className: "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:from-red-100 hover:to-red-200 transition-all", children: [jsx("img", { src: "/calendar.png", alt: "Calendar", className: "w-10 h-10 object-contain" }), jsx("span", { className: "text-red-700 font-medium", children: "Calendar" })] }), jsxs("button", { onClick: N, className: "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200 transition-all", children: [jsx("img", { src: "/currency.png", alt: "Currency Converter", className: "w-10 h-10 object-contain" }), jsx("span", { className: "text-green-700 font-medium", children: "Currency" })] }), jsxs("button", { onClick: M, className: "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all", children: [jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: jsxs("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("polyline", { points: "12,6 12,12 16,14" })] }) }), jsx("span", { className: "text-orange-700 font-medium", children: "Time Zone" })] }), jsxs("button", { onClick: w, className: "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 hover:from-indigo-100 hover:to-purple-200 transition-all", children: [jsx("img", { src: "/time-management.png", alt: "Time Management", className: "w-10 h-10 object-contain" }), jsx("span", { className: "text-indigo-700 font-medium", children: "Time Management" })] })] }), f ? jsx("div", { className: "px-1 pt-2 border-t border-gray-100", children: jsxs("button", { onClick: U, className: "w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors", title: f.name || f.email, "aria-label": "Profile", children: [f.profile_image_url ? jsx("img", { src: f.profile_image_url, alt: "Profile", className: "w-8 h-8 rounded-full" }) : jsx("div", { className: "w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center", children: jsx("span", { className: "text-blue-600 font-medium text-sm", children: ((_f = (_e2 = f.name) == null ? void 0 : _e2[0]) == null ? void 0 : _f.toUpperCase()) || ((_h = (_g = f.email) == null ? void 0 : _g[0]) == null ? void 0 : _h.toUpperCase()) || "P" }) }), jsxs("div", { className: "text-left", children: [jsx("div", { className: "text-sm font-medium text-gray-900", children: f.name || "User Profile" }), jsx("div", { className: "text-xs text-gray-500", children: "View profile settings" })] })] }) }) : jsx("div", { className: "px-1 pt-2", children: jsx(Link, { to: "/login", search: { redirect: "/" }, className: "w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center block", "aria-label": "Login", children: "Login to Your Account" }) })] }) })] }) }), jsx(La, { isOpen: d, onClose: () => h(false) }), jsx(Da, { isOpen: o, onClose: () => x(false) }), jsx(ja, { isOpen: _, onClose: () => k(false) }), jsx(Ma, { isOpen: I, onClose: () => S(false) })] });
}
async function $a(r, p, d) {
  var h;
  const o = p[0];
  if (isPlainObject$1(o) && o.method) {
    const k = o, I = k.data instanceof FormData ? "formData" : "payload", S = new Headers({ ...I === "payload" ? { "content-type": "application/json", accept: "application/json" } : {}, ...k.headers instanceof Headers ? Object.fromEntries(k.headers.entries()) : k.headers });
    if (k.method === "GET") {
      const P = encode$1({ payload: startSerializer.stringify({ data: k.data, context: k.context }) });
      P && (r.includes("?") ? r += `&${P}` : r += `?${P}`);
    }
    r.includes("?") ? r += "&createServerFn" : r += "?createServerFn", k.response === "raw" && (r += "&raw");
    const f = await d(r, { method: k.method, headers: S, signal: k.signal, ...Oa(k) }), T = await qt(f);
    if ((h = T.headers.get("content-type")) != null && h.includes("application/json")) {
      const P = startSerializer.decode(await T.json());
      if (isRedirect(P) || isNotFound(P) || P instanceof Error) throw P;
      return P;
    }
    return T;
  }
  const x = await qt(await d(r, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(p) })), _ = x.headers.get("content-type");
  return _ && _.includes("application/json") ? startSerializer.decode(await x.json()) : x.text();
}
function Oa(r) {
  var _a2;
  return r.method === "POST" ? r.data instanceof FormData ? (r.data.set("__TSR_CONTEXT", startSerializer.stringify(r.context)), { body: r.data }) : { body: startSerializer.stringify({ data: (_a2 = r.data) != null ? _a2 : null, context: r.context }) } : {};
}
async function qt(r) {
  if (!r.ok) {
    const p = r.headers.get("content-type");
    throw p && p.includes("application/json") ? startSerializer.decode(await r.json()) : new Error(await r.text());
  }
  return r;
}
function qa(r) {
  return r.replace(/^\/|\/$/g, "");
}
const O = (r, p) => {
  const d = `/${qa(p)}/${r}`;
  return Object.assign((...o) => $a(d, o, async (x, _) => {
    _.headers = mergeHeaders$2(getHeaders(), _.headers);
    const k = await $fetch.native(x, _), I = getEvent(), S = mergeHeaders$2(k.headers, I.___ssrRpcResponseHeaders);
    return I.___ssrRpcResponseHeaders = S, k;
  }), { url: d, functionId: r });
}, za = z.object({ email: z.string().email(), password: z.string().min(6) }), Ba = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8).max(100).regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"), resources: z.array(z.string()).min(1, "Select at least one resource"), primaryResource: z.array(z.string()).min(1, "Select a primary resource") }), Wa = O("app_routes_api_auth_ts--loginUser_createServerFn_handler", "/_server"), Eo = createServerFn({ method: "POST", response: "data" }).validator((r) => za.parse(r)).handler(Wa), Ga = O("app_routes_api_auth_ts--refreshToken_createServerFn_handler", "/_server");
createServerFn({ method: "POST" }).handler(Ga);
const Ha = O("app_routes_api_auth_ts--validateAccessToken_createServerFn_handler", "/_server"), _t = createServerFn({ method: "GET", response: "data" }).handler(Ha), Ka = O("app_routes_api_auth_ts--createUser_createServerFn_handler", "/_server"), Lo = createServerFn({ method: "POST", response: "data" }).validator((r) => Ba.parse(r)).handler(Ka), Va = O("app_routes_api_auth_ts--updateUserProfile_createServerFn_handler", "/_server"), Ya = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ name: z.string().min(1, "Name is required"), profile_image_url: z.string().url().nullable().optional(), resources: z.array(z.string()).optional(), primaryResource: z.array(z.string()).optional() }).parse(r)).handler(Va), Za = O("app_routes_api_auth_ts--logoutUser_createServerFn_handler", "/_server"), Ja = createServerFn({ method: "POST", response: "data" }).handler(Za), or = createContext$1(void 0);
function Qa({ children: r }) {
  const [p, d] = useState(null);
  return jsx(or.Provider, { value: { selectedCategory: p, setSelectedCategory: d }, children: r });
}
function Do() {
  const r = useContext(or);
  if (r === void 0) throw new Error("useCategory must be used within a CategoryProvider");
  return r;
}
const ge = createRootRoute({ component: Xa, beforeLoad: async () => {
  const r = await _t();
  return { user: r.success ? r.user : null };
}, errorComponent: ({ error: r }) => jsx(sr, { children: jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: jsx("div", { className: "max-w-md w-full space-y-8 p-6", children: jsxs("div", { className: "text-center", children: [jsx("h1", { className: "text-xl font-semibold text-red-600", children: "Oops! Something went wrong" }), jsx("p", { className: "mt-2 text-gray-600", children: (r == null ? void 0 : r.message) || "An unexpected error occurred" }), jsx(Link, { to: "/", className: "mt-4 inline-block text-blue-600 hover:text-blue-500", children: "Return to home" })] }) }) }) }) });
function sr({ children: r }) {
  return jsxs("html", { lang: "en", className: "scroll-smooth", children: [jsxs("head", { children: [jsx("meta", { charSet: "utf-8" }), jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), jsx("title", { children: "UPCR" }), jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }), jsx("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }), jsx("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", rel: "stylesheet" }), jsx("link", { rel: "stylesheet", href: "/assets/ssr.css" }), jsx("link", { rel: "icon", type: "image/png", href: "/upcr-logo.png" }), jsx(HeadContent, {})] }), jsxs("body", { className: "min-h-screen bg-white", children: [jsx("div", { id: "app-content", children: r }), jsx(Toaster, { position: "top-right" }), jsx(Scripts, {})] })] });
}
function Xa() {
  const { state: { location: r } } = useRouter();
  return r.pathname, jsx(Qa, { children: jsxs(sr, { children: [jsx(Ua, {}), jsx("div", { className: "pt-16", children: jsx(Outlet, {}) })] }) });
}
const el = () => import('../build/time-management.mjs'), ir = createFileRoute("/time-management")({ component: lazyRouteComponent(el, "component", () => ir.ssr) }), E = pgTable("users", { id: serial("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(), password: text("password").notNull(), verified: boolean("verified").default(false).notNull(), is_admin: boolean("is_admin").default(false).notNull(), profile_image_url: text("profile_image_url"), resources: text("resources").array().default([]), primaryResource: text("primary_resource").array().default([]), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), ze = pgTable("sellers", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull().unique(), company_name: text("company_name").notNull(), business_type: text("business_type").notNull(), address: text("address").notNull(), phone: text("phone").notNull(), website: text("website"), description: text("description"), profile_picture_url: text("profile_picture_url"), aadhar_url: text("aadhar_url"), gst_certificate_url: text("gst_certificate_url"), work_photos_urls: text("work_photos_urls").array(), owner_photos_urls: text("owner_photos_urls").array(), skills: text("skills").array().default([]), languages: text("languages").array().default([]), average_rating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"), total_reviews: integer("total_reviews").default(0), is_verified: boolean("is_verified").default(false).notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
pgTable("portfolios", { id: serial("id").primaryKey(), seller_id: integer("seller_id").references(() => ze.id).notNull(), title: text("title").notNull(), description: text("description").notNull(), image_url: text("image_url").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
pgTable("gigs", { id: serial("id").primaryKey(), seller_id: integer("seller_id").references(() => ze.id).notNull(), title: text("title").notNull(), description: text("description").notNull(), image_url: text("image_url").notNull(), price: decimal("price", { precision: 10, scale: 2 }).notNull(), status: text("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
const ke = pgEnum("post_status", ["active", "inactive", "pending", "expired"]), kt = pgEnum("engineering_category", ["civil", "mechanical", "electrical", "chemical", "environmental"]), tl = pgEnum("land_type", ["residential", "commercial", "agricultural", "industrial", "vacant"]), mt = pgEnum("condition", ["new", "like-new", "excellent", "good", "fair", "used", "refurbished", "needs-repair", "for-parts"]), rl = pgEnum("material_type", ["cement", "steel", "bricks", "sand", "wood", "pipes", "electrical", "other"]), al = pgEnum("job_type", ["full-time", "part-time", "contract", "freelance", "internship", "temporary"]), cr = pgEnum("experience_level", ["entry", "junior", "mid", "senior", "lead", "executive"]), ll = pgEnum("equipment_category", ["power-tools", "hand-tools", "safety", "measuring", "lifting", "cutting", "drilling", "other"]), nl = pgEnum("tool_category", ["hand-tools", "power-tools", "measuring", "cutting", "drilling", "garden", "specialty", "other"]), dr = pgEnum("availability", ["for-sale", "for-rent", "both"]), ol = pgEnum("manpower_category", ["construction", "skilled-labor", "technical", "supervisory", "cleaning", "security", "maintenance", "other"]), sl = pgEnum("financial_service", ["construction-loan", "business-loan", "equipment-finance", "working-capital", "project-finance", "personal-loan", "investment", "insurance", "other"]), il = pgEnum("project_category", ["residential", "commercial", "infrastructure", "renovation", "interior", "landscaping", "engineering", "other"]), cl = pgEnum("auction_category", ["equipment", "vehicles", "machinery", "tools", "materials", "property", "antiques", "other"]), dl = pgEnum("store_category", ["construction-supplies", "tools-equipment", "building-materials", "safety-gear", "electrical", "plumbing", "hardware", "machinery", "general", "other"]), ul = pgEnum("delivery_option", ["pickup", "delivery", "both"]), ml = pgEnum("unit", ["kg", "tons", "bags", "pieces", "meters", "sqft", "cuft", "liters"]), zt = pgTable("tenders", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), upc_ref: varchar("upc_ref", { length: 100 }).notNull().unique(), engineering_category: kt("engineering_category").notNull(), specialization: text("specialization").notNull(), tender_name: text("tender_name").notNull(), location: text("location").notNull(), scope: text("scope").notNull(), estimated_value: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(), collection_date: timestamp("collection_date").notNull(), submission_date: timestamp("submission_date").notNull(), contact_name: text("contact_name").notNull(), contact_number: text("contact_number").notNull(), contact_email: text("contact_email").notNull(), address: text("address").notNull(), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Bt = pgTable("land_listings", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), location: text("location").notNull(), area: decimal("area", { precision: 10, scale: 2 }).notNull(), price: decimal("price", { precision: 15, scale: 2 }).notNull(), land_type: tl("land_type").notNull(), description: text("description").notNull(), image_urls: text("image_urls").array().default([]), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Wt = pgTable("machines", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), type: text("type").notNull(), brand: text("brand").notNull(), model: text("model").notNull(), year: integer("year").notNull(), condition: mt("condition").notNull(), price: decimal("price", { precision: 15, scale: 2 }).notNull(), location: text("location").notNull(), description: text("description").notNull(), image_urls: text("image_urls").array().default([]), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Gt = pgTable("materials", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), type: rl("type").notNull(), quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(), unit: ml("unit").notNull(), price: decimal("price", { precision: 10, scale: 2 }).notNull(), grade: text("grade"), location: text("location").notNull(), delivery: ul("delivery").notNull(), description: text("description").notNull(), image_urls: text("image_urls").array().default([]), certificate_urls: text("certificate_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Ht = pgTable("jobs", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), company: text("company").notNull(), description: text("description").notNull(), requirements: text("requirements").notNull(), salary: text("salary"), location: text("location").notNull(), job_type: al("job_type").notNull(), experience: cr("experience").notNull(), industry: text("industry").notNull(), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Kt = pgTable("equipment", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), category: ll("category").notNull(), type: text("type").notNull(), brand: text("brand"), model: text("model"), year: integer("year"), condition: mt("condition").notNull(), price: decimal("price", { precision: 10, scale: 2 }).notNull(), location: text("location").notNull(), description: text("description").notNull(), image_urls: text("image_urls").array().default([]), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Vt = pgTable("tools", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), category: nl("category").notNull(), type: text("type").notNull(), brand: text("brand"), condition: mt("condition").notNull(), price: decimal("price", { precision: 10, scale: 2 }).notNull(), location: text("location").notNull(), availability: dr("availability").notNull(), description: text("description").notNull(), image_urls: text("image_urls").array().default([]), manual_urls: text("manual_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Yt = pgTable("manpower_services", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), category: ol("category").notNull(), experience: cr("experience").notNull(), availability: dr("availability").notNull(), hourly_rate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(), location: text("location").notNull(), skills: text("skills").notNull(), certification: text("certification"), description: text("description").notNull(), certificate_urls: text("certificate_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Zt = pgTable("financial_services", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), service_type: sl("service_type").notNull(), institution: text("institution").notNull(), location: text("location").notNull(), loan_amount: text("loan_amount"), interest_rate: text("interest_rate"), tenure: text("tenure"), processing_fee: text("processing_fee"), eligibility: text("eligibility").notNull(), description: text("description").notNull(), brochure_urls: text("brochure_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Jt = pgTable("project_showcase", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), category: il("category").notNull(), description: text("description").notNull(), project_date: timestamp("project_date").notNull(), location: text("location").notNull(), client: text("client"), tags: text("tags").array().default([]), achievements: text("achievements"), image_urls: text("image_urls").array().default([]), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Qt = pgTable("auctions", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), category: cl("category").notNull(), description: text("description").notNull(), starting_bid: decimal("starting_bid", { precision: 15, scale: 2 }).notNull(), reserve_price: decimal("reserve_price", { precision: 15, scale: 2 }), auction_start: timestamp("auction_start").notNull(), auction_end: timestamp("auction_end").notNull(), location: text("location").notNull(), condition: mt("condition").notNull(), terms: text("terms"), image_urls: text("image_urls").array().default([]), document_urls: text("document_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), Xt = pgTable("e_stores", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), store_name: text("store_name").notNull(), category: dl("category").notNull(), description: text("description").notNull(), products: text("products").notNull(), pricing: text("pricing").notNull(), shipping_info: text("shipping_info").notNull(), location: text("location").notNull(), business_hours: text("business_hours"), payment_methods: text("payment_methods").notNull(), return_policy: text("return_policy").notNull(), store_image_urls: text("store_image_urls").array().default([]), catalog_urls: text("catalog_urls").array().default([]), status: ke("status").default("active").notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() }), ur = pgEnum("announcement_category", ["PROJECT & CONSTRUCTION RESOURCES", "BUSINESS RESOURCES", "STUDENT RESOURCES"]), mr = pgEnum("announcement_type", ["scroll", "flip"]), gl = pgEnum("announcement_status", ["active", "inactive", "pending"]);
pgTable("announcements", { id: serial("id").primaryKey(), seller_id: integer("seller_id").references(() => ze.id).notNull(), category: ur("category").notNull(), subcategory: text("subcategory").notNull(), title: text("title").notNull(), description: text("description").notNull(), icon: text("icon").notNull(), details: text("details").notNull(), ad_type: mr("ad_type").notNull().default("scroll"), status: gl("status").default("pending").notNull(), start_date: timestamp("start_date").notNull(), end_date: timestamp("end_date"), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
const pl = pgEnum("deal_status", ["active", "completed", "pending"]), hl = pgTable("deals", { id: serial("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(), category: text("category").notNull(), status: pl("status").default("active").notNull(), sender_id: integer("sender_id").references(() => E.id).notNull(), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
pgTable("dms", { id: serial("id").primaryKey(), message: text("message").notNull(), sender_id: integer("sender_id").references(() => E.id).notNull(), receiver_id: integer("receiver_id").references(() => E.id).notNull(), deal_id: integer("deal_id").references(() => hl.id), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull(), is_read: boolean("is_read").default(false).notNull() });
const Ke = pgEnum("product_category", ["Land", "Machines", "Material", "Equipment", "Tools", "Manpower"]), fl = pgEnum("product_status", ["active", "inactive"]);
pgTable("products", { id: serial("id").primaryKey(), seller_id: integer("seller_id").references(() => ze.id).notNull(), name: text("name").notNull(), description: text("description").notNull(), price: decimal("price", { precision: 10, scale: 2 }).notNull(), image: text("image"), category: Ke("category").notNull(), brand_name: text("brand_name"), model: text("model"), material: text("material"), color: text("color"), packaging_details: text("packaging_details"), delivery_info: text("delivery_info"), supply_ability: text("supply_ability"), moq: integer("moq"), status: fl("status").notNull().default("active"), created_at: timestamp("created_at").defaultNow().notNull(), updated_at: timestamp("updated_at").defaultNow().notNull() });
const bl = pgEnum("audit_log_action", ["CREATE", "UPDATE", "DEACTIVATE", "ACTIVATE", "DELETE"]), yl = pgEnum("audit_log_entity_type", ["ANNOUNCEMENT", "PRODUCT", "GIG", "PORTFOLIO", "TENDER", "LAND_LISTING", "MACHINE", "MATERIAL", "JOB", "EQUIPMENT", "TOOL", "MANPOWER_SERVICE", "FINANCIAL_SERVICE", "PROJECT_SHOWCASE", "AUCTION", "E_STORE"]), er = pgTable("notifications", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), title: text("title").notNull(), message: text("message").notNull(), type: text("type").notNull(), entity_id: integer("entity_id").notNull(), is_read: boolean("is_read").default(false).notNull(), created_at: timestamp("created_at").defaultNow().notNull() }), yt = pgTable("audit_logs", { id: serial("id").primaryKey(), user_id: integer("user_id").references(() => E.id).notNull(), seller_id: integer("seller_id").references(() => ze.id).notNull(), entity_type: yl("entity_type").notNull(), entity_id: integer("entity_id").notNull(), action: bl("action").notNull(), changes: text("changes").notNull(), ip_address: text("ip_address"), user_agent: text("user_agent"), created_at: timestamp("created_at").defaultNow().notNull() });
relations(yt, ({ one: r }) => ({ user: r(E, { fields: [yt.user_id], references: [E.id] }), seller: r(ze, { fields: [yt.seller_id], references: [ze.id] }) }));
relations(zt, ({ one: r }) => ({ user: r(E, { fields: [zt.user_id], references: [E.id] }) }));
relations(Bt, ({ one: r }) => ({ user: r(E, { fields: [Bt.user_id], references: [E.id] }) }));
relations(Wt, ({ one: r }) => ({ user: r(E, { fields: [Wt.user_id], references: [E.id] }) }));
relations(Gt, ({ one: r }) => ({ user: r(E, { fields: [Gt.user_id], references: [E.id] }) }));
relations(Ht, ({ one: r }) => ({ user: r(E, { fields: [Ht.user_id], references: [E.id] }) }));
relations(Kt, ({ one: r }) => ({ user: r(E, { fields: [Kt.user_id], references: [E.id] }) }));
relations(Vt, ({ one: r }) => ({ user: r(E, { fields: [Vt.user_id], references: [E.id] }) }));
relations(Yt, ({ one: r }) => ({ user: r(E, { fields: [Yt.user_id], references: [E.id] }) }));
relations(Zt, ({ one: r }) => ({ user: r(E, { fields: [Zt.user_id], references: [E.id] }) }));
relations(Jt, ({ one: r }) => ({ user: r(E, { fields: [Jt.user_id], references: [E.id] }) }));
relations(Qt, ({ one: r }) => ({ user: r(E, { fields: [Qt.user_id], references: [E.id] }) }));
relations(Xt, ({ one: r }) => ({ user: r(E, { fields: [Xt.user_id], references: [E.id] }) }));
relations(er, ({ one: r }) => ({ user: r(E, { fields: [er.user_id], references: [E.id] }) }));
const gr = z.object({ engineering_category: z.enum(kt.enumValues), specialization: z.string().min(1, "Specialization is required"), tender_name: z.string().min(1, "Tender name is required"), location: z.string().min(1, "Location is required"), scope: z.string().min(1, "Scope is required"), estimated_value: z.string().min(1, "Estimated value is required"), collection_date: z.string().min(1, "Collection date is required"), submission_date: z.string().min(1, "Submission date is required"), contact_name: z.string().min(1, "Contact name is required"), contact_number: z.string().min(1, "Contact number is required"), contact_email: z.string().email("Valid email is required"), address: z.string().min(1, "Address is required"), document_urls: z.array(z.string()).optional().default([]) }), vl = O("app_routes_api_tenders_ts--getTenders_createServerFn_handler", "/_server"), xl = createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ category: z.enum(kt.enumValues).optional(), status: z.enum(["active", "inactive", "pending", "expired"]).optional() }).parse(r)).handler(vl), Nl = O("app_routes_api_tenders_ts--getTender_createServerFn_handler", "/_server");
createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ id: z.string() }).parse(r)).handler(Nl);
const wl = O("app_routes_api_tenders_ts--getTenderByUPC_createServerFn_handler", "/_server");
createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ upcRef: z.string().min(1, "UPC reference is required") }).parse(r)).handler(wl);
const _l = O("app_routes_api_tenders_ts--getUserTenders_createServerFn_handler", "/_server");
createServerFn({ method: "GET", response: "data" }).handler(_l);
const kl = O("app_routes_api_tenders_ts--createTender_createServerFn_handler", "/_server"), jo = createServerFn({ method: "POST", response: "data" }).validator((r) => gr.parse(r)).handler(kl), Cl = O("app_routes_api_tenders_ts--updateTender_createServerFn_handler", "/_server");
createServerFn({ method: "POST", response: "data" }).validator((r) => gr.extend({ id: z.number().int().positive("Tender ID is required for update") }).parse(r)).handler(Cl);
const Sl = O("app_routes_api_tenders_ts--deleteTender_createServerFn_handler", "/_server");
createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ id: z.number().int().positive("Tender ID is required") }).parse(r)).handler(Sl);
const Pl = O("app_routes_api_tenders_ts--generateNewUPCRef_createServerFn_handler", "/_server"), pr = createServerFn({ method: "GET", response: "data" }).handler(Pl), Tl = () => import('../build/test-tender.mjs'), hr = createFileRoute("/test-tender")({ component: lazyRouteComponent(Tl, "component", () => hr.ssr), loader: async () => {
  try {
    const r = await pr();
    return { generatedUPC: r.success ? r.upcRef : null, error: r.success ? null : r.error };
  } catch (r) {
    return console.error("Error generating UPC:", r), { generatedUPC: null, error: "Failed to generate UPC" };
  }
} }), Rl = () => import('../build/tenders2.mjs'), fr = createFileRoute("/tenders")({ component: lazyRouteComponent(Rl, "component", () => fr.ssr), loader: async ({ location: r }) => {
  try {
    const p = await _t();
    if (!p.success) throw redirect({ to: "/login", search: { redirect: r.href } });
    const d = await pr(), h = d.success ? d.upcRef : null, o = await xl({ data: {} });
    return { tenders: o.success ? o.tenders : [], error: o.success ? null : o.error, user: p.user, generatedUPC: h };
  } catch (p) {
    if (p && typeof p == "object" && "to" in p) throw p;
    return console.error("Error loading tenders:", p), { tenders: [], error: "Failed to load tenders", user: null, generatedUPC: null };
  }
} }), Al = () => import('../build/suppliers.mjs'), br = createFileRoute("/suppliers")({ component: lazyRouteComponent(Al, "component", () => br.ssr) }), Fl = () => import('../build/solutions.mjs'), yr = createFileRoute("/solutions")({ component: lazyRouteComponent(Fl, "component", () => yr.ssr) }), Il = () => import('../build/signup.mjs'), El = [{ title: "PROJECT & CONSTRUCTION RESOURCES", startAngle: 180, endAngle: 360, background: "#aed581", segments: [{ name: "Land", color: "#F44336", icon: "\u{1F5FA}" }, { name: "Machines", color: "#0D47A1", icon: "\u{1F3D7}" }, { name: "Material", color: "#29B6F6", icon: "\u{1F6E0}" }, { name: "Equipment", color: "#29B6F6", icon: "\u2699\uFE0F" }, { name: "Tools", color: "#29B6F6", icon: "\u{1F527}" }, { name: "Manpower", color: "#29B6F6", icon: "\u{1F465}" }] }, { title: "BUSINESS RESOURCES", startAngle: 0, endAngle: 120, background: "#ffd180", segments: [{ name: "Finance", color: "#9C27B0", icon: "\u{1F4B0}" }, { name: "Tenders", color: "#FFC107", icon: "\u{1F4CB}" }, { name: "Showcase", color: "#FF9800", icon: "\u{1F3AF}" }, { name: "Auction", color: "#4CAF50", icon: "\u{1F528}" }] }, { title: "STUDENT RESOURCES", startAngle: 120, endAngle: 180, background: "#64b5f6", segments: [{ name: "Jobs", color: "#009688", icon: "\u{1F4BC}" }, { name: "E-Stores", color: "#009688", icon: "\u{1F6CD}" }] }];
El.flatMap((r) => r.segments.map((p) => ({ name: p.name, category: r.title, icon: p.icon })));
const vr = createFileRoute("/signup")({ component: lazyRouteComponent(Il, "component", () => vr.ssr) }), Ll = () => import('../build/resource-compass.mjs'), xr = createFileRoute("/resource-compass")({ component: lazyRouteComponent(Ll, "component", () => xr.ssr) }), Dl = () => import('../build/projectandconstruction.mjs'), Nr = createFileRoute("/projectandconstruction")({ component: lazyRouteComponent(Dl, "component", () => Nr.ssr), validateSearch: (r) => ({ category: r.category }) }), jl = () => import('../build/login.mjs'), wr = createFileRoute("/login")({ component: lazyRouteComponent(jl, "component", () => wr.ssr), validateSearch: (r) => ({ redirect: r.redirect }) }), Ml = () => import('../build/deals.mjs'), _r = createFileRoute("/deals")({ component: lazyRouteComponent(Ml, "component", () => _r.ssr) }), Ul = () => import('../build/contact.mjs'), kr = createFileRoute("/contact")({ component: lazyRouteComponent(Ul, "component", () => kr.ssr) }), $l = () => import('../build/categories.mjs'), Cr = createFileRoute("/categories")({ component: lazyRouteComponent($l, "component", () => Cr.ssr) });
function Ol({ user: r, activeTab: p, onTabChange: d }) {
  var _a2, _b;
  const h = useNavigate(), o = (_) => {
    d && d(_);
  }, x = async () => {
    try {
      (await Ja()).success && h({ to: "/" });
    } catch (_) {
      console.error("Logout failed:", _);
    }
  };
  return jsxs("div", { className: "flex flex-col h-full bg-white border-r border-gray-200", children: [jsxs("div", { className: "p-4", children: [jsxs("div", { className: "flex items-center gap-4 mb-6", children: [jsx("div", { className: "w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600", children: r.profile_image_url ? jsx("img", { src: r.profile_image_url, alt: "Profile", className: "w-full h-full object-cover rounded-full" }) : (((_a2 = r.name) == null ? void 0 : _a2[0]) || ((_b = r.email) == null ? void 0 : _b[0]) || "P").toUpperCase() }), jsxs("div", { children: [jsx("h2", { className: "font-semibold", children: r.name }), jsx("p", { className: "text-sm text-gray-500", children: r.email })] })] }), jsxs("div", { className: "space-y-2", children: [jsxs("button", { className: `w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${p === "seller" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"}`, onClick: () => o("seller"), children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }), "Seller Dashboard"] }), jsxs("button", { className: `w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${p === "profile" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"}`, onClick: () => o("profile"), children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), "Profile"] }), r.is_admin && jsxs("button", { className: `w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${p === "audit-logs" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"}`, onClick: () => o("audit-logs"), children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), "Audit Logs"] }), jsxs(Link, { to: "/", className: "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }), "Go to Homepage"] })] })] }), jsx("div", { className: "mt-auto p-4", children: jsxs("button", { onClick: x, className: "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors", children: [jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: jsx("path", { fillRule: "evenodd", d: "M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z", clipRule: "evenodd" }) }), "Logout"] }) })] });
}
const ql = z.object({ userId: z.string(), company_name: z.string().min(1, "Company name is required"), business_type: z.string().min(1, "Business type is required"), address: z.string().min(1, "Address is required"), phone: z.string().min(1, "Phone number is required"), website: z.string().url().nullable().optional(), description: z.string().nullable().optional(), aadhar_url: z.string().url().nullable().optional(), gst_certificate_url: z.string().url().nullable().optional(), work_photos_urls: z.array(z.string().url()).nullable().optional(), owner_photos_urls: z.array(z.string().url()).nullable().optional() }), zl = O("app_routes_api_seller_ts--createSellerProfile_createServerFn_handler", "/_server"), Bl = createServerFn({ method: "POST", response: "data" }).validator((r) => ql.parse(r)).handler(zl), Wl = O("app_routes_api_seller_ts--getSellerStatus_createServerFn_handler", "/_server"), Gl = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ userId: z.string() }).parse(r)).handler(Wl), Hl = O("app_routes_api_seller_ts--getSellerById_createServerFn_handler", "/_server"), Kl = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ sellerId: z.number() }).parse(r)).handler(Hl), Vl = O("app_routes_api_seller_ts--updateSellerProfile_createServerFn_handler", "/_server"), Yl = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ sellerId: z.number(), company_name: z.string().min(1), business_type: z.string().min(1), address: z.string().min(1), phone: z.string().min(1), website: z.string().url().nullable().optional(), description: z.string().nullable().optional(), profile_picture_url: z.string().url().nullable().optional(), aadhar_url: z.string().url().nullable().optional(), gst_certificate_url: z.string().url().nullable().optional(), work_photos_urls: z.array(z.string().url()).nullable().optional(), owner_photos_urls: z.array(z.string().url()).nullable().optional() }).parse(r)).handler(Vl), Zl = O("app_routes_api_seller_ts--getSellerPortfolio_createServerFn_handler", "/_server"), Sr = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ sellerId: z.number() }).parse(r)).handler(Zl), Jl = O("app_routes_api_seller_ts--getSellerGigs_createServerFn_handler", "/_server"), Pr = createServerFn({ method: "POST", response: "data" }).validator((r) => z.object({ sellerId: z.number() }).parse(r)).handler(Jl), Tr = z.object({ name: z.string().min(1, "Product name is required"), description: z.string().min(1, "Description is required"), price: z.string().min(1, "Price is required"), image: z.string().min(1, "Image URL is required"), category: z.enum(Ke.enumValues), seller_id: z.number(), brand_name: z.string().optional(), model: z.string().optional(), material: z.string().optional(), color: z.string().optional(), packaging_details: z.string().optional(), delivery_info: z.string().optional(), supply_ability: z.string().optional(), moq: z.string().optional() }), Ql = O("app_routes_api_product_ts--getProducts_createServerFn_handler", "/_server"), Mo = createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ category: z.enum(Ke.enumValues).optional() }).parse(r)).handler(Ql), Xl = O("app_routes_api_product_ts--getProduct_createServerFn_handler", "/_server"), Uo = createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ id: z.string() }).parse(r)).handler(Xl), en = O("app_routes_api_product_ts--getSellerProducts_createServerFn_handler", "/_server"), wt = createServerFn({ method: "GET", response: "data" }).validator((r) => z.object({ sellerId: z.number() }).parse(r)).handler(en), tn = O("app_routes_api_product_ts--createProduct_createServerFn_handler", "/_server"), rn = createServerFn({ method: "POST", response: "data" }).validator((r) => Tr.parse(r)).handler(tn), an = Tr.extend({ id: z.number().int().positive("Product ID is required for update") }).omit({ seller_id: true }), ln = O("app_routes_api_product_ts--updateProduct_createServerFn_handler", "/_server"), nn = createServerFn({ method: "POST", response: "data" }).validator((r) => an.parse(r)).handler(ln), Rr = z.enum(ur.enumValues), Ar = z.enum(mr.enumValues), Fr = z.object({ sellerId: z.number().int().positive("Valid Seller ID is required"), category: Rr, subcategory: z.string().min(1, "Subcategory is required"), title: z.string().min(1, "Title is required"), description: z.string().min(1, "Description is required"), icon: z.string().min(1, "Icon URL/name is required"), details: z.string().min(1, "Details are required"), ad_type: Ar.default("scroll"), start_date: z.string().datetime({ message: "Invalid start date format" }), end_date: z.string().datetime({ message: "Invalid end date format" }).optional().or(z.literal("")), isActive: z.boolean().default(true) }), on = O("app_routes_api_announcements_ts--createAnnouncement_createServerFn_handler", "/_server"), sn = createServerFn({ method: "POST", response: "data" }).validator((r) => Fr.parse(r)).handler(on), cn = z.object({ sellerId: z.number().int().positive("Valid Seller ID is required") }), dn = O("app_routes_api_announcements_ts--getSellerAnnouncements_createServerFn_handler", "/_server"), un = createServerFn({ method: "POST", response: "data" }).validator((r) => cn.parse(r)).handler(dn), mn = Fr.extend({ announcementId: z.number().int().positive("Announcement ID is required for update"), category: Rr.optional(), subcategory: z.string().min(1, "Subcategory is required").optional(), title: z.string().min(1, "Title is required").optional(), description: z.string().min(1, "Description is required").optional(), icon: z.string().min(1, "Icon URL/name is required").optional(), details: z.string().min(1, "Details are required").optional(), ad_type: Ar.optional(), start_date: z.string().datetime({ message: "Invalid start date format" }).optional(), end_date: z.string().datetime({ message: "Invalid end date format" }).optional().or(z.literal("").optional()), isActive: z.boolean().optional() }).omit({ sellerId: true }), gn = O("app_routes_api_announcements_ts--updateAnnouncement_createServerFn_handler", "/_server"), tr = createServerFn({ method: "POST", response: "data" }).validator((r) => mn.parse(r)).handler(gn), pn = z.object({ announcementId: z.number().int().positive("Announcement ID is required") }), hn = O("app_routes_api_announcements_ts--deactivateAnnouncement_createServerFn_handler", "/_server"), fn = createServerFn({ method: "POST", response: "data" }).validator((r) => pn.parse(r)).handler(hn), bn = O("app_routes_api_announcements_ts--getAllSellerAnnouncements_createServerFn_handler", "/_server"), $o = createServerFn({ method: "GET" }).validator((r) => r).handler(bn), yn = z.object({ file: z.object({ name: z.string(), type: z.string(), size: z.number(), data: z.string() }), userId: z.string() }), vn = z.object({ url: z.string() }), xn = z.object({ file: z.object({ name: z.string(), type: z.string(), size: z.number(), data: z.string() }), sellerId: z.string() }), Nn = O("app_routes_api_storage_ts--uploadProfileImage_createServerFn_handler", "/_server"), We = createServerFn({ method: "POST", response: "data" }).validator((r) => yn.parse(r)).handler(Nn), wn = O("app_routes_api_storage_ts--deleteProfileImage_createServerFn_handler", "/_server");
createServerFn({ method: "POST", response: "data" }).validator((r) => vn.parse(r)).handler(wn);
const _n = O("app_routes_api_storage_ts--uploadAnnouncementImage_createServerFn_handler", "/_server");
createServerFn({ method: "POST", response: "data" }).validator((r) => xn.parse(r)).handler(_n);
function kn({ isOpen: r, onClose: p, title: d, children: h }) {
  return r ? jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: jsxs("div", { className: "relative w-full max-w-2xl rounded-lg bg-white shadow-xl", children: [jsxs("div", { className: "flex items-center justify-between border-b p-4", children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: d }), jsxs("button", { onClick: p, className: "rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500", children: [jsx("span", { className: "sr-only", children: "Close" }), jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] })] }), jsx("div", { className: "p-4", children: h })] }) })] }) : null;
}
function Cn({ seller: r, onSuccess: p }) {
  const [d, h] = useState(false), [o, x] = useState(false), [_, k] = useState(false), [I, S] = useState(null), [f, T] = useState("basic"), [P, C] = useState({ company_name: r.company_name, business_type: r.business_type, address: r.address, phone: r.phone, website: r.website || "", description: r.description || "" }), [N, M] = useState(null), [w, U] = useState(r.profile_picture_url || null), [A, ae] = useState(null), [Z, K] = useState(null), [Q, V] = useState([]), [i, l] = useState([]), [y, L] = useState(r.aadhar_url || null), [de, xe] = useState(r.gst_certificate_url || null), [Me, Ce] = useState(r.work_photos_urls || []), [Se, Ee] = useState(r.owner_photos_urls || []), [se, ie] = useState({}), ye = (B) => {
    const { name: q, value: W } = B.target;
    C((m) => ({ ...m, [q]: W }));
  }, Pe = async (B, q) => {
    const W = B.target.files;
    if (!W) return;
    const m = 5 * 1024 * 1024, g = Array.from(W).filter((b) => b.size > m);
    if (g.length > 0) {
      S(`Some files exceed the 5MB size limit: ${g.map((b) => b.name).join(", ")}`);
      return;
    }
    if (q === "work_photos" || q === "owner_photos") {
      const b = Array.from(W), F = await Promise.all(b.map((D) => URL.createObjectURL(D)));
      q === "work_photos" ? (V(b), Ce((D) => [...D, ...F])) : (l(b), Ee((D) => [...D, ...F]));
    } else {
      const b = W[0];
      if (!b) return;
      const F = URL.createObjectURL(b);
      q === "profile_picture" ? (M(b), U(F)) : q === "aadhar" ? (ae(b), L(F)) : q === "gst_certificate" && (K(b), xe(F));
    }
  }, Te = (B, q) => {
    q === "work" ? (V((W) => W.filter((m, g) => g !== B)), Ce((W) => W.filter((m, g) => g !== B))) : (l((W) => W.filter((m, g) => g !== B)), Ee((W) => W.filter((m, g) => g !== B)));
  };
  return jsxs(Fragment, { children: [jsxs("button", { onClick: () => h(true), className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [jsx("svg", { className: "h-4 w-4 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }), "Edit Profile"] }), jsxs(kn, { isOpen: d, onClose: () => h(false), title: "Edit Seller Profile", children: [jsx("div", { className: "mb-8", children: jsx("div", { className: "border-b border-gray-200", children: jsxs("nav", { className: "-mb-px flex space-x-12 px-4", children: [jsx("button", { onClick: () => T("basic"), className: `${f === "basic" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`, children: "Basic Information" }), jsx("button", { onClick: () => T("documents"), className: `${f === "documents" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`, children: "Documents" }), jsx("button", { onClick: () => T("photos"), className: `${f === "photos" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`, children: "Photos" })] }) }) }), I && jsx("div", { className: "mx-4 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: jsxs("div", { className: "flex", children: [jsx("div", { className: "flex-shrink-0", children: jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), jsx("div", { className: "ml-3", children: jsx("p", { className: "text-sm text-red-700", children: I }) })] }) }), jsxs("form", { onSubmit: async (B) => {
    B.preventDefault(), x(true), k(false), S(null);
    try {
      let q = P.website;
      q && !q.startsWith("http://") && !q.startsWith("https://") && (q = `https://${q}`), console.log("Starting file uploads...");
      const W = (G) => new Promise((ue, te) => {
        const pe = new FileReader();
        pe.readAsDataURL(G), pe.onload = () => {
          const Re = pe.result;
          typeof Re == "string" ? ue(Re) : te(new Error("Failed to read file"));
        }, pe.onerror = () => te(new Error("Failed to read file"));
      }), [m, g, b, F, D] = await Promise.all([N ? (async () => {
        ie((te) => ({ ...te, profile: 0 }));
        const G = await W(N);
        ie((te) => ({ ...te, profile: 50 }));
        const ue = await We({ data: { file: { name: N.name, type: N.type, size: N.size, data: G }, userId: String(r.id) } });
        return ie((te) => ({ ...te, profile: 100 })), ue.success ? ue.url : null;
      })() : Promise.resolve(r.profile_picture_url || null), A ? (async () => {
        ie((te) => ({ ...te, aadhar: 0 }));
        const G = await W(A);
        ie((te) => ({ ...te, aadhar: 50 }));
        const ue = await We({ data: { file: { name: A.name, type: A.type, size: A.size, data: G }, userId: String(r.id) } });
        return ie((te) => ({ ...te, aadhar: 100 })), ue.success ? ue.url : null;
      })() : Promise.resolve(r.aadhar_url || null), Z ? (async () => {
        ie((te) => ({ ...te, gst: 0 }));
        const G = await W(Z);
        ie((te) => ({ ...te, gst: 50 }));
        const ue = await We({ data: { file: { name: Z.name, type: Z.type, size: Z.size, data: G }, userId: String(r.id) } });
        return ie((te) => ({ ...te, gst: 100 })), ue.success ? ue.url : null;
      })() : Promise.resolve(r.gst_certificate_url || null), Q.length > 0 ? Promise.all(Q.map(async (G, ue) => {
        ie((Re) => ({ ...Re, work: ue / Q.length * 100 }));
        const te = await W(G), pe = await We({ data: { file: { name: G.name, type: G.type, size: G.size, data: te }, userId: String(r.id) } });
        return pe.success ? pe.url : null;
      })) : Promise.resolve(r.work_photos_urls || []), i.length > 0 ? Promise.all(i.map(async (G, ue) => {
        ie((Re) => ({ ...Re, owner: ue / i.length * 100 }));
        const te = await W(G), pe = await We({ data: { file: { name: G.name, type: G.type, size: G.size, data: te }, userId: String(r.id) } });
        return pe.success ? pe.url : null;
      })) : Promise.resolve(r.owner_photos_urls || [])]), ee = (F == null ? void 0 : F.filter((G) => G != null)) || null, oe = (D == null ? void 0 : D.filter((G) => G != null)) || null;
      console.log("File uploads completed:", { profilePictureUrl: (m == null ? void 0 : m.substring(0, 20)) + "...", aadharUrl: (g == null ? void 0 : g.substring(0, 20)) + "...", gstUrl: (b == null ? void 0 : b.substring(0, 20)) + "...", workPhotoUrls: ee == null ? void 0 : ee.map((G) => G.substring(0, 20) + "..."), ownerPhotoUrls: oe == null ? void 0 : oe.map((G) => G.substring(0, 20) + "...") });
      const J = await Yl({ data: { sellerId: r.id, ...P, website: q || null, profile_picture_url: m || null, aadhar_url: g || null, gst_certificate_url: b || null, work_photos_urls: ee || null, owner_photos_urls: oe || null } });
      J.success ? (k(true), setTimeout(() => {
        h(false), p == null ? void 0 : p();
      }, 1e3)) : S(J.error || "Failed to update seller profile");
    } catch (q) {
      console.error("Failed to update seller profile:", q), S(q instanceof Error ? q.message : "Failed to update seller profile");
    } finally {
      x(false), ie({});
    }
  }, className: "space-y-8 px-6", children: [f === "basic" && jsxs("div", { className: "space-y-8", children: [jsxs("div", { className: "space-y-6", children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Profile Picture" }), jsxs("div", { className: "flex items-center gap-8", children: [jsxs("div", { className: "relative", children: [w ? jsx("img", { src: w, alt: "Profile preview", className: "h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-indigo-100" }) : jsx("div", { className: "h-32 w-32 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-indigo-100", children: jsx("svg", { className: "h-16 w-16 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), w && jsx("button", { type: "button", onClick: () => {
    M(null), U(null);
  }, className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg", children: jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), jsxs("div", { className: "flex-1", children: [jsx("label", { htmlFor: "profile_picture", className: "block text-sm font-medium text-gray-700", children: "Upload Profile Picture" }), jsx("input", { type: "file", id: "profile_picture", accept: "image/*", onChange: (B) => Pe(B, "profile_picture"), className: "mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200" }), jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Recommended: Square image, at least 400x400 pixels" }), se.profile !== void 0 && jsx("div", { className: "mt-3", children: jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: jsx("div", { className: "bg-indigo-600 h-2 rounded-full transition-all duration-300", style: { width: `${se.profile}%` } }) }) })] })] })] }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [jsxs("div", { children: [jsx("label", { htmlFor: "company_name", className: "block text-sm font-medium text-gray-700", children: "Company Name" }), jsx("input", { type: "text", id: "company_name", name: "company_name", value: P.company_name, onChange: ye, required: true, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "business_type", className: "block text-sm font-medium text-gray-700", children: "Business Type" }), jsx("input", { type: "text", id: "business_type", name: "business_type", value: P.business_type, onChange: ye, required: true, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] }), jsxs("div", { className: "md:col-span-2", children: [jsx("label", { htmlFor: "address", className: "block text-sm font-medium text-gray-700", children: "Address" }), jsx("input", { type: "text", id: "address", name: "address", value: P.address, onChange: ye, required: true, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700", children: "Phone" }), jsx("input", { type: "tel", id: "phone", name: "phone", value: P.phone, onChange: ye, required: true, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "website", className: "block text-sm font-medium text-gray-700", children: "Website (Optional)" }), jsx("input", { type: "url", id: "website", name: "website", value: P.website, onChange: ye, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] }), jsxs("div", { className: "md:col-span-2", children: [jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description (Optional)" }), jsx("textarea", { id: "description", name: "description", value: P.description, onChange: ye, rows: 3, className: "mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" })] })] })] }), f === "documents" && jsx("div", { className: "space-y-8", children: jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [jsxs("div", { children: [jsx("label", { htmlFor: "aadhar", className: "block text-sm font-medium text-gray-700", children: "Aadhar Card (Optional)" }), jsxs("div", { className: "mt-2 flex items-center gap-4", children: [jsx("input", { type: "file", id: "aadhar", accept: "image/*,.pdf", onChange: (B) => Pe(B, "aadhar"), className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200" }), y && jsxs("div", { className: "relative", children: [jsx("img", { src: y, alt: "Aadhar preview", className: "h-20 w-auto rounded-lg object-cover ring-2 ring-indigo-100" }), jsx("button", { type: "button", onClick: () => {
    ae(null), L(null);
  }, className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg", children: jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] }), se.aadhar !== void 0 && jsx("div", { className: "mt-3", children: jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: jsx("div", { className: "bg-indigo-600 h-2 rounded-full transition-all duration-300", style: { width: `${se.aadhar}%` } }) }) })] }), jsxs("div", { children: [jsx("label", { htmlFor: "gst_certificate", className: "block text-sm font-medium text-gray-700", children: "GST Certificate (Optional)" }), jsxs("div", { className: "mt-2 flex items-center gap-4", children: [jsx("input", { type: "file", id: "gst_certificate", accept: "image/*,.pdf", onChange: (B) => Pe(B, "gst_certificate"), className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200" }), de && jsxs("div", { className: "relative", children: [jsx("img", { src: de, alt: "GST preview", className: "h-20 w-auto rounded-lg object-cover ring-2 ring-indigo-100" }), jsx("button", { type: "button", onClick: () => {
    K(null), xe(null);
  }, className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg", children: jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] }), se.gst !== void 0 && jsx("div", { className: "mt-3", children: jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: jsx("div", { className: "bg-indigo-600 h-2 rounded-full transition-all duration-300", style: { width: `${se.gst}%` } }) }) })] })] }) }), f === "photos" && jsx("div", { className: "space-y-8", children: jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [jsxs("div", { children: [jsx("label", { htmlFor: "work_photos", className: "block text-sm font-medium text-gray-700", children: "Photos of Work Done (Optional)" }), jsxs("div", { className: "mt-2 space-y-4", children: [jsx("input", { type: "file", id: "work_photos", accept: "image/*", multiple: true, onChange: (B) => Pe(B, "work_photos"), className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200" }), Me.length > 0 && jsx("div", { className: "grid grid-cols-4 gap-3", children: Me.map((B, q) => jsxs("div", { className: "relative", children: [jsx("img", { src: B, alt: `Work photo ${q + 1}`, className: "h-20 w-full rounded-lg object-cover ring-2 ring-indigo-100" }), jsx("button", { type: "button", onClick: () => Te(q, "work"), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg", children: jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, q)) }), se.work !== void 0 && jsx("div", { className: "mt-3", children: jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: jsx("div", { className: "bg-indigo-600 h-2 rounded-full transition-all duration-300", style: { width: `${se.work}%` } }) }) })] })] }), jsxs("div", { children: [jsx("label", { htmlFor: "owner_photos", className: "block text-sm font-medium text-gray-700", children: "Owner Photos (Optional)" }), jsxs("div", { className: "mt-2 space-y-4", children: [jsx("input", { type: "file", id: "owner_photos", accept: "image/*", multiple: true, onChange: (B) => Pe(B, "owner_photos"), className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200" }), Se.length > 0 && jsx("div", { className: "grid grid-cols-4 gap-3", children: Se.map((B, q) => jsxs("div", { className: "relative", children: [jsx("img", { src: B, alt: `Owner photo ${q + 1}`, className: "h-20 w-full rounded-lg object-cover ring-2 ring-indigo-100" }), jsx("button", { type: "button", onClick: () => Te(q, "owner"), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg", children: jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, q)) }), se.owner !== void 0 && jsx("div", { className: "mt-3", children: jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: jsx("div", { className: "bg-indigo-600 h-2 rounded-full transition-all duration-300", style: { width: `${se.owner}%` } }) }) })] })] })] }) }), jsxs("div", { className: "flex justify-end gap-4 pt-6 border-t border-gray-200", children: [jsx("button", { type: "button", onClick: () => h(false), className: "px-5 py-2.5 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium", children: "Cancel" }), jsxs("button", { type: "submit", disabled: o || _, className: `px-5 py-2.5 rounded-lg transition-colors duration-200 inline-flex items-center font-medium ${_ ? "bg-green-600 text-white cursor-default" : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"}`, children: [o && jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _ ? jsxs(Fragment, { children: [jsx("svg", { className: "h-4 w-4 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), "Saved Successfully"] }) : "Save Changes"] })] })] })] })] });
}
function Sn({ isOpen: r, onClose: p, sellerId: d, onSuccess: h }) {
  const [o, x] = useState({ name: "", description: "", price: "", category: Ke.enumValues[0], brand_name: "", model: "", material: "", color: "", packaging_details: "", delivery_info: "", supply_ability: "", moq: "", image: "" }), [_, k] = useState(""), [I, S] = useState(false), [f, T] = useState(null), [P, C] = useState(null), [N, M] = useState(false), [w, U] = useState(1), A = 3, ae = async (i) => {
    var _a2;
    const l = (_a2 = i.target.files) == null ? void 0 : _a2[0];
    if (l) {
      if (l.size > 5 * 1024 * 1024) {
        k("Image size must be less than 5MB");
        return;
      }
      if (!l.type.startsWith("image/")) {
        k("Please upload an image file");
        return;
      }
      T(l), C(URL.createObjectURL(l)), k("");
    }
  }, Z = async (i) => {
    M(true);
    try {
      const l = new FileReader();
      l.readAsDataURL(i);
      const y = await new Promise((de) => {
        l.onload = () => de(l.result);
      }), L = await We({ data: { file: { name: i.name, type: i.type, size: i.size, data: y }, userId: String(d) } });
      if (!L.success || !L.url) throw new Error(L.error || "Failed to upload image");
      return L.url;
    } finally {
      M(false);
    }
  }, K = async (i) => {
    var _a2, _b, _c, _d, _e2, _f, _g, _h, _i, _j;
    i.preventDefault(), k(""), S(true);
    try {
      if (!o.name.trim()) {
        k("Please enter a product name"), S(false);
        return;
      }
      if (!o.description.trim()) {
        k("Please enter a product description"), S(false);
        return;
      }
      if (!o.price.trim()) {
        k("Please enter a product price"), S(false);
        return;
      }
      if (!f && !o.image) {
        k("Please select a product image"), S(false);
        return;
      }
      let l = o.image;
      f && (l = await Z(f));
      const y = { name: o.name.trim(), description: o.description.trim(), price: o.price.trim(), image: l, category: o.category, seller_id: d, brand_name: ((_a2 = o.brand_name) == null ? void 0 : _a2.trim()) || void 0, model: ((_b = o.model) == null ? void 0 : _b.trim()) || void 0, material: ((_c = o.material) == null ? void 0 : _c.trim()) || void 0, color: ((_d = o.color) == null ? void 0 : _d.trim()) || void 0, packaging_details: ((_e2 = o.packaging_details) == null ? void 0 : _e2.trim()) || void 0, delivery_info: ((_f = o.delivery_info) == null ? void 0 : _f.trim()) || void 0, supply_ability: ((_g = o.supply_ability) == null ? void 0 : _g.trim()) || void 0, moq: ((_h = o.moq) == null ? void 0 : _h.trim()) || void 0 }, L = await rn({ data: y });
      if (L.success) h(), p();
      else if ((_i = L.error) == null ? void 0 : _i.includes("ZodError")) {
        const de = (_j = L.error.match(/message": "([^"]+)"/)) == null ? void 0 : _j[1];
        k(de || "Please check all required fields");
      } else k(L.error || "Failed to create product. Please try again.");
    } catch (l) {
      console.error("Error creating product:", l), k("Something went wrong. Please try again later.");
    } finally {
      S(false);
    }
  }, Q = () => {
    w < A && U(w + 1);
  }, V = () => {
    w > 1 && U(w - 1);
  };
  return r ? jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [jsxs("div", { className: "flex justify-between items-center mb-6", children: [jsxs("div", { children: [jsx("h2", { className: "text-2xl font-bold", children: "Create New Product" }), jsxs("p", { className: "text-sm text-gray-500", children: ["Step ", w, " of ", A] })] }), jsx("button", { onClick: p, className: "text-gray-500 hover:text-gray-700", children: "\u2715" })] }), jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mb-6", children: jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${w / A * 100}%` } }) }), _ && jsx("div", { className: "mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg", children: _ }), jsxs("form", { onSubmit: K, className: "space-y-6", children: [w === 1 && jsxs("div", { className: "space-y-6", children: [jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Basic Information" }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Product Name *" }), jsx("input", { type: "text", required: true, value: o.name, onChange: (i) => x({ ...o, name: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter product name" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description *" }), jsx("textarea", { required: true, value: o.description, onChange: (i) => x({ ...o, description: i.target.value }), rows: 3, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Describe your product" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category *" }), jsx("select", { required: true, value: o.category, onChange: (i) => x({ ...o, category: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", children: Ke.enumValues.map((i) => jsx("option", { value: i, children: i }, i)) })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Price *" }), jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: jsx("span", { className: "text-gray-500 sm:text-sm", children: "\u20B9" }) }), jsx("input", { type: "number", required: true, min: "0", step: "0.01", value: o.price, onChange: (i) => x({ ...o, price: i.target.value }), className: "block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500", placeholder: "0.00" })] })] })] }), w === 2 && jsxs("div", { className: "space-y-6", children: [jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Product Details" }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Brand Name" }), jsx("input", { type: "text", value: o.brand_name, onChange: (i) => x({ ...o, brand_name: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter brand name" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Model" }), jsx("input", { type: "text", value: o.model, onChange: (i) => x({ ...o, model: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter model number" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Material" }), jsx("input", { type: "text", value: o.material, onChange: (i) => x({ ...o, material: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter material type" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Color" }), jsx("input", { type: "text", value: o.color, onChange: (i) => x({ ...o, color: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter color" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Minimum Order Quantity" }), jsx("input", { type: "number", min: "1", value: o.moq, onChange: (i) => x({ ...o, moq: i.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter minimum order quantity" })] })] })] }), w === 3 && jsxs("div", { className: "space-y-6", children: [jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Additional Information" }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Product Image *" }), jsxs("div", { className: "mt-1 flex items-center gap-4", children: [jsx("input", { type: "file", accept: "image/*", onChange: ae, className: `block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100` }), P && jsxs("div", { className: "relative w-20 h-20", children: [jsx("img", { src: P, alt: "Preview", className: "w-full h-full object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => {
    T(null), C(null);
  }, className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1", children: "\u2715" })] })] }), jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Upload a high-quality image (max 5MB)" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Packaging Details" }), jsx("textarea", { value: o.packaging_details, onChange: (i) => x({ ...o, packaging_details: i.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter packaging details" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Delivery Information" }), jsx("textarea", { value: o.delivery_info, onChange: (i) => x({ ...o, delivery_info: i.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter delivery information" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Supply Ability" }), jsx("textarea", { value: o.supply_ability, onChange: (i) => x({ ...o, supply_ability: i.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500", placeholder: "Enter supply ability details" })] })] }), jsxs("div", { className: "flex justify-between pt-6 border-t", children: [w > 1 ? jsx("button", { type: "button", onClick: V, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md", children: "Previous" }) : jsx("div", {}), w < A ? jsx("button", { type: "button", onClick: Q, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md", children: "Next" }) : jsx("button", { type: "submit", disabled: I || N, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50", children: I ? "Creating..." : "Create Product" })] })] })] }) }) : null;
}
function Pn({ isOpen: r, onClose: p, product: d, onProductUpdated: h }) {
  var _a2;
  const [o, x] = useState({ name: d.name, description: d.description, price: d.price, image: d.image || "", category: d.category, brand_name: d.brand_name || "", model: d.model || "", material: d.material || "", color: d.color || "", packaging_details: d.packaging_details || "", delivery_info: d.delivery_info || "", supply_ability: d.supply_ability || "", moq: ((_a2 = d.moq) == null ? void 0 : _a2.toString()) || "" }), [_, k] = useState(false), [I, S] = useState(null), [f, T] = useState(d.image || "");
  useEffect(() => {
    if (I) {
      const C = new FileReader();
      C.onloadend = () => {
        T(C.result);
      }, C.readAsDataURL(I);
    }
  }, [I]);
  const P = async (C) => {
    C.preventDefault(), k(true);
    try {
      let N = o.image;
      if (I) {
        const w = new FileReader();
        w.readAsDataURL(I);
        const U = await new Promise((ae) => {
          w.onload = () => ae(w.result);
        }), A = await Ie({ data: { file: { name: I.name, type: I.type, size: I.size, data: U }, userId: String(d.seller_id) } });
        if (!A.success || !A.url) {
          toast.error("Failed to upload image"), k(false);
          return;
        }
        N = A.url;
      }
      const M = await nn({ data: { ...o, id: d.id, name: o.name, description: o.description, price: o.price, category: o.category, image: N, brand_name: o.brand_name || void 0, model: o.model || void 0, material: o.material || void 0, color: o.color || void 0, packaging_details: o.packaging_details || void 0, delivery_info: o.delivery_info || void 0, supply_ability: o.supply_ability || void 0, moq: o.moq || void 0 } });
      M.success ? (toast.success("Product updated successfully"), h(), p()) : toast.error(M.error || "Failed to update product");
    } catch (N) {
      console.error("Error updating product:", N), toast.error("An error occurred while updating the product");
    } finally {
      k(false);
    }
  };
  return r ? jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsxs("div", { className: "relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl", children: [jsxs("div", { className: "mb-4 flex items-center justify-between", children: [jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Edit Product" }), jsxs("button", { onClick: p, className: "rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500", children: [jsx("span", { className: "sr-only", children: "Close" }), jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] })] }), jsxs("form", { onSubmit: P, className: "space-y-4", children: [jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [jsxs("div", { children: [jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Product Name" }), jsx("input", { type: "text", id: "name", value: o.name, onChange: (C) => x({ ...o, name: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", required: true })] }), jsxs("div", { children: [jsx("label", { htmlFor: "price", className: "block text-sm font-medium text-gray-700", children: "Price" }), jsx("input", { type: "text", id: "price", value: o.price, onChange: (C) => x({ ...o, price: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", required: true })] }), jsxs("div", { children: [jsx("label", { htmlFor: "category", className: "block text-sm font-medium text-gray-700", children: "Category" }), jsx("select", { id: "category", value: o.category, onChange: (C) => x({ ...o, category: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", required: true, children: Ke.enumValues.map((C) => jsx("option", { value: C, children: C }, C)) })] }), jsxs("div", { children: [jsx("label", { htmlFor: "brand_name", className: "block text-sm font-medium text-gray-700", children: "Brand Name" }), jsx("input", { type: "text", id: "brand_name", value: o.brand_name, onChange: (C) => x({ ...o, brand_name: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "model", className: "block text-sm font-medium text-gray-700", children: "Model" }), jsx("input", { type: "text", id: "model", value: o.model, onChange: (C) => x({ ...o, model: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "material", className: "block text-sm font-medium text-gray-700", children: "Material" }), jsx("input", { type: "text", id: "material", value: o.material, onChange: (C) => x({ ...o, material: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "color", className: "block text-sm font-medium text-gray-700", children: "Color" }), jsx("input", { type: "text", id: "color", value: o.color, onChange: (C) => x({ ...o, color: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "moq", className: "block text-sm font-medium text-gray-700", children: "Minimum Order Quantity" }), jsx("input", { type: "number", id: "moq", value: o.moq, onChange: (C) => x({ ...o, moq: C.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] })] }), jsxs("div", { children: [jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }), jsx("textarea", { id: "description", value: o.description, onChange: (C) => x({ ...o, description: C.target.value }), rows: 3, className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", required: true })] }), jsxs("div", { children: [jsx("label", { htmlFor: "packaging_details", className: "block text-sm font-medium text-gray-700", children: "Packaging Details" }), jsx("textarea", { id: "packaging_details", value: o.packaging_details, onChange: (C) => x({ ...o, packaging_details: C.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "delivery_info", className: "block text-sm font-medium text-gray-700", children: "Delivery Information" }), jsx("textarea", { id: "delivery_info", value: o.delivery_info, onChange: (C) => x({ ...o, delivery_info: C.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "supply_ability", className: "block text-sm font-medium text-gray-700", children: "Supply Ability" }), jsx("textarea", { id: "supply_ability", value: o.supply_ability, onChange: (C) => x({ ...o, supply_ability: C.target.value }), rows: 2, className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "image", className: "block text-sm font-medium text-gray-700", children: "Product Image" }), jsxs("div", { className: "mt-1 flex items-center space-x-4", children: [jsx("img", { src: f, alt: "Product preview", className: "h-32 w-32 rounded-lg object-cover" }), jsx("input", { type: "file", id: "image", accept: "image/*", onChange: (C) => {
    var _a3;
    const N = (_a3 = C.target.files) == null ? void 0 : _a3[0];
    N && S(N);
  }, className: "block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" })] })] }), jsxs("div", { className: "mt-6 flex justify-end space-x-3", children: [jsx("button", { type: "button", onClick: p, className: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", children: "Cancel" }), jsx("button", { type: "submit", disabled: _, className: "inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50", children: _ ? "Saving..." : "Save Changes" })] })] })] })] }) }) : null;
}
const Tn = { Technical: ["Web Development", "Mobile Development", "UI/UX Design", "Database Management", "DevOps", "Cloud Computing"], Business: ["Digital Marketing", "Sales", "Project Management", "Business Analysis", "Content Writing", "SEO"], Creative: ["Graphic Design", "Video Editing", "Photography", "Animation", "3D Modeling", "Illustration"], Other: ["Customer Service", "Teaching", "Consulting", "Research", "Data Analysis", "Quality Assurance"] }, Rn = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Portuguese", "Russian", "Italian", "Korean", "Dutch", "Turkish", "Swedish"];
function An({ isOpen: r, onClose: p, seller: d, onSuccess: h }) {
  var _a2, _b, _c;
  const [o, x] = useState(1), [_, k] = useState(false), [I, S] = useState(null), [f, T] = useState({ skills: d.skills || [], languages: d.languages || [], portfolio: d.portfolio || [], gigs: d.gigs || [] }), [P, C] = useState(""), [N, M] = useState(""), [w, U] = useState({ title: "", description: "", image_url: "", price: 0 }), [A, ae] = useState(null), [Z, K] = useState(null), [Q, V] = useState({}), [i, l] = useState(true), [y, L] = useState({});
  useRef([]);
  const [de, xe] = useState(false), [Me, Ce] = useState(false);
  if (useEffect(() => {
    (async () => {
      var _a3;
      l(true);
      try {
        d.portfolio && Array.isArray(d.portfolio) && d.portfolio.length > 0 ? T((g) => {
          var _a4;
          return { ...g, portfolio: (_a4 = d.portfolio) != null ? _a4 : [] };
        }) : Array.isArray(d.portfolio_urls) && d.portfolio_urls.length > 0 && T((g) => {
          var _a4;
          return { ...g, portfolio: ((_a4 = d.portfolio_urls) != null ? _a4 : []).map((b) => ({ image_url: b, title: "", description: "" })) };
        }), ((_a3 = d.gigs) == null ? void 0 : _a3.length) && T((g) => ({ ...g, gigs: d.gigs || [] }));
      } catch (g) {
        console.error("Error loading initial data:", g);
      } finally {
        l(false);
      }
    })();
  }, [d]), useEffect(() => {
    const m = (g) => {
      g.key === "Escape" && p();
    };
    return r && (document.addEventListener("keydown", m), document.body.style.overflow = "hidden"), () => {
      document.removeEventListener("keydown", m), document.body.style.overflow = "unset";
    };
  }, [r, p]), !r) return null;
  const Se = () => {
    P.trim() && !f.skills.includes(P.trim()) && (T((m) => ({ ...m, skills: [...m.skills, P.trim()] })), C(""));
  }, Ee = (m) => {
    T((g) => ({ ...g, skills: g.skills.filter((b) => b !== m) }));
  }, se = () => {
    N.trim() && !f.languages.includes(N.trim()) && (T((m) => ({ ...m, languages: [...m.languages, N.trim()] })), M(""));
  }, ie = (m) => {
    T((g) => ({ ...g, languages: g.languages.filter((b) => b !== m) }));
  }, ye = async (m, g) => {
    var _a3, _b2;
    const b = (_a3 = m.target.files) == null ? void 0 : _a3[0];
    if (b) try {
      Ce(true), S(null);
      const F = URL.createObjectURL(b);
      L((ee) => ({ ...ee, portfolio: F }));
      const D = await Ie({ data: { file: { name: b.name, type: b.type, size: b.size, data: await new Promise((ee) => {
        const oe = new FileReader();
        oe.onload = () => ee(oe.result), oe.readAsDataURL(b);
      }) }, userId: d.user_id } });
      if (D.success && D.url) if (typeof g == "number") {
        const ee = [...(_b2 = f.portfolio) != null ? _b2 : []];
        ee[g] && (ee[g].image_url = D.url, T((oe) => ({ ...oe, portfolio: ee })));
      } else T((ee) => {
        var _a4;
        return { ...ee, portfolio: [...(_a4 = ee.portfolio) != null ? _a4 : [], { image_url: D.url, title: "", description: "" }] };
      });
      else throw new Error("Failed to upload image");
    } catch (F) {
      S("Failed to upload image. Please try again."), console.error("Upload error:", F);
    } finally {
      Ce(false), L((F) => ({ ...F, portfolio: void 0 }));
    }
  }, Pe = async (m) => {
    var _a3;
    const g = (_a3 = m.target.files) == null ? void 0 : _a3[0];
    if (g) {
      xe(true);
      const b = URL.createObjectURL(g);
      L((D) => ({ ...D, gig: b }));
      const F = await Ie({ data: { file: { name: g.name, type: g.type, size: g.size, data: await new Promise((D) => {
        const ee = new FileReader();
        ee.onload = () => D(ee.result), ee.readAsDataURL(g);
      }) }, userId: d.user_id } });
      xe(false), F.success && F.url ? U((D) => ({ ...D, image_url: F.url })) : S("Failed to upload gig image. Please try again.");
    }
  }, Te = () => {
    w.title && w.description && w.price && w.price > 0 && w.image_url && !w.image_url.startsWith("blob:") ? (T((m) => {
      var _a3;
      return { ...m, gigs: [...(_a3 = m.gigs) != null ? _a3 : [], { ...w }] };
    }), U({ title: "", description: "", image_url: "", price: 0 }), K(null), L((m) => ({ ...m, gig: void 0 }))) : w.image_url && w.image_url.startsWith("blob:") ? S("Please wait for the image to finish uploading before adding the gig.") : S("Please fill all fields and upload an image for the gig.");
  }, qe = (m) => {
    T((g) => ({ ...g, gigs: g.gigs.filter((b, F) => F !== m) }));
  }, B = () => {
    var _a3, _b2;
    f.portfolio && f.portfolio.length > 0 && ((_a3 = f.portfolio[f.portfolio.length - 1]) == null ? void 0 : _a3.image_url) && !((_b2 = f.portfolio[f.portfolio.length - 1]) == null ? void 0 : _b2.image_url.startsWith("blob:")) ? T((m) => {
      var _a4;
      return { ...m, portfolio: [...(_a4 = m.portfolio) != null ? _a4 : [], { image_url: "", title: "", description: "" }] };
    }) : S("Please upload an image before adding a new portfolio item.");
  }, q = async (m) => {
    m.preventDefault(), k(true), S(null);
    for (const g of f.portfolio) if (!g.title.trim() || !g.description.trim()) {
      S("Please provide a title and description for every portfolio item."), k(false);
      return;
    }
    try {
      const g = [...f.portfolio];
      if (A) {
        V((J) => ({ ...J, portfolio: 0 }));
        const D = new FileReader();
        D.readAsDataURL(A);
        const ee = await new Promise((J) => {
          D.onload = () => J(D.result);
        });
        V((J) => ({ ...J, portfolio: 50 }));
        const oe = await Ie({ data: { file: { name: A.name, type: A.type, size: A.size, data: ee }, userId: d.user_id } });
        if (!oe.success || !oe.url) throw new Error("Failed to upload portfolio image");
        V((J) => ({ ...J, portfolio: 100 })), g[g.length - 1] = { image_url: oe.url, title: "", description: "" };
      }
      const b = [...f.gigs];
      if (Z) {
        V((J) => ({ ...J, gig: 0 }));
        const D = new FileReader();
        D.readAsDataURL(Z);
        const ee = await new Promise((J) => {
          D.onload = () => J(D.result);
        });
        V((J) => ({ ...J, gig: 50 }));
        const oe = await Ie({ data: { file: { name: Z.name, type: Z.type, size: Z.size, data: ee }, userId: d.user_id } });
        if (!oe.success || !oe.url) throw new Error("Failed to upload gig image");
        if (V((J) => ({ ...J, gig: 100 })), b.length > 0) {
          const J = b[b.length - 1];
          J && typeof J == "object" && (J.image_url = oe.url);
        }
      }
      const F = await zn({ data: { sellerId: d.id, skills: f.skills, languages: f.languages, portfolio: g, gigs: b.map((D) => ({ ...D, price: D.price || 0 })) } });
      if (console.log("Update result:", F), !F.success) throw new Error(F.error || "Failed to update profile");
      h(), p();
    } catch (g) {
      S(g instanceof Error ? g.message : "An error occurred while updating the profile");
    } finally {
      k(false), V({});
    }
  }, W = [{ id: 1, name: "Skills", description: "Add your professional skills" }, { id: 2, name: "Languages", description: "Add languages you speak" }, { id: 3, name: "Portfolio", description: "Showcase your work" }, { id: 4, name: "Gigs", description: "Add your services" }];
  return jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity", onClick: p }), jsx("div", { className: "flex min-h-full items-center justify-center p-2 sm:p-4", children: jsxs("div", { className: "relative w-full max-w-4xl bg-white rounded-xl shadow-lg", children: [jsxs("div", { className: "flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50", children: [jsxs("div", { children: [jsx("h2", { className: "text-lg sm:text-xl font-semibold text-gray-900", children: "Complete Your Profile" }), jsxs("p", { className: "text-xs sm:text-sm text-gray-600 mt-1", children: ["Step ", o, " of ", W.length, ":", " ", ((_a2 = W[o - 1]) == null ? void 0 : _a2.name) || ""] })] }), jsx("button", { onClick: p, className: "text-gray-400 hover:text-gray-500 focus:outline-none", children: jsx(XMarkIcon, { className: "h-5 w-5 sm:h-6 sm:w-6" }) })] }), jsx("div", { className: "px-4 sm:px-6 py-3 sm:py-4 border-b bg-white", children: jsx("nav", { "aria-label": "Progress", children: jsx("ol", { className: "flex items-center", children: W.map((m, g) => jsxs("li", { className: `relative ${g !== W.length - 1 ? "pr-4 sm:pr-8 md:pr-20" : ""}`, children: [jsxs("div", { className: "flex items-center", children: [jsx("div", { className: `relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${m.id < o ? "bg-blue-600" : m.id === o ? "bg-blue-600 ring-2 ring-blue-600 ring-offset-2" : "bg-gray-200"}`, children: jsx("span", { className: `h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${m.id <= o ? "bg-white" : "bg-gray-400"}` }) }), g !== W.length - 1 && jsx("div", { className: `absolute top-3 sm:top-4 left-6 sm:left-8 -ml-px h-0.5 w-full ${m.id < o ? "bg-blue-600" : "bg-gray-200"}` })] }), jsxs("div", { className: "mt-0.5 ml-2 sm:ml-4 min-w-0 flex flex-col", children: [jsx("span", { className: `text-xs font-semibold tracking-wide uppercase ${m.id <= o ? "text-blue-600" : "text-gray-500"}`, children: m.name }), jsx("span", { className: "text-xs text-gray-500 hidden sm:block", children: m.description })] })] }, m.id)) }) }) }), jsxs("form", { onSubmit: q, className: "p-4 sm:p-6", children: [I && jsxs("div", { className: "mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center", children: [jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), I] }), i ? jsx("div", { className: "flex items-center justify-center py-12", children: jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }) : jsxs("div", { className: "space-y-6 sm:space-y-8", children: [o === 1 && jsxs("div", { className: "space-y-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add Your Skills" }), jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Add skills that best represent your expertise. This helps clients find you for relevant projects." })] }), jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(Tn).map(([m, g]) => jsxs("div", { className: "space-y-2", children: [jsx("h4", { className: "font-medium text-gray-700", children: m }), jsx("div", { className: "flex flex-wrap gap-2", children: g.map((b) => jsx("button", { type: "button", onClick: () => {
    f.skills.includes(b) || T((F) => ({ ...F, skills: [...F.skills, b] }));
  }, className: `px-3 py-1 rounded-full text-sm ${f.skills.includes(b) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`, children: b }, b)) })] }, m)) }), jsxs("div", { className: "mt-6", children: [jsx("label", { htmlFor: "custom-skill", className: "block text-sm font-medium text-gray-700", children: "Add Custom Skill" }), jsxs("div", { className: "mt-1 flex gap-2", children: [jsx("input", { type: "text", id: "custom-skill", value: P, onChange: (m) => C(m.target.value), placeholder: "Enter a skill", className: `flex-1 rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5` }), jsxs("button", { type: "button", onClick: Se, className: `px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            transition-colors duration-200
                            flex items-center gap-2`, children: [jsx(PlusIcon, { className: "w-5 h-5" }), "Add"] })] })] }), jsxs("div", { children: [jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Your Skills" }), jsx("div", { className: "flex flex-wrap gap-2", children: f.skills.map((m, g) => jsxs("span", { className: "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2", children: [m, jsx("button", { type: "button", onClick: () => Ee(m), className: "text-blue-700 hover:text-blue-900", children: "\xD7" })] }, g)) })] })] }), o === 2 && jsxs("div", { className: "space-y-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add Languages" }), jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Add languages you speak fluently. This helps in communicating with clients effectively." })] }), jsxs("div", { children: [jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Common Languages" }), jsx("div", { className: "flex flex-wrap gap-2", children: Rn.map((m) => jsx("button", { type: "button", onClick: () => {
    f.languages.includes(m) || T((g) => ({ ...g, languages: [...g.languages, m] }));
  }, className: `px-3 py-1 rounded-full text-sm ${f.languages.includes(m) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`, children: m }, m)) })] }), jsxs("div", { className: "mt-6", children: [jsx("label", { htmlFor: "custom-language", className: "block text-sm font-medium text-gray-700", children: "Add Custom Language" }), jsxs("div", { className: "mt-1 flex gap-2", children: [jsx("input", { type: "text", id: "custom-language", value: N, onChange: (m) => M(m.target.value), placeholder: "Enter a language", className: `flex-1 rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5` }), jsxs("button", { type: "button", onClick: se, className: `px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            transition-colors duration-200
                            flex items-center gap-2`, children: [jsx(PlusIcon, { className: "w-5 h-5" }), "Add"] })] })] }), jsxs("div", { children: [jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Your Languages" }), jsx("div", { className: "flex flex-wrap gap-2", children: f.languages.map((m, g) => jsxs("span", { className: "px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2", children: [m, jsx("button", { type: "button", onClick: () => ie(m), className: "text-green-700 hover:text-green-900", children: "\xD7" })] }, g)) })] })] }), o === 3 && jsxs("div", { className: "space-y-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add Portfolio Items" }), jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Showcase your best work. Add images that represent your skills and expertise." })] }), !f.portfolio || f.portfolio.length === 0 ? jsx("div", { className: "flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50", children: jsxs("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors", children: [jsx(PhotoIcon, { className: "w-10 h-10 text-gray-400 mb-2" }), jsx("span", { className: "text-base text-gray-600 mb-1", children: "Click to upload your first portfolio image" }), jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (m) => {
    ye(m);
  } })] }) }) : jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [((_b = f.portfolio) != null ? _b : []).map((m, g) => jsxs("div", { className: "bg-white border rounded-lg shadow-sm overflow-hidden", children: [jsxs("div", { className: "relative h-40", children: [m.image_url ? jsx("img", { src: m.image_url, alt: `Portfolio ${g + 1}`, className: "w-full h-full object-cover" }) : jsxs("label", { className: "w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors", children: [jsxs("div", { className: "text-center", children: [jsx(PhotoIcon, { className: "w-8 h-8 text-gray-400 mx-auto mb-2" }), jsx("span", { className: "text-sm text-gray-500", children: "Click to add image" })] }), jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (b) => ye(b, g) })] }), m.image_url && jsxs("label", { className: "absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 cursor-pointer hover:bg-white transition-colors", title: "Change image", children: [jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (b) => ye(b, g) }), jsx(PhotoIcon, { className: "w-4 h-4 text-gray-600" })] }), jsx("button", { type: "button", onClick: () => {
    T((b) => {
      var _a3;
      return { ...b, portfolio: ((_a3 = b.portfolio) != null ? _a3 : []).filter((F, D) => D !== g) };
    });
  }, className: "absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-gray-600 hover:bg-white hover:text-red-500 transition-colors", title: "Remove item", children: jsx(XMarkIcon, { className: "w-4 h-4" }) })] }), jsxs("div", { className: "p-3 space-y-2", children: [jsx("input", { type: "text", placeholder: "Add a title", value: m.title, onChange: (b) => {
    var _a3;
    const F = [...(_a3 = f.portfolio) != null ? _a3 : []];
    F[g] && (F[g].title = b.target.value), T((D) => ({ ...D, portfolio: F }));
  }, className: "w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), jsx("textarea", { placeholder: "Add a description", value: m.description, onChange: (b) => {
    var _a3;
    const F = [...(_a3 = f.portfolio) != null ? _a3 : []];
    F[g] && (F[g].description = b.target.value), T((D) => ({ ...D, portfolio: F }));
  }, rows: 2, className: "w-full px-2 py-1.5 border rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }, g)), f.portfolio && f.portfolio.length > 0 && ((_c = f.portfolio[f.portfolio.length - 1]) == null ? void 0 : _c.image_url) && jsxs("button", { type: "button", onClick: B, disabled: Me, className: "h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [jsx(PlusIcon, { className: "w-8 h-8 text-gray-400" }), jsx("span", { className: "text-sm font-medium text-gray-600", children: "Add Portfolio Item" })] })] })] }), o === 4 && jsxs("div", { className: "space-y-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add Your Gigs" }), jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Create gigs to showcase your services. Add details about what you offer and set your prices." })] }), jsxs("div", { className: "space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200", children: [jsxs("div", { children: [jsx("label", { htmlFor: "gig-title", className: "block text-sm font-medium text-gray-700", children: "Gig Title" }), jsx("input", { type: "text", id: "gig-title", value: w.title, onChange: (m) => U((g) => ({ ...g, title: m.target.value })), placeholder: "e.g., Professional Logo Design", className: `mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5` })] }), jsxs("div", { children: [jsx("label", { htmlFor: "gig-description", className: "block text-sm font-medium text-gray-700", children: "Description" }), jsx("textarea", { id: "gig-description", value: w.description, onChange: (m) => U((g) => ({ ...g, description: m.target.value })), placeholder: "Describe what you offer in this gig...", rows: 3, className: `mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5` })] }), jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [jsxs("div", { children: [jsx("label", { htmlFor: "gig-price", className: "block text-sm font-medium text-gray-700", children: "Price (\u20B9)" }), jsx("input", { type: "number", id: "gig-price", value: w.price || "", onChange: (m) => U((g) => ({ ...g, price: parseFloat(m.target.value) })), placeholder: "0.00", min: "0", step: "0.01", className: `mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                              focus:border-blue-500 focus:ring-blue-500 
                              hover:border-gray-400
                              transition-colors duration-200
                              px-4 py-2.5` })] }), jsxs("div", { children: [jsx("label", { htmlFor: "gig-image", className: "block text-sm font-medium text-gray-700", children: "Gig Image" }), jsx("input", { type: "file", id: "gig-image", accept: "image/*", onChange: Pe, className: `mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                              transition-colors duration-200
                              px-4 py-2.5` })] })] }), y.gig && jsxs("div", { className: "relative group aspect-video", children: [jsx("img", { src: y.gig, alt: "Gig preview", className: "w-full h-full object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => {
    K(null), L((m) => ({ ...m, gig: void 0 })), U((m) => ({ ...m, image_url: "" }));
  }, className: "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity", children: "\xD7" })] }), jsxs("button", { type: "button", onClick: Te, disabled: !w.title || !w.description || !w.price || !w.image_url, className: `w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                          hover:bg-blue-700 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          transition-colors duration-200
                          flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed`, children: [jsx(PlusIcon, { className: "w-5 h-5" }), "Add Gig"] })] }), jsx("div", { className: "space-y-4", children: f.gigs.map((m, g) => jsxs("div", { className: "p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4", children: [jsx("img", { src: m.image_url, alt: m.title, className: "w-16 h-16 object-cover rounded border" }), jsxs("div", { className: "flex-1", children: [jsx("h5", { className: "font-medium text-gray-900 mb-1", children: m.title }), jsx("p", { className: "text-sm text-gray-600 line-clamp-2 mb-1", children: m.description }), jsxs("p", { className: "text-sm font-medium text-green-600", children: ["\u20B9", m.price] })] }), jsx("button", { type: "button", onClick: () => qe(g), className: "text-red-500 hover:text-red-700 self-start", children: "\xD7" })] }, g)) })] })] }), jsxs("div", { className: "mt-6 sm:mt-8 flex justify-between", children: [jsxs("button", { type: "button", onClick: (m) => {
    m.preventDefault(), x((g) => g - 1);
  }, disabled: o === 1, className: "inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: [jsx(ChevronLeftIcon, { className: "w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" }), "Previous"] }), o < W.length ? jsxs("button", { type: "button", onClick: (m) => {
    m.preventDefault(), x((g) => g + 1);
  }, className: "inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700", children: ["Next", jsx(ChevronRightIcon, { className: "w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" })] }) : jsx("button", { type: "submit", disabled: _, className: "inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: _ ? jsxs(Fragment, { children: [jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving..."] }) : "Save Changes" })] })] })] }) })] });
}
const Fn = z.object({ entityType: z.enum(["ANNOUNCEMENT", "PRODUCT", "GIG", "PORTFOLIO"]).optional(), entityId: z.number().optional(), sellerId: z.number().optional(), action: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(), fromDate: z.string().optional(), toDate: z.string().optional() }), In = O("app_routes_api_audit-logs_ts--getAuditLogs_createServerFn_handler", "/_server"), En = createServerFn({ method: "GET", response: "data" }).validator((r) => Fn.parse(r)).handler(In), Ln = z.object({ sellerId: z.number(), skills: z.array(z.string()), languages: z.array(z.string()), portfolio: z.array(z.object({ image_url: z.string(), title: z.string(), description: z.string() })), gigs: z.array(z.object({ title: z.string(), description: z.string(), image_url: z.string(), price: z.number() })) }), Dn = z.object({ file: z.object({ name: z.string(), type: z.string(), size: z.number(), data: z.string() }), userId: z.string() }), jn = z.object({ productId: z.number(), status: z.enum(["active", "inactive"]) }), Mn = O("app_routes_app_tsx--updateProductStatus_createServerFn_handler", "/_server"), Un = createServerFn({ method: "POST", response: "data" }).validator((r) => jn.parse(r)).handler(Mn), dt = { "PROJECT & CONSTRUCTION RESOURCES": ["Land", "Machines", "Material", "Equipment", "Tools", "Manpower"], "BUSINESS RESOURCES": ["Finance", "Tenders", "Showcase", "Auction"], "STUDENT RESOURCES": ["Jobs", "E-Stores"] }, vt = { title: "", description: "", icon: "", details: "", category: "", subcategory: "", ad_type: "scroll", start_date: "", end_date: "" }, xt = (r) => typeof r == "string" ? r : Array.isArray(r) ? r.map((p) => {
  if (p.path && p.message) switch (p.path[p.path.length - 1]) {
    case "icon":
      return "Please upload an image or provide an icon";
    case "title":
      return "Please enter a title";
    case "description":
      return "Please provide a short description";
    case "details":
      return "Please provide full details";
    case "category":
      return "Please select a category";
    case "subcategory":
      return "Please select a subcategory";
    case "start_date":
      return "Please select a valid start date";
    case "end_date":
      return "Please select a valid end date";
    default:
      return p.message;
  }
  return p.message || "An error occurred";
}).join(". ") : (r == null ? void 0 : r.message) ? r.message : "An unexpected error occurred. Please try again.", $n = createFileRoute("/app")({ component: On, validateSearch: (r) => {
  const p = ["seller", "profile", "audit-logs", "dashboard"], d = r.tab;
  return { tab: p.includes(d) ? d : "seller" };
}, beforeLoad: async () => {
  const r = await _t();
  if (!r.success || !r.user) throw redirect({ to: "/login", search: { redirect: "/app" } });
  return { user: r.user };
} });
function On() {
  var _a2, _b, _c, _d, _e2, _f, _g, _h, _i, _j;
  const { user: r, search: p } = useRouteContext({ from: "/app" }), d = useRouter(), { state: { location: h } } = d, o = h.pathname === "/app" || h.pathname === "/app/", [x, _] = useState((p == null ? void 0 : p.tab) || "seller"), [k, I] = useState(false), [S, f] = useState(false), [T, P] = useState(null), [C, N] = useState([]), [M, w] = useState(""), [U, A] = useState(""), [ae, Z] = useState(""), [K, Q] = useState(""), [V, i] = useState(false), [l, y] = useState(null), [L, de] = useState(true), [xe, Me] = useState(false), [Ce, Se] = useState(null), [Ee, se] = useState(null), [ie, ye] = useState(0), [Pe, Te] = useState(false), [qe, B] = useState(false), [q, W] = useState(false), [m, g] = useState(null), [b, F] = useState(vt), [D, ee] = useState(null), [oe, J] = useState([]), [G, ue] = useState(false), [te, pe] = useState(null), [Re, Oe] = useState({}), [Dr, gt] = useState(false), [Ne, et] = useState({ name: r.name, profile_image_url: r.profile_image_url, resources: r.resources || [], primaryResource: r.primaryResource || [] }), [Ct, St] = useState(false), [Pt, Ve] = useState(null), [Ae, Ye] = useState(null), [pt, Ze] = useState(null), [jr, tt] = useState(false), [X, Le] = useState({ company_name: "", business_type: "", address: "", phone: "", website: "", description: "", aadhar: null, gst_certificate: null, work_photos: [], owner_photos: [] }), [Be, rt] = useState({ aadhar: null, gst_certificate: null, work_photos: [], owner_photos: [] }), [Tt, at] = useState(false), [Mr, po] = useState(false), [Rt, ho] = useState(null), [Ur, At] = useState([]), lt = useCallback(async () => {
    de(true), se(null);
    try {
      const a = await Gl({ data: { userId: r.id } });
      if (a.success && a.seller) {
        let c = a.seller;
        const v = await Sr({ data: { sellerId: c.id } });
        let Y = [];
        v.success && Array.isArray(v.portfolio) && (Y = v.portfolio.map((z) => ({ image_url: z.image_url, title: z.title || "", description: z.description || "" })));
        const j = await Pr({ data: { sellerId: c.id } });
        let me = [];
        j.success && Array.isArray(j.gigs) && (me = j.gigs.map((z) => ({ title: z.title, description: z.description, image_url: z.image_url, price: parseFloat(z.price) }))), Te(true);
        const ce = await wt({ data: { sellerId: c.id } });
        ce.success && Array.isArray(ce.products) && ye(ce.products.length), Te(false), i(a.isSeller), y({ ...c, portfolio: Y, gigs: me });
      } else a.success ? (i(a.isSeller), y(null), se(null)) : (i(false), y(null), se(a.error || "Failed to check seller status."));
    } catch (a) {
      se(a instanceof Error ? a.message : "Client-side error checking status."), i(false), y(null);
    } finally {
      de(false);
    }
  }, [r.id]), Je = useCallback(async () => {
    var _a3;
    if (!l || typeof l.id != "number") {
      J([]);
      return;
    }
    ue(true), pe(null);
    try {
      const a = await un({ data: { sellerId: l.id } });
      if (a.success) {
        const c = a.announcements.map((v) => ({ ...v, ad_type: v.ad_type || "scroll" }));
        J(c);
      } else {
        if ((_a3 = a.error) == null ? void 0 : _a3.includes("Unauthorized")) {
          pe("Your session has expired. Please log in again.");
          const c = h.search ? new URLSearchParams(h.search).toString() : "", v = c ? `${h.pathname}?${c}` : h.pathname;
          d.navigate({ to: "/login", search: { redirect: v }, replace: true });
        } else pe(a.error || "Failed to load announcements.");
        J([]);
      }
    } catch (a) {
      const c = a instanceof Error ? a.message : "Client error fetching announcements.";
      if (c.includes("Unauthorized")) {
        pe("Your session has expired. Please log in again.");
        const v = h.search ? new URLSearchParams(h.search).toString() : "", Y = v ? `${h.pathname}?${v}` : h.pathname;
        d.navigate({ to: "/login", search: { redirect: Y }, replace: true });
      } else pe(c);
      J([]);
    } finally {
      ue(false);
    }
  }, [l, h.pathname, h.search, d]);
  useEffect(() => {
    lt();
  }, [lt]), useEffect(() => {
    V && l && Je(), V || J([]);
  }, [V, l, Je]), useEffect(() => {
    x === "audit-logs" && r.is_admin && qr();
  }, [x, M, U, ae, K]), useEffect(() => {
    (l == null ? void 0 : l.id) && ht();
  }, [l == null ? void 0 : l.id]);
  const ht = async () => {
    if (l == null ? void 0 : l.id) {
      Te(true);
      try {
        const a = await wt({ data: { sellerId: l.id } });
        a.success && a.products && (At(a.products.map((c) => ({ ...c, image: c.image || "", created_at: c.created_at.toISOString(), updated_at: c.updated_at.toISOString() }))), ye(a.products.length));
      } catch (a) {
        console.error("Error fetching products:", a);
      } finally {
        Te(false);
      }
    }
  }, $r = (a) => {
    P(a), f(true);
  }, Ft = () => {
    P(null), I(true);
  }, Or = async (a, c) => {
    try {
      (await Un({ data: { productId: a, status: c } })).success && At((Y) => Y.map((j) => j.id === a ? { ...j, status: c } : j));
    } catch (v) {
      console.error("Error updating product status:", v);
    }
  }, qr = async () => {
    try {
      const a = await En({ data: { entityType: M || void 0, entityId: void 0, sellerId: void 0, action: U || void 0, fromDate: ae || void 0, toDate: K || void 0 } });
      a.success && a.logs && N(a.logs);
    } catch (a) {
      console.error("Error fetching audit logs:", a);
    }
  }, zr = (a) => {
    _(a);
  }, Ue = (a) => {
    alert(a ? `${a} is under construction` : "This feature is under construction");
  }, Br = async (a) => {
    var _a3;
    a.preventDefault(), Me(true), Se(null);
    try {
      let c = null;
      if (X.aadhar) {
        const z = new FileReader();
        z.readAsDataURL(X.aadhar);
        const he = await new Promise(($e) => {
          z.onload = () => $e(z.result);
        }), Fe = await Ie({ data: { file: { name: X.aadhar.name, type: X.aadhar.type, size: X.aadhar.size, data: he }, userId: r.id } });
        if (!Fe.success) throw new Error("Failed to upload Aadhar");
        c = Fe.url;
      }
      let v = null;
      if (X.gst_certificate) {
        const z = new FileReader();
        z.readAsDataURL(X.gst_certificate);
        const he = await new Promise(($e) => {
          z.onload = () => $e(z.result);
        }), Fe = await Ie({ data: { file: { name: X.gst_certificate.name, type: X.gst_certificate.type, size: X.gst_certificate.size, data: he }, userId: r.id } });
        if (!Fe.success) throw new Error("Failed to upload GST Certificate");
        v = Fe.url;
      }
      const Y = [];
      if (X.work_photos.length > 0) for (const z of X.work_photos) {
        const he = new FileReader();
        he.readAsDataURL(z);
        const Fe = await new Promise((ft) => {
          he.onload = () => ft(he.result);
        }), $e = await Ie({ data: { file: { name: z.name, type: z.type, size: z.size, data: Fe }, userId: r.id } });
        if (!$e.success) throw new Error("Failed to upload work photo");
        Y.push($e.url);
      }
      const j = [];
      if (X.owner_photos.length > 0) for (const z of X.owner_photos) {
        const he = new FileReader();
        he.readAsDataURL(z);
        const Fe = await new Promise((ft) => {
          he.onload = () => ft(he.result);
        }), $e = await Ie({ data: { file: { name: z.name, type: z.type, size: z.size, data: Fe }, userId: r.id } });
        if (!$e.success) throw new Error("Failed to upload owner photo");
        j.push($e.url);
      }
      const me = { userId: r.id, company_name: X.company_name, business_type: X.business_type, address: X.address, phone: X.phone, website: X.website || null, description: X.description || null, aadhar_url: c, gst_certificate_url: v, work_photos_urls: Y.length > 0 ? Y : null, owner_photos_urls: j.length > 0 ? j : null }, ce = await Bl({ data: me });
      if (ce.success) i(true), y(ce.seller);
      else if ((_a3 = ce.error) == null ? void 0 : _a3.includes("Unauthorized")) {
        Se("Your session has expired. Please log in again.");
        const z = h.search ? new URLSearchParams(h.search).toString() : "", he = z ? `${h.pathname}?${z}` : h.pathname;
        d.navigate({ to: "/login", search: { redirect: he }, replace: true });
      } else Se(ce.error || "Failed to create profile.");
    } catch {
      Se("An unexpected error occurred while uploading files.");
    } finally {
      Me(false);
    }
  }, nt = (a, c) => {
    if (c) if (a === "work_photos" || a === "owner_photos") {
      const v = Array.from(c);
      Le((j) => ({ ...j, [a]: [...j[a], ...v] }));
      const Y = v.map((j) => URL.createObjectURL(j));
      rt((j) => ({ ...j, [a]: [...j[a], ...Y] }));
    } else {
      const v = c[0];
      if (!v) return;
      Le((j) => ({ ...j, [a]: v }));
      const Y = URL.createObjectURL(v);
      rt((j) => ({ ...j, [a]: Y }));
    }
  }, ot = (a, c) => {
    a === "work_photos" || a === "owner_photos" ? (Le((v) => ({ ...v, [a]: v[a].filter((Y, j) => j !== c) })), rt((v) => ({ ...v, [a]: v[a].filter((Y, j) => j !== c) }))) : (Le((v) => ({ ...v, [a]: null })), rt((v) => ({ ...v, [a]: null })));
  }, Wr = (a) => {
    ee(a.id), F({ title: a.title, description: a.description, icon: a.icon, details: a.details, category: a.category, subcategory: a.subcategory, ad_type: a.ad_type || "scroll", start_date: a.start_date.substring(0, 16), end_date: a.end_date ? a.end_date.substring(0, 16) : "" }), g(null), B(true);
  }, Gr = async (a) => {
    if (a.preventDefault(), !l) {
      g("Please complete your seller profile first.");
      return;
    }
    if (b.end_date && b.start_date && new Date(b.end_date) < new Date(b.start_date)) {
      g("End date must be after the start date.");
      return;
    }
    if (!Ae && !b.icon) {
      g("Please upload an image for your announcement.");
      return;
    }
    W(true), g(null);
    const c = D !== null;
    try {
      let v = b.icon || "";
      if (Ae) try {
        const ce = new FileReader();
        ce.readAsDataURL(Ae);
        const z = await new Promise((Fe) => {
          ce.onload = () => Fe(ce.result);
        }), he = await Ie({ data: { file: { name: Ae.name, type: Ae.type, size: Ae.size, data: z }, userId: String(l.id) } });
        if (!he.success) {
          g("Failed to upload image. Please try again."), W(false);
          return;
        }
        v = he.url || "";
      } catch {
        g("Failed to upload image. Please try again."), W(false);
        return;
      }
      const Y = { category: b.category, subcategory: b.subcategory, title: b.title.trim(), description: b.description.trim(), icon: v, details: b.details.trim(), ad_type: b.ad_type, start_date: b.start_date ? new Date(b.start_date).toISOString() : "", end_date: b.end_date ? new Date(b.end_date).toISOString() : void 0 }, j = c ? { ...Y, announcementId: D, sellerId: l.id } : { ...Y, sellerId: l.id }, me = c ? await tr({ data: j }) : await sn({ data: j });
      if (me.success) alert(`Announcement ${c ? "updated" : "published"} successfully!`), B(false), F(vt), ee(null), Ye(null), Ze(null), Je();
      else {
        const ce = xt(me.error);
        g(ce);
      }
    } catch (v) {
      console.error(`Error ${c ? "updating" : "submitting"} announcement:`, v);
      const Y = xt(v);
      g(Y);
    } finally {
      W(false);
    }
  }, Hr = () => {
    B(false), g(null), ee(null), F(vt), Ye(null), Ze(null);
  }, It = (a) => {
    var _a3;
    const c = (_a3 = a.target.files) == null ? void 0 : _a3[0];
    if (c) {
      Ye(c);
      const v = URL.createObjectURL(c);
      Ze(v);
    }
  }, Kr = async (a) => {
    a.preventDefault(), St(true), Ve(null);
    try {
      let c = Ne.profile_image_url;
      if (Ae) {
        tt(true);
        const Y = new FileReader();
        Y.readAsDataURL(Ae);
        const j = await new Promise((me, ce) => {
          Y.onload = () => {
            const z = Y.result;
            typeof z == "string" ? me(z) : ce(new Error("Failed to read file"));
          }, Y.onerror = () => ce(new Error("Failed to read file"));
        });
        try {
          const me = await Ie({ data: { file: { name: Ae.name, type: Ae.type, size: Ae.size, data: j }, userId: r.id } });
          if (!me.success || !me.url) {
            Ve(me.error || "Failed to upload image"), tt(false);
            return;
          }
          c = me.url;
        } catch (me) {
          Ve(me instanceof Error ? me.message : "Failed to upload image"), tt(false);
          return;
        }
        tt(false);
      }
      const v = await Ya({ data: { name: Ne.name, profile_image_url: c || null, resources: Ne.resources, primaryResource: Ne.primaryResource } });
      v.success ? (d.invalidate(), gt(false), Ye(null), Ze(null)) : Ve(v.error || "Failed to update profile");
    } catch {
      Ve("An unexpected error occurred");
    } finally {
      St(false);
    }
  }, Vr = () => {
    lt();
  }, Yr = async (a) => {
    if (l == null ? void 0 : l.id) {
      Oe((c) => ({ ...c, [a]: true }));
      try {
        const c = await fn({ data: { announcementId: a, sellerId: l.id } });
        c.success ? (Oe((v) => ({ ...v, [a]: false })), Je()) : (Oe((v) => ({ ...v, [a]: false })), console.error("Failed to deactivate announcement:", c.error));
      } catch (c) {
        console.error("Error deactivating announcement:", c), Oe((v) => ({ ...v, [a]: false }));
      }
    }
  }, Zr = async (a) => {
    if (l == null ? void 0 : l.id) {
      Oe((c) => ({ ...c, [a]: true }));
      try {
        const c = await tr({ data: { announcementId: a, sellerId: l.id, isActive: true } });
        c.success ? (Oe((v) => ({ ...v, [a]: false })), Je()) : (Oe((v) => ({ ...v, [a]: false })), console.error("Failed to activate announcement:", c.error));
      } catch (c) {
        console.error("Error activating announcement:", c), Oe((v) => ({ ...v, [a]: false }));
      }
    }
  };
  return jsxs("div", { className: "min-h-screen bg-gray-100", children: [jsx("div", { className: "container mx-auto py-8", children: jsxs("div", { className: "flex flex-col md:flex-row", children: [jsx("div", { className: "hidden md:block", children: jsx(Ol, { user: r, activeTab: x, onTabChange: zr }) }), jsx("div", { className: "flex-1 px-6 pb-10 md:py-0", children: o && jsx("div", { className: "space-y-6", children: x === "dashboard" ? jsxs(Fragment, { children: [jsxs("div", { className: "flex items-center justify-between", children: [jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }), jsx("div", { className: "flex gap-4", children: jsxs("button", { onClick: () => Ue("New Message"), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) }), "New Message"] }) })] }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [jsxs("div", { className: "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-2", children: "Active Deals" }), jsx("p", { className: "text-3xl font-bold text-blue-600", children: "0" }), jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Your ongoing deals" })] }), jsxs("div", { className: "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-2", children: "Messages" }), jsx("p", { className: "text-3xl font-bold text-green-600", children: "0" }), jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Unread messages" })] }), jsxs("div", { className: "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-2", children: "Published Ads" }), jsx("p", { className: "text-3xl font-bold text-purple-600", children: G ? "..." : oe.length }), jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Your active announcements" })] })] }), jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [jsxs("div", { className: "flex items-center justify-between mb-4", children: [jsx("h3", { className: "text-lg font-semibold", children: "Recent Messages" }), jsx("button", { onClick: () => Ue("View All Messages"), className: "text-sm text-blue-600 hover:text-blue-700", children: "View All" })] }), jsx("div", { className: "space-y-4", children: jsxs("div", { className: "text-center py-8 text-gray-500", children: [jsx("svg", { className: "w-12 h-12 mx-auto mb-3 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) }), jsx("p", { children: "No messages yet" }), jsx("button", { onClick: () => Ue("Start a Conversation"), className: "mt-2 text-blue-600 hover:text-blue-700", children: "Start a conversation" })] }) })] }), jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [jsxs("div", { className: "flex items-center justify-between mb-4", children: [jsx("h3", { className: "text-lg font-semibold", children: "Active Deals" }), jsx("button", { onClick: () => Ue("View All Deals"), className: "text-sm text-blue-600 hover:text-blue-700", children: "View All" })] }), jsx("div", { className: "space-y-4", children: jsxs("div", { className: "text-center py-8 text-gray-500", children: [jsx("svg", { className: "w-12 h-12 mx-auto mb-3 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), jsx("p", { children: "No active deals" }), jsx("button", { onClick: () => Ue("Start a Deal"), className: "mt-2 text-blue-600 hover:text-blue-700", children: "Start a new deal" })] }) })] })] }), jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-4", children: "Quick Actions" }), jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [jsxs("button", { onClick: () => Ue("New Message"), className: "p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left", children: [jsx("svg", { className: "w-6 h-6 text-blue-600 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) }), jsx("p", { className: "font-medium", children: "New Message" }), jsx("p", { className: "text-sm text-gray-500", children: "Start a conversation" })] }), jsxs("button", { onClick: () => Ue("New Deal"), className: "p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left", children: [jsx("svg", { className: "w-6 h-6 text-green-600 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), jsx("p", { className: "font-medium", children: "New Deal" }), jsx("p", { className: "text-sm text-gray-500", children: "Start a new deal" })] }), jsxs("button", { onClick: () => Ue("View Resources"), className: "p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left", children: [jsx("svg", { className: "w-6 h-6 text-purple-600 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }), jsx("p", { className: "font-medium", children: "Resources" }), jsx("p", { className: "text-sm text-gray-500", children: "Browse available resources" })] }), jsxs("button", { onClick: () => Ue("View Announcements"), className: "p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left", children: [jsx("svg", { className: "w-6 h-6 text-yellow-600 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354a1.76 1.76 0 011.174-2.344l6.353-2.147a1.76 1.76 0 012.344 1.174l.466 1.376M11 5.882l4.06-.406a1.76 1.76 0 012.12 2.12l-.406 4.06M11 5.882l-.406 4.06m4.466-4.466l-4.06-.406" }) }), jsx("p", { className: "font-medium", children: "Announcements" }), jsx("p", { className: "text-sm text-gray-500", children: "View all announcements" })] })] })] })] }) : x === "seller" ? jsx(Fragment, { children: L ? jsx("div", { className: "flex justify-center items-center h-64", children: jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }) : V ? jsxs("div", { className: "space-y-8", children: [!qe && jsxs("div", { className: "space-y-6", children: [jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [jsx("h1", { className: "text-2xl font-bold", children: "Seller Dashboard" }), jsxs("div", { className: "flex gap-4", children: [jsxs("button", { onClick: Ft, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }), "New Listing"] }), jsxs("button", { onClick: () => {
    B(true), g(null);
  }, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354a1.76 1.76 0 011.174-2.344l6.353-2.147a1.76 1.76 0 012.344 1.174l.466 1.376M11 5.882l4.06-.406a1.76 1.76 0 012.12 2.12l-.406 4.06M11 5.882l-.406 4.06m4.466-4.466l-4.06-.406" }) }), "Publish Ad"] }), jsxs("button", { onClick: () => at(true), className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), "Complete Profile"] }), l && jsx(Cn, { seller: l, onSuccess: () => {
    lt();
  } })] })] }), jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", children: [jsxs("div", { className: "bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-2", children: "Active Listings" }), jsx("p", { className: "text-3xl font-bold text-blue-600", children: Pe ? "..." : ie }), jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Your active product listings" })] }), jsxs("div", { className: "bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsx("h3", { className: "text-lg font-semibold mb-2", children: "Published Ads" }), jsx("p", { className: "text-3xl font-bold text-indigo-600", children: G ? "..." : oe.length }), jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Your published announcements" })] })] }), jsxs("div", { className: "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow", children: [jsxs("div", { className: "flex items-center justify-between mb-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Your Seller Profile" }), jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Enhance your profile to attract more clients" })] }), jsxs("button", { onClick: () => at(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }), "Edit Seller Profile"] })] }), jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [jsxs("div", { className: "space-y-4", children: [jsxs("div", { className: "flex items-center justify-between", children: [jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Skills" }), jsxs("span", { className: "text-sm text-gray-500", children: [((_a2 = l == null ? void 0 : l.skills) == null ? void 0 : _a2.length) || 0, " skills added"] })] }), jsxs("div", { className: "flex flex-wrap gap-2", children: [(_b = l == null ? void 0 : l.skills) == null ? void 0 : _b.slice(0, 5).map((a, c) => jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm", children: a }, c)), (l == null ? void 0 : l.skills) && l.skills.length > 5 && jsxs("span", { className: "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm", children: ["+", l.skills.length - 5, " more"] }), (!(l == null ? void 0 : l.skills) || l.skills.length === 0) && jsx("p", { className: "text-sm text-gray-500", children: "No skills added yet" })] })] }), jsxs("div", { className: "space-y-4", children: [jsxs("div", { className: "flex items-center justify-between", children: [jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Languages" }), jsxs("span", { className: "text-sm text-gray-500", children: [((_c = l == null ? void 0 : l.languages) == null ? void 0 : _c.length) || 0, " languages added"] })] }), jsxs("div", { className: "flex flex-wrap gap-2", children: [(_d = l == null ? void 0 : l.languages) == null ? void 0 : _d.slice(0, 5).map((a, c) => jsx("span", { className: "px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm", children: a }, c)), (l == null ? void 0 : l.languages) && l.languages.length > 5 && jsxs("span", { className: "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm", children: ["+", l.languages.length - 5, " more"] }), (!(l == null ? void 0 : l.languages) || l.languages.length === 0) && jsx("p", { className: "text-sm text-gray-500", children: "No languages added yet" })] })] }), jsxs("div", { className: "space-y-4", children: [jsxs("div", { className: "flex items-center justify-between", children: [jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Portfolio" }), jsxs("span", { className: "text-sm text-gray-500", children: [((_e2 = l == null ? void 0 : l.portfolio) == null ? void 0 : _e2.length) || 0, " items"] })] }), jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3", children: (l == null ? void 0 : l.portfolio) && l.portfolio.length > 0 ? l.portfolio.slice(0, 6).map((a, c) => jsxs("div", { className: "bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col", children: [jsx("div", { className: "aspect-square sm:aspect-video bg-gray-100 overflow-hidden flex items-center justify-center", children: jsx("img", { src: a.image_url, alt: a.title || `Portfolio ${c + 1}`, className: "w-full h-full object-cover rounded-md sm:rounded-lg", style: { maxHeight: "120px", maxWidth: "100%" } }) }), jsxs("div", { className: "p-2 sm:p-3 flex-1 flex flex-col", children: [jsx("div", { className: "font-semibold text-gray-900 text-xs sm:text-base mb-1 truncate", children: a.title }), jsx("div", { className: "text-gray-600 text-xs sm:text-sm line-clamp-2", children: a.description })] })] }, c)) : jsx("p", { className: "text-sm text-gray-500 col-span-2 sm:col-span-3", children: "No portfolio items added yet" }) })] }), jsxs("div", { className: "space-y-4", children: [jsxs("div", { className: "flex items-center justify-between", children: [jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Gigs" }), jsxs("span", { className: "text-sm text-gray-500", children: [((_f = l == null ? void 0 : l.gigs) == null ? void 0 : _f.length) || 0, " services"] })] }), jsxs("div", { className: "space-y-3", children: [(_g = l == null ? void 0 : l.gigs) == null ? void 0 : _g.slice(0, 2).map((a, c) => jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [jsx("img", { src: a.image_url, alt: a.title, className: "w-12 h-12 object-cover rounded" }), jsxs("div", { className: "flex-1 min-w-0", children: [jsx("h5", { className: "font-medium text-gray-900 truncate", children: a.title }), jsxs("p", { className: "text-sm text-green-600", children: ["\u20B9", a.price] })] })] }, c)), (!(l == null ? void 0 : l.gigs) || l.gigs.length === 0) && jsx("p", { className: "text-sm text-gray-500", children: "No gigs added yet" }), l && Array.isArray(l.gigs) && l.gigs.length > 2 && jsxs("button", { onClick: () => at(true), className: "text-sm text-blue-600 hover:text-blue-700", children: ["View all ", l.gigs.length, " gigs"] })] })] })] }), jsxs("div", { className: "mt-6", children: [jsxs("div", { className: "flex items-center justify-between mb-2", children: [jsx("span", { className: "text-sm font-medium text-gray-700", children: "Profile Completion" }), jsxs("span", { className: "text-sm text-gray-500", children: [ut(l).percentage, "%"] })] }), jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${ut(l).percentage}%` } }) }), ut(l).missingFields.length > 0 && jsxs("div", { className: "mt-4", children: [jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Missing Information:" }), jsx("ul", { className: "list-disc list-inside text-sm text-gray-500 space-y-1", children: ut(l).missingFields.map((a, c) => jsx("li", { children: a }, c)) })] })] }), jsxs("div", { className: "mt-8", children: [jsx("h3", { className: "text-lg font-semibold mb-4", children: "Published Ads" }), G ? jsx("div", { className: "text-gray-500", children: "Loading..." }) : oe.length === 0 ? jsx("div", { className: "text-gray-500", children: "No ads published yet." }) : jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: oe.map((a) => jsxs("div", { className: "bg-white p-4 rounded-lg shadow flex items-center gap-4", children: [a.icon && jsx("img", { src: a.icon, alt: a.title, className: "w-16 h-16 object-cover rounded" }), jsxs("div", { className: "flex-1 min-w-0", children: [jsx("h4", { className: "font-medium text-gray-900 truncate", children: a.title }), jsx("p", { className: "text-sm text-gray-500 truncate", children: a.description }), jsx("span", { className: `inline-block mt-1 px-2 py-0.5 rounded text-xs ${a.status === "active" ? "bg-green-100 text-green-700" : a.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`, children: a.status }), jsxs("div", { className: "mt-2 flex gap-2", children: [jsx("button", { className: "px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200", onClick: () => Wr(a), children: "Edit" }), a.status === "active" && jsx("button", { className: "px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200", onClick: () => Yr(a.id), disabled: Re[a.id], children: Re[a.id] ? "Deactivating..." : "Deactivate" }), a.status === "inactive" && jsx("button", { className: "px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200", onClick: () => Zr(a.id), disabled: Re[a.id], children: Re[a.id] ? "Activating..." : "Activate" })] })] })] }, a.id)) })] }), jsxs("div", { className: "mt-8", children: [jsxs("div", { className: "flex items-center justify-between mb-4", children: [jsx("h3", { className: "text-lg font-semibold", children: "Products" }), jsxs("button", { onClick: Ft, className: "px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2", children: [jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }), "Add Product"] })] }), Pe ? jsx("div", { className: "text-gray-500", children: "Loading products..." }) : ie === 0 ? jsx("div", { className: "text-gray-500", children: "No products listed yet." }) : jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Ur.map((a) => {
    var _a3;
    return jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [jsx("div", { className: "aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3", children: jsx("img", { src: (_a3 = a.image) != null ? _a3 : "", alt: a.name, className: "w-full h-full object-cover" }) }), jsx("h4", { className: "font-medium text-gray-900 truncate", children: a.name }), jsx("p", { className: "text-sm text-gray-500 truncate mb-2", children: a.description }), jsxs("div", { className: "flex items-center justify-between", children: [jsxs("span", { className: "text-lg font-semibold text-blue-600", children: ["\u20B9", a.price] }), jsxs("div", { className: "flex items-center gap-2", children: [jsx("span", { className: `px-2 py-1 text-xs rounded ${a.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: a.status }), jsx("span", { className: "px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded", children: a.category })] })] }), jsxs("div", { className: "mt-3 flex gap-2", children: [jsx("button", { onClick: () => $r(a), className: "flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200", children: "Edit" }), jsx("button", { onClick: () => Or(a.id, a.status === "active" ? "inactive" : "active"), className: `flex-1 px-3 py-1 text-xs rounded ${a.status === "active" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`, children: a.status === "active" ? "Deactivate" : "Activate" })] })] }, a.id);
  }) })] })] })] }), qe && jsxs("div", { className: "max-w-2xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow", children: [jsxs("div", { className: "flex justify-between items-center mb-6", children: [jsxs("h2", { className: "text-2xl font-bold", children: [D ? "Edit" : "Publish New", " Announcement"] }), jsx("button", { onClick: Hr, className: "text-gray-500 hover:text-gray-700", children: jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) })] }), m && jsx("div", { className: "mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg", children: typeof m == "string" ? m : xt(m) }), jsxs("form", { onSubmit: Gr, className: "space-y-6", children: [jsxs("div", { children: [jsx("label", { htmlFor: "ann-title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Title (visible)" }), jsx("input", { id: "ann-title", type: "text", required: true, maxLength: 100, value: b.title, onChange: (a) => F((c) => ({ ...c, title: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" }), jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [b.title.length, "/100 characters"] })] }), jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [jsxs("div", { children: [jsx("label", { htmlFor: "ann-category", className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }), jsxs("select", { id: "ann-category", required: true, value: b.category, onChange: (a) => {
    const c = a.target.value;
    F((v) => ({ ...v, category: c, subcategory: "" }));
  }, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white", children: [jsx("option", { value: "", children: "Select a category..." }), Object.keys(dt).map((a) => jsx("option", { value: a, children: a }, a))] })] }), jsxs("div", { children: [jsx("label", { htmlFor: "ann-subcategory", className: "block text-sm font-medium text-gray-700 mb-1", children: "Subcategory" }), jsxs("select", { id: "ann-subcategory", required: true, value: b.subcategory, onChange: (a) => F((c) => ({ ...c, subcategory: a.target.value })), disabled: !b.category, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed", children: [jsx("option", { value: "", children: "Select a subcategory..." }), b.category && ((_h = dt[b.category]) == null ? void 0 : _h.map((a) => jsx("option", { value: a, children: a }, a)))] })] })] }), jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: jsxs("div", { children: [jsx("label", { htmlFor: "ann-type", className: "block text-sm font-medium text-gray-700 mb-1", children: "Advertisement Type" }), jsxs("select", { id: "ann-type", required: true, value: b.ad_type, onChange: (a) => F((c) => ({ ...c, ad_type: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white", children: [jsx("option", { value: "scroll", children: "Scroll Ad" }), jsx("option", { value: "flip", children: "Flip Ad" })] })] }) }), jsxs("div", { children: [jsx("label", { htmlFor: "ann-desc", className: "block text-sm font-medium text-gray-700 mb-1", children: "Short Description (visible)" }), jsx("textarea", { id: "ann-desc", required: true, maxLength: 200, value: b.description, onChange: (a) => F((c) => ({ ...c, description: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500", rows: 2 }), jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [b.description.length, "/200 characters"] })] }), jsxs("div", { children: [jsx("label", { htmlFor: "ann-image", className: "block text-sm font-medium text-gray-700 mb-1", children: "Announcement Image" }), jsxs("div", { className: "flex items-center gap-4", children: [jsx("input", { id: "ann-image", type: "file", accept: "image/jpeg,image/png,image/gif,image/webp", onChange: (a) => {
    var _a3;
    const c = (_a3 = a.target.files) == null ? void 0 : _a3[0];
    if (c) {
      if (c.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB"), a.target.value = "";
        return;
      }
      It(a);
    }
  }, className: `block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100` }), pt && jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden border border-gray-200", children: jsx("img", { src: pt, alt: "Preview", className: "w-full h-full object-cover" }) })] }), jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "ann-details", className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Details" }), jsx("textarea", { id: "ann-details", required: true, maxLength: 500, value: b.details, onChange: (a) => F((c) => ({ ...c, details: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500", rows: 2 }), jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [b.details.length, "/500 characters"] })] }), jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [jsxs("div", { children: [jsx("label", { htmlFor: "ann-start", className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date & Time" }), jsx("input", { id: "ann-start", type: "datetime-local", required: true, min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16), value: b.start_date, max: b.end_date || void 0, onChange: (a) => F((c) => ({ ...c, start_date: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" }), jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Cannot be in the past" })] }), jsxs("div", { children: [jsx("label", { htmlFor: "ann-end", className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date & Time (Optional)" }), jsx("input", { id: "ann-end", type: "datetime-local", value: b.end_date, min: b.start_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16), onChange: (a) => F((c) => ({ ...c, end_date: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" }), jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Must be after start date" })] })] }), jsx("button", { type: "submit", disabled: q, className: `w-full text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${D ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`, children: q ? D ? "Updating..." : "Publishing..." : D ? "Update Announcement" : "Publish Announcement" })] })] })] }) : jsxs("div", { className: "max-w-2xl mx-auto px-4 sm:px-6", children: [jsx("h1", { className: "text-2xl font-bold mb-6", children: "Become a Seller" }), Ee && !Ce && jsx("div", { className: "mb-4 p-4 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg", children: Ee }), Ce && jsx("div", { className: "mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg", children: Ce }), jsxs("form", { onSubmit: Br, className: "space-y-6", children: [jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Company Name" }), jsx("input", { type: "text", required: true, value: X.company_name, onChange: (a) => Le((c) => ({ ...c, company_name: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Business Type" }), jsx("input", { type: "text", required: true, value: X.business_type, onChange: (a) => Le((c) => ({ ...c, business_type: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address" }), jsx("input", { type: "text", required: true, value: X.address, onChange: (a) => Le((c) => ({ ...c, address: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }), jsx("input", { type: "tel", required: true, value: X.phone, onChange: (a) => Le((c) => ({ ...c, phone: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Website (Optional)" }), jsx("input", { type: "url", value: X.website, onChange: (a) => Le((c) => ({ ...c, website: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description (Optional)" }), jsx("textarea", { value: X.description, onChange: (a) => Le((c) => ({ ...c, description: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500", rows: 4 })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Aadhar Card (Optional)" }), jsxs("div", { className: "flex items-center gap-4", children: [jsx("input", { type: "file", accept: "image/*", onChange: (a) => nt("aadhar", a.target.files), className: `block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100` }), Be.aadhar && jsxs("div", { className: "relative", children: [jsx("img", { src: Be.aadhar, alt: "Aadhar preview", className: "w-20 h-20 object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => ot("aadhar", 0), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1", children: jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "GST Certificate (Optional)" }), jsxs("div", { className: "flex items-center gap-4", children: [jsx("input", { type: "file", accept: "image/*", onChange: (a) => nt("gst_certificate", a.target.files), className: `block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100` }), Be.gst_certificate && jsxs("div", { className: "relative", children: [jsx("img", { src: Be.gst_certificate, alt: "GST Certificate preview", className: "w-20 h-20 object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => ot("gst_certificate", 0), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1", children: jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Photos of Work Done (Optional)" }), jsxs("div", { className: "space-y-4", children: [jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: (a) => nt("work_photos", a.target.files), className: `block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100` }), jsx("div", { className: "flex flex-wrap gap-4", children: Be.work_photos.map((a, c) => jsxs("div", { className: "relative", children: [jsx("img", { src: a, alt: `Work photo ${c + 1}`, className: "w-20 h-20 object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => ot("work_photos", c), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1", children: jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, c)) })] })] }), jsxs("div", { className: "sm:col-span-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Owner Photos (Optional)" }), jsxs("div", { className: "space-y-4", children: [jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: (a) => nt("owner_photos", a.target.files), className: `block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100` }), jsx("div", { className: "flex flex-wrap gap-4", children: Be.owner_photos.map((a, c) => jsxs("div", { className: "relative", children: [jsx("img", { src: a, alt: `Owner photo ${c + 1}`, className: "w-20 h-20 object-cover rounded-lg" }), jsx("button", { type: "button", onClick: () => ot("owner_photos", c), className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1", children: jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, c)) })] })] })] }), jsx("button", { type: "submit", disabled: xe, className: "w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: xe ? "Submitting..." : "Submit Application" })] })] }) }) : x === "profile" ? jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: jsxs("div", { className: "p-6", children: [jsx("h1", { className: "text-2xl font-bold mb-6", children: "Profile" }), Dr ? jsxs("form", { onSubmit: Kr, className: "max-w-2xl mx-auto space-y-6", children: [jsxs("div", { className: "flex flex-col items-center space-y-4", children: [jsxs("div", { className: "relative", children: [jsx("div", { className: "w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg", children: jsx("img", { src: pt || Ne.profile_image_url || "https://via.placeholder.com/150", alt: "Profile preview", className: "w-full h-full object-cover" }) }), jsx("label", { htmlFor: "profile-image-upload", className: "absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors", children: jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }), jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" })] }) }), jsx("input", { id: "profile-image-upload", type: "file", accept: "image/*", onChange: It, className: "hidden" })] }), jsx("p", { className: "text-sm text-gray-500", children: "Click the camera icon to change your profile picture" })] }), jsxs("div", { className: "space-y-2", children: [jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Full Name" }), jsx("input", { id: "name", type: "text", value: Ne.name, onChange: (a) => et((c) => ({ ...c, name: a.target.value })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors", placeholder: "Enter your full name" })] }), jsxs("div", { className: "space-y-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Select Your Main Resource Category" }), jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: Object.entries(dt).map(([a, c]) => jsxs("label", { className: `relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${Ne.resources[0] === a ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`, children: [jsx("input", { type: "radio", name: "resource", checked: Ne.resources[0] === a, onChange: () => {
    et((v) => ({ ...v, resources: [a], primaryResource: [] }));
  }, className: "sr-only" }), jsxs("div", { className: "flex-1", children: [jsx("div", { className: "font-medium text-gray-900", children: a }), jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [c.length, " subcategories"] })] }), Ne.resources[0] === a && jsx("div", { className: "absolute top-2 right-2 text-blue-600", children: jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) })] }, a)) })] }), Ne.resources[0] && jsxs("div", { className: "space-y-2", children: [jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Select Your Primary Resource" }), jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: dt[Ne.resources[0]].map((a) => jsxs("label", { className: `relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${Ne.primaryResource[0] === a ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`, children: [jsx("input", { type: "radio", name: "primaryResource", checked: Ne.primaryResource[0] === a, onChange: () => {
    et((c) => ({ ...c, primaryResource: [a] }));
  }, className: "sr-only" }), jsx("div", { className: "flex-1", children: jsx("div", { className: "font-medium text-gray-900", children: a }) }), Ne.primaryResource[0] === a && jsx("div", { className: "absolute top-2 right-2 text-blue-600", children: jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) })] }, a)) })] }), Pt && jsx("div", { className: "p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg", children: Pt }), jsxs("div", { className: "flex gap-4 pt-4", children: [jsx("button", { type: "submit", disabled: Ct || jr, className: "flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: Ct ? jsxs(Fragment, { children: [jsxs("svg", { className: "animate-spin h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving..."] }) : jsxs(Fragment, { children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), "Save Changes"] }) }), jsx("button", { type: "button", onClick: () => {
    gt(false), et({ name: r.name, profile_image_url: r.profile_image_url, resources: r.resources || [], primaryResource: r.primaryResource || [] }), Ye(null), Ze(null);
  }, className: "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors", children: "Cancel" })] })] }) : jsxs("div", { className: "max-w-2xl mx-auto space-y-8", children: [jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-6", children: [jsx("div", { className: "relative", children: jsx("div", { className: "w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg", children: jsx("img", { src: r.profile_image_url || "https://via.placeholder.com/150", alt: r.name, className: "w-full h-full object-cover" }) }) }), jsxs("div", { className: "text-center sm:text-left", children: [jsx("h2", { className: "text-2xl font-bold text-gray-900", children: r.name }), jsx("p", { className: "text-gray-500", children: r.email }), jsxs("button", { onClick: () => gt(true), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto sm:mx-0", children: [jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }), "Edit Profile"] })] })] }), jsxs("div", { className: "bg-gray-50 rounded-lg p-6 space-y-6", children: [jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Resources" }), jsx("div", { className: "flex flex-wrap gap-2", children: (_i = r.resources) == null ? void 0 : _i.map((a, c) => jsx("span", { className: "px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium", children: a }, c)) })] }), jsxs("div", { children: [jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Primary Resource" }), jsx("div", { className: "flex flex-wrap gap-2", children: (_j = r.primaryResource) == null ? void 0 : _j.map((a, c) => jsx("span", { className: "px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium", children: a }, c)) })] })] })] })] }) }) : x === "audit-logs" ? jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: jsxs("div", { className: "p-4 sm:p-6", children: [jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [jsx("h1", { className: "text-2xl font-bold", children: "Audit Logs" }), jsxs("div", { className: "flex flex-wrap gap-2 w-full sm:w-auto", children: [jsxs("select", { value: U, onChange: (a) => A(a.target.value), className: "w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500", children: [jsx("option", { value: "", children: "All Actions" }), jsx("option", { value: "CREATE", children: "Create" }), jsx("option", { value: "UPDATE", children: "Update" }), jsx("option", { value: "DELETE", children: "Delete" })] }), jsxs("select", { value: M, onChange: (a) => w(a.target.value), className: "w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500", children: [jsx("option", { value: "", children: "All Entities" }), jsx("option", { value: "ANNOUNCEMENT", children: "Announcements" }), jsx("option", { value: "PRODUCT", children: "Products" }), jsx("option", { value: "GIG", children: "Gigs" }), jsx("option", { value: "PORTFOLIO", children: "Portfolio" })] }), jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [jsx("input", { type: "date", value: ae, onChange: (a) => Z(a.target.value), className: "w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" }), jsx("input", { type: "date", value: K, onChange: (a) => Q(a.target.value), className: "w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" })] })] })] }), Mr ? jsx("div", { className: "flex justify-center items-center h-64", children: jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }) : Rt ? jsx("div", { className: "p-4 bg-red-100 text-red-700 rounded-lg", children: Rt }) : C.length === 0 ? jsxs("div", { className: "text-center py-12", children: [jsx("svg", { className: "w-12 h-12 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), jsx("p", { className: "mt-4 text-gray-500", children: "No audit logs found" })] }) : jsx("div", { className: "overflow-x-auto", children: jsxs("table", { className: "w-full", children: [jsx("thead", { children: jsxs("tr", { className: "border-b", children: [jsx("th", { className: "px-4 py-2 text-left", children: "Action" }), jsx("th", { className: "px-4 py-2 text-left", children: "User" }), jsx("th", { className: "px-4 py-2 text-left", children: "Entity" }), jsx("th", { className: "px-4 py-2 text-left", children: "Changes" }), jsx("th", { className: "px-4 py-2 text-left", children: "Timestamp" })] }) }), jsx("tbody", { children: C.map((a) => jsxs("tr", { className: "border-b hover:bg-gray-50", children: [jsx("td", { className: "px-4 py-2", children: jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${a.action === "CREATE" ? "bg-green-100 text-green-800" : a.action === "UPDATE" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`, children: a.action }) }), jsx("td", { className: "px-4 py-2", children: jsxs("div", { children: [jsx("div", { className: "font-medium", children: a.user.name }), jsx("div", { className: "text-sm text-gray-500", children: a.user.email })] }) }), jsx("td", { className: "px-4 py-2", children: jsxs("div", { children: [jsx("div", { className: "font-medium", children: a.entity_type }), jsxs("div", { className: "text-sm text-gray-500", children: ["ID: ", a.entity_id] })] }) }), jsx("td", { className: "px-4 py-2", children: jsx("div", { className: "max-w-md", children: Object.entries(a.changes || {}).map(([c, v]) => jsxs("div", { className: "mb-2 last:mb-0", children: [jsx("div", { className: "text-sm font-medium text-gray-700", children: c }), typeof v == "object" && v !== null ? jsx("div", { className: "pl-2 border-l-2 border-gray-200", children: Object.entries(v).map(([Y, j]) => jsxs("div", { className: "text-sm", children: [jsxs("span", { className: "text-gray-600", children: [Y, ":"] }), " ", jsx("span", { className: "text-gray-900", children: typeof j == "boolean" ? jsx("span", { className: `px-1.5 py-0.5 rounded text-xs ${j ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: j ? "Yes" : "No" }) : typeof j == "string" && j.startsWith("http") ? jsx("a", { href: j, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "View" }) : String(j) })] }, Y)) }) : jsx("div", { className: "text-sm text-gray-900", children: typeof v == "boolean" ? jsx("span", { className: `px-1.5 py-0.5 rounded text-xs ${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: v ? "Yes" : "No" }) : typeof v == "string" && v.startsWith("http") ? jsx("a", { href: v, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "View" }) : String(v != null ? v : "") })] }, c)) }) }), jsx("td", { className: "px-4 py-2 text-sm text-gray-500", children: formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) })] }, a.id)) })] }) })] }) }) : null }) })] }) }), Tt && l && jsx(An, { isOpen: Tt, onClose: () => at(false), seller: l, onSuccess: Vr }), k && l && jsx(Sn, { isOpen: k, onClose: () => {
    I(false), P(null);
  }, sellerId: l.id, onSuccess: () => {
    ht();
  } }), S && T && jsx(Pn, { isOpen: S, onClose: () => {
    f(false), P(null);
  }, product: T, onProductUpdated: () => {
    ht(), f(false), P(null);
  } })] });
}
const qn = O("app_routes_app_tsx--updateSellerCompleteProfile_createServerFn_handler", "/_server"), zn = createServerFn({ method: "POST", response: "data" }).validator((r) => Ln.parse(r)).handler(qn), Bn = O("app_routes_app_tsx--uploadProfileImage_createServerFn_handler", "/_server"), Ie = createServerFn({ method: "POST", response: "data" }).validator((r) => Dn.parse(r)).handler(Bn);
function ut(r) {
  var _a2, _b, _c, _d, _e2, _f, _g, _h, _i, _j;
  if (!r) return { percentage: 0, missingFields: [] };
  const p = 11;
  let d = 0;
  const h = [];
  return ((_a2 = r.company_name) == null ? void 0 : _a2.trim()) ? d++ : h.push("Company Name"), ((_b = r.business_type) == null ? void 0 : _b.trim()) ? d++ : h.push("Business Type"), ((_c = r.address) == null ? void 0 : _c.trim()) ? d++ : h.push("Address"), ((_d = r.phone) == null ? void 0 : _d.trim()) ? d++ : h.push("Phone"), ((_e2 = r.website) == null ? void 0 : _e2.trim()) ? d++ : h.push("Website"), ((_f = r.description) == null ? void 0 : _f.trim()) ? d++ : h.push("Description"), !r.aadhar_url && !r.gst_certificate_url ? h.push("Verification Documents") : d++, ((_g = r.skills) == null ? void 0 : _g.length) ? d++ : h.push("Skills"), ((_h = r.languages) == null ? void 0 : _h.length) ? d++ : h.push("Languages"), ((_i = r.portfolio) == null ? void 0 : _i.length) ? d++ : h.push("Portfolio"), ((_j = r.gigs) == null ? void 0 : _j.length) ? d++ : h.push("Gigs"), { percentage: Math.round(d / p * 100), missingFields: h };
}
const Wn = () => import('../build/index.mjs'), Ir = createFileRoute("/")({ component: lazyRouteComponent(Wn, "component", () => Ir.ssr) }), Gn = () => import('../build/seller._sellerId.mjs'), Er = createFileRoute("/seller/$sellerId")({ component: lazyRouteComponent(Gn, "component", () => Er.ssr), loader: async ({ params: r }) => {
  console.log("Loading seller profile for ID:", r.sellerId);
  const p = await Kl({ data: { sellerId: parseInt(r.sellerId) } });
  if (!p.success) throw new Error(p.error);
  const d = await wt({ data: { sellerId: parseInt(r.sellerId) } });
  if (!d.success) throw new Error(d.error);
  const h = await Pr({ data: { sellerId: parseInt(r.sellerId) } });
  if (!h.success) throw new Error(h.error);
  console.log("Fetching portfolio for seller ID:", r.sellerId);
  const o = await Sr({ data: { sellerId: parseInt(r.sellerId) } });
  console.log("Portfolio result:", o);
  const x = o.success && Array.isArray(o.portfolio) ? o.portfolio.map((_) => ({ image_url: _.image_url, title: _.title, description: _.description })) : [];
  return console.log("Processed portfolio:", x), { seller: p.seller, products: d.products || [], gigs: h.gigs || [], portfolio: x };
} }), Hn = () => import('../build/product._productId.mjs'), Lr = createFileRoute("/product/$productId")({ component: lazyRouteComponent(Hn, "component", () => Lr.ssr) }), Kn = ir.update({ id: "/time-management", path: "/time-management", getParentRoute: () => ge }), Vn = hr.update({ id: "/test-tender", path: "/test-tender", getParentRoute: () => ge }), Yn = fr.update({ id: "/tenders", path: "/tenders", getParentRoute: () => ge }), Zn = br.update({ id: "/suppliers", path: "/suppliers", getParentRoute: () => ge }), Jn = yr.update({ id: "/solutions", path: "/solutions", getParentRoute: () => ge }), Qn = vr.update({ id: "/signup", path: "/signup", getParentRoute: () => ge }), Xn = xr.update({ id: "/resource-compass", path: "/resource-compass", getParentRoute: () => ge }), eo = Nr.update({ id: "/projectandconstruction", path: "/projectandconstruction", getParentRoute: () => ge }), to = wr.update({ id: "/login", path: "/login", getParentRoute: () => ge }), ro = _r.update({ id: "/deals", path: "/deals", getParentRoute: () => ge }), ao = kr.update({ id: "/contact", path: "/contact", getParentRoute: () => ge }), lo = Cr.update({ id: "/categories", path: "/categories", getParentRoute: () => ge }), no = $n.update({ id: "/app", path: "/app", getParentRoute: () => ge }), oo = Ir.update({ id: "/", path: "/", getParentRoute: () => ge }), so = Er.update({ id: "/seller/$sellerId", path: "/seller/$sellerId", getParentRoute: () => ge }), io = Lr.update({ id: "/product/$productId", path: "/product/$productId", getParentRoute: () => ge }), co = { IndexRoute: oo, AppRoute: no, CategoriesRoute: lo, ContactRoute: ao, DealsRoute: ro, LoginRoute: to, ProjectandconstructionRoute: eo, ResourceCompassRoute: Xn, SignupRoute: Qn, SolutionsRoute: Jn, SuppliersRoute: Zn, TendersRoute: Yn, TestTenderRoute: Vn, TimeManagementRoute: Kn, ProductProductIdRoute: io, SellerSellerIdRoute: so }, uo = ge._addFileChildren(co)._addFileTypes();
function mo() {
  return jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center", children: [jsx("h1", { className: "text-4xl font-bold", children: "404 - Page Not Found" }), jsx("p", { className: "mt-4 text-gray-600", children: "The page you're looking for doesn't exist." }), jsx(Link, { to: "/", className: "mt-6 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600", children: "Go Home" })] });
}
function go() {
  return createRouter$2({ routeTree: uo, defaultNotFoundComponent: mo, scrollRestoration: true });
}
const Oo = createStartHandler({ createRouter: go, getRouterManifest: Ea })(Ra);

const handlers = [
  { route: '', handler: _zV42FD, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: G, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: Oo, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return O$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp = createNitroApp();
function useNitroApp() {
  return nitroApp;
}
runNitroPlugins(nitroApp);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

export { $o as $, Do as D, Eo as E, Ir as I, Ke as K, Lo as L, Mo as M, O, Uo as U, _t as _, trapUnhandledNodeErrors as a, useNitroApp as b, Kl as c, destr as d, Er as e, fr as f, hr as h, jo as j, pr as p, setupGracefulShutdown as s, toNodeListener as t, useRuntimeConfig as u, wr as w };
//# sourceMappingURL=nitro.mjs.map
