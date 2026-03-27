import './App.css'
import { motion, AnimatePresence } from "framer-motion"
import loginImage from "./assets/log.png"
import { useState, useEffect } from "react"

interface User {
  email: string
  name: string
  avatar?: string
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [savedAccounts, setSavedAccounts] = useState<User[]>([])
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("Cette semaine")

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Nouvelle inscription", message: "Un nouvel utilisateur s'est inscrit", time: "Il y a 5 min", read: false, type: 'info' },
    { id: 2, title: "Rapport prêt", message: "Votre rapport mensuel est disponible", time: "Il y a 1h", read: false, type: 'success' },
    { id: 3, title: "Alerte système", message: "Maintenance prévue ce soir à 22h", time: "Il y a 2h", read: true, type: 'warning' },
    { id: 4, title: "Objectif atteint", message: "Vous avez atteint 100% de votre objectif", time: "Il y a 3h", read: true, type: 'success' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    addToast("Toutes les notifications ont été marquées comme lues", "success")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const emailRegex = /^[a-zA-Z0-9._%+-]+@ooredoo\.tn$/

    if (!emailRegex.test(email)) {
      addToast("Veuillez utiliser une adresse email Ooredoo (@ooredoo.tn)", "error")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      addToast("Le mot de passe doit contenir au moins 6 caractères", "error")
      setIsLoading(false)
      return
    }

    try {
      // Simulation de connexion pour la démo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const user: User = {
        email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase()
      }
      setCurrentUser(user)
      
      if (!savedAccounts.find(acc => acc.email === email)) {
        setSavedAccounts([...savedAccounts, user])
      }
      
      setIsLoggedIn(true)
      setShowAddAccount(false)
      addToast(`Bienvenue, ${user.name}!`, "success")
    } catch (error) {
      console.error("Erreur :", error)
      addToast("Erreur de connexion au serveur", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setEmail("")
    setPassword("")
    setShowAccountMenu(false)
    addToast("Vous avez été déconnecté", "info")
  }

  const handleSwitchAccount = (user: User) => {
    setCurrentUser(user)
    setShowAccountMenu(false)
    addToast(`Connecté en tant que ${user.name}`, "success")
  }

  const handleAddAccount = () => {
    setShowAddAccount(true)
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
    setShowAccountMenu(false)
  }

  const handleRemoveAccount = (emailToRemove: string) => {
    setSavedAccounts(savedAccounts.filter(acc => acc.email !== emailToRemove))
    addToast("Compte supprimé", "info")
  }

  const handleGenerateReport = () => {
    setShowReportModal(false)
    addToast("Rapport en cours de génération...", "info")
    setTimeout(() => {
      addToast("Rapport généré avec succès!", "success")
    }, 2000)
  }

  const navItems = [
    { icon: "📊", label: "Tableau de bord", badge: null },
    { icon: "📈", label: "Analytiques", badge: "3" },
    { icon: "👥", label: "Utilisateurs", badge: null },
    { icon: "📋", label: "Rapports", badge: "Nouveau" },
    { icon: "💬", label: "Messages", badge: "5" },
    { icon: "📅", label: "Calendrier", badge: null },
    { icon: "⚙️", label: "Paramètres", badge: null },
  ]

  const stats = [
    { title: "Utilisateurs Actifs", value: "12,847", change: "+12.5%", color: "red", icon: "👥", trend: [30, 40, 35, 50, 49, 60, 70] },
    { title: "Revenus", value: "48.2K TND", change: "+8.2%", color: "green", icon: "💰", trend: [20, 30, 45, 35, 55, 60, 75] },
    { title: "Taux de Conversion", value: "85.3%", change: "+3.1%", color: "blue", icon: "📈", trend: [60, 65, 70, 68, 75, 80, 85] },
    { title: "Tickets Support", value: "42", change: "-5.4%", color: "yellow", icon: "🎫", trend: [50, 45, 55, 40, 45, 42, 42] },
  ]

  // Mini Sparkline Component
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          className="drop-shadow-sm"
        />
        <polyline
          fill={`${color}20`}
          stroke="none"
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    )
  }

  // Toast Component
  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-gray-800 text-white'
            }`}
          >
            <span className="text-lg">
              {toast.type === 'success' ? '✅' :
               toast.type === 'error' ? '❌' :
               toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  // Search Modal
  const SearchModal = () => (
    <AnimatePresence>
      {showSearchModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={() => setShowSearchModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-4 border-b flex items-center gap-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-lg outline-none"
                autoFocus
              />
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-500">ESC</kbd>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-3">Recherches récentes</p>
              {['Rapport mensuel', 'Utilisateurs actifs', 'Statistiques ventes'].map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  onClick={() => {
                    setSearchQuery(item)
                    addToast(`Recherche: ${item}`, 'info')
                    setShowSearchModal(false)
                  }}
                >
                  <span className="text-gray-400">🕐</span>
                  <span className="text-gray-700">{item}</span>
                </motion.button>
              ))}
              <p className="text-sm text-gray-500 mb-3 mt-4">Actions rapides</p>
              {[
                { icon: '📊', label: 'Voir le tableau de bord' },
                { icon: '📈', label: 'Générer un rapport' },
                { icon: '👥', label: 'Gérer les utilisateurs' },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ backgroundColor: '#fef2f2' }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  onClick={() => {
                    addToast(item.label, 'info')
                    setShowSearchModal(false)
                  }}
                >
                  <span>{item.icon}</span>
                  <span className="text-gray-700">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Report Modal
  const ReportModal = () => (
    <AnimatePresence>
      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b bg-gradient-to-r from-red-50 to-red-100">
              <h3 className="text-xl font-bold text-gray-800">Générer un rapport</h3>
              <p className="text-gray-600 mt-1">Configurez votre rapport personnalisé</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option>Rapport de performance</option>
                  <option>Rapport financier</option>
                  <option>Rapport utilisateurs</option>
                  <option>Rapport complet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                  <option>Ce trimestre</option>
                  <option>Cette année</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <div className="flex gap-3">
                  {['PDF', 'Excel', 'CSV'].map(format => (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 p-3 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition font-medium"
                    >
                      {format}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateReport}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg"
              >
                Générer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Settings Modal
  const SettingsModal = () => (
    <AnimatePresence>
      {showSettingsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Paramètres</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Mode sombre</p>
                  <p className="text-sm text-gray-500">Activer le thème sombre</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setDarkMode(!darkMode)
                    addToast(`Mode ${!darkMode ? 'sombre' : 'clair'} activé`, 'success')
                  }}
                  className={`w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-red-600' : 'bg-gray-200'} relative`}
                >
                  <motion.div
                    animate={{ x: darkMode ? 24 : 2 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1"
                  />
                </motion.button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Notifications push</p>
                  <p className="text-sm text-gray-500">Recevoir des notifications</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToast('Paramètre mis à jour', 'success')}
                  className="w-14 h-8 rounded-full bg-red-600 relative"
                >
                  <motion.div
                    animate={{ x: 24 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1"
                  />
                </motion.button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Emails récapitulatifs</p>
                  <p className="text-sm text-gray-500">Recevoir un email hebdomadaire</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToast('Paramètre mis à jour', 'success')}
                  className="w-14 h-8 rounded-full bg-gray-200 relative"
                >
                  <motion.div
                    animate={{ x: 2 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1"
                  />
                </motion.button>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-3">Langue</p>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  onChange={() => addToast('Langue mise à jour', 'success')}
                >
                  <option>Français</option>
                  <option>English</option>
                  <option>العربية</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg"
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowSearchModal(true)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
        setShowReportModal(false)
        setShowSettingsModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dashboard Component
  if (isLoggedIn && currentUser) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex transition-colors duration-300`}>
        <ToastContainer />
        <SearchModal />
        <ReportModal />
        <SettingsModal />

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="w-64 bg-gradient-to-b from-red-600 to-red-700 text-white min-h-screen fixed left-0 top-0 z-20 shadow-xl"
            >
              <div className="p-6 flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"
                >
                  <span className="text-red-600 text-xl font-bold">O</span>
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold tracking-wide">Ooredoo</h1>
                  <p className="text-red-200 text-xs">Dashboard Analytics</p>
                </div>
              </div>

              {/* Search shortcut */}
              <div className="px-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSearchModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/10 rounded-xl text-red-100 text-sm hover:bg-white/20 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Rechercher...</span>
                  <kbd className="ml-auto px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘K</kbd>
                </motion.button>
              </div>

              <nav className="mt-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveNav(index)
                      if (item.label === 'Paramètres') {
                        setShowSettingsModal(true)
                      } else {
                        addToast(`Navigation vers ${item.label}`, 'info')
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-6 py-3 transition-all relative ${
                      activeNav === index 
                        ? 'bg-white/20' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {activeNav === index && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                      />
                    )}
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.badge === 'Nouveau' 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : 'bg-white/20 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-4 right-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 rounded-xl p-4 cursor-pointer"
                  onClick={() => addToast('Support contacté!', 'success')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💬</span>
                    <p className="text-sm font-medium">Besoin d'aide ?</p>
                  </div>
                  <p className="text-xs text-red-200">Contactez notre support 24/7</p>
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
          {/* Top Bar */}
          <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10 transition-colors`}>
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                >
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                <div>
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {navItems[activeNav].label}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Bienvenue, {currentUser.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearchModal(true)}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition hidden md:flex`}
                >
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>

                {/* Dark Mode Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDarkMode(!darkMode)
                    addToast(`Mode ${!darkMode ? 'sombre' : 'clair'} activé`, 'success')
                  }}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
                >
                  {darkMode ? (
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
                  >
                    <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden z-50`}
                      >
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Tout marquer lu
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map(notif => (
                            <motion.div
                              key={notif.id}
                              whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer ${!notif.read ? (darkMode ? 'bg-gray-700/50' : 'bg-red-50') : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                  notif.type === 'success' ? 'bg-green-100' :
                                  notif.type === 'warning' ? 'bg-yellow-100' :
                                  notif.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  {notif.type === 'success' ? '✅' :
                                   notif.type === 'warning' ? '⚠️' :
                                   notif.type === 'error' ? '❌' : 'ℹ️'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{notif.title}</p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{notif.message}</p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{notif.time}</p>
                                </div>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <motion.button
                          whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                          className={`w-full p-4 text-center text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}
                          onClick={() => {
                            setShowNotifications(false)
                            addToast('Voir toutes les notifications', 'info')
                          }}
                        >
                          Voir toutes les notifications
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Account Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className={`flex items-center gap-3 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{currentUser.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
                    </div>
                    <motion.svg 
                      animate={{ rotate: showAccountMenu ? 180 : 0 }}
                      className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* Account Dropdown Menu */}
                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden z-50`}
                      >
                        {/* Current Account */}
                        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-red-50 to-red-100'} border-b ${darkMode ? 'border-gray-600' : 'border-red-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {currentUser.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Saved Accounts */}
                        {savedAccounts.length > 1 && (
                          <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} px-3 py-2 font-medium`}>AUTRES COMPTES</p>
                            {savedAccounts
                              .filter(acc => acc.email !== currentUser.email)
                              .map((account, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer group"
                                >
                                  <div 
                                    className="flex items-center gap-3 flex-1"
                                    onClick={() => handleSwitchAccount(account)}
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                      {account.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{account.name}</p>
                                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{account.email}</p>
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveAccount(account.email)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                                  >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </motion.button>
                                </motion.div>
                              ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="p-2">
                          <motion.button
                            whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                            onClick={handleAddAccount}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
                          >
                            <div className={`w-8 h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Ajouter un autre compte</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                            onClick={() => {
                              setShowSettingsModal(true)
                              setShowAccountMenu(false)
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
                          >
                            <div className={`w-8 h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Paramètres</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ backgroundColor: '#fef2f2' }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-red-600"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">Se déconnecter</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  onClick={() => addToast(`Détails: ${stat.title}`, 'info')}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer transition-colors`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>{stat.title}</h3>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mt-1`}>{stat.value}</p>
                  <div className="mt-4">
                    <Sparkline 
                      data={stat.trend} 
                      color={stat.change.startsWith('+') ? '#22c55e' : '#ef4444'} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Aperçu des Performances</h3>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value)
                      addToast(`Période: ${e.target.value}`, 'info')
                    }}
                    className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                    <option>Cette année</option>
                  </select>
                </div>
                <div className={`h-64 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100'} rounded-xl`}>
                  <div className="text-center">
                    <motion.span 
                      className="text-6xl block"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📊
                    </motion.span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>Zone graphique Power BI</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToast('Intégration Power BI en cours...', 'info')}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                    >
                      Charger les données
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Activité Récente</h3>
                <div className="space-y-4">
                  {[
                    { action: "Nouvelle inscription", time: "Il y a 5 min", icon: "🆕" },
                    { action: "Rapport généré", time: "Il y a 12 min", icon: "📄" },
                    { action: "Mise à jour système", time: "Il y a 1h", icon: "🔄" },
                    { action: "Ticket résolu", time: "Il y a 2h", icon: "✅" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => addToast(`Détails: ${item.action}`, 'info')}
                      className={`flex items-center gap-4 p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-xl transition cursor-pointer`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{item.action}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{item.time}</p>
                      </div>
                      <svg className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToast('Voir toute l\'activité', 'info')}
                  className={`w-full mt-4 py-3 text-center text-sm font-medium ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'} rounded-xl transition`}
                >
                  Voir tout →
                </motion.button>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Besoin d'un rapport personnalisé ?</h3>
                  <p className="text-red-200 mt-1">Générez un rapport détaillé en quelques clics</p>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToast('Aide en cours de chargement...', 'info')}
                    className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    En savoir plus
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReportModal(true)}
                    className="px-6 py-3 bg-white text-red-600 rounded-xl font-semibold shadow-lg"
                  >
                    Générer un rapport
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              {[
                { icon: '📥', label: 'Exporter données', color: 'blue' },
                { icon: '📧', label: 'Envoyer rapport', color: 'green' },
                { icon: '🔄', label: 'Synchroniser', color: 'purple' },
                { icon: '📅', label: 'Planifier', color: 'orange' },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToast(`${action.label} en cours...`, 'info')}
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-4 rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex flex-col items-center gap-2 transition`}
                >
                  <span className="text-3xl">{action.icon}</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </main>
        </div>

        {/* Click outside to close menus */}
        {(showAccountMenu || showNotifications) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowAccountMenu(false)
              setShowNotifications(false)
            }}
          />
        )}
      </div>
    )
  }

  // Login Page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
      <ToastContainer />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full opacity-50 blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-200 rounded-full opacity-50 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative grid md:grid-cols-2 items-center gap-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-5xl border border-white/50"
      >
        {/* Left side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <motion.img
            src={loginImage}
            alt="Login illustration"
            className="w-full max-w-sm object-contain drop-shadow-2xl"
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <h3 className="text-xl font-semibold text-gray-700">Plateforme Analytics</h3>
            <p className="text-gray-500 mt-2">Accédez à vos données en temps réel</p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="w-2 h-2 bg-red-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-white text-3xl font-bold">O</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            {showAddAccount ? "Ajouter un compte" : "Bienvenue"}
          </h1>
          <p className="text-center text-gray-500 mb-8">
            {showAddAccount 
              ? "Connectez-vous avec un autre compte Ooredoo"
              : "Connectez-vous à votre espace Ooredoo"
            }
          </p>

          {/* Saved accounts quick login */}
          {!showAddAccount && savedAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-500 mb-3">Comptes récents</p>
              <div className="space-y-2">
                {savedAccounts.map((account, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEmail(account.email)
                      setPassword("")
                    }}
                    className={`w-full flex items-center gap-3 p-3 border rounded-xl transition ${
                      email === account.email 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                      {account.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-gray-700">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.email}</p>
                    </div>
                    {email === account.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou connectez-vous</span>
                </div>
              </div>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Email Ooredoo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
              />
            </motion.div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <motion.div 
                    animate={{ 
                      backgroundColor: rememberMe ? '#dc2626' : '#e5e7eb',
                      borderColor: rememberMe ? '#dc2626' : '#d1d5db'
                    }}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center"
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <span className="text-gray-600 group-hover:text-gray-800 transition">Se souvenir de moi</span>
              </label>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.preventDefault()
                  addToast("Un email de réinitialisation a été envoyé", "info")
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Mot de passe oublié ?
              </motion.a>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: "0 10px 30px -10px rgba(220, 38, 38, 0.5)" }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </motion.button>

            {showAddAccount && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowAddAccount(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour aux comptes sauvegardés
              </motion.button>
            )}
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-400 text-sm mt-8"
          >
            © 2024 Ooredoo Tunisia. Tous droits réservés.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

export default App