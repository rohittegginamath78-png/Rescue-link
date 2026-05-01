import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-sm font-semibold text-white">
              RL
            </div>
            <div>
              <p className="font-medium">RescueLink</p>
              <p className="text-sm text-gray-400">
                Wildlife first-aid guidance and verified rescuer contacts.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Copyright {currentYear} RescueLink
          </p>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link to="/about" className="transition-colors hover:text-white">
              About
            </Link>
            <Link to="/about" className="transition-colors hover:text-white">
              Disclaimer
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
