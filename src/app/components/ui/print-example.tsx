"use client";

import React from 'react';
import { PrintButton, PrintWrapper, usePrint } from './print-button';
import { Card } from './card';

// Example 1: Using PrintButton component
export const SimplePrintExample = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Simple Print Example</h2>
      
      <PrintButton
        printTitle="My Document"
        buttonText="Print Document"
        variant="default"
        className="mb-4"
      >
        <div className="p-6 bg-white">
          <h1 className="text-2xl font-bold mb-4">Document Title</h1>
          <p className="text-gray-700 mb-4">
            This is the content that will be printed when you click the print button.
          </p>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Footer information</p>
          </div>
        </div>
      </PrintButton>
    </div>
  );
};

// Example 2: Using PrintWrapper with custom button
export const CustomPrintExample = () => {
  const { componentRef, handlePrint } = usePrint("Custom Document");

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom Print Example</h2>
      
      <button
        onClick={handlePrint}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Custom Print Button
      </button>

      <PrintWrapper ref={componentRef}>
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Custom Document</h1>
          <div className="space-y-4">
            <p>This content will be printed using a custom button.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Column 1</h3>
                <p>Some content here</p>
              </div>
              <div>
                <h3 className="font-semibold">Column 2</h3>
                <p>More content here</p>
              </div>
            </div>
          </div>
        </Card>
      </PrintWrapper>
    </div>
  );
};

// Example 3: Print with callbacks
export const PrintWithCallbacksExample = () => {
  const handleBeforePrint = () => {
    console.log("About to print...");
  };

  const handleAfterPrint = () => {
    console.log("Print completed!");
  };

  const handlePrintError = (errorLocation: string, error: Error) => {
    console.error("Print error:", errorLocation, error);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Print with Callbacks Example</h2>
      
      <PrintButton
        printTitle="Document with Callbacks"
        onBeforePrint={handleBeforePrint}
        onAfterPrint={handleAfterPrint}
        onPrintError={handlePrintError}
        variant="secondary"
        className="mb-4"
      >
        <div className="p-6 bg-gray-50">
          <h1 className="text-2xl font-bold mb-4">Document with Callbacks</h1>
          <p>This document will trigger callbacks when printing.</p>
          <ul className="mt-4 space-y-2">
            <li>• Check console for before/after print messages</li>
            <li>• Error handling is included</li>
            <li>• Custom styling for print</li>
          </ul>
        </div>
      </PrintButton>
    </div>
  );
};

// Example 4: Print table/report
export const PrintTableExample = () => {
  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Print Table Example</h2>
      
      <PrintButton
        printTitle="User Report"
        buttonText="Print Report"
        variant="outline"
        className="mb-4"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">User Report</h1>
          <p className="text-gray-600 mb-4">Generated on: {new Date().toLocaleDateString()}</p>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-sm text-gray-500">
            Total records: {sampleData.length}
          </div>
        </div>
      </PrintButton>
    </div>
  );
};
