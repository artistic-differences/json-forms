import { set, get, keys } from 'idb-keyval';
import { useState, useEffect } from 'preact/hooks';
import Form from "@rjsf/core";
import LayoutField from '../jsonform/gridField';

const fields = {
  layout: LayoutField,
}

export function Viewer(props) {

  const {matches} = props;
  const {schema :urlSchema, record: urlRecord} = matches;
  
  const [keyValues, setKeys] = useState([]);
  const [currentSchema, setCurrentSchema] = useState({});
  const [currentSchemaKey, setCurrentSchemaKey] = useState('');
  const [currentFormData, setCurrentFormData] = useState({});
  const [currentListData, setCurrentListData] = useState([]);
  const [currentRecordIdx, setCurrentRecordIdx] = useState(-1);
    
  async function  getKeys() {
    const allKeys = await keys();
    const schemaKeys = allKeys.filter(r => {
      return r.indexOf('/schema/') === 0 && r.indexOf('/list') === -1
    })
    setKeys(schemaKeys);
  }

  async function  getData() {
    if (currentSchemaKey === '') return;
    const schema = await get(currentSchemaKey);
    setCurrentSchema(schema);
    const data = await get(`/data${currentSchemaKey}`);
    const listData = Array.isArray(data) ? data : [data];
    setCurrentListData(listData);
    setCurrentRecordIdx(-1);
    setCurrentFormData({});
  }

  useEffect(()=>{
    getKeys();
    if (urlSchema) {
      setCurrentSchemaKey(`/schema/${urlSchema}`);
      setTimeout(()=>{
        setCurrentRecordIdx(urlRecord);
      },500)
    }
  }, [])

  useEffect(()=>{
    getData();
  }, [currentSchemaKey])

  useEffect(()=>{
    const formData = currentListData?.length && currentRecordIdx >= 0 ? currentListData[currentRecordIdx] : {} ;
    setCurrentFormData(formData);
  }, [currentRecordIdx])
  
  const onSubmit = async({formData}, e) => {
    const key = `/data${currentSchemaKey}`
    const listData = JSON.parse(JSON.stringify(currentListData)); //clone

    formData.id=currentRecordIdx != -1 ? currentRecordIdx : listData.length.toString();
    if (currentRecordIdx == -1) {
      listData.push(formData);
    } else {
      listData[currentRecordIdx]=formData;
    }
    const res = await set(key, listData);
    getData();
  };

  return (
    <>
      <select value={currentSchemaKey} onChange={(e) => { setCurrentSchemaKey(e.target.value)}} >
        <option value=''>Select A Schema</option>
        {
          keyValues.map((r, idx) => <option key={idx} value={r}>{r}</option> )
        }
      </select>
      <select value={currentRecordIdx} onChange={(e) => { setCurrentRecordIdx(e.target.value)}} >
        <option value='-1'>Select Record</option>
        {
          currentListData.map((r, idx) => <option key={idx} value={idx}>{idx}</option> )
        }
      </select>
      <br></br>
      <>
        {currentSchemaKey != '' && currentSchema?.vm && (
          <Form 
          formData={currentFormData}
          schema={JSON.parse(currentSchema.vm)} 
          uiSchema={JSON.parse(currentSchema.ux)}
          fields={fields}
          onSubmit={onSubmit} 
          />         
        )}
      </>
    </>
  )
}
