import { useState, useEffect } from 'preact/hooks';
import Form from "@rjsf/core";
import { set, get, keys } from "idb-keyval";

const vmSchema = {
  "type": "object",
  "required": [
    "schemaKey", "vm"
  ],
  "properties": {
    "schemaKey": {
      "type": "string",
      "title": "Schema Key (path)",
    },
    "vm": {
      "type": "string",
      "title": "VM Schema",
    },
    "ux": {
      "type": "string",
      "title": "UX Schema",
    },
  }
};

const uiSchema = {
  "schemaKey": {
    "ui:widget": "hidden"
  }, 
  "vm": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 10
    }
  },
  "ux": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 10
    }
  },
}


export function SchemaEditor(props) {

  const [keyValues, setKeys] = useState([]);
  const [currentSchema, setCurrentSchema] = useState({});
  const [currentSchemaKey, setCurrentSchemaKey] = useState('');
  
  async function  getKeys() {
    const allKeys = await keys();
    const schemaKeys = allKeys.filter(r=> r.indexOf('/schema/') === 0)
    setKeys(schemaKeys);
  }

  async function  getData() {
    if (currentSchemaKey === '') return;
    const schema = await get(currentSchemaKey);
    setCurrentSchema(schema);
  }

  useEffect(()=>{
    getKeys();
  }, [])

  useEffect(()=>{
    getData();
  }, [currentSchemaKey])
  

  const onSubmit = async({formData}, e) => {
    const res = await set(currentSchemaKey, formData);
  };

  const onNewClick = async(e) => {
    const newSchema = window.prompt('Enter new schema name path will be created');
    if (newSchema) {
      const key = `/schema/${newSchema}`;
      const formData = {
        schemaKey: key,
        vm: "{}",
        ux: "{}"
      }
      const res = await set(key, formData);
      setKeys([...keyValues, key]);
      setCurrentSchemaKey(key);
    }
  };

  
  return (
    <>
      <select value={currentSchemaKey} onChange={(e) => { setCurrentSchemaKey(e.target.value)}} >
        <option value=''>Select A Schema</option>
        {
          keyValues.map((r, idx) => <option key={idx} value={r}>{r}</option> )
        }
      </select>
      <button onClick={(e)=> {onNewClick(e)}}>New</button>
      <br></br>

      <Form 
        schema={vmSchema} 
        uiSchema={uiSchema}
        formData={currentSchema}
        onSubmit={onSubmit}
      />
    </>
  );
}
