import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Star, Play, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/library', icon: BookOpen, label: 'Library' },
  { path: '/my-words', icon: Star, label: 'My Words' },
  { path: '/session', icon: Play, label: 'Learn' },
  { path: '/statistics', icon: BarChart3, label: 'Statistics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
          🐣 Peace
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
        Peace v0.1 — MVP
      </div>
    </aside>
  )
}
