import { useEffect } from 'react';
import axios from 'axios';

useEffect(() => {
  axios.get('http://localhost:5000/test-health')
    .then(res => console.log("Backend response:", res.data))
    .catch(err => console.error("Connection error:", err));
}, []);