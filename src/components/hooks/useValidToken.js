import { useEffect, useState } from 'react';

const useIsValidToken = () => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log(token)
    if (!token) {
      setIsValid(false);
      return; 
    }


    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload)
    const expirationTime = payload.exp * 1000; 
    console.log(payload.exp*1000,Date.now(),Date.now()>=expirationTime)

    if (Date.now() >= expirationTime) {
      fetch('http://localhost:8081/api/v0/auth', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      })
      .then((response) => {
        if (!response.ok) {
        throw new Error('Failed to refresh token');
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.data) {
        localStorage.setItem('accessToken', data.data);
        setIsValid(true);
        } else {
        throw new Error('Invalid response data');
        }
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        setIsValid(false);
      });
    } else {
      setIsValid(true);
    }
  }, []);

  return isValid;
};

export default useIsValidToken;