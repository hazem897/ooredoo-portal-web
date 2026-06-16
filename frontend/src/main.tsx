import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Capture d'erreurs globale pour debug mobile
window.onerror = function(msg, _url, lineNo, columnNo, error) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.backgroundColor = 'red';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.zIndex = '9999';
  div.style.fontSize = '12px';
  div.innerText = 'Error: ' + msg + '\nLine: ' + lineNo + '\nCol: ' + columnNo + (error ? '\nDetails: ' + error : '');
  document.body.appendChild(div);
  return false;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
);
