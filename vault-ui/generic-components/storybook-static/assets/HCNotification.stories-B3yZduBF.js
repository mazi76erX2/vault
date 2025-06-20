import{a}from"./jsx-runtime-BpOMd3UL.js";import{H as P,s as V,e as k,a as D}from"./HCNotification.utils-D_58qJQC.js";import{g as L}from"./utils-Dfb0jG6U.js";import{H as n}from"./HCButton-KVvaK2XC.js";import"./index-CBqU2yxZ.js";import"./_commonjsHelpers-BosuxZz1.js";import"./index-BYirtCN-.js";import"./HCLoader-BV6-mbh_.js";import"./react-svg.esm-TRwOGt_4.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./inheritsLoose-DR8r8Ogv.js";import"./index-Dk74W0Oi.js";import"./useTheme-BZazNvRu.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./Box-ud52NnwN.js";import"./Typography-Cu0rniWn.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./IconButton-C8fegeYt.js";import"./ButtonBase-BnVQqZPq.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./assertThisInitialized-B9jnkVVz.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./createSvgIcon-D2Nfo98N.js";import"./InfoOutlined-wNxmeSCf.js";import"./theme-LIXr8eX_.js";const oe={title:"Components/HCNotification",component:P,parameters:L("component",`## About
Custom component used in react-hot-toast.
`)},e={args:{message:"Data saved successfully!",hcVariant:"success"}},r={render(){return a(n,{hcVariant:"primary",text:"Success",onClick:()=>{V({message:"Data updated!",position:"bottom-center"})}})}},t={render(){return a(n,{hcVariant:"primary",text:"Failure",onClick:()=>{k({message:"Data not updated!"})}})}},o={render(){const i=new Promise(c=>{setTimeout(()=>c(null),5e3)});return a(n,{hcVariant:"primary",text:"Success Load",onClick:()=>{D({runner:i,loadingText:"Loading",successText:"Data loaded!",failureText:"Failed to load data"})}})}},s={render(){const i=new Promise((c,H)=>{setTimeout(()=>H(null),5e3)});return a(n,{hcVariant:"primary",text:"Failure Load",onClick:()=>{D({runner:i,loadingText:"Loading",successText:"Data loaded!",failureText:"Failed to load data"})}})}};var m,u,d;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    message: 'Data saved successfully!',
    hcVariant: 'success'
  }
}`,...(d=(u=e.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var p,l,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render() {
    return <HCButton hcVariant={'primary'} text={'Success'} onClick={() => {
      success({
        message: 'Data updated!',
        position: 'bottom-center'
      });
    }} />;
  }
}`,...(g=(l=r.parameters)==null?void 0:l.docs)==null?void 0:g.source}}};var T,x,C;t.parameters={...t.parameters,docs:{...(T=t.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render() {
    return <HCButton hcVariant={'primary'} text={'Failure'} onClick={() => {
      error({
        message: 'Data not updated!'
      });
    }} />;
  }
}`,...(C=(x=t.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var f,y,N;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render() {
    const successPromise = new Promise(resolve => {
      setTimeout(() => resolve(null), 5000);
    });
    return <HCButton hcVariant={'primary'} text={'Success Load'} onClick={() => {
      asyncNotification({
        runner: successPromise,
        loadingText: 'Loading',
        successText: 'Data loaded!',
        failureText: 'Failed to load data'
      });
    }} />;
  }
}`,...(N=(y=o.parameters)==null?void 0:y.docs)==null?void 0:N.source}}};var S,F,h;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render() {
    const successPromise = new Promise((_resolve, reject) => {
      setTimeout(() => reject(null), 5000);
    });
    return <HCButton hcVariant={'primary'} text={'Failure Load'} onClick={() => {
      asyncNotification({
        runner: successPromise,
        loadingText: 'Loading',
        successText: 'Data loaded!',
        failureText: 'Failed to load data'
      });
    }} />;
  }
}`,...(h=(F=s.parameters)==null?void 0:F.docs)==null?void 0:h.source}}};const se=["BasicHCNotification","TriggerSuccessNotice","TriggerFailureNotice","TriggerAsyncSuccessNotice","TriggerAsyncFailureNotice"];export{e as BasicHCNotification,s as TriggerAsyncFailureNotice,o as TriggerAsyncSuccessNotice,t as TriggerFailureNotice,r as TriggerSuccessNotice,se as __namedExportsOrder,oe as default};
