import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const SignupForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (formData.username.length < 6) return "Username must be at least 6 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email address";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      toast.success("Signup successful! Please log in.");
      onToggle(); // Switch to login mode
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create an account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your details below to create your account
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
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="pl-10"
            value={formData.email}
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
        Sign Up
      </Button>
    </form>
  );
};

export default SignupForm;
