'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PatientFinder() {
  return (
    <div className="flex-1 bg-white h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Patient Finder</h1>
          <Button className="bg-helix-primary hover:bg-helix-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-4">
          <button className="px-4 py-2 text-sm font-medium text-helix-primary border-b-2 border-helix-primary">
            Patient List
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            Recent Patients
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search:"
              className="w-full"
            />
          </div>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Input type="text" placeholder="Search by Name" />
          <Input type="text" placeholder="Search by Home Phone" />
          <Input type="text" placeholder="Search by SSN" />
          <Input type="text" placeholder="Search by Date of Birth" />
          <Input type="text" placeholder="Search by External ID" />
        </div>

        {/* Patient Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Full Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Home Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">SSN</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">External ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <a href="#" className="text-blue-600 hover:underline">Amaan, Naimat</a>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">-</td>
                <td className="px-4 py-3 text-sm text-slate-600">-</td>
                <td className="px-4 py-3 text-sm text-slate-600">1991-01-20</td>
                <td className="px-4 py-3 text-sm text-slate-600">778899</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <a href="#" className="text-blue-600 hover:underline">Belford, Albert None</a>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">+448055462443</td>
                <td className="px-4 py-3 text-sm text-slate-600">-</td>
                <td className="px-4 py-3 text-sm text-slate-600">1972-04-09</td>
                <td className="px-4 py-3 text-sm text-slate-600">26</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <a href="#" className="text-blue-600 hover:underline">Belford, Phil</a>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">333-444-2222</td>
                <td className="px-4 py-3 text-sm text-slate-600">333222333</td>
                <td className="px-4 py-3 text-sm text-slate-600">1972-02-09</td>
                <td className="px-4 py-3 text-sm text-slate-600">1</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded" />
              Open in New Browser Tab
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded" />
              Search with exact method
            </label>
          </div>
          <div className="text-sm text-slate-600">
            Showing 1 to 10 of 28 entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

