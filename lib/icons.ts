// Optimized Lucide React icon imports
// This file imports only the icons actually used in the codebase
// This reduces the bundle size significantly compared to importing the entire lucide-react library

// Core UI Icons
export { 
  ArrowLeft,
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  X,
  Plus,
  Minus,
  Check,
  Circle,
  Dot
} from 'lucide-react'

// Navigation & Interface
export {
  Menu,
  Search,
  Filter,
  SlidersHorizontal,
  Settings,
  Home,
  PanelLeft,
  GripVertical
} from 'lucide-react'

// E-commerce Icons
export {
  ShoppingCart,
  ShoppingBag,
  Star,
  Heart,
  Eye,
  Package,
  Truck,
  CreditCard,
  Wallet,
  Smartphone,
  Shield
} from 'lucide-react'

// User & Account
export {
  User,
  UserPlus,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Lock,
  Eye as EyeIcon,
  EyeOff
} from 'lucide-react'

// Status & Feedback
export {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  Activity,
  Bell
} from 'lucide-react'

// Content & Media
export {
  Instagram,
  Facebook,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Send,
  Quote,
  ThumbsUp,
  ThumbsDown,
  Verified
} from 'lucide-react'

// Business & Admin
export {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  MapPin,
  Calendar,
  CalendarIcon,
  Award,
  Handshake,
  Headphones
} from 'lucide-react'

// Form & Input
export {
  Upload,
  Download,
  Save,
  Edit,
  Trash2,
  Copy,
  Share,
  FileText,
  Image,
  Video,
  Mic
} from 'lucide-react'

// Device & Platform
export {
  Monitor,
  Tablet,
  Smartphone as SmartphoneIcon
} from 'lucide-react'

// Additional specific icons used in the codebase
export {
  Weight,
  Ruler,
  Info as InfoIcon,
  Badge as BadgeIcon,
  Tag,
  Percent,
  DollarSign,
  Coins,
  Gift,
  Target,
  Zap as ZapIcon,
  Clock,
  Timer,
  Building,
  Store,
  Warehouse,
  Boxes
} from 'lucide-react'

// Type exports for better TypeScript support
export type { LucideIcon } from 'lucide-react'

// Re-export commonly used icon types
export type IconType = React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>