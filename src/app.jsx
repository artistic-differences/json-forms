import { Router, route } from 'preact-router';
import Header from './components/header';
import AsyncRoute from "preact-async-route";
import { Viewer } from './components/views/viewer';
import { SchemaEditor } from './components/views/schemaEditor';
import { List } from './components/views/list';

export function App() {
  return (
    <>
  
    <Header/>
    <Router>
        <SchemaEditor path="/EditSchema"/>  
        <Viewer path="/Viewer/:schema?/:record?"/>
        <List path="/List" />
    </Router>
    </>
  )
}