import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from '@/components/organisms/Layout'
import Dashboard from '@/components/pages/Dashboard'
import ReceiveVaccines from '@/components/pages/ReceiveVaccines'
import Inventory from '@/components/pages/Inventory'
import RecordAdministration from '@/components/pages/RecordAdministration'
import Reconciliation from '@/components/pages/Reconciliation'
import LossReporting from '@/components/pages/LossReporting'
import Reports from '@/components/pages/Reports'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/receive-vaccines" element={<ReceiveVaccines />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/record-administration" element={<RecordAdministration />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/loss-reporting" element={<LossReporting />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  )
}

export default App