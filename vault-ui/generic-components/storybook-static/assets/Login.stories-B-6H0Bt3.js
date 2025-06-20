import{a as r,j as P}from"./jsx-runtime-BpOMd3UL.js";import{H as l}from"./HCTextField-BPcoIlDd.js";import"./HCTextareaAutosize-Dn0atxIr.js";import{R as e}from"./index-CBqU2yxZ.js";import{H as S}from"./HCButton-KVvaK2XC.js";import{B as T}from"./Box-ud52NnwN.js";import{T as C}from"./Typography-Cu0rniWn.js";import{c as d}from"./createSvgIcon-D2Nfo98N.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./styled-C2XKt8wj.js";import"./_commonjsHelpers-BosuxZz1.js";import"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import"./useTheme-BZazNvRu.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./DefaultPropsProvider-Gu-CRdBj.js";import"./useFormControl-CO3S8LoL.js";import"./Stack-DEOkgDyK.js";import"./isMuiElement-BxNAcTwJ.js";import"./OutlinedInput-GkLik3hX.js";import"./useIsFocusVisible-C9MsNx9r.js";import"./ownerWindow-BN2rbQ_G.js";import"./ownerDocument-DW-IO8s5.js";import"./isHostComponent-DVu5iVWx.js";import"./ButtonBase-BnVQqZPq.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";const E=d(r("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"}),"Visibility"),b=d(r("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"}),"VisibilityOff"),er={title:"Demos/Login"},t={render(){const[o,w]=e.useState(""),[a,g]=e.useState(""),[x,i]=e.useState(""),[h,p]=e.useState(""),[s,f]=e.useState(!1);function y(){if(o.length<=0){i("Please enter username!");return}else if(a.length<=0){p("Please enter password");return}alert("logging you in!")}return P(T,{sx:{display:"flex",flexDirection:"column",p:10},children:[r(C,{variant:"h1",sx:{mb:2},children:"LOGIN"}),r(l,{required:!0,errorText:x,type:"text",onChange:({currentTarget:n})=>{w(n.value),i("")},value:o,inputProps:{},label:"Username"}),r(l,{required:!0,errorText:h,type:"text",onChange:({currentTarget:n})=>{g(n.value),p("")},value:a,inputProps:{type:s?"text":"password"},label:"Password",action:{hcVariant:"secondary",startIcon:s?r(b,{}):r(E,{}),onClick(){f(!s)}}}),r(S,{hcVariant:"primary",sx:{mt:2},text:"SUBMIT",onClick:y})]})}};var m,c,u;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render() {
    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [usernameError, setUsernameError] = React.useState<string>('');
    const [passwordError, setPasswordError] = React.useState<string>('');
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    function loginHandle() {
      if (username.length <= 0) {
        setUsernameError('Please enter username!');
        return;
      } else if (password.length <= 0) {
        setPasswordError('Please enter password');
        return;
      }
      alert('logging you in!');
    }
    return <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 10
    }}>\r
                <Typography variant={'h1'} sx={{
        mb: 2
      }}>LOGIN</Typography>\r
                <HCTextField required errorText={usernameError} type={'text'} onChange={({
        currentTarget
      }) => {
        setUsername(currentTarget.value);
        setUsernameError('');
      }} value={username} inputProps={{}} label={'Username'} />\r
                <HCTextField required errorText={passwordError} type={'text'} onChange={({
        currentTarget
      }) => {
        setPassword(currentTarget.value);
        setPasswordError('');
      }} value={password} inputProps={{
        type: showPassword ? 'text' : 'password'
      }} label={'Password'} action={{
        hcVariant: 'secondary',
        startIcon: showPassword ? <VisibilityOff /> : <Visibility />,
        onClick() {
          setShowPassword(!showPassword);
        }
      }} />\r
                <HCButton hcVariant={'primary'} sx={{
        mt: 2
      }} text={'SUBMIT'} onClick={loginHandle} />\r
            </Box>;
  }
}`,...(u=(c=t.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};const tr=["LoginScreen"];export{t as LoginScreen,tr as __namedExportsOrder,er as default};
