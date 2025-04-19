import { useEffect, useState } from 'react';

const useIsValidToken = () => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsValid(false);
      return; 
    }


    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload)
    const expirationTime = payload.exp * 1000; 
    console.log(payload.exp*1000,Date.now(),Date.now()>=expirationTime)

    if (Date.now() >= expirationTime) {
      localStorage.removeItem('accessToken'); 
      localStorage.removeItem('userRole')
      setIsValid(false); 
    } else {
      setIsValid(true); 
    }
  }, []);

  return isValid;
};

export default useIsValidToken;