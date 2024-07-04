(()=>{"use strict";var e={20:(e,t,n)=>{var a=n(609),l=Symbol.for("react.element"),r=(Symbol.for("react.fragment"),Object.prototype.hasOwnProperty),s=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};t.jsx=function(e,t,n){var a,o={},i=null,p=null;for(a in void 0!==n&&(i=""+n),void 0!==t.key&&(i=""+t.key),void 0!==t.ref&&(p=t.ref),t)r.call(t,a)&&!c.hasOwnProperty(a)&&(o[a]=t[a]);if(e&&e.defaultProps)for(a in t=e.defaultProps)void 0===o[a]&&(o[a]=t[a]);return{$$typeof:l,type:e,key:i,ref:p,props:o,_owner:s.current}}},848:(e,t,n)=>{e.exports=n(20)},609:e=>{e.exports=window.React}},t={};function n(a){var l=t[a];if(void 0!==l)return l.exports;var r=t[a]={exports:{}};return e[a](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=n(609);const t=window.wp.element,a=window.wp.components,l=window.wp.apiFetch;var r=n.n(l);const s=({onSelectProcess:t})=>{const[n,l]=(0,e.useState)([]),[s,c]=(0,e.useState)([]),[o,i]=(0,e.useState)(!0),[p,m]=(0,e.useState)(""),[d,u]=(0,e.useState)(""),[E,h]=(0,e.useState)(null);(0,e.useEffect)((()=>{g(),v()}),[]);const g=()=>{r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{l(e)})).catch((e=>{console.error("Error fetching process types:",e)}))},v=()=>{i(!0),r()({path:"/wp/v2/process_obatala?per_page=100&_embed"}).then((e=>{c(e),i(!1)})).catch((e=>{console.error("Error fetching processes:",e),i(!1)}))};return o?(0,e.createElement)(a.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Manage Processes"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Existing Processes",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,s.length>0?(0,e.createElement)("ul",{className:"list-group"},s.map((n=>(0,e.createElement)("li",{key:n.id,className:"list-group-item"},(0,e.createElement)(a.Button,{onClick:()=>{return e=n.id,h(e),void t(e);var e}},n.title.rendered))))):(0,e.createElement)(a.Notice,{isDismissible:!1,status:"warning"},"No existing processes."))))),(0,e.createElement)("aside",null,(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Create Processes",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,(0,e.createElement)(a.TextControl,{label:"Process Title",value:p,onChange:e=>m(e)}),(0,e.createElement)(a.SelectControl,{label:"Process Type",value:d,options:[{label:"Select a process type...",value:""},...n.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>u(e)}),(0,e.createElement)(a.Button,{isPrimary:!0,onClick:()=>{if(!p||!d)return void alert("Please provide a title and select a process type.");const e={title:p,status:"publish",type:"process_obatala",process_type:d,current_stage:null};r()({path:"/wp/v2/process_obatala",method:"POST",data:e}).then((e=>{c([...s,e]),m(""),u("")})).catch((e=>{console.error("Error creating process:",e)}))}},"Create Process")))))),E&&t(E))},c=({onSave:t,onCancel:n,editingProcessType:l})=>{const[r,s]=(0,e.useState)(""),[c,o]=(0,e.useState)(""),[i,p]=(0,e.useState)(!1),[m,d]=(0,e.useState)(!1),[u,E]=(0,e.useState)(!1);(0,e.useEffect)((()=>{var e,t,n;l&&(s(l.title.rendered),o(l.description||""),p(null!==(e=l.accept_attachments)&&void 0!==e&&e),d(null!==(t=l.accept_tainacan_items)&&void 0!==t&&t),E(null!==(n=l.generate_tainacan_items)&&void 0!==n&&n))}),[l]);const h=()=>{t({status:"publish",title:r,description:c,accept_attachments:i,accept_tainacan_items:m,generate_tainacan_items:u})};return(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Add Process Type",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,(0,e.createElement)(a.TextControl,{label:"Process Type Name",value:r,onChange:e=>s(e)}),(0,e.createElement)(a.TextControl,{label:"Process Type Description",value:c,onChange:e=>o(e)}),(0,e.createElement)(a.CheckboxControl,{label:"Accept Attachments",checked:i,onChange:e=>p(e)}),(0,e.createElement)(a.CheckboxControl,{label:"Accept Tainacan Items",checked:m,onChange:e=>d(e)}),(0,e.createElement)(a.CheckboxControl,{label:"Generate Tainacan Items",checked:u,onChange:e=>E(e)}),l?(0,e.createElement)(e.Fragment,null,(0,e.createElement)(a.Button,{isPrimary:!0,onClick:h},"Update Process Type"),(0,e.createElement)(a.Button,{onClick:()=>{n(),s(""),o(""),p(!1),d(!1),E(!1)}},"Cancel")):(0,e.createElement)(a.Button,{isPrimary:!0,onClick:h},"Add Process Type"))))},o=window.wp.primitives;var i=n(848);const p=(0,i.jsx)(o.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,i.jsx)(o.Path,{fillRule:"evenodd",clipRule:"evenodd",d:"M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z"})}),m=(0,i.jsx)(o.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,i.jsx)(o.Path,{d:"m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"})}),d=({processTypes:t,processSteps:n,onEdit:l,onDelete:r,onDeleteStep:s})=>(console.log(t,n),(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Existing Process Types",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,t.length>0?(0,e.createElement)("div",{className:"card-container"},t.map((t=>{const c=n.filter((e=>+e.process_type===t.id));return(0,e.createElement)(a.Card,{key:t.id},(0,e.createElement)(a.CardHeader,null,(0,e.createElement)("h4",{className:"card-title"},t.title.rendered)),(0,e.createElement)(a.CardBody,null,(0,e.createElement)("dl",{className:"description-list"},(0,e.createElement)("div",{className:"list-item"},(0,e.createElement)("dt",null,"Description:"),(0,e.createElement)("dd",null,t.description?t.description:"-")),(0,e.createElement)("div",{className:"list-item"},(0,e.createElement)("dt",null,"Accept Attachments:"),(0,e.createElement)("dd",null,t.accept_attachments?"Yes":"No")),(0,e.createElement)("div",{className:"list-item"},(0,e.createElement)("dt",null,"Accept Tainacan Items:"),(0,e.createElement)("dd",null,t.accept_tainacan_items?"Yes":"No")),(0,e.createElement)("div",{className:"list-item"},(0,e.createElement)("dt",null,"Generate Tainacan Items:"),(0,e.createElement)("dd",null,t.generate_tainacan_items?"Yes":"No"))),c.length>0&&(0,e.createElement)(e.Fragment,null,(0,e.createElement)("hr",null),(0,e.createElement)("h5",null,"Steps"),(0,e.createElement)("ul",{className:"list-group"},c.map((t=>(0,e.createElement)("li",{className:"list-group-item",key:t.id},t.title.rendered,(0,e.createElement)(a.Tooltip,{text:"Delete Step"},(0,e.createElement)(a.Button,{isDestructive:!0,icon:(0,e.createElement)(a.Icon,{icon:p}),onClick:()=>s(t.id)})))))))),(0,e.createElement)(a.CardFooter,null,(0,e.createElement)(a.Tooltip,{text:"Edit"},(0,e.createElement)(a.Button,{icon:(0,e.createElement)(a.Icon,{icon:m}),onClick:()=>l(t)})),(0,e.createElement)(a.Tooltip,{text:"Delete"},(0,e.createElement)(a.Button,{icon:(0,e.createElement)(a.Icon,{icon:p}),onClick:()=>r(t.id)}))))}))):(0,e.createElement)(a.Notice,{isDismissible:!1,status:"warning"},"No existing processes types."))))),u=({processTypes:t,onAddStep:n})=>{const[l,r]=(0,e.useState)(""),[s,c]=(0,e.useState)(""),[o,i]=(0,e.useState)("");return(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Add Process Step",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,(0,e.createElement)(a.TextControl,{label:"Step Name",value:s,onChange:e=>c(e)}),(0,e.createElement)(a.SelectControl,{label:"Select Process Type",value:l,options:[{label:"Select a process type...",value:""},...t.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>r(e)}),(0,e.createElement)(a.SelectControl,{label:"Select Parent Process",value:o,options:[{label:"Select a parent process...",value:""},...t.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>i(e)}),(0,e.createElement)(a.Button,{isSecondary:!0,onClick:()=>{l&&o?(n({title:s,status:"publish",process_type:l,parent_process:o}),c(""),r(""),i("")):alert("Please select both a process type and a parent process.")}},"Add Process Step"))))},E=()=>{const[t,n]=(0,e.useState)([]),[l,s]=(0,e.useState)([]),[o,i]=(0,e.useState)(!0),[p,m]=(0,e.useState)(null);(0,e.useEffect)((()=>{E(),h()}),[]);const E=()=>{i(!0),r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{console.log("Fetched Process Types:",e),n(e),i(!1)})).catch((e=>{console.error("Error fetching process types:",e),i(!1)}))},h=()=>{r()({path:"/wp/v2/process_step?per_page=100&_embed"}).then((e=>{console.log("Fetched Process Steps:",e),s(e),i(!1)})).catch((e=>{console.error("Error fetching process steps:",e),i(!1)}))};return o?(0,e.createElement)(a.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{class:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Manage Process Types and Steps"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(d,{processTypes:t,processSteps:l,onEdit:e=>{m(e)},onDelete:e=>{r()({path:`/wp/v2/process_type/${e}`,method:"DELETE"}).then((()=>{const a=t.filter((t=>t.id!==e));n(a)})).catch((e=>{console.error("Error deleting process type:",e)}))},onDeleteStep:e=>{r()({path:`/wp/v2/process_step/${e}`,method:"DELETE"}).then((()=>{const t=l.filter((t=>t.id!==e));s(t)})).catch((e=>{console.error("Error deleting process step:",e)}))}})),(0,e.createElement)("aside",null,(0,e.createElement)(c,{onSave:e=>{p?r()({path:`/wp/v2/process_type/${p.id}`,method:"PUT",data:e}).then((e=>{const a=t.map((t=>t.id===e.id?e:t));n(a),m(null)})).catch((e=>{console.error("Error updating process type:",e)})):r()({path:"/wp/v2/process_type",method:"POST",data:e}).then((e=>{n([...t,e])})).catch((e=>{console.error("Error adding process type:",e)}))},onCancel:()=>m(null),editingProcessType:p}),(0,e.createElement)(u,{processTypes:t,onAddStep:e=>{r()({path:"/wp/v2/process_step",method:"POST",data:e}).then((e=>{s([...l,e])})).catch((e=>{console.error("Error adding process step:",e)}))}}))))},h=()=>{const[t,n]=(0,e.useState)([]),[l,s]=(0,e.useState)([]),[c,o]=(0,e.useState)(""),[i,p]=(0,e.useState)(""),[m,d]=(0,e.useState)(!0);(0,e.useEffect)((()=>{u(),E()}),[]);const u=()=>{d(!0),r()({path:"/wp/v2/process_step?per_page=100&_embed"}).then((e=>{n(e),d(!1)})).catch((e=>{console.error("Error fetching process steps:",e),d(!1)}))},E=()=>{r()({path:"/wp/v2/process_type?per_page=100&_embed"}).then((e=>{s(e)})).catch((e=>{console.error("Error fetching process types:",e)}))};return m?(0,e.createElement)(a.Spinner,null):(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Management"),(0,e.createElement)("h2",null,"Manage Process Steps"),(0,e.createElement)("div",{className:"panel-container"},(0,e.createElement)("main",null,(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Existing Process Steps",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,t.length>0?(0,e.createElement)("ul",{className:"list-group"},t.map((t=>(0,e.createElement)("li",{key:t.id,className:"list-group-item"},t.title.rendered)))):(0,e.createElement)(a.Notice,{isDismissible:!1,status:"warning"},"No existing process steps."))))),(0,e.createElement)("aside",null,(0,e.createElement)(a.Panel,null,(0,e.createElement)(a.PanelBody,{title:"Create Process Step",initialOpen:!0},(0,e.createElement)(a.PanelRow,null,(0,e.createElement)(a.TextControl,{label:"Step Title",value:c,onChange:e=>o(e)}),(0,e.createElement)(a.SelectControl,{label:"Process Type",value:i,options:[{label:"Select a process type...",value:""},...l.map((e=>({label:e.title.rendered,value:e.id})))],onChange:e=>p(e)}),(0,e.createElement)(a.Button,{isPrimary:!0,onClick:()=>{if(!c||!i)return void alert("Please provide a title and select a process type.");const e={title:c,status:"publish",type:"process_step",process_type:i};r()({path:"/wp/v2/process_step",method:"POST",data:e}).then((e=>{n([...t,e]),o(""),p("")})).catch((e=>{console.error("Error creating process step:",e)}))}},"Create Step")))))))},g=()=>{const[t,n]=(0,e.useState)(null),[l,s]=(0,e.useState)(!0),[c,o]=(0,e.useState)(null);(0,e.useEffect)((()=>{const e=new URLSearchParams(window.location.search).get("process_id");e?i(e):(o("No process ID found in the URL."),s(!1))}),[]);const i=e=>{s(!0),r()({path:`/wp/v2/process_obatala/${e}?_embed`}).then((e=>{n(e),s(!1)})).catch((e=>{console.error("Error fetching process:",e),o("Error fetching process details."),s(!1)}))};return l?(0,e.createElement)(a.Spinner,null):c?(0,e.createElement)(a.Notice,{status:"error",isDismissible:!1},c):t?(0,e.createElement)("div",null,(0,e.createElement)("span",{className:"brand"},(0,e.createElement)("strong",null,"Obatala")," Curatorial Process Viewer"),(0,e.createElement)("h2",null,t.title.rendered),(0,e.createElement)("div",{className:"process-details"},(0,e.createElement)("p",null,(0,e.createElement)("strong",null,"Process Type:")," ",t.process_type),(0,e.createElement)("p",null,(0,e.createElement)("strong",null,"Status:")," ",t.status),(0,e.createElement)("p",null,(0,e.createElement)("strong",null,"Current Stage:")," ",t.current_stage))):(0,e.createElement)(a.Notice,{status:"warning",isDismissible:!1},"No process found.")},v=e=>{window.location.href=`?page=process-viewer&process_id=${e}`};document.addEventListener("DOMContentLoaded",(()=>{const n=document.getElementById("process-manager"),a=document.getElementById("process-type-manager"),l=document.getElementById("process-step-manager"),r=document.getElementById("process-viewer");n&&(0,t.render)((0,e.createElement)(s,{onSelectProcess:v}),n),a&&(0,t.render)((0,e.createElement)(E,null),a),l&&(0,t.render)((0,e.createElement)(h,null),l),r&&(0,t.render)((0,e.createElement)(g,null),r)}))})()})();