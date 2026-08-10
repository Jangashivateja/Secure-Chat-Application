import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generate2FARoute, enable2FARoute } from "../utils/APIRoutes";


const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchQR = async () => {
      const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!storedUser) return navigate("/login");
      
      const user = JSON.parse(storedUser);
      try {
        const { data } = await axios.post(`${generate2FARoute}/${user._id}`);
        if (data.status) {
          setQrCode(data.qrCode);
          setSecret(data.secret);
        }
      } catch (error) {
        toast.error("Failed to generate 2FA secret.", toastOptions);
      }
    };
    fetchQR();
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (token.length !== 6) return;

    const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    const user = JSON.parse(storedUser);

    try {
      const { data } = await axios.post(`${enable2FARoute}/${user._id}`, { token, secret });
      if (data.status) {
        // Update local state to reflect 2FA is enabled
        user.is2FAEnabled = true;
        localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
        toast.success("2FA successfully enabled.", toastOptions);
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error("Invalid token. Please try again.", toastOptions);
      }
    } catch (error) {
      toast.error("Verification failed.", toastOptions);
    }
  };

  return (
    <>
      <Container>
        <div className="setup-box">
          <h2>Configure 2FA</h2>
          <p>Scan this QR code with Google Authenticator or Authy.</p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" className="qr-code" />}
          
          <form onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              maxLength="6"
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              value={token}
            />
            <button type="submit">Verify & Enable</button>
            <button type="button" className="cancel" onClick={() => navigate("/")}>Cancel</button>
          </form>
        </div>
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #131324;

  .setup-box {
    background-color: #00000076;
    padding: 3rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    color: white;

    .qr-code {
      border: 4px solid white;
      border-radius: 0.5rem;
      background: white;
      width: 200px;
      height: 200px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;

      input {
        padding: 0.8rem;
        border-radius: 0.4rem;
        border: 1px solid #4e0eff;
        background: transparent;
        color: white;
        text-align: center;
        font-size: 1.2rem;
        letter-spacing: 0.2rem;
      }

      button {
        padding: 0.8rem;
        border-radius: 0.4rem;
        border: none;
        background-color: #4e0eff;
        color: white;
        font-weight: bold;
        cursor: pointer;
        text-transform: uppercase;
      }
      
      .cancel {
        background-color: rgb(210, 32, 39);
      }
    }
  }
`;