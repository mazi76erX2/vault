import{a as r}from"./jsx-runtime-BpOMd3UL.js";import{H as R}from"./HCTextField-BPcoIlDd.js";import{g as e}from"./utils-Dfb0jG6U.js";import{c as v}from"./createSvgIcon-D2Nfo98N.js";import{K as V}from"./KeyboardArrowRight-C0E6R8vH.js";import"./index-CBqU2yxZ.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-BZazNvRu.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Typography-Cu0rniWn.js";import"./Stack-DEOkgDyK.js";import"./Box-ud52NnwN.js";import"./isMuiElement-BxNAcTwJ.js";import"./HCButton-KVvaK2XC.js";import"./ButtonBase-BnVQqZPq.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./OutlinedInput-GkLik3hX.js";import"./ownerWindow-BN2rbQ_G.js";import"./ownerDocument-DW-IO8s5.js";import"./isHostComponent-DVu5iVWx.js";const z=v(r("path",{d:"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2"}),"LockOutlined"),K=v(r("path",{d:"M18.39 14.56C16.71 13.7 14.53 13 12 13s-4.71.7-6.39 1.56C4.61 15.07 4 16.1 4 17.22V20h16v-2.78c0-1.12-.61-2.15-1.61-2.66M18 18H6v-.78c0-.38.2-.72.52-.88C7.71 15.73 9.63 15 12 15c2.37 0 4.29.73 5.48 1.34.32.16.52.5.52.88zm-8.22-6h4.44c1.21 0 2.14-1.06 1.98-2.26l-.32-2.45C15.57 5.39 13.92 4 12 4S8.43 5.39 8.12 7.29L7.8 9.74c-.16 1.2.77 2.26 1.98 2.26m.32-4.41C10.26 6.67 11.06 6 12 6s1.74.67 1.9 1.59l.32 2.41H9.78z"}),"Person2Outlined"),Le={title:"Components/HCTextField",component:R,parameters:e("component",`## About
Text Fields let users enter and edit text.
`)},t={args:{inputProps:{placeholder:"Basic Text Field"},label:"LABEL"}},o={args:{inputProps:{placeholder:"Basic Text Field"},required:!0,label:"LABEL"}},a={args:{inputProps:{placeholder:"Text Field With Helper Text"},label:"LABEL",helperText:"Helper Text here!!!"},parameters:e("story","Text Field With Helper Text")},s={args:{inputProps:{placeholder:"Text Field With Error Text"},label:"LABEL",errorText:"Error Text here!!!"},parameters:e("story","Text Field With Error Text")},i={args:{inputProps:{placeholder:"Text Field With Error Text"},label:"LABEL",errorText:"Error Text here!!!",helperText:"Helper Text here!!"},parameters:e("story","")},n={args:{inputProps:{placeholder:"Text Field With Icons",startAdornment:r(K,{}),endAdornment:r(z,{})},label:"LABEL",errorText:"Error Text here!!!"},parameters:e("story","Text Field With Error Text")},p={args:{inputProps:{placeholder:"Text Field"},label:"LABEL",action:{hcVariant:"secondary",startIcon:r(V,{}),onClick(){console.log("clicked")}}},parameters:e("story","Text Field With an action button")},l={args:{inputProps:{placeholder:"Basic TextArea, default 4 rows"},required:!0,type:"textArea",label:"LABEL"},parameters:e("story","A `<teaxtarea />` input with 4 rows")},c={args:{inputProps:{placeholder:"Basic Text Field",rows:8},required:!0,type:"textArea",label:"LABEL"},parameters:e("story","A `<textarea />` input with 8 rows")};var d,m,x;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Basic Text Field'
    },
    label: 'LABEL'
  }
}`,...(x=(m=t.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var T,u,h;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Basic Text Field'
    },
    required: true,
    label: 'LABEL'
  }
}`,...(h=(u=o.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var F,g,L;a.parameters={...a.parameters,docs:{...(F=a.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Text Field With Helper Text'
    },
    label: 'LABEL',
    helperText: 'Helper Text here!!!'
  },
  parameters: getStoryDescription('story', 'Text Field With Helper Text')
}`,...(L=(g=a.parameters)==null?void 0:g.docs)==null?void 0:L.source}}};var A,E,y;s.parameters={...s.parameters,docs:{...(A=s.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Text Field With Error Text'
    },
    label: 'LABEL',
    errorText: 'Error Text here!!!'
  },
  parameters: getStoryDescription('story', 'Text Field With Error Text')
}`,...(y=(E=s.parameters)==null?void 0:E.docs)==null?void 0:y.source}}};var B,W,b;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Text Field With Error Text'
    },
    label: 'LABEL',
    errorText: 'Error Text here!!!',
    helperText: 'Helper Text here!!'
  },
  parameters: getStoryDescription('story', '')
}`,...(b=(W=i.parameters)==null?void 0:W.docs)==null?void 0:b.source}}};var P,H,S;n.parameters={...n.parameters,docs:{...(P=n.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Text Field With Icons',
      startAdornment: <Person2Outlined />,
      endAdornment: <LockOutlined />
    },
    label: 'LABEL',
    errorText: 'Error Text here!!!'
  },
  parameters: getStoryDescription('story', 'Text Field With Error Text')
}`,...(S=(H=n.parameters)==null?void 0:H.docs)==null?void 0:S.source}}};var w,C,f;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Text Field'
    },
    label: 'LABEL',
    action: {
      hcVariant: 'secondary',
      startIcon: <KeyboardArrowRight />,
      onClick() {
        console.log('clicked');
      }
    }
  },
  parameters: getStoryDescription('story', 'Text Field With an action button')
}`,...(f=(C=p.parameters)==null?void 0:C.docs)==null?void 0:f.source}}};var q,D,M;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Basic TextArea, default 4 rows'
    },
    required: true,
    type: 'textArea',
    label: 'LABEL'
  },
  parameters: getStoryDescription('story', 'A \`<teaxtarea />\` input with 4 rows')
}`,...(M=(D=l.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var k,I,O;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    inputProps: {
      placeholder: 'Basic Text Field',
      rows: 8
    },
    required: true,
    type: 'textArea',
    label: 'LABEL'
  },
  parameters: getStoryDescription('story', 'A \`<textarea />\` input with 8 rows')
}`,...(O=(I=c.parameters)==null?void 0:I.docs)==null?void 0:O.source}}};const Ae=["BasicTextField","RequiredTextField","TextFieldWithHelperText","TextFieldWithErrorText","TextFieldWithErrorHelperText","TextFieldWithIcons","TextFieldWithAction","MultilineTextField","MultilineTextField8Rows"];export{t as BasicTextField,l as MultilineTextField,c as MultilineTextField8Rows,o as RequiredTextField,p as TextFieldWithAction,i as TextFieldWithErrorHelperText,s as TextFieldWithErrorText,a as TextFieldWithHelperText,n as TextFieldWithIcons,Ae as __namedExportsOrder,Le as default};
