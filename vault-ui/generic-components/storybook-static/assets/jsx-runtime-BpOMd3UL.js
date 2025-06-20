import{r as l}from"./index-CBqU2yxZ.js";var f={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var i=l,m=Symbol.for("react.element"),x=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,j=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,y={key:!0,ref:!0,__self:!0,__source:!0};function a(t,e,p){var r,o={},n=null,u=null;p!==void 0&&(n=""+p),e.key!==void 0&&(n=""+e.key),e.ref!==void 0&&(u=e.ref);for(r in e)c.call(e,r)&&!y.hasOwnProperty(r)&&(o[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)o[r]===void 0&&(o[r]=e[r]);return{$$typeof:m,type:t,key:n,ref:u,props:o,_owner:j.current}}s.Fragment=x;s.jsx=a;s.jsxs=a;f.exports=s;var _=f.exports;const d=_.Fragment,v=_.jsx,O=_.jsxs,b=Object.freeze(Object.defineProperty({__proto__:null,Fragment:d,jsx:v,jsxs:O},Symbol.toStringTag,{value:"Module"}));export{d as F,v as a,b,O as j};
