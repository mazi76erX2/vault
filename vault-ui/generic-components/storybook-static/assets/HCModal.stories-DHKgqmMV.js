import{a as e,j as o}from"./jsx-runtime-BpOMd3UL.js";import{r as l}from"./index-CBqU2yxZ.js";import{H as c}from"./HCModal-fNtOda-A.js";import{H as i}from"./HCIconsPicker-BdvECjMb.js";import{H as x}from"./HCButton-KVvaK2XC.js";import{H as y}from"./HCTextField-BPcoIlDd.js";import"./HCTextareaAutosize-Dn0atxIr.js";import{H as D,s as F}from"./HCNotification.utils-D_58qJQC.js";import{H as k}from"./HCDatePicker-CrbDACBQ.js";import{M as f}from"./theme-LIXr8eX_.js";import{H as _}from"./HCFormControl-mqcV0LO_.js";import{s as L}from"./Stack-DEOkgDyK.js";import{B as a}from"./Box-ud52NnwN.js";import{T as B}from"./Typography-Cu0rniWn.js";import"./_commonjsHelpers-BosuxZz1.js";import"./DialogContent-Bgt-rBnN.js";import"./styled-C2XKt8wj.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-BZazNvRu.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./Paper-D64tQ3vb.js";import"./Modal-PVjgijRQ.js";import"./ownerDocument-DW-IO8s5.js";import"./ownerWindow-BN2rbQ_G.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./createChainedFunction-BO_9K8Jh.js";import"./Portal-DBeQERGv.js";import"./isHostComponent-DVu5iVWx.js";import"./index-D_w70K-N.js";import"./utils-Bboi81ly.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./useId-CCvFYAsL.js";import"./HCSegmentTabs-IbffjGnx.js";import"./react-svg.esm-TRwOGt_4.js";import"./index-Dk74W0Oi.js";import"./ButtonBase-BnVQqZPq.js";import"./assertThisInitialized-B9jnkVVz.js";import"./OutlinedInput-GkLik3hX.js";import"./useFormControl-CO3S8LoL.js";import"./index-BYirtCN-.js";import"./HCLoader-BV6-mbh_.js";import"./IconButton-C8fegeYt.js";import"./createSvgIcon-D2Nfo98N.js";import"./InfoOutlined-wNxmeSCf.js";import"./Tooltip-DsCYTBR5.js";import"./index-DiryW6Jz.js";import"./Grow-BObsAk6g.js";import"./useControlled-BAdDSZ1i.js";import"./Popper-LqRagBpU.js";import"./Popover-Dsbu-ybZ.js";import"./useThemeProps-CyI2ijea.js";import"./KeyboardArrowDown-DPbGM5BQ.js";import"./isMuiElement-BxNAcTwJ.js";const m=l.memo(n=>{const[t,r]=l.useState(!1),s=()=>r(!t);return e(y,{...n,inputProps:{...n.inputProps,endAdornment:t?e(i,{icon:"Eye",onClick:s}):e(i,{icon:"EyeOff",onClick:s})},password:!t})});m.displayName="HCPasswordField";const R=L(a)`
    width: 100%;
    height: 40px;
    display: grid;
    grid-template-columns: auto 35px;
    grid-template-rows: 40px;
    background: #e8e8e8;
    
    & input {
        width: 100%;
        appearance: none;
        border: none;
        background: none;
        padding: 10px 5px 10px 12px;

        &:focus {
            outline: none;
        }
    }
    
    &:has(input:focus) {
        outline: 2px solid ${f.palette.primary.main};
    }
    
    &:has(input.error-input){
        outline: 2px solid ${f.error.hex};
    }

    &:has(input.error-input:focus){
        outline: 2px solid ${f.error.hex};
    }
`,C=l.memo(n=>{var T;const[t,r]=l.useState(!1),{value:s,id:g,label:N,onChange:w,required:I,errorText:h}=n,S=()=>r(!t),M=h?"error-input":"";return e(_,{label:N,id:g,errorText:h,required:I,input:o(R,{children:[e("input",{placeholder:(T=n.inputProps)==null?void 0:T.placeholder,autoCorrect:"none",className:`${M} ${t?"":"disk-font"}`,value:s,id:g,onChange:w}),e(a,{sx:{display:"flex",placeItems:"center"},children:e(i,{icon:t?"Eye":"EyeOff",onClick:S})})]})})});C.displayName="HCPasswordFieldNoAutoFill";try{m.displayName="HCPasswordField",m.__docgenInfo={description:"",displayName:"HCPasswordField",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"text"'},{value:'"textArea"'},{value:'"numberField"'}]}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"unknown"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)"}},inputProps:{defaultValue:null,description:"",name:"inputProps",required:!1,type:{name:"HCTextFieldInputOptions"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"HCTextFieldAction"}},startAction:{defaultValue:null,description:"",name:"startAction",required:!1,type:{name:"HCTextFieldAction"}},password:{defaultValue:null,description:"",name:"password",required:!1,type:{name:"boolean"}},inputPadding:{defaultValue:null,description:"",name:"inputPadding",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string | number"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},stopPropagation:{defaultValue:null,description:"",name:"stopPropagation",required:!1,type:{name:"boolean"}},onKeyDown:{defaultValue:null,description:"",name:"onKeyDown",required:!1,type:{name:"KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>"}},helperText:{defaultValue:null,description:"",name:"helperText",required:!1,type:{name:"string"}},errorText:{defaultValue:null,description:"",name:"errorText",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"",name:"label",required:!1,type:{name:"string"}},id:{defaultValue:null,description:"",name:"id",required:!1,type:{name:"string"}},required:{defaultValue:null,description:"",name:"required",required:!1,type:{name:"boolean"}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"boolean"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},labelPlacement:{defaultValue:null,description:"",name:"labelPlacement",required:!1,type:{name:"enum",value:[{value:'"center"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'}]}},formControlSx:{defaultValue:null,description:"",name:"formControlSx",required:!1,type:{name:"SxProps"}},textColor:{defaultValue:null,description:"",name:"textColor",required:!1,type:{name:"string"}}}}}catch{}try{C.displayName="HCPasswordFieldNoAutoFill",C.__docgenInfo={description:"",displayName:"HCPasswordFieldNoAutoFill",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"text"'},{value:'"textArea"'},{value:'"numberField"'}]}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"unknown"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)"}},inputProps:{defaultValue:null,description:"",name:"inputProps",required:!1,type:{name:"HCTextFieldInputOptions"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"HCTextFieldAction"}},startAction:{defaultValue:null,description:"",name:"startAction",required:!1,type:{name:"HCTextFieldAction"}},password:{defaultValue:null,description:"",name:"password",required:!1,type:{name:"boolean"}},inputPadding:{defaultValue:null,description:"",name:"inputPadding",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string | number"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},stopPropagation:{defaultValue:null,description:"",name:"stopPropagation",required:!1,type:{name:"boolean"}},onKeyDown:{defaultValue:null,description:"",name:"onKeyDown",required:!1,type:{name:"KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>"}},helperText:{defaultValue:null,description:"",name:"helperText",required:!1,type:{name:"string"}},errorText:{defaultValue:null,description:"",name:"errorText",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"",name:"label",required:!1,type:{name:"string"}},id:{defaultValue:null,description:"",name:"id",required:!1,type:{name:"string"}},required:{defaultValue:null,description:"",name:"required",required:!1,type:{name:"boolean"}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"boolean"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},labelPlacement:{defaultValue:null,description:"",name:"labelPlacement",required:!1,type:{name:"enum",value:[{value:'"center"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'}]}},formControlSx:{defaultValue:null,description:"",name:"formControlSx",required:!1,type:{name:"SxProps"}},textColor:{defaultValue:null,description:"",name:"textColor",required:!1,type:{name:"string"}}}}}catch{}const $e={title:"Components/HCModal",component:c},p={args:{open:!0,options:{title:"DELETE USER",type:"confirm",renderContent:()=>o("p",{style:{textAlign:"center"},children:["ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS USER?",e("br",{})," THIS ACTION CAN NOT BE UNDONE?"]}),onCancel(){},onConfirm(){},icon:e(i,{icon:"Trash"})}},render(n){const[t,r]=l.useState(!1);return o(a,{children:[e(x,{hcVariant:"primary",text:"Open Modal",onClick:()=>r(!0)}),t&&e(c,{...n,options:{...n.options,type:"confirm",title:n.options.title,renderContent:n.options.renderContent,onCancel(){r(!1)},onConfirm(){r(!1)}},open:t})]})}},U=()=>{const[n,t]=l.useState("");return o(a,{sx:{width:"100%"},children:[o(B,{sx:{textAlign:"center",mb:4},children:["This endpoint is being used across",e("span",{style:{color:"#f18920"},children:" 3 apps"}),",",e("br",{}),"Please enter your password to delete this multi-endpoint:"]}),e(m,{inputProps:{startAdornment:e(i,{icon:"Lock"})},type:"text",onChange:({target:r})=>t(r.value),value:n})]})},u={render(n){const[t,r]=l.useState(!1);return o(a,{children:[e(x,{hcVariant:"primary",text:"Open Modal",onClick:()=>r(!0)}),t&&e(c,{...n,options:{type:"confirm",title:"DELETE ENDPOINT",icon:e(i,{icon:"Trash"}),onCancel(){r(!1)},onConfirm(){r(!1)},renderContent:U},open:t})]})}},W=()=>o(a,{sx:{width:"100%"},children:[e(D,{iconColor:"#313131",hcVariant:"info",message:`Make sure you copy the API key and store it in a secure location. 
This key will not be shown again.`,standalone:!0,fullWidth:!0}),o(a,{sx:{display:"grid",gridTemplateColumns:"calc(100% / 2 - 12px) calc(100% / 2 - 12px)",gridGap:"24px"},children:[e(y,{type:"text",value:"appName",label:"APP NAME",inputProps:{inputProps:{disabled:!0}}}),e(k,{disabled:!0,value:new Date,label:"EXPIRY DATE"})]}),e(y,{inputProps:{endAdornment:e(a,{sx:{display:"flex",alignItems:"end"},onClick:async()=>{F("API key copied to clipboard!")},children:e(i,{icon:"Copy"})})},type:"textArea",value:"apiKey",label:"API KEY"})]}),d={render(n){const[t,r]=l.useState(!1);return o(a,{children:[e(x,{hcVariant:"primary",text:"Open Modal",onClick:()=>r(!0)}),t&&e(c,{...n,options:{type:"custom",title:"API INTEGRATION KEY",actionsAlignment:"end",renderContent:W,actions:[{text:"Save",hcVariant:"primary",onClick(){r(!1)}}]},open:t})]})}};var E,P,V;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    open: true,
    options: {
      title: 'DELETE USER',
      type: 'confirm',
      renderContent: () => <p style={{
        textAlign: 'center'
      }}>ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS USER?<br /> THIS ACTION CAN NOT BE UNDONE?</p>,
      onCancel() {},
      onConfirm() {},
      icon: <HCIcon icon={'Trash'} />
    }
  },
  render(args) {
    const [open, setOpen] = React.useState(false);
    return <Box>\r
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />\r
                {open && <HCModal {...args} options={{
        ...args.options,
        type: 'confirm',
        title: args.options.title,
        renderContent: args.options.renderContent,
        onCancel() {
          setOpen(false);
        },
        onConfirm() {
          setOpen(false);
        }
      }} open={open} />}\r
            </Box>;
  }
}`,...(V=(P=p.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};var H,b,v;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render(args) {
    const [open, setOpen] = React.useState(false);
    return <Box>\r
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />\r
                {open && <HCModal {...args} options={{
        type: 'confirm',
        title: 'DELETE ENDPOINT',
        icon: <HCIcon icon={'Trash'} />,
        onCancel() {
          setOpen(false);
        },
        onConfirm() {
          setOpen(false);
        },
        renderContent: renderCustomDelete
      }} open={open} />}\r
            </Box>;
  }
}`,...(v=(b=u.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var A,q,O;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render(args) {
    const [open, setOpen] = React.useState(false);
    return <Box>\r
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />\r
                {open && <HCModal {...args} options={{
        type: 'custom',
        title: 'API INTEGRATION KEY',
        actionsAlignment: 'end',
        renderContent: renderCustomWithForm,
        actions: [{
          text: 'Save',
          hcVariant: 'primary',
          onClick() {
            setOpen(false);
          }
        }]
      }} open={open} />}\r
            </Box>;
  }
}`,...(O=(q=d.parameters)==null?void 0:q.docs)==null?void 0:O.source}}};const ze=["BasicModal","DeleteEndpointModal","CopyApikeyDataModal"];export{p as BasicModal,d as CopyApikeyDataModal,u as DeleteEndpointModal,ze as __namedExportsOrder,$e as default};
