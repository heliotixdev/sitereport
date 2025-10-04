'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [sites, setSites] = useState([])
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)

  const fetchSites = async () => {
    const res = await fetch(`/api/admin/sites?password=${password}`)
    if (!res.ok) return alert('Invalid password')
    const data = await res.json()
    setSites(data)
    setAuthorized(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this site report?')) return

    const res = await fetch(`/api/admin/sites/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) return alert('Failed to delete')
    
    setSites(sites.filter(s => s.id !== id))
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {!authorized ? (
        <div className="max-w-sm mx-auto text-center bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            className="border p-2 rounded w-full mb-3 focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={fetchSites}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">All Site Reports</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites?.map((s) => (
              <div
                key={s.id}
                className="p-5 bg-white rounded-lg shadow hover:shadow-lg transition relative group"
              >
                <p><strong>Client:</strong> {s?.siteInfo['Client Name'] || 'N/A'}</p>
                <p><strong>URL:</strong> {s?.siteInfo['Website URL']|| ""}</p>
                <p><strong>Date:</strong> {s?.siteInfo['Audit Date']|| ""}</p>
                <div className="flex justify-between items-center mt-4">
                  <a
                    href={`/site/${s.id}`} target='_blank'
                    className="text-indigo-600 underline hover:text-indigo-800 transition"
                  >
                    View Report
                  </a>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <p className="col-span-full text-center text-gray-500">No site reports available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
