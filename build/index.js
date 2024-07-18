(()=>{"use strict";var e={20:(e,t,a)=>{var n=a(609),l=Symbol.for("react.element"),r=(Symbol.for("react.fragment"),Object.prototype.hasOwnProperty),s=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};t.jsx=function(e,t,a){var n,o={},i=null,p=null;for(n in void 0!==a&&(i=""+a),void 0!==t.key&&(i=""+t.key),void 0!==t.ref&&(p=t.ref),t)r.call(t,n)&&!c.hasOwnProperty(n)&&(o[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps)void 0===o[n]&&(o[n]=t[n]);return{$$typeof:l,type:e,key:i,ref:p,props:o,_owner:s.current}}},848:(e,t,a)=>{e.exports=a(20)},609:e=>{e.exports=window.React}},t={};function a(n){var l=t[n];if(void 0!==l)return l.exports;var r=t[n]={exports:{}};return e[n](r,r.exports,a),r.exports}a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=a(609);const t=window.wp.element,n=window.wp.components,l=window.wp.apiFetch;var r=a.n(l);const s=({onSelectProcess:t})=>{const[a,l]=(0,e.useState)([]),[s,c]=(0,e.useState)([]),[o,i]=(0,e.useState)(!0),[p,m]=(0,e.useState)(""),[d,u]=(0,e.useState)(""),[E,h]=(0,e.useState)(null);(0,e.useEffect)((()=>{y(),g()}),[]);const y=()=>{r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{l(e)})).catch((e=>{console.error("Error fetching process types:",e)}))},g=()=>{i(!0),r()({path:"/wp/v2/process_obatala?per_page=100&_embed"}).then((e=>{c(e),i(!1)})).catch((e=>{console.error("Error fetching processes:",e),i(!1)}))};return o?(0,e.createElement)(n.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Process Manager"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Existing Processes"),(0,e.createElement)(n.PanelRow,null,s.length>0?(0,e.createElement)("table",{className:"wp-list-table widefat fixed striped"},(0,e.createElement)("thead",null,(0,e.createElement)("tr",null,(0,e.createElement)("th",null,"Process Title"),(0,e.createElement)("th",null,"Process Type"),(0,e.createElement)("th",null,"Status"),(0,e.createElement)("th",null,"Actions"))),(0,e.createElement)("tbody",null,s.map((a=>(0,e.createElement)("tr",{key:a.id},(0,e.createElement)("td",null,a.title.rendered),(0,e.createElement)("td",null,a.process_type?"Process type title":""),(0,e.createElement)("td",null,(0,e.createElement)("span",{className:"badge success"},a.status)),(0,e.createElement)("td",null,(0,e.createElement)(n.Button,{isSecondary:!0,onClick:()=>{return e=a.id,h(e),void t(e);var e}},"View"))))))):(0,e.createElement)(n.Notice,{isDismissible:!1,status:"warning"},"No existing processes.")))),(0,e.createElement)("aside",null,(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Create Process"),(0,e.createElement)(n.PanelRow,null,(0,e.createElement)(n.TextControl,{label:"Process Title",value:p,onChange:e=>m(e)}),(0,e.createElement)(n.SelectControl,{label:"Process Type",value:d,options:[{label:"Select a process type...",value:""},...a.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>u(e)}),(0,e.createElement)(n.Button,{isPrimary:!0,onClick:()=>{if(!p||!d)return void alert("Please provide a title and select a process type.");const e={title:p,status:"publish",type:"process_obatala",process_type:d,current_stage:null};r()({path:"/wp/v2/process_obatala",method:"POST",data:e}).then((e=>{c([...s,e]),m(""),u("")})).catch((e=>{console.error("Error creating process:",e)}))}},"Create Process"))))),E&&t(E))},c=({onSave:t,onCancel:a,editingProcessType:l})=>{const[r,s]=(0,e.useState)(""),[c,o]=(0,e.useState)(""),[i,p]=(0,e.useState)(!1),[m,d]=(0,e.useState)(!1),[u,E]=(0,e.useState)(!1),[h,y]=(0,e.useState)(null);(0,e.useEffect)((()=>{var e,t,a;l&&(s(l.title.rendered),o(l.description||""),p(null!==(e=l.accept_attachments)&&void 0!==e&&e),d(null!==(t=l.accept_tainacan_items)&&void 0!==t&&t),E(null!==(a=l.generate_tainacan_items)&&void 0!==a&&a))}),[l]);const g=()=>{r&&c?(t({status:"publish",title:r,description:c,accept_attachments:i,accept_tainacan_items:m,generate_tainacan_items:u}),l||v()):y({status:"error",message:"Field Name and Description cannot be empty."})},v=()=>{s(""),o(""),p(!1),d(!1),E(!1)};return(0,e.createElement)(n.PanelBody,{title:"Add Process Type",initialOpen:!0},(0,e.createElement)(n.PanelRow,null,h&&(0,e.createElement)(n.Notice,{status:h.status,isDismissible:!0,onRemove:()=>y(null)},h.message),(0,e.createElement)(n.TextControl,{label:"Process Type Name",value:r,onChange:e=>s(e)}),(0,e.createElement)(n.TextareaControl,{label:"Process Type Description",value:c,onChange:e=>o(e)}),(0,e.createElement)(n.CheckboxControl,{label:"Accept Attachments",checked:i,onChange:e=>p(e)}),(0,e.createElement)(n.CheckboxControl,{label:"Accept Tainacan Items",checked:m,onChange:e=>d(e)}),(0,e.createElement)(n.CheckboxControl,{label:"Generate Tainacan Items",checked:u,onChange:e=>E(e)}),l?(0,e.createElement)(e.Fragment,null,(0,e.createElement)(n.Button,{isPrimary:!0,onClick:g},"Update Process Type"),(0,e.createElement)(n.Button,{onClick:()=>{a(),s(""),o(""),p(!1),d(!1),E(!1)}},"Cancel")):(0,e.createElement)(n.Button,{isPrimary:!0,onClick:g},"Add Process Type")))},o=window.wp.primitives;var i=a(848);const p=(0,i.jsx)(o.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,i.jsx)(o.Path,{fillRule:"evenodd",clipRule:"evenodd",d:"M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z"})}),m=(0,i.jsx)(o.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,i.jsx)(o.Path,{d:"m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"})}),d=({processTypes:t,processSteps:a,onEdit:l,onDelete:r,onDeleteStep:s})=>{const[c,o]=(0,e.useState)({});(0,e.useEffect)((()=>{const e=t.reduce(((e,t)=>(e[t.id]=a.filter((e=>+e.process_type===t.id)),e)),{});o(e)}),[t,a]);const i=(e,t,a)=>{e.dataTransfer.setData("typeId",t.toString()),e.dataTransfer.setData("stepId",a.toString()),console.log("Drag started in step",a)},d=e=>{e.preventDefault()};return(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Existing Process Types"),(0,e.createElement)(n.PanelRow,null,t.length>0?(0,e.createElement)("div",{className:"card-container"},t.map((t=>{const a=c[t.id]||[];return(0,e.createElement)(n.Card,{key:t.id},(0,e.createElement)(n.CardHeader,null,(0,e.createElement)("h4",{className:"card-title"},t.title.rendered)),(0,e.createElement)(n.CardBody,null,(0,e.createElement)("dl",{className:"description-list"},(0,e.createElement)("div",{className:"list-item"},(0,e.createElement)("dt",null,"Description:"),(0,e.createElement)("dd",null,t.description?t.description.split("\n").map(((t,a)=>(0,e.createElement)("span",{key:a},t,(0,e.createElement)("br",null)))):"-"))),(0,e.createElement)("p",{className:t.accept_attachments?"check true":"check false"},!t.accept_attachments&&(0,e.createElement)("span",{className:"visually-hidden"},"Not")," ","Accept attachments"),(0,e.createElement)("p",{className:t.accept_tainacan_items?"check true":"check false"},!t.accept_tainacan_items&&(0,e.createElement)("span",{className:"visually-hidden"},"Not")," ","Accept Tainacan items"),(0,e.createElement)("p",{className:t.generate_tainacan_items?"check true":"check false"},!t.generate_tainacan_items&&(0,e.createElement)("span",{className:"visually-hidden"},"Not")," ","Generate Tainacan items"),a.length>0&&(0,e.createElement)(e.Fragment,null,(0,e.createElement)("hr",null),(0,e.createElement)("h5",null,"Steps"),(0,e.createElement)("ol",{className:"list-group"},a.map(((a,l)=>(0,e.createElement)(n.Draggable,{key:a.id,elementId:`step-${a.id}`,appendToOwnerDocument:!0,transferData:{typeId:t.id,stepId:a.id},onDragStart:e=>i(e,t.id,a.id)},(({onDraggableStart:r,onDraggableEnd:m})=>(0,e.createElement)("li",{className:"list-group-item",id:`step-${a.id}`,draggable:"true",onDragOver:d,onDrop:e=>(async(e,t)=>{e.preventDefault();const a=e.dataTransfer.getData("typeId"),n=e.dataTransfer.getData("stepId");if(!c[a])return void console.error(`Steps for typeId ${a} not found.`);const l=c[a].findIndex((e=>e.id===parseInt(n,10))),r=[...c[a]],[s]=r.splice(l,1);r.splice(t,0,s),o({...c,[a]:r}),console.log(`Step ${n} dropped to index: ${t}`)})(e,l,t.id),onDragStart:e=>i(e,t.id,a.id)},a.title.rendered,(0,e.createElement)(n.Tooltip,{text:"Delete Step"},(0,e.createElement)(n.Button,{isDestructive:!0,icon:(0,e.createElement)(n.Icon,{icon:p}),onClick:()=>s(a.id)})))))))))),(0,e.createElement)(n.CardFooter,null,(0,e.createElement)(n.Tooltip,{text:"Edit"},(0,e.createElement)(n.Button,{icon:(0,e.createElement)(n.Icon,{icon:m}),onClick:()=>l(t)})),(0,e.createElement)(n.Tooltip,{text:"Delete"},(0,e.createElement)(n.Button,{icon:(0,e.createElement)(n.Icon,{icon:p}),onClick:()=>r(t.id)}))))}))):(0,e.createElement)(n.Notice,{isDismissible:!1,status:"warning"},"No existing processes types.")))},u=({processTypes:t,processSteps:a,onAddStep:l})=>{const[r,s]=(0,e.useState)(""),[c,o]=(0,e.useState)(""),[i,p]=(0,e.useState)(null);return(0,e.createElement)(n.PanelBody,{title:"Add Process Step",initialOpen:!0},(0,e.createElement)(n.PanelRow,null,i&&(0,e.createElement)(n.Notice,{status:i.status,isDismissible:!0,onRemove:()=>p(null)},i.message),(0,e.createElement)(n.SelectControl,{label:"Select Step",value:c,options:[{label:"Select a step...",value:""},...a.map((e=>({label:e.title.rendered,value:e.title.rendered})))],onChange:e=>o(e)}),(0,e.createElement)(n.SelectControl,{label:"Select Process Type",value:r,options:[{label:"Select a process type...",value:""},...t.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>s(e)}),(0,e.createElement)(n.Button,{isSecondary:!0,onClick:()=>{if(!r||!c)return void p({status:"error",message:"Please select both a process type and a step."});const e=a.find((e=>e.title.rendered===c)),t={id:e.id,title:e.title.rendered,status:"publish",process_type:r};l(t),s(""),o("")}},"Add Process Step")))},E={isOpen:!1,deleteProcessType:null,deleteStep:null},h=function(e=E,t){switch(t.type){case"OPEN_MODAL_PROCESS_TYPE":return{...e,isOpen:!0,deleteProcessType:t.payload};case"OPEN_MODAL_STEP":return{...e,isOpen:!0,deleteStep:t.payload};case"CLOSE_MODAL":return{...e,isOpen:!1,deleteProcessType:null,deleteStep:null};default:return e}},y=()=>{const[t,a]=(0,e.useState)([]),[l,s]=(0,e.useState)([]),[o,i]=(0,e.useState)(!0),[p,m]=(0,e.useState)(null),[y,g]=(0,e.useReducer)(h,E);(0,e.useEffect)((()=>{v(),S()}),[]);const v=()=>{i(!0),r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{console.log("Fetched Process Types:",e),a(e),i(!1)})).catch((e=>{console.error("Error fetching process types:",e),i(!1)}))},S=()=>{r()({path:"/wp/v2/process_step?per_page=100&_embed"}).then((e=>{console.log("Fetched Process Steps:",e),s(e),i(!1)})).catch((e=>{console.error("Error fetching process steps:",e),i(!1)}))};return o?(0,e.createElement)(n.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Process Type Manager"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(n.__experimentalConfirmDialog,{isOpen:y.isOpen,onConfirm:()=>{var e;y.deleteProcessType?(e=y.deleteProcessType,r()({path:`/wp/v2/process_type/${e}`,method:"DELETE"}).then((()=>{const n=t.filter((t=>t.id!==e));a(n)})).catch((e=>{console.error("Error deleting process type:",e)}))):y.deleteStep&&(e=>{r()({path:`/wp/v2/process_step/${e}`,method:"DELETE"}).then((()=>{const t=l.filter((t=>t.id!==e));s(t)})).catch((e=>{console.error("Error deleting process step:",e)}))})(y.deleteStep),g({type:"CLOSE_MODAL"})},onCancel:()=>{g({type:"CLOSE_MODAL"})}},"Are you sure you want to delete this ",y.deleteProcessType?"Process Type":"Step","?"),(0,e.createElement)(d,{processTypes:t,processSteps:l,onEdit:e=>{m(e)},onDelete:e=>{g({type:"OPEN_MODAL_PROCESS_TYPE",payload:e})},onDeleteStep:e=>{g({type:"OPEN_MODAL_STEP",payload:e})}})),(0,e.createElement)("aside",null,(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Managing process types"),(0,e.createElement)(c,{onSave:e=>{p?r()({path:`/wp/v2/process_type/${p.id}`,method:"PUT",data:e}).then((e=>{const n=t.map((t=>t.id===e.id?e:t));a(n),m(null)})).catch((e=>{console.error("Error updating process type:",e)})):r()({path:"/wp/v2/process_type",method:"POST",data:e}).then((e=>{a([...t,e])})).catch((e=>{console.error("Error adding process type:",e)}))},onCancel:()=>m(null),editingProcessType:p}),(0,e.createElement)(u,{processTypes:t,processSteps:l,onAddStep:e=>{const{id:t,process_type:a}=e,n=l.find((e=>e.id===t&&e.process_type===a));n?console.log("Associação já existe:",n):r()({path:`/wp/v2/process_step/${t}`,method:"PUT",data:e}).then((e=>{s([...l,e])})).catch((e=>{console.error("Error updating process step:",e)}))}})))))},g=(window.wp.blockEditor,()=>{const[t,a]=(0,e.useState)([]),[l,s]=(0,e.useState)(null),[c,o]=(0,e.useState)(null),[i,d]=(0,e.useState)([]),[u,E]=(0,e.useState)(""),[h,y]=(0,e.useState)(""),[g,v]=(0,e.useState)([{name:"",type:"text",value:""}]),[S,P]=(0,e.useState)(!0),[_,b]=(0,e.useState)(-1);(0,e.useEffect)((()=>{f()}),[]);const f=()=>{P(!0),r()({path:"/wp/v2/process_step?per_page=100&_embed"}).then((e=>{a(e),P(!1)})).catch((e=>{console.error("Error fetching process steps:",e),P(!1)}))},w=()=>{if(!u)return void o({status:"error",message:"Step Title field cannot be empty."});const e={title:u,status:"publish",type:"process_step"};l?r()({path:`/wp/v2/process_step/${l}`,method:"PUT",data:e}).then((e=>{const n=t.map((t=>t.id===l?e:t));a(n),s(null),E(""),o(null);const r=savedStep.id,c=g.map((e=>({key:e.name,value:D(e.type)})));T(r,c).then((()=>{f(),E(""),y(""),v([{name:"",type:"text",value:""}])})).catch((e=>{console.error("Error saving metadata:",e)}))})).catch((e=>{console.error("Error updating process step:",e)})):r()({path:"/wp/v2/process_step",method:"POST",data:e}).then((e=>{a([...t,e]),E("");const n=e.id,l=g.map((e=>({key:e.name,value:D(e.type)})));T(n,l).then((()=>{f(),E(""),y(""),v([{name:"",type:"text",value:""}])})).catch((e=>{console.error("Error saving metadata:",e)}))})).catch((e=>{console.error("Error creating process step:",e)}))},C=()=>{s(null),E(""),o(null)},T=(e,t)=>new Promise(((a,n)=>{r()({path:"/wp-admin/admin-ajax.php",method:"POST",data:{action:"save_metadata",step_id:e,meta_data:t}}).then((e=>{e.success?a():n("Error saving metadata:",e.data)})).catch((e=>{n("Error saving metadata:",e)}))})),N=(e,t,a)=>{const n=[...g];n[e][t]=a,v(n)},D=e=>{switch(e){case"text":case"textfield":case"number":case"upload":case"select":case"radio":default:return"";case"datepicker":return null}};return S?(0,e.createElement)(n.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Step Manager"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Existing Steps"),(0,e.createElement)(n.PanelRow,null,t.length>0?(0,e.createElement)("table",{className:"wp-list-table widefat fixed striped"},(0,e.createElement)("thead",null,(0,e.createElement)("tr",null,(0,e.createElement)("th",null,"Step Title"),(0,e.createElement)("th",null,"Actions"))),(0,e.createElement)("tbody",null,t.map((t=>(0,e.createElement)("tr",{key:t.id},(0,e.createElement)("td",null,t.title.rendered),(0,e.createElement)("td",null,(0,e.createElement)(n.Button,{icon:(0,e.createElement)(n.Icon,{icon:m}),onClick:()=>{return e=t.id,a=t.title.rendered,s(e),void E(a);var e,a}}))))))):(0,e.createElement)(n.Notice,{isDismissible:!1,status:"warning"},"No existing process steps.")))),(0,e.createElement)("aside",null,(0,e.createElement)(n.Panel,null,(0,e.createElement)(n.PanelHeader,null,"Add Step"),(0,e.createElement)(n.PanelBody,{title:"Main data"},(0,e.createElement)(n.PanelRow,null,c&&!l&&(0,e.createElement)(n.Notice,{status:c.status,isDismissible:!0,onRemove:()=>o(null)},c.message),(0,e.createElement)(n.TextControl,{label:"Step Title",value:u,onChange:e=>E(e)}),(0,e.createElement)(n.Button,{isPrimary:!0,onClick:w},"Add Step"))),(0,e.createElement)(n.PanelBody,{title:"Metadata",className:"counter-container"},g.map(((t,a)=>(0,e.createElement)(n.PanelRow,{key:a,className:"counter-item"},(0,e.createElement)(n.Button,{icon:(0,e.createElement)(n.Icon,{icon:p}),isDestructive:!0,onClick:()=>(e=>{const t=g.filter(((t,a)=>a!==e));v(t)})(a)}),(0,e.createElement)(n.TextControl,{label:"Title",value:t.name||`Metadata Name ${a+1}`,onChange:e=>N(a,"name",e.target.value),onBlur:()=>((e,t)=>{const a=[...g];a[e].name=t,v(a),b(-1)})(a,g[a].name),autoFocus:!0}),(0,e.createElement)(n.SelectControl,{label:"Type",value:t.type,options:[{label:"Text",value:"text"},{label:"Date Picker",value:"datepicker"},{label:"Upload",value:"upload"},{label:"Number",value:"number"},{label:"Text Field",value:"textfield"},{label:"Select",value:"select"},{label:"Radio",value:"radio"}],onChange:e=>N(a,"type",e)})))),(0,e.createElement)(n.PanelRow,null,(0,e.createElement)(n.Button,{isSecondary:!0,onClick:()=>{v([...g,{name:"",type:"text",value:""}])}},"Add Metadata"))),(0,e.createElement)(n.PanelRow,null,(0,e.createElement)(n.Button,{isPrimary:!0,onClick:w},"Add Step"))))),l&&(0,e.createElement)(n.Modal,{title:"Edit Process Step",onRequestClose:C,isDismissible:!0},c&&l&&(0,e.createElement)(n.Notice,{status:c.status,isDismissible:!0,onRemove:()=>o(null)},c.message),(0,e.createElement)(n.TextControl,{label:"Step Title",value:u,onChange:e=>E(e)}),(0,e.createElement)(n.Button,{isPrimary:!0,onClick:w},"Save"),(0,e.createElement)(n.Button,{onClick:C},"Cancel")))}),v=()=>{const[t,a]=(0,e.useState)(null),[l,s]=(0,e.useState)(!0),[c,o]=(0,e.useState)(null),[i,p]=(0,e.useState)([]),[m,d]=(0,e.useState)([]);(0,e.useEffect)((()=>{const e=new URLSearchParams(window.location.search).get("process_id");e?(u(e),E(),h()):(o("No process ID found in the URL."),s(!1))}),[]);const u=e=>{s(!0),r()({path:`/wp/v2/process_obatala/${e}?_embed`}).then((e=>{a(e),s(!1)})).catch((e=>{console.error("Error fetching process:",e),o("Error fetching process details."),s(!1)}))},E=()=>{s(!0),r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{p(e),s(!1)})).catch((e=>{console.error("Error fetching process types:",e),s(!1)}))},h=()=>{s(!0),r()({path:"/wp/v2/process_step?per_page=100&_embed"}).then((e=>{d(e),s(!1)})).catch((e=>{console.error("Error fetching process steps:",e),s(!1)}))};if(l)return(0,e.createElement)(n.Spinner,null);if(c)return(0,e.createElement)(n.Notice,{status:"error",isDismissible:!1},c);if(!t)return(0,e.createElement)(n.Notice,{status:"warning",isDismissible:!1},"No process found.");const y=m.filter((e=>e.process_type===t.process_type));return(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Viewer"),(0,e.createElement)("h2",null,t.process_type?"Process type title":"",": ",t.title.rendered),(0,e.createElement)("div",{className:"badge-container"},(0,e.createElement)("span",{className:"badge success"},t.status),(0,e.createElement)("span",{className:"badge"},"Current step")),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,y.length>0?y.map(((t,a)=>(0,e.createElement)(n.Panel,{key:t.id},(0,e.createElement)(n.PanelHeader,null,t.title.rendered,(0,e.createElement)("span",{className:"badge success"},"Completed"),(0,e.createElement)("small",null,"Completed at 21/04/2024 by João Silva")),(0,e.createElement)(n.PanelBody,{title:"History",initialOpen:!1},(0,e.createElement)(n.PanelRow,null)),(0,e.createElement)(n.PanelBody,{title:"Comments",initialOpen:!1},(0,e.createElement)(n.PanelRow,null))))):(0,e.createElement)(n.Notice,{status:"info",isDismissible:!1},"No steps found for this process type."))))},S=e=>{window.location.href=`?page=process-viewer&process_id=${e}`};document.addEventListener("DOMContentLoaded",(()=>{const a=document.getElementById("process-manager"),n=document.getElementById("process-type-manager"),l=document.getElementById("process-step-manager"),r=document.getElementById("process-viewer");a&&(0,t.render)((0,e.createElement)(s,{onSelectProcess:S}),a),n&&(0,t.render)((0,e.createElement)(y,null),n),l&&(0,t.render)((0,e.createElement)(g,null),l),r&&(0,t.render)((0,e.createElement)(v,null),r)}))})()})();