import { useEffect } from 'react';
import axios from 'axios';


useEffect(() => {
  axios.get('http://localhost:3000/')
    .then(res => console.log("Backend response:", res.data))
    .catch(err => console.error("Connection error:", err));
}, []);