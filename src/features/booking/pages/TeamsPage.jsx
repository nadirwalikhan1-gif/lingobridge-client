import { Building2, Users, CreditCard, Code, Mail, ArrowLeft } from 'lucide-react'

export default function TeamsPage() {
  return (
    <div className="h-full flex gap-8 overflow-hidden bg-[#F8F7FC]">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto py-8 px-3">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-10 text-center">
          
          <div className="flex items-center justify-center mb-6">
            <span className="text-[11px] font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
              🚀 Early access — 200+ teams on waitlist
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-violet-600" />
          </div>

          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight mb-2">
            LingoBridge for Teams
          </h1>
          <p className="text-[14px] text-slate-500 mb-8 max-w-sm mx-auto">
            Interpretation at scale for hospitals, law firms, and global teams.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-slate-50">
              <Users className="w-5 h-5 text-violet-600 mx-auto mb-2" />
              <p className="text-[12px] font-semibold text-slate-900">Volume Pricing</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Custom rates for 10+ seats</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <CreditCard className="w-5 h-5 text-violet-600 mx-auto mb-2" />
              <p className="text-[12px] font-semibold text-slate-900">Unified Billing</p>
              <p className="text-[10px] text-slate-400 mt-0.5">One invoice, all departments</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <Code className="w-5 h-5 text-violet-600 mx-auto mb-2" />
              <p className="text-[12px] font-semibold text-slate-900">API Access</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Embed in your platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 max-w-sm mx-auto mb-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="email" 
                placeholder="work@company.com" 
                className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            <button className="px-5 py-3 bg-violet-600 text-white text-[13px] font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm shrink-0">
              Get in touch
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            We'll reply within 24 hours with a custom quote.
          </p>

          <a 
            href="/client/booking" 
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-violet-600 mt-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to booking
          </a>
        </div>
      </div>
    </div>
  )
}