import {BrowserRouter, Routes, Route} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Organization from "./pages/Organization";
import Members from "./pages/Members";
import OrganizationDetails from "./pages/OrganizationDetails";


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
                   element={
                  <ProtectedRoute>
                  <Dashboard />
                  </ProtectedRoute>
               }
             />
    
                <Route
                        path="/organizations"
                        element={
                            <ProtectedRoute>
                                <Organization />
                            </ProtectedRoute>
                        }
                    />

          <Route
                   path="/organizations/:organizationId"
                  element={
                 <ProtectedRoute>
                <OrganizationDetails />
              </ProtectedRoute>
            }
           />
         <Route
              path="/organizations/:organizationId/members"
              element={
              <ProtectedRoute>
              <Members />
            </ProtectedRoute>
    }
/>

                </Route>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                   path="/register"
                   element={<Register />}
                  />

            </Routes>

        </BrowserRouter>
    );
}

export default App;