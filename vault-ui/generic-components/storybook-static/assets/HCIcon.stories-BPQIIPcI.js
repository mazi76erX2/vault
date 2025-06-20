import{j as m,a as o}from"./jsx-runtime-BpOMd3UL.js";import{r as s}from"./index-CBqU2yxZ.js";import{g as b}from"./utils-Dfb0jG6U.js";import{H as l,I as H}from"./HCIconsPicker-BdvECjMb.js";import{H as w}from"./HCColorPicker-3JjxewrN.js";import{H as B}from"./HCNumberField-Bzk4QLJF.js";import{P as v}from"./Paper-D64tQ3vb.js";import{B as t}from"./Box-ud52NnwN.js";import{T as j}from"./Typography-Cu0rniWn.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCSegmentTabs-IbffjGnx.js";import"./useTheme-BZazNvRu.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./Stack-DEOkgDyK.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./HCTextField-BPcoIlDd.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./useFormControl-CO3S8LoL.js";import"./isMuiElement-BxNAcTwJ.js";import"./HCButton-KVvaK2XC.js";import"./ButtonBase-BnVQqZPq.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./OutlinedInput-GkLik3hX.js";import"./ownerWindow-BN2rbQ_G.js";import"./ownerDocument-DW-IO8s5.js";import"./isHostComponent-DVu5iVWx.js";import"./HCTextareaAutosize-Dn0atxIr.js";import"./react-svg.esm-TRwOGt_4.js";import"./index-Dk74W0Oi.js";import"./HCCustomPicker-B5fUUDT6.js";import"./react-is.production.min-DSf3zZfm.js";import"./index-DiryW6Jz.js";import"./KeyboardArrowRight-1TmHx-Uu.js";import"./createSvgIcon-D2Nfo98N.js";import"./Portal-DBeQERGv.js";import"./index-D_w70K-N.js";import"./isPlainObject-BEDL8G91.js";import"./_baseAssignValue-HBFe7ha9.js";import"./cloneDeep-KxyLy1Ar.js";import"./throttle-BHeqV46V.js";import"./Grid-C2CCQNp2.js";import"./Slider-D3e7rrtk.js";import"./useControlled-BAdDSZ1i.js";import"./Popover-Dsbu-ybZ.js";import"./Grow-BObsAk6g.js";import"./utils-Bboi81ly.js";import"./Modal-PVjgijRQ.js";import"./createChainedFunction-BO_9K8Jh.js";const Po={title:"Components/HCIcon",component:l,parameters:b("component",`## About
Custom component used in react-hot-toast.
`)},c={args:{icon:"AirportSign1",style:{width:40,height:40}}},p={args:{icon:"User",color:"#292929"},render(r){const[a,I]=s.useState(r.icon),[d,k]=s.useState(1),[e,x]=s.useState(r.color?r.color:"#292929"),S=()=>Object.keys(H).sort();return s.useEffect(()=>{r.color&&x(r.color)},[r.color]),m(v,{sx:{display:"grid",gridTemplateRows:"160px 100px 80px calc(95vh - 340px)",overflow:"hidden"},children:[o(t,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:o(l,{style:{width:200,height:200,color:e},strokeWidth:d,icon:a,color:e})}),o(t,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:o("code",{children:`<HCIcon icon="${a}" color="${e}" />`})}),m(t,{sx:{display:"grid",gridTemplateColumns:"100px auto",gridGap:16},children:[o(B,{size:"medium",label:"Stroke Width",value:d,onChange:({target:n})=>{k(Number(n.value??"0"))},inputProps:{endAdornment:"px"}}),o(w,{size:"medium",label:"Stroke Color",color:e,onColorChanged:n=>x(n.hex)})]}),o(t,{sx:{display:"grid",gridTemplateColumns:"25% 25% 25% 25%",overflow:"auto",py:2,border:"1px solid #ddd",px:2},children:S().map(n=>{const i=n;return m(t,{sx:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"90px",flexDirection:"column",mb:2,cursor:"pointer"},onClick:()=>I(i),children:[o(t,{sx:{width:"50px",height:"50px",":hover":{background:"#eee"}},children:o(l,{size:50,className:i,icon:i})}),o(j,{sx:{mt:1},children:i})]},n)})})]})}};var u,h,g;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    icon: 'AirportSign1',
    style: {
      width: 40,
      height: 40
    }
  }
}`,...(g=(h=c.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var f,y,C;p.parameters={...p.parameters,docs:{...(f=p.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: 'User',
    color: '#292929'
  },
  render(props) {
    const [icon, setIcon] = React.useState(props.icon);
    const [strokeWidth, setStrokeWidth] = React.useState(1);
    const [color, setColor] = React.useState<string>(props.color ? props.color : '#292929');
    const iconList = () => {
      return Object.keys(Icon).sort();
    };
    React.useEffect(() => {
      if (props.color) setColor(props.color);
    }, [props.color]);
    return <Paper sx={{
      display: 'grid',
      gridTemplateRows: '160px 100px 80px calc(95vh - 340px)',
      overflow: 'hidden'
    }}>\r
                <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>\r
                    <HCIcon style={{
          width: 200,
          height: 200,
          color
        }} strokeWidth={strokeWidth} icon={icon} color={color} />\r
                </Box>\r
                <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>\r
                    <code>{\`<HCIcon icon="\${icon}" color="\${color}" />\`}</code>\r
                </Box>\r
                <Box sx={{
        display: 'grid',
        gridTemplateColumns: '100px auto',
        gridGap: 16
      }}>\r
                    <HCNumberField size={'medium'} label={'Stroke Width'} value={strokeWidth} onChange={({
          target
        }) => {
          setStrokeWidth(Number(target.value ?? '0'));
        }} inputProps={{
          endAdornment: 'px'
        }} />\r
                    <HCColorPicker size={'medium'} label={'Stroke Color'} color={color} onColorChanged={color => setColor(color.hex)} />\r
                    \r
                </Box>\r
                <Box sx={{
        display: 'grid',
        gridTemplateColumns: '25% 25% 25% 25%',
        overflow: 'auto',
        py: 2,
        border: '1px solid #ddd',
        px: 2
      }}>\r
                    {iconList().map(key => {
          const thisIcon = key as keyof typeof Icon;
          return <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90px',
            flexDirection: 'column',
            mb: 2,
            cursor: 'pointer'
          }} key={key} onClick={() => setIcon(thisIcon)}>\r
                                <Box sx={{
              width: '50px',
              height: '50px',
              ':hover': {
                background: '#eee'
              }
            }}>\r
                                    <HCIcon size={50} className={thisIcon} icon={thisIcon} />\r
                                </Box>\r
                                <Typography sx={{
              mt: 1
            }}>{thisIcon}</Typography>\r
                            </Box>;
        })}\r
                </Box>\r
            </Paper>;
  }
}`,...(C=(y=p.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};const Ao=["ArrowIcon","IconList"];export{c as ArrowIcon,p as IconList,Ao as __namedExportsOrder,Po as default};
