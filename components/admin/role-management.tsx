// V9.13.4: Role Management Component
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users,
  Shield,
  Crown,
  UserCheck,
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Mail,
  Calendar,
  Activity
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { RBACService, Role, ROLE_DEFINITIONS, Permission } from '@/lib/rbac'

interface SystemUser {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: Date
  createdAt: Date
  avatar?: string
  permissions: Permission[]
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  status: 'active' | 'inactive' | 'suspended'
  totalOrders: number
  totalSpent: number
  loyaltyPoints: number
  isPremium: boolean
  lastOrderDate?: Date
  createdAt: Date
  avatar?: string
}

interface RoleManagementProps {
  currentUserRole: Role
}

export function RoleManagement({ currentUserRole }: RoleManagementProps) {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all')
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [selectedTab, setSelectedTab] = useState('users')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  useEffect(() => {
    // Mock users data
    const mockUsers: SystemUser[] = [
      {
        id: '1',
        name: 'Kirtan Patel',
        email: 'kirtan@sportsdevil.co.uk',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('super_admin')
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@sportsdevil.co.uk',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('admin')
      },
      {
        id: '6',
        name: 'Alex Thompson',
        email: 'alex@sportsdevil.co.uk',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('admin')
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike@sportsdevil.co.uk',
        role: 'manager',
        status: 'active',
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('manager')
      },
      {
        id: '4',
        name: 'Emma Patel',
        email: 'emma@sportsdevil.co.uk',
        role: 'family_member',
        status: 'active',
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('family_member')
      },
      {
        id: '5',
        name: 'James Davis',
        email: 'james@external.com',
        role: 'viewer',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        permissions: RBACService.getRolePermissions('viewer')
      }
    ]

    setUsers(mockUsers)

    // Mock customer data
    const mockCustomers: Customer[] = [
      {
        id: 'cust-001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+44 7700 900001',
        address: '123 High Street, London SW1A 1AA',
        status: 'active',
        totalOrders: 15,
        totalSpent: 1250.99,
        loyaltyPoints: 2500,
        isPremium: true,
        lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'cust-002',
        name: 'Emily Johnson',
        email: 'emily.johnson@email.com',
        phone: '+44 7700 900002',
        address: '456 Oak Avenue, Manchester M1 1AA',
        status: 'active',
        totalOrders: 8,
        totalSpent: 675.50,
        loyaltyPoints: 1350,
        isPremium: false,
        lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'cust-003',
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+44 7700 900003',
        address: '789 Elm Street, Birmingham B1 1AA',
        status: 'inactive',
        totalOrders: 3,
        totalSpent: 189.99,
        loyaltyPoints: 380,
        isPremium: false,
        lastOrderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'cust-004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+44 7700 900004',
        address: '321 Pine Road, Liverpool L1 1AA',
        status: 'suspended',
        totalOrders: 12,
        totalSpent: 890.25,
        loyaltyPoints: 1780,
        isPremium: false,
        lastOrderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'cust-005',
        name: 'David Taylor',
        email: 'david.taylor@email.com',
        phone: '+44 7700 900005',
        address: '654 Maple Lane, Edinburgh EH1 1AA',
        status: 'active',
        totalOrders: 22,
        totalSpent: 1850.75,
        loyaltyPoints: 3700,
        isPremium: true,
        lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000)
      }
    ]

    setCustomers(mockCustomers)
  }, [])

  useEffect(() => {
    let filtered = users

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, selectedRole])

  useEffect(() => {
    let filtered = customers

    // Filter by search query
    if (customerSearchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(customerSearchQuery))
      )
    }

    // Filter by status
    if (selectedCustomerStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === selectedCustomerStatus)
    }

    setFilteredCustomers(filtered)
  }, [customers, customerSearchQuery, selectedCustomerStatus])

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-red-600" />
      case 'admin': return <Shield className="h-4 w-4 text-orange-600" />
      case 'manager': return <UserCheck className="h-4 w-4 text-blue-600" />
      case 'family_member': return <Users className="h-4 w-4 text-green-600" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />
      default: return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: Role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-orange-100 text-orange-800 border-orange-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      family_member: 'bg-green-100 text-green-800 border-green-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[role] || colors.viewer
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive': return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive': return 'text-red-600 bg-red-50 border-red-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const canManageUser = (targetUser: SystemUser) => {
    // Simple role hierarchy check
    const roleHierarchy = ['super_admin', 'admin', 'manager', 'family_member', 'viewer']
    const currentRoleIndex = roleHierarchy.indexOf(currentUserRole)
    const targetRoleIndex = roleHierarchy.indexOf(targetUser.role)
    return currentRoleIndex <= targetRoleIndex
  }

  const assignableRoles = RBACService.getAssignableRoles(null) // Temporary - should use actual user context

  const handleRoleChange = (userId: string, newRole: Role) => {
    const canAssign = assignableRoles.includes(newRole)
    if (!canAssign) {
      alert('You do not have permission to assign this role')
      return
    }

    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, role: newRole, permissions: RBACService.getRolePermissions(newRole) }
        : user
    ))
  }

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ))
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && !canManageUser(user)) {
      alert('You do not have permission to delete this user')
      return
    }

    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)} days ago`
    return date.toLocaleDateString()
  }

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'suspended': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleCustomerStatusChange = (customerId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setCustomers(prev => prev.map(customer =>
      customer.id === customerId ? { ...customer, status: newStatus } : customer
    ))
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer account? This action cannot be undone.')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId))
    }
  }

  const roleStats = RBACService.getAllRoles().map(role => ({
    name: role,
    displayName: ROLE_DEFINITIONS[role].displayName,
    color: 'blue', // Default color for now
    count: users.filter(u => u.role === role).length
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${getRoleColor(currentUserRole)} text-xs`} variant="secondary">
              {getRoleIcon(currentUserRole)}
              <span className="ml-1">Your Role: {ROLE_DEFINITIONS[currentUserRole].displayName}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              You can manage: {RBACService.getAssignableRoles(null).map(r => ROLE_DEFINITIONS[r].displayName).join(', ')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="default">
                <User className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="user@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input placeholder="Enter password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role)}
                            <span>{ROLE_DEFINITIONS[role].displayName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>
                    Add User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="outline">
                <Mail className="h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          {ROLE_DEFINITIONS[role].displayName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Send Invitation</Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roleStats.map((role) => (
          <EnhancedCard key={role.name} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${role.color}-50`}>
                {getRoleIcon(role.name)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{ROLE_DEFINITIONS[role.name as Role]?.displayName}</p>
                <p className="text-2xl font-bold">{role.count}</p>
              </div>
            </div>
          </EnhancedCard>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {RBACService.getAllRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      {ROLE_DEFINITIONS[role].displayName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <EnhancedCard key={user.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getRoleColor(user.role)} text-xs`} variant="secondary">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{ROLE_DEFINITIONS[user.role].displayName}</span>
                        </Badge>
                        <Badge className={`${getStatusColor(user.status)} text-xs`} variant="secondary">
                          {getStatusIcon(user.status)}
                          <span className="ml-1 capitalize">{user.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="text-sm font-medium">{formatLastLogin(user.lastLogin)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">{user.createdAt.toLocaleDateString()}</p>
                    </div>
                    
                    {canManageUser(user) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {assignableRoles.map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleRoleChange(user.id, role)}
                              disabled={user.role === role}
                            >
                              {getRoleIcon(role)}
                              <span className="ml-2">Make {ROLE_DEFINITIONS[role].displayName}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                          >
                            {user.status === 'active' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.role !== 'super_admin' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <EnhancedCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </EnhancedCard>
            <EnhancedCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{customers.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </EnhancedCard>
            <EnhancedCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-2xl font-bold">{customers.filter(c => c.isPremium).length}</p>
                </div>
              </div>
            </EnhancedCard>
            <EnhancedCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <span className="text-orange-600 font-bold text-lg">£</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">£{customers.reduce((total, c) => total + c.totalSpent, 0).toLocaleString()}</p>
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* Customer Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCustomerStatus} onValueChange={(value) => setSelectedCustomerStatus(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers List */}
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <EnhancedCard key={customer.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                        {getUserInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        {customer.isPremium && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs" variant="secondary">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getCustomerStatusColor(customer.status)} text-xs`} variant="secondary">
                          {getStatusIcon(customer.status)}
                          <span className="ml-1 capitalize">{customer.status}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {customer.loyaltyPoints} points
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-sm font-medium">{customer.totalOrders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-sm font-medium">£{customer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Order</p>
                      <p className="text-sm font-medium">
                        {customer.lastOrderDate ? formatLastLogin(customer.lastOrderDate) : 'Never'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">{customer.createdAt.toLocaleDateString()}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCustomerStatusChange(customer.id, 'active')}
                          disabled={customer.status === 'active'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCustomerStatusChange(customer.id, 'inactive')}
                          disabled={customer.status === 'inactive'}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCustomerStatusChange(customer.id, 'suspended')}
                          disabled={customer.status === 'suspended'}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </EnhancedCard>
            ))}
            {filteredCustomers.length === 0 && (
              <EnhancedCard className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No customers found</h3>
                <p className="text-sm text-muted-foreground">
                  {customerSearchQuery ? 'Try adjusting your search criteria' : 'No customers match the selected filters'}
                </p>
              </EnhancedCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-4">
            {RBACService.getAllRoles().map((role) => (
              <EnhancedCard key={role} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-blue-50`}>
                        {getRoleIcon(role)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{ROLE_DEFINITIONS[role].displayName}</h3>
                        <p className="text-muted-foreground">{ROLE_DEFINITIONS[role].description}</p>
                      </div>
                    </div>
                    
                    <div className="pl-12">
                      <p className="text-sm font-medium mb-2">Permissions</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {RBACService.getRolePermissions(role.toUpperCase()).slice(0, 12).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace(/[_:]/g, ' ')}
                          </Badge>
                        ))}
                        {RBACService.getRolePermissions(role.toUpperCase()).length > 12 && (
                          <Badge variant="outline" className="text-xs">
                            +{RBACService.getRolePermissions(role.toUpperCase()).length - 12} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={`${getRoleColor(role)} text-sm`} variant="secondary">
                      {roleStats.find(r => r.name === role)?.count || 0} users
                    </Badge>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Permission Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Permission</th>
                    {RBACService.getAllRoles().map(role => (
                      <th key={role} className="text-center p-2 min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          {getRoleIcon(role)}
                          <span className="text-xs">{ROLE_DEFINITIONS[role].displayName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(
                    RBACService.getAllRoles().flatMap(role => RBACService.getRolePermissions(role.toUpperCase()))
                  )).sort().map(permission => (
                    <tr key={permission} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        {permission.replace(/[_:]/g, ' ')}
                      </td>
                      {RBACService.getAllRoles().map(role => (
                        <td key={role} className="p-2 text-center">
                          {RBACService.getRolePermissions(role.toUpperCase()).includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}