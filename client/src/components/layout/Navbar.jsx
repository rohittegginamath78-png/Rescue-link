import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Animals', href: '/#animals' },
    { label: 'Find Rescuer', href: '/find-rescuer' },
    { label: 'About', href: '/about' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-sm font-semibold text-white">
              RL
            </div>
            <span className="hidden text-sm font-medium text-gray-900 sm:inline">RescueLink</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                {link.label}
              </a>
            ))}
          </div>

          <Link to="/chat" className="hidden sm:inline-flex btn-primary">
            Try it now
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 pb-4 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/chat"
              className="mt-2 block px-4 py-2 text-center btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Try it now
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
