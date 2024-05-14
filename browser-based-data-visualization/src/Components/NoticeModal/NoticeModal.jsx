import "./NoticeModal.css";
import Modal from "react-modal";

export default function NoticeModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Notice"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontStyle: "normal",
          fontSize: "500",
          letterSpacing: "-0.86px",
        },
      }}
    >
      <h3>Blockchain and Geolocation</h3>
      <p>
        There is no direct way to fetch the geographical data of a token holder
        on Polygon Mainnet. Polygon chain much like other blockchains do not
        store user geographical data. One of the core ideas behind blockchain
        technology is anonymity and privacy. There were few ways by which I
        could try to access the data:
      </p>
      <p>
        1. I could check if edgevideo platform shows user's geo location
        publicly and compare those user wallet addresses with their geolocation.
        Issue here is that there's a problem with edgevideo platform while
        registration one of their websockets is having a clash about request's
        origin
      </p>
      <p>
        2. I could take each wallet address and see if they have done any
        transactions on a centralized exchange to see the transaction result and
        figure out the geo location using heatmaps. However the issue is that
        these services don't provide such information unless there's some legal
        binding
      </p>
      <h4>
        In light of all this, I am simply fetching the data and displaying it.
        If you have the geolocation data please send it to me so I can show it
        in a map
      </h4>
      <button onClick={onClose} className="modal--close">
        Close
      </button>
    </Modal>
  );
}
