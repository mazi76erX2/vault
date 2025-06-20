import{j as i,a as n}from"./jsx-runtime-BpOMd3UL.js";import{R as r}from"./index-CBqU2yxZ.js";import{H as g}from"./HCDropDown-CHW0bI_g.js";import"./HCGroupDropDown-CvXXRbf5.js";import{H as f}from"./HCColorPicker-3JjxewrN.js";import{t as H}from"./HCCustomPicker-B5fUUDT6.js";import{u as b}from"./useTheme-BZazNvRu.js";import{B as C}from"./Box-ud52NnwN.js";import{T as m}from"./Typography-Cu0rniWn.js";import"./_commonjsHelpers-BosuxZz1.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Stack-DEOkgDyK.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./isMuiElement-BxNAcTwJ.js";import"./Select-ec_Y8gFs.js";import"./react-is.production.min-DSf3zZfm.js";import"./index-DiryW6Jz.js";import"./Portal-DBeQERGv.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./isHostComponent-DVu5iVWx.js";import"./index-D_w70K-N.js";import"./Popover-Dsbu-ybZ.js";import"./Grow-BObsAk6g.js";import"./utils-Bboi81ly.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./ownerDocument-DW-IO8s5.js";import"./ownerWindow-BN2rbQ_G.js";import"./Modal-PVjgijRQ.js";import"./createChainedFunction-BO_9K8Jh.js";import"./Paper-D64tQ3vb.js";import"./List-DGKAo3RX.js";import"./ListContext-DDAXNj-4.js";import"./useControlled-BAdDSZ1i.js";import"./useId-CCvFYAsL.js";import"./ArrowDropDown-CCFdykRc.js";import"./OutlinedInput-GkLik3hX.js";import"./createSvgIcon-D2Nfo98N.js";import"./KeyboardArrowDown-DPbGM5BQ.js";import"./MenuItem-DwBbAKO3.js";import"./ButtonBase-BnVQqZPq.js";import"./assertThisInitialized-B9jnkVVz.js";import"./listItemTextClasses-BOhX8Zrh.js";import"./Divider-DpVW90Ab.js";import"./HCIconsPicker-BdvECjMb.js";import"./HCSegmentTabs-IbffjGnx.js";import"./HCTextField-BPcoIlDd.js";import"./HCButton-KVvaK2XC.js";import"./HCTextareaAutosize-Dn0atxIr.js";import"./react-svg.esm-TRwOGt_4.js";import"./index-Dk74W0Oi.js";import"./KeyboardArrowRight-1TmHx-Uu.js";import"./isPlainObject-BEDL8G91.js";import"./_baseAssignValue-HBFe7ha9.js";import"./cloneDeep-KxyLy1Ar.js";import"./throttle-BHeqV46V.js";import"./HCNumberField-Bzk4QLJF.js";import"./Grid-C2CCQNp2.js";import"./Slider-D3e7rrtk.js";const $o={title:"Demos/ThemePark"},s={render(){const t=b(),[l]=r.useState(()=>Object.keys(t.hcPalette).filter(o=>!["tertiary","neutral"].includes(o)).map(o=>{const u=t.hcPalette[o];return{id:u[500].hex,value:`${o} - ${u[500].hex}`}})),[e,p]=r.useState(l[0].id),[y,v]=r.useState(l[0]),[c,a]=r.useState(),k=r.useMemo(()=>H(e),[e]);return i(C,{sx:{display:"flex",flexDirection:"column",p:6,boxShadow:1},children:[n(m,{variant:"h1",sx:{mb:2},children:"ThemePark"}),n(g,{label:"Choose Background From Theme Colors",value:y,onChange:o=>{o&&(v(o),p(o.id),a(void 0))},options:l,inputProps:{sx:{mb:2}}}),n(f,{label:"Choose Background From ColorPicker",color:e,onColorChanged:o=>{p(o.hex),a(o)},updateLive:!0}),i(C,{sx:{p:4,my:2,background:e,color:k.isDark()?t.textColor.white:t.textColor.black},children:[i(m,{children:["Active Color = ",e]}),c&&i(m,{sx:{mt:2},children:["ColorPicker Results ",n("code",{children:JSON.stringify(c)})]})]})]})}};var h,d,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render() {
    const theme = useTheme();
    const [colors] = React.useState<HCDropDownValue[]>(() => {
      return Object.keys(theme.hcPalette).filter(i => !['tertiary', 'neutral'].includes(i)).map(key => {
        const p = theme.hcPalette[key as Variant];
        return {
          id: p['500']!['hex'] as string,
          value: \`\${key} - \${p['500']!['hex']}\`
        } as HCDropDownValue;
      });
    });
    const [activeHexColor, setActiveHexColor] = React.useState<string>(colors[0].id);
    const [selectedColor, setSelectedColor] = React.useState<HCDropDownValue>(colors[0]);
    const [colorResults, setColorResults] = React.useState<ColorResult>();
    const colorObject = React.useMemo(() => {
      return tinycolor(activeHexColor);
    }, [activeHexColor]);
    return <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 6,
      boxShadow: 1
    }}>\r
                <Typography variant={'h1'} sx={{
        mb: 2
      }}>ThemePark</Typography>\r
                <HCDropDown label={'Choose Background From Theme Colors'} value={selectedColor} onChange={v => {
        if (v) {
          setSelectedColor(v);
          setActiveHexColor(v.id);
          setColorResults(undefined);
        }
      }} options={colors} inputProps={{
        sx: {
          mb: 2
        }
      }} />\r
                <HCColorPicker label={'Choose Background From ColorPicker'} color={activeHexColor} onColorChanged={color => {
        setActiveHexColor(color.hex);
        setColorResults(color);
      }} updateLive />\r
                <Box sx={{
        p: 4,
        my: 2,
        background: activeHexColor,
        color: colorObject.isDark() ? theme.textColor.white : theme.textColor.black
      }}>\r
                    <Typography>Active Color = {activeHexColor}</Typography>\r
                    {colorResults && <Typography sx={{
          mt: 2
        }}>ColorPicker Results <code>{JSON.stringify(colorResults)}</code></Typography>}\r
                </Box>\r
            </Box>;
  }
}`,...(x=(d=s.parameters)==null?void 0:d.docs)==null?void 0:x.source}}};const Jo=["Themes"];export{s as Themes,Jo as __namedExportsOrder,$o as default};
