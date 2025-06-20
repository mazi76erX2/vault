import{a as e,j as m,F as b}from"./jsx-runtime-BpOMd3UL.js";import{r as a}from"./index-CBqU2yxZ.js";import{T as c}from"./theme-LIXr8eX_.js";import{u as v}from"./useTheme-BZazNvRu.js";import{P as _}from"./Paper-D64tQ3vb.js";import{T as l}from"./Typography-Cu0rniWn.js";import{B as S}from"./Box-ud52NnwN.js";import"./_commonjsHelpers-BosuxZz1.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";const t=a.memo(({hcVariant:r="primary",sx:x,outlined:s=!1,elevation:V=0,...T})=>{const u=v(),p=a.useMemo(()=>r,[r]),n=a.useMemo(()=>u.hcPalette[p],[p]),o=a.useMemo(()=>n&&n[500]&&n[500].hex,[n]),H=a.useMemo(()=>n&&n[300]&&n[300].hex,[n]);return e(_,{...T,sx:()=>({fontSize:"16px",fontWeight:"500",borderRadius:"5px",boxSizing:"border-box",cursor:"pointer",...s?{color:o,background:"#fff",borderColor:o,borderWidth:"2px",borderStyle:"solid"}:{background:o,color:c.textColor.white},":hover":{...s?{background:o,color:c.textColor.white}:{background:H}},":disabled":{background:u.hcPalette.neutral[100].hex,color:c.textColor.white,cursor:"not-allowed"},p:2,...x}),role:"button",elevation:V})});t.displayName="HCCardButton";try{t.displayName="HCCardButton",t.__docgenInfo={description:"",displayName:"HCCardButton",props:{hcVariant:{defaultValue:null,description:'Button type: "primary" | "secondary" | "tertiary"',name:"hcVariant",required:!0,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'}]}},outlined:{defaultValue:null,description:"",name:"outlined",required:!1,type:{name:"boolean"}},children:{defaultValue:null,description:"The content of the component.",name:"children",required:!1,type:{name:"ReactNode"}},ref:{defaultValue:null,description:"",name:"ref",required:!1,type:{name:"((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null"}},component:{defaultValue:null,description:"",name:"component",required:!1,type:{name:"ElementType<any, keyof IntrinsicElements>"}}}}}catch{}const L={title:"Components/HCCardButton",component:t},i={args:{hcVariant:"primary",children:e(l,{variant:"h2",children:"Title"})}},d={args:{hcVariant:"primary"},render(){const r=()=>m(b,{children:[e(l,{variant:"h2",children:"Title"}),e(l,{variant:"body1",children:"Content goes here"})]});return m(S,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridGap:"16px"},children:[e(t,{hcVariant:"primary",children:r()}),e(t,{hcVariant:"secondary",children:r()}),e(t,{hcVariant:"tertiary",children:r()}),e(t,{hcVariant:"primary",outlined:!0,children:r()}),e(t,{hcVariant:"secondary",outlined:!0,children:r()}),e(t,{hcVariant:"tertiary",outlined:!0,children:r()})]})}};var h,y,C;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    hcVariant: 'primary',
    children: <Typography variant={'h2'}>Title</Typography>
  }
}`,...(C=(y=i.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};var f,B,g;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    hcVariant: 'primary'
  },
  render() {
    const renderButtonContent = () => {
      return <>\r
                    <Typography variant={'h2'}>Title</Typography>\r
                    <Typography variant={'body1'}>Content goes here</Typography>\r
                </>;
    };
    return <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridGap: '16px'
    }}>\r
                <HCCardButton hcVariant={'primary'}>{renderButtonContent()}</HCCardButton>\r
                <HCCardButton hcVariant={'secondary'}>{renderButtonContent()}</HCCardButton>\r
                <HCCardButton hcVariant={'tertiary'}>{renderButtonContent()}</HCCardButton>\r
                <HCCardButton hcVariant={'primary'} outlined={true}>{renderButtonContent()}</HCCardButton>\r
                <HCCardButton hcVariant={'secondary'} outlined={true}>{renderButtonContent()}</HCCardButton>\r
                <HCCardButton hcVariant={'tertiary'} outlined={true}>{renderButtonContent()}</HCCardButton>\r
            </Box>;
  }
}`,...(g=(B=d.parameters)==null?void 0:B.docs)==null?void 0:g.source}}};const O=["BasicCard","GridCards"];export{i as BasicCard,d as GridCards,O as __namedExportsOrder,L as default};
