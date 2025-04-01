'use client'

import { Menu } from "lucide-react"
import { useContext, createContext, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SidebarContext = createContext({ expanded: false })

export function Navbar({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="h-screen sticky top-0 z-10 max-w-[300px]">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div
            className={`overflow-hidden transition-all ${
              expanded ? "w-64" : "w-0"
            }`}
          >
            {expanded && (
              <h1 className="font-bold text-xl whitespace-nowrap">Running Router 🏃‍♂️‍➡️</h1>
            )}
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 cursor-pointer"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  )
}

export function NavbarItem({ 
  icon, 
  text, 
}: { 
  icon: React.ReactNode; 
  text: string; 
  active?: boolean; 
}) {
  const { expanded } = useContext(SidebarContext)
  const pathname = usePathname()
  
  // Determine href based on text
  const href = text === "View Routes" ? "/view" : "/create"
  
  // Determine if this item is active based on current path
  let isActive = false;
  
  // For Create Route
  if (text === "Create Route") {
    isActive = pathname === "/create" || pathname === "/";
  }
  // For View Routes
  else if (text === "View Routes") {
    isActive = pathname === "/view";
  }
  
  return (
    <Link href={href}>
      <li
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group h-10
          ${
            isActive
              ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
              : "hover:bg-indigo-50 text-gray-600"
          }
      `}
      >
        <div className="flex items-center justify-center w-5 h-5">
          {icon}
        </div>
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>

        {!expanded && (
          <div
            className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            whitespace-nowrap
        `}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  )
}