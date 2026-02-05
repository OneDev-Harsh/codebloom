import {
  AccountSettingsCards,
  ChangePasswordCard,
  DeleteAccountCard,
} from "@daveyplate/better-auth-ui"

const Settings = () => {
  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32 py-12 text-white">

      {/* PAGE HEADER */}
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Account Settings
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your profile information and account security.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">

        {/* PROFILE / ACCOUNT INFO */}
        <AccountSettingsCards
          classNames={{
            card: {
              base: `
                rounded-2xl
                border border-slate-800
                bg-black/70 backdrop-blur-xl
                shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)]
              `,
              header: `
                px-6 py-4
                border-b border-slate-800
                font-medium
              `,
              footer: `
                px-6 py-4
                border-t border-slate-800
                bg-white/5
                flex justify-end gap-3
              `,
            },
          }}
        />

        {/* CHANGE PASSWORD */}
        <div className="rounded-2xl border border-slate-800 bg-black/60 backdrop-blur-xl">
          <ChangePasswordCard
            classNames={{
              base: "px-6 py-6",
              footer: `
                mt-4
                pt-4
                border-t border-slate-800
                flex justify-end
              `,
              input: `
                bg-white/5
                border border-slate-800
                text-white
                placeholder:text-slate-500
                focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500
              `,
              button: `
                bg-gradient-to-r from-[#CB52D4] to-indigo-600
                text-white font-medium
                px-5 py-2 rounded-md
                hover:opacity-90
                active:scale-[0.98]
                transition
                cursor-pointer
              `,
            }}
          />
        </div>

        {/* DELETE ACCOUNT – DANGER ZONE */}
        <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] backdrop-blur-xl">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-red-500/20">
            <h3 className="text-sm font-semibold text-red-400 tracking-wide">
            Danger Zone
            </h3>
            <p className="mt-1 text-xs text-red-300/80">
            This action is permanent and cannot be undone.
            </p>
        </div>

        {/* CONTENT */}
        <DeleteAccountCard   
/>

        </div>

      </div>
    </div>
  )
}

export default Settings
