"use client";

export default function Security() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Security Settings</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/auth/forgot-password"
              className="w-full sm:w-auto text-center px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-medium shadow-md hover:from-gray-600 hover:to-black-600 transition"
            >
              Forgot Password
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}