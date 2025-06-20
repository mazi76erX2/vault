import{a as r,j as O}from"./jsx-runtime-BpOMd3UL.js";import{H as ut}from"./HCTextField-BPcoIlDd.js";import"./HCTextareaAutosize-Dn0atxIr.js";import{r as f,R as P}from"./index-CBqU2yxZ.js";import{u as X}from"./utils-Dfb0jG6U.js";import{H as mt}from"./HCButton-KVvaK2XC.js";import{H as ft}from"./HCCheckBox-CAVHpZpK.js";import{H as gt}from"./HCRadioButton-ChtVos60.js";import{u as bt}from"./useTheme-BZazNvRu.js";import{B as E}from"./Box-ud52NnwN.js";import{T as U}from"./Typography-Cu0rniWn.js";import{L as vt}from"./List-DGKAo3RX.js";import{f as j,g as z,_ as F,s as w,e as S,r as xt,j as x}from"./styled-C2XKt8wj.js";import{_ as d}from"./emotion-use-insertion-effect-with-fallbacks.browser.esm-DixkWG2H.js";import{L as B}from"./ListContext-DDAXNj-4.js";import{u as q,c as W}from"./DefaultPropsProvider-Gu-CRdBj.js";import{b as st,a as rt}from"./useIsFocusVisible-C9MsNx9r.js";import{i as yt}from"./isMuiElement-BxNAcTwJ.js";import{i as Z}from"./isHostComponent-DVu5iVWx.js";import{B as at}from"./ButtonBase-BnVQqZPq.js";import{L as Ct,a as ht}from"./ListItemText-4LH05YNN.js";import{I as It}from"./IconButton-C8fegeYt.js";import{c as Tt}from"./createSvgIcon-D2Nfo98N.js";import"./HCFormControl-mqcV0LO_.js";import"./theme-LIXr8eX_.js";import"./useFormControl-CO3S8LoL.js";import"./Stack-DEOkgDyK.js";import"./useTheme-q_dXytqU.js";import"./useThemeWithoutDefault-B9JH-rUV.js";import"./OutlinedInput-GkLik3hX.js";import"./ownerWindow-BN2rbQ_G.js";import"./ownerDocument-DW-IO8s5.js";import"./_commonjsHelpers-BosuxZz1.js";import"./Checkbox-C_bPhxNF.js";import"./SwitchBase-BZFLzUAk.js";import"./useControlled-BAdDSZ1i.js";import"./createChainedFunction-BO_9K8Jh.js";import"./useId-CCvFYAsL.js";import"./assertThisInitialized-B9jnkVVz.js";import"./inheritsLoose-DR8r8Ogv.js";import"./TransitionGroupContext-DTLTiDZu.js";import"./listItemTextClasses-BOhX8Zrh.js";function Lt(t){return z("MuiListItem",t)}const L=j("MuiListItem",["root","container","focusVisible","dense","alignItemsFlexStart","disabled","divider","gutters","padding","button","secondaryAction","selected"]);function Rt(t){return z("MuiListItemButton",t)}const R=j("MuiListItemButton",["root","focusVisible","dense","alignItemsFlexStart","disabled","divider","gutters","selected"]),Ot=["alignItems","autoFocus","component","children","dense","disableGutters","divider","focusVisibleClassName","selected","className"],St=(t,e)=>{const{ownerState:o}=t;return[e.root,o.dense&&e.dense,o.alignItems==="flex-start"&&e.alignItemsFlexStart,o.divider&&e.divider,!o.disableGutters&&e.gutters]},Bt=t=>{const{alignItems:e,classes:o,dense:s,disabled:n,disableGutters:l,divider:c,selected:i}=t,p=W({root:["root",s&&"dense",!l&&"gutters",c&&"divider",n&&"disabled",e==="flex-start"&&"alignItemsFlexStart",i&&"selected"]},Rt,o);return d({},o,p)},$t=w(at,{shouldForwardProp:t=>xt(t)||t==="classes",name:"MuiListItemButton",slot:"Root",overridesResolver:St})(({theme:t,ownerState:e})=>d({display:"flex",flexGrow:1,justifyContent:"flex-start",alignItems:"center",position:"relative",textDecoration:"none",minWidth:0,boxSizing:"border-box",textAlign:"left",paddingTop:8,paddingBottom:8,transition:t.transitions.create("background-color",{duration:t.transitions.duration.shortest}),"&:hover":{textDecoration:"none",backgroundColor:(t.vars||t).palette.action.hover,"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${R.selected}`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / ${t.vars.palette.action.selectedOpacity})`:x(t.palette.primary.main,t.palette.action.selectedOpacity),[`&.${R.focusVisible}`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / calc(${t.vars.palette.action.selectedOpacity} + ${t.vars.palette.action.focusOpacity}))`:x(t.palette.primary.main,t.palette.action.selectedOpacity+t.palette.action.focusOpacity)}},[`&.${R.selected}:hover`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / calc(${t.vars.palette.action.selectedOpacity} + ${t.vars.palette.action.hoverOpacity}))`:x(t.palette.primary.main,t.palette.action.selectedOpacity+t.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / ${t.vars.palette.action.selectedOpacity})`:x(t.palette.primary.main,t.palette.action.selectedOpacity)}},[`&.${R.focusVisible}`]:{backgroundColor:(t.vars||t).palette.action.focus},[`&.${R.disabled}`]:{opacity:(t.vars||t).palette.action.disabledOpacity}},e.divider&&{borderBottom:`1px solid ${(t.vars||t).palette.divider}`,backgroundClip:"padding-box"},e.alignItems==="flex-start"&&{alignItems:"flex-start"},!e.disableGutters&&{paddingLeft:16,paddingRight:16},e.dense&&{paddingTop:4,paddingBottom:4})),At=f.forwardRef(function(e,o){const s=q({props:e,name:"MuiListItemButton"}),{alignItems:n="center",autoFocus:l=!1,component:c="div",children:i,dense:u=!1,disableGutters:p=!1,divider:y=!1,focusVisibleClassName:a,selected:g=!1,className:C}=s,m=F(s,Ot),b=f.useContext(B),v=f.useMemo(()=>({dense:u||b.dense||!1,alignItems:n,disableGutters:p}),[n,b.dense,u,p]),$=f.useRef(null);st(()=>{l&&$.current&&$.current.focus()},[l]);const D=d({},s,{alignItems:n,dense:v.dense,disableGutters:p,divider:y,selected:g}),A=Bt(D),N=rt($,o);return r(B.Provider,{value:v,children:r($t,d({ref:N,href:m.href||m.to,component:(m.href||m.to)&&c==="div"?"button":c,focusVisibleClassName:S(A.focusVisible,a),ownerState:D,className:S(A.root,C)},m,{classes:A,children:i}))})});function kt(t){return z("MuiListItemSecondaryAction",t)}j("MuiListItemSecondaryAction",["root","disableGutters"]);const Pt=["className"],Dt=t=>{const{disableGutters:e,classes:o}=t;return W({root:["root",e&&"disableGutters"]},kt,o)},Nt=w("div",{name:"MuiListItemSecondaryAction",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:o}=t;return[e.root,o.disableGutters&&e.disableGutters]}})(({ownerState:t})=>d({position:"absolute",right:16,top:"50%",transform:"translateY(-50%)"},t.disableGutters&&{right:0})),it=f.forwardRef(function(e,o){const s=q({props:e,name:"MuiListItemSecondaryAction"}),{className:n}=s,l=F(s,Pt),c=f.useContext(B),i=d({},s,{disableGutters:c.disableGutters}),u=Dt(i);return r(Nt,d({className:S(u.root,n),ownerState:i,ref:o},l))});it.muiName="ListItemSecondaryAction";const Vt=["className"],Mt=["alignItems","autoFocus","button","children","className","component","components","componentsProps","ContainerComponent","ContainerProps","dense","disabled","disableGutters","disablePadding","divider","focusVisibleClassName","secondaryAction","selected","slotProps","slots"],Gt=(t,e)=>{const{ownerState:o}=t;return[e.root,o.dense&&e.dense,o.alignItems==="flex-start"&&e.alignItemsFlexStart,o.divider&&e.divider,!o.disableGutters&&e.gutters,!o.disablePadding&&e.padding,o.button&&e.button,o.hasSecondaryAction&&e.secondaryAction]},Ft=t=>{const{alignItems:e,button:o,classes:s,dense:n,disabled:l,disableGutters:c,disablePadding:i,divider:u,hasSecondaryAction:p,selected:y}=t;return W({root:["root",n&&"dense",!c&&"gutters",!i&&"padding",u&&"divider",l&&"disabled",o&&"button",e==="flex-start"&&"alignItemsFlexStart",p&&"secondaryAction",y&&"selected"],container:["container"]},Lt,s)},wt=w("div",{name:"MuiListItem",slot:"Root",overridesResolver:Gt})(({theme:t,ownerState:e})=>d({display:"flex",justifyContent:"flex-start",alignItems:"center",position:"relative",textDecoration:"none",width:"100%",boxSizing:"border-box",textAlign:"left"},!e.disablePadding&&d({paddingTop:8,paddingBottom:8},e.dense&&{paddingTop:4,paddingBottom:4},!e.disableGutters&&{paddingLeft:16,paddingRight:16},!!e.secondaryAction&&{paddingRight:48}),!!e.secondaryAction&&{[`& > .${R.root}`]:{paddingRight:48}},{[`&.${L.focusVisible}`]:{backgroundColor:(t.vars||t).palette.action.focus},[`&.${L.selected}`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / ${t.vars.palette.action.selectedOpacity})`:x(t.palette.primary.main,t.palette.action.selectedOpacity),[`&.${L.focusVisible}`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / calc(${t.vars.palette.action.selectedOpacity} + ${t.vars.palette.action.focusOpacity}))`:x(t.palette.primary.main,t.palette.action.selectedOpacity+t.palette.action.focusOpacity)}},[`&.${L.disabled}`]:{opacity:(t.vars||t).palette.action.disabledOpacity}},e.alignItems==="flex-start"&&{alignItems:"flex-start"},e.divider&&{borderBottom:`1px solid ${(t.vars||t).palette.divider}`,backgroundClip:"padding-box"},e.button&&{transition:t.transitions.create("background-color",{duration:t.transitions.duration.shortest}),"&:hover":{textDecoration:"none",backgroundColor:(t.vars||t).palette.action.hover,"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${L.selected}:hover`]:{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / calc(${t.vars.palette.action.selectedOpacity} + ${t.vars.palette.action.hoverOpacity}))`:x(t.palette.primary.main,t.palette.action.selectedOpacity+t.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:t.vars?`rgba(${t.vars.palette.primary.mainChannel} / ${t.vars.palette.action.selectedOpacity})`:x(t.palette.primary.main,t.palette.action.selectedOpacity)}}},e.hasSecondaryAction&&{paddingRight:48})),Ht=w("li",{name:"MuiListItem",slot:"Container",overridesResolver:(t,e)=>e.container})({position:"relative"}),_t=f.forwardRef(function(e,o){const s=q({props:e,name:"MuiListItem"}),{alignItems:n="center",autoFocus:l=!1,button:c=!1,children:i,className:u,component:p,components:y={},componentsProps:a={},ContainerComponent:g="li",ContainerProps:{className:C}={},dense:m=!1,disabled:b=!1,disableGutters:v=!1,disablePadding:$=!1,divider:D=!1,focusVisibleClassName:A,secondaryAction:N,selected:nt=!1,slotProps:dt={},slots:lt={}}=s,ct=F(s.ContainerProps,Vt),pt=F(s,Mt),Y=f.useContext(B),H=f.useMemo(()=>({dense:m||Y.dense||!1,alignItems:n,disableGutters:v}),[n,Y.dense,m,v]),_=f.useRef(null);st(()=>{l&&_.current&&_.current.focus()},[l]);const T=f.Children.toArray(i),J=T.length&&yt(T[T.length-1],["ListItemSecondaryAction"]),V=d({},s,{alignItems:n,autoFocus:l,button:c,dense:H.dense,disabled:b,disableGutters:v,disablePadding:$,divider:D,hasSecondaryAction:J,selected:nt}),K=Ft(V),Q=rt(_,o),M=lt.root||y.Root||wt,k=dt.root||a.root||{},h=d({className:S(K.root,k.className,u),disabled:b},pt);let I=p||"li";return c&&(h.component=p||"div",h.focusVisibleClassName=S(L.focusVisible,A),I=at),J?(I=!h.component&&!p?"div":I,g==="li"&&(I==="li"?I="div":h.component==="li"&&(h.component="div")),r(B.Provider,{value:H,children:O(Ht,d({as:g,className:S(K.container,C),ref:Q,ownerState:V},ct,{children:[r(M,d({},k,!Z(M)&&{as:I,ownerState:d({},V,k.ownerState)},h,{children:T})),T.pop()]}))})):r(B.Provider,{value:H,children:O(M,d({},k,{as:I,ref:Q},!Z(M)&&{ownerState:d({},V,k.ownerState)},h,{children:[T,N&&r(it,{children:N})]}))})}),Et=Tt(r("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"}),"Delete"),ke={title:"Demos/TodoApp"},G={render(){const[t,e]=P.useState({id:1,label:"All"}),o=bt(),[s,n]=P.useState(""),[l,c]=P.useState(!1),[i,u]=P.useState([{id:X(),text:"Add more",completed:!1}]),p=P.useMemo(()=>i.filter(a=>t.id===1?!0:t.id===2?a.completed:!a.completed),[t,i]);function y(){if(l||s.length<1){c(!0);return}c(!1),u([...i,{completed:!1,id:X(),text:s}]),n("")}return O(E,{sx:{display:"flex",flexDirection:"column",p:6,boxShadow:1},children:[O(E,{sx:{mb:2},children:[r(U,{variant:"h1",sx:{mb:2},children:"ADD TODO"}),r(ut,{required:!0,errorText:l?"Please enter some text!":void 0,type:"text",onChange:({currentTarget:a})=>{n(a.value),c(a.value.length<=0)},value:s,inputProps:{}}),r(mt,{hcVariant:"primary",text:"ADD",sx:{borderRadius:0,ml:1,mt:.25},onClick:y})]}),r(gt,{hcType:{type:"group",options:[{id:1,label:"All"},{id:2,label:"Completed"},{id:3,label:"Not Completed"}],defaultValue:t,name:"filter",row:!0},hcVariant:"primary",onRadioSelect:(a,g)=>{e(g)}}),O(E,{sx:{my:4,borderColor:o.hcPalette.primary[500].hex,p:1},children:[r(U,{variant:"h1",sx:{mb:2},children:"TODOS"}),p.length===0?r(U,{children:"Please add some todos"}):r(vt,{children:p.map((a,g)=>r(_t,{disablePadding:!0,secondaryAction:r(It,{edge:"end","aria-label":"delete",onClick:()=>{const C=i.filter(m=>m.id!==a.id);u([...C])},children:r(Et,{})}),children:O(At,{children:[r(Ct,{children:r(ft,{hcVariant:"primary",hcType:{type:"single",checked:a.completed},onCheckChange:C=>{const m=i.findIndex(v=>v.id===a.id),b=i;console.log(a,m),b[g]={...a,completed:C},u([...b])}})}),r(ht,{sx:{textDecoration:a.completed?"line-through":""},primary:a.text})]})},a.id))})]})]})}};var tt,et,ot;G.parameters={...G.parameters,docs:{...(tt=G.parameters)==null?void 0:tt.docs,source:{originalSource:`{
  render() {
    const [filter, setFilter] = React.useState<HCRadioButtonOption>({
      id: 1,
      label: 'All'
    });
    const theme = useTheme();
    const [todo, setTodo] = React.useState<string>('');
    const [todoError, setTodoError] = React.useState<boolean>(false);
    const [todos, setTodos] = React.useState<Todo[]>([{
      id: uuidv4(),
      text: 'Add more',
      completed: false
    }]);
    const filteredTodos = React.useMemo(() => {
      return todos.filter(item => {
        if (filter.id === 1) return true;
        if (filter.id === 2) return item.completed;
        return !item.completed;
      });
    }, [filter, todos]);
    function addTodo() {
      if (todoError || todo.length < 1) {
        setTodoError(true);
        return;
      }
      setTodoError(false);
      setTodos([...todos, {
        completed: false,
        id: uuidv4(),
        text: todo
      }]);
      setTodo('');
    }
    return <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 6,
      boxShadow: 1
    }}>\r
                <Box sx={{
        mb: 2
      }}>\r
                    <Typography variant={'h1'} sx={{
          mb: 2
        }}>ADD TODO</Typography>\r
                    <HCTextField required errorText={todoError ? 'Please enter some text!' : undefined} type={'text'} onChange={({
          currentTarget
        }) => {
          setTodo(currentTarget.value);
          setTodoError(currentTarget.value.length <= 0);
        }} value={todo} inputProps={{}} />\r
                    <HCButton hcVariant={'primary'} text={'ADD'} sx={{
          borderRadius: 0,
          ml: 1,
          mt: 0.25
        }} onClick={addTodo} />\r
                </Box>\r
                <HCRadioButton hcType={{
        type: 'group',
        options: [{
          id: 1,
          label: 'All'
        }, {
          id: 2,
          label: 'Completed'
        }, {
          id: 3,
          label: 'Not Completed'
        }],
        defaultValue: filter,
        name: 'filter',
        row: true
      }} hcVariant={'primary'} onRadioSelect={(_checked, item: HCRadioButtonOption) => {
        setFilter(item);
      }} />\r
                <Box sx={{
        my: 4,
        borderColor: theme.hcPalette.primary['500']!['hex'],
        p: 1
      }}>\r
                    <Typography variant={'h1'} sx={{
          mb: 2
        }}>TODOS</Typography>\r
                    {filteredTodos.length === 0 ? <Typography>Please add some todos</Typography> : <List>\r
                            {filteredTodos.map((item, index) => <ListItem key={item.id} disablePadding secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => {
            const newTodos = todos.filter(_i => _i.id !== item.id);
            setTodos([...newTodos]);
          }}>\r
                                        <Delete />\r
                                    </IconButton>}>\r
                                    <ListItemButton>\r
                                        <ListItemIcon>\r
                                            <HCCheckBox hcVariant={'primary'} hcType={{
                  type: 'single',
                  checked: item.completed
                }} onCheckChange={checked => {
                  const indexOf = todos.findIndex(i => i.id === item.id);
                  const newTodos = todos;
                  console.log(item, indexOf);
                  newTodos[index] = {
                    ...item,
                    completed: checked
                  };
                  setTodos([...newTodos]);
                }} />\r
                                        </ListItemIcon>\r
                                        <ListItemText sx={{
                textDecoration: item.completed ? 'line-through' : ''
              }} primary={item.text} />\r
                                    </ListItemButton>\r
                                </ListItem>)}\r
                        </List>}\r
                </Box>\r
            </Box>;
  }
}`,...(ot=(et=G.parameters)==null?void 0:et.docs)==null?void 0:ot.source}}};const Pe=["TodoScreen"];export{G as TodoScreen,Pe as __namedExportsOrder,ke as default};
