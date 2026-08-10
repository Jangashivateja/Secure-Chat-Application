import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verify2FALoginRoute, setPublicKeyRoute } from "../utils/APIRoutes";
import { ensureE2EEKeyPair } from "../utils/e2ee";

export default function TwoFactorLoginVerify() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    // Route Guard: Prevent manual URL bypass
    const tempUser = sessionStorage.getItem("temp_2fa_user");
    if (!tempUser) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (token.length !== 6) {
      toast.error("Token must be exactly 6 digits.", toastOptions);
      return;
    }

    const tempUser = JSON.parse(sessionStorage.getItem("temp_2fa_user"));
    
    try {
      const { data } = await axios.post(verify2FALoginRoute, {
        userId: tempUser._id,
        token,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      } else if (data.status === true) {
        // Validation successful: Upgrade session to persistent storage
        sessionStorage.removeItem("temp_2fa_user");
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data.user)
        );

        // Initialize E2EE for the verified user
        const { publicKeyJwk } = await ensureE2EEKeyPair(data.user._id);
        await axios.post(`${setPublicKeyRoute}/${data.user._id}`, {
          publicKey: publicKeyJwk,
        });

        navigate("/");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.", toastOptions);
    }
  };

  return (
    <>
      <Container>
        <form onSubmit={handleSubmit}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>2FA Verification</h1>
          </div>
          <p className="instruction">Enter the 6-digit code from your authenticator app.</p>
          <input
            type="text"
            placeholder="000000"
            maxLength="6"
            name="token"
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            value={token}
          />
          <button type="submit">Verify</button>
        </form>
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #131324;
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img { height: 5rem; }
    h1 { color: white; text-transform: uppercase; }
  }
  
  .instruction {
    color: white;
    text-align: center;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 5rem;
  }
  
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1.5rem;
    text-align: center;
    letter-spacing: 0.5rem;
    &:focus { border: 0.1rem solid #997af0; outline: none; }
  }
  
  button {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
  }
`;