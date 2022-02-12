import { set, get, keys } from 'idb-keyval';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Form from "@rjsf/core";
import LayoutField from '../jsonform/gridField';

const fields = {
  layout: LayoutField,
  SchemaField: CustomSchemaField
}

function ArrayFieldTemplate(props) {
  console.log(props);
  return (
    
    <div className="container">
        {props.formData.map((row, rowIdx) => {
          return(
            <div className="row" key={rowIdx}>
              {Object.values(row).map((val, colIdx) => {
                return (
                  <div className="col" key={colIdx}>{val}</div>
                )
              })}
            </div>
          )
        })}
    </div>
  );
}

function CustomSchemaField(props) {
  console.log(props);
  const {formData, schema, uiSchema } = props;
  const fields = schema.items.properties;
  const {resource, rowKey, shownFieldNames, } = uiSchema; //think resource and rowKey are actually part of list VM

  function renderCell(props) {
    const {fields, fieldName, value} = props;
    let formattedValue = value;
    const fieldType = fields[fieldName].type;
    const fieldFormat = fields[fieldName].format;
    
    if (fieldType === "string" && fieldFormat) {
      if (fieldFormat === "date") {
        formattedValue = new Date(value).toLocaleDateString() 
      }
    }

    return(
      <span>{formattedValue}</span>
    )
  }

  function onRowClick(e, id) {
    route(`/Viewer/${resource}/${id}`);
  }

  return (
  <table className="table table-striped table-hover caption-top">
    <caption>{schema.title}</caption>
    <thead>
        <tr>
          {shownFieldNames.map((fieldName, colIdx) => {
            return (
              <th scope="col" key={colIdx}>{fields[fieldName].title}</th>
            )
          })}
        </tr>
    </thead>
    <tbody>
      {formData.map((row) => {
            return(
              <tr style={{cursor: "pointer"}} scope="row" key={row[rowKey]} onClick={(e) => onRowClick(e, row[rowKey])} >
                {shownFieldNames.map((fieldName, colIdx) => {
                  return (
                    <td scope="col" key={colIdx}>{renderCell({fields, fieldName, value: row[fieldName]})}</td>
                  )
                })}
                {
                  //actions will go here
                }
              </tr>
            )
      })}
    </tbody>
  </table>
  );
};


export function List(props) {
  const [keyValues, setKeys] = useState([]);
  const [currentSchema, setCurrentSchema] = useState({});
  const [currentSchemaKey, setCurrentSchemaKey] = useState('');
  const [currentListData, setCurrentListData] = useState([]);
  
  async function  getKeys() {
    const allKeys = await keys();
    const schemaKeys = allKeys.filter(r=> r.indexOf('/list') >0 )
    setKeys(schemaKeys);
  }

  async function  getData() {
    if (currentSchemaKey === '') return;
    const schema = await get(currentSchemaKey);
    setCurrentSchema(schema);
    const dataKey = `/data${currentSchemaKey}`.replace('/list','');
    console.log(dataKey);
    const data = await get(dataKey);
    const listData = Array.isArray(data) ? data : [data];
    setCurrentListData(listData);

  }

  useEffect(()=>{
    getKeys();
  }, [])

  useEffect(()=>{
    getData();
  }, [currentSchemaKey])


  return (
    <>
      <select value={currentSchemaKey} onChange={(e) => { setCurrentSchemaKey(e.target.value)}} >
        <option value=''>Select A Schema</option>
        {
          keyValues.map((r, idx) => <option key={idx} value={r}>{r}</option> )
        }
      </select>
      <br></br>
      <>
        {currentSchemaKey != '' && currentSchema?.vm && (
          <Form 
          
          ArrayFieldTemplate={ArrayFieldTemplate}
          formData={currentListData}
          schema={JSON.parse(currentSchema.vm)} 
          uiSchema={JSON.parse(currentSchema.ux)}
          fields={fields}
          >  
            <>
              {/* This is the form footer bar, so no submit */}
            </> 
          </Form>
        )}
      </>
    </>
  )
}
