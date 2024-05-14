import NavBar from "./Components/Header/NavBar";
import "./App.css";
import Modal from "react-modal";
import { useEffect, useState } from "react";
import NoticeModal from "./Components/NoticeModal/NoticeModal";

Modal.setAppElement("#root");

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="App">
      <NavBar />
      <NoticeModal isOpen={isModalOpen} onClose={handleModalClose}/>
    </div>
  );
}

export default App;
