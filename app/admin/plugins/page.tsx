'use client'

import React, { useState } from 'react'
import {
  Puzzle,
  Plus,
  Download,
  Trash2,
  Settings,
  Enable,
  ExternalLink,
  Star,
  Users,
  Calendar,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PluginsPage() {
  const [installedPlugins, setInstalledPlugins] = useState([
    {
      id: 1,
      name: 'Advanced Quiz Analytics',
      version: '2.1.0',
      author: 'ProtexxaLearn Team',
      description: 'Detailed analytics and reporting for quiz performance',
      enabled: true,
      rating: 4.8,
      reviews: 234,
      downloads: 5200,
      updated: '2024-01-15',
    },
    {
      id: 2,
      name: 'Plagiarism Detector',
      version: '1.5.0',
      author: 'External Developer',
      description: 'Detect plagiarism in student submissions',
      enabled: true,
      rating: 4.5,
      reviews: 156,
      downloads: 3100,
      updated: '2024-01-10',
    },
    {
      id: 3,
      name: 'Video Conference Integration',
      version: '3.0.0',
      author: 'ProtexxaLearn Team',
      description: 'Integrate Zoom, Google Meet, and WebEx',
      enabled: false,
      rating: 4.7,
      reviews: 189,
      downloads: 4500,
      updated: '2024-01-08',
    },
  ])

  const availablePlugins = [
    {
      id: 101,
      name: 'Email Notifications Pro',
      version: '1.0.0',
      author: 'ProtexxaLearn Team',
      description: 'Advanced email notification system with templates',
      rating: 4.9,
      reviews: 312,
      downloads: 6800,
      price: 'Free',
    },
    {
      id: 102,
      name: 'Discussion Forum Plus',
      version: '2.2.0',
      author: 'Community Developer',
      description: 'Enhanced discussion forum with moderation tools',
      rating: 4.6,
      reviews: 145,
      downloads: 2900,
      price: '$29/year',
    },
    {
      id: 103,
      name: 'Certificate Generator',
      version: '1.8.0',
      author: 'ProtexxaLearn Team',
      description: 'Create and issue digital certificates',
      rating: 4.4,
      reviews: 98,
      downloads: 1800,
      price: 'Free',
    },
  ]

  const togglePlugin = (id) => {
    setInstalledPlugins(
      installedPlugins.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Puzzle className="w-8 h-8" />
            Plugins & Extensions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and install plugins to extend ProtexxaLearn functionality</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="installed" className="mb-6">
          <TabsList>
            <TabsTrigger value="installed">
              Installed ({installedPlugins.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availablePlugins.length})
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Plugin Settings</TabsTrigger>
          </TabsList>

          {/* Installed Plugins */}
          <TabsContent value="installed" className="space-y-4">
            {installedPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {plugin.name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                        v{plugin.version}
                      </span>
                      {plugin.enabled ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{plugin.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>By {plugin.author}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        {plugin.rating} ({plugin.reviews} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {plugin.downloads} downloads
                      </span>
                      <span>Updated {plugin.updated}</span>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => togglePlugin(plugin.id)}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {plugin.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Learn More
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 gap-2">
                    <Trash2 className="w-4 h-4" />
                    Uninstall
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Available Plugins */}
          <TabsContent value="available">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availablePlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {plugin.name}
                      </h3>
                      <span className="px-3 py-1 text-sm font-semibold bg-primary/10 text-primary rounded">
                        {plugin.price}
                      </span>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                      v{plugin.version}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-4">{plugin.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg text-center">
                    <div>
                      <Star className="w-5 h-5 text-amber-400 fill-current mx-auto mb-1" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{plugin.rating}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{plugin.reviews} reviews</p>
                    </div>
                    <div>
                      <Download className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{plugin.downloads}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">downloads</p>
                    </div>
                    <div>
                      <Users className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{plugin.author}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">by</p>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Install Plugin
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Assessment & Testing', count: 12 },
                { name: 'Communication', count: 8 },
                { name: 'Content Delivery', count: 15 },
                { name: 'Analytics & Reports', count: 9 },
                { name: 'Integration', count: 11 },
                { name: 'Accessibility', count: 6 },
              ].map((cat) => (
                <button
                  key={cat.name}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{cat.count} plugins</p>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Plugin Settings */}
          <TabsContent value="settings" className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Plugin Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Auto-update Plugins</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Automatically update plugins to the latest version</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Allow Beta Plugins</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Install beta and experimental plugins</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Anonymous Plugin Usage</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Share anonymous usage data with developers</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Developer Mode
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Enable developer mode to test and debug custom plugins locally.
                </p>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Custom Plugin
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
