import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';
import Loader from './Loading';
import { FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [shopLocations, setShopLocations] = useState([]);
  const [allshopLocations, setAllShopLocations] = useState([]);

  const [name, setName] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [banner, setBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditShop, setIsEditShop] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [locations,setLocation]=useState([])
  const [searchInput, setSearchInput] = useState('');
  const [shopId, setShopId] = useState('');


  useEffect(() => {
    const password = localStorage.getItem('adminPassword');
    if (password && password === 'aqibnawab') {
      // Add any additional initialization code if needed
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true)
    axios
      .get('http://localhost:4242/shops')
      .then((res) => {
        setShopLocations(res.data);
        setAllShopLocations(res.data);
        setLocation(res.data)
setLoading(false)
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const logout = () => {
    window.localStorage.removeItem('adminPassword');
    navigate('/');
  };

  const addShopLocation = async () => {
    setLoading(true);
    if(!banner){
      alert("Enter All required Data")
      return setLoading(false)
    }
    try {
      
      const response = await axios.post('http://localhost:4242/shop', {
        name,
        latitude,
        longitude,
        image: banner,
        items,
      });
      if (response?.data?.message) {
        alert(response.data.message);
      } else {
        setShopLocations((prevShopLocations) => [
          ...prevShopLocations,
          {
            name,
            latitude,
            longitude,
            image: response.data.image,
            items,
          },
          console.log(response.data)
        ]);
        setBanner(null);
        setLatitude('');
        setLongitude('');
        setName('');
        setImagePreview(null);
        setItems([]);
        alert('Shop location added successfully');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '' }]);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = items.filter((item) => item._id !== itemId);
    setItems(updatedItems);
  };

  const handleItemNameChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].name = value;
    setItems(updatedItems);
  };

  const handleItemPriceChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].price = value;
    setItems(updatedItems);
  };

  const handleEditShop = (latitude, longitude,id) => {
    const shop = shopLocations.find(
      (shop) => shop.latitude === latitude && shop.longitude === longitude
    );
    if (shop) {
      setIsEditShop(true);
      setLatitude(shop?.latitude);
      setLongitude(shop?.longitude);
      setName(shop?.name);
      setImagePreview(shop?.image?.url);
      setItems(shop?.items);
      setShopId(id)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Invalid shop data. Please try again.');
    }
  };
  
  
  const handleUpdateShop = async (latitude, longitude) => {
    setLoading(true);
    try {
      const updatedItems = items.filter((item) => item.name !== '' && item.price !== '');
  
      let updatedData = {
        latitude,
        longitude,
        name,
        items: updatedItems,
        image: banner ? banner : null,
      };
  
      const response = await axios.put(`http://localhost:4242/shop/${shopId}`, updatedData);
      if (response?.data?.message) {
        alert(response.data.message);
      } else {
        const updatedShopLocations = shopLocations.map((shop) => {
      if (shop?.latitude == latitude && shop?.longitude == longitude) {
        return {
          ...shop,
          name,
          items: updatedItems,
          image: shop?.image,
        };
      } else {
        return shop;
      }
    });
    
    setShopLocations([(prevAllShopLocations) =>
    prevAllShopLocations.filter(
      (shop) => shop.latitude !== latitude || shop.longitude !== longitude
    ),updatedShopLocations]);
    
    setAllShopLocations([(prevAllShopLocations) =>
    prevAllShopLocations.filter(
      (shop) => shop.latitude !== latitude || shop.longitude !== longitude
    ),updatedShopLocations]);
        setIsEditShop(false);
        setBanner(null);
        setLatitude('');
        setLongitude('');
        setName('');
        setImagePreview("");
        setShopId("")
        setItems([]);
        alert('Shop location updated successfully');
        window.location.reload()
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const handleDeleteShop = async (latitude, longitude,image) => {
    setLoading(true);
    try {
      await axios.delete('http://localhost:4242/shop', {
        data: { latitude, longitude,image },
      });
      setShopLocations(prevShopLocations =>
        prevShopLocations.filter(
          shop =>
            shop?.latitude !== latitude || shop?.longitude !== longitude
        )
      );
      setAllShopLocations((prevAllShopLocations) =>
      prevAllShopLocations.filter(
        (shop) => shop?.latitude !== latitude || shop?.longitude !== longitude
      )
    );
    setLocation((prevAllShopLocations) =>
      prevAllShopLocations.filter(
        (shop) => shop?.latitude !== latitude || shop?.longitude !== longitude
      )
    );
      setLoading(false);
      alert('Shop location deleted successfully');
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (banner) {
      setImagePreview(banner);
    }
  }, [banner]);

  const handelBackToAddShop = () => {
    setIsEditShop(false);
    setBanner(null);
    setLatitude('');
    setLongitude('');
    setName('');
    setImagePreview(null);
    setItems([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setBanner(reader.result);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchInput(value);
  
    if (value.trim() === '') {
      // If the search input is empty, display all shops
      setShopLocations(allshopLocations);
    } else {
      // Filter the allshopLocations based on the search input
      const results = allshopLocations.filter((shop) =>
        shop && shop.name && shop.name.toLowerCase().includes(value)
      );
      setShopLocations(results);
    }
  };
  
  
  
    

  return (
    <div className='dashboard'>
      {loading && <Loader />}
      <nav>
        <span style={{display:"flex",gap:"30px",alignItems:"center"}}>

        <h1><Link ro="/admin">Dashboard</Link></h1>
        <h1><Link to="/"> Map</Link></h1>
        </span>
        <button onClick={logout}>Logout</button>
      </nav>

      <div className='addShop'>
        {isEditShop ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <BiArrowBack
              fontSize={22}
              onClick={handelBackToAddShop}
              style={{ cursor: 'pointer' }}
            />
            <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>
              Update Shop
            </h2>
          </div>
        ) : (
          <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>
            Add Shop Location
          </h2>
        )}
        <input
          type='text'
          placeholder='Shop Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type='text'
          placeholder='Latitude'
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <input
          type='text'
          placeholder='Longitude'
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
        <div className='itemsSection'>
          <div
            className='addItemRow'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              marginTop: '30px',
            }}
          >
            <span>Add Item</span>
            <FaPlus className='addItemIcon'  onClick={handleAddItem} />
          </div>
        </div>
        {items.map((item, index) => (
          <div key={item.id} className='itemRow' style={{ width: '80%' }}>
            <input
              type='text'
              placeholder='Item Name'
              value={item.name}
              onChange={(e) => handleItemNameChange(index, e.target.value)}
            />
            <input
              type='number'
              placeholder='Price'
              value={item.price}
              onChange={(e) => handleItemPriceChange(index, e.target.value)}
            />
            <FaTimes
              className='closeIcon'
              onClick={() => handleRemoveItem(item._id)}
              style={{cursor:"pointer"}}
            />
          </div>
        ))}

        <label htmlFor='fileInput' className='customFileInput'>
          Choose Image
          <input
            id='fileInput'
            type='file'
            accept='image/*'
            onChange={handleImageUpload}
          />
        </label>
        {imagePreview && (
          <div className='imagePreview'>
            <img src={imagePreview} alt='Preview' />
          </div>
        )}

        {isEditShop ? (
          <button onClick={() => handleUpdateShop(latitude, longitude)}>
            Update Shop
          </button>
        ) : (
          <button onClick={addShopLocation}>Add Shop</button>
        )}
      </div>

      <div className='shopActions'>
        <h2>Shop Locations</h2>
        <div className='searchContainer'>
          <input
            type='text'
            placeholder='Search by name'
            value={searchInput}
            onChange={handleSearch}
            style={{borderBottom:"1px solid black",textAlign:"center",outline:"none"}}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Items</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {shopLocations.length > 0 ? (
  shopLocations.map((shop) => (
    <tr key={shop?._id}>
      {shop && ( // Add this condition to check if shop exists
        <>
          <td>{shop?.name}</td>
          <td>
            {shop?.items.map((item) => (
              <div key={item._id}>
                <b>{item?.name}</b>
                <br />
                <span>${item?.price}</span>
                <br />
              </div>
            ))}
          </td>
          <td>{shop?.latitude}</td>
          <td>{shop?.longitude}</td>
          <td className='actions'>
            <FaEdit
              className='editIcon'
              onClick={() => handleEditShop(shop?.latitude, shop?.longitude,shop?._id)}
            />
            <br />
            <FaTrash
              className='deleteIcon'
              onClick={() => handleDeleteShop(shop?.latitude, shop?.longitude, shop?.image)}
            />
          </td>
        </>
      )}
    </tr>
  ))
) : (
  <tr>
    <td style={{ textAlign: "center" }} colSpan={5}>No shop locations found</td>
  </tr>
)}

</tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
