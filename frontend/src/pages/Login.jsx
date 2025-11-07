import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const backendUrl = '';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const { token, setToken } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [img, setImg] = useState(null); // Initialize as null
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (state === 'Sign Up') {
      if (!name || !email || !password || !birthday || !phone || !address || !gender) {
        toast('Please fill all required fields');
        return;
      }

      // Creating FormData for multipart form submission
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('birthday', birthday);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('gender', gender);
      if (img) {
        formData.append('image', img); // Append the image file
      }

      try {
        const url =`${backendUrl}/api/auth/signup`

const { data } = await axios.post(url, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

        if (data.success) {
          toast(data.message);
          setState('/login');
        } else {
          toast(data.message);
        }
      } catch (error) {
        toast(error.message);
      }
    } else {
      if (!email || !password) {
        toast('Please enter both email and password');
        return;
      }

      try {
        const { data: loginData } = await axios.post(`${backendUrl}/api/auth/signin`, {
          email,
          password,
        });

        if (loginData.success) {
          localStorage.setItem('token', loginData.token); // Set the token
          setToken(loginData.token);
          navigate('/');
        } else {
          toast(loginData.message);
        }
      } catch (error) {
        toast(error.message);
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form className="min-h-[80vh] flex items-center">
      <div className="flex flex-col m-auto p-8 items-start min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </p>
        <p>Please {state === 'Sign Up' ? 'Create Account' : 'Login'} to book appointment</p>

        {state === 'Sign Up' && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="w-full">
              <p>Image</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="file"
                onChange={(e) => setImg(e.target.files[0])} // Set the selected image
              />
            </div>
            <div className="w-full">
              <p>Birthday</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="date"
                onChange={(e) => setBirthday(e.target.value)}
                value={birthday}
              />
            </div>
            <div className="w-full">
              <p>Gender</p>
              <select
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                onChange={(e) => setGender(e.target.value)}
                value={gender}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        {state === 'Sign Up' && (
          <>
            <div className="w-full">
              <p>Phone</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="number"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-full">
              <p>Address</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                placeholder="Address"
                required
              />
            </div>
          </>
        )}

        <button onClick={onSubmitHandler} className="bg-primary text-white w-full rounded-md py-2 text-base mt-2">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span onClick={() => setState('Login')} className="text-primary underline cursor-pointer">
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{' '}
            <span onClick={() => setState('Sign Up')} className="text-primary underline cursor-pointer">
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
