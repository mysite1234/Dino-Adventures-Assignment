"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ChevronRight, Key, Timer } from "lucide-react";
import { login, register, sendOTP, verifyOTP } from "../services/auth.service";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [useOTP, setUseOTP] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", otp: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  
  // Use ref to track timer interval
  const timerRef = useRef(null);

  // Timer effect - improved with ref
  useEffect(() => {
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timer]);

  // Function to stop timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(0);
  };

  const updateForm = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const validate = () => {
    if (useOTP) {
      if (!form.email || !form.otp) {
        toast.error("Email and OTP required");
        return false;
      }
      if (form.otp.length !== 6) {
        toast.error("OTP must be 6 digits");
        return false;
      }
    } else {
      if (!form.email || !form.password) {
        toast.error("Email and password required");
        return false;
      }
      if (!isLogin && form.password !== form.confirmPassword) {
        toast.error("Passwords don't match");
        return false;
      }
      if (!isLogin && form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!form.email) return toast.error("Email required");
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast.error("Please enter a valid email");
    }

    setOtpLoading(true);
    try {
      const response = await sendOTP({ email: form.email });
      
      // Check for different response structures
      if (response.data?.message || response.message) {
        toast.success(response.data?.message || response.message || "OTP sent!", { 
          duration: 2000,
          icon: '📧'
        });
      } else {
        toast.success("OTP sent to your email!", { 
          duration: 2000,
          icon: '📧'
        });
      }
      
      setOtpSent(true);
      setTimer(60); // Start 60-second timer
      
    } catch (err) {
      console.error("Send OTP error:", err);
      
      // More detailed error handling
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to send OTP";
      
      toast.error(errorMessage, { 
        duration: 3000,
        style: {
          background: '#dc2626',
          color: 'white',
        }
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Stop timer immediately when submit is clicked (for OTP)
    if (useOTP) {
      stopTimer();
    }

    setLoading(true);
    try {
      if (useOTP) {
        // OTP verification - call verifyOTP endpoint
        const res = await verifyOTP({ 
          email: form.email, 
          otp: form.otp 
        });
        
        // Handle different response structures
        let token;
        let userData;
        
        if (res.data?.token?.token) {
          // Structure: { token: { token: "...", user: {...} } }
          token = res.data.token.token;
          userData = res.data.token.user;
        } else if (res.data?.token) {
          // Structure: { token: "..." }
          token = res.data.token;
          userData = res.data.user || res.data.token?.user;
        } else if (res.token) {
          // Structure: { token: "...", user: {...} }
          token = res.token.token || res.token;
          userData = res.token.user || res.user;
        }
        
        if (!token) {
          console.error("No token found in response:", res);
          throw new Error("No authentication token received");
        }
        
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        
        // Store user info if available
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }
        
        toast.success("Welcome! Redirecting...", { 
          duration: 1000,
          icon: '👋'
        });
        
        // Clear form and timer
        setForm({ email: "", password: "", confirmPassword: "", otp: "" });
        setOtpSent(false); // Reset otpSent state
        
        // Wait for toast to show, then refresh and redirect
        setTimeout(() => {
          window.location.reload(); // Full page refresh
          router.push("/"); // Then redirect
        }, 1000);
        
      } else {
        if (isLogin) {
          // LOGIN with password
          const res = await login({ 
            email: form.email, 
            password: form.password 
          });
          
          let token;
          let userData;
          
          if (res.data?.token?.token) {
            token = res.data.token.token;
            userData = res.data.token.user;
          } else if (res.data?.token) {
            token = res.data.token;
            userData = res.data.user || res.data.token?.user;
          } else if (res.token) {
            token = res.token.token || res.token;
            userData = res.token.user || res.user;
          }
          
          if (!token) {
            console.error("No token found in login response:", res);
            throw new Error("No authentication token received");
          }
          
          localStorage.setItem("token", token);
          localStorage.setItem("isAuthenticated", "true");
          
          if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
          }
          
          toast.success("Welcome back! Redirecting...", { 
            duration: 1000,
            icon: '👋'
          });
          
          // Clear form
          setForm({ email: "", password: "", confirmPassword: "", otp: "" });
          
          // Wait for toast to show, then refresh and redirect
          setTimeout(() => {
            window.location.reload(); // Full page refresh
            router.push("/"); // Then redirect
          }, 1000);
          
        } else {
          // REGISTER
          const res = await register({ 
            email: form.email, 
            password: form.password,
            confirmPassword: form.confirmPassword
          });
          
          toast.success(
            <div>
              <div className="font-semibold">Registration Successful!</div>
              <div className="text-sm opacity-90">
                Account created for: {form.email}
              </div>
              <div className="text-xs opacity-80 mt-1">
                Please login with your credentials
              </div>
            </div>, 
            { 
              duration: 2000,
              icon: '✅'
            }
          );
          
          // Clear form, stop timer, and switch to login mode after 2 seconds
          setTimeout(() => {
            setIsLogin(true);
            setForm({ email: "", password: "", confirmPassword: "", otp: "" });
            stopTimer();
            setUseOTP(false);
            setOtpSent(false);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Authentication failed";
      
      toast.error(errorMessage, { 
        duration: 2000,
        style: {
          background: '#dc2626',
          color: 'white',
        }
      });
      
      // Restart timer if OTP verification failed
      if (useOTP && otpSent) {
        setTimer(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ email: "", password: "", confirmPassword: "", otp: "" });
    setUseOTP(false);
    setOtpSent(false);
    stopTimer(); // Stop timer when switching modes
  };

  const toggleAuthMethod = () => {
    if (!isLogin) {
      toast.error("OTP login is only available for existing users");
      return;
    }
    setUseOTP(!useOTP);
    setForm(p => ({ ...p, otp: "", password: "", confirmPassword: "" }));
    setOtpSent(false);
    stopTimer(); // Stop timer when switching auth methods
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { 
            fontSize: "13px", 
            padding: "10px 14px", 
            maxWidth: "320px",
            background: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '8px'
          } 
        }} 
      />
      
      <div className="w-full max-w-xs">
        <div className="bg-white rounded-xl border border-gray-300 shadow-md">
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{isLogin ? "Sign In" : "Sign Up"}</h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isLogin ? (useOTP ? "With OTP" : "With password") : "Create new account"}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLogin ? (useOTP ? "bg-blue-100" : "bg-indigo-100") : "bg-purple-100"}`}>
                {isLogin && useOTP ? <Key className="w-4 h-4 text-blue-600" /> : 
                 isLogin ? <Mail className="w-4 h-4 text-indigo-600" /> : 
                 <Mail className="w-4 h-4 text-purple-600" />}
              </div>
            </div>

            {/* Login/Register Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 mb-4 border border-gray-200">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${isLogin ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "text-gray-600 hover:text-gray-900"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${!isLogin ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-600 hover:text-gray-900"}`}
              >
                Register
              </button>
            </div>

            {/* Auth Method Toggle (Only show for login) */}
            {isLogin && (
              <div className="flex items-center justify-center mb-3">
                <button
                  onClick={toggleAuthMethod}
                  className="text-xs text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
                >
                  {useOTP ? "Use password login" : "Use OTP login"}
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 pb-5">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {useOTP ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>OTP</span>
                      {timer > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Timer className="w-3 h-3" />
                          {formatTime(timer)}
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={form.otp}
                          onChange={(e) => updateForm("otp", e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                          inputMode="numeric"
                          pattern="\d{6}"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || timer > 0}
                        className={`px-3 text-xs rounded-lg transition-colors whitespace-nowrap border ${timer > 0 ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200'}`}
                      >
                        {otpLoading ? (
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-2"></div>
                        ) : timer > 0 ? (
                          formatTime(timer)
                        ) : otpSent ? (
                          "Resend"
                        ) : (
                          "Get OTP"
                        )}
                      </button>
                    </div>
                    {/* Only show OTP expired message when timer is 0 AND we're not in the middle of verification */}
                    {otpSent && timer === 0 && !loading && (
                      <p className="text-xs text-amber-600 mt-1">OTP expired. Click Resend to get a new code.</p>
                    )}
                    {/* Only show active OTP message when timer > 0 */}
                    {otpSent && timer > 0 && (
                      <p className="text-xs text-green-600 mt-1">Enter the OTP sent to your email within {timer} seconds</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder={isLogin ? "Your password" : "Min 6 characters"}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type={showPass ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(e) => updateForm("confirmPassword", e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {isLogin && !useOTP && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 mt-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border shadow-sm ${useOTP ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-700' : isLogin ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-purple-700'}`}
              >
                <div className="relative flex items-center justify-center gap-1.5">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>
                        {useOTP ? "Verifying..." : isLogin ? "Signing in..." : "Creating Account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {useOTP ? "Verify OTP" : isLogin ? "Sign In" : "Sign Up"}
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-center text-gray-600">
                {isLogin ? "New user?" : "Have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  disabled={loading}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}