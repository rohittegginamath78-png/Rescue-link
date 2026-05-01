import { Link } from "react-router-dom";
import { ANIMALS } from "../constants/animals";
import Badge from "../components/ui/Badge";
import Pill from "../components/ui/Pill";
import ChatDemo from "../components/landing/ChatDemo";

export default function Landing() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(151,196,89,0.22),_transparent_28%),linear-gradient(to_bottom,_#f8fbf4,_#ffffff_28%)]">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge tone="green">
              Immediate first-aid guidance for urban wildlife
            </Badge>
            <h1 className="mt-5 text-4xl font-medium leading-tight text-gray-900 md:text-6xl">
              Found a wild animal that needs help?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              RescueLink gives you calm step-by-step AI guidance and verified
              local rescuer contacts without signups, accounts, or delays.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/chat" className="btn-primary text-center">
                Ask the AI advisor
              </Link>
              <Link to="/find-rescuer" className="btn-secondary text-center">
                Find a rescuer
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill tone="gray" className="cursor-default">
                No signup needed
              </Pill>
              <Pill tone="gray" className="cursor-default">
                Karnataka rescuer coverage
              </Pill>
              <Pill tone="gray" className="cursor-default">
                12 supported animal types
              </Pill>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md justify-center">
            <ChatDemo />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-medium text-gray-900">
          How We Help
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: "AI",
              title: "AI Guidance",
              desc: "Get calm, concise steps for first aid, feeding cautions, and what to avoid.",
            },
            {
              icon: "RL",
              title: "Local Rescuers",
              desc: "Locate verified rescuers by city, filter by specialty, and open directions instantly.",
            },
            {
              icon: "QG",
              title: "Quick Guides",
              desc: "Check static do and do-not guidance for the most common wildlife encounters.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-sm font-semibold text-green-800">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-center text-3xl font-medium text-gray-900">
          4 Simple Steps
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              num: "1",
              title: "Find the animal",
              desc: "Spot an injured or distressed wild animal.",
            },
            {
              num: "2",
              title: "Ask the AI",
              desc: "Describe what you see in chat.",
            },
            {
              num: "3",
              title: "Get guidance",
              desc: "Receive immediate first-aid steps.",
            },
            {
              num: "4",
              title: "Call a rescuer",
              desc: "Contact local professionals if needed.",
            },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                {step.num}
              </div>
              <h3 className="mb-2 font-medium text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="animals"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-center text-3xl font-medium text-gray-900">
          Animals We Support
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {ANIMALS.map((animal) => (
            <Link
              key={animal}
              to={`/chat?animal=${animal.toLowerCase()}`}
              className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 transition-colors hover:bg-green-100"
            >
              {animal}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-green-600 p-8 text-center text-white md:p-12">
          <h2 className="mb-4 text-2xl font-medium md:text-3xl">
            Found an animal right now?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-green-100">
            Get AI guidance immediately. No account needed - just describe what
            you see.
          </p>
          <div className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/chat"
              className="rounded-lg bg-white px-6 py-3 text-center font-medium text-green-600 transition-colors hover:bg-green-50"
            >
              Start Chat
            </Link>
            <Link
              to="/find-rescuer"
              className="rounded-lg border-2 border-white px-6 py-3 text-center font-medium text-white transition-colors hover:bg-green-700"
            >
              Find Rescuer
            </Link>
          </div>
          <p className="text-xs text-green-200">
            This is AI guidance only - not a substitute for professional care.
          </p>
        </div>
      </section>
    </div>
  );
}
