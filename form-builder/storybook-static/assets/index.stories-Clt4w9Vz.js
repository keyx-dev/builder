import{F as d,p as h,j as t,R as x}from"./form-builder-Bdhz444m.js";import"./index-DQLiH3RP.js";const _="_fieldset_w3bpa_1",j="_fieldList_w3bpa_8",g="_field_w3bpa_1",v="_alert_w3bpa_17",s={fieldset:_,fieldList:j,field:g,alert:v},{useArgs:b}=__STORYBOOK_MODULE_PREVIEW_API__,T={title:"FormBuilder",component:d,argTypes:{value:{control:"object"},document:{control:"object"},liveValidate:{control:"boolean"},renderers:{control:"object"}},render:function(a){const[{value:r,document:l,renderers:i},u]=b(),p=f=>{u({value:f})};return t.jsx(d,{...a,value:r,document:l,renderers:i,onChange:p})}},y={form:({node:e,context:{core:a}})=>t.jsxs("fieldset",{className:s.fieldset,children:[t.jsx("legend",{children:e.data.title}),t.jsx("div",{className:s.fieldList,children:e.children&&e.children.map(r=>t.jsx(x,{node:r,renderers:a.renderers,propInjectors:a.propInjectors},r.id))})]}),"text-field":({node:e,$formField:a})=>{var l;const r=a;return t.jsxs("div",{className:s.field,children:[t.jsxs("label",{htmlFor:e.id,children:[e.data.label,((l=e.data.validate)==null?void 0:l.required)&&t.jsx("span",{className:s.alert,children:"*"})]}),t.jsx("input",{id:e.id,type:e.data.inputType||"text",value:r.value,onChange:i=>r.setValue(i.target.value)}),e.data.description&&t.jsx("span",{children:e.data.description}),r.errors.length>0&&t.jsx("span",{className:s.alert,children:r.errors.join(", ")})]})}},N=h({type:"form",title:"User Form",children:[{type:"text-field",label:"Name",dataPath:".name",validate:{required:!0,min:2,type:"string"},description:"Your full name"},{type:"text-field",label:"Email",dataPath:".email",inputType:"email",validate:{required:!0,email:!0,type:"string"}},{type:"text-field",label:"Age",dataPath:".age",inputType:"number",validate:{required:!0,min:18,max:99,type:"number"}}]}),n={args:{value:{name:"Cihad",email:"cihad@example.com",age:38},document:N,renderers:y,liveValidate:!0}};var o,c,m;n.parameters={...n.parameters,docs:{...(o=n.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    value: {
      name: "Cihad",
      email: "cihad@example.com",
      age: 38
    },
    document: storyDocumentNode,
    renderers: defaultRenderers,
    liveValidate: true
  }
}`,...(m=(c=n.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const C=["Simple"];export{n as Simple,C as __namedExportsOrder,T as default};
