import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TwoFactorSetup from "./components/TwoFactorSetup";
import TwoFactorLoginVerify from "./components/TwoFactorLoginVerify";
import './assets/css/style.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/2fa-verify" element={<TwoFactorLoginVerify />} />
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
