import { BrowserRouter,Routes,Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import Doctor from "./components/doctor";
import Patient from "./components/patient";
import Navbar from "./components/navbar";
function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/reg" element={<Register/>}/>
      <Route path="/doc" element={<Doctor/>}/>
      <Route path="/pat" element={<Patient/>}/>
      
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;