// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// Direct Migration Interface - Bypasses Admin Dashboard

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download,
  Upload,
  Database,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Package,
  FolderOpen,
  Zap,
  Settings
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { MigrationProgress } from '@/lib/temp-migration/database-migrator'

interface MigrationConfig {
  siteUrl: string
  consumerKey: string
  consumerSecret: string
}


interface SiteInfo {
  version: string
  wooVersion: string
  siteName: string
}

export default function TempMigrationPage() {
  // States
  const [config, setConfig] = useState<MigrationConfig>({
    siteUrl: process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || '',
    consumerKey: '',
    consumerSecret: ''
  })
  const [categoryFilter, setCategoryFilter] = useState('images-only')
  const [testResult, setTestResult] = useState<any>(null)
  const [istesting, setIsTestring] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [progress, setProgress] = useState<MigrationProgress | null>(null)
  const [migrationComplete, setMigrationComplete] = useState(false)

  // Test WooCommerce connection
  const handleTestConnection = async () => {
    if (!config.siteUrl || !config.consumerKey || !config.consumerSecret) {
      alert('Please fill in all WooCommerce API details')
      return
    }

    setIsTestring(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/temp-migration/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      setTestResult(result)

    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to test connection: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setIsTestring(false)
    }
  }

  // Start migration
  const handleStartMigration = async () => {
    if (!testResult?.success) {
      alert('Please test the connection first')
      return
    }

    if (!confirm('🚨 WARNING: This will import all WooCommerce products into your Sports Devil database.\\n\\nThis action cannot be undone. Are you sure you want to proceed?')) {
      return
    }

    setIsMigrating(true)
    setProgress(null)
    setMigrationComplete(false)

    try {
      const response = await fetch('/api/temp-migration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          options: {
            categoryFilter: categoryFilter
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Start polling for progress
        pollProgress()
      } else {
        alert('Failed to start migration: ' + result.error)
        setIsMigrating(false)
      }

    } catch (error) {
      alert('Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsMigrating(false)
    }
  }

  // Poll migration progress
  const pollProgress = async () => {
    try {
      const response = await fetch('/api/temp-migration/start')
      const result = await response.json()

      if (result.success && result.progress) {
        setProgress(result.progress)

        if (result.progress.step === 'complete') {
          setMigrationComplete(true)
          setIsMigrating(false)
        } else if (result.progress.step === 'error') {
          setIsMigrating(false)
        } else {
          // Continue polling
          setTimeout(pollProgress, 2000)
        }
      }
    } catch (error) {
      console.error('Failed to poll progress:', error)
      setTimeout(pollProgress, 5000) // Retry in 5 seconds
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Download className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">WooCommerce Migration</h1>
                <p className="text-gray-600">Import products from your WooCommerce store</p>
              </div>
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ Temporary Tool:</strong> This migration interface is temporary and will be removed after use. 
                Please complete your migration and then delete all migration files.
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <EnhancedCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">WooCommerce API Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteUrl">WooCommerce Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    placeholder="https://your-woocommerce-site.com"
                    value={config.siteUrl}
                    onChange={(e) => setConfig({...config, siteUrl: e.target.value})}
                  />
                  <p className="text-sm text-gray-500 mt-1">Your WooCommerce website URL</p>
                </div>

                <div>
                  <Label htmlFor="consumerKey">Consumer Key</Label>
                  <Input
                    id="consumerKey"
                    type="text"
                    placeholder="ck_..."
                    value={config.consumerKey}
                    onChange={(e) => setConfig({...config, consumerKey: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="consumerSecret">Consumer Secret</Label>
                  <Input
                    id="consumerSecret"
                    type="password"
                    placeholder="cs_..."
                    value={config.consumerSecret}
                    onChange={(e) => setConfig({...config, consumerSecret: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="categoryFilter">Migration Filter</Label>
                  <select
                    id="categoryFilter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="images-only">📸 Images Only - ALL Products for Image Extraction</option>
                    <option value="wicket keeping">Wicket Keeping Products Only (WK Gloves, WK Pads, Inner Gloves)</option>
                    <option value="exclude-wk-balls">🚫 All Products EXCEPT Wicket Keeping & Cricket Balls</option>
                    <option value="ball">Cricket Balls Only (Previous Test)</option>
                    <option value="cricket bat">Cricket Bats Only</option>
                    <option value="helmet">Helmets Only</option>
                    <option value="all">All Products (No Filter)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {categoryFilter === 'images-only' ? 
                      '📸 Get ALL products for image extraction only - includes WK & cricket balls for images, local database controls filtering' :
                      categoryFilter === 'exclude-wk-balls' ? 
                        'Import everything except wicket keeping items and cricket balls - perfect for full cricket catalog migration' :
                        'Select which products to import from your WooCommerce store'
                    }
                  </p>
                </div>

                <Button 
                  onClick={handleTestConnection}
                  disabled={istesting || !config.siteUrl || !config.consumerKey || !config.consumerSecret}
                  className="w-full"
                >
                  {istesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>

              {/* Test Results */}
              {testResult && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  {testResult.success ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Connection Successful!</span>
                      </div>
                      
                      {testResult.siteInfo && (
                        <div className="bg-green-50 p-4 rounded-lg space-y-2">
                          <h3 className="font-medium text-green-800">Site Information:</h3>
                          <div className="text-sm text-green-700 space-y-1">
                            <p><strong>Site:</strong> {testResult.siteInfo.siteName}</p>
                            <p><strong>WordPress:</strong> {testResult.siteInfo.version}</p>
                            <p><strong>WooCommerce:</strong> {testResult.siteInfo.wooVersion}</p>
                          </div>
                        </div>
                      )}

                      {testResult.stats && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-800 mb-2">Products to Import:</h3>
                          <div className="flex gap-4 text-sm text-blue-700">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>
                                {categoryFilter === 'images-only'
                                  ? `${testResult.stats.imagesOnlyProducts || testResult.stats.totalProducts} Products (ALL for Images)` 
                                  : categoryFilter === 'exclude-wk-balls' 
                                    ? `${testResult.stats.excludeWKBallsProducts || 'N/A'} Products (Excluding WK & Balls)` 
                                    : `${testResult.stats.totalProducts} Products`
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FolderOpen className="h-4 w-4" />
                              <span>{testResult.stats.totalCategories} Categories</span>
                            </div>
                          </div>
                          {categoryFilter === 'images-only' && (
                            <div className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded">
                              📸 Images Only: Gets ALL products for image extraction, local database handles filtering
                            </div>
                          )}
                          {categoryFilter === 'exclude-wk-balls' && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                              🚫 Excluding: Wicket keeping items, cricket balls, and related products
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={handleStartMigration}
                        disabled={isMigrating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isMigrating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Migration in Progress...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Start Migration
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Connection Failed</p>
                        <p className="text-sm">{testResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </EnhancedCard>

            {/* Progress Panel */}
            <EnhancedCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Database className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Migration Progress</h2>
              </div>

              {!progress && !migrationComplete && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ready to start migration</p>
                  <p className="text-sm">Test your connection first, then start the migration process</p>
                </div>
              )}

              {progress && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium capitalize">{progress.step.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-500">{progress.current}/{progress.total}</span>
                    </div>
                    <Progress 
                      value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} 
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">{progress.message}</p>
                  </div>

                  {/* Enhanced Image Download Progress */}
                  {progress.imageProgress && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <span className="animate-pulse">📸</span>
                        Image Download Progress
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-700">
                            {progress.imageProgress.currentProduct}
                          </span>
                          <span className="text-sm text-blue-600">
                            {progress.imageProgress.currentImage}/{progress.imageProgress.totalImages}
                          </span>
                        </div>
                        <Progress 
                          value={progress.imageProgress.totalImages > 0 ? 
                            (progress.imageProgress.currentImage / progress.imageProgress.totalImages) * 100 : 0
                          } 
                          className="h-2 bg-blue-100"
                        />
                        <div className="text-sm text-blue-600">
                          <div className="font-medium">{progress.imageProgress.downloadStatus}</div>
                          {progress.imageProgress.localPath && (
                            <div className="text-xs text-blue-500 mt-1 font-mono">
                              {progress.imageProgress.localPath}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {progress.errors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Errors ({progress.errors.length}):</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {progress.errors.slice(-5).map((error, index) => (
                          <p key={index} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {migrationComplete && (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Migration Complete!</h3>
                  <p className="text-green-600 mb-6">All products have been successfully imported</p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.open('/admin', '_blank')}
                      className="w-full"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      View Admin Dashboard
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => window.open('/products', '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Imported Products
                    </Button>

                    <Alert className="text-left">
                      <Trash2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Clean Up:</strong> Migration complete! You can now safely delete all migration files:
                        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                          <li>/lib/temp-migration/</li>
                          <li>/app/api/temp-migration/</li>
                          <li>/app/admin/migration/</li>
                          <li>/app/temp-migration/</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </EnhancedCard>
          </div>

          {/* Instructions */}
          <EnhancedCard className="mt-8 p-6">
            <h3 className="text-lg font-semibold mb-4">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <p>Go to your WooCommerce admin: <strong>WooCommerce → Settings → Advanced → REST API</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <p>Click <strong>"Add Key"</strong> and set Description: "Sports Devil Migration", Permissions: "Read"</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <p>Copy the <strong>Consumer Key</strong> and <strong>Consumer Secret</strong> into the form above</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <p>Test the connection, then start the migration process</p>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </main>
      <Footer />
    </>
  )
}