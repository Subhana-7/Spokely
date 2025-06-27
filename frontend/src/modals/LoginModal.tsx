import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import {login} from '../services/authServices'

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToSignup, 
  onForgotPassword 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleLogin = async() => {
    try{
      const res = await login(formData);
      alert("Login Successful");
      console.log("Token",res.data.token);
      localStorage.setItem("token",res.data.token);
      onClose();
    }catch(err:any){
      alert("Login Failed " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome Back"
      icon={<LogIn className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
        />
        
        <div className="space-y-3 pt-2">
          <Button variant="google" onClick={handleGoogleLogin}>
            Login using Google
          </Button>
          
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        </div>
        
        <div className="text-center space-y-2 pt-2">
          <button
            onClick={onForgotPassword}
            className="block w-full text-gray-800 hover:text-gray-900 font-medium transition-colors"
          >
            Forgot Password?
          </button>
          
          <button
            onClick={onSwitchToSignup}
            className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;