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
      (async () => {
        try {
          const response = await fetch('http://localhost:8081/api/v0/auth', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
          });

          if (!response.ok) {
        throw new Error('Failed to refresh token');
          }

          const data = await response.json();

          if (data && data.data) {
        localStorage.setItem('accessToken', data.data);
        setIsValid(true);
        setIsValid(true);
          } else {
        throw new Error('Invalid response data');
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          setIsValid(false);
        }
      })();
    } else {
      setIsValid(true);
    }
  }, []);

  return isValid;
};

export default useIsValidToken;