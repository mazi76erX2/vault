import{j as s,a as o}from"./jsx-runtime-BpOMd3UL.js";import{a as d,b as h}from"./HCIconsPicker-BdvECjMb.js";import{R as p}from"./index-CBqU2yxZ.js";import{H as B}from"./HCButton-KVvaK2XC.js";import{B as e}from"./Box-ud52NnwN.js";import"./HCSegmentTabs-IbffjGnx.js";import"./useTheme-BZazNvRu.js";import"./styled-C2XKt8wj.js";import"./_commonjsHelpers-BosuxZz1.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./Stack-DEOkgDyK.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./HCTextField-BPcoIlDd.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./useFormControl-CO3S8LoL.js";import"./Typography-Cu0rniWn.js";import"./isMuiElement-BxNAcTwJ.js";import"./OutlinedInput-GkLik3hX.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./ownerWindow-BN2rbQ_G.js";import"./ownerDocument-DW-IO8s5.js";import"./isHostComponent-DVu5iVWx.js";import"./HCTextareaAutosize-Dn0atxIr.js";import"./react-svg.esm-TRwOGt_4.js";import"./inheritsLoose-DR8r8Ogv.js";import"./index-Dk74W0Oi.js";import"./ButtonBase-BnVQqZPq.js";import"./assertThisInitialized-B9jnkVVz.js";import"./TransitionGroupContext-DTLTiDZu.js";const W={title:"Components/HCIconsPicker"},r={args:{open:!0,value:"ArrowBottomLeft1"},render(i){const[l,u]=p.useState(i.open),[t,x]=p.useState(i.value);return s(e,{sx:{display:"flex",flexDirection:"column",p:10},children:[s(e,{sx:{display:"grid",gridTemplateColumns:t?"40px 1fr":"1fr",gridGap:"8px",mb:2},children:[t&&o(e,{style:{height:"40px",width:"40px",display:"flex",alignItems:"center",justifyContent:"center"},children:o(d,{icon:t})}),o(B,{hcVariant:"primary",text:"TOGGLE ICONS",onClick:()=>u(n=>!n)})]}),o(e,{children:o(h,{open:l,value:t,onChange:n=>{x(n)},height:"300px"})})]})}};var a,m,c;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    open: true,
    value: 'ArrowBottomLeft1'
  },
  render(args) {
    const [showIcons, setShowIcons] = React.useState(args.open);
    const [value, setValue] = React.useState<HCButtonIconType>(args.value as HCButtonIconType);
    return <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 10
    }}>\r
                <Box sx={{
        display: 'grid',
        gridTemplateColumns: value ? '40px 1fr' : '1fr',
        gridGap: '8px',
        mb: 2
      }}>\r
                    {value && <Box style={{
          height: '40px',
          width: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>\r
                            <HCButtonIcon icon={value} />\r
                        </Box>}\r
                    <HCButton hcVariant={'primary'} text={'TOGGLE ICONS'} onClick={() => setShowIcons(prev => !prev)} />\r
                </Box>\r
                <Box>\r
                    <HCIconsPicker open={showIcons} value={value} onChange={iconName => {
          setValue(iconName as HCButtonIconType);
        }} height={'300px'} />\r
                </Box>\r
            </Box>;
  }
}`,...(c=(m=r.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};const X=["BasicIconsPicker"];export{r as BasicIconsPicker,X as __namedExportsOrder,W as default};
