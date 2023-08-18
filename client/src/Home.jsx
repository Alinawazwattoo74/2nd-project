import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Import the search and close icons
import Map from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Home = () => {
  
  const [shopLocations, setShopLocations] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [model,setModel]=useState(false)
  const [password,setPassword]=useState("")
const navigate=useNavigate()
  useEffect(()=>{
    axios.get("http://localhost:4242/shops").then(res=>setShopLocations(res.data))
    .catch(error=>{
      console.log(error)
    })
  },[])

  
  const handleSearch = selected => {
    if (selected.length > 0) {
      const matchedShops = shopLocations.filter(shop =>
        shop.name.toLowerCase().includes(selected[0].toLowerCase())
      );
      setSelectedShops(matchedShops);
      setSearchInput(selected[0]);
    } else {
      setSelectedShops([]);
      setSearchInput('');
    }
  };

  const handleClearSearch = () => {
    setSelectedShops([]);
    setSearchInput('');
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    // Perform search logic here based on the searchInput value
    const matchedShops = shopLocations.filter(shop =>
      shop.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSelectedShops(matchedShops);
  };

  const handleLogin = () => {
    if(password=="aqibnawab"){
      setIsAdmin(true)
      window.localStorage.setItem("adminPassword","aqibnawab")
      setModel(false)
      navigate("/admin")
    }else
    {
      alert("Invalid Password ")
    }

  };

const handelShowModel=()=>{
    const password=window.localStorage.getItem("adminPassword")
    if(password && password=="aqibnawab"){
        navigate("/admin")
    }else{

        setModel(true)
    }
}

  const isShopSelected = selectedShops.length > 0;

  return (
    <div style={{position:"relative"}}>
      <Map selectedShops={selectedShops} shopLocations={shopLocations} />

      <div style={{ position: 'absolute', top: '20px', left: '80px', zIndex: '999' }}>
        <form onSubmit={handleFormSubmit} style={{ position: 'relative', display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            
          <Typeahead
id="searchInput"
options={shopLocations.map(shop => shop.name)}
placeholder="Search Shop Names"
onChange={handleSearch}
selected={selectedShops.map(shop => shop.name)}
value={searchInput}
onInputChange={setSearchInput}
// Add custom CSS class
style={{width:"250px"}}
/>

<span style={{marginLeft:"-27px",zIndex:"999"}}>

          {isShopSelected ? (
              <FaTimes style={{ cursor: 'pointer' }} onClick={handleClearSearch} />
              ) : (
                  <FaSearch style={{ cursor: 'pointer' }}   />
                  )}
                  </span>
          </div>
          <button type="button"  onClick={()=>handleFormSubmit()} style={{ cursor: 'pointer' }}>
          </button>
        </form>
      </div>
      <button style={{position:"absolute",bottom:"20px",right:"20px",opacity:"0"}} onClick={()=>handelShowModel()}>Log</button>
      {
        model && (
          <div className='passwordModel'>
            <h1 style={{fontSize:"25px"}}>Enter Password To Access Resources</h1>
            <input type="password" placeholder=' Password ' value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button onClick={()=>handleLogin()}> Access</button>
            <span onClick={()=>setModel(false)}><FaTimes fontSize={22}/></span>
          </div>
        )
      }
    </div>
  );
};

export default Home;
