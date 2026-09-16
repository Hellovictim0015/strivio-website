"use client";

import { useState } from "react";

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-[#83C52B]' : 'bg-gray-200'}`}
      style={{ height: '22px', width: '40px' }}
    >
      <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
        style={{ width: '18px', height: '18px', transition: 'transform 0.2s' }}
      ></div>
    </button>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-[#F5F7F3] border-b border-gray-100">
        <h3 className="text-[#0B1F33] font-bold text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function SettingRow({ label, sub, type = 'toggle', value = true }) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <div>
        <p className="text-[#0B1F33] font-medium text-sm">{label}</p>
        <p className="text-[#0B1F33]/40 text-xs mt-0.5">{sub}</p>
      </div>
      {type === 'toggle' && <Toggle defaultOn={value} />}
      {type === 'edit' && (
        <button className="text-[#83C52B] text-xs font-semibold border border-[#83C52B]/30 px-3 py-1.5 rounded-xl">Edit</button>
      )}
      {type === 'text' && (
        <span className="text-[#0B1F33]/50 text-xs font-semibold">{value}</span>
      )}
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Settings</h1>
        <p className="text-[#0B1F33]/50 text-sm">Platform configuration</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-4">
          <SettingSection title="Platform Settings">
            <SettingRow label="Platform Maintenance Mode" sub="Take platform offline for updates" type="toggle" value={false} />
            <SettingRow label="New Registrations" sub="Allow new user signups" type="toggle" value={true} />
            <SettingRow label="Partner Onboarding" sub="Accept new partner applications" type="toggle" value={true} />
            <SettingRow label="Auto-Approve Partners" sub="Skip manual partner review" type="toggle" value={false} />
          </SettingSection>

          <SettingSection title="Notification Settings">
            <SettingRow label="Booking Confirmation" sub="Email users on booking" type="toggle" value={true} />
            <SettingRow label="Partner Alerts" sub="Notify partners of new bookings" type="toggle" value={true} />
            <SettingRow label="Revenue Reports" sub="Weekly revenue digest email" type="toggle" value={true} />
            <SettingRow label="System Alerts" sub="Critical platform notifications" type="toggle" value={true} />
          </SettingSection>

          <SettingSection title="Security">
            <SettingRow label="Two-Factor Authentication" sub="Admin login 2FA" type="toggle" value={true} />
            <SettingRow label="Session Timeout" sub="Auto-logout after inactivity" type="text" value="30 min" />
            <SettingRow label="Change Password" sub="Last changed 30 days ago" type="edit" />
            <SettingRow label="API Keys" sub="Manage platform API access" type="edit" />
          </SettingSection>
        </div>

        <div className="space-y-4">
          <SettingSection title="Membership Pricing">
            {[
              { plan: 'Monthly Plan', price: '₹999/month' },
              { plan: 'Quarterly Plan', price: '₹2,499 / 3 months' },
              { plan: 'Annual Plan', price: '₹7,999/year' },
              { plan: 'Session Drop-in', price: '₹199/session' },
            ].map((p) => (
              <div key={p.plan} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[#0B1F33] font-medium text-sm">{p.plan}</p>
                  <p className="text-[#83C52B] font-bold text-xs mt-0.5">{p.price}</p>
                </div>
                <button className="text-[#83C52B] text-xs font-semibold border border-[#83C52B]/30 px-3 py-1.5 rounded-xl">Edit</button>
              </div>
            ))}
          </SettingSection>

          <SettingSection title="Payment Configuration">
            <SettingRow label="Payment Gateway" sub="Razorpay · Connected" type="text" value="Active" />
            <SettingRow label="UPI Payments" sub="Accept UPI transactions" type="toggle" value={true} />
            <SettingRow label="International Cards" sub="Accept foreign cards" type="toggle" value={false} />
            <SettingRow label="Platform Commission" sub="Revenue share from bookings" type="text" value="12%" />
          </SettingSection>

          <SettingSection title="Admin Profile">
            {[
              { label: 'Full Name', value: 'Super Admin', sub: 'Platform administrator' },
              { label: 'Email', value: 'admin@strivio.in', sub: 'Login email' },
              { label: 'Role', value: 'Super Admin', sub: 'Full access' },
            ].map((row) => (
              <div key={row.label} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[#0B1F33] font-medium text-sm">{row.label}</p>
                  <p className="text-[#0B1F33]/40 text-xs">{row.sub}</p>
                </div>
                <span className="text-[#0B1F33]/70 text-xs font-semibold">{row.value}</span>
              </div>
            ))}
            <div className="px-5 py-3.5">
              <button className="bg-[#0B1F33] text-white text-xs font-bold px-4 py-2 rounded-xl">Edit Profile</button>
            </div>
          </SettingSection>

          <SettingSection title="Support">
            <SettingRow label="Help Documentation" sub="Platform guides and FAQs" type="edit" />
            <SettingRow label="Contact Support" sub="support@strivio.in" type="edit" />
          </SettingSection>
        </div>
      </div>
    </div>
  );
}
