import './App.css'
import { motion, AnimatePresence } from "framer-motion"
import loginImage from "./assets/log.png"
import { useState, useEffect, useRef } from "react"

interface User {
  email: string
  name: string
  avatar?: string
  role?: string
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("Cette semaine")
  const [selectedReportType, setSelectedReportType] = useState("Rapport de performance")
  const [selectedFormat, setSelectedFormat] = useState("PDF")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Nouvelle inscription", message: "Un nouvel utilisateur s'est inscrit", time: "Il y a 5 min", read: false, type: 'info' },
    { id: 2, title: "Rapport prêt", message: "Votre rapport mensuel est disponible", time: "Il y a 1h", read: false, type: 'success' },
    { id: 3, title: "Alerte système", message: "Maintenance prévue ce soir à 22h", time: "Il y a 2h", read: true, type: 'warning' },
    { id: 4, title: "Objectif atteint", message: "Vous avez atteint 100% de votre objectif", time: "Il y a 3h", read: true, type: 'success' },
    { id: 5, title: "Nouveau message", message: "Vous avez reçu un message de l'équipe", time: "Il y a 4h", read: true, type: 'info' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Track mouse for gradient effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
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

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    addToast("Notification supprimée", "info")
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
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const user: User = {
        email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: 'Administrateur'
      }
      setCurrentUser(user)
      
      if (!savedAccounts.find(acc => acc.email === email)) {
        setSavedAccounts([...savedAccounts, user])
      }
      
      setIsLoggedIn(true)
      setShowAddAccount(false)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      addToast(`Bienvenue, ${user.name}! 🎉`, "success")
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
    addToast("Vous avez été déconnecté 👋", "info")
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

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    addToast("Génération du rapport en cours...", "info")
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsGeneratingReport(false)
    setShowReportModal(false)
    addToast(`Rapport ${selectedFormat} généré avec succès! 📄`, "success")
  }

  const navItems = [
    { icon: "📊", label: "Tableau de bord", badge: null },
    { icon: "📈", label: "Analytiques", badge: "3" },
    { icon: "👥", label: "Utilisateurs", badge: null },
    { icon: "📋", label: "Rapports", badge: "Nouveau" },
    { icon: "💬", label: "Messages", badge: "5" },
    { icon: "📅", label: "Calendrier", badge: null },
    { icon: "🔔", label: "Notifications", badge: unreadCount > 0 ? String(unreadCount) : null },
    { icon: "⚙️", label: "Paramètres", badge: null },
  ]

  const stats = [
    { title: "Utilisateurs Actifs", value: "12,847", change: "+12.5%", color: "red", icon: "👥", trend: [30, 40, 35, 50, 49, 60, 70], description: "vs mois dernier" },
    { title: "Revenus", value: "48.2K TND", change: "+8.2%", color: "green", icon: "💰", trend: [20, 30, 45, 35, 55, 60, 75], description: "vs mois dernier" },
    { title: "Taux de Conversion", value: "85.3%", change: "+3.1%", color: "blue", icon: "📈", trend: [60, 65, 70, 68, 75, 80, 85], description: "vs mois dernier" },
    { title: "Tickets Support", value: "42", change: "-5.4%", color: "yellow", icon: "🎫", trend: [50, 45, 55, 40, 45, 42, 42], description: "en attente" },
  ]

  const recentActivities = [
    { action: "Nouvelle inscription", time: "Il y a 5 min", icon: "🆕", user: "Ahmed Ben Ali" },
    { action: "Rapport généré", time: "Il y a 12 min", icon: "📄", user: "Système" },
    { action: "Mise à jour système", time: "Il y a 1h", icon: "🔄", user: "Admin" },
    { action: "Ticket résolu", time: "Il y a 2h", icon: "✅", user: "Support" },
    { action: "Nouveau paiement", time: "Il y a 3h", icon: "💳", user: "Client #1234" },
  ]

  // Sparkline Component
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${color})`}
          stroke="none"
          points={`0,100 ${points} 100,100`}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle
          cx={100}
          cy={100 - ((data[data.length - 1] - min) / range) * 100}
          r="4"
          fill={color}
          className="animate-pulse"
        />
      </svg>
    )
  }

  // Confetti Component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: -20,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: window.innerHeight + 20,
            rotate: Math.random() * 360,
            x: Math.random() * window.innerWidth
          }}
          transition={{ 
            duration: Math.random() * 2 + 2,
            ease: "linear"
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ 
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
          }}
        />
      ))}
    </div>
  )

  // Toast Container
  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md cursor-pointer ${
              toast.type === 'success' ? 'bg-green-500/90 text-white' :
              toast.type === 'error' ? 'bg-red-500/90 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500/90 text-white' :
              'bg-gray-800/90 text-white'
            }`}
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            whileHover={{ scale: 1.02, x: -5 }}
          >
            <motion.span 
              className="text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {toast.type === 'success' ? '✅' :
               toast.type === 'error' ? '❌' :
               toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </motion.span>
            <span className="font-medium pr-2">{toast.message}</span>
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-4`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher dans l'application..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`flex-1 text-lg outline-none ${darkMode ? 'bg-transparent text-white placeholder-gray-500' : 'bg-transparent text-gray-800 placeholder-gray-400'}`}
                autoFocus
              />
              <kbd className={`px-2.5 py-1.5 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'} rounded-lg text-sm font-mono`}>ESC</kbd>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {searchQuery ? (
                <div className="space-y-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>Résultats pour "{searchQuery}"</p>
                  {['Tableau de bord', 'Utilisateurs', 'Rapports', 'Paramètres'].filter(item => 
                    item.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((item, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all`}
                      onClick={() => {
                        addToast(`Navigation vers ${item}`, 'info')
                        setShowSearchModal(false)
                        setSearchQuery("")
                      }}
                    >
                      <span className="text-2xl">🔍</span>
                      <span className={`${darkMode ? 'text-white' : 'text-gray-700'} font-medium`}>{item}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3 font-medium`}>Recherches récentes</p>
                  {['Rapport mensuel', 'Utilisateurs actifs', 'Statistiques ventes'].map((item, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all`}
                      onClick={() => {
                        setSearchQuery(item)
                      }}
                    >
                      <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>🕐</span>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                    </motion.button>
                  ))}
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3 mt-6 font-medium`}>Actions rapides</p>
                  {[
                    { icon: '📊', label: 'Voir le tableau de bord', shortcut: '⌘D' },
                    { icon: '📈', label: 'Générer un rapport', shortcut: '⌘R' },
                    { icon: '👥', label: 'Gérer les utilisateurs', shortcut: '⌘U' },
                    { icon: '⚙️', label: 'Ouvrir les paramètres', shortcut: '⌘,' },
                  ].map((item, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} transition-all group`}
                      onClick={() => {
                        if (item.label.includes('rapport')) {
                          setShowReportModal(true)
                        } else if (item.label.includes('paramètres')) {
                          setShowSettingsModal(true)
                        } else {
                          addToast(item.label, 'info')
                        }
                        setShowSearchModal(false)
                      }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{item.label}</span>
                      <kbd className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'} rounded text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity`}>{item.shortcut}</kbd>
                    </motion.button>
                  ))}
                </>
              )}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isGeneratingReport && setShowReportModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden`}
          >
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} bg-gradient-to-r ${darkMode ? 'from-red-900/50 to-red-800/50' : 'from-red-50 to-red-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Générer un rapport</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Configurez votre rapport personnalisé</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Type de rapport</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Performance', 'Financier', 'Utilisateurs', 'Complet'].map(type => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedReportType(`Rapport ${type.toLowerCase()}`)}
                      className={`p-3 rounded-xl border-2 font-medium cursor-pointer transition-all ${
                        selectedReportType.includes(type.toLowerCase())
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : darkMode 
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Période</label>
                <select 
                  className={`w-full p-4 border-2 rounded-xl cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                >
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                  <option>Ce trimestre</option>
                  <option>Cette année</option>
                  <option>Personnalisé</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Format d'export</label>
                <div className="flex gap-3">
                  {[
                    { format: 'PDF', icon: '📄' },
                    { format: 'Excel', icon: '📊' },
                    { format: 'CSV', icon: '📋' }
                  ].map(({ format, icon }) => (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFormat(format)}
                      className={`flex-1 p-4 rounded-xl border-2 font-medium cursor-pointer transition-all flex flex-col items-center gap-2 ${
                        selectedFormat === format
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : darkMode 
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span>{format}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'} flex gap-3`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReportModal(false)}
                disabled={isGeneratingReport}
                className={`flex-1 py-4 border-2 rounded-xl font-semibold cursor-pointer transition-all ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: isGeneratingReport ? 1 : 1.02 }}
                whileTap={{ scale: isGeneratingReport ? 1 : 0.98 }}
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingReport ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Génération...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Générer
                  </>
                )}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar`}
          >
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>⚙️ Paramètres</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-2 rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Appearance */}
              <div>
                <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Apparence</h4>
                <div className={`flex items-center justify-between p-4 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mode sombre</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Activer le thème sombre</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setDarkMode(!darkMode)
                      addToast(`Mode ${!darkMode ? 'sombre 🌙' : 'clair ☀️'} activé`, 'success')
                    }}
                    className={`w-16 h-9 rounded-full cursor-pointer transition-colors relative ${darkMode ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <motion.div
                      animate={{ x: darkMode ? 28 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-7 h-7 bg-white rounded-full shadow-lg absolute top-1 flex items-center justify-center"
                    >
                      <span className="text-sm">{darkMode ? '🌙' : '☀️'}</span>
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Notifications</h4>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔔</span>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notifications push</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recevoir des notifications en temps réel</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setPushNotifications(!pushNotifications)
                        addToast(`Notifications push ${!pushNotifications ? 'activées' : 'désactivées'}`, 'success')
                      }}
                      className={`w-16 h-9 rounded-full cursor-pointer transition-colors relative ${pushNotifications ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                      <motion.div
                        animate={{ x: pushNotifications ? 28 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-7 h-7 bg-white rounded-full shadow-lg absolute top-1"
                      />
                    </motion.button>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Emails récapitulatifs</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recevoir un email hebdomadaire</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEmailNotifications(!emailNotifications)
                        addToast(`Emails ${!emailNotifications ? 'activés' : 'désactivés'}`, 'success')
                      }}
                      className={`w-16 h-9 rounded-full cursor-pointer transition-colors relative ${emailNotifications ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                      <motion.div
                        animate={{ x: emailNotifications ? 28 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-7 h-7 bg-white rounded-full shadow-lg absolute top-1"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Langue & Région</h4>
                <select 
                  className={`w-full p-4 border-2 rounded-xl cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  onChange={() => addToast('Langue mise à jour', 'success')}
                >
                  <option>🇫🇷 Français</option>
                  <option>🇬🇧 English</option>
                  <option>🇸🇦 العربية</option>
                </select>
              </div>

              {/* Danger Zone */}
              <div>
                <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">Zone de danger</h4>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToast('Cette action est irréversible', 'warning')}
                  className="w-full p-4 border-2 border-red-200 text-red-600 rounded-xl font-semibold cursor-pointer hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  Supprimer mon compte
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Profile Modal
  const ProfileModal = () => (
    <AnimatePresence>
      {showProfileModal && currentUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden`}
          >
            <div className="h-24 bg-gradient-to-r from-red-500 to-red-600 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white cursor-pointer"
                >
                  {currentUser.name.charAt(0)}
                </motion.div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-6 text-center">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{currentUser.email}</p>
              <span className="inline-block mt-3 px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                {currentUser.role || 'Utilisateur'}
              </span>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} space-y-3`}>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addToast('Modification du profil...', 'info')
                  setShowProfileModal(false)
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all`}
              >
                <span className="text-2xl">✏️</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Modifier le profil</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addToast('Changement de mot de passe...', 'info')
                  setShowProfileModal(false)
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all`}
              >
                <span className="text-2xl">🔐</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Changer le mot de passe</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleLogout()
                  setShowProfileModal(false)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-red-50 transition-all text-red-600"
              >
                <span className="text-2xl">🚪</span>
                <span className="font-medium">Se déconnecter</span>
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
        setShowProfileModal(false)
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey) && isLoggedIn) {
        e.preventDefault()
        setShowReportModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoggedIn])

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearchModal])

  // Dashboard Component
  if (isLoggedIn && currentUser) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex transition-colors duration-500`}>
        {showConfetti && <Confetti />}
        <ToastContainer />
        <SearchModal />
        <ReportModal />
        <SettingsModal />
        <ProfileModal />

        {/* Custom Cursor Glow Effect */}
        <div 
          className="fixed w-64 h-64 pointer-events-none z-0 opacity-20 blur-3xl transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
          }}
        />

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0, width: sidebarCollapsed ? 80 : 256 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gradient-to-b from-red-600 via-red-600 to-red-700 text-white min-h-screen fixed left-0 top-0 z-30 shadow-2xl"
            >
              {/* Logo */}
              <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <span className="text-red-600 text-xl font-bold">O</span>
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <h1 className="text-xl font-bold tracking-wide">Ooredoo</h1>
                      <p className="text-red-200 text-xs">Dashboard Analytics</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search shortcut */}
              {!sidebarCollapsed && (
                <div className="px-4 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSearchModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-red-100 text-sm transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Rechercher...</span>
                    <kbd className="ml-auto px-2 py-1 bg-white/10 rounded-lg text-xs font-mono">⌘K</kbd>
                  </motion.button>
                </div>
              )}

              {/* Navigation */}
              <nav className="mt-2 px-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: sidebarCollapsed ? 0 : 5, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveNav(index)
                      if (item.label === 'Paramètres') {
                        setShowSettingsModal(true)
                      } else if (item.label === 'Notifications') {
                        setShowNotifications(true)
                      } else {
                        addToast(`Navigation vers ${item.label}`, 'info')
                      }
                    }}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3.5 my-1 rounded-xl transition-all relative cursor-pointer ${
                      activeNav === index 
                        ? 'bg-white/20 shadow-lg' 
                        : ''
                    }`}
                  >
                    {activeNav === index && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="text-xl">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        {item.badge && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.badge === 'Nouveau' 
                                ? 'bg-yellow-400 text-yellow-900' 
                                : 'bg-white/25 text-white'
                            }`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Bottom Card */}
              {!sidebarCollapsed && (
                <div className="absolute bottom-6 left-4 right-4">
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 cursor-pointer border border-white/10"
                    onClick={() => addToast('Support contacté! 📞', 'success')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-xl">💬</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Besoin d'aide ?</p>
                        <p className="text-xs text-red-200">Support 24/7</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 bg-white text-red-600 rounded-lg text-sm font-semibold cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToast('Chat en direct ouvert', 'info')
                        }}
                      >
                        Chat
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToast('Email envoyé au support', 'success')
                        }}
                      >
                        Email
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? (sidebarCollapsed ? 'ml-20' : 'ml-64') : ''}`}>
          {/* Top Bar */}
          <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-xl shadow-sm sticky top-0 z-20 transition-colors border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition cursor-pointer`}
                >
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {navItems[activeNav].label}
                    </h2>
                    <span className="text-2xl">{navItems[activeNav].icon}</span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Bienvenue, {currentUser.name} 👋
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearchModal(true)}
                  className={`p-2.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition hidden md:flex cursor-pointer`}
                >
                  <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>

                {/* Dark Mode Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDarkMode(!darkMode)
                    addToast(`Mode ${!darkMode ? 'sombre 🌙' : 'clair ☀️'} activé`, 'success')
                  }}
                  className={`p-2.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition cursor-pointer`}
                >
                  <motion.div
                    animate={{ rotate: darkMode ? 0 : 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    {darkMode ? (
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </motion.div>
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition cursor-pointer`}
                  >
                    <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg"
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
                        className={`absolute right-0 mt-2 w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden z-50`}
                      >
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between bg-gradient-to-r ${darkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔔</span>
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{unreadCount}</span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Tout marquer lu
                          </motion.button>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <span className="text-4xl">📭</span>
                              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune notification</p>
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                                onClick={() => markNotificationAsRead(notif.id)}
                                className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer ${!notif.read ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') : ''} group relative`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                                    notif.type === 'success' ? 'bg-green-100' :
                                    notif.type === 'warning' ? 'bg-yellow-100' :
                                    notif.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                                  }`}>
                                    {notif.type === 'success' ? '✅' :
                                     notif.type === 'warning' ? '⚠️' :
                                     notif.type === 'error' ? '❌' : 'ℹ️'}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{notif.title}</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 line-clamp-2`}>{notif.message}</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{notif.time}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!notif.read && (
                                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                    <motion.button
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notif.id)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg transition cursor-pointer"
                                    >
                                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                        <motion.button
                          whileHover={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
                          className={`w-full p-4 text-center text-sm font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} cursor-pointer`}
                          onClick={() => {
                            setShowNotifications(false)
                            addToast('Voir toutes les notifications', 'info')
                          }}
                        >
                          Voir toutes les notifications →
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className={`flex items-center gap-3 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition cursor-pointer`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {currentUser.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>{currentUser.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.role}</p>
                    </div>
                    <motion.svg 
                      animate={{ rotate: showAccountMenu ? 180 : 0 }}
                      className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden lg:block`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* Account Dropdown */}
                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden z-50`}
                      >
                        {/* Current Account */}
                        <div 
                          className={`p-4 ${darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-red-50 to-red-100'} cursor-pointer`}
                          onClick={() => {
                            setShowProfileModal(true)
                            setShowAccountMenu(false)
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                            >
                              {currentUser.name.charAt(0)}
                            </motion.div>
                            <div>
                              <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser.email}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                {currentUser.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Saved Accounts */}
                        {savedAccounts.length > 1 && (
                          <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} px-3 py-2 font-semibold uppercase tracking-wider`}>Autres comptes</p>
                            {savedAccounts
                              .filter(acc => acc.email !== currentUser.email)
                              .map((account, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ scale: 1.01, x: 5 }}
                                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                >
                                  <div 
                                    className="flex items-center gap-3 flex-1"
                                    onClick={() => handleSwitchAccount(account)}
                                  >
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow">
                                      {account.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>{account.name}</p>
                                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{account.email}</p>
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveAccount(account.email)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition cursor-pointer"
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
                            whileHover={{ scale: 1.01, x: 5 }}
                            onClick={() => {
                              setShowProfileModal(true)
                              setShowAccountMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                              <span className="text-lg">👤</span>
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Mon profil</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.01, x: 5 }}
                            onClick={handleAddAccount}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Ajouter un compte</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.01, x: 5 }}
                            onClick={() => {
                              setShowSettingsModal(true)
                              setShowAccountMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                              <span className="text-lg">⚙️</span>
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Paramètres</span>
                          </motion.button>

                          <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />

                          <motion.button
                            whileHover={{ scale: 1.01, x: 5, backgroundColor: '#fef2f2' }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer text-red-600"
                          >
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                              <span className="text-lg">🚪</span>
                            </div>
                            <span className="text-sm font-semibold">Se déconnecter</span>
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
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-6 rounded-3xl ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white relative overflow-hidden`}
            >
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute left-20 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-2">Bonjour, {currentUser.name}! 👋</h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-red-100'} mb-4`}>Voici un aperçu de vos performances aujourd'hui</p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReportModal(true)}
                    className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-semibold shadow-lg cursor-pointer"
                  >
                    📊 Générer un rapport
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToast('Tutoriel en cours...', 'info')}
                    className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold cursor-pointer backdrop-blur-sm"
                  >
                    🎬 Voir le tutoriel
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, boxShadow: darkMode ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                  onClick={() => addToast(`Détails: ${stat.title}`, 'info')}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.span 
                      className="text-4xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      {stat.icon}
                    </motion.span>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${
                      stat.change.startsWith('+') 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {stat.change.startsWith('+') ? '↑' : '↓'} {stat.change}
                    </span>
                  </div>
                  <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-semibold uppercase tracking-wider`}>{stat.title}</h3>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mt-2`}>{stat.value}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>{stat.description}</p>
                  <div className="mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
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
                className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>📈 Aperçu des Performances</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyse des données en temps réel</p>
                  </div>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value)
                      addToast(`Période: ${e.target.value}`, 'info')
                    }}
                    className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 text-gray-600 bg-white'
                    }`}
                  >
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                    <option>Cette année</option>
                  </select>
                </div>
                <div className={`h-72 flex items-center justify-center ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-gray-100'} rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-7xl block">📊</span>
                    </motion.div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4 font-medium`}>Zone graphique Power BI</p>
                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>Intégration en cours de développement</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToast('Chargement des données Power BI...', 'info')}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold shadow-lg cursor-pointer"
                    >
                      🔄 Charger les données
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>⚡ Activité Récente</h3>
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => addToast('Actualisation...', 'info')}
                    className={`p-2 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => addToast(`Détails: ${item.action}`, 'info')}
                      className={`flex items-center gap-4 p-4 ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-2xl transition cursor-pointer group`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'} truncate`}>{item.action}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.user} • {item.time}</p>
                      </div>
                      <svg className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'} opacity-0 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToast('Voir toute l\'activité', 'info')}
                  className={`w-full mt-4 py-3.5 text-center text-sm font-semibold ${darkMode ? 'text-red-400 bg-gray-700/50 hover:bg-gray-700' : 'text-red-600 bg-red-50 hover:bg-red-100'} rounded-2xl transition cursor-pointer`}
                >
                  Voir tout l'historique →
                </motion.button>
              </motion.div>
            </div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: '📥', label: 'Exporter données', desc: 'CSV, Excel, PDF' },
                { icon: '📧', label: 'Envoyer rapport', desc: 'Par email' },
                { icon: '🔄', label: 'Synchroniser', desc: 'Mise à jour' },
                { icon: '📅', label: 'Planifier', desc: 'Automatiser' },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToast(`${action.label} en cours...`, 'info')}
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-6 rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex flex-col items-center gap-3 transition cursor-pointer group`}
                >
                  <motion.span 
                    className="text-4xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {action.icon}
                  </motion.span>
                  <div className="text-center">
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-700'} block`}>{action.label}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{action.desc}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </main>

          {/* Footer */}
          <footer className={`p-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
            <p>© 2024 Ooredoo Tunisia. Tous droits réservés. Made with ❤️</p>
          </footer>
        </div>

        {/* Click outside to close menus */}
        {(showAccountMenu || showNotifications) && (
          <div 
            className="fixed inset-0 z-10" 
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4 relative overflow-hidden">
      <ToastContainer />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-red-200 to-red-100 rounded-full opacity-60 blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-300 to-red-100 rounded-full opacity-50 blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-200 rounded-full opacity-30 blur-3xl"
        />
      </div>

      {/* Floating Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-red-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative grid md:grid-cols-2 items-center gap-8 bg-white/70 backdrop-blur-2xl shadow-2xl rounded-[2rem] p-8 md:p-12 w-full max-w-5xl border border-white/50"
      >
        {/* Left side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <motion.img
            src={loginImage}
            alt="Login illustration"
            className="w-full max-w-md object-contain drop-shadow-2xl"
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <h3 className="text-2xl font-bold text-gray-800">Plateforme Analytics</h3>
            <p className="text-gray-500 mt-2 text-lg">Accédez à vos données en temps réel</p>
            <div className="flex justify-center gap-3 mt-6">
              {['📊', '📈', '🎯'].map((emoji, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <span className="text-white text-4xl font-bold">O</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-800 text-center mb-3"
          >
            {showAddAccount ? "Ajouter un compte" : "Bienvenue! 👋"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-gray-500 mb-8 text-lg"
          >
            {showAddAccount 
              ? "Connectez-vous avec un autre compte"
              : "Connectez-vous à votre espace Ooredoo"
            }
          </motion.p>

          {/* Saved accounts */}
          {!showAddAccount && savedAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-500 mb-3 font-semibold">Comptes récents</p>
              <div className="space-y-2">
                {savedAccounts.map((account, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEmail(account.email)
                      setPassword("")
                    }}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl transition cursor-pointer ${
                      email === account.email 
                        ? 'border-red-500 bg-red-50 shadow-lg' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {account.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.email}</p>
                    </div>
                    {email === account.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-gray-500 font-medium">ou connectez-vous</span>
                </div>
              </div>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-xl group-focus-within:scale-110 transition-transform">📧</span>
              </div>
              <input
                type="email"
                placeholder="Email Ooredoo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white/50 focus:bg-white text-lg"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-xl group-focus-within:scale-110 transition-transform">🔐</span>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white/50 focus:bg-white text-lg"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                <span className="text-xl">{showPassword ? '🙈' : '👁️'}</span>
              </motion.button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-between items-center"
            >
              <label className="flex items-center gap-3 cursor-pointer group">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                    rememberMe ? 'bg-red-500 border-red-500' : 'border-gray-300 group-hover:border-red-400'
                  }`}
                >
                  <AnimatePresence>
                    {rememberMe && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-gray-600 group-hover:text-gray-800 transition font-medium">Se souvenir de moi</span>
              </label>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.05, x: 3 }}
                onClick={(e) => {
                  e.preventDefault()
                  addToast("Un email de réinitialisation a été envoyé 📧", "info")
                }}
                className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                Mot de passe oublié ?
              </motion.a>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: "0 20px 40px -10px rgba(220, 38, 38, 0.4)" }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition flex items-center justify-center gap-3 cursor-pointer ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </>
              )}
            </motion.button>

            {showAddAccount && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddAccount(false)}
                className="w-full py-4 text-gray-600 hover:text-gray-800 font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>←</span>
                Retour aux comptes sauvegardés
              </motion.button>
            )}
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
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