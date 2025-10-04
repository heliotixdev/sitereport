"use client";
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, Globe, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

const SitePerformanceDashboard = ({ preloadedData,view }) => {
  console.log(view);
  const [siteData, setSiteData] = useState(preloadedData || null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#eab308'
  };

 const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file.name);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        
        // Read Site Info
        const siteSheet = workbook.Sheets['Site Info'];
        const siteInfo = XLSX.utils.sheet_to_json(siteSheet)[0];
        
        // Read Performance Data
        const perfSheet = workbook.Sheets['Performance'];
        const perfData = XLSX.utils.sheet_to_json(perfSheet)[0];
        
        // Read Issues
        const issuesSheet = workbook.Sheets['Issues'];
        const issues = XLSX.utils.sheet_to_json(issuesSheet);

        setSiteData({
          siteInfo,
          performance: perfData,
          issues
        });
        
      } catch (error) {
        alert('Error reading file. Please check the Excel format.');
        console.error(error);
      }
    };
 const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });

      if (!res.ok) console.log("Data not saved");
    reader.readAsBinaryString(file);
  };

  const getIssuesByPriority = () => {
    if (!siteData?.issues) return [];
    
    const counts = { high: 0, medium: 0, low: 0 };
    siteData.issues.forEach(issue => {
      const priority = issue.Priority?.toLowerCase();
      if (counts.hasOwnProperty(priority)) {
        counts[priority]++;
      }
    });

    return [
      { name: 'High', value: counts.high, color: COLORS.high },
      { name: 'Medium', value: counts.medium, color: COLORS.medium },
      { name: 'Low', value: counts.low, color: COLORS.low }
    ];
  };

  const getSpeedData = () => {
    if (!siteData?.performance) return [];
    
    return [
      { 
        name: 'Mobile', 
        speed: parseInt(siteData.performance['Mobile Speed']) || 0 
      },
      { 
        name: 'Desktop', 
        speed: parseInt(siteData.performance['Desktop Speed']) || 0 
      }
    ];
  };

  const getIssueIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Site Performance Dashboard</h1>
            </div>
            {view !== "c" && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
                <Upload className="w-5 h-5" />
                <span>Upload Excel</span>
              </div>
            </label>)}
          </div>
          {uploadedFile && (
            <p className="mt-3 text-sm text-gray-600">Loaded: {uploadedFile}</p>
          )}
        </div>

        {!siteData ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            {view !== "c" ?
            <>
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Upload Excel File</h2>
            <p className="text-gray-500">Upload your site performance Excel file to visualize the data</p>
            </>: 
            "No Record Found"}
          </div>
        ) : (
          <>
            {/* Site Information */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Site Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-l-4 border-indigo-600 pl-4">
                  <p className="text-sm text-gray-600">Website URL</p>
                  <p className="text-lg font-semibold text-gray-800">{siteData.siteInfo['Website URL']}</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-gray-600">Client Name</p>
                  <p className="text-lg font-semibold text-gray-800">{siteData.siteInfo['Client Name']}</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-600">Audit Date</p>
                  <p className="text-lg font-semibold text-gray-800">{siteData.siteInfo['Audit Date']}</p>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Speed Scores - Circular Gauges */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Speed Performance</h3>
                
                {/* Mobile Speed Gauge */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Mobile Speed</p>
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#e5e7eb"
                          strokeWidth="16"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke={siteData.performance['Mobile Speed'] >= 90 ? '#10b981' : 
                                 siteData.performance['Mobile Speed'] >= 50 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - siteData.performance['Mobile Speed'] / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(siteData.performance['Mobile Speed'])}`}>
                          {siteData.performance['Mobile Speed']}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {siteData.performance['Mobile Speed'] >= 90 ? 'Excellent' :
                           siteData.performance['Mobile Speed'] >= 50 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-red-100 via-orange-100 to-green-100 h-2 rounded-full relative">
                    <div 
                      className="absolute top-0 w-1 h-4 bg-gray-800 rounded transform -translate-y-1"
                      style={{ left: `${siteData.performance['Mobile Speed']}%`, transition: 'left 1s ease-out' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Desktop Speed Gauge */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Desktop Speed</p>
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#e5e7eb"
                          strokeWidth="16"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke={siteData.performance['Desktop Speed'] >= 90 ? '#10b981' : 
                                 siteData.performance['Desktop Speed'] >= 50 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - siteData.performance['Desktop Speed'] / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(siteData.performance['Desktop Speed'])}`}>
                          {siteData.performance['Desktop Speed']}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {siteData.performance['Desktop Speed'] >= 90 ? 'Excellent' :
                           siteData.performance['Desktop Speed'] >= 50 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-red-100 via-orange-100 to-green-100 h-2 rounded-full relative">
                    <div 
                      className="absolute top-0 w-1 h-4 bg-gray-800 rounded transform -translate-y-1"
                      style={{ left: `${siteData.performance['Desktop Speed']}%`, transition: 'left 1s ease-out' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Average Score */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Average Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2)}`}>
                    {Math.round((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2)}
                  </p>
                  <div className="flex justify-center gap-1 mt-2">
                    {[90, 50, 0].map((threshold, idx) => (
                      <span key={idx} className="text-lg">
                        {((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2) >= threshold ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Issues by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getIssuesByPriority()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getIssuesByPriority().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {getIssuesByPriority().map((item) => (
                    <div key={item.name} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{item.name}</p>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h3>
                
                {/* Mobile vs Desktop Comparison */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Speed Comparison</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Mobile</span>
                        <span className={`font-bold ${getScoreColor(siteData.performance['Mobile Speed'])}`}>
                          {siteData.performance['Mobile Speed']}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${siteData.performance['Mobile Speed']}%`,
                            backgroundColor: siteData.performance['Mobile Speed'] >= 90 ? '#10b981' : 
                                           siteData.performance['Mobile Speed'] >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Desktop</span>
                        <span className={`font-bold ${getScoreColor(siteData.performance['Desktop Speed'])}`}>
                          {siteData.performance['Desktop Speed']}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${siteData.performance['Desktop Speed']}%`,
                            backgroundColor: siteData.performance['Desktop Speed'] >= 90 ? '#10b981' : 
                                           siteData.performance['Desktop Speed'] >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Issues</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {siteData.issues.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">High Priority</p>
                    <p className="text-3xl font-bold text-red-600">
                      {siteData.issues.filter(i => i.Priority?.toLowerCase() === 'high').length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Medium Priority</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {siteData.issues.filter(i => i.Priority?.toLowerCase() === 'medium').length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Low Priority</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {siteData.issues.filter(i => i.Priority?.toLowerCase() === 'low').length}
                    </p>
                  </div>
                </div>

                {/* Performance Score Circle */}
                <div className="mt-6 flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2) >= 90 ? '#10b981' : 
                               ((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2) >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - ((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 200))}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold ${getScoreColor((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2)}`}>
                        {Math.round((siteData.performance['Mobile Speed'] + siteData.performance['Desktop Speed']) / 2)}
                      </span>
                      <span className="text-xs text-gray-500">Overall</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Issues Details</h3>
              <div className="space-y-3">
                {siteData.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="border-l-4 p-4 rounded-r-lg hover:bg-gray-50 transition"
                    style={{ borderColor: COLORS[issue.Priority?.toLowerCase()] }}
                  >
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.Priority)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{issue.Issue}</h4>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: COLORS[issue.Priority?.toLowerCase()] }}
                          >
                            {issue.Priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.Description}</p>
                        <p className="text-sm text-indigo-600 font-medium">
                          Recommendation: {issue.Recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SitePerformanceDashboard;