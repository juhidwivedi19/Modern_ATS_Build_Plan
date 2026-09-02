import {BrowserRouter, Routes, Route} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App(){
  return(
       <BrowserRouter>

            <Routes>

                <Route element={<MainLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                </Route>

                <Route
                    path="/login"
                    element={<Login />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;