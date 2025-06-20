import{a as r}from"./jsx-runtime-BpOMd3UL.js";import{H as x}from"./HCCheckBox-CAVHpZpK.js";import{g as e}from"./utils-Dfb0jG6U.js";import{C as a}from"./theme-LIXr8eX_.js";import{B as k}from"./Box-ud52NnwN.js";import"./index-CBqU2yxZ.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCFormControl-mqcV0LO_.js";import"./useTheme-BZazNvRu.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Typography-Cu0rniWn.js";import"./Stack-DEOkgDyK.js";import"./isMuiElement-BxNAcTwJ.js";import"./Checkbox-C_bPhxNF.js";import"./SwitchBase-BZFLzUAk.js";import"./useControlled-BAdDSZ1i.js";import"./ButtonBase-BnVQqZPq.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./createSvgIcon-D2Nfo98N.js";const Ae={title:"Components/HCCheckBox",component:x,parameters:{docs:{description:{component:`## About
Checkboxes allow the user to select one or more items from a set.
.`}}}},c={args:{hcType:{type:"single",checked:!0},label:"Checkbox",size:a.Large},parameters:e("story","A simple checkbox input - primary")},o={args:{hcType:{type:"single",checked:!0},label:"Checkbox"},parameters:e("story","A simple checkbox input - primary - `checked`")},s={args:{hcType:{type:"single"},label:"Checkbox",hcVariant:"neutral"},parameters:e("story","A simple checkbox input - neutral")},n={args:{hcType:{type:"single",checked:!0},label:"Checkbox",hcVariant:"neutral"},parameters:e("story","A simple checkbox input - neutral `checked`")},i={args:{hcType:{type:"single",disabled:!0},label:"Checkbox",hcVariant:"neutral"},parameters:e("story","A simple checkbox input - disabled `unchecked`")},p={args:{hcType:{type:"single",disabled:!0,checked:!0},label:"Checkbox",hcVariant:"neutral"},parameters:e("story","A simple checkbox input - disabled `checked`")},ee=[{disabled:!0,checked:!0,label:"Disabled",id:"checkbox1"},{disabled:!0,checked:!1,label:"Disabled - Unchecked",id:"checkbox2"},{checked:!0,label:"Active",id:"checkbox3"},{label:"Inactive",id:"checkbox4"}],l={args:{hcType:{type:"group",options:ee},label:"Checkbox group",hcVariant:"neutral"},parameters:e("story","A group of checkbox inputs`")},h={args:{hcType:{type:"single"},label:"Checkbox",hcVariant:"neutral",size:a.Medium},parameters:e("story","Medium checkbox input - neutral")},m={args:{hcType:{type:"single"},label:"Checkbox",checkBoxProps:{defaultChecked:!0},size:a.Small},parameters:e("story","Small checkbox input - primary")},u={args:{hcType:{type:"single"},label:"Checkbox - Long text label test",checkBoxProps:{defaultChecked:!0},size:a.Small},render(t){return r(k,{sx:{maxWidth:"100px"},children:r(x,{...t})})},parameters:e("story","Small checkbox input with a long label text - primary")},d={args:{hcType:{type:"single"},label:"Checkbox - Long text label test",checkBoxProps:{defaultChecked:!0},size:a.Medium},render(t){return r(k,{sx:{maxWidth:"100px"},children:r(x,{...t})})},parameters:e("story","Medium checkbox input with a long label text - primary")},b={args:{hcType:{type:"single"},label:"Checkbox - Long text label test",checkBoxProps:{defaultChecked:!0},size:a.Large},render(t){return r(k,{sx:{maxWidth:"100px"},children:r(x,{...t})})},parameters:e("story","Large checkbox input with a long label text - primary")};var g,y,C;c.parameters={...c.parameters,docs:{...(g=c.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      checked: true
    },
    label: 'Checkbox',
    size: CheckBoxSize.Large
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - primary')
}`,...(C=(y=c.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};var S,B,L;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      checked: true
    },
    label: 'Checkbox'
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - primary - \`checked\`')
}`,...(L=(B=o.parameters)==null?void 0:B.docs)==null?void 0:L.source}}};var T,z,D;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - neutral')
}`,...(D=(z=s.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var f,A,M;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      checked: true
    },
    label: 'Checkbox',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - neutral \`checked\`')
}`,...(M=(A=n.parameters)==null?void 0:A.docs)==null?void 0:M.source}}};var V,P,w;i.parameters={...i.parameters,docs:{...(V=i.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      disabled: true
    },
    label: 'Checkbox',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - disabled \`unchecked\`')
}`,...(w=(P=i.parameters)==null?void 0:P.docs)==null?void 0:w.source}}};var H,N,W;p.parameters={...p.parameters,docs:{...(H=p.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single',
      disabled: true,
      checked: true
    },
    label: 'Checkbox',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A simple checkbox input - disabled \`checked\`')
}`,...(W=(N=p.parameters)==null?void 0:N.docs)==null?void 0:W.source}}};var U,v,G;l.parameters={...l.parameters,docs:{...(U=l.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'group',
      options
    },
    label: 'Checkbox group',
    hcVariant: 'neutral'
  },
  parameters: getStoryDescription('story', 'A group of checkbox inputs\`')
}`,...(G=(v=l.parameters)==null?void 0:v.docs)==null?void 0:G.source}}};var _,j,E;h.parameters={...h.parameters,docs:{...(_=h.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox',
    hcVariant: 'neutral',
    size: CheckBoxSize.Medium
  },
  parameters: getStoryDescription('story', 'Medium checkbox input - neutral')
}`,...(E=(j=h.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var I,O,q;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox',
    checkBoxProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Small
  },
  parameters: getStoryDescription('story', 'Small checkbox input - primary')
}`,...(q=(O=m.parameters)==null?void 0:O.docs)==null?void 0:q.source}}};var F,J,K;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox - Long text label test',
    checkBoxProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Small
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCCheckBox {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Small checkbox input with a long label text - primary')
}`,...(K=(J=u.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,R,X;d.parameters={...d.parameters,docs:{...(Q=d.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox - Long text label test',
    checkBoxProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Medium
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCCheckBox {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Medium checkbox input with a long label text - primary')
}`,...(X=(R=d.parameters)==null?void 0:R.docs)==null?void 0:X.source}}};var Y,Z,$;b.parameters={...b.parameters,docs:{...(Y=b.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    hcType: {
      type: 'single'
    },
    label: 'Checkbox - Long text label test',
    checkBoxProps: {
      defaultChecked: true
    },
    size: CheckBoxSize.Large
  },
  render(args) {
    return <Box sx={{
      maxWidth: '100px'
    }}>\r
                <HCCheckBox {...args} />\r
            </Box>;
  },
  parameters: getStoryDescription('story', 'Large checkbox input with a long label text - primary')
}`,...($=(Z=b.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};const Me=["BasicCheckbox","BasicChecked","BasicNeutralCheckbox","BasicNeutralChecked","BasicDisabledUnChecked","BasicDisabledChecked","BasicGroupChecked","MediumNeutralCheckbox","SmallPrimaryCheckbox","SmallLongLabelCheckbox","MediumLongLabelCheckbox","LargeLongLabelCheckbox"];export{c as BasicCheckbox,o as BasicChecked,p as BasicDisabledChecked,i as BasicDisabledUnChecked,l as BasicGroupChecked,s as BasicNeutralCheckbox,n as BasicNeutralChecked,b as LargeLongLabelCheckbox,d as MediumLongLabelCheckbox,h as MediumNeutralCheckbox,u as SmallLongLabelCheckbox,m as SmallPrimaryCheckbox,Me as __namedExportsOrder,Ae as default};
