import { useState } from "react";
import LoginScreen from "./LoginScreen";
import ComplexSelectScreen from "./ComplexSelectScreen";
import PhoneCollectScreen from "./PhoneCollectScreen";
import { loadTodayComplex } from "./ComplexSelectScreen";

type Screen = "login" | "select" | "collect";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedComplex, setSelectedComplex] = useState("");

  const handleLogin = () => {
    const saved = loadTodayComplex();
    if (saved) {
      setSelectedComplex(saved);
      setScreen("collect");
    } else {
      setScreen("select");
    }
  };

  const handleSelectComplex = (name: string) => {
    setSelectedComplex(name);
    setScreen("collect");
  };

  const handleLogout = () => {
    setScreen("login");
    setSelectedComplex("");
  };

  const handleChangeComplex = () => setScreen("select");

  switch (screen) {
    case "login":
      return <LoginScreen onLogin={handleLogin} />;
    case "select":
      return <ComplexSelectScreen onSelect={handleSelectComplex} onLogout={handleLogout} />;
    case "collect":
      return (
        <PhoneCollectScreen
          complexName={selectedComplex}
          onLogout={handleLogout}
          onChangeComplex={handleChangeComplex}
        />
      );
  }
};

export default Index;
