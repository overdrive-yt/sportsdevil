// V9.13.3: Social Media Management Interface
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera,
  Video,
  Calendar,
  Send,
  Save,
  Image as ImageIcon,
  MapPin,
  Tag,
  Hash,
  AtSign,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SocialPlatform {
  id: string
  name: 'Instagram' | 'Facebook' | 'Google'
  isConnected: boolean
  status: 'active' | 'error' | 'pending'
  followers: number
  engagement: number
  lastPost: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
}

interface SocialPost {
  id: string
  platform: string[]
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }[]
  hashtags: string[]
  mentions: string[]
  location?: string
  scheduledFor?: Date
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  engagement?: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  publishedAt?: Date
}

interface ContentTemplate {
  id: string
  name: string
  content: string
  hashtags: string[]
  category: 'product' | 'promotional' | 'educational' | 'community'
  platforms: string[]
}

export function SocialMediaManager() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [selectedTab, setSelectedTab] = useState('compose')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [newPost, setNewPost] = useState<Partial<SocialPost>>({
    content: '',
    platform: [],
    hashtags: [],
    mentions: [],
    status: 'draft'
  })

  useEffect(() => {
    // Mock data initialization
    const mockPlatforms: SocialPlatform[] = [
      {
        id: 'instagram',
        name: 'Instagram',
        isConnected: true,
        status: 'active',
        followers: 12500,
        engagement: 4.2,
        lastPost: '2 hours ago',
        health: 'excellent'
      },
      {
        id: 'facebook',
        name: 'Facebook',
        isConnected: true,
        status: 'active',
        followers: 8900,
        engagement: 3.8,
        lastPost: '5 hours ago',
        health: 'good'
      },
      {
        id: 'google',
        name: 'Google',
        isConnected: false,
        status: 'pending',
        followers: 0,
        engagement: 0,
        lastPost: 'Never',
        health: 'fair'
      }
    ]

    const mockPosts: SocialPost[] = [
      {
        id: '1',
        platform: ['Instagram', 'Facebook'],
        content: 'New cricket bat collection just arrived! 🏏 Perfect for the upcoming season. #CricketEquipment #ProfessionalCricket #SportsDevil',
        hashtags: ['CricketEquipment', 'ProfessionalCricket', 'SportsDevil'],
        mentions: [],
        status: 'published',
        engagement: {
          likes: 245,
          comments: 18,
          shares: 12,
          views: 1420
        },
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        platform: ['Instagram'],
        content: 'Training tip Tuesday: Proper grip technique for maximum batting performance 💪 #CricketTips #Training #TechniqueTuesday',
        hashtags: ['CricketTips', 'Training', 'TechniqueTuesday'],
        mentions: [],
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        platform: ['Facebook'],
        content: 'Thank you to all our customers for making us the #1 cricket equipment supplier in the region! 🏆',
        hashtags: [],
        mentions: [],
        status: 'draft'
      }
    ]

    const mockTemplates: ContentTemplate[] = [
      {
        id: '1',
        name: 'New Product Announcement',
        content: 'Introducing our latest {product_name}! Perfect for {use_case}. Available now at {website}.',
        hashtags: ['NewProduct', 'CricketEquipment', 'SportsDevil'],
        category: 'product',
        platforms: ['Instagram', 'Facebook']
      },
      {
        id: '2',
        name: 'Training Tip',
        content: '{tip_category}: {tip_content} 💪 Share your progress in the comments!',
        hashtags: ['CricketTips', 'Training'],
        category: 'educational',
        platforms: ['Instagram', 'Facebook']
      },
      {
        id: '3',
        name: 'Customer Spotlight',
        content: 'Amazing performance by {customer_name} using our {product}! 🏏 #CustomerSpotlight',
        hashtags: ['CustomerSpotlight', 'CricketSuccess', 'ProudSupplier'],
        category: 'community',
        platforms: ['Instagram', 'Facebook']
      }
    ]

    setPlatforms(mockPlatforms)
    setPosts(mockPosts)
    setTemplates(mockTemplates)
  }, [])

  const handleCreatePost = () => {
    if (!newPost.content || !newPost.platform?.length) return

    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform,
      content: newPost.content,
      hashtags: newPost.hashtags || [],
      mentions: newPost.mentions || [],
      location: newPost.location,
      scheduledFor: newPost.scheduledFor,
      status: newPost.scheduledFor ? 'scheduled' : 'draft'
    }

    setPosts(prev => [post, ...prev])
    setNewPost({
      content: '',
      platform: [],
      hashtags: [],
      mentions: [],
      status: 'draft'
    })
    setIsCreatingPost(false)
  }

  const handlePublishPost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: 'published', publishedAt: new Date() }
        : post
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50 border-green-200'
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return '📷'
      case 'Facebook': return '👥'
      case 'Google': return '🔍'
      default: return '📱'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Manager</h2>
          <p className="text-muted-foreground">
            Manage your social media presence across all platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </Button>
          <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Social Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex gap-2">
                    {platforms.filter(p => p.isConnected).map(platform => (
                      <Button
                        key={platform.id}
                        variant={newPost.platform?.includes(platform.name) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const currentPlatforms = newPost.platform || []
                          const updated = currentPlatforms.includes(platform.name)
                            ? currentPlatforms.filter(p => p !== platform.name)
                            : [...currentPlatforms, platform.name]
                          setNewPost(prev => ({ ...prev, platform: updated }))
                        }}
                        className="gap-2"
                      >
                        <span>{getPlatformIcon(platform.name)}</span>
                        {platform.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="What's happening with your cricket equipment business?"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <Input
                      placeholder="#cricket #equipment #sports"
                      value={newPost.hashtags?.join(' ') || ''}
                      onChange={(e) => {
                        const hashtags = e.target.value.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.substring(1))
                        setNewPost(prev => ({ ...prev, hashtags }))
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Sports Devil Store"
                      value={newPost.location || ''}
                      onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newPost.scheduledFor?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      setNewPost(prev => ({ ...prev, scheduledFor: date }))
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingPost(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost}>
                    {newPost.scheduledFor ? 'Schedule Post' : 'Save Draft'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <EnhancedCard key={platform.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getPlatformIcon(platform.name)}</div>
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      platform.status === 'active' ? 'bg-green-500' :
                      platform.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {platform.status}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={getHealthColor(platform.health)} variant="outline">
                {platform.health}
              </Badge>
            </div>

            {platform.isConnected ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="font-semibold">{platform.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="font-semibold">{platform.engagement}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Post</span>
                  <span className="font-semibold">{platform.lastPost}</span>
                </div>
                <Progress value={platform.engagement * 20} className="h-2" />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Not connected</p>
                <Button size="sm" variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Connect
                </Button>
              </div>
            )}
          </EnhancedCard>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Draft Posts</h3>
              {posts.filter(post => post.status === 'draft').map((post) => (
                <EnhancedCard key={post.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {post.platform.map(platform => (
                          <span key={platform} className="text-sm">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                        <Badge className={getStatusColor(post.status)} variant="secondary">
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm">{post.content}</p>
                    
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Draft saved
                      </span>
                      <Button size="sm" onClick={() => handlePublishPost(post.id)}>
                        Publish Now
                      </Button>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Content Templates</h3>
              {templates.map((template) => (
                <EnhancedCard key={template.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Use
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{template.content}</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {template.platforms.map(platform => (
                          <span key={platform} className="text-xs">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.hashtags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="space-y-4">
            {posts.filter(post => post.status === 'scheduled').map((post) => (
              <EnhancedCard key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      {post.platform.map(platform => (
                        <span key={platform} className="text-lg">
                          {getPlatformIcon(platform)}
                        </span>
                      ))}
                      <Badge className={getStatusColor(post.status)} variant="secondary">
                        Scheduled
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {post.scheduledFor?.toLocaleDateString()} at {post.scheduledFor?.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <p className="text-sm">{post.content}</p>
                    
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="space-y-4">
            {posts.filter(post => post.status === 'published').map((post) => (
              <EnhancedCard key={post.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {post.platform.map(platform => (
                          <span key={platform} className="text-lg">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                        <Badge className={getStatusColor(post.status)} variant="secondary">
                          Published
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {post.publishedAt?.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm">{post.content}</p>
                      
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {post.engagement && (
                    <div className="flex items-center gap-6 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{post.engagement.shares}</span>
                      </div>
                      {post.engagement.views && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{post.engagement.views}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold">45.2K</p>
                </div>
              </div>
              <div className="text-sm text-green-600">+12.5% from last month</div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold">3.8%</p>
                </div>
              </div>
              <div className="text-sm text-green-600">+0.3% from last month</div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Followers</p>
                  <p className="text-2xl font-bold">1.2K</p>
                </div>
              </div>
              <div className="text-sm text-green-600">+8.7% from last month</div>
            </EnhancedCard>
          </div>

          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Performance by Platform</h3>
            <div className="space-y-4">
              {platforms.filter(p => p.isConnected).map((platform) => (
                <div key={platform.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getPlatformIcon(platform.name)}</span>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {platform.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{platform.engagement}%</p>
                    <p className="text-sm text-muted-foreground">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}