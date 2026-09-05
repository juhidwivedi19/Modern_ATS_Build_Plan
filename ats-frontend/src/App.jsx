import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Organization from "./pages/Organization";
import Members from "./pages/Members";
import OrganizationDetails from "./pages/OrganizationDetails";
import Departments from "./pages/Departments";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Candidates from "./pages/Candidates";
import CandidateSearch from "./pages/CandidateSearch";
import CandidateProfile from "./pages/CandidateProfile";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import Resumes from "./pages/Resumes";
import ApplicationDetails from "./pages/ApplicationDetails";
import JobApplications from "./pages/JobApplications";
import InterviewScheduling from "./pages/InterviewScheduling";


function App() {
    return (
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

                    <Route
                        path="/organizations/:organizationId/departments"
                        element={
                            <ProtectedRoute>
                                <Departments />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/organizations/:organizationId/jobs"
                        element={
                       <ProtectedRoute>
                       <Jobs />
                       </ProtectedRoute>
                      }
                      />

                      <Route
                          path="/organizations/:organizationId/jobs/:jobId"
                            element={
                        <ProtectedRoute>
                       <JobDetails />
                      </ProtectedRoute>
    }
/>

<Route
    path="/candidates/profile"
    element={
        <ProtectedRoute>
            <CandidateProfile />
        </ProtectedRoute>
    }
/>


                 <Route
    path="/candidates"
    element={
        <ProtectedRoute>
            <Candidates />
        </ProtectedRoute>
    }
/>


                    <Route
                        path="/candidates/search"
                           element={
                      <ProtectedRoute>
                      <CandidateSearch />
                      </ProtectedRoute>
                     }
                    />
              <Route
                 path="/applications"
                 element={
                 <ProtectedRoute>
                <Applications />
                </ProtectedRoute>
                  }
/>

<Route
    path="/resumes"
    element={
        <ProtectedRoute>
            <Resumes />
        </ProtectedRoute>
    }
/>

<Route
    path="/applications/:applicationId"
    element={
        <ProtectedRoute>
            <ApplicationDetails />
        </ProtectedRoute>
    }
/>

<Route
    path="/organizations/:organizationId/jobs/:jobId/applications"
    element={
        <ProtectedRoute>
            <JobApplications />
        </ProtectedRoute>
    }
/>

<Route
    path="/applications/:applicationId/activity"
    element={
        <ProtectedRoute>
            <ApplicationActivity />
        </ProtectedRoute>
    }
/>

<Route
    path="/applications/:applicationId/interview/schedule"
    element={
        <ProtectedRoute>
            <InterviewScheduling />
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

                <Route
    path="/jobs/:jobId/apply"
    element={
        <ProtectedRoute>
            <ApplyJob />
        </ProtectedRoute>
    }
/>

            </Routes>
        </BrowserRouter>
    );
}

export default App;