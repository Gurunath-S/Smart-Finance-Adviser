import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useGlobalContext } from "../../context/globalContext";
import { ArrowLeft, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const { resetPassword } = useGlobalContext();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirm) {
            toast.error("Passwords don't match");
            return;
        }
        setLoading(true);
        const success = await resetPassword(token, userId, newPassword);
        setLoading(false);
        if (success) navigate("/login");
    };

    if (!token || !userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                <Card className="w-full max-w-md border-none shadow-2xl text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-500 dark:text-slate-400">This password reset link is invalid or has expired.</p>
                        <Link to="/forgot-password">
                            <Button className="w-full">Request New Link</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Card className="w-full max-w-md border-none shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                            Secure your account by choosing a strong new password.
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
                        </Button>
                        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mt-4">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
