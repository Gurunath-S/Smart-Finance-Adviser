import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { User, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      login(response.data.token, formData.username);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your username and password to access your account
        </p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            name="username"
            placeholder="Username"
            className="pl-10"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="pl-10"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign In
      </Button>
      <div className="text-center">
        <Link 
          to="/forgot-password" 
          className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
