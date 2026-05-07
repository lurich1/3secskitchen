import LoginForm from "@/components/LoginForm";

export default function ManagerLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-brand-100 rounded-xl p-7 shadow-sm">
        <h1 className="text-xl font-bold text-brand-900">Manager sign in</h1>
        <p className="text-sm text-brand-900/60 mt-1">
          Restricted area. Staff only.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
