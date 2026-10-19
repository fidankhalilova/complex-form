import SignupForm from "@/components/SignupForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Create account</h1>
      <SignupForm />
    </main>
  );
}
