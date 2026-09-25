import React from 'react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 bg-[#232f3e] text-white text-xs select-none">
      {/* Back to top */}
      <div 
        onClick={scrollToTop}
        className="bg-[#37475a] hover:bg-[#485769] py-3.5 text-center text-xs font-semibold cursor-pointer transition"
      >
        Back to top
      </div>

      {/* Main footer content */}
      <div className="max-w-[1500px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-slate-700">
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-white mb-2">Polyglot Architecture</h4>
          <ul className="space-y-1.5 text-gray-300 text-xs">
            <li>PostgreSQL ACID Ledger (klhdb)</li>
            <li>MongoDB Flexible Product Catalog</li>
            <li>Redis TTL Distributed Locking</li>
            <li>pgvector Semantic Similarity Search</li>
            <li>Razorpay / UPI Payment Gateway</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-sm text-white mb-2">Course Information</h4>
          <ul className="space-y-1.5 text-gray-300 text-xs">
            <li>Course: 25CS1302E - DBS-DBD</li>
            <li>Department of CSE, KL University</li>
            <li>Campus: Aziz Nagar, Hyderabad</li>
            <li>Faculty Guide: Distributed Database Lab</li>
            <li>Semester: A.Y. 2025-2026</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-sm text-white mb-2">Academic & Dev Docs</h4>
          <ul className="space-y-1.5 text-gray-300 text-xs">
            <li><a href="./docs/" target="_blank" rel="noreferrer" className="hover:underline">OpenAPI 3.0 / Swagger Interactive Docs</a></li>
            <li><a href="./docs/PROJECT_REPORT.html" target="_blank" rel="noreferrer" className="hover:underline">Comprehensive Project Report</a></li>
            <li><a href="https://github.com/Srinath64312/A7_DBMS_G3.git" target="_blank" rel="noreferrer" className="hover:underline">GitHub Repository</a></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-sm text-white mb-2">Let Us Help You</h4>
          <ul className="space-y-1.5 text-gray-300 text-xs">
            <li>Your Account & Role Permissions</li>
            <li>Multi-Warehouse Inventory Stock</li>
            <li>Returns & Replacement Policy</li>
            <li>Shipping Rates & Transit Policies</li>
            <li>Campus Delivery Hub Support</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 text-center space-y-2 text-gray-400 text-[11px]">
        <div className="flex items-center justify-center gap-4">
          <span className="font-black text-white text-base">NexCommerce</span>
          <span>•</span>
          <span>English</span>
          <span>•</span>
          <span>INR ₹ / USD $</span>
          <span>•</span>
          <span>India</span>
        </div>
        <div>
          © 2026 NexCommerce Platform (Group 3). Built with React 19, TypeScript, Vite, Tailwind CSS, PostgreSQL & MongoDB.
        </div>
      </div>
    </footer>
  );
};
