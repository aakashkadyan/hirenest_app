import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Contact from './pages/Contact'
import Signup from './pages/Signup'
import Help from './pages/Help'
import EditJob from './components/EditJob'
import { ToastContainer, toast } from 'react-toastify'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import ProtectedRoute from './authvalidation/ProtectedRoute'
import JobSeekerForm from './pages/JobSeekerForm.jsx'
import EmployerProfileForm from './pages/EmployerProfileForm.jsx'
import CareerPage from './pages/CareerPage'
import JobDetails from './pages/JobDetails'
import { BrowserRouter as Router,Routes, Route } from "react-router";



function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route exact path ='/' element={<Home/>}></Route>
        <Route exact path ='/about' element={ <About/>}></Route>
        <Route exact path ='/career' element={<CareerPage/>}></Route>
        <Route exact path ='/contact' element={<Contact/>}></Route>
        <Route exact path ='/help' element={<Help/>}></Route>
        <Route exact path ='/login' element={<Login/>}></Route>
        <Route exact path ='/signup' element={<Signup/>}></Route>
        <Route exact path ='/jobseekerdashboard' element={
          <ProtectedRoute allowedRole="jobseeker">
            <JobSeekerDashboard/>
          </ProtectedRoute>
          }></Route>
        <Route exact path ='/employerdashboard' element={
          <ProtectedRoute allowedRole="employer">
            <EmployerDashboard/>
          </ProtectedRoute>
          
          }></Route>
          <Route exact path ='/jobseekerform' element={
          <ProtectedRoute allowedRole="jobseeker">
            <JobSeekerForm/>
          </ProtectedRoute>
          }></Route>
          
          <Route exact path ='/jobs/:jobId' element={
          <ProtectedRoute allowedRole="jobseeker">
            <JobDetails />
          </ProtectedRoute>
          }></Route>
          <Route exact path ='/employerprofileform' element={
          <ProtectedRoute allowedRole="employer">
            <EmployerProfileForm/>
          </ProtectedRoute>
          }></Route>
          
          <Route exact path ='/job/edit/:jobId' element={
          <ProtectedRoute allowedRole="employer">
            <EditJob />
          </ProtectedRoute>
          
          }></Route>
          
          
        </Routes>
        
      </div>

    <ToastContainer position="top-right" autoClose={8000} />
    </Router>
  )
}

export default App
