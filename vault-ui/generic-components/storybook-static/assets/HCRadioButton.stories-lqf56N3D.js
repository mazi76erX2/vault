import{a}from"./jsx-runtime-BpOMd3UL.js";import{H as R}from"./HCRadioButton-ChtVos60.js";import{g as e}from"./utils-Dfb0jG6U.js";import{C as r}from"./theme-LIXr8eX_.js";import{B as b}from"./Box-ud52NnwN.js";import"./index-CBqU2yxZ.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCFormControl-mqcV0LO_.js";import"./useTheme-BZazNvRu.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Typography-Cu0rniWn.js";import"./Stack-DEOkgDyK.js";import"./isMuiElement-BxNAcTwJ.js";import"./SwitchBase-BZFLzUAk.js";import"./useControlled-BAdDSZ1i.js";import"./ButtonBase-BnVQqZPq.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./createSvgIcon-D2Nfo98N.js";import"./createChainedFunction-BO_9K8Jh.js";import"./useId-CCvFYAsL.js";const He={title:"Components/HCRadioButton",component:R,parameters:{docs:{description:{component:`## About
RadioButtons allow the user to select one item from a set of items.
.`}}}},o={args:{hcType:{type:"single"},label:"RadioButton",size:r.Large,onRadioSelect(t,ne){console.log(t,ne)}},parameters:e("story","A simple RadioButton input - primary")},n={args:{hcType:{type:"single",checked:!0},label:"RadioButton"},parameters:e("story","A simple RadioButton input - primary - `checked`")},s={args:{hcType:{type:"single"},label:"RadioButton",hcVariant:"neutral"},parameters:e("story","A simple RadioButton input - neutral")},i={args:{hcType:{type:"single",checked:!0},label:"RadioButton",hcVariant:"neutral"},parameters:e("story","A simple RadioButton input - neutral `checked`")},p={args:{hcType:{type:"single",disabled:!0},label:"RadioButton",hcVariant:"neutral"},parameters:e("story","A simple RadioButton input - disabled `unchecked`")},u={args:{hcType:{type:"single",disabled:!0,checked:!0},label:"RadioButton",hcVariant:"neutral"},parameters:e("story","A simple RadioButton input - disabled `checked`")},h=[{disabled:!0,label:"Disabled",id:"RadioButton1"},{disabled:!0,label:"Disabled - Unchecked",id:"RadioButton2"},{label:"Active",id:"RadioButton3"},{label:"Inactive",id:"RadioButton4"}],l={args:{hcType:{type:"group",options:h,name:"ButtonTest",defaultValue:h[0]},label:"RadioButton group",hcVariant:"neutral"},parameters:e("story","A group of RadioButton inputs`")},c={args:{hcType:{type:"group",options:h,name:"ButtonTest",defaultValue:h[0],row:!0},label:"RadioButton group",hcVariant:"neutral"},parameters:e("story","A group of RadioButton inputs - `row`")},d={args:{hcType:{type:"single"},label:"RadioButton",hcVariant:"neutral",size:r.Medium},parameters:e("story","Medium RadioButton input - neutral")},m={args:{hcType:{type:"single"},label:"RadioButton",radioButtonProps:{defaultChecked:!0},size:r.Small},parameters:e("story","Small RadioButton input - primary")},g={args:{hcType:{type:"single"},label:"RadioButton - Long text label test",radioButtonProps:{defaultChecked:!0},size:r.Small},render(t){return a(b,{sx:{maxWidth:"100px"},children:a(R,{...t})})},parameters:e("story","Small RadioButton input with a long label text - primary")},B={args:{hcType:{type:"single"},label:"RadioButton - Long text label test",radioButtonProps:{defaultChecked:!0},size:r.Medium},render(t){return a(b,{sx:{maxWidth:"100px"},children:a(R,{...t})})},parameters:e("story","Medium RadioButton input with a long label text - primary")},y={args:{hcType:{type:"single"},label:"RadioButton - Long text label test",radioButtonProps:{defaultChecked:!0},size:r.Large},render(t){return a(b,{sx:{maxWidth:"100px"},children:a(R,{...t})})},parameters:e("story","Large RadioButton input with a long label text - primary")};var S,x,k;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton',
    size: CheckBoxSize.Large,
    onRadioSelect(checked, item: HCRadioButtonOption) {
      console.log(checked, item);
    }
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - primary')
}`,...(k=(x=o.parameters)==null?void 0:x.docs)==null?void 0:k.source}}};var C,T,L;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      checked: true
    },
    label: 'RadioButton'
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - primary - \`checked\`')
}`,...(L=(T=n.parameters)==null?void 0:T.docs)==null?void 0:L.source}}};var f,D,z;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - neutral')
}`,...(z=(D=s.parameters)==null?void 0:D.docs)==null?void 0:z.source}}};var A,V,w;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      checked: true
    },
    label: 'RadioButton',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - neutral \`checked\`')
}`,...(w=(V=i.parameters)==null?void 0:V.docs)==null?void 0:w.source}}};var M,P,H;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      disabled: true
    },
    label: 'RadioButton',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - disabled \`unchecked\`')
}`,...(H=(P=p.parameters)==null?void 0:P.docs)==null?void 0:H.source}}};var N,W,G;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      disabled: true,
      checked: true
    },
    label: 'RadioButton',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple RadioButton input - disabled \`checked\`')
}`,...(G=(W=u.parameters)==null?void 0:W.docs)==null?void 0:G.source}}};var U,v,O;l.parameters={...l.parameters,docs:{...(U=l.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'group',
      options,
      name: 'ButtonTest',
      defaultValue: options[0]
    },
    label: 'RadioButton group',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A group of RadioButton inputs\`')
}`,...(O=(v=l.parameters)==null?void 0:v.docs)==null?void 0:O.source}}};var _,j,E;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'group',
      options,
      name: 'ButtonTest',
      defaultValue: options[0],
      row: true
    },
    label: 'RadioButton group',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A group of RadioButton inputs - \`row\`')
}`,...(E=(j=c.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var I,q,F;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton',
    hcVariant: 'neutral',
    size: CheckBoxSize.Medium
  },
  parameters: getStoryDescription('story', 'Medium RadioButton input - neutral')
}`,...(F=(q=d.parameters)==null?void 0:q.docs)==null?void 0:F.source}}};var J,K,Q;m.parameters={...m.parameters,docs:{...(J=m.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton',
    radioButtonProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Small
  },
  parameters: getStoryDescription('story', 'Small RadioButton input - primary')
}`,...(Q=(K=m.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var X,Y,Z;g.parameters={...g.parameters,docs:{...(X=g.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton - Long text label test',
    radioButtonProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Small
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCRadioButton {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Small RadioButton input with a long label text - primary')
}`,...(Z=(Y=g.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,te;B.parameters={...B.parameters,docs:{...($=B.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton - Long text label test',
    radioButtonProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Medium
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCRadioButton {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Medium RadioButton input with a long label text - primary')
}`,...(te=(ee=B.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ae,re,oe;y.parameters={...y.parameters,docs:{...(ae=y.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'RadioButton - Long text label test',
    radioButtonProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Large
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCRadioButton {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Large RadioButton input with a long label text - primary')
}`,...(oe=(re=y.parameters)==null?void 0:re.docs)==null?void 0:oe.source}}};const Ne=["BasicRadioButton","BasicChecked","BasicNeutralRadioButton","BasicNeutralChecked","BasicDisabledUnChecked","BasicDisabledChecked","BasicGroupColumn","BasicGroupRow","MediumNeutralRadioButton","SmallPrimaryRadioButton","SmallLongLabelRadioButton","MediumLongLabelRadioButton","LargeLongLabelRadioButton"];export{n as BasicChecked,u as BasicDisabledChecked,p as BasicDisabledUnChecked,l as BasicGroupColumn,c as BasicGroupRow,i as BasicNeutralChecked,s as BasicNeutralRadioButton,o as BasicRadioButton,y as LargeLongLabelRadioButton,B as MediumLongLabelRadioButton,d as MediumNeutralRadioButton,g as SmallLongLabelRadioButton,m as SmallPrimaryRadioButton,Ne as __namedExportsOrder,He as default};
