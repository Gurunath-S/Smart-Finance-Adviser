import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../../context/globalContext";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

const ForgotPassword = () => {
    const { forgotPassword } = useGlobalContext();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await forgotPassword(email);
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Card className="w-full max-w-md border-none shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                                <CheckCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">Reset link sent! Please check your inbox for instructions.</p>
                            </div>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Back to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                                No worries! Enter your email below and we'll send you a link to reset your password.
                            </p>
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                            </Button>
                            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mt-4">
                                <ArrowLeft className="h-4 w-4" /> Back to Login
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
