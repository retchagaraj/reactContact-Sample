import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { uuid } from "uuidv4";
import api from '../api/contact';
import './App.css';
import Header from './Header';
import AddContact from './AddContact';
import ContactList from './ContactList';
import ContactDetail from './ContactDetail';
import EditContact from './EditContact';

function App() {
  
  const LOCAL_STORAGE_KEY = "contacts";
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSerachResults] = useState([]);

  // Retrive Contacts

  const retrieveContacts = async () => {
    const response = await api.get('/contacts');
    console.log("ContactsDetails##",response)
    return response.data;
  }
  const addContactHandler = async (contact) => {
    // console.log(contacts)
    const request = {
      id: uuid(),
      ...contact
    }

    const response = await api.post('/contacts',request);

    setContacts([...contacts, response.data]);
  };

  const updateContactHandler =  async(contact) => {
    const response = await api.put(`/contacts/${contact.id}`,contact);
    const {id, name, email} = response.data;
    setContacts(
      contacts.map((contact) => {
        return contact.id == id ? {...response.data} : contact;
      })
    )

  }

  const searchHandler = (searchTerm) => {
    setSearchTerm(searchTerm);
    if(searchTerm !== ""){
      const newContactList = contacts.filter((contact) => {
        return Object.values(contact).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
        setSerachResults(newContactList);
      }) 
    }else{
      setSerachResults(contacts);
    }
  }

  const removeContactHandler = async (id) => {
    await api.delete(`/contacts/${id}`);
    const newContactList = contacts.filter((contact) => {
      return contact.id !== id;
    });
    setContacts(newContactList);
  }
  useEffect(()=>{
    // const retrieveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    // if(retrieveContacts) setContacts(retrieveContacts);
    const getAllContacts = async () => {
      const allContacts = await retrieveContacts();
      console.log("Contacts##",allContacts)
      if(allContacts) setContacts(allContacts);

    }
    getAllContacts();
  },[]);
  useEffect(()=>{
    // localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(contacts));
  },[contacts]);
  return (
  <div className="ui container">
    <Router>
    <Header />
    <Switch>
    <Route path="/" exact render = {(props) => (<ContactList {...props}  contacts={searchTerm.length < 1 ? contacts : searchResults} getContactId = {removeContactHandler} term={searchTerm} searchKeyword={searchHandler}/>)}/>
    <Route path="/add" exact  render = {(props) => (<AddContact  {...props} addContactHandler = {addContactHandler} />)}/>
    <Route path="/contact/:id" component={ContactDetail}/>
    <Route path="/edit" exact  render = {(props) => (<EditContact  {...props} updateContactHandler = {updateContactHandler} />)}/>
    {/* <Route path="/add" component={() => (<AddContact addContactHandler = {addContactHandler}/>)} /> */}
    
    </Switch>
   
    {/* <AddContact  addContactHandler={addContactHandler}/>
    <ContactList contacts={contacts} getContactId = {removeContactHandler} /> */}
    </Router>
  </div>
  );
}

export default App;
