import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/globalContext";
import { User, Mail, Lock, Camera, Check, Shield, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { API_BASE_URL } from "../../config";

const Profile = () => {
  const { updateProfile } = useGlobalContext();
  const storedUsername = localStorage.getItem("username") || "";
  const [form, setForm] = useState({ username: storedUsername, email: "", password: "", confirmPassword: "" });
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.avatar) setAvatarPreview(`${API_BASE_URL.replace('/api', '')}${data.avatar}`);
          if (data.email) setForm(f => ({ ...f, email: data.email }));
        })
        .catch(() => { });
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile image updated!");
        setAvatarPreview(`${API_BASE_URL.replace('/api', '')}${data.avatarUrl}`);
        setAvatarFile(null);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const payload = {};
    if (form.username) payload.username = form.username;
    if (form.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    
    const result = await updateProfile(payload);
    setLoading(false);
    if (result) { 
      setSaved(true); 
      setTimeout(() => setSaved(false), 3000); 
      localStorage.setItem("username", form.username);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Personalize your profile and secure your account.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-24 bg-primary-600 w-full" />
            <CardContent className="pt-0 flex flex-col items-center -mt-12">
              <div className="relative group">
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-primary-600">{storedUsername ? storedUsername[0].toUpperCase() : 'U'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white h-6 w-6" />
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{storedUsername}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{form.email || 'No email set'}</p>
              </div>

              {avatarFile && (
                <Button 
                  onClick={handleUploadAvatar} 
                  disabled={uploading} 
                  size="sm" 
                  className="mt-4 w-full"
                >
                  {uploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                  Save New Photo
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-primary-50 dark:bg-primary-900/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Account Security</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Make sure your password is at least 8 characters long and includes special characters.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                      <User className="h-3 w-3" /> Username
                    </label>
                    <Input name="username" value={form.username} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email Address
                    </label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Security & Password</h4>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Lock className="h-3 w-3" /> New Password
                      </label>
                      <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Lock className="h-3 w-3" /> Confirm Password
                      </label>
                      <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <AnimatePresence>
                    {saved && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-emerald-600 text-sm font-bold"
                      >
                        <Check className="h-4 w-4" /> Changes saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button type="submit" disabled={loading} className="ml-auto min-w-[150px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Profile Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
