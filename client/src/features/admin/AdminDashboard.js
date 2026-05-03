import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/globalContext";
import * as XLSX from "xlsx";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  FileText, 
  Download, 
  X, 
  Send,
  Loader2,
  Table as TableIcon
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { cn } from "../../lib/utils";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { getUsers, users, addUser, deleteUser, fetchUserTransactions, transactions } = useGlobalContext();

  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [reportType, setReportType] = useState("yearly");
  const [combinedView, setCombinedView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailDetails, setEmailDetails] = useState({ email: "", subject: "", message: "" });
  
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleEmailChange = (e) => {
    setEmailDetails({ ...emailDetails, [e.target.name]: e.target.value });
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error("All fields are required!");
      return;
    }
    setLoading(true);
    await addUser(newUser);
    setLoading(false);
    setNewUser({ username: "", email: "", password: "" });
    toast.success("User added successfully!");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
      toast.success("User deleted.");
    }
  };

  const handleShowTransactions = async (userId) => {
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
    await fetchUserTransactions(userId);
    setShowTransactions(true);
  };

  const filterTransactionsByDate = (txList) => {
    if (!txList) return [];
    const now = new Date();
    let startDate;
    switch (reportType) {
      case "weekly": startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case "monthly": startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case "yearly": startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(0);
    }
    return txList.filter(t => new Date(t.date) >= startDate);
  };

  const combinedTransactions = () => {
    const incomes = transactions.incomes || [];
    const expenses = transactions.expenses || [];
    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const downloadExcelReport = (data, type) => {
    const ws = XLSX.utils.json_to_sheet(data.map(t => ({
      Title: t.title,
      Type: t.type,
      Amount: t.amount,
      Date: new Date(t.date).toLocaleDateString(),
      Category: t.category
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Report`);
    XLSX.writeFile(wb, `${selectedUser?.username || 'User'}_${type}_report.xlsx`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage users and monitor system activity.</p>
        </div>
        <div className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Users className="h-5 w-5" />
          <span className="font-bold">{users.length} Total Users</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: User Management */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-600" />
                Add New User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <Input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-600" />
                Quick Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input name="email" placeholder="User Email" value={emailDetails.email} onChange={handleEmailChange} />
                <Input name="subject" placeholder="Subject" value={emailDetails.subject} onChange={handleEmailChange} />
                <textarea 
                  name="message" 
                  placeholder="Message content..." 
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-sm min-h-[100px]"
                  value={emailDetails.message} 
                  onChange={handleEmailChange} 
                />
                <Button variant="outline" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: User List */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="text-lg">Platform Users</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium">No users found.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold">
                              {user.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleShowTransactions(user._id)} className="h-8 w-8 p-0" title="View Transactions">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setEmailDetails(prev => ({ ...prev, email: user.email })); toast.info("Email address copied to form"); }} 
                              className="h-8 w-8 p-0"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user._id)} className="h-8 w-8 p-0 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Transactions Modal */}
      {showTransactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-none shadow-2xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800">
              <CardTitle>Activity: {selectedUser?.username}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTransactions(false)} className="rounded-full h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-0">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  {['weekly', 'monthly', 'yearly'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setReportType(t)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                        reportType === t ? "bg-primary-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCombinedView(!combinedView)}>
                    <TableIcon className="mr-2 h-3 w-3" /> {combinedView ? "Separate View" : "Combined View"}
                  </Button>
                  <Button size="sm" onClick={() => downloadExcelReport(combinedTransactions(), reportType)}>
                    <Download className="mr-2 h-3 w-3" /> Excel
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <TransactionTable 
                  data={filterTransactionsByDate(combinedView ? combinedTransactions() : (transactions.incomes || []))} 
                  title={combinedView ? "History" : "Incomes"} 
                />
                {!combinedView && (
                  <div className="mt-8">
                    <TransactionTable 
                      data={filterTransactionsByDate(transactions.expenses || [])} 
                      title="Expenses" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const TransactionTable = ({ title, data }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
      {title}
    </h4>
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-widest">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No records found.</td></tr>
          ) : (
            data.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.title}</td>
                <td className="px-4 py-3 text-slate-500 uppercase font-medium">{t.category || 'Other'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                <td className={cn(
                  "px-4 py-3 text-right font-black",
                  t.type === 'expense' ? "text-red-600" : "text-emerald-600"
                )}>
                  {t.type === 'expense' ? '-' : '+'}₹{Math.abs(t.amount).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;
