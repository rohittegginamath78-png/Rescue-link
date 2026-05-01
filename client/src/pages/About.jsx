export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1 className="mb-6 text-4xl font-medium text-gray-900">
          About RescueLink
        </h1>
        <p className="mb-4 text-lg leading-relaxed text-gray-600">
          RescueLink was built to bridge the gap between people who find injured
          or distressed wild animals and the expert help they need instantly.
        </p>
        <p className="text-lg leading-relaxed text-gray-600">
          Every minute counts when an animal is in danger. Our mission is to
          provide immediate AI-powered first-aid guidance and connect you with
          verified local rescuers in your area.
        </p>
      </section>

      <section className="mb-12 rounded-2xl border border-green-200 bg-green-50 p-8">
        <h2 className="mb-4 text-2xl font-medium text-gray-900">
          How the AI Works
        </h2>
        <p className="mb-4 text-gray-600">
          RescueLink uses Google Gemini with a server-side wildlife system
          prompt designed around practical rescue guidance, feeding cautions,
          and escalation to professionals when the situation sounds severe.
        </p>
        <ul className="space-y-2 text-gray-600">
          <li>
            1. The AI provides guidance, not a diagnosis or treatment plan.
          </li>
          <li>
            2. Chat sessions are stateless. Each session starts fresh and the
            API key stays on the server.
          </li>
          <li>
            3. Responses stay short, actionable, and cautious around dangerous
            wildlife.
          </li>
        </ul>
      </section>

      <section className="mb-12 rounded-lg border border-amber-200 bg-amber-50 p-8">
        <h2 className="mb-4 text-2xl font-medium text-gray-900">
          Important Disclaimer
        </h2>
        <p className="mb-4 text-gray-600">
          <strong>
            RescueLink is not a substitute for professional veterinary or
            wildlife rescue services.
          </strong>
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            AI guidance is informational only and cannot diagnose or treat
            injuries.
          </li>
          <li>
            Always contact a licensed veterinarian or wildlife rescuer for
            serious cases.
          </li>
          <li>
            If an animal is severely injured, bleeding heavily, or unconscious,
            seek professional help immediately.
          </li>
          <li>
            Never attempt to handle wild or potentially dangerous animals
            without professional guidance.
          </li>
          <li>
            Laws regarding wildlife care vary by location - check local
            regulations.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-medium text-gray-900">Built With</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "React 18 + Vite for the client",
            "Tailwind CSS v3 for styling",
            "Leaflet + OpenStreetMap for maps",
            "MongoDB + Mongoose for rescuer storage",
            "Google Gemini for AI guidance",
            "Hono on Node today, ready for Cloudflare deployment later",
          ].map((tech) => (
            <div key={tech} className="text-gray-600">
              {tech}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
