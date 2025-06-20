import{a as D}from"./jsx-runtime-BpOMd3UL.js";import{r as S}from"./index-CBqU2yxZ.js";import{H as c}from"./HCGroupDropDown-CvXXRbf5.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-BZazNvRu.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Typography-Cu0rniWn.js";import"./Stack-DEOkgDyK.js";import"./Box-ud52NnwN.js";import"./isMuiElement-BxNAcTwJ.js";import"./Select-ec_Y8gFs.js";import"./react-is.production.min-DSf3zZfm.js";import"./index-DiryW6Jz.js";import"./Portal-DBeQERGv.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./isHostComponent-DVu5iVWx.js";import"./index-D_w70K-N.js";import"./Popover-Dsbu-ybZ.js";import"./Grow-BObsAk6g.js";import"./utils-Bboi81ly.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./ownerDocument-DW-IO8s5.js";import"./ownerWindow-BN2rbQ_G.js";import"./Modal-PVjgijRQ.js";import"./createChainedFunction-BO_9K8Jh.js";import"./Paper-D64tQ3vb.js";import"./List-DGKAo3RX.js";import"./ListContext-DDAXNj-4.js";import"./useControlled-BAdDSZ1i.js";import"./useId-CCvFYAsL.js";import"./ArrowDropDown-CCFdykRc.js";import"./OutlinedInput-GkLik3hX.js";import"./createSvgIcon-D2Nfo98N.js";import"./KeyboardArrowDown-DPbGM5BQ.js";import"./MenuItem-DwBbAKO3.js";import"./ButtonBase-BnVQqZPq.js";import"./assertThisInitialized-B9jnkVVz.js";import"./listItemTextClasses-BOhX8Zrh.js";import"./Divider-DpVW90Ab.js";const lo={title:"Components/HCGroupDropDown",component:c,parameters:{docs:{description:{component:`## About
Select components are used for collecting user provided information from a list of options.`}}}},i=[{id:"1",value:"One"},{id:"2",value:"Two"},{id:"3",value:"Three"}],d={One:i,Two:i.map((o,e)=>({...o,id:`${o.id}-${e}`}))},r={args:{label:"Group Select",inputProps:{placeholder:"Select"},groupOptions:d}},t={args:{label:"Group Select",inputProps:{placeholder:"Select"},groupOptions:d},render(o){const[e,g]=S.useState();return D(c,{...o,id:"items",value:e,onChange:p=>{console.log(p),g(p)}})}};var n,m,a;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    label: 'Group Select',
    inputProps: {
      placeholder: 'Select'
    },
    groupOptions
    // value: options[0]
  }
}`,...(a=(m=r.parameters)==null?void 0:m.docs)==null?void 0:a.source}}};var s,l,u;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    label: 'Group Select',
    inputProps: {
      placeholder: 'Select'
    },
    groupOptions
  },
  render(args) {
    const [value, setValue] = React.useState<HCDropDownValue>();
    return <HCGroupDropDown {...args} id={'items'} value={value} onChange={val => {
      console.log(val);
      setValue(val);
    }} />;
  }
}`,...(u=(l=t.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};const uo=["GroupDropDown","StateFulGroupDD"];export{r as GroupDropDown,t as StateFulGroupDD,uo as __namedExportsOrder,lo as default};
