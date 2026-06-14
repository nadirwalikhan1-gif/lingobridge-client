export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-card shadow-card">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Join LinguaCall as a client or interpreter</p>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-slate-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-slate-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-button text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
